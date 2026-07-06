<div class="chapitre-titre-num">CHAPITRE 5</div>

# CMD — Gestion des disques

## Objectifs pédagogiques

Utiliser les outils de gestion de disques en ligne de commande : partitionnement (diskpart), formatage, vérification d'intégrité, étiquetage.

## Prérequis

Chapitre 4. Droits administrateur nécessaires pour la plupart des commandes de ce chapitre.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ce chapitre manipule des disques réels : la prudence est absolue</span>
Les commandes de ce chapitre (`diskpart`, `format`) peuvent **détruire irrémédiablement des données**. Ne jamais exécuter ces commandes sans avoir vérifié trois fois le numéro de disque/lecteur ciblé, particulièrement `diskpart` qui identifie les disques par **numéro**, pas par lettre — une confusion entre disque 0 (système) et disque 1 (externe) est catastrophique et irréversible.
</div>

## 5.1 diskpart : l'outil de partitionnement en ligne de commande

```
C:\>diskpart
DISKPART> list disk

  Disque ###  Statut      Taille   Libre    Dyn  GPT
  ----------  ----------  -------  -------  ---  ---
  Disque 0    En ligne     476 Go      0 o        *
  Disque 1    En ligne     931 Go  100 Go

DISKPART> select disk 1
Le disque 1 est maintenant le disque sélectionné.

DISKPART> list partition
DISKPART> create partition primary size=51200
DISKPART> format fs=ntfs quick label="Données"
DISKPART> assign letter=E
DISKPART> exit
```

<div class="encadre astuce">
<span class="encadre-titre">💡 diskpart fonctionne en mode interactif, avec sa propre invite</span>
Une fois `diskpart` lancé, l'invite change en `DISKPART>` : les commandes suivantes (`select`, `create`, `format`, `assign`) s'exécutent dans ce contexte particulier, jusqu'à `exit` qui referme cette session et revient à l'invite CMD normale.
</div>

## 5.2 format : formater un lecteur

```
C:\>format E: /fs:ntfs /q /v:"Sauvegarde"
```

`/fs:ntfs` : système de fichiers ; `/q` : formatage rapide (ne vérifie pas physiquement chaque secteur) ; `/v:` : étiquette de volume.

<div class="encadre attention">
<span class="encadre-titre">⚠️ format efface TOUTES les données du lecteur ciblé</span>
Contrairement à `diskpart` (qui demande de sélectionner explicitement un disque puis une partition), `format` accepte directement une lettre de lecteur — une faute de frappe sur la lettre (`format C:` au lieu de `format E:`) formaterait le disque système en cours d'utilisation.
</div>

## 5.3 chkdsk : vérifier et réparer un système de fichiers

```
C:\>chkdsk C:
C:\>chkdsk C: /f      ← répare les erreurs trouvées (peut nécessiter un redémarrage si C: est le disque système)
C:\>chkdsk C: /r      ← recherche aussi les secteurs défectueux physiques (plus lent, inclut /f)
```

## 5.4 label : renommer un volume

```
C:\>label E: Archives2026
C:\>label E:              ← sans nouveau nom : affiche/demande l'étiquette actuelle
```

## 5.5 fsutil : utilitaire avancé du système de fichiers

```
C:\>fsutil fsinfo drives
C:\>fsutil volume diskfree C:
C:\>fsutil fsinfo ntfsinfo C:
```

## 5.6 mountvol : gérer les points de montage

```
C:\>mountvol                          ← liste les volumes et leurs GUID
C:\>mountvol D:\DonneesExternes \\?\Volume{guid}\   ← monte un volume dans un DOSSIER plutôt qu'une lettre
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Monter un volume dans un dossier, pas seulement sur une lettre</span>
Windows limite les lettres de lecteur à 26 (A-Z). `mountvol` permet de monter un volume supplémentaire directement dans un **dossier vide** d'un disque existant, contournant cette limite — une technique utilisée en administration serveur avec de nombreux volumes.
</div>

## 5.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre le numéro de disque diskpart et la lettre de lecteur Windows</span>
`Disque 1` dans `diskpart` ne correspond à **aucune** lettre directement visible avant d'avoir listé ses partitions (`list partition`) — toujours vérifier la taille et le statut affichés par `list disk` pour confirmer qu'il s'agit bien du bon disque physique avant de poursuivre.
</div>

## 5.8 Bonnes pratiques

- Toujours `list disk` puis vérifier la **taille** affichée avant tout `select disk` dans diskpart.
- Sauvegarder les données importantes avant tout formatage, même si l'intention est de formater le bon lecteur.
- Utiliser `chkdsk /scan` (analyse sans verrouiller le volume) avant `/f`/`/r` pour évaluer l'ampleur du problème sans interruption de service.

## 5.9 Résumé du chapitre

- `diskpart` (mode interactif) gère le partitionnement à un niveau bas, identifié par numéro de disque — la plus grande prudence est requise.
- `format` prépare un système de fichiers sur un lecteur, en effaçant tout son contenu existant.
- `chkdsk` vérifie et répare l'intégrité d'un système de fichiers ; `/f` corrige, `/r` inclut une recherche de secteurs défectueux.
- `label` renomme un volume ; `mountvol` peut monter un volume dans un dossier plutôt qu'une lettre.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 5.1</span>

Sur un disque externe déjà connecté (numéro de disque à vérifier soigneusement via `list disk`), crée une partition primaire de 10 Go, formate-la en NTFS avec l'étiquette "Test", et assigne-lui la lettre `Z`.
</div>

**Corrigé :**
```
DISKPART> select disk <numero_verifie>
DISKPART> create partition primary size=10240
DISKPART> format fs=ntfs quick label="Test"
DISKPART> assign letter=Z
```

*Chapitre suivant : les variables d'environnement (PATH, TEMP, USERPROFILE) et leur gestion via set/setx.*
