/*
  Warnings:

  - A unique constraint covering the columns `[secretToken]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - The required column `secretToken` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "secretToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_secretToken_key" ON "public"."User"("secretToken");
