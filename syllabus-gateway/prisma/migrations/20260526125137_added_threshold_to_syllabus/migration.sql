/*
  Warnings:

  - You are about to drop the `ecf_competences` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `mapping_results` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `outcomes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `syllabi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'EXPERT', 'ADMIN');

-- DropForeignKey
ALTER TABLE "mapping_results" DROP CONSTRAINT "mapping_results_competenceId_fkey";

-- DropForeignKey
ALTER TABLE "mapping_results" DROP CONSTRAINT "mapping_results_outcomeId_fkey";

-- DropForeignKey
ALTER TABLE "outcomes" DROP CONSTRAINT "outcomes_syllabusId_fkey";

-- DropForeignKey
ALTER TABLE "syllabi" DROP CONSTRAINT "syllabi_userId_fkey";

-- DropTable
DROP TABLE "ecf_competences";

-- DropTable
DROP TABLE "mapping_results";

-- DropTable
DROP TABLE "outcomes";

-- DropTable
DROP TABLE "syllabi";

-- DropTable
DROP TABLE "users";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Syllabus" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "educationLevel" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION,
    "filePath" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Syllabus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningOutcome" (
    "id" TEXT NOT NULL,
    "originalText" TEXT NOT NULL,
    "syllabusId" TEXT NOT NULL,

    CONSTRAINT "LearningOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetenceECF" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "levelId" INTEGER NOT NULL,

    CONSTRAINT "CompetenceECF_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MappingResult" (
    "id" TEXT NOT NULL,
    "outcomeId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "semanticSimilarity" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "expertValidated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MappingResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Syllabus" ADD CONSTRAINT "Syllabus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningOutcome" ADD CONSTRAINT "LearningOutcome_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "Syllabus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MappingResult" ADD CONSTRAINT "MappingResult_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "LearningOutcome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MappingResult" ADD CONSTRAINT "MappingResult_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "CompetenceECF"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
