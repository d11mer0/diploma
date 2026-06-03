-- DropForeignKey
ALTER TABLE "mapping_results" DROP CONSTRAINT "mapping_results_outcomeId_fkey";

-- DropForeignKey
ALTER TABLE "outcomes" DROP CONSTRAINT "outcomes_syllabusId_fkey";

-- CreateTable
CREATE TABLE "overall_mapping_results" (
    "id" TEXT NOT NULL,
    "semanticSimilarity" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "expertValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syllabusId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,

    CONSTRAINT "overall_mapping_results_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "outcomes" ADD CONSTRAINT "outcomes_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "syllabi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mapping_results" ADD CONSTRAINT "mapping_results_outcomeId_fkey" FOREIGN KEY ("outcomeId") REFERENCES "outcomes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overall_mapping_results" ADD CONSTRAINT "overall_mapping_results_syllabusId_fkey" FOREIGN KEY ("syllabusId") REFERENCES "syllabi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "overall_mapping_results" ADD CONSTRAINT "overall_mapping_results_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "ecf_competences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
