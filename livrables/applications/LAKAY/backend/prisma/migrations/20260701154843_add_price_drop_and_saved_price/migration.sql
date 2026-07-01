-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'PRICE_DROP';

-- AlterTable
ALTER TABLE "favorites" ADD COLUMN     "savedPrice" DECIMAL(12,2);
