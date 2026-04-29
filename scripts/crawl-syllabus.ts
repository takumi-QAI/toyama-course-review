/**
 * 富山大学シラバスクローラー
 * 使い方: npm run crawl
 *
 * 仕組み:
 *   1. シラバスシステム (CampusSquare) でセッションを確立
 *   2. 学部ごとに授業一覧を取得（時間割コードを収集）
 *   3. 各授業の詳細ページ（/syllabus/2026/XX/XX_XXXXXX.html）を直接フェッチ
 *   4. 授業名・担当教員・単位数・学年・授業区分等をパース
 *   5. DBにupsert
 */

import { PrismaClient } from "@prisma/client";
import * as https from "https";
import * as http from "http";

const prisma = new PrismaClient();
const BASE = "https://www.new-syllabus.adm.u-toyama.ac.jp";
const YEAR = "2026";
const DELAY_MS = 150; // リクエスト間の遅延

// 学部コード → DB上の学部名マッピング
const FACULTY_MAP: Record<string, string> = {
  "91": "共通教育",
  "10": "人文学部",
  "20": "人間発達科学部",
  "25": "教育学部",
  "30": "経済学部",
  "40": "理学部",
  "50": "医学部",
  "60": "薬学部",
  "70": "工学部",
  "80": "芸術文化学部",
  "90": "都市デザイン学部",
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGet(url: string, cookies: string): Promise<{ html: string; status: number; setCookies: string[] }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const isHttps = u.protocol === "https:";
    const lib = isHttps ? https : http;
    const options = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9",
        ...(cookies ? { Cookie: cookies } : {}),
      },
    };
    const req = lib.request(options as any, (res: any) => {
      let data = "";
      const setCookies = (res.headers["set-cookie"] || []).map((c: string) => c.split(";")[0]);
      res.setEncoding("utf8");
      res.on("data", (c: string) => { data += c; });
      res.on("end", () => resolve({ html: data, status: res.statusCode ?? 0, setCookies }));
    });
    req.on("error", reject);
    req.end();
  });
}

function httpPost(url: string, cookies: string, body: string): Promise<{ html: string; status: number; setCookies: string[]; location?: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "POST",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9",
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(body).toString(),
        "Referer": url,
        ...(cookies ? { Cookie: cookies } : {}),
      },
    }, (res) => {
      let data = "";
      const setCookies = (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]);
      const location = res.headers["location"] as string | undefined;
      res.setEncoding("utf8");
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve({ html: data, status: res.statusCode ?? 0, setCookies, location }));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function mergeCookies(old: string, newCookies: string[]): string {
  const map: Record<string, string> = {};
  (old || "").split(";").forEach((c) => {
    c = c.trim();
    if (!c) return;
    const i = c.indexOf("=");
    map[c.slice(0, i)] = c.slice(i + 1);
  });
  newCookies.forEach((c) => {
    const i = c.indexOf("=");
    map[c.slice(0, i)] = c.slice(i + 1);
  });
  return Object.entries(map).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function followRedirects(url: string, cookies: string): Promise<{ html: string; cookies: string; finalUrl: string }> {
  let currentUrl = url;
  let currentCookies = cookies;

  for (let i = 0; i < 8; i++) {
    const r = await httpGet(currentUrl, currentCookies);
    currentCookies = mergeCookies(currentCookies, r.setCookies);

    if (r.status >= 300 && r.status < 400) {
      break;
    }

    // メタリフレッシュを確認
    const metaRefresh = r.html.match(/content="\d+;\s*URL=([^"]+)"/i);
    if (metaRefresh && i === 0) {
      const loc = metaRefresh[1].startsWith("http")
        ? metaRefresh[1]
        : BASE + metaRefresh[1];
      currentUrl = loc;
      continue;
    }

    return { html: r.html, cookies: currentCookies, finalUrl: currentUrl };
  }

  return { html: "", cookies: currentCookies, finalUrl: currentUrl };
}

// リダイレクトを含むGET
async function getWithRedirects(url: string, cookies: string): Promise<{ html: string; cookies: string; finalUrl: string }> {
  let currentUrl = url;
  let currentCookies = cookies;

  for (let i = 0; i < 8; i++) {
    const r = await httpGet(currentUrl, currentCookies);
    currentCookies = mergeCookies(currentCookies, r.setCookies);

    if (r.status >= 300 && r.status < 400) {
      // location ヘッダーが必要 - httpGetを修正して取得
      break;
    }
    return { html: r.html, cookies: currentCookies, finalUrl: currentUrl };
  }
  return { html: "", cookies: currentCookies, finalUrl: currentUrl };
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#[0-9]+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// セッション初期化
async function initSession(): Promise<{ cookies: string; fek: string }> {
  let cookies = "";

  // Step1: root
  const r1 = await httpGet(BASE + "/", cookies);
  cookies = mergeCookies(cookies, r1.setCookies);

  // Step2: /campusref/ (302 → /campusref/campussquare.do?_flowId=SYW5701100-flow)
  const r2 = await httpGet(BASE + "/campusref/", cookies);
  cookies = mergeCookies(cookies, r2.setCookies);
  const loc2 = (r2 as any).location ?? "/campusref/campussquare.do?_flowId=SYW5701100-flow";

  // /campusref/ returns 302 so we need location
  // Re-fetch with proper redirect handling
  let currentUrl = BASE + "/campusref/";
  let html = "";

  for (let i = 0; i < 6; i++) {
    const r = await httpGetWithLocation(currentUrl, cookies);
    cookies = mergeCookies(cookies, r.setCookies);
    if (r.status >= 300 && r.status < 400 && r.location) {
      currentUrl = r.location.startsWith("http") ? r.location : BASE + r.location;
    } else {
      html = r.html;
      break;
    }
  }

  const fekMatch = html.match(/name="_flowExecutionKey"\s+value="([^"]+)"/);
  if (!fekMatch) throw new Error("_flowExecutionKey が見つかりません。セッション初期化失敗");

  return { cookies, fek: fekMatch[1] };
}

function httpGetWithLocation(url: string, cookies: string): Promise<{ html: string; status: number; setCookies: string[]; location?: string }> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en-US;q=0.9",
        ...(cookies ? { Cookie: cookies } : {}),
      },
    }, (res) => {
      let data = "";
      const setCookies = (res.headers["set-cookie"] || []).map((c) => c.split(";")[0]);
      const location = res.headers["location"] as string | undefined;
      res.setEncoding("utf8");
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve({ html: data, status: res.statusCode ?? 0, setCookies, location }));
    });
    req.on("error", reject);
    req.end();
  });
}

// 学部コードで授業の時間割コード一覧を取得
// 返り値: { jscd: 実際の学部コード, codes: コード一覧 }[]
async function getCourseCodesForFaculty(
  facultyCode: string,
  cookies: string,
  fek: string
): Promise<{ jscd: string; code: string }[]> {
  const postBody = new URLSearchParams({
    status: "1",
    _flowExecutionKey: fek,
    _eventId: "searchShozoku",
    jikanwariShozokuCode: facultyCode,
  }).toString();

  // POSTしてからリダイレクトを追跡
  const r1 = await httpPost(`${BASE}/campusref/campussquare.do`, cookies, postBody);
  let currentCookies = mergeCookies(cookies, r1.setCookies);
  let html = r1.html;

  if (r1.status >= 300 && r1.status < 400 && r1.location) {
    const loc = r1.location.startsWith("http") ? r1.location : BASE + r1.location;
    const r2 = await httpGetWithLocation(loc, currentCookies);
    currentCookies = mergeCookies(currentCookies, r2.setCookies);
    html = r2.html;
  }

  // refer('2026','5015','154090','') - jscd と course code を両方抽出
  const courses: { jscd: string; code: string }[] = [];
  const seen = new Set<string>();
  const pattern = /refer\('\d+','(\w+)','(\d+)',''\)/g;
  let m;
  while ((m = pattern.exec(html)) !== null) {
    const key = `${m[1]}_${m[2]}`;
    if (!seen.has(key)) {
      seen.add(key);
      courses.push({ jscd: m[1], code: m[2] });
    }
  }

  return courses;
}

// 授業詳細ページをパース
interface CourseDetail {
  name: string;
  instructor: string;
  semester: string;
  year: number;
  credits: number;
  courseType: string;
  facultyName: string;
  department: string;
}

function parseCourseDetail(html: string): CourseDetail | null {
  const getValue = (key: string): string => {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = html.match(
      new RegExp(`<th[^>]*>[^<]*${escaped}[^<]*<\/th>\\s*<td[^>]*>([\\s\\S]*?)<\/td>`, "i")
    );
    return m ? stripHtml(m[1]) : "";
  };

  // 科目名 (日本語部分 "名前／English" → "名前")
  const rawName = getValue("科目名");
  const name = rawName.split("／")[0].trim();
  if (!name) return null;

  // 担当教員 (所属を除く)
  const rawInstructor = getValue("担当教員");
  const instructor = rawInstructor.split(/[（(]/)[0].trim();
  if (!instructor) return null;

  // 学期: "2026年度／Academic Year 前期／Spring" → "前期"
  //       "2026年度 第1ターム／1st Term"        → "第1ターム"
  const rawSemester = getValue("開講学期");
  const semesterMatch = rawSemester.match(
    /(前期集中|後期集中|前期・後期|第\d+ターム|前期|後期|通年|集中)/
  );
  const semester = semesterMatch
    ? semesterMatch[1]
    : rawSemester
        .replace(/Academic Year\s*/g, "")
        .replace(/\d{4}年度[\/／\s]*/g, "")
        .split(/[\/／]/)[0]
        .trim() || "前期";

  // 対象学年 (最小値)
  const rawYear = getValue("対象学年");
  const yearMatches = rawYear.match(/(\d+)年/g) || [];
  const year = yearMatches.length > 0
    ? Math.min(...yearMatches.map((y) => parseInt(y)))
    : 1;

  // 単位数
  const rawCredits = getValue("単位数");
  const credits = parseInt(rawCredits) || 2;

  // 授業科目区分 → courseType
  const rawCategory = getValue("授業科目区分");
  const courseType = rawCategory.includes("選択必修") ? "選択必修"
    : rawCategory.includes("必修") ? "必修"
    : rawCategory.includes("選択") ? "選択"
    : "選択";

  // 対象所属 (学部 + 学科)
  // "人文学部／School of Humanities" → facultyName="人文学部", department=""
  // "工学部　電気電子工学科" → facultyName="工学部", department="電気電子工学科"
  const rawAffil = getValue("対象所属");
  const affilJa = rawAffil.split("／")[0].trim();
  // 学科パターン: "〇〇部　〇〇科" or "〇〇部 〇〇科"
  const deptMatch = affilJa.match(/^(.+[部院])[　\s]+(.+[科系類])$/);
  const facultyName = deptMatch ? deptMatch[1].trim() : affilJa;
  const department = deptMatch ? deptMatch[2].trim() : "";

  return { name, instructor, semester, year, credits, courseType, facultyName, department };
}

// 学部名を DB の名前に正規化
function normalizeFacultyName(name: string): string {
  const map: Record<string, string> = {
    "教養教育部": "共通教育",
    "教養教育": "共通教育",
    "人間発達科学部": "人間発達科学部",
  };
  return map[name] || name;
}

async function main() {
  console.log("=======================================");
  console.log("富山大学シラバスクローラー");
  console.log(`対象年度: ${YEAR}`);
  console.log("=======================================\n");

  // 接続テスト
  try {
    const test = await httpGetWithLocation(BASE + "/", "");
    console.log(`✓ サーバー接続OK (${test.status})\n`);
  } catch (e) {
    console.error("✗ サーバーに接続できません:", (e as Error).message);
    process.exit(1);
  }

  // セッション初期化
  process.stdout.write("セッション初期化中... ");
  const { cookies, fek } = await initSession();
  console.log("✓\n");

  let totalUpserted = 0;
  let totalSkipped = 0;

  for (const [facultyCode, facultyName] of Object.entries(FACULTY_MAP)) {
    process.stdout.write(`[${facultyName}] コード取得中... `);

    let courseEntries: { jscd: string; code: string }[] = [];
    try {
      courseEntries = await getCourseCodesForFaculty(facultyCode, cookies, fek);
    } catch (e) {
      console.log(`✗ 失敗 (${(e as Error).message})`);
      continue;
    }
    console.log(`${courseEntries.length}件`);

    if (courseEntries.length === 0) continue;

    // DB の Faculty を取得/作成
    const normalizedFacultyName = normalizeFacultyName(facultyName);
    const faculty = await prisma.faculty.upsert({
      where: { name: normalizedFacultyName },
      update: {},
      create: { name: normalizedFacultyName },
    });

    let done = 0;
    for (const { jscd, code: courseCode } of courseEntries) {
      const detailUrl = `${BASE}/syllabus/${YEAR}/${jscd}/${jscd}_${courseCode}.html`;
      try {
        const r = await httpGetWithLocation(detailUrl, "");
        if (r.status !== 200) {
          totalSkipped++;
          done++;
          continue;
        }

        const detail = parseCourseDetail(r.html);
        if (!detail) {
          totalSkipped++;
          done++;
          continue;
        }

        // syllabusCode → 名前+学部 の順でマッチ (口コミを引き継ぐ)
        const existing =
          await prisma.course.findFirst({ where: { syllabusCode: courseCode } }) ??
          await prisma.course.findFirst({ where: { name: detail.name, facultyId: faculty.id, syllabusCode: null } });

        if (existing) {
          await prisma.course.update({
            where: { id: existing.id },
            data: {
              name: detail.name,
              instructor: detail.instructor,
              year: detail.year,
              semester: detail.semester,
              credits: detail.credits,
              courseType: detail.courseType,
              syllabusCode: courseCode,
              syllabusJscd: jscd,
              syllabusYear: parseInt(YEAR),
              department: detail.department || null,
            },
          });
        } else {
          await prisma.course.create({
            data: {
              name: detail.name,
              instructor: detail.instructor,
              facultyId: faculty.id,
              year: detail.year,
              semester: detail.semester,
              credits: detail.credits,
              courseType: detail.courseType,
              syllabusCode: courseCode,
              syllabusJscd: jscd,
              syllabusYear: parseInt(YEAR),
              department: detail.department || null,
            },
          });
        }

        totalUpserted++;
        done++;

        if (done % 20 === 0) {
          process.stdout.write(`  → ${done}/${courseEntries.length}件完了\n`);
        }
      } catch (e) {
        totalSkipped++;
        done++;
        if (totalSkipped <= 3) {
          process.stderr.write(`  [SKIP] ${courseCode}: ${(e as Error).message}\n`);
        }
      }

      await sleep(DELAY_MS);
    }

    console.log(`  ✓ ${facultyName}: ${done}件処理 (累計スキップ ${totalSkipped}件)\n`);
    await sleep(500);
  }

  console.log("=======================================");
  console.log(`完了: ${totalUpserted}件取り込み、${totalSkipped}件スキップ`);
  console.log("=======================================");
}

main()
  .catch((e) => {
    console.error("エラー:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
