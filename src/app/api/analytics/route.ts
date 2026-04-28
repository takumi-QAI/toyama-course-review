import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { path } = await req.json();
    if (!path || typeof path !== "string") return NextResponse.json({ ok: true });
    await prisma.pageView.create({ data: { path } });
  } catch {
    // silently ignore analytics errors
  }
  return NextResponse.json({ ok: true });
}
