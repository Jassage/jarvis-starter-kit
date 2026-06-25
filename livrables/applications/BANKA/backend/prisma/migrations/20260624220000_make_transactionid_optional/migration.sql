-- Make transactionId nullable to allow manual journal entries and paie entries
ALTER TABLE "ecritures_comptables" ALTER COLUMN "transactionId" DROP NOT NULL;
