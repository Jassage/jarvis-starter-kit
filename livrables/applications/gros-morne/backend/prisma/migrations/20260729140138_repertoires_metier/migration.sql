-- CreateEnum
CREATE TYPE "CategorieEconomique" AS ENUM ('COMMERCE', 'CONSTRUCTION', 'AGROALIMENTAIRE', 'ARTISANAT', 'SERVICES', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeEcole" AS ENUM ('LYCEE', 'COLLEGE', 'UNIVERSITE', 'CENTRE_FORMATION', 'BIBLIOTHEQUE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeSante" AS ENUM ('HOPITAL', 'CENTRE_SANTE', 'PHARMACIE', 'CLINIQUE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TypeServiceMunicipal" AS ENUM ('MAIRIE', 'PROTECTION_CIVILE', 'POLICE', 'SANTE', 'EAU', 'ELECTRICITE', 'JUSTICE', 'AUTRE');

-- CreateEnum
CREATE TYPE "CategorieAnnuaire" AS ENUM ('BANQUE', 'EGLISE', 'ONG', 'STATION_SERVICE', 'BOUTIQUE', 'GARAGE', 'PROFESSIONNEL', 'TRANSPORT', 'AUTRE');

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieEconomique" NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses_traductions" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businesses_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "nombreChambres" INTEGER,
    "servicesDisponibles" TEXT[],
    "prixMin" INTEGER,
    "prixMax" INTEGER,
    "adresse" TEXT,
    "telephone" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotels_traductions" (
    "id" TEXT NOT NULL,
    "hotelId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotels_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "cuisine" TEXT,
    "prix" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "horaires" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants_traductions" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurants_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeEcole" NOT NULL,
    "directeur" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "nombreEleves" INTEGER,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schools_traductions" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "schools_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facilities" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeSante" NOT NULL,
    "services" TEXT[],
    "medecins" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "urgence" BOOLEAN NOT NULL DEFAULT false,
    "horaires" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_facilities_traductions" (
    "id" TEXT NOT NULL,
    "healthFacilityId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "health_facilities_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associations" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "president" TEXT,
    "domainesAction" TEXT[],
    "adresse" TEXT,
    "telephone" TEXT,
    "email" TEXT,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "associations_traductions" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "mission" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "associations_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipal_services" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeServiceMunicipal" NOT NULL,
    "responsable" TEXT,
    "adresse" TEXT,
    "telephone" TEXT,
    "horaires" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipal_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipal_services_traductions" (
    "id" TEXT NOT NULL,
    "municipalServiceId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "presentation" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "municipal_services_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annuaire_entries" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "categorie" "CategorieAnnuaire" NOT NULL,
    "adresse" TEXT,
    "telephone" TEXT,
    "whatsapp" TEXT,
    "email" TEXT,
    "siteWeb" TEXT,
    "horaires" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "statutPublication" "StatutPublication" NOT NULL DEFAULT 'BROUILLON',
    "photoId" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annuaire_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "annuaire_entries_traductions" (
    "id" TEXT NOT NULL,
    "annuaireEntryId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "description" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "annuaire_entries_traductions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "businesses_photoId_idx" ON "businesses"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_traductions_businessId_locale_key" ON "businesses_traductions"("businessId", "locale");

-- CreateIndex
CREATE INDEX "hotels_photoId_idx" ON "hotels"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "hotels_traductions_hotelId_locale_key" ON "hotels_traductions"("hotelId", "locale");

-- CreateIndex
CREATE INDEX "restaurants_photoId_idx" ON "restaurants"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_traductions_restaurantId_locale_key" ON "restaurants_traductions"("restaurantId", "locale");

-- CreateIndex
CREATE INDEX "schools_photoId_idx" ON "schools"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "schools_traductions_schoolId_locale_key" ON "schools_traductions"("schoolId", "locale");

-- CreateIndex
CREATE INDEX "health_facilities_photoId_idx" ON "health_facilities"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "health_facilities_traductions_healthFacilityId_locale_key" ON "health_facilities_traductions"("healthFacilityId", "locale");

-- CreateIndex
CREATE INDEX "associations_photoId_idx" ON "associations"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "associations_traductions_associationId_locale_key" ON "associations_traductions"("associationId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "municipal_services_traductions_municipalServiceId_locale_key" ON "municipal_services_traductions"("municipalServiceId", "locale");

-- CreateIndex
CREATE INDEX "annuaire_entries_photoId_idx" ON "annuaire_entries"("photoId");

-- CreateIndex
CREATE UNIQUE INDEX "annuaire_entries_traductions_annuaireEntryId_locale_key" ON "annuaire_entries_traductions"("annuaireEntryId", "locale");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "businesses_traductions" ADD CONSTRAINT "businesses_traductions_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels" ADD CONSTRAINT "hotels_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotels_traductions" ADD CONSTRAINT "hotels_traductions_hotelId_fkey" FOREIGN KEY ("hotelId") REFERENCES "hotels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurants" ADD CONSTRAINT "restaurants_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaurants_traductions" ADD CONSTRAINT "restaurants_traductions_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools" ADD CONSTRAINT "schools_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schools_traductions" ADD CONSTRAINT "schools_traductions_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_facilities" ADD CONSTRAINT "health_facilities_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_facilities_traductions" ADD CONSTRAINT "health_facilities_traductions_healthFacilityId_fkey" FOREIGN KEY ("healthFacilityId") REFERENCES "health_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associations" ADD CONSTRAINT "associations_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "associations_traductions" ADD CONSTRAINT "associations_traductions_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipal_services_traductions" ADD CONSTRAINT "municipal_services_traductions_municipalServiceId_fkey" FOREIGN KEY ("municipalServiceId") REFERENCES "municipal_services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annuaire_entries" ADD CONSTRAINT "annuaire_entries_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "medias"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "annuaire_entries_traductions" ADD CONSTRAINT "annuaire_entries_traductions_annuaireEntryId_fkey" FOREIGN KEY ("annuaireEntryId") REFERENCES "annuaire_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
