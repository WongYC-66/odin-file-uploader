/*
  Warnings:

  - You are about to drop the column `userId` on the `Folder` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mainFolderId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Made the column `parentId` on table `Folder` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `mainFolderId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_parentId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_userId_fkey";

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "mainFolderId" INTEGER;

-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "userId",
ADD COLUMN     "mainFolderId" INTEGER,
ALTER COLUMN "parentId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mainFolderId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "MainFolder" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "MainFolder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mainFolderId_key" ON "User"("mainFolderId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_mainFolderId_fkey" FOREIGN KEY ("mainFolderId") REFERENCES "MainFolder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_mainFolderId_fkey" FOREIGN KEY ("mainFolderId") REFERENCES "MainFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_mainFolderId_fkey" FOREIGN KEY ("mainFolderId") REFERENCES "MainFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
