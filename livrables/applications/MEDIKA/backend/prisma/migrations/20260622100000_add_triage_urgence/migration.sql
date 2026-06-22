-- CreateTable
CREATE TABLE "triage_urgence" (
    "id" TEXT NOT NULL,
    "fileAttenteId" TEXT NOT NULL,
    "gcYeux" INTEGER NOT NULL DEFAULT 4,
    "gcVerbal" INTEGER NOT NULL DEFAULT 5,
    "gcMoteur" INTEGER NOT NULL DEFAULT 6,
    "saturationO2" DOUBLE PRECISION,
    "freqRespiratoire" INTEGER,
    "freqCardiaque" INTEGER,
    "tensionSystolique" INTEGER,
    "tensionDiastolique" INTEGER,
    "temperature" DOUBLE PRECISION,
    "douleur" INTEGER NOT NULL DEFAULT 0,
    "notesTriage" TEXT,
    "triagedById" TEXT,
    "triagedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "triage_urgence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "triage_urgence_fileAttenteId_key" ON "triage_urgence"("fileAttenteId");

-- AddForeignKey
ALTER TABLE "triage_urgence" ADD CONSTRAINT "triage_urgence_fileAttenteId_fkey" FOREIGN KEY ("fileAttenteId") REFERENCES "file_attente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "triage_urgence" ADD CONSTRAINT "triage_urgence_triagedById_fkey" FOREIGN KEY ("triagedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
