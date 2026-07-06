<div class="chapitre-titre-num">CHAPITRE 29</div>

# Transactions

## Objectifs pédagogiques

Comprendre pourquoi certaines opérations doivent réussir ou échouer **ensemble**, et maîtriser `commit`/`rollback`/`autoCommit` en JDBC.

## 29.1 Le problème : un virement bancaire en deux étapes

```java
// ❌ SANS transaction : deux opérations INDÉPENDANTES, dangereuses ensemble
public void virement(int compteSourceId, int compteDestId, double montant) throws SQLException {
    try (Connection connexion = ConfigDB.obtenirConnexion()) {
        try (PreparedStatement debit = connexion.prepareStatement(
                "UPDATE compte SET solde = solde - ? WHERE id = ?")) {
            debit.setDouble(1, montant);
            debit.setInt(2, compteSourceId);
            debit.executeUpdate(); // Débit réussi...
        }

        // 💥 Si le programme plante ICI (coupure réseau, panne serveur), l'argent a DISPARU :
        // débité d'un côté, jamais crédité de l'autre !

        try (PreparedStatement credit = connexion.prepareStatement(
                "UPDATE compte SET solde = solde + ? WHERE id = ?")) {
            credit.setDouble(1, montant);
            credit.setInt(2, compteDestId);
            credit.executeUpdate();
        }
    }
}
```

Sans transaction, chaque `executeUpdate()` est validé (*committed*) **immédiatement et indépendamment** par défaut (JDBC est en mode `autoCommit = true` par défaut). Une panne entre les deux opérations laisse la base dans un état **incohérent**.

## 29.2 START TRANSACTION / COMMIT / ROLLBACK

```java
public void virement(int compteSourceId, int compteDestId, double montant) throws SQLException {
    try (Connection connexion = ConfigDB.obtenirConnexion()) {
        connexion.setAutoCommit(false); // désactive la validation automatique : DÉBUT de la transaction

        try {
            try (PreparedStatement debit = connexion.prepareStatement(
                    "UPDATE compte SET solde = solde - ? WHERE id = ?")) {
                debit.setDouble(1, montant);
                debit.setInt(2, compteSourceId);
                debit.executeUpdate();
            }

            try (PreparedStatement credit = connexion.prepareStatement(
                    "UPDATE compte SET solde = solde + ? WHERE id = ?")) {
                credit.setDouble(1, montant);
                credit.setInt(2, compteDestId);
                credit.executeUpdate();
            }

            connexion.commit(); // les DEUX opérations sont validées ENSEMBLE, définitivement
        } catch (SQLException e) {
            connexion.rollback(); // ANNULE tout : comme si aucune des deux opérations n'avait eu lieu
            throw e;
        } finally {
            connexion.setAutoCommit(true); // restaure le comportement par défaut pour la suite
        }
    }
}
```

**Séquence — Transaction avec rollback**

```{.uml}
setAutoCommit(false)
      │
      ▼
  UPDATE débit ────► succès
      │
      ▼
  UPDATE crédit ───► 💥 SQLException (ex: contrainte violée)
      │
      ▼
  rollback() ─────► le débit est ANNULÉ AUSSI, la base revient à l'état d'avant
```

## 29.3 Les propriétés ACID (aperçu conceptuel)

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce que garantit une transaction</span>
- **A**tomicité : toutes les opérations réussissent, ou aucune n'est appliquée (le `rollback` de la section 29.2).
- **C**ohérence : la base reste dans un état valide (contraintes respectées) avant et après.
- **I**solation : deux transactions concurrentes ne se perturbent pas l'une l'autre.
- **D**urabilité : une fois validée (`commit`), une transaction résiste à une panne (les données sont réellement écrites sur disque).
</div>

## 29.4 Cas pratique : annulation d'une commande avec restitution de stock

```java
public void annulerCommande(int commandeId) throws SQLException {
    try (Connection connexion = ConfigDB.obtenirConnexion()) {
        connexion.setAutoCommit(false);

        try {
            // 1. Récupérer les lignes de la commande pour connaître les quantités à restituer
            List<LigneCommandeInfo> lignes = recupererLignes(connexion, commandeId);

            // 2. Restituer le stock pour chaque produit
            for (LigneCommandeInfo ligne : lignes) {
                try (PreparedStatement stmt = connexion.prepareStatement(
                        "UPDATE produit SET stock = stock + ? WHERE id = ?")) {
                    stmt.setInt(1, ligne.quantite());
                    stmt.setInt(2, ligne.produitId());
                    stmt.executeUpdate();
                }
            }

            // 3. Marquer la commande comme annulée
            try (PreparedStatement stmt = connexion.prepareStatement(
                    "UPDATE commande SET statut = 'ANNULEE' WHERE id = ?")) {
                stmt.setInt(1, commandeId);
                stmt.executeUpdate();
            }

            connexion.commit(); // TOUT réussit ensemble : restitution + changement de statut
        } catch (SQLException e) {
            connexion.rollback(); // en cas d'échec : NI le stock ni le statut ne changent
            throw e;
        } finally {
            connexion.setAutoCommit(true);
        }
    }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi cette opération DOIT être transactionnelle</span>
Sans transaction, une panne survenant après la restitution du stock d'un produit mais avant celle du second (s'il y en a plusieurs) laisserait le stock **partiellement** restitué, avec la commande toujours marquée active — un état incohérent difficile à détecter et corriger a posteriori. Le pattern exact appliqué ici est directement réutilisé dans le projet du chapitre 31.
</div>

## 29.5 Points de sauvegarde (Savepoint) — avancé

```java
connexion.setAutoCommit(false);
Savepoint pointDeSauvegarde = connexion.setSavepoint();

try {
    // ... opération risquée ...
} catch (SQLException e) {
    connexion.rollback(pointDeSauvegarde); // annule SEULEMENT depuis ce point, pas toute la transaction
}
// ... la transaction peut continuer avec d'autres opérations ...
connexion.commit();
```

Un `Savepoint` permet un rollback **partiel**, utile dans des transactions longues à plusieurs étapes indépendantes — une fonctionnalité avancée, à connaître de nom sans nécessairement l'utiliser systématiquement.

## 29.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier de remettre autoCommit à true après la transaction</span>
Si `setAutoCommit(true)` n'est pas restauré (section 29.2, bloc `finally`), la **même connexion**, si réutilisée ensuite (notamment via un pool de connexions, chapitre 31), resterait en mode transactionnel manuel — chaque opération suivante nécessiterait un `commit()` explicite, sinon elle ne serait **jamais** persistée, un bug très déroutant à diagnostiquer.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier le rollback dans le catch</span>
Sans `rollback()` explicite dans le bloc `catch`, une transaction ayant échoué en cours de route reste "ouverte" (ni validée ni annulée) jusqu'à la fermeture de la connexion — un état ambigu à éviter systématiquement en encadrant toujours `commit()`/`rollback()` d'un `try/catch/finally` complet, comme en section 29.2.
</div>

## 29.7 Résumé du chapitre

- Par défaut, JDBC valide chaque `executeUpdate()` immédiatement (`autoCommit = true`) — risqué pour des opérations qui doivent réussir ensemble.
- `setAutoCommit(false)` + `commit()`/`rollback()` garantissent l'atomicité d'un ensemble d'opérations SQL.
- Les propriétés **ACID** (Atomicité, Cohérence, Isolation, Durabilité) résument ce qu'une transaction garantit.
- Toujours encadrer une transaction d'un `try/catch/finally` complet, avec `rollback()` en cas d'erreur et restauration d'`autoCommit(true)` en fin de traitement.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 29.1</span>

Explique pourquoi l'opération suivante (transfert de stock entre deux entrepôts) doit être transactionnelle, et écris le code JDBC correspondant.
</div>

**Corrigé :** Sans transaction, une panne entre le décrément de l'entrepôt source et l'incrément de l'entrepôt destination ferait disparaître le stock transféré — exactement le même risque que le virement bancaire de la section 29.1.
```java
connexion.setAutoCommit(false);
try {
    // décrémenter stock entrepôt source
    // incrémenter stock entrepôt destination
    connexion.commit();
} catch (SQLException e) {
    connexion.rollback();
    throw e;
} finally {
    connexion.setAutoCommit(true);
}
```

*Chapitre suivant : l'architecture DAO, pour généraliser et organiser proprement tout ce que les chapitres 26 à 29 ont construit.*
