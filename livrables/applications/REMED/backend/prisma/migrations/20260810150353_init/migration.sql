-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'GERANT', 'PHARMACIEN', 'VENDEUR', 'MAGASINIER');

-- CreateEnum
CREATE TYPE "FormePharmaceutique" AS ENUM ('COMPRIME', 'GELULE', 'SIROP', 'INJECTABLE', 'POMMADE_CREME', 'SUPPOSITOIRE', 'SACHET', 'GOUTTE', 'SOLUTE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeMouvementStock" AS ENUM ('ENTREE_ACHAT', 'SORTIE_VENTE', 'ANNULATION_VENTE', 'AJUSTEMENT_POSITIF', 'AJUSTEMENT_NEGATIF', 'PEREMPTION', 'RETOUR_FOURNISSEUR');

-- CreateEnum
CREATE TYPE "StatutCommandeAchat" AS ENUM ('BROUILLON', 'ENVOYEE', 'RECUE_PARTIELLE', 'RECUE_COMPLETE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StatutVente" AS ENUM ('COMPLETEE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "ModePaiement" AS ENUM ('ESPECES', 'CARTE', 'VIREMENT', 'CHEQUE', 'MOBILE_MONEY', 'CREDIT', 'AUTRE');

-- CreateEnum
CREATE TYPE "StatutCaisse" AS ENUM ('OUVERTE', 'FERMEE');

-- CreateEnum
CREATE TYPE "TypeCaisseTransaction" AS ENUM ('VENTE', 'SORTIE_MANUELLE', 'ENTREE_MANUELLE');

-- CreateTable
CREATE TABLE "pharmacies" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "nif" TEXT,
    "devise" TEXT NOT NULL DEFAULT 'HTG',
    "prefixeFacture" TEXT NOT NULL DEFAULT 'FAC',
    "seuilAlertePeremptionJours" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pharmacies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "telephone" TEXT,
    "role" "Role" NOT NULL,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produits" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "dci" TEXT,
    "dosage" TEXT,
    "formePharmaceutique" "FormePharmaceutique" NOT NULL DEFAULT 'AUTRE',
    "codeBarres" TEXT,
    "categorieId" TEXT,
    "prixAchat" DECIMAL(12,2) NOT NULL,
    "prixVente" DECIMAL(12,2) NOT NULL,
    "seuilAlerte" INTEGER NOT NULL DEFAULT 10,
    "necessiteOrdonnance" BOOLEAN NOT NULL DEFAULT false,
    "substanceControlee" BOOLEAN NOT NULL DEFAULT false,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lots_produits" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "numeroLot" TEXT NOT NULL,
    "dateExpiration" TIMESTAMP(3) NOT NULL,
    "quantiteInitiale" INTEGER NOT NULL,
    "quantiteActuelle" INTEGER NOT NULL,
    "prixAchatUnitaire" DECIMAL(12,2) NOT NULL,
    "fournisseurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_produits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mouvements_stock" (
    "id" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "lotId" TEXT,
    "type" "TypeMouvementStock" NOT NULL,
    "quantite" INTEGER NOT NULL,
    "quantiteAvant" INTEGER NOT NULL,
    "quantiteApres" INTEGER NOT NULL,
    "motif" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mouvements_stock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "contact" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commandes_achat" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "fournisseurId" TEXT NOT NULL,
    "statut" "StatutCommandeAchat" NOT NULL DEFAULT 'BROUILLON',
    "creeParId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commandes_achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_commande_achat" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "quantiteCommandee" INTEGER NOT NULL,
    "quantiteRecue" INTEGER NOT NULL DEFAULT 0,
    "prixUnitaire" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_commande_achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "adresse" TEXT,
    "dateNaissance" TIMESTAMP(3),
    "sexe" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ventes" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "caisseSessionId" TEXT NOT NULL,
    "caissierId" TEXT NOT NULL,
    "clientId" TEXT,
    "statut" "StatutVente" NOT NULL DEFAULT 'COMPLETEE',
    "sousTotal" DECIMAL(12,2) NOT NULL,
    "remise" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "montantTotal" DECIMAL(12,2) NOT NULL,
    "annuleeParId" TEXT,
    "annuleeLe" TIMESTAMP(3),
    "motifAnnulation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ventes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_vente" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "produitId" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "prixUnitaire" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "lignes_vente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "mode" "ModePaiement" NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordonnances" (
    "id" TEXT NOT NULL,
    "venteId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "medecinNom" TEXT NOT NULL,
    "patientNom" TEXT NOT NULL,
    "patientTelephone" TEXT,
    "dateEmission" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordonnances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caisse_sessions" (
    "id" TEXT NOT NULL,
    "pharmacieId" TEXT NOT NULL,
    "statut" "StatutCaisse" NOT NULL DEFAULT 'OUVERTE',
    "montantOuverture" DECIMAL(12,2) NOT NULL,
    "montantFermeture" DECIMAL(12,2),
    "soldeTheorique" DECIMAL(12,2),
    "ecart" DECIMAL(12,2),
    "ouvertParId" TEXT NOT NULL,
    "fermeeParId" TEXT,
    "ouverteLe" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fermeeLe" TIMESTAMP(3),

    CONSTRAINT "caisse_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "caisse_transactions" (
    "id" TEXT NOT NULL,
    "caisseSessionId" TEXT NOT NULL,
    "type" "TypeCaisseTransaction" NOT NULL,
    "montant" DECIMAL(12,2) NOT NULL,
    "motif" TEXT,
    "venteId" TEXT,
    "utilisateurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "caisse_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "utilisateurId" TEXT,
    "action" TEXT NOT NULL,
    "entite" TEXT NOT NULL,
    "entiteId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE INDEX "utilisateurs_pharmacieId_idx" ON "utilisateurs"("pharmacieId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "categories_pharmacieId_idx" ON "categories"("pharmacieId");

-- CreateIndex
CREATE UNIQUE INDEX "categories_pharmacieId_nom_key" ON "categories"("pharmacieId", "nom");

-- CreateIndex
CREATE INDEX "produits_pharmacieId_idx" ON "produits"("pharmacieId");

-- CreateIndex
CREATE INDEX "produits_categorieId_idx" ON "produits"("categorieId");

-- CreateIndex
CREATE INDEX "produits_nom_idx" ON "produits"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "produits_pharmacieId_codeBarres_key" ON "produits"("pharmacieId", "codeBarres");

-- CreateIndex
CREATE INDEX "lots_produits_produitId_idx" ON "lots_produits"("produitId");

-- CreateIndex
CREATE INDEX "lots_produits_dateExpiration_idx" ON "lots_produits"("dateExpiration");

-- CreateIndex
CREATE UNIQUE INDEX "lots_produits_produitId_numeroLot_key" ON "lots_produits"("produitId", "numeroLot");

-- CreateIndex
CREATE INDEX "mouvements_stock_produitId_idx" ON "mouvements_stock"("produitId");

-- CreateIndex
CREATE INDEX "mouvements_stock_createdAt_idx" ON "mouvements_stock"("createdAt");

-- CreateIndex
CREATE INDEX "fournisseurs_pharmacieId_idx" ON "fournisseurs"("pharmacieId");

-- CreateIndex
CREATE INDEX "commandes_achat_pharmacieId_idx" ON "commandes_achat"("pharmacieId");

-- CreateIndex
CREATE INDEX "commandes_achat_fournisseurId_idx" ON "commandes_achat"("fournisseurId");

-- CreateIndex
CREATE UNIQUE INDEX "commandes_achat_pharmacieId_numero_key" ON "commandes_achat"("pharmacieId", "numero");

-- CreateIndex
CREATE INDEX "lignes_commande_achat_commandeId_idx" ON "lignes_commande_achat"("commandeId");

-- CreateIndex
CREATE INDEX "clients_pharmacieId_idx" ON "clients"("pharmacieId");

-- CreateIndex
CREATE INDEX "ventes_pharmacieId_idx" ON "ventes"("pharmacieId");

-- CreateIndex
CREATE INDEX "ventes_caisseSessionId_idx" ON "ventes"("caisseSessionId");

-- CreateIndex
CREATE INDEX "ventes_caissierId_idx" ON "ventes"("caissierId");

-- CreateIndex
CREATE INDEX "ventes_clientId_idx" ON "ventes"("clientId");

-- CreateIndex
CREATE INDEX "ventes_createdAt_idx" ON "ventes"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ventes_pharmacieId_numero_key" ON "ventes"("pharmacieId", "numero");

-- CreateIndex
CREATE INDEX "lignes_vente_venteId_idx" ON "lignes_vente"("venteId");

-- CreateIndex
CREATE INDEX "paiements_venteId_idx" ON "paiements"("venteId");

-- CreateIndex
CREATE UNIQUE INDEX "ordonnances_venteId_key" ON "ordonnances"("venteId");

-- CreateIndex
CREATE UNIQUE INDEX "ordonnances_numero_key" ON "ordonnances"("numero");

-- CreateIndex
CREATE INDEX "caisse_sessions_pharmacieId_idx" ON "caisse_sessions"("pharmacieId");

-- CreateIndex
CREATE INDEX "caisse_transactions_caisseSessionId_idx" ON "caisse_transactions"("caisseSessionId");

-- CreateIndex
CREATE INDEX "audit_logs_entite_entiteId_idx" ON "audit_logs"("entite", "entiteId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "utilisateurs" ADD CONSTRAINT "utilisateurs_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "produits" ADD CONSTRAINT "produits_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots_produits" ADD CONSTRAINT "lots_produits_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots_produits" ADD CONSTRAINT "lots_produits_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots_produits"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mouvements_stock" ADD CONSTRAINT "mouvements_stock_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_achat" ADD CONSTRAINT "commandes_achat_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_achat" ADD CONSTRAINT "commandes_achat_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commandes_achat" ADD CONSTRAINT "commandes_achat_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande_achat" ADD CONSTRAINT "lignes_commande_achat_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "commandes_achat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_commande_achat" ADD CONSTRAINT "lignes_commande_achat_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_caisseSessionId_fkey" FOREIGN KEY ("caisseSessionId") REFERENCES "caisse_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_caissierId_fkey" FOREIGN KEY ("caissierId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ventes" ADD CONSTRAINT "ventes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_vente" ADD CONSTRAINT "lignes_vente_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "lots_produits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordonnances" ADD CONSTRAINT "ordonnances_venteId_fkey" FOREIGN KEY ("venteId") REFERENCES "ventes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caisse_sessions" ADD CONSTRAINT "caisse_sessions_pharmacieId_fkey" FOREIGN KEY ("pharmacieId") REFERENCES "pharmacies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caisse_sessions" ADD CONSTRAINT "caisse_sessions_ouvertParId_fkey" FOREIGN KEY ("ouvertParId") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caisse_sessions" ADD CONSTRAINT "caisse_sessions_fermeeParId_fkey" FOREIGN KEY ("fermeeParId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "caisse_transactions" ADD CONSTRAINT "caisse_transactions_caisseSessionId_fkey" FOREIGN KEY ("caisseSessionId") REFERENCES "caisse_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
