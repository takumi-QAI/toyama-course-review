-- AlterTable: Add syllabusCode to Course
ALTER TABLE "Course" ADD COLUMN "syllabusCode" TEXT;

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseContribution" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseContribution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "CourseContribution_courseId_idx" ON "CourseContribution"("courseId");

-- CreateIndex
CREATE INDEX "CourseContribution_approved_idx" ON "CourseContribution"("approved");

-- AddForeignKey
ALTER TABLE "CourseContribution" ADD CONSTRAINT "CourseContribution_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseContribution" ADD CONSTRAINT "CourseContribution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
