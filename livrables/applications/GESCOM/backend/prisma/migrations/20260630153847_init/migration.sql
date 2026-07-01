-- CreateEnum
CREATE TYPE "RoleUtilisateur" AS ENUM ('SUPER_ADMIN', 'GERANT', 'VENDEUR', 'MAGASINIER', 'COMPTABLE');

-- CreateEnum
CREATE TYPE "TypeEmplacement" AS ENUM ('BOUTIQUE', 'ENTREPOT');

-- CreateEnum
CREATE TYPE "TypeMouvementStock" AS ENUM ('ENTREE', 'SORTIE', 'VENTE', 'TRANSFERT_SORTIE', 'TRANSFERT_ENTREE', 'AJUSTEMENT');

-- CreateEnum
CREATE TYPE "StatutTransfert" AS ENUM ('EN_TRANSIT', 'RECU', 'ANNULE');

-- CreateEnum
CREATE TYPE "TypeClient" AS ENUM ('PARTICULIER', 'GROSSISTE');

-- CreateEnum
CREATE TYPE "StatutVente" AS ENUM ('BROUILLON', 'VALIDEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'CHEQUE', 'VIREMENT', 'CREDIT');

-- CreateEnum
CREATE TYPE "StatutCommande" AS ENUM ('BROUILLON', 'ENVOYEE', 'RECUE_PARTIELLE', 'RECUE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "TypeCompteComptable" AS ENUM ('ACTIF', 'PASSIF', 'PRODUIT', 'CHARGE');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "role" "RoleUtilisateur" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "telephone" TEXT,
    "emplacementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "emplacements" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeEmplacement" NOT NULL,
    "adresse" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emplacements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" TEXT,
    "unite" TEXT NOT NULL DEFAULT 'unité',
    "prixAchatMoyen" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "prixVenteDetail" DECIMAL(15,2) NOT NULL,
    "prixVenteGros" DECIMAL(15,2),
    "seuilAlerte" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stocks_emplacement" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "emplacementId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_emplacement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "emplacementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TypeMouvementStock" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "raison" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferts" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "emplacementSourceId" TEXT NOT NULL,
    "emplacementDestId" TEXT NOT NULL,
    "statut" "StatutTransfert" NOT NULL DEFAULT 'EN_TRANSIT',
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "dateEnvoi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateReception" TIMESTAMP(3),

    CONSTRAINT "transferts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_transfert" (
    "id" TEXT NOT NULL,
    "transfertId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,

    CONSTRAINT "lignes_transfert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "type" "TypeClient" NOT NULL DEFAULT 'PARTICULIER',
    "soldeDu" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "clientId" TEXT,
    "emplacementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statut" "StatutVente" NOT NULL DEFAULT 'BROUILLON',
    "modePaiement" "ModePaiement" NOT NULL DEFAULT 'ESPECES',
    "montantTotal" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "montantPaye" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "dateVente" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_vente" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DECIMAL(15,2) NOT NULL,
    "montantLigne" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "lignes_vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes_fournisseur" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "emplacementId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "statut" "StatutCommande" NOT NULL DEFAULT 'BROUILLON',
    "notes" TEXT,
    "dateCommande" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateLivraisonPrevue" TIMESTAMP(3),

    CONSTRAINT "commandes_fournisseur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantiteCommandee" INTEGER NOT NULL,
    "quantiteRecue" INTEGER NOT NULL DEFAULT 0,
    "prixUnitaireAchat" DECIMAL(15,2) NOT NULL,

    CONSTRAINT "lignes_commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comptes_comptables" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "intitule" TEXT NOT NULL,
    "type" "TypeCompteComptable" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "comptes_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_comptables" (
    "id" TEXT NOT NULL,
    "compteDebitId" TEXT NOT NULL,
    "compteCreditId" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "libelle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_comptables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecritures_echec" (
    "id" TEXT NOT NULL,
    "compteDebitNumero" TEXT NOT NULL,
    "compteCreditNumero" TEXT NOT NULL,
    "montant" DECIMAL(15,2) NOT NULL,
    "libelle" TEXT NOT NULL,
    "erreur" TEXT NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "resolu" BOOLEAN NOT NULL DEFAULT false,
    "resoluAt" TIMESTAMP(3),
    "resoluParId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ecritures_echec_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_emplacementId_idx" ON "utilisateurs"("emplacementId");

-- CreateIndex
CREATE INDEX "utilisateurs_role_actif_idx" ON "utilisateurs"("role", "actif");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_utilisateurId_idx" ON "refresh_tokens"("utilisateurId");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "audit_logs_utilisateurId_idx" ON "audit_logs"("utilisateurId");

-- CreateIndex
CREATE INDEX "audit_logs_table_action_idx" ON "audit_logs"("table", "action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_table_createdAt_idx" ON "audit_logs"("table", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "produits_reference_key" ON "produits"("reference");

-- CreateIndex
CREATE INDEX "produits_categorie_idx" ON "produits"("categorie");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_emplacement_produitId_emplacementId_key" ON "stocks_emplacement"("produitId", "emplacementId");

-- CreateIndex
CREATE INDEX "mouvements_stock_produitId_emplacementId_idx" ON "mouvements_stock"("produitId", "emplacementId");

-- CreateIndex
CREATE INDEX "mouvements_stock_type_createdAt_idx" ON "mouvements_stock"("type", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "transferts_numero_key" ON "transferts"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "ventes_numero_key" ON "ventes"("numero");

-- CreateIndex
CREATE INDEX "ventes_emplacementId_dateVente_idx" ON "ventes"("emplacementId", "dateVente");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_fournisseur_numero_key" ON "commandes_fournisseur"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "comptes_comptables_numero_key" ON "comptes_comptables"("numero");

-- CreateIndex
CREATE INDEX "ecritures_comptables_compteDebitId_date_idx" ON "ecritures_comptables"("compteDebitId", "date");

-- CreateIndex
CREATE INDEX "ecritures_comptables_compteCreditId_date_idx" ON "ecritures_comptables"("compteCreditId", "date");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "emplacements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_emplacement" ADD CONSTRAINT "stocks_emplacement_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stocks_emplacement" ADD CONSTRAINT "stocks_emplacement_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_emplacementSourceId_fkey" FOREIGN KEY ("emplacementSourceId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_emplacementDestId_fkey" FOREIGN KEY ("emplacementDestId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferts" ADD CONSTRAINT "transferts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_transfert" ADD CONSTRAINT "lignes_transfert_transfertId_fkey" FOREIGN KEY ("transfertId") REFERENCES "transferts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_transfert" ADD CONSTRAINT "lignes_transfert_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_fournisseur" ADD CONSTRAINT "commandes_fournisseur_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_fournisseur" ADD CONSTRAINT "commandes_fournisseur_emplacementId_fkey" FOREIGN KEY ("emplacementId") REFERENCES "emplacements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_fournisseur" ADD CONSTRAINT "commandes_fournisseur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes_fournisseur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande" ADD CONSTRAINT "lignes_commande_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_compteDebitId_fkey" FOREIGN KEY ("compteDebitId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_compteCreditId_fkey" FOREIGN KEY ("compteCreditId") REFERENCES "comptes_comptables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecritures_comptables" ADD CONSTRAINT "ecritures_comptables_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
