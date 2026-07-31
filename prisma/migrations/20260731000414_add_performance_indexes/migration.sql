/*
  Warnings:

  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `defaultPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `pricePerUnit` on the `ProductSale` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `totalAmount` on the `ProductSale` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[playerId,sportId,date]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sportId` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'REFUNDED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EventType" ADD VALUE 'MATCH';
ALTER TYPE "EventType" ADD VALUE 'MEETING';
ALTER TYPE "EventType" ADD VALUE 'CAMP';
ALTER TYPE "EventType" ADD VALUE 'OTHER';

-- AlterEnum
ALTER TYPE "PaymentSource" ADD VALUE 'OTHER';

-- DropForeignKey
ALTER TABLE "CoachSport" DROP CONSTRAINT "CoachSport_coachId_fkey";

-- DropForeignKey
ALTER TABLE "CoachSport" DROP CONSTRAINT "CoachSport_sportId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerSport" DROP CONSTRAINT "PlayerSport_playerId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerSport" DROP CONSTRAINT "PlayerSport_sportId_fkey";

-- DropForeignKey
ALTER TABLE "ProductRestock" DROP CONSTRAINT "ProductRestock_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSale" DROP CONSTRAINT "ProductSale_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "Skill" DROP CONSTRAINT "Skill_sportId_fkey";

-- DropForeignKey
ALTER TABLE "SkillRating" DROP CONSTRAINT "SkillRating_skillId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "recordedById" TEXT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'ACTIVE',
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "defaultPrice" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ProductSale" ALTER COLUMN "pricePerUnit" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "coachId" TEXT,
ADD COLUMN     "sportId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_createdAt_idx" ON "AuditLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "Attendance_tenantId_date_idx" ON "Attendance"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Attendance_playerId_date_idx" ON "Attendance"("playerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_playerId_sportId_date_key" ON "Attendance"("playerId", "sportId", "date");

-- CreateIndex
CREATE INDEX "Event_tenantId_date_idx" ON "Event"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Payment_tenantId_date_idx" ON "Payment"("tenantId", "date");

-- CreateIndex
CREATE INDEX "Payment_playerId_date_idx" ON "Payment"("playerId", "date");

-- CreateIndex
CREATE INDEX "Player_tenantId_idx" ON "Player"("tenantId");

-- CreateIndex
CREATE INDEX "Player_coachId_idx" ON "Player"("coachId");

-- CreateIndex
CREATE INDEX "PlayerProgress_tenantId_playerId_idx" ON "PlayerProgress"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "Product_tenantId_idx" ON "Product"("tenantId");

-- CreateIndex
CREATE INDEX "ProductRestock_tenantId_idx" ON "ProductRestock"("tenantId");

-- CreateIndex
CREATE INDEX "ProductSale_tenantId_idx" ON "ProductSale"("tenantId");

-- CreateIndex
CREATE INDEX "RegistrationRequest_tenantId_status_idx" ON "RegistrationRequest"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Skill_sportId_idx" ON "Skill"("sportId");

-- CreateIndex
CREATE INDEX "SkillRating_playerId_idx" ON "SkillRating"("playerId");

-- CreateIndex
CREATE INDEX "SkillRating_skillId_idx" ON "SkillRating"("skillId");

-- CreateIndex
CREATE INDEX "Sport_tenantId_idx" ON "Sport"("tenantId");

-- CreateIndex
CREATE INDEX "Subscription_tenantId_playerId_idx" ON "Subscription"("tenantId", "playerId");

-- CreateIndex
CREATE INDEX "Subscription_playerId_endDate_idx" ON "Subscription"("playerId", "endDate");

-- CreateIndex
CREATE INDEX "Tournament_tenantId_idx" ON "Tournament"("tenantId");

-- CreateIndex
CREATE INDEX "WeightLog_tenantId_playerId_idx" ON "WeightLog"("tenantId", "playerId");

-- AddForeignKey
ALTER TABLE "PlayerSport" ADD CONSTRAINT "PlayerSport_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerSport" ADD CONSTRAINT "PlayerSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSport" ADD CONSTRAINT "CoachSport_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachSport" ADD CONSTRAINT "CoachSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillRating" ADD CONSTRAINT "SkillRating_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRestock" ADD CONSTRAINT "ProductRestock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSale" ADD CONSTRAINT "ProductSale_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
