-- Migration: add_indexes_and_security
-- Ajout de tous les index manquants sur FK et colonnes filtrées fréquemment
-- Critique pour la performance sous charge concurrente (N utilisateurs simultanés)

-- ── Utilisateurs ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "utilisateurs_agenceId_idx" ON "utilisateurs"("agenceId");
CREATE INDEX IF NOT EXISTS "utilisateurs_role_actif_idx" ON "utilisateurs"("role", "actif");

-- ── Comptes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "comptes_clientId_idx" ON "comptes"("clientId");
CREATE INDEX IF NOT EXISTS "comptes_agenceId_idx" ON "comptes"("agenceId");
CREATE INDEX IF NOT EXISTS "comptes_statut_idx" ON "comptes"("statut");
CREATE INDEX IF NOT EXISTS "comptes_agenceId_statut_idx" ON "comptes"("agenceId", "statut");

-- ── Sessions caisse ───────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "sessions_caisse_agenceId_statut_idx" ON "sessions_caisse"("agenceId", "statut");

-- ── Transactions (les plus critiques pour la perf bancaire) ──────────────────
CREATE INDEX IF NOT EXISTS "transactions_compteDebitId_idx" ON "transactions"("compteDebitId");
CREATE INDEX IF NOT EXISTS "transactions_compteCreditId_idx" ON "transactions"("compteCreditId");
CREATE INDEX IF NOT EXISTS "transactions_statut_idx" ON "transactions"("statut");
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions"("type");
CREATE INDEX IF NOT EXISTS "transactions_creeParId_idx" ON "transactions"("creeParId");
CREATE INDEX IF NOT EXISTS "transactions_sessionId_idx" ON "transactions"("sessionId");
CREATE INDEX IF NOT EXISTS "transactions_createdAt_idx" ON "transactions"("createdAt");
CREATE INDEX IF NOT EXISTS "transactions_compteDebitId_statut_idx" ON "transactions"("compteDebitId", "statut");
CREATE INDEX IF NOT EXISTS "transactions_compteCreditId_statut_idx" ON "transactions"("compteCreditId", "statut");
CREATE INDEX IF NOT EXISTS "transactions_statut_createdAt_idx" ON "transactions"("statut", "createdAt");
CREATE INDEX IF NOT EXISTS "transactions_type_statut_createdAt_idx" ON "transactions"("type", "statut", "createdAt");

-- ── Prêts ─────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "prets_clientId_idx" ON "prets"("clientId");
CREATE INDEX IF NOT EXISTS "prets_agenceId_idx" ON "prets"("agenceId");
CREATE INDEX IF NOT EXISTS "prets_statut_idx" ON "prets"("statut");
CREATE INDEX IF NOT EXISTS "prets_agentCreditId_idx" ON "prets"("agentCreditId");
CREATE INDEX IF NOT EXISTS "prets_agenceId_statut_idx" ON "prets"("agenceId", "statut");

-- ── Lignes de prêt ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "lignes_pret_pretId_idx" ON "lignes_pret"("pretId");
CREATE INDEX IF NOT EXISTS "lignes_pret_statut_idx" ON "lignes_pret"("statut");
CREATE INDEX IF NOT EXISTS "lignes_pret_dateEcheance_statut_idx" ON "lignes_pret"("dateEcheance", "statut");

-- ── Remboursements ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "remboursements_pret_pretId_idx" ON "remboursements_pret"("pretId");
CREATE INDEX IF NOT EXISTS "remboursements_pret_date_idx" ON "remboursements_pret"("date");

-- ── Écritures comptables (groupBy pour bilan/résultat) ───────────────────────
CREATE INDEX IF NOT EXISTS "ecritures_comptables_compteDebitId_idx" ON "ecritures_comptables"("compteDebitId");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_compteCreditId_idx" ON "ecritures_comptables"("compteCreditId");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_date_idx" ON "ecritures_comptables"("date");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_transactionId_idx" ON "ecritures_comptables"("transactionId");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_compteDebitId_date_idx" ON "ecritures_comptables"("compteDebitId", "date");
CREATE INDEX IF NOT EXISTS "ecritures_comptables_compteCreditId_date_idx" ON "ecritures_comptables"("compteCreditId", "date");

-- ── Mandats ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "mandats_compte_compteId_idx" ON "mandats_compte"("compteId");
CREATE INDEX IF NOT EXISTS "mandats_compte_mandataireId_idx" ON "mandats_compte"("mandataireId");
CREATE INDEX IF NOT EXISTS "mandats_compte_compteId_actif_idx" ON "mandats_compte"("compteId", "actif");

-- ── Garanties ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "garanties_pretId_idx" ON "garanties"("pretId");
CREATE INDEX IF NOT EXISTS "garanties_statut_idx" ON "garanties"("statut");

-- ── Épargnes programmées ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "epargnes_programmees_actif_prochainVersement_idx" ON "epargnes_programmees"("actif", "prochainVersement");
CREATE INDEX IF NOT EXISTS "epargnes_programmees_compteSourceId_idx" ON "epargnes_programmees"("compteSourceId");
CREATE INDEX IF NOT EXISTS "epargnes_programmees_compteDestId_idx" ON "epargnes_programmees"("compteDestId");

-- ── RH ────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "employes_statut_idx" ON "employes"("statut");
CREATE INDEX IF NOT EXISTS "employes_posteId_idx" ON "employes"("posteId");
CREATE INDEX IF NOT EXISTS "contrats_employeId_idx" ON "contrats"("employeId");
CREATE INDEX IF NOT EXISTS "contrats_statut_idx" ON "contrats"("statut");
CREATE INDEX IF NOT EXISTS "conges_employeId_idx" ON "conges"("employeId");
CREATE INDEX IF NOT EXISTS "conges_statut_idx" ON "conges"("statut");
CREATE INDEX IF NOT EXISTS "fiches_paie_statut_idx" ON "fiches_paie"("statut");
CREATE INDEX IF NOT EXISTS "fiches_paie_periode_idx" ON "fiches_paie"("periode");
CREATE INDEX IF NOT EXISTS "avances_salaire_employeId_idx" ON "avances_salaire"("employeId");
CREATE INDEX IF NOT EXISTS "avances_salaire_statut_idx" ON "avances_salaire"("statut");
CREATE INDEX IF NOT EXISTS "avances_salaire_periodeDeduction_idx" ON "avances_salaire"("periodeDeduction");
CREATE INDEX IF NOT EXISTS "elements_variables_employeId_idx" ON "elements_variables"("employeId");
CREATE INDEX IF NOT EXISTS "elements_variables_periode_idx" ON "elements_variables"("periode");
CREATE INDEX IF NOT EXISTS "elements_variables_employeId_periode_idx" ON "elements_variables"("employeId", "periode");

-- ── Audit & sécurité ──────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "audit_logs_utilisateurId_idx" ON "audit_logs"("utilisateurId");
CREATE INDEX IF NOT EXISTS "audit_logs_table_action_idx" ON "audit_logs"("table", "action");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX IF NOT EXISTS "audit_logs_table_createdAt_idx" ON "audit_logs"("table", "createdAt");
CREATE INDEX IF NOT EXISTS "refresh_tokens_utilisateurId_idx" ON "refresh_tokens"("utilisateurId");
CREATE INDEX IF NOT EXISTS "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");
