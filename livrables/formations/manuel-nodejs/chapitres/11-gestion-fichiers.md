<div class="chapitre-titre-num">CHAPITRE 11</div>

# Gestion des fichiers

## Objectifs pédagogiques

Maîtriser le module `fs` (System de fichiers) dans ses trois variantes (callback, Promise, synchrone), et comprendre les Streams pour traiter de gros fichiers efficacement.

## 11.1 Le module fs : trois façons de faire la même chose

```js
const fs = require("fs");             // API à callbacks (historique)
const fsPromises = require("fs/promises"); // API à Promises (recommandée avec async/await)
// fs.readFileSync(...)                 // API synchrone (bloque le thread, cas d'usage restreints)
```

## 11.2 Lire un fichier

```js
// Avec Promises (recommandé)
const fs = require("fs/promises");

async function lireConfig() {
  const contenu = await fs.readFile("config.json", "utf8");
  return JSON.parse(contenu);
}
```

```js
// Version SYNCHRONE : bloque le thread principal jusqu'à la fin de la lecture
const fs = require("fs");
const contenu = fs.readFileSync("config.json", "utf8");
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais utiliser les méthodes *Sync dans le traitement d'une requête HTTP</span>
Rappel du chapitre 1 : Node.js exécute le code sur un thread unique. Une méthode synchrone comme `readFileSync` **bloque ce thread** jusqu'à la fin de l'opération, empêchant le traitement de **toutes les autres requêtes** en attente pendant ce temps. Les méthodes `*Sync` ne sont acceptables qu'au **démarrage** de l'application (avant que le serveur n'accepte de requêtes), jamais dans un contrôleur ou middleware traitant une requête utilisateur.
</div>

## 11.3 Écrire un fichier

```js
const fs = require("fs/promises");

async function sauvegarderLog(message) {
  await fs.writeFile("app.log", message + "\n", { flag: "a" }); // "a" = append, ajoute sans écraser
}

async function ecrireConfig(config) {
  await fs.writeFile("config.json", JSON.stringify(config, null, 2)); // écrase le fichier existant
}
```

## 11.4 Vérifier l'existence, créer des dossiers, supprimer

```js
const fs = require("fs/promises");
const path = require("path");

async function assurerDossierUploads() {
  const dossier = path.join(__dirname, "uploads");
  try {
    await fs.access(dossier); // lève une erreur si le dossier n'existe pas
  } catch {
    await fs.mkdir(dossier, { recursive: true }); // recursive : crée aussi les dossiers parents manquants
  }
}

async function supprimerFichier(chemin) {
  await fs.unlink(chemin);
}
```

## 11.5 Le module path : construire des chemins de façon portable

```js
const path = require("path");

// ❌ Concaténation manuelle : casse sur Windows (antislash) vs Linux/macOS (slash)
const cheminFragile = __dirname + "/uploads/" + "photo.jpg";

// ✅ path.join gère automatiquement le bon séparateur selon le système d'exploitation
const cheminSur = path.join(__dirname, "uploads", "photo.jpg");

console.log(path.extname("photo.jpg"));   // ".jpg"
console.log(path.basename("/a/b/photo.jpg")); // "photo.jpg"
console.log(path.dirname("/a/b/photo.jpg"));  // "/a/b"
console.log(path.resolve("uploads", "photo.jpg")); // chemin ABSOLU, résolu depuis le dossier courant
```

## 11.6 Les Streams : traiter de gros fichiers sans tout charger en mémoire

<div class="encadre attention">
<span class="encadre-titre">⚠️ readFile charge le fichier ENTIER en mémoire</span>
`fs.readFile` charge la **totalité** du contenu d'un fichier en mémoire avant de le retourner. Pour un fichier de quelques Ko, aucun problème. Pour un fichier vidéo de plusieurs Go, cela peut épuiser la mémoire disponible du serveur. Les **Streams** résolvent ce problème en traitant les données **par morceaux** (chunks), sans jamais charger l'intégralité en mémoire.
</div>

```js
const fs = require("fs");

const streamLecture = fs.createReadStream("gros-fichier.csv", { encoding: "utf8" });

streamLecture.on("data", (chunk) => {
  console.log("Morceau reçu :", chunk.length, "caractères");
});

streamLecture.on("end", () => {
  console.log("Lecture terminée");
});

streamLecture.on("error", (erreur) => {
  console.error("Erreur de lecture :", erreur.message);
});
```

```js
// Copier un fichier volumineux SANS jamais le charger entièrement en mémoire
const streamLecture = fs.createReadStream("source.mp4");
const streamEcriture = fs.createWriteStream("copie.mp4");

streamLecture.pipe(streamEcriture); // "pipe" relie directement la sortie de l'un à l'entrée de l'autre

streamEcriture.on("finish", () => console.log("Copie terminée"));
```

<div class="encadre astuce">
<span class="encadre-titre">💡 .pipe() : la façon idiomatique de connecter des Streams</span>
`.pipe()` gère automatiquement le rythme de transfert (*backpressure*) : si la destination (écriture) est plus lente que la source (lecture), Node.js ralentit automatiquement la lecture pour éviter d'accumuler des données non écrites en mémoire — un mécanisme important pour le téléversement de fichiers volumineux (chapitre 26).
</div>

## 11.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Chemins relatifs fragiles selon le dossier de lancement du script</span>
```js
// ❌ Fragile : dépend du dossier depuis lequel "node index.js" est lancé
fs.readFile("config.json", ...);
```
```js
// ✅ Toujours ancrer les chemins sur __dirname (l'emplacement RÉEL du fichier de code, invariable)
fs.readFile(path.join(__dirname, "config.json"), ...);
```
Un chemin relatif comme `"config.json"` est résolu par rapport au **répertoire de travail courant** du processus (celui d'où la commande `node` a été lancée), pas par rapport à l'emplacement du fichier source — une source de bugs fréquente dès que le script est lancé depuis un autre dossier ou par un gestionnaire de processus (PM2, Docker).
</div>

## 11.8 Résumé du chapitre

- Le module `fs` existe en trois variantes : callback (historique), Promise (`fs/promises`, recommandée), synchrone (`*Sync`, réservée au démarrage de l'application).
- `path.join`/`path.resolve` construisent des chemins de façon portable entre systèmes d'exploitation.
- Les Streams traitent de gros fichiers par morceaux, sans les charger entièrement en mémoire ; `.pipe()` gère automatiquement le backpressure.
- Toujours ancrer les chemins de fichiers sur `__dirname`, jamais sur des chemins relatifs fragiles.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.1</span>

Écris une fonction async `ajouterLigneLog(message)` qui ajoute une ligne horodatée à un fichier `app.log` situé dans le même dossier que le script, en créant le fichier s'il n'existe pas encore.
</div>

**Corrigé :**
```js
const fs = require("fs/promises");
const path = require("path");

async function ajouterLigneLog(message) {
  const cheminLog = path.join(__dirname, "app.log");
  const ligne = `[${new Date().toISOString()}] ${message}\n`;
  await fs.writeFile(cheminLog, ligne, { flag: "a" }); // "a" crée le fichier s'il n'existe pas, puis ajoute
}
```

*Chapitre suivant : les variables d'environnement, pour séparer la configuration du code.*
