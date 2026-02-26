-- AlterTable
ALTER TABLE "user" ADD COLUMN     "leaderId" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
