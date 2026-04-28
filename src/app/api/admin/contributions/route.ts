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

  const contributions = await prisma.courseContribution.findMany({
    where: { approved: false },
    include: {
      course: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contributions);
}
