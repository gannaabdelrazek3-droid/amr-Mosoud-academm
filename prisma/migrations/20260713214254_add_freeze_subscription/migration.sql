-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "frozenAt" TIMESTAMP(3),
ADD COLUMN     "isFrozen" BOOLEAN NOT NULL DEFAULT false;
