# /commit

> Commande pour committer les changements du workspace dans git.

---

## Mission

Quand je lance `/commit`, exécute la séquence suivante :

### Étape 1 : État du repo

Lance en parallèle :
- `git status` (pour voir les fichiers modifiés/non suivis)
- `git diff` (changements non indexés)
- `git diff --staged` (changements déjà indexés)

Si le dossier n'est pas un dépôt git, dis-le moi et propose `git init` avant de continuer.

### Étape 2 : Vérifications de sécurité

- Vérifie qu'aucun fichier de secret (`.env`, `*.key`, `*.pem`, etc.) n'est sur le point d'être commit. Si c'est le cas, alerte-moi avant de continuer, ces fichiers doivent rester ignorés via `.gitignore`.
- Ignore les fichiers qui semblent être des artefacts temporaires ou de build.

### Étape 3 : Proposer un message de commit

Analyse les changements et rédige un message de commit court :
- Une ligne de résumé (en français, à l'impératif, sans tiret long)
- Si utile, un corps avec 1 à 3 bullet points expliquant le "pourquoi"

Présente-moi le message proposé et la liste des fichiers qui seraient ajoutés au commit.

### Étape 4 : Exécuter

Une fois validé :
1. `git add` sur les fichiers concernés (jamais `git add -A` à l'aveugle si des fichiers suspects sont présents)
2. `git commit -m "..."` avec le message validé
3. `git status` pour confirmer

---

## Règles importantes

- Ne jamais commit sans validation explicite du message proposé
- Ne jamais utiliser `--no-verify`, `--amend` ou des commandes destructives
- Ne jamais push automatiquement, `/commit` ne fait que committer en local
- Pas de tirets longs (em dashes) dans les messages de commit
- Communication en français systématique
