<div class="chapitre-titre-num">CHAPITRE 4</div>

# Premières commandes CMD

## 🎯 Objectifs

Taper tes toutes premières commandes CMD (`dir`, `cd`, `cd ..`, `cls`, `echo`, `help`), comprendre ce que chacune manipule réellement, et savoir où trouver l'aide intégrée pour toute commande que tu ne connais pas encore.

## Prérequis

Chapitres 1 à 3.

## 🧠 Comprendre : le dossier "courant"

**Le problème.** Un shell doit toujours savoir "où" il se trouve dans l'arborescence de fichiers (chapitre 1, section 1.5), sinon une commande comme "liste les fichiers" n'aurait pas de sens : lister les fichiers de **quel** dossier ?

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Le **dossier courant** (*current directory*) est l'armoire devant laquelle tu te tiens en ce moment. Tu peux regarder ce qu'elle contient (`dir`), aller dans une armoire voisine (`cd`), mais tant que tu ne t'es pas déplacé, toutes tes actions s'appliquent à celle devant laquelle tu es.
</div>

## 💻 Démonstration : dir, la toute première commande

```
C:\Users\Jaslin>dir
 Le volume dans le lecteur C n'a pas de nom.
 Répertoire de C:\Users\Jaslin

06/07/2026  09:00    <DIR>          Documents
06/07/2026  09:00    <DIR>          Téléchargements
05/07/2026  18:22               842 notes.txt
               1 fichier(s)              842 octets
               2 Rép(s)  120 654 321 664 octets libres
```

## 🔍 Décortiquons

- `dir` : demande la liste du contenu du dossier courant.
- `<DIR>` : marque une entrée comme étant un **dossier**, pas un fichier.
- `842` : la taille du fichier `notes.txt`, en octets.
- La dernière ligne : l'espace libre restant sur ce disque (chapitre 1, section 1.3).

## 4.1 cd : se déplacer entre les dossiers

```
C:\Users\Jaslin>cd Documents
C:\Users\Jaslin\Documents>cd ..
C:\Users\Jaslin>
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : chemin relatif vs chemin absolu</span>
`cd Documents` utilise un **chemin relatif** : "le dossier Documents, à partir d'où je suis déjà". `cd C:\Users\Jaslin\Documents` utilise un **chemin absolu** : l'adresse complète, valable depuis n'importe où. `cd ..` est un raccourci universel qui signifie toujours "remonte d'un niveau, vers le dossier parent".
</div>

## 4.2 cls : nettoyer l'écran

```
C:\>cls
```

<div class="encadre astuce">
<span class="encadre-titre">💡 cls n'efface pas l'historique</span>
`cls` efface uniquement ce qui est **affiché** à l'écran — les commandes que tu as déjà tapées restent accessibles avec les flèches ↑ / ↓ du clavier. Rien n'est "oublié", seul l'écran est nettoyé, un peu comme essuyer un tableau blanc sans jeter les notes déjà prises ailleurs.
</div>

## 4.3 echo : afficher du texte

```
C:\>echo Bonjour Jaslin
Bonjour Jaslin

C:\>echo.
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ echo. (avec un point) pour une ligne vide, jamais echo seul</span>
`echo` seul, sans rien après, n'affiche pas une ligne vide : il affiche l'état actuel de l'écho (`ECHO est activé`). Pour produire une vraie ligne vide dans un script, il faut `echo.` (avec le point collé, sans espace) — une source d'erreur classique reprise au chapitre 8 (scripts Batch).
</div>

## 4.4 help et /? : l'aide intégrée

```
C:\>help
C:\>help dir
C:\>dir /?
```

<div class="encadre astuce">
<span class="encadre-titre">💡 dir /? fonctionne pour presque toutes les commandes CMD</span>
`help <commande>` et `<commande> /?` renvoient la même documentation, dans le terminal, sans connexion Internet. Un réflexe à garder pour toute commande CMD rencontrée dans ce manuel ou ailleurs.
</div>

## ⚠️ Attention : erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Chemin avec espaces sans guillemets</span>
```
C:\>cd Mes Documents          ← ❌ interprété comme deux arguments séparés : "Mes" et "Documents"
C:\>cd "Mes Documents"        ← ✅ guillemets obligatoires dès qu'un chemin contient un espace
```
</div>

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Depuis `C:\`, va dans ton dossier utilisateur, liste son contenu, puis reviens à `C:\` en une seule commande `cd`.
</div>

**✅ Correction.**
```
C:\>cd %USERPROFILE%
C:\Users\Jaslin>dir
C:\Users\Jaslin>cd \
```
`cd \` (avec un antislash seul) remonte directement à la racine du lecteur courant, sans avoir à compter le nombre de `cd ..` nécessaires.

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.2</span>

Affiche l'aide de la commande `copy` (tu ne l'as pas encore apprise, chapitre 6) sans quitter le terminal ni ouvrir de navigateur.
</div>

**✅ Correction.**
```
C:\>copy /?
```
Une commande inconnue ne doit jamais être un mur : `/?` (ou `help copy`) donne toujours un point de départ.

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 4.3</span>

Sans aide, essaie de prédire ce qu'affichera `echo %CD%`. Vérifie.
</div>

**✅ Correction du défi.** `%CD%` est une variable d'environnement (approfondie au chapitre 7) qui contient toujours le chemin absolu du dossier courant — `echo %CD%` affiche donc la même information que celle visible dans l'invite (`C:\Users\Jaslin>`), mais de façon exploitable dans un script.

## 🎯 Ce que tu sais maintenant

- Le shell garde toujours en mémoire un **dossier courant** ; toutes les commandes de fichiers s'y appliquent par défaut.
- `dir` liste, `cd` déplace (`cd ..` remonte, `cd \` va à la racine), `cls` nettoie l'affichage, `echo` affiche du texte.
- `help <commande>` et `<commande> /?` donnent l'aide intégrée de presque toute commande CMD.

*Chapitre suivant : naviguer plus loin — changer de lecteur, visualiser une arborescence complète.*
