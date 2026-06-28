-- Migration: add_2fa
-- Ajout des champs 2FA (TOTP) sur la table utilisateurs

ALTER TABLE "utilisateurs" ADD COLUMN "twoFactorSecret"  TEXT;
ALTER TABLE "utilisateurs" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
