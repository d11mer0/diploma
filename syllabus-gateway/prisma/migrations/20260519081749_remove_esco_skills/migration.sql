/*
  Warnings:

  - You are about to drop the column `skillId` on the `mapping_results` table. All the data in the column will be lost.
  - You are about to drop the `esco_skills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "mapping_results" DROP CONSTRAINT "mapping_results_skillId_fkey";

-- AlterTable
ALTER TABLE "mapping_results" DROP COLUMN "skillId";

-- AlterTable
ALTER TABLE "syllabi" ADD COLUMN     "filePath" TEXT;

-- DropTable
DROP TABLE "esco_skills";
