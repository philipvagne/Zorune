-- CreateTable
CREATE TABLE "TaskNoteReadState" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskNoteReadState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TaskNoteReadState_taskId_lastSeenAt_idx" ON "TaskNoteReadState"("taskId", "lastSeenAt");

-- CreateIndex
CREATE INDEX "TaskNoteReadState_userId_lastSeenAt_idx" ON "TaskNoteReadState"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "TaskNoteReadState_taskId_userId_key" ON "TaskNoteReadState"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "TaskNoteReadState" ADD CONSTRAINT "TaskNoteReadState_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskNoteReadState" ADD CONSTRAINT "TaskNoteReadState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
