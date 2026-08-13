<div class="chapitre-titre-num">CHAPITRE 6</div>

# Gérer les fichiers avec CMD

## 🎯 Objectifs

Créer, copier, déplacer, renommer et supprimer des fichiers/dossiers via CMD, comprendre les différences entre `copy`, `xcopy` et `robocopy`, et gérer les attributs de fichiers.

## Prérequis

Chapitres 4-5.

## 🧠 Comprendre : pourquoi trois commandes différentes pour "copier" ?

**Le problème.** Copier un seul fichier isolé et synchroniser un dossier de plusieurs milliers de fichiers vers un serveur de sauvegarde, en résistant aux coupures réseau, ne sont pas la même tâche. Une commande unique et simple ne peut pas bien faire les deux à la fois.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
`copy` est comme prendre un seul document et en faire une photocopie. `xcopy` est comme photocopier un classeur entier, intercalaires compris. `robocopy` est comme confier ce même classeur à un service de reprographie professionnel : s'il y a une coupure de courant en pleine copie, il reprend là où il s'était arrêté, et il tient un registre de tout ce qui a été fait.
</div>

## 💻 Démonstration : mkdir et rmdir

```
C:\Projets>mkdir mon-projet
C:\Projets>mkdir dossier1\dossier2\dossier3   ← cree TOUTE la hierarchie en une commande
C:\Projets>rmdir ancien-dossier
C:\Projets>rmdir /s /q dossier-plein          ← /s : recursif (contenu inclus), /q : sans confirmation
```

## 🔍 Décortiquons

`/s` demande à `rmdir` de supprimer le dossier **et tout son contenu** (récursivement) ; `/q` (*quiet*) supprime sans demander de confirmation à chaque élément.

<div class="encadre attention">
<span class="encadre-titre">⚠️ rmdir /s /q est irréversible</span>
Contrairement à une suppression via l'explorateur Windows (qui passe par la Corbeille), `rmdir /s /q` supprime **définitivement**, sans aucune récupération possible (rappel du chapitre 1, section "erreurs de compréhension" : ceci ne passe même pas par le mécanisme "marqué réutilisable" de la Corbeille). Toujours vérifier deux fois le chemin avant d'exécuter.
</div>

## 6.1 copy, xcopy, robocopy : le tableau de décision

| Commande | Capacités | Cas d'usage |
|---|---|---|
| `copy` | Fichiers simples, pas de sous-dossiers | Copier un ou plusieurs fichiers isolés |
| `xcopy` | Dossiers avec sous-dossiers, quelques options avancées | Copies structurées de taille modeste |
| `robocopy` | Le plus puissant : reprise sur erreur, miroir, logs, multi-thread | Sauvegardes, synchronisations, gros volumes |

```
C:\>copy rapport.docx D:\Sauvegarde\
C:\>copy *.txt D:\Sauvegarde\             ← copie tous les .txt du dossier courant

C:\>xcopy C:\Projets D:\Sauvegarde\Projets /e /i
```

`/e` : inclut les sous-dossiers même vides. `/i` : suppose que la destination est un dossier (évite une question interactive).

<div class="encadre attention">
<span class="encadre-titre">⚠️ xcopy sans /e oublie les sous-dossiers vides</span>
Sans `/e`, `xcopy` copie les sous-dossiers **contenant des fichiers**, mais ignore silencieusement les dossiers **vides** — une structure de dossiers copiée peut sembler incomplète sans qu'aucune erreur ne soit signalée.
</div>

```
C:\>robocopy C:\Projets D:\Sauvegarde\Projets /mir /log:sauvegarde.log /r:3 /w:5
```

<div class="encadre astuce">
<span class="encadre-titre">💡 robocopy : la commande de sauvegarde professionnelle de Windows</span>
`/mir` (*mirror*) rend la destination **identique** à la source (supprime dans la destination ce qui n'existe plus dans la source). `/log:` enregistre un journal complet. `/r:3` : 3 tentatives en cas d'erreur ; `/w:5` : attend 5 secondes entre chaque tentative — robocopy est la commande de référence pour toute sauvegarde/synchronisation sérieuse sous Windows (elle réapparaît au chapitre 36, projet Système de sauvegarde).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ robocopy a un code de sortie différent des autres commandes</span>
Contrairement à la convention "0 = succès" de la plupart des programmes, robocopy retourne des codes de sortie **entre 0 et 7** qui sont tous des succès partiels (nombre de fichiers copiés, ignorés...) — seul un code **≥ 8** indique une vraie erreur. Un script qui vérifie naïvement "erreur si code différent de 0" après un robocopy se déclencherait à tort sur un succès normal.
</div>

## 6.2 move, ren, del

```
C:\>move rapport.docx D:\Archives\
C:\>ren rapport.docx rapport-2026.docx
C:\>del fichier.txt
C:\>del *.tmp                    ← supprime tous les fichiers .tmp du dossier courant
C:\>del /s /q *.log              ← supprime recursivement, sans confirmation
```

## 6.3 attrib : attributs de fichiers

```
C:\>attrib +h secret.txt          ← rend le fichier CACHE
C:\>attrib -h secret.txt          ← retire l'attribut cache
C:\>attrib +r important.docx      ← rend le fichier en LECTURE SEULE
C:\>attrib fichier.txt            ← affiche les attributs actuels
```

## 6.4 type : afficher le contenu d'un fichier texte

```
C:\>type notes.txt
C:\>type fichier1.txt fichier2.txt > fusion.txt   ← concatene deux fichiers en un troisieme
```

<div class="encadre vocabulaire">
<span class="encadre-titre">📖 Vocabulaire : redirection (>)</span>
Le symbole `>` **redirige** la sortie d'une commande — au lieu de s'afficher à l'écran, elle est écrite dans un fichier (créé s'il n'existe pas, écrasé s'il existe déjà). `>>` fait la même chose mais **ajoute** à la fin d'un fichier existant, sans l'écraser. Ce mécanisme reviendra très souvent, y compris en PowerShell (chapitre 11).
</div>

## Bonnes pratiques

- Pour toute sauvegarde ou synchronisation sérieuse : `robocopy`, jamais `copy`/`xcopy`.
- Toujours tester une commande de suppression massive avec un filtre restreint d'abord (`dir` avec le même motif, pour voir CE QUI serait touché avant de supprimer).

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.1</span>

Crée un dossier `Archives_2026`, copie-y tous les fichiers `.pdf` du dossier courant, rends ce dossier en lecture seule, puis affiche son contenu.
</div>

**✅ Correction.**
```
C:\>mkdir Archives_2026
C:\>copy *.pdf Archives_2026\
C:\>attrib +r Archives_2026
C:\>dir Archives_2026
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.2</span>

Synchronise (miroir) le dossier `C:\Projets` vers `D:\Sauvegarde\Projets`, avec un journal nommé `backup.log` et 5 tentatives en cas d'échec.
</div>

**✅ Correction.**
```
C:\>robocopy C:\Projets D:\Sauvegarde\Projets /mir /log:backup.log /r:5 /w:10
```

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 6.3</span>

Explique pourquoi, après un `robocopy` qui affiche un code de sortie `1`, un script Batch (chapitre 8) qui teste `if %ERRORLEVEL% neq 0 (echo ERREUR)` afficherait à tort "ERREUR" alors que la copie a réellement réussi.
</div>

**✅ Correction du défi.** `1` fait partie des codes de succès de robocopy (section 6.1 : "1 fichier copié" par exemple), pas une erreur. Un test générique `neq 0` suppose la convention habituelle ("0 = succès, tout le reste = échec"), qui ne s'applique pas à robocopy. Le bon test est `if %ERRORLEVEL% geq 8 (echo ERREUR)`, comme montré au chapitre 8.

## 🎯 Ce que tu sais maintenant

- `copy` (simple), `xcopy` (structuré), `robocopy` (professionnel, reprise sur erreur, miroir) — à choisir selon la complexité du besoin.
- `move`/`ren` déplacent et renomment ; `del` supprime, sans corbeille, de façon irréversible.
- `attrib` gère les attributs caché/lecture seule ; `type` affiche ou concatène des fichiers texte ; `>`/`>>` redirigent une sortie vers un fichier.
- Les codes de sortie de `robocopy` ne suivent pas la convention "0 = succès" habituelle : seul `≥ 8` est une vraie erreur.

*Chapitre suivant : les variables d'environnement (PATH, TEMP, USERPROFILE...) et leur manipulation avec set/setx.*
