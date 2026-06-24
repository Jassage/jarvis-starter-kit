-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'AGENT_CREDIT', 'COMPTABLE', 'AUDITEUR');

-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('INDIVIDUEL', 'ENTREPRISE');

-- CreateEnum
CREATE TYPE "StatutClient" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'BLACKLISTE');

-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('EPARGNE', 'COURANT', 'TERME');

-- CreateEnum
CREATE TYPE "StatutCompte" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'CLOTURE');

-- CreateEnum
CREATE TYPE "Devise" AS ENUM ('HTG', 'USD');

-- CreateEnum
CREATE TYPE "TypeTransaction" AS ENUM ('DEPOT', 'RETRAIT', 'VIREMENT_DEBIT', 'VIREMENT_CREDIT', 'DECAISSEMENT_PRET', 'REMBOURSEMENT_PRET', 'FRAIS', 'INTERET', 'AJUSTEMENT');

-- CreateEnum
CREATE TYPE "StatutTransaction" AS ENUM ('EN_ATTENTE', 'VALIDEE', 'REJETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutSession" AS ENUM ('OUVERTE', 'FERMEE');

-- CreateEnum
CREATE TYPE "StatutPret" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'DECAISSE', 'EN_COURS', 'SOLDE', 'EN_RETARD', 'REJETE', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeAmortissement" AS ENUM ('DEGRESSIF', 'CONSTANT', 'IN_FINE');

-- CreateEnum
CREATE TYPE "StatutLignePret" AS ENUM ('EN_ATTENTE', 'PARTIELLEMENT_PAYE', 'PAYE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "TypeRemboursement" AS ENUM ('MENSUALITE', 'ANTICIPEE', 'PARTIELLE');

-- CreateEnum
CREATE TYPE "TypeCompteComptable" AS ENUM ('ACTIF', 'PASSIF', 'CHARGE', 'PRODUIT', 'CAPITAUX');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "telephone" TEXT,
    "agenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agences" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "numeroClient" TEXT NOT NULL,
    "type" "TypeClient" NOT NULL DEFAULT 'INDIVIDUEL',
    "statut" "StatutClient" NOT NULL DEFAULT 'ACTIF',
    "nom" TEXT,
    "prenom" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "lieuNaissance" TEXT,
    "raisonSociale" TEXT,
    "nif" TEXT,
    "pieceIdentite" TEXT,
    "numeroPiece" TEXT,
    "telephone" TEXT NOT NULL,
    "email" TEXT,
    "adresse" TEXT NOT NULL,
    "profession" TEXT,
    "photo" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes" (
    "id" TEXT NOT NULL,
    "numeroCompte" TEXT NOT NULL,
    "type" "TypeCompte" NOT NULL,
    "devise" "Devise" NOT NULL DEFAULT 'HTG',
    "solde" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "soldeMinimum" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "statut" "StatutCompte" NOT NULL DEFAULT 'ACTIF',
    "intitule" TEXT,
    "tauxInteret" DECIMAL(6,4),
    "dateEcheance" TIMESTAMP(3),
    "clientId" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comptes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions_caisse" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agenceId" TEXT NOT NULL,
    "ouvertParId" TEXT NOT NULL,
    "fermeParId" TEXT,
    "soldeOuverture" DECIMAL(15,2) NOT NULL,
    "soldeFermeture" DECIMAL(15,2),
    "devise" "Devise" NOT NULL DEFAULT 'HTG',
    "statut" "StatutSession" NOT NULL DEFAULT 'OUVERTE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_caisse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "type" "TypeTransaction" NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "devise" "Devise" NOT NULL,
    "soldeAvant" DECIMAL(15,2) NOT NULL,
    "soldeApres" DECIMAL(15,2) NOT NULL,
    "motif" TEXT,
    "statut" "StatutTransaction" NOT NULL DEFAULT 'EN_ATTENTE',
    "compteDebitId" TEXT,
    "compteCreditId" TEXT,
    "sessionId" TEXT,
    "creeParId" TEXT NOT NULL,
    "valideParId" TEXT,
    "remboursementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prets" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "agenceId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "tauxMensuel" DECIMAL(6,4) NOT NULL,
    "dureeMois" INTEGER NOT NULL,
    "typeAmortissement" "TypeAmortissement" NOT NULL DEFAULT 'DEGRESSIF',
    "devise" "Devise" NOT NULL DEFAULT 'HTG',
    "objet" TEXT,
    "statut" "StatutPret" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateDemande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateApprobation" TIMESTAMP(3),
    "dateDecaissement" TIMESTAMP(3),
    "datePremierRdv" TIMESTAMP(3),
    "dateDernierRdv" TIMESTAMP(3),
    "agentCreditId" TEXT NOT NULL,
    "validateurId" TEXT,
    "montantTotal" DECIMAL(15,2) NOT NULL,
    "montantRembourse" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "resteARegler" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_pret" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "numeroEcheance" INTEGER NOT NULL,
    "dateEcheance" TIMESTAMP(3) NOT NULL,
    "capital" DECIMAL(15,2) NOT NULL,
    "interet" DECIMAL(15,2) NOT NULL,
    "mensualite" DECIMAL(15,2) NOT NULL,
    "capitalRestant" DECIMAL(15,2) NOT NULL,
    "statut" "StatutLignePret" NOT NULL DEFAULT 'EN_ATTENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lignes_pret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "remboursements_pret" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "type" "TypeRemboursement" NOT NULL DEFAULT 'MENSUALITE',
    "montant" DECIMAL(15,2) NOT NULL,
    "capital" DECIMAL(15,2) NOT NULL,
    "interet" DECIMAL(15,2) NOT NULL,
    "penalite" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "remboursements_pret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes_comptables" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "type" "TypeCompteComptable" NOT NULL,
    "parentId" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comptes_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "compteDebitId" TEXT NOT NULL,
    "compteCreditId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "libelle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "table" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entiteId" TEXT NOT NULL,
    "ancienneValeur" JSONB,
    "nouvelleValeur" JSONB,
    "utilisateurId" TEXT NOT NULL,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agences_code_key" ON "agences"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clients_numeroClient_key" ON "clients"("numeroClient");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_numeroCompte_key" ON "comptes"("numeroCompte");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_caisse_agenceId_date_devise_key" ON "sessions_caisse"("agenceId", "date", "devise");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_remboursementId_key" ON "transactions"("remboursementId");

-- CreateIndex
CREATE UNIQUE INDEX "prets_reference_key" ON "prets"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_comptables_numero_key" ON "comptes_comptables"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_cle_key" ON "configurations"("cle");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptes" ADD CONSTRAINT "comptes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comptes" ADD CONSTRAINT "comptes_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_ouvertParId_fkey" FOREIGN KEY ("ouvertParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions_caisse" ADD CONSTRAINT "sessions_caisse_fermeParId_fkey" FOREIGN KEY ("fermeParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_compteDebitId_fkey" FOREIGN KEY ("compteDebitId") REFERENCES "comptes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_compteCreditId_fkey" FOREIGN KEY ("compteCreditId") REFERENCES "comptes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions_caisse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_remboursementId_fkey" FOREIGN KEY ("remboursementId") REFERENCES "remboursements_pret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prets" ADD CONSTRAINT "prets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prets" ADD CONSTRAINT "prets_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prets" ADD CONSTRAINT "prets_agentCreditId_fkey" FOREIGN KEY ("agentCreditId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prets" ADD CONSTRAINT "prets_validateurId_fkey" FOREIGN KEY ("validateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_pret" ADD CONSTRAINT "lignes_pret_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements_pret" ADD CONSTRAINT "remboursements_pret_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "remboursements_pret" ADD CONSTRAINT "remboursements_pret_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_compteDebitId_fkey" FOREIGN KEY ("compteDebitId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_compteCreditId_fkey" FOREIGN KEY ("compteCreditId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
