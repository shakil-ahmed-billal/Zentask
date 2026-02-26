/*
  Warnings:

  - You are about to drop the column `amount` on the `project` table. All the data in the column will be lost.
  - You are about to drop the column `budget` on the `project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "project" DROP COLUMN "amount",
DROP COLUMN "budget";
