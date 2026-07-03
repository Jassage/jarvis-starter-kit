-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'DIRECTEUR', 'SUPERVISEUR', 'CAISSIER', 'AGENT_CREDIT', 'COMPTABLE', 'AUDITEUR');

-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('INDIVIDUEL', 'ENTREPRISE');

-- CreateEnum
CREATE TYPE "StatutClient" AS ENUM ('ACTIF', 'INACTIF', 'SUSPENDU', 'BLACKLISTE');

-- CreateEnum
CREATE TYPE "TypeCompte" AS ENUM ('EPARGNE', 'COURANT', 'TERME', 'JOINT', 'MICRO_EPARGNE', 'TONTINE', 'RETRAITE', 'JEUNESSE', 'CREDIT');

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

-- CreateEnum
CREATE TYPE "TypeGarantie" AS ENUM ('HYPOTHEQUE', 'NANTISSEMENT', 'CAUTION', 'GAGE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutGarantie" AS ENUM ('ACTIVE', 'LEVEE', 'SAISIE');

-- CreateEnum
CREATE TYPE "FrequenceEpargne" AS ENUM ('HEBDOMADAIRE', 'MENSUEL', 'BIMESTRIEL', 'TRIMESTRIEL');

-- CreateEnum
CREATE TYPE "StatutEmploye" AS ENUM ('ACTIF', 'INACTIF', 'CONGE', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "TypeContrat" AS ENUM ('CDI', 'CDD', 'STAGE', 'CONSULTANT');

-- CreateEnum
CREATE TYPE "StatutContrat" AS ENUM ('ACTIF', 'EXPIRE', 'RESILIE');

-- CreateEnum
CREATE TYPE "TypeConge" AS ENUM ('ANNUEL', 'MALADIE', 'MATERNITE', 'PATERNITE', 'SANS_SOLDE', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutConge" AS ENUM ('EN_ATTENTE', 'APPROUVE', 'REFUSE', 'ANNULE');

-- CreateEnum
CREATE TYPE "StatutPaie" AS ENUM ('BROUILLON', 'VALIDE', 'PAYE');

-- CreateEnum
CREATE TYPE "ModeReglement" AS ENUM ('VIREMENT_BANKA', 'ESPECES');

-- CreateEnum
CREATE TYPE "StatutAvance" AS ENUM ('EN_ATTENTE', 'DEDUITE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeElement" AS ENUM ('PRIME', 'BONUS', 'INDEMNITE', 'RETENUE', 'HEURE_SUP');

-- CreateEnum
CREATE TYPE "StatutPointage" AS ENUM ('PRESENT', 'ABSENT', 'RETARD', 'DEMI_JOURNEE');

-- CreateEnum
CREATE TYPE "TypeAlerteAML" AS ENUM ('SEUIL_DECLARE', 'STRUCTURATION', 'MANDATAIRE_BLACKLIST', 'VELOCITE_ELEVEE');

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
    "twoFactorSecret" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "agenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
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
    "dateCloture" TIMESTAMP(3),
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
    "transactionId" TEXT,
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
CREATE TABLE "mandats_compte" (
    "id" TEXT NOT NULL,
    "compteId" TEXT NOT NULL,
    "mandataireId" TEXT NOT NULL,
    "droits" TEXT[],
    "dateDebut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateFin" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandats_compte_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "garanties" (
    "id" TEXT NOT NULL,
    "pretId" TEXT NOT NULL,
    "type" "TypeGarantie" NOT NULL,
    "statut" "StatutGarantie" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT NOT NULL,
    "valeurEstimee" DECIMAL(15,2),
    "dateConstit" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLevee" TIMESTAMP(3),
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "garanties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "epargnes_programmees" (
    "id" TEXT NOT NULL,
    "compteSourceId" TEXT NOT NULL,
    "compteDestId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "frequence" "FrequenceEpargne" NOT NULL,
    "prochainVersement" TIMESTAMP(3) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "nombreExecutions" INTEGER NOT NULL DEFAULT 0,
    "derniereExecution" TIMESTAMP(3),
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "epargnes_programmees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "departement" TEXT,
    "salaireMin" DECIMAL(15,2),
    "salaireMax" DECIMAL(15,2),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employes" (
    "id" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "biometricId" INTEGER,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "dateEmbauche" TIMESTAMP(3) NOT NULL,
    "departement" TEXT,
    "statut" "StatutEmploye" NOT NULL DEFAULT 'ACTIF',
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "posteId" TEXT NOT NULL,
    "compteId" TEXT,
    "modeReglement" "ModeReglement" NOT NULL DEFAULT 'VIREMENT_BANKA',
    "agenceId" TEXT,
    "utilisateurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" "TypeContrat" NOT NULL,
    "statut" "StatutContrat" NOT NULL DEFAULT 'ACTIF',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3),
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conges" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "type" "TypeConge" NOT NULL,
    "statut" "StatutConge" NOT NULL DEFAULT 'EN_ATTENTE',
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "dateFin" TIMESTAMP(3) NOT NULL,
    "nbJours" INTEGER NOT NULL,
    "motif" TEXT,
    "commentaire" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fiches_paie" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "salaireBrut" DECIMAL(15,2) NOT NULL,
    "cotisations" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "avanceDeduite" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "creditDeduit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "salaireNet" DECIMAL(15,2) NOT NULL,
    "statut" "StatutPaie" NOT NULL DEFAULT 'BROUILLON',
    "modeReglement" "ModeReglement" NOT NULL DEFAULT 'VIREMENT_BANKA',
    "details" JSONB,
    "valideParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fiches_paie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avances_salaire" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "periodeDeduction" TEXT NOT NULL,
    "statut" "StatutAvance" NOT NULL DEFAULT 'EN_ATTENTE',
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "avances_salaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elements_variables" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "type" "TypeElement" NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "notes" TEXT,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elements_variables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_echec" (
    "id" TEXT NOT NULL,
    "debitNumero" TEXT NOT NULL,
    "creditNumero" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "libelle" TEXT NOT NULL,
    "erreur" TEXT NOT NULL,
    "transactionId" TEXT,
    "userId" TEXT NOT NULL,
    "resolu" BOOLEAN NOT NULL DEFAULT false,
    "resoluAt" TIMESTAMP(3),
    "resoluParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_echec_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taux_change" (
    "id" TEXT NOT NULL,
    "devise" TEXT NOT NULL,
    "tauxAchat" DECIMAL(10,4) NOT NULL,
    "tauxVente" DECIMAL(10,4) NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taux_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertes_aml" (
    "id" TEXT NOT NULL,
    "type" "TypeAlerteAML" NOT NULL,
    "compteId" TEXT,
    "clientId" TEXT,
    "transactionId" TEXT,
    "montantTotal" DECIMAL(15,2),
    "details" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'NOUVELLE',
    "traitePar" TEXT,
    "traiteAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alertes_aml_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "pointage_devices" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "commKey" TEXT NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "derniereSync" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pointage_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pointages" (
    "id" TEXT NOT NULL,
    "employeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "heureArrivee" TIMESTAMP(3),
    "heureDepart" TIMESTAMP(3),
    "statut" "StatutPointage" NOT NULL DEFAULT 'PRESENT',
    "retardMinutes" INTEGER,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUEL',
    "deviceId" TEXT,
    "creeParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pointages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_agenceId_idx" ON "utilisateurs"("agenceId");

-- CreateIndex
CREATE INDEX "utilisateurs_role_actif_idx" ON "utilisateurs"("role", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");

-- CreateIndex
CREATE INDEX "password_reset_tokens_utilisateurId_idx" ON "password_reset_tokens"("utilisateurId");

-- CreateIndex
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "agences_code_key" ON "agences"("code");

-- CreateIndex
CREATE UNIQUE INDEX "clients_numeroClient_key" ON "clients"("numeroClient");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_numeroCompte_key" ON "comptes"("numeroCompte");

-- CreateIndex
CREATE INDEX "comptes_clientId_idx" ON "comptes"("clientId");

-- CreateIndex
CREATE INDEX "comptes_agenceId_idx" ON "comptes"("agenceId");

-- CreateIndex
CREATE INDEX "comptes_statut_idx" ON "comptes"("statut");

-- CreateIndex
CREATE INDEX "comptes_agenceId_statut_idx" ON "comptes"("agenceId", "statut");

-- CreateIndex
CREATE INDEX "sessions_caisse_agenceId_statut_idx" ON "sessions_caisse"("agenceId", "statut");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_remboursementId_key" ON "transactions"("remboursementId");

-- CreateIndex
CREATE INDEX "transactions_compteDebitId_idx" ON "transactions"("compteDebitId");

-- CreateIndex
CREATE INDEX "transactions_compteCreditId_idx" ON "transactions"("compteCreditId");

-- CreateIndex
CREATE INDEX "transactions_statut_idx" ON "transactions"("statut");

-- CreateIndex
CREATE INDEX "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "transactions_creeParId_idx" ON "transactions"("creeParId");

-- CreateIndex
CREATE INDEX "transactions_sessionId_idx" ON "transactions"("sessionId");

-- CreateIndex
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

-- CreateIndex
CREATE INDEX "transactions_compteDebitId_statut_idx" ON "transactions"("compteDebitId", "statut");

-- CreateIndex
CREATE INDEX "transactions_compteCreditId_statut_idx" ON "transactions"("compteCreditId", "statut");

-- CreateIndex
CREATE INDEX "transactions_statut_createdAt_idx" ON "transactions"("statut", "createdAt");

-- CreateIndex
CREATE INDEX "transactions_type_statut_createdAt_idx" ON "transactions"("type", "statut", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "prets_reference_key" ON "prets"("reference");

-- CreateIndex
CREATE INDEX "prets_clientId_idx" ON "prets"("clientId");

-- CreateIndex
CREATE INDEX "prets_agenceId_idx" ON "prets"("agenceId");

-- CreateIndex
CREATE INDEX "prets_statut_idx" ON "prets"("statut");

-- CreateIndex
CREATE INDEX "prets_agentCreditId_idx" ON "prets"("agentCreditId");

-- CreateIndex
CREATE INDEX "prets_agenceId_statut_idx" ON "prets"("agenceId", "statut");

-- CreateIndex
CREATE INDEX "lignes_pret_pretId_idx" ON "lignes_pret"("pretId");

-- CreateIndex
CREATE INDEX "lignes_pret_statut_idx" ON "lignes_pret"("statut");

-- CreateIndex
CREATE INDEX "lignes_pret_dateEcheance_statut_idx" ON "lignes_pret"("dateEcheance", "statut");

-- CreateIndex
CREATE INDEX "remboursements_pret_pretId_idx" ON "remboursements_pret"("pretId");

-- CreateIndex
CREATE INDEX "remboursements_pret_date_idx" ON "remboursements_pret"("date");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_comptables_numero_key" ON "comptes_comptables"("numero");

-- CreateIndex
CREATE INDEX "ecritures_comptables_compteDebitId_idx" ON "ecritures_comptables"("compteDebitId");

-- CreateIndex
CREATE INDEX "ecritures_comptables_compteCreditId_idx" ON "ecritures_comptables"("compteCreditId");

-- CreateIndex
CREATE INDEX "ecritures_comptables_date_idx" ON "ecritures_comptables"("date");

-- CreateIndex
CREATE INDEX "ecritures_comptables_transactionId_idx" ON "ecritures_comptables"("transactionId");

-- CreateIndex
CREATE INDEX "ecritures_comptables_compteDebitId_date_idx" ON "ecritures_comptables"("compteDebitId", "date");

-- CreateIndex
CREATE INDEX "ecritures_comptables_compteCreditId_date_idx" ON "ecritures_comptables"("compteCreditId", "date");

-- CreateIndex
CREATE INDEX "mandats_compte_compteId_idx" ON "mandats_compte"("compteId");

-- CreateIndex
CREATE INDEX "mandats_compte_mandataireId_idx" ON "mandats_compte"("mandataireId");

-- CreateIndex
CREATE INDEX "mandats_compte_compteId_actif_idx" ON "mandats_compte"("compteId", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "configurations_cle_key" ON "configurations"("cle");

-- CreateIndex
CREATE INDEX "garanties_pretId_idx" ON "garanties"("pretId");

-- CreateIndex
CREATE INDEX "garanties_statut_idx" ON "garanties"("statut");

-- CreateIndex
CREATE INDEX "epargnes_programmees_actif_prochainVersement_idx" ON "epargnes_programmees"("actif", "prochainVersement");

-- CreateIndex
CREATE INDEX "epargnes_programmees_compteSourceId_idx" ON "epargnes_programmees"("compteSourceId");

-- CreateIndex
CREATE INDEX "epargnes_programmees_compteDestId_idx" ON "epargnes_programmees"("compteDestId");

-- CreateIndex
CREATE UNIQUE INDEX "postes_code_key" ON "postes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "employes_matricule_key" ON "employes"("matricule");

-- CreateIndex
CREATE UNIQUE INDEX "employes_biometricId_key" ON "employes"("biometricId");

-- CreateIndex
CREATE UNIQUE INDEX "employes_utilisateurId_key" ON "employes"("utilisateurId");

-- CreateIndex
CREATE INDEX "employes_statut_idx" ON "employes"("statut");

-- CreateIndex
CREATE INDEX "employes_posteId_idx" ON "employes"("posteId");

-- CreateIndex
CREATE INDEX "employes_agenceId_idx" ON "employes"("agenceId");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_reference_key" ON "contrats"("reference");

-- CreateIndex
CREATE INDEX "contrats_employeId_idx" ON "contrats"("employeId");

-- CreateIndex
CREATE INDEX "contrats_statut_idx" ON "contrats"("statut");

-- CreateIndex
CREATE INDEX "conges_employeId_idx" ON "conges"("employeId");

-- CreateIndex
CREATE INDEX "conges_statut_idx" ON "conges"("statut");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_paie_reference_key" ON "fiches_paie"("reference");

-- CreateIndex
CREATE INDEX "fiches_paie_statut_idx" ON "fiches_paie"("statut");

-- CreateIndex
CREATE INDEX "fiches_paie_periode_idx" ON "fiches_paie"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "fiches_paie_employeId_periode_key" ON "fiches_paie"("employeId", "periode");

-- CreateIndex
CREATE UNIQUE INDEX "avances_salaire_reference_key" ON "avances_salaire"("reference");

-- CreateIndex
CREATE INDEX "avances_salaire_employeId_idx" ON "avances_salaire"("employeId");

-- CreateIndex
CREATE INDEX "avances_salaire_statut_idx" ON "avances_salaire"("statut");

-- CreateIndex
CREATE INDEX "avances_salaire_periodeDeduction_idx" ON "avances_salaire"("periodeDeduction");

-- CreateIndex
CREATE INDEX "elements_variables_employeId_idx" ON "elements_variables"("employeId");

-- CreateIndex
CREATE INDEX "elements_variables_periode_idx" ON "elements_variables"("periode");

-- CreateIndex
CREATE INDEX "elements_variables_employeId_periode_idx" ON "elements_variables"("employeId", "periode");

-- CreateIndex
CREATE INDEX "ecritures_echec_createdAt_idx" ON "ecritures_echec"("createdAt");

-- CreateIndex
CREATE INDEX "ecritures_echec_resolu_idx" ON "ecritures_echec"("resolu");

-- CreateIndex
CREATE INDEX "taux_change_devise_actif_idx" ON "taux_change"("devise", "actif");

-- CreateIndex
CREATE INDEX "alertes_aml_statut_idx" ON "alertes_aml"("statut");

-- CreateIndex
CREATE INDEX "alertes_aml_compteId_idx" ON "alertes_aml"("compteId");

-- CreateIndex
CREATE INDEX "alertes_aml_clientId_idx" ON "alertes_aml"("clientId");

-- CreateIndex
CREATE INDEX "alertes_aml_createdAt_idx" ON "alertes_aml"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_utilisateurId_idx" ON "audit_logs"("utilisateurId");

-- CreateIndex
CREATE INDEX "audit_logs_table_action_idx" ON "audit_logs"("table", "action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_table_createdAt_idx" ON "audit_logs"("table", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_utilisateurId_idx" ON "refresh_tokens"("utilisateurId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "pointage_devices_serialNumber_key" ON "pointage_devices"("serialNumber");

-- CreateIndex
CREATE INDEX "pointages_date_idx" ON "pointages"("date");

-- CreateIndex
CREATE INDEX "pointages_employeId_idx" ON "pointages"("employeId");

-- CreateIndex
CREATE INDEX "pointages_deviceId_idx" ON "pointages"("deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "pointages_employeId_date_key" ON "pointages"("employeId", "date");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_compteDebitId_fkey" FOREIGN KEY ("compteDebitId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_compteCreditId_fkey" FOREIGN KEY ("compteCreditId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_compte" ADD CONSTRAINT "mandats_compte_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_compte" ADD CONSTRAINT "mandats_compte_mandataireId_fkey" FOREIGN KEY ("mandataireId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandats_compte" ADD CONSTRAINT "mandats_compte_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garanties" ADD CONSTRAINT "garanties_pretId_fkey" FOREIGN KEY ("pretId") REFERENCES "prets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "garanties" ADD CONSTRAINT "garanties_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes_programmees" ADD CONSTRAINT "epargnes_programmees_compteSourceId_fkey" FOREIGN KEY ("compteSourceId") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes_programmees" ADD CONSTRAINT "epargnes_programmees_compteDestId_fkey" FOREIGN KEY ("compteDestId") REFERENCES "comptes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "epargnes_programmees" ADD CONSTRAINT "epargnes_programmees_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_posteId_fkey" FOREIGN KEY ("posteId") REFERENCES "postes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_compteId_fkey" FOREIGN KEY ("compteId") REFERENCES "comptes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_agenceId_fkey" FOREIGN KEY ("agenceId") REFERENCES "agences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employes" ADD CONSTRAINT "employes_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conges" ADD CONSTRAINT "conges_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_paie" ADD CONSTRAINT "fiches_paie_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_paie" ADD CONSTRAINT "fiches_paie_valideParId_fkey" FOREIGN KEY ("valideParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avances_salaire" ADD CONSTRAINT "avances_salaire_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avances_salaire" ADD CONSTRAINT "avances_salaire_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elements_variables" ADD CONSTRAINT "elements_variables_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elements_variables" ADD CONSTRAINT "elements_variables_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_employeId_fkey" FOREIGN KEY ("employeId") REFERENCES "employes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "pointage_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pointages" ADD CONSTRAINT "pointages_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
