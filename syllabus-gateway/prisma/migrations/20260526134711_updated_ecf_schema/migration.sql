/*
  Warnings:

  - A unique constraint covering the columns `[levelId]` on the table `CompetenceECF` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CompetenceECF_levelId_key" ON "CompetenceECF"("levelId");
