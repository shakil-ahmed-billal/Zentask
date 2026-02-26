/*
  Warnings:

  - You are about to drop the column `name` on the `project` table. All the data in the column will be lost.
  - Added the required column `title` to the `project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "name",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "projectPhotoURL" TEXT,
ADD COLUMN     "sheetURL" TEXT,
ADD COLUMN     "telegramURL" TEXT,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "websiteURL" TEXT;
