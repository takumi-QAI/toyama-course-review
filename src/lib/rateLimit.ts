import { headers } from "next/headers";
import { prisma } from "./prisma";

export function getClientIp(): string {
  const h = headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean }> {
  const now = new Date();

  // 期限切れエントリを確率的にクリーンアップ
  if (Math.random() < 0.05) {
    await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: now } } }).catch(() => {});
  }

  const entry = await prisma.rateLimit.findFirst({
    where: { key, resetAt: { gt: now } },
  });

  if (!entry) {
    await prisma.rateLimit.create({
      data: { key, count: 1, resetAt: new Date(now.getTime() + windowMs) },
    });
    return { allowed: true };
  }

  if (entry.count >= limit) return { allowed: false };

  await prisma.rateLimit.update({
    where: { id: entry.id },
    data: { count: { increment: 1 } },
  });

  return { allowed: true };
}
