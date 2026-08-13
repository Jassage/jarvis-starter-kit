<div class="chapitre-titre-num">CHAPITRE 30 · 🟡 INTERMÉDIAIRE</div>

# Les bases de données en DevOps

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre les migrations de schéma, la persistance des données dans un monde de conteneurs jetables (chapitre 11), et la compatibilité entre versions déjà évoquée à plusieurs reprises (chapitres 28 et 29) — puis construire un pipeline complet avec PostgreSQL. Ce chapitre ouvre la Partie IX en donnant un contenu technique complet à des principes déjà mentionnés en passant.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le code d'une application se redéploie facilement — une image Docker versionnée (chapitre 14), remplacée en quelques secondes. Une base de données ne fonctionne pas de la même façon : on ne "redéploie" jamais des données, on les fait évoluer avec prudence, sans jamais pouvoir se permettre de les perdre. Ce chapitre traite les bases de données comme la partie du système qui exige la discipline la plus stricte de tout ce manuel.
</div>

## 30.1 Migrations : faire évoluer un schéma sans perdre de données

<div class="encadre retenir">
<span class="encadre-titre">📌 Qu'est-ce qu'une migration</span>
Une <strong>migration</strong> est un script versionné qui modifie la structure d'une base de données (ajouter une table, une colonne, un index) de façon <strong>reproductible</strong> et <strong>ordonnée</strong> — exactement le même principe de reproductibilité que Git (chapitre 7) applique au code, appliqué ici au schéma de données.
</div>

```sql
-- migrations/001_creer_table_utilisateurs.sql
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    cree_le TIMESTAMP DEFAULT NOW()
);
```

```sql
-- migrations/002_ajouter_colonne_nom.sql
ALTER TABLE utilisateurs ADD COLUMN nom VARCHAR(255);
```

```bash
# Avec un outil de migration (exemple générique, principe commun à tous)
npx node-pg-migrate up
```

**Explication :** chaque fichier de migration est numéroté et exécuté **dans l'ordre**, une seule fois — l'outil de migration garde en base une table de suivi (souvent `migrations` ou `schema_migrations`) qui enregistre quelles migrations ont déjà été appliquées, pour ne jamais rejouer une migration déjà exécutée.

<div class="encadre astuce">
<span class="encadre-titre">💡 Migrations versionnées dans Git, comme le code</span>
Les fichiers de migration vivent dans le même dépôt Git (chapitre 7) que le code applicatif — un changement de schéma qui accompagne le code qui en dépend est déployé **ensemble**, dans le même commit, jamais séparément ni oublié.
</div>

## 30.2 Migrations rétrocompatibles : le principe central du chapitre 29 approfondi

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Le pattern "expand and contract"</span>
Pour rendre une migration compatible avec un Rolling deployment ou un rollback (chapitres 28-29), un changement de schéma se déroule idéalement en <strong>plusieurs étapes séparées</strong> plutôt qu'en une seule :

1. <strong>Expand</strong> : ajouter la nouvelle structure (une colonne, une table) sans rien casser de l'existant — l'ancienne ET la nouvelle version du code fonctionnent avec ce schéma.
2. <strong>Migrate</strong> : déployer le nouveau code qui utilise la nouvelle structure, migrer progressivement les données existantes.
3. <strong>Contract</strong> : une fois la nouvelle version stable et confirmée (souvent après plusieurs jours), supprimer l'ancienne structure devenue inutile, dans une migration séparée et ultérieure.
</div>

```sql
-- Étape 1 (Expand) : ajouter sans casser l'existant
ALTER TABLE utilisateurs ADD COLUMN email_verifie BOOLEAN DEFAULT FALSE;

-- Étape 3 (Contract), dans une migration séparée bien plus tard :
-- ALTER TABLE utilisateurs DROP COLUMN ancien_champ_obsolete;
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ce que ce pattern évite précisément</span>
Sans cette séparation en étapes, une migration qui renomme ou supprime directement une colonne casse immédiatement toute version du code (ancienne ou nouvelle) qui référence encore l'ancien nom — exactement le risque identifié au chapitre 29 (section 29.5, exercice 29.1) lors d'un rollback.
</div>

## 30.3 Persistance des données avec des conteneurs jetables

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Rappel direct du chapitre 11</span>
Le principe des volumes Docker (chapitre 11, section 11.4) est ce qui rend possible tout ce chapitre : un conteneur de base de données peut être détruit et recréé (mise à jour de version, redémarrage) sans jamais perdre les données, tant qu'elles vivent dans un volume nommé, jamais dans le système de fichiers éphémère du conteneur lui-même.
</div>

```yaml
services:
  db:
    image: postgres:16
    volumes:
      - donnees-production:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]

volumes:
  donnees-production:
```

## 30.4 Compatibilité entre versions

<div class="encadre retenir">
<span class="encadre-titre">📌 Trois niveaux de compatibilité à surveiller</span>
La version du <strong>moteur de base de données</strong> (PostgreSQL 15 vers 16, par exemple) doit être testée avant une montée de version en production — certaines fonctionnalités changent de comportement entre versions majeures. La version du <strong>schéma</strong> doit rester compatible avec toutes les versions de code encore potentiellement en cours d'exécution (section 30.2). La version du <strong>driver/ORM</strong> côté application doit rester compatible avec la version du moteur utilisée.
</div>

```bash
# Vérifier la version actuellement utilisée avant toute montée de version
docker exec ma-base psql -U app -c "SELECT version();"
```

## 30.5 Pipeline CI/CD avec PostgreSQL

```yaml
jobs:
  test-avec-migrations:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 5s
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - name: Appliquer les migrations
        run: npx node-pg-migrate up
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test_db
      - name: Exécuter les tests
        run: npm test
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test_db
```

**Explication :** ce job (déjà esquissé au chapitre 23, section 23.6) applique désormais explicitement les migrations **avant** les tests — vérifiant en CI, à chaque changement, que les migrations elles-mêmes s'exécutent sans erreur sur une base fraîche, exactement les conditions qu'un vrai déploiement rencontrera.

## Atelier — Migration expand/contract sur l'architecture du chapitre 13

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 30.1 — Une migration en trois étapes, sans jamais casser le service</span>

**Objectif** : appliquer concrètement le pattern expand/migrate/contract sur une table existante.

**Étapes détaillées** :

1. Sur l'architecture PostgreSQL du chapitre 13, crée une table simple avec une colonne `statut` de type texte libre.
2. **Expand** : ajoute une nouvelle colonne `statut_normalise` (type énuméré ou contraint), sans toucher à `statut`.
3. **Migrate** : écris un script qui remplit `statut_normalise` à partir des valeurs existantes de `statut`, déploie une version du code qui écrit dans les deux colonnes simultanément.
4. Vérifie que l'ancienne version du code (qui ne connaît que `statut`) continue de fonctionner sans erreur pendant cette période de transition.
5. **Contract** (dans un atelier séparé, après une pause simulant "plusieurs jours de stabilité") : supprime la colonne `statut` devenue obsolète.

**Résultat attendu** : la démonstration concrète qu'un changement de schéma peut se dérouler sans jamais casser une version de code encore en cours d'exécution, contrairement à une migration en une seule étape brutale.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Une migration destructive en une seule étape</span>
Renommer ou supprimer directement une colonne utilisée par le code en production, sans passer par le pattern expand/contract (section 30.2), casse potentiellement toute version du code encore active pendant un Rolling deployment ou un rollback.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Tester les migrations uniquement en local, jamais en CI</span>
Une migration qui fonctionne sur la base de développement locale (avec ses données spécifiques) peut échouer sur une base fraîche ou avec un volume de données différent — le test en CI (section 30.5) sur une base neuve à chaque exécution détecte ce type de problème avant la production.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Migrations non versionnées dans Git avec le code</span>
Des migrations appliquées manuellement, jamais commitées, perdent toute traçabilité et toute reproductibilité — exactement l'anti-pattern que Git (chapitre 7) et l'Infrastructure as Code (Partie XII) cherchent à éliminer partout ailleurs dans ce manuel.
</div>

## En entreprise

**Réalité répandue** : la plupart des frameworks modernes (Prisma, TypeORM, Django, Rails, Laravel) intègrent un système de migration natif suivant les principes de ce chapitre — rarement besoin de construire ce mécanisme depuis zéro, mais essentiel de comprendre son fonctionnement pour l'utiliser correctement et diagnostiquer un problème.

**Bonne pratique répandue** : les migrations les plus risquées (changement de type de colonne sur une très grande table, par exemple) sont testées sur une copie de la production à l'échelle réelle avant d'être appliquées en production — une simple migration testée sur une petite base de développement peut se comporter très différemment sur des millions de lignes.

**Erreur classique observée** : une migration qui verrouille une table entière pendant plusieurs minutes sur une grande table de production, bloquant toute l'application le temps de son exécution — un risque de performance qui dépasse la seule question de compatibilité, approfondi indirectement au chapitre 47 (Performance).

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Explique le pattern expand/contract pour les migrations de base de données."**
Réponse attendue : ajouter la nouvelle structure sans casser l'ancienne (expand), migrer progressivement le code et les données (migrate), puis supprimer l'ancienne structure une fois la stabilité confirmée (contract) — permettant une compatibilité pendant toute la transition (section 30.2).

**Q2. "Pourquoi tester les migrations dans le pipeline CI, sur une base fraîche à chaque exécution ?"**
Réponse attendue : une base de développement locale accumule un état spécifique qui peut masquer des problèmes qu'une base neuve révélerait immédiatement, exactement les conditions d'un vrai déploiement (section 30.5, erreur fréquente n°2).

**Q3. "Comment les volumes Docker permettent-ils la persistance des données malgré des conteneurs jetables ?"**
Réponse attendue : les données vivent dans un volume nommé, indépendant du cycle de vie du conteneur — un conteneur peut être détruit et recréé sans perte de données, tant que le volume reste intact (section 30.3, rappel du chapitre 11).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les identifiants de connexion à la base de données suivent strictement la doctrine du chapitre 25 — jamais en clair dans un script de migration versionné, toujours via une variable d'environnement injectée au moment de l'exécution.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Nomme chaque fichier de migration de façon descriptive et numérotée (`003_ajouter_index_email.sql`, jamais `migration_finale_v2.sql`) — un historique de migrations lisible facilite grandement le diagnostic d'un problème de schéma des mois plus tard.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Une migration qui ajoute un index sur une grande table peut verrouiller cette table pendant l'opération — vérifier, selon le moteur utilisé, les options de création d'index sans verrouillage complet (`CREATE INDEX CONCURRENTLY` sur PostgreSQL, par exemple) avant d'appliquer une telle migration en production.
</div>

## Résumé du chapitre

- Les migrations font évoluer un schéma de façon reproductible et ordonnée, versionnées dans Git avec le code qui en dépend.
- Le pattern expand/migrate/contract permet des changements de schéma compatibles avec un Rolling deployment ou un rollback.
- Les volumes Docker rendent les données persistantes malgré des conteneurs jetables.
- La compatibilité entre versions concerne le moteur de base de données, le schéma, et le driver/ORM applicatif.
- Tester les migrations en CI, sur une base fraîche, détecte des problèmes qu'un environnement de développement établi peut masquer.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le pattern "expand and contract" sert à :
   - a) Accélérer les migrations
   - b) Rendre un changement de schéma compatible avec plusieurs versions de code coexistant temporairement
   - c) Supprimer toutes les anciennes données
   - d) Remplacer les tests automatisés

2. Les données d'une base de données conteneurisée persistent grâce à :
   - a) La mémoire du conteneur
   - b) Un volume Docker nommé, indépendant du cycle de vie du conteneur
   - c) Le cache du navigateur
   - d) Rien, elles sont automatiquement perdues

3. Tester les migrations en CI, sur une base fraîche, permet de :
   - a) Accélérer le déploiement uniquement
   - b) Détecter des problèmes qu'une base de développement établie pourrait masquer
   - c) Remplacer entièrement les migrations en production
   - d) Éviter tout besoin de sauvegarde

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Renommer directement une colonne utilisée en production, en une seule migration, est toujours sans risque. — **Faux** (section 30.2 et erreur fréquente n°1).
2. Les fichiers de migration devraient être versionnés dans Git avec le code applicatif. — **Vrai** (section 30.1).
3. Une migration qui fonctionne en local fonctionnera nécessairement de façon identique en production à grande échelle. — **Faux** (section "En entreprise").

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 30.1</span>

Une équipe doit renommer la colonne `nom_complet` en `nom_affiche` sur une table utilisée par une application en Rolling deployment (chapitre 28). Décris les étapes en pattern expand/contract.
</div>

**Corrigé :** (1) **Expand** : ajouter la nouvelle colonne `nom_affiche`, sans toucher à `nom_complet` ; (2) **Migrate** : un script copie les valeurs existantes de `nom_complet` vers `nom_affiche`, et le nouveau code est déployé pour écrire simultanément dans les deux colonnes (garantissant que les deux restent synchronisées pendant que l'ancienne et la nouvelle version du code coexistent en Rolling deployment) ; (3) une fois toutes les instances mises à jour vers la version qui utilise `nom_affiche` exclusivement en lecture, et après une période de stabilité confirmée, **Contract** : une migration séparée supprime `nom_complet`, devenue inutile.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire et exécuter des migrations versionnées.</li>
<li>☐ Je comprends et sais appliquer le pattern expand/migrate/contract.</li>
<li>☐ Je sais pourquoi les volumes Docker sont indispensables à la persistance des données.</li>
<li>☐ Je surveille les trois niveaux de compatibilité (moteur, schéma, driver/ORM) avant une montée de version.</li>
<li>☐ J'ai intégré les migrations dans le pipeline CI, testées sur une base fraîche à chaque exécution.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il toujours écrire une migration "down" (annulation) pour chaque migration ?</dt>
<dd>C'est recommandé pour les changements réversibles, mais certaines migrations (une suppression de données, par exemple) ne sont tout simplement pas annulables techniquement — dans ces cas, le pattern expand/contract (section 30.2) est la vraie protection, pas une hypothétique annulation automatique.</dd>

<dt>Combien de temps attendre entre "expand/migrate" et "contract" ?</dt>
<dd>Il n'existe pas de règle universelle — assez longtemps pour être certain qu'aucune ancienne version du code ne tourne plus nulle part (y compris d'éventuelles instances de rollback potentiel, chapitre 29), souvent plusieurs jours à quelques semaines selon le contexte et la criticité.</dd>

<dt>Les migrations s'appliquent-elles automatiquement au déploiement, ou faut-il une étape manuelle ?</dt>
<dd>Les deux approches existent — une étape automatique dans le pipeline de déploiement (chapitre 27) est courante pour des migrations simples et testées ; une étape manuelle ou semi-automatique (avec approbation) est parfois préférée pour des migrations jugées particulièrement risquées.</dd>
</dl>

## Références et pour aller plus loin

- Martin Fowler — "Evolutionary Database Design" (référence sur les migrations et le pattern expand/contract) : [https://martinfowler.com/articles/evodb.html](https://martinfowler.com/articles/evodb.html)
- Documentation officielle PostgreSQL — `CREATE INDEX CONCURRENTLY` : [https://www.postgresql.org/docs/current/sql-createindex.html](https://www.postgresql.org/docs/current/sql-createindex.html)

*Chapitre suivant : backup et restauration — une vraie stratégie de sauvegarde pour l'application, la base de données, les volumes et la configuration construits depuis le début de ce manuel.*
