/**
 * 富山大学シラバスクローラー
 *
 * 使い方:
 *   npx ts-node --project tsconfig.seed.json scripts/crawl-syllabus.ts
 *
 * 注意:
 *   - .env の DATABASE_URL が Neon (本番DB) を指している状態で実行します
 *   - シラバスシステム (CampusSquare) は学内外から閲覧可能ですが、
 *     アクセス制限がある場合は SYLLABUS_SESSION_COOKIE に
 *     ブラウザのセッションCookieを設定してください
 */

import { PrismaClient } from "@prisma/client";
import * as https from "https";
import * as http from "http";

const prisma = new PrismaClient();

const BASE_URL = "https://www.new-syllabus.adm.u-toyama.ac.jp";
const YEAR = "2026";

// 学部コードマッピング（CampusSquare の bunyaCode に対応）
const FACULTY_MAP: Record<string, string> = {
  "11": "人文学部",
  "12": "教育学部",
  "13": "経済学部",
  "14": "理学部",
  "15": "工学部",
  "16": "都市デザイン学部",
  "21": "医学部",
  "22": "薬学部",
  "31": "共通教育",
};

// Cookieが必要な場合はここに貼り付ける（ブラウザのdev toolsから取得）
const SESSION_COOKIE = process.env.SYLLABUS_SESSION_COOKIE ?? "";

function fetchUrl(url: string, postData?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options: https.RequestOptions = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: postData ? "POST" : "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ToyamaCourseCrawler/1.0)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9",
        ...(SESSION_COOKIE ? { Cookie: SESSION_COOKIE } : {}),
        ...(postData ? {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData).toString(),
        } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => resolve(data));
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

function extractText(html: string, tag: string, className?: string): string {
  const pattern = className
    ? new RegExp(`<${tag}[^>]*class="[^"]*${className}[^"]*"[^>]*>(.*?)<\/${tag}>`, "si")
    : new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, "si");
  const match = html.match(pattern);
  return match ? match[1].replace(/<[^>]+>/g, "").trim() : "";
}

function extractAllMatches(html: string, pattern: RegExp): string[][] {
  const results: string[][] = [];
  let match;
  const re = new RegExp(pattern.source, "gi");
  while ((match = re.exec(html)) !== null) {
    results.push(match.slice(1));
  }
  return results;
}

// CampusSquare の授業一覧ページを解析
function parseCourseList(html: string): {
  name: string;
  instructor: string;
  year: number;
  semester: string;
  credits: number;
  courseType: string;
  syllabusCode: string;
}[] {
  const courses: {
    name: string;
    instructor: string;
    year: number;
    semester: string;
    credits: number;
    courseType: string;
    syllabusCode: string;
  }[] = [];

  // CampusSquare の授業行パターン（実際のHTMLに合わせて調整が必要）
  const rowPattern = /<tr[^>]*class="[^"]*slbs[^"]*"[^>]*>(.*?)<\/tr>/gis;
  const rows = extractAllMatches(html, rowPattern);

  for (const [rowHtml] of rows) {
    const cells = rowHtml.match(/<td[^>]*>(.*?)<\/td>/gis) ?? [];
    if (cells.length < 5) continue;

    const getText = (cell: string) => cell.replace(/<[^>]+>/g, "").trim();

    // セルの順番はシラバスシステムの実際の列順に合わせてください
    const syllabusCode = getText(cells[0] ?? "");
    const name = getText(cells[1] ?? "");
    const instructor = getText(cells[2] ?? "");
    const credits = parseInt(getText(cells[3] ?? "0")) || 2;
    const semester = getText(cells[4] ?? "前期");
    const yearStr = getText(cells[5] ?? "1");
    const courseType = getText(cells[6] ?? "選択");

    if (!name || !instructor) continue;

    courses.push({
      name,
      instructor,
      year: parseInt(yearStr) || 1,
      semester: semester || "前期",
      credits,
      courseType: courseType || "選択",
      syllabusCode,
    });
  }

  return courses;
}

async function crawlFaculty(facultyCode: string, facultyName: string) {
  console.log(`  クロール中: ${facultyName}`);

  const postData = new URLSearchParams({
    nenki: YEAR,
    bunyaCode: facultyCode,
    jikanwariCode: "",
    kamokuMei: "",
    tantosha: "",
    btnSearch: "検索",
  }).toString();

  let html: string;
  try {
    html = await fetchUrl(
      `${BASE_URL}/campusref/slbssbjtsl_pc.do`,
      postData
    );
  } catch (err) {
    console.warn(`  ⚠ ${facultyName}: 取得失敗 (${(err as Error).message})`);
    return 0;
  }

  if (html.includes("認証エラー") || html.includes("ログイン")) {
    console.warn(`  ⚠ ${facultyName}: 認証が必要です。SYLLABUS_SESSION_COOKIE を設定してください`);
    return 0;
  }

  const courses = parseCourseList(html);
  if (courses.length === 0) {
    console.warn(`  ⚠ ${facultyName}: 授業が見つかりませんでした（HTML構造を確認してください）`);
    return 0;
  }

  const faculty = await prisma.faculty.upsert({
    where: { name: facultyName },
    update: {},
    create: { name: facultyName },
  });

  let upserted = 0;
  for (const course of courses) {
    if (course.syllabusCode) {
      await prisma.course.upsert({
        where: { syllabusCode: course.syllabusCode } as any,
        update: {
          name: course.name,
          instructor: course.instructor,
          year: course.year,
          semester: course.semester,
          credits: course.credits,
        },
        create: {
          name: course.name,
          instructor: course.instructor,
          facultyId: faculty.id,
          year: course.year,
          semester: course.semester,
          credits: course.credits,
          courseType: course.courseType,
          syllabusCode: course.syllabusCode,
        },
      });
    } else {
      const existing = await prisma.course.findFirst({
        where: { name: course.name, facultyId: faculty.id },
      });
      if (!existing) {
        await prisma.course.create({
          data: {
            name: course.name,
            instructor: course.instructor,
            facultyId: faculty.id,
            year: course.year,
            semester: course.semester,
            credits: course.credits,
            courseType: course.courseType,
          },
        });
      }
    }
    upserted++;
  }

  console.log(`  ✓ ${facultyName}: ${upserted}件`);
  return upserted;
}

async function main() {
  console.log("======================================");
  console.log("富山大学シラバスクローラー");
  console.log(`対象年度: ${YEAR}`);
  console.log("======================================\n");

  // 接続テスト
  try {
    await fetchUrl(`${BASE_URL}/`);
  } catch {
    console.error("エラー: シラバスサーバーに接続できません");
    console.error("学内ネットワーク (VPN) に接続しているか確認してください");
    process.exit(1);
  }

  let total = 0;
  for (const [code, name] of Object.entries(FACULTY_MAP)) {
    total += await crawlFaculty(code, name);
    await new Promise((r) => setTimeout(r, 1000)); // サーバー負荷軽減
  }

  console.log(`\n完了: ${total}件の授業を取り込みました`);

  if (total === 0) {
    console.log("\n📌 授業が取得できなかった場合の対処法:");
    console.log("1. ブラウザで https://www.new-syllabus.adm.u-toyama.ac.jp/ を開く");
    console.log("2. 開発者ツール → Network タブ → 検索リクエストを確認");
    console.log("3. Cookie をコピーして SYLLABUS_SESSION_COOKIE 環境変数に設定");
    console.log("4. HTMLの授業一覧の構造を確認し、parseCourseList() を調整");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
