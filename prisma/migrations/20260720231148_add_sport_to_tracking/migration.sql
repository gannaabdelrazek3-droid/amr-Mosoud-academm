/*
  Warnings:

  - Added the required column `sportId` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportId` to the `PlayerProgress` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sportId` to the `WeightLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "sportId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PlayerProgress" ADD COLUMN     "sportId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WeightLog" ADD COLUMN     "sportId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightLog" ADD CONSTRAINT "WeightLog_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProgress" ADD CONSTRAINT "PlayerProgress_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
