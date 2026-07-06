<div class="chapitre-titre-num">CHAPITRE 4</div>

# CMD — Gestion des fichiers

## Objectifs pédagogiques

Créer, copier, déplacer, renommer et supprimer des fichiers/dossiers via CMD, et comprendre les différences entre `copy`, `xcopy` et `robocopy`.

## Prérequis

Chapitre 3.

## 4.1 mkdir / rmdir : créer et supprimer des dossiers

```
C:\Projets>mkdir mon-projet
C:\Projets>mkdir dossier1\dossier2\dossier3   ← cree TOUTE la hierarchie en une commande
C:\Projets>rmdir ancien-dossier
C:\Projets>rmdir /s /q dossier-plein          ← /s : recursif (contenu inclus), /q : sans confirmation
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ rmdir /s /q est irréversible</span>
Contrairement à une suppression via l'explorateur Windows (qui passe par la Corbeille), `rmdir /s /q` supprime **définitivement**, sans aucune récupération possible. Toujours vérifier deux fois le chemin avant d'exécuter.
</div>

## 4.2 copy vs xcopy vs robocopy

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

```
C:\>robocopy C:\Projets D:\Sauvegarde\Projets /mir /log:sauvegarde.log /r:3 /w:5
```

<div class="encadre astuce">
<span class="encadre-titre">💡 robocopy : la commande de sauvegarde professionnelle de Windows</span>
`/mir` (mirror) rend la destination **identique** à la source (supprime dans la destination ce qui n'existe plus dans la source). `/log:` enregistre un journal complet. `/r:3` : 3 tentatives en cas d'erreur réseau ; `/w:5` : attend 5 secondes entre chaque tentative — robocopy est la commande de référence pour toute sauvegarde/synchronisation sérieuse sous Windows (reprise directement au chapitre 29, projet "gestionnaire de sauvegarde").
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ robocopy a un code de sortie différent des autres commandes</span>
Contrairement à la convention "0 = succès" de la plupart des programmes, robocopy retourne des codes de sortie **entre 0 et 7** qui sont tous des succès partiels (nombre de fichiers copiés, ignorés...) — seul un code **≥ 8** indique une vraie erreur. Un script qui vérifie naïvement `if errorlevel 1` après un robocopy se déclencherait à tort sur un succès normal.
</div>

## 4.3 move et ren

```
C:\>move rapport.docx D:\Archives\
C:\>ren rapport.docx rapport-2026.docx
```

## 4.4 del : supprimer des fichiers

```
C:\>del fichier.txt
C:\>del *.tmp                    ← supprime tous les fichiers .tmp du dossier courant
C:\>del /s /q *.log              ← supprime récursivement, sans confirmation
```

## 4.5 attrib : attributs de fichiers

```
C:\>attrib +h secret.txt          ← rend le fichier CACHÉ
C:\>attrib -h secret.txt          ← retire l'attribut caché
C:\>attrib +r important.docx      ← rend le fichier en LECTURE SEULE
C:\>attrib fichier.txt            ← affiche les attributs actuels
```

## 4.6 type : afficher le contenu d'un fichier texte

```
C:\>type notes.txt
C:\>type fichier1.txt fichier2.txt > fusion.txt   ← concatène deux fichiers en un troisième
```

## 4.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ xcopy sans /e oublie les sous-dossiers vides</span>
Sans `/e`, `xcopy` copie les sous-dossiers **contenant des fichiers**, mais ignore silencieusement les dossiers **vides** — une structure de dossiers copiée peut sembler incomplète sans qu'aucune erreur ne soit signalée.
</div>

## 4.8 Bonnes pratiques

- Pour toute sauvegarde ou synchronisation sérieuse : `robocopy`, jamais `copy`/`xcopy`.
- Toujours tester une commande de suppression massive avec un filtre restreint d'abord (`dir` avec le même motif, pour voir CE QUI serait touché avant de supprimer).

## 4.9 Résumé du chapitre

- `copy` (simple), `xcopy` (structuré), `robocopy` (professionnel, reprise sur erreur, miroir) — à choisir selon la complexité du besoin.
- `move`/`ren` déplacent et renomment ; `del` supprime (irréversible, pas de corbeille).
- `attrib` gère les attributs caché/lecture seule ; `type` affiche ou concatène des fichiers texte.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.1</span>

Synchronise (miroir) le dossier `C:\Projets` vers `D:\Sauvegarde\Projets`, avec un journal nommé `backup.log` et 5 tentatives en cas d'échec.
</div>

**Corrigé :**
```
C:\>robocopy C:\Projets D:\Sauvegarde\Projets /mir /log:backup.log /r:5 /w:10
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 4.2 (mini-projet)</span>

Écris les commandes pour : créer un dossier `Archives_2026`, y copier tous les fichiers `.pdf` du dossier courant, rendre ce dossier en lecture seule, puis afficher son contenu.
</div>

**Corrigé :**
```
C:\>mkdir Archives_2026
C:\>copy *.pdf Archives_2026\
C:\>attrib +r Archives_2026
C:\>dir Archives_2026
```

*Chapitre suivant : la gestion des disques (partitionnement, formatage, vérification).*
