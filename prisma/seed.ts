import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const faculties = [
  "人文学部",
  "教育学部",
  "経済学部",
  "理学部",
  "工学部",
  "都市デザイン学部",
  "医学部",
  "薬学部",
  "共通教育",
];

const courseData = [
  // 人文学部
  { name: "哲学概論", instructor: "山田 太郎", faculty: "人文学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "日本文学史I", instructor: "佐藤 花子", faculty: "人文学部", year: 1, semester: "前期", credits: 2, courseType: "選択" },
  { name: "西洋文化史", instructor: "田中 一郎", faculty: "人文学部", year: 2, semester: "後期", credits: 2, courseType: "選択" },
  { name: "心理学入門", instructor: "鈴木 美咲", faculty: "人文学部", year: 1, semester: "前期", credits: 2, courseType: "選択" },
  { name: "言語学概論", instructor: "高橋 健二", faculty: "人文学部", year: 2, semester: "前期", credits: 2, courseType: "選択" },
  { name: "文化人類学", instructor: "伊藤 さくら", faculty: "人文学部", year: 2, semester: "後期", credits: 2, courseType: "選択" },
  { name: "社会学概論", instructor: "渡辺 誠", faculty: "人文学部", year: 1, semester: "後期", credits: 2, courseType: "選択" },
  { name: "東洋思想史", instructor: "中村 光", faculty: "人文学部", year: 3, semester: "前期", credits: 2, courseType: "選択" },

  // 教育学部
  { name: "教育学概論", instructor: "小林 明", faculty: "教育学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "教育心理学", instructor: "加藤 由美", faculty: "教育学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "算数・数学教育法", instructor: "吉田 博", faculty: "教育学部", year: 2, semester: "後期", credits: 2, courseType: "必修" },
  { name: "理科教育法", instructor: "山本 隆", faculty: "教育学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "体育学概論", instructor: "松本 健", faculty: "教育学部", year: 1, semester: "後期", credits: 2, courseType: "選択" },
  { name: "特別支援教育概論", instructor: "井上 幸子", faculty: "教育学部", year: 3, semester: "前期", credits: 2, courseType: "必修" },
  { name: "道徳教育の理論と実践", instructor: "木村 直樹", faculty: "教育学部", year: 3, semester: "後期", credits: 2, courseType: "必修" },

  // 経済学部
  { name: "ミクロ経済学I", instructor: "林 俊介", faculty: "経済学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "マクロ経済学I", instructor: "清水 啓介", faculty: "経済学部", year: 1, semester: "後期", credits: 2, courseType: "必修" },
  { name: "経営学概論", instructor: "森 洋子", faculty: "経済学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "会計学基礎", instructor: "池田 正治", faculty: "経済学部", year: 2, semester: "前期", credits: 2, courseType: "選択" },
  { name: "統計学I", instructor: "橋本 卓也", faculty: "経済学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "法学概論", instructor: "石川 健一", faculty: "経済学部", year: 1, semester: "後期", credits: 2, courseType: "選択" },
  { name: "マーケティング論", instructor: "宮本 靖", faculty: "経済学部", year: 3, semester: "前期", credits: 2, courseType: "選択" },
  { name: "経済史", instructor: "藤田 恵子", faculty: "経済学部", year: 2, semester: "後期", credits: 2, courseType: "選択" },

  // 理学部
  { name: "微積分学I", instructor: "岡田 浩二", faculty: "理学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "線形代数学I", instructor: "竹内 邦彦", faculty: "理学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "物理学基礎I", instructor: "村田 亮", faculty: "理学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "化学基礎", instructor: "斉藤 智子", faculty: "理学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "生物学入門", instructor: "野口 誠", faculty: "理学部", year: 1, semester: "後期", credits: 2, courseType: "選択" },
  { name: "情報科学基礎", instructor: "上田 剛史", faculty: "理学部", year: 1, semester: "後期", credits: 2, courseType: "必修" },
  { name: "解析学I", instructor: "西村 哲也", faculty: "理学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "量子力学I", instructor: "長谷川 真", faculty: "理学部", year: 3, semester: "前期", credits: 2, courseType: "選択" },

  // 工学部
  { name: "プログラミング基礎", instructor: "近藤 大輔", faculty: "工学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "電気回路論I", instructor: "原田 隆志", faculty: "工学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "材料力学I", instructor: "中島 哲郎", faculty: "工学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "熱力学I", instructor: "三浦 康夫", faculty: "工学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "流体力学I", instructor: "横山 裕二", faculty: "工学部", year: 2, semester: "後期", credits: 2, courseType: "必修" },
  { name: "アルゴリズムとデータ構造", instructor: "大野 義之", faculty: "工学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "電子回路I", instructor: "安田 真一", faculty: "工学部", year: 2, semester: "後期", credits: 2, courseType: "必修" },
  { name: "機械設計学", instructor: "菊地 淳一", faculty: "工学部", year: 3, semester: "前期", credits: 2, courseType: "選択" },

  // 都市デザイン学部
  { name: "都市計画概論", instructor: "福島 達也", faculty: "都市デザイン学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "建築設計I", instructor: "坂本 雄一", faculty: "都市デザイン学部", year: 1, semester: "後期", credits: 2, courseType: "必修" },
  { name: "環境工学概論", instructor: "川口 裕子", faculty: "都市デザイン学部", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "都市交通論", instructor: "浜田 誠司", faculty: "都市デザイン学部", year: 3, semester: "前期", credits: 2, courseType: "選択" },
  { name: "地域計画論", instructor: "藤原 明", faculty: "都市デザイン学部", year: 2, semester: "後期", credits: 2, courseType: "選択" },

  // 医学部
  { name: "解剖学I", instructor: "田村 正彦", faculty: "医学部", year: 1, semester: "前期", credits: 3, courseType: "必修" },
  { name: "生理学I", instructor: "中山 佳代", faculty: "医学部", year: 2, semester: "前期", credits: 3, courseType: "必修" },
  { name: "生化学I", instructor: "荒木 修司", faculty: "医学部", year: 2, semester: "後期", credits: 3, courseType: "必修" },
  { name: "薬理学基礎", instructor: "岩崎 健太", faculty: "医学部", year: 3, semester: "前期", credits: 2, courseType: "必修" },
  { name: "病理学I", instructor: "谷川 智志", faculty: "医学部", year: 3, semester: "後期", credits: 2, courseType: "必修" },
  { name: "内科学概論", instructor: "北村 義典", faculty: "医学部", year: 4, semester: "前期", credits: 3, courseType: "必修" },

  // 薬学部
  { name: "薬学概論", instructor: "星野 和彦", faculty: "薬学部", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "有機化学I", instructor: "久保田 洋", faculty: "薬学部", year: 1, semester: "後期", credits: 2, courseType: "必修" },
  { name: "薬理学I", instructor: "押野 吉晴", faculty: "薬学部", year: 3, semester: "前期", credits: 2, courseType: "必修" },
  { name: "調剤学", instructor: "金子 昌弘", faculty: "薬学部", year: 3, semester: "後期", credits: 2, courseType: "必修" },
  { name: "薬物動態学", instructor: "大塚 弘樹", faculty: "薬学部", year: 4, semester: "前期", credits: 2, courseType: "必修" },

  // 共通教育
  { name: "英語コミュニケーションI", instructor: "Smith, John", faculty: "共通教育", year: 1, semester: "前期", credits: 1, courseType: "必修" },
  { name: "英語コミュニケーションII", instructor: "Brown, Sarah", faculty: "共通教育", year: 1, semester: "後期", credits: 1, courseType: "必修" },
  { name: "日本語表現法", instructor: "山口 雅彦", faculty: "共通教育", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "スポーツ実習I", instructor: "後藤 正義", faculty: "共通教育", year: 1, semester: "前期", credits: 1, courseType: "必修" },
  { name: "キャリア教育", instructor: "杉山 貴子", faculty: "共通教育", year: 2, semester: "前期", credits: 2, courseType: "必修" },
  { name: "情報リテラシー", instructor: "沖田 浩介", faculty: "共通教育", year: 1, semester: "前期", credits: 2, courseType: "必修" },
  { name: "環境と社会", instructor: "松井 徳子", faculty: "共通教育", year: 2, semester: "後期", credits: 2, courseType: "選択" },
  { name: "数学基礎", instructor: "細川 弘道", faculty: "共通教育", year: 1, semester: "前期", credits: 2, courseType: "選択" },
];

async function main() {
  console.log("シードデータを投入中...");

  for (const facultyName of faculties) {
    await prisma.faculty.upsert({
      where: { name: facultyName },
      update: {},
      create: { name: facultyName },
    });
  }

  for (const course of courseData) {
    const faculty = await prisma.faculty.findUnique({ where: { name: course.faculty } });
    if (!faculty) continue;
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

  const hashedPassword = await bcrypt.hash("password123", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@u-toyama.ac.jp" },
    update: {},
    create: {
      email: "demo@u-toyama.ac.jp",
      name: "デモユーザー",
      password: hashedPassword,
    },
  });

  const courses = await prisma.course.findMany({ take: 5 });
  const sampleReviews = [
    { content: "出席重視の授業でした。テストはレポート提出のみで比較的楽です。先生の説明もわかりやすく、内容も興味深かったです。", easyScore: 4 },
    { content: "毎回小テストがあるので油断は禁物です。ただ、授業内容は面白く、ためになりました。テキスト代がかかるのが難点。", easyScore: 3 },
    { content: "出席さえすれば単位はもらえます。授業自体は眠くなりがちですが、試験は過去問を解けば大丈夫でした。", easyScore: 5 },
    { content: "難易度が高く、数式も多いので予習が必要です。でも先生が丁寧に教えてくれるので諦めずに頑張れます。", easyScore: 2 },
    { content: "グループワーク中心の授業です。コミュニケーション能力が磨かれます。評価はグループ発表とレポートです。", easyScore: 4 },
  ];

  for (let i = 0; i < courses.length; i++) {
    await prisma.review.create({
      data: {
        content: sampleReviews[i].content,
        easyScore: sampleReviews[i].easyScore,
        userId: demoUser.id,
        courseId: courses[i].id,
      },
    });
  }

  console.log("シード完了！");
  console.log(`学部: ${faculties.length}件`);
  console.log(`授業: ${courseData.length}件`);
  console.log(`サンプル口コミ: ${courses.length}件`);
  console.log("デモアカウント: demo@u-toyama.ac.jp / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
