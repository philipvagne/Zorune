-- CreateEnum
CREATE TYPE "NoteKind" AS ENUM ('NOTE', 'REFERENCE');

-- AlterTable
ALTER TABLE "Note"
ADD COLUMN "kind" "NoteKind" NOT NULL DEFAULT 'NOTE';
