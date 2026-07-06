<div class="chapitre-titre-num">CHAPITRE 2</div>

# Installation de Node.js

## Objectifs pédagogiques

Installer Node.js correctement, comprendre la différence entre versions LTS et Current, et savoir gérer plusieurs versions sur une même machine.

## 2.1 Versions LTS vs Current

Le site officiel (nodejs.org) propose toujours deux versions au téléchargement :

- **LTS** (*Long Term Support*) : version stable, recommandée pour tout projet professionnel, avec des correctifs de sécurité garantis pendant plusieurs années.
- **Current** : version la plus récente, incluant les toutes dernières fonctionnalités du langage/runtime, mais moins testée en production et avec un cycle de support plus court.

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours choisir LTS pour un projet professionnel</span>
Sauf besoin très spécifique d'une fonctionnalité expérimentale récente, la version **LTS** est le choix par défaut pour tout projet destiné à la production — c'est la version que ce manuel utilise pour l'ensemble de ses exemples.
</div>

## 2.2 Installation directe (site officiel)

```
1. Se rendre sur nodejs.org
2. Télécharger la version LTS correspondant à son système d'exploitation
3. Exécuter l'installateur (inclut automatiquement npm, chapitre 3)
4. Vérifier l'installation :

$ node --version
v20.11.0

$ npm --version
10.2.4
```

## 2.3 nvm : gérer plusieurs versions de Node.js

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ne pas se contenter d'une seule installation directe</span>
Sur une carrière de développeur, il est très courant de devoir travailler sur plusieurs projets utilisant des versions différentes de Node.js (un ancien projet figé sur Node 16, un nouveau sur Node 20). **nvm** (*Node Version Manager*) permet d'installer et de basculer entre plusieurs versions **sans jamais avoir à désinstaller/réinstaller** Node.js manuellement.
</div>

```
$ # Installation de nvm (macOS/Linux)
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

$ # Sous Windows, utiliser nvm-windows (coreybutler/nvm-windows) à la place
```

```
$ nvm install 20        # installe la dernière version 20.x
$ nvm install 18        # installe aussi la dernière version 18.x, EN PARALLÈLE
$ nvm use 20            # bascule la version active de Node.js pour la session en cours
$ nvm list              # liste toutes les versions installées localement
$ nvm alias default 20  # définit la version 20 comme version par défaut à l'ouverture d'un terminal
```

```
$ # Dans un projet, on peut fixer la version attendue dans un fichier .nvmrc
$ echo "20.11.0" > .nvmrc
$ nvm use    # lit automatiquement .nvmrc et bascule sur la bonne version
```

## 2.4 Vérifier son installation

```
$ node --version
v20.11.0

$ node -e "console.log(process.version)"
v20.11.0

$ node -e "console.log(process.platform, process.arch)"
win32 x64
```

`node -e "code"` exécute une ligne de JavaScript directement, sans créer de fichier — pratique pour des vérifications rapides.

## 2.5 Le REPL Node.js

```
$ node
Welcome to Node.js v20.11.0.
Type ".help" for more information.
> 2 + 2
4
> const nom = "Jaslin";
undefined
> `Bonjour ${nom}`
'Bonjour Jaslin'
> .exit
```

Le **REPL** (*Read-Eval-Print Loop*) est une console interactive permettant de tester du JavaScript ligne par ligne, utile pour explorer rapidement une API ou vérifier une syntaxe sans créer de fichier de script.

## 2.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ 'node' n'est pas reconnu en tant que commande interne</span>
Si le terminal ne reconnaît pas la commande `node` après installation, la variable d'environnement `PATH` du système ne pointe probablement pas vers le dossier d'installation de Node.js — un redémarrage du terminal (voire de la session) après installation résout souvent ce problème, sinon il faut ajouter manuellement le chemin d'installation au `PATH`.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger une installation directe ET nvm sur la même machine</span>
Installer Node.js à la fois via l'installateur officiel **et** via nvm peut créer des conflits de `PATH` (le système ne sachant plus laquelle utiliser). La pratique recommandée : choisir **une seule** méthode de gestion de version dès le départ (nvm est recommandé dès qu'on prévoit de travailler sur plusieurs projets à versions différentes).
</div>

## 2.7 Résumé du chapitre

- Toujours privilégier la version **LTS** pour un projet professionnel.
- **nvm** permet d'installer et de basculer entre plusieurs versions de Node.js sans conflit, avec un fichier `.nvmrc` pour fixer la version attendue par projet.
- Le **REPL** (`node` sans argument) permet de tester rapidement du JavaScript en ligne de commande.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 2.1</span>

Installe nvm, puis installe et bascule entre deux versions différentes de Node.js (par exemple 18 et 20). Crée un fichier `.nvmrc` fixant la version 20, puis vérifie que `nvm use` (sans argument) bascule automatiquement dessus.
</div>

**Corrigé (démarche attendue) :** `nvm install 18`, `nvm install 20`, `nvm use 18` puis `node --version` doit afficher une version 18.x ; `nvm use 20` puis vérifier la version 20.x. Créer `.nvmrc` avec le contenu `20`, puis `nvm use` (sans préciser de version) doit lire ce fichier et basculer automatiquement sur Node 20.

*Chapitre suivant : npm et npx, les outils de gestion de paquets fournis avec Node.js.*
