/*
  Warnings:

  - You are about to drop the `overall_mapping_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "overall_mapping_results" DROP CONSTRAINT "overall_mapping_results_competenceId_fkey";

-- DropForeignKey
ALTER TABLE "overall_mapping_results" DROP CONSTRAINT "overall_mapping_results_syllabusId_fkey";

-- DropTable
DROP TABLE "overall_mapping_results";
