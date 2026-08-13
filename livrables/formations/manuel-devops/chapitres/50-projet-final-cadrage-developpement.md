<div class="chapitre-titre-num">CHAPITRE 50 · 🔴 PROFESSIONNEL</div>

# Projet final : cadrage, Git et développement

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Démarrer le projet fil rouge de ce manuel : créer le projet, initialiser Git/GitHub, développer une première version fonctionnelle, ajouter les premiers tests. Ce chapitre ouvre la Partie XV — sept chapitres qui remobilisent, dans l'ordre exact où elles ont été apprises, toutes les compétences construites depuis le chapitre 1. Rien de nouveau n'est introduit ici : chaque étape renvoie explicitement au chapitre qui l'a enseignée.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Tu es maintenant dans la même position qu'un développeur qui reçoit une mission réelle : "voici une idée d'application, mettez-la en production, proprement, de bout en bout." Contrairement à un simple tutoriel qui saute des étapes, ce projet applique <strong>chaque</strong> discipline de ce manuel — versionnage, conteneurisation, CI/CD, sécurité, observabilité — sans raccourci. Les six chapitres suivants poursuivent cette même application jusqu'à sa mise en production complète et documentée.
</div>

## 50.1 Le projet : GestionTâches

<div class="encadre retenir">
<span class="encadre-titre">📌 Cahier des charges minimal</span>
<strong>GestionTâches</strong> : une application de gestion de tâches simple — créer une tâche, la marquer terminée, la classer par catégorie, consulter la liste filtrée par statut. Stack : React (frontend) + Express/Node.js (API) + PostgreSQL (données) — exactement l'architecture déjà construite au chapitre 13 (section 13.3) et redéployée au chapitre 42 (Kubernetes), volontairement réutilisée pour que l'effort de ce projet final porte sur le <strong>processus</strong>, pas sur la découverte d'une nouvelle architecture.
</div>

**Pourquoi ce choix délibérément simple** : un projet fil rouge trop ambitieux techniquement détournerait l'attention de l'objectif réel de cette partie — appliquer intégralement la discipline DevOps à une application, aussi modeste soit-elle. La complexité de ce projet est dans le **processus complet**, pas dans les fonctionnalités.

## 50.2 Phase 1 — Créer le projet

```bash
mkdir gestiontaches && cd gestiontaches
mkdir api frontend
```

```json
// api/package.json
{
  "name": "gestiontaches-api",
  "version": "0.1.0",
  "scripts": {
    "start": "node index.js",
    "dev": "node --watch index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.19.0",
    "pg": "^8.12.0"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "supertest": "^7.0.0"
  }
}
```

```javascript
// api/index.js
const express = require('express');
const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.listen(port, () => console.log(`API GestionTâches démarrée sur le port ${port}`));

module.exports = app;
```

**Explication :** cette structure reprend directement le chapitre 22 (section 22.1) — un point de départ minimal mais réel, avec un endpoint `/health` dès la première ligne de code, jamais ajouté après coup.

## 50.3 Phase 2 — Git et GitHub

```bash
git init
```

```text
# .gitignore
node_modules/
.env
*.log
dist/
```

```bash
git add .
git commit -m "Initialisation du projet GestionTâches : structure api/frontend"
```

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Rappel direct des chapitres 7-9</span>
Ce premier commit suit exactement le chapitre 7 (section 7.2) ; le <code>.gitignore</code> est vérifié <strong>avant</strong> ce premier commit, jamais après (chapitre 18, section "Erreurs fréquentes", erreur n°1). La stratégie de branches choisie pour ce projet est GitHub Flow (chapitre 9, section 9.4) — une seule branche longue (<code>main</code>), des branches de fonctionnalité courtes, cohérente avec la nature de ce projet (une application web simple, sans version multiple à maintenir).
</div>

```bash
gh repo create gestiontaches --private --source=. --push
```

**Cas pratique DevOps :** cette commande (GitHub CLI, chapitre 8, section "FAQ") crée le dépôt distant et pousse le code initial en une seule étape.

## 50.4 Phase 3 — Développer l'application

```javascript
// api/db.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
module.exports = pool;
```

```javascript
// api/taches.routes.js
const express = require('express');
const router = express.Router();
const pool = require('./db');

router.get('/taches', async (req, res) => {
  const { statut } = req.query;
  const requete = statut
    ? 'SELECT * FROM taches WHERE statut = $1 ORDER BY cree_le DESC'
    : 'SELECT * FROM taches ORDER BY cree_le DESC';
  const resultat = await pool.query(requete, statut ? [statut] : []);
  res.json(resultat.rows);
});

router.post('/taches', async (req, res) => {
  const { titre, categorie } = req.body;
  if (!titre) return res.status(400).json({ erreur: 'Le titre est obligatoire' });
  const resultat = await pool.query(
    'INSERT INTO taches (titre, categorie, statut) VALUES ($1, $2, $3) RETURNING *',
    [titre, categorie || 'general', 'a_faire']
  );
  res.status(201).json(resultat.rows[0]);
});

router.patch('/taches/:id/terminer', async (req, res) => {
  const resultat = await pool.query(
    "UPDATE taches SET statut = 'terminee' WHERE id = $1 RETURNING *",
    [req.params.id]
  );
  if (resultat.rows.length === 0) return res.status(404).json({ erreur: 'Tâche introuvable' });
  res.json(resultat.rows[0]);
});

module.exports = router;
```

```sql
-- api/migrations/001_creer_table_taches.sql (chapitre 30)
CREATE TABLE taches (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    categorie VARCHAR(100) DEFAULT 'general',
    statut VARCHAR(20) DEFAULT 'a_faire',
    cree_le TIMESTAMP DEFAULT NOW()
);
```

**Explication :** cette API reprend exactement les pratiques déjà établies — validation basique (`titre` obligatoire, chapitre 23, section 23.4), requêtes paramétrées (`$1`, `$2`, jamais de concaténation directe, une protection de base contre l'injection SQL déjà implicite dans ce pattern, approfondie dans une perspective de sécurité plus large au chapitre 35), migration versionnée (chapitre 30, section 30.1).

```jsx
// frontend/src/App.jsx (extrait)
function App() {
  const [taches, setTaches] = useState([]);

  useEffect(() => {
    fetch('/api/taches').then(r => r.json()).then(setTaches);
  }, []);

  return (
    <div>
      <h1>GestionTâches</h1>
      <ListeTaches taches={taches} />
      <FormulaireNouvelleTache onAjout={(t) => setTaches([t, ...taches])} />
    </div>
  );
}
```

## 50.5 Phase 4 — Ajouter les tests

```javascript
// api/taches.test.js
const request = require('supertest');
const app = require('./index');

describe('POST /api/taches', () => {
  test('crée une tâche avec un titre valide', async () => {
    const reponse = await request(app).post('/api/taches').send({ titre: 'Écrire le rapport' });
    expect(reponse.statusCode).toBe(201);
    expect(reponse.body.statut).toBe('a_faire');
  });

  test('rejette une tâche sans titre', async () => {
    const reponse = await request(app).post('/api/taches').send({});
    expect(reponse.statusCode).toBe(400);
  });
});
```

**Explication :** ces tests reprennent exactement la structure du chapitre 23 (section 23.4, tests API avec `supertest`) — la pyramide des tests (chapitre 23, section 23.1) commence ici par le niveau le plus rapide et le plus simple à écrire.

## Atelier — Construire GestionTâches en local, de zéro

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 50.1 — Les quatre premières phases, exécutées réellement</span>

**Objectif** : avoir une première version fonctionnelle de GestionTâches, testée et versionnée, avant le chapitre 51.

**Étapes détaillées** :

1. Reproduis la structure de projet et le premier commit (sections 50.2-50.3).
2. Complète l'API avec les trois routes de la section 50.4, applique la migration sur une base PostgreSQL locale (chapitre 3).
3. Complète un frontend React minimal (formulaire d'ajout, liste filtrable par statut).
4. Écris au moins quatre tests API couvrant les cas de succès et d'échec (section 50.5).
5. `git commit` à chaque étape significative, avec des messages clairs (chapitre 7, section "Bonnes pratiques").

**Résultat attendu** : une application fonctionnelle en local, testée, avec un historique Git propre — la base sur laquelle les six chapitres suivants vont construire, chapitre après chapitre, jusqu'à la production complète.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Sauter l'écriture de tests "pour l'instant, on verra plus tard"</span>
Reporter les tests à une phase ultérieure du projet contredit directement le principe du "shift-left" (chapitre 2, section 2.5) — plus une application grandit sans tests, plus il devient coûteux de les ajouter rétroactivement.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Requêtes SQL concaténées plutôt que paramétrées</span>
Construire une requête SQL par concaténation de chaînes plutôt que par paramètres (`$1`, `$2` en PostgreSQL) ouvre la porte à l'injection SQL — une pratique à corriger dès l'écriture initiale, jamais après coup "quand le temps le permettra".
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Un `.gitignore` ajouté après le premier commit</span>
Rappel du chapitre 18 : vérifier `.gitignore` avant tout premier commit, jamais après — un `node_modules/` ou un `.env` commité par erreur au tout début du projet reste dans l'historique même après correction ultérieure (chapitre 7).
</div>

## En entreprise

**Réalité répandue** : un cadrage minimal mais réel (comme la section 50.1) précède presque toujours le premier commit d'un vrai projet — une entreprise ne commence jamais à coder sans une idée claire, même approximative, de ce qui doit être construit et pourquoi.

**Bonne pratique répandue** : les tests écrits dès les premières fonctionnalités (section 50.5), plutôt qu'ajoutés après coup, deviennent une habitude qui se maintient bien plus facilement tout au long du projet — le moment le plus facile d'instaurer une discipline de test est le tout début, jamais "plus tard une fois que ça sera stable".

**Erreur classique observée** : des projets réels du portefeuille de Jaslin (documentés dans l'historique de ce workspace) où des tests automatisés restent "toujours à zéro" des mois après le lancement — un rappel que ce chapitre applique dès la phase 1 une discipline souvent reportée indéfiniment en pratique réelle.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Comment démarres-tu un nouveau projet, de la première ligne de code au premier commit ?"**
Réponse attendue : structure de dossier claire, `.gitignore` vérifié avant tout commit, un premier commit avec un message descriptif, une stratégie de branches choisie consciemment (sections 50.2-50.3).

**Q2. "Pourquoi utiliser des requêtes SQL paramétrées plutôt que la concaténation de chaînes ?"**
Réponse attendue : la concaténation expose à l'injection SQL, une vulnérabilité de sécurité classique ; les requêtes paramétrées échappent automatiquement les valeurs, éliminant ce risque à la source (section 50.4, erreur fréquente n°2).

**Q3. "À quel moment d'un projet devrait-on commencer à écrire des tests ?"**
Réponse attendue : dès les premières fonctionnalités, jamais reporté — plus une application grandit sans tests, plus leur ajout rétroactif devient coûteux (section "Erreurs fréquentes", erreur n°1).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Les requêtes paramétrées (section 50.4) sont un réflexe de sécurité à intégrer dès la première ligne de code d'accès aux données, jamais une correction ajoutée après un audit — la sécurité par conception plutôt que la sécurité en rattrapage, le principe central du chapitre 35.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Un historique Git propre dès le départ (messages de commit clairs, chapitre 7) facilite considérablement la compréhension du projet par la suite, y compris par soi-même plusieurs mois plus tard.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
`ORDER BY cree_le DESC` (section 50.4) bénéficiera d'un index dès que le volume de données grandira (chapitre 47, section 47.3) — anticipé dès maintenant dans la conception, même si son ajout réel n'est pas encore nécessaire à ce stade précoce du projet.
</div>

## Résumé du chapitre

- Le projet fil rouge, GestionTâches, réutilise délibérément une architecture simple déjà maîtrisée, pour concentrer l'effort sur le processus DevOps complet.
- Phase 1 : structure de projet minimale mais réelle, avec un endpoint `/health` dès le départ.
- Phase 2 : Git initialisé avec `.gitignore` vérifié avant le premier commit, GitHub Flow comme stratégie de branches.
- Phase 3 : une API avec requêtes paramétrées et une migration versionnée, un frontend React minimal.
- Phase 4 : des tests API écrits dès les premières fonctionnalités, jamais reportés.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le `.gitignore` d'un nouveau projet devrait être vérifié :
   - a) Après plusieurs commits, une fois le projet stabilisé
   - b) Avant le tout premier commit
   - c) Uniquement en fin de projet
   - d) Jamais, ce n'est pas nécessaire

2. Une requête SQL paramétrée (`$1`, `$2`) plutôt que concaténée protège principalement contre :
   - a) Les pannes réseau
   - b) L'injection SQL
   - c) Les erreurs de syntaxe JavaScript
   - d) La lenteur des requêtes

3. La stratégie de branches choisie pour GestionTâches est :
   - a) Git Flow
   - b) GitHub Flow
   - c) Aucune stratégie
   - d) Trunk-based development strict

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Les tests devraient être écrits uniquement après que toutes les fonctionnalités soient terminées. — **Faux** (section "Erreurs fréquentes", erreur n°1).
2. GestionTâches réutilise volontairement une architecture déjà connue pour ce manuel. — **Vrai** (section 50.1).
3. Une requête SQL construite par concaténation de chaînes est une pratique sûre recommandée. — **Faux** (section "Erreurs fréquentes", erreur n°2).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 50.1</span>

Ajoute une route `DELETE /api/taches/:id` à l'API de la section 50.4, en respectant les mêmes conventions (requête paramétrée, gestion du cas où la tâche n'existe pas) que les routes déjà écrites.
</div>

**Corrigé :**
```javascript
router.delete('/taches/:id', async (req, res) => {
  const resultat = await pool.query('DELETE FROM taches WHERE id = $1 RETURNING *', [req.params.id]);
  if (resultat.rows.length === 0) return res.status(404).json({ erreur: 'Tâche introuvable' });
  res.status(204).send();
});
```
Cette route reprend la même convention que `PATCH /taches/:id/terminer` (requête paramétrée, vérification `rows.length === 0` pour un 404 explicite plutôt qu'un succès silencieux sur une ressource inexistante) — la cohérence de style à travers toute une API facilite sa maintenance future.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ J'ai créé la structure de projet GestionTâches (api/frontend).</li>
<li>☐ J'ai initialisé Git avec un `.gitignore` vérifié avant le premier commit.</li>
<li>☐ J'ai créé le dépôt GitHub et poussé le code initial.</li>
<li>☐ J'ai développé une API fonctionnelle avec requêtes paramétrées et migration versionnée.</li>
<li>☐ J'ai développé un frontend React minimal connecté à cette API.</li>
<li>☐ J'ai écrit des tests API couvrant au moins un cas de succès et un cas d'échec par route.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il suivre exactement GestionTâches, ou puis-je utiliser mon propre projet pour cette partie ?</dt>
<dd>Le principe pédagogique de cette partie (le processus complet, pas les fonctionnalités précises) s'applique à n'importe quel projet personnel simple — GestionTâches sert de fil conducteur cohérent pour ce manuel, mais chaque étape se transpose directement à un autre projet de complexité comparable.</dd>

<dt>Pourquoi ne pas ajouter l'authentification dès cette phase ?</dt>
<dd>Pour garder le projet volontairement simple (section 50.1) — l'authentification ajouterait une complexité qui détournerait l'attention du processus DevOps, l'objectif réel de cette partie. Elle pourrait être ajoutée comme extension une fois les sept chapitres terminés.</dd>

<dt>Combien de tests sont "suffisants" à cette étape ?</dt>
<dd>Il n'existe pas de nombre magique — l'objectif de cette phase est d'établir la discipline et la structure de test (chapitre 23), pas une couverture exhaustive immédiate, qui grandira naturellement au fil des chapitres suivants.</dd>
</dl>

## Références et pour aller plus loin

- Récapitulatif des chapitres mobilisés dans ce chapitre : 2, 3, 7, 8, 9, 18, 22, 23, 30, 35.

*Chapitre suivant : projet final, conteneurisation — Dockerfile et Docker Compose pour GestionTâches, phases 5 et 6 du projet.*
