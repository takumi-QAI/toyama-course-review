import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string) {
  return email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [userCount, reviewCount, courseCount, todayViews, unreadMessages, pendingContributions] =
    await Promise.all([
      prisma.user.count(),
      prisma.review.count(),
      prisma.course.count(),
      prisma.pageView.count({ where: { createdAt: { gte: today } } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.courseContribution.count({ where: { approved: false } }),
    ]);

  // 過去7日間の日別訪問者数
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dailyViews = await Promise.all(
    days.map(async (day) => {
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = await prisma.pageView.count({
        where: { createdAt: { gte: day, lt: nextDay } },
      });
      return {
        date: `${day.getMonth() + 1}/${day.getDate()}`,
        count,
      };
    })
  );

  return NextResponse.json({
    userCount,
    reviewCount,
    courseCount,
    todayViews,
    unreadMessages,
    pendingContributions,
    dailyViews,
  });
}
