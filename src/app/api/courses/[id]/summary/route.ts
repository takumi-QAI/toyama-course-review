import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({
    where: { id: params.id },
    include: { _count: { select: { reviews: true } } },
  });

  if (!course) {
    return NextResponse.json({ error: "授業が見つかりません" }, { status: 404 });
  }

  if (course._count.reviews < 3) {
    return NextResponse.json({ error: "口コミが3件以上になるとAI要約が生成されます" }, { status: 400 });
  }

  // キャッシュされたサマリーがあれば返す（24時間有効）
  if (course.summary && course.summaryAt) {
    const hoursSince = (Date.now() - course.summaryAt.getTime()) / 1000 / 3600;
    if (hoursSince < 24) {
      return NextResponse.json({ summary: course.summary, cached: true });
    }
  }

  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === "your-groq-api-key-here") {
    return NextResponse.json({ error: "GROQ_API_KEYが設定されていません" }, { status: 503 });
  }

  const reviews = await prisma.review.findMany({
    where: { courseId: params.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const agg = await prisma.review.aggregate({
    where: { courseId: params.id },
    _avg: { easyScore: true },
  });

  const reviewText = reviews
    .map((r, i) => `【口コミ${i + 1}】楽単度: ${r.easyScore}/5\n${r.content}`)
    .join("\n\n");

  const avgScore = agg._avg.easyScore?.toFixed(1) ?? "不明";

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "あなたは大学授業口コミの要約アシスタントです。与えられた口コミを分析し、受講を検討している学生に役立つ情報を300字程度の日本語で要約してください。授業の難易度、評価方法、授業の雰囲気、受講のコツを含めてください。",
        },
        {
          role: "user",
          content: `授業名: ${course.name}\n楽単度平均: ${avgScore}/5（${reviews.length}件の口コミ）\n\n${reviewText}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const summary = completion.choices[0]?.message?.content ?? "要約を生成できませんでした";

    await prisma.course.update({
      where: { id: params.id },
      data: { summary, summaryAt: new Date() },
    });

    return NextResponse.json({ summary, cached: false });
  } catch (err) {
    console.error("Groq API error:", err);
    return NextResponse.json({ error: "AI要約の生成に失敗しました" }, { status: 500 });
  }
}
