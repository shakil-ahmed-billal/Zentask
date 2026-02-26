/*
  Warnings:

  - The values [COMPLETED] on the enum `ProjectStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProjectStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED');
ALTER TABLE "public"."project" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "project" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING ("status"::text::"ProjectStatus_new");
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "public"."ProjectStatus_old";
ALTER TABLE "project" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
