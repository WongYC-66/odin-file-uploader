/*
  Warnings:

  - Changed the type of `folderId` on the `ShareLink` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ShareLink" DROP COLUMN "folderId",
ADD COLUMN     "folderId" INTEGER NOT NULL;
