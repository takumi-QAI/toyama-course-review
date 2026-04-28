import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string) {
  return email === process.env.ADMIN_EMAIL;
}

const NUMERIC_FIELDS = ["year", "credits"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action } = await req.json();

  if (action === "approve") {
    const contribution = await prisma.courseContribution.findUnique({
      where: { id: params.id },
    });
    if (!contribution) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const value = (NUMERIC_FIELDS as readonly string[]).includes(contribution.field)
      ? parseInt(contribution.value)
      : contribution.value;

    await prisma.$transaction([
      prisma.course.update({
        where: { id: contribution.courseId },
        data: { [contribution.field]: value },
      }),
      prisma.courseContribution.update({
        where: { id: params.id },
        data: { approved: true },
      }),
    ]);
  } else if (action === "reject") {
    await prisma.courseContribution.delete({ where: { id: params.id } });
  }

  return NextResponse.json({ success: true });
}
