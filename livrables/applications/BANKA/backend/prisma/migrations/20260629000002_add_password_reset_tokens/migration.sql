-- Tokens de réinitialisation de mot de passe — usage unique, expiration 1h.
CREATE TABLE "password_reset_tokens" (
    "id"              TEXT        NOT NULL,
    "token"           TEXT        NOT NULL,
    "utilisateurId"   TEXT        NOT NULL,
    "expiresAt"       TIMESTAMP(3) NOT NULL,
    "used"            BOOLEAN     NOT NULL DEFAULT false,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "password_reset_tokens_utilisateurId_fkey"
        FOREIGN KEY ("utilisateurId") REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
CREATE INDEX "password_reset_tokens_utilisateurId_idx" ON "password_reset_tokens"("utilisateurId");
CREATE INDEX "password_reset_tokens_expiresAt_idx" ON "password_reset_tokens"("expiresAt");
