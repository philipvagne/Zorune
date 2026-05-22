-- AlterTable
ALTER TABLE "Note" ADD COLUMN "taskId" TEXT;

-- CreateIndex
CREATE INDEX "Note_taskId_updatedAt_idx" ON "Note"("taskId", "updatedAt");

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
