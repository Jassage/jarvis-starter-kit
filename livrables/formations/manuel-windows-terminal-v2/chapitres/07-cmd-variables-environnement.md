<div class="chapitre-titre-num">CHAPITRE 7</div>

# Variables et environnement CMD

## 🎯 Objectifs

Comprendre le rôle des variables d'environnement système (`PATH`, `TEMP`, `USERPROFILE`...), les consulter et les modifier avec `set`/`setx`, et créer ses propres variables persistantes.

## Prérequis

Chapitres 4-6.

## 🧠 Comprendre : une mémoire partagée entre programmes

**Le problème.** Chaque programme lancé depuis une session a besoin de connaître certaines informations communes (où est le dossier de l'utilisateur, où écrire des fichiers temporaires, quels dossiers contiennent des programmes exécutables). Redemander cette information à chaque programme serait redondant et source d'incohérence.

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une **variable d'environnement** est une note affichée sur le tableau d'affichage commun de la cuisine (chapitre 1) : "le garde-manger principal est en salle B", "les torchons propres sont dans le placard 3". N'importe quel employé (programme) qui arrive peut lire ce tableau, sans qu'on ait besoin de le lui répéter individuellement.
</div>

## 💻 Démonstration

```
C:\>echo %USERPROFILE%
C:\Users\Jaslin

C:\>echo %TEMP%
C:\Users\Jaslin\AppData\Local\Temp
```

## 🔍 Décortiquons

`%USERPROFILE%` : le nom de la variable, entouré de signes `%` — c'est cette syntaxe qui indique à CMD "remplace ceci par sa valeur" plutôt que d'afficher le texte tel quel (déjà vu au défi du chapitre 4).

## 7.1 PATH : où Windows cherche les programmes

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi taper "node" fonctionne depuis n'importe quel dossier</span>
Quand tu tapes une commande (`node`, `git`, `python`), Windows cherche un exécutable de ce nom dans **chacun** des dossiers listés dans `PATH`, dans l'ordre, jusqu'à en trouver un. Si l'installation de Node.js a ajouté son propre dossier à `PATH`, la commande `node` fonctionne partout — sans cela, il faudrait taper le chemin complet à chaque fois.
</div>

```{.uml}
Taper "node" dans le terminal
      |
      v
Windows cherche node.exe dans CHAQUE dossier de PATH, dans l'ordre :
  C:\Windows\system32           -> pas trouve
  C:\Windows                     -> pas trouve
  C:\Program Files\nodejs\       -> TROUVE ! -> execute
  (les dossiers suivants ne sont meme pas verifies)
```

## 7.2 Variables système courantes

| Variable | Contenu typique |
|---|---|
| `%USERPROFILE%` | `C:\Users\Jaslin` |
| `%TEMP%` / `%TMP%` | Dossier des fichiers temporaires de l'utilisateur |
| `%APPDATA%` | Données d'application "roaming" |
| `%LOCALAPPDATA%` | Données d'application locales |
| `%COMPUTERNAME%` | Nom de la machine |
| `%USERNAME%` | Nom de l'utilisateur connecté |
| `%WINDIR%` / `%SystemRoot%` | Dossier d'installation de Windows (`C:\Windows`) |

## 7.3 set : consulter et définir (session courante uniquement)

```
C:\>set                         ← liste TOUTES les variables d'environnement actuelles
C:\>set USERNAME                 ← affiche les variables commencant par "USERNAME"
C:\>set MA_VARIABLE=valeur        ← definit une variable pour CETTE session CMD uniquement
C:\>echo %MA_VARIABLE%
valeur
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ set ne modifie que la session en cours, jamais de façon permanente</span>
Une variable définie via `set` disparaît à la fermeture de la fenêtre CMD, et n'est visible que dans **cette** session (pas dans une autre fenêtre CMD ouverte en parallèle, ni dans les futures sessions). Pour une variable **persistante**, `setx` est nécessaire.
</div>

## 7.4 setx : une variable persistante

```
C:\>setx MA_VARIABLE "valeur permanente"
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ setx ne met PAS à jour la session CMD actuelle</span>
Après `setx`, la variable est bien enregistrée de façon permanente (visible dans les futures sessions, et dans le Panneau de configuration → Variables d'environnement) — mais la fenêtre CMD **actuelle** ne la voit pas tant qu'elle n'est pas rouverte. Un `echo %MA_VARIABLE%` immédiatement après un `setx` affichera l'ancienne valeur (ou rien).
</div>

```
C:\>setx PATH "%PATH%;C:\MonOutil" /M
```

`/M` : modifie la variable au niveau **machine** (tous les utilisateurs), pas seulement l'utilisateur courant — nécessite des droits administrateur.

<div class="encadre attention">
<span class="encadre-titre">⚠️ setx PATH peut tronquer une très longue valeur (limite historique de 1024 caractères)</span>
`setx` a une limite historique de 1024 caractères pour la valeur écrite — un `PATH` déjà long (fréquent avec de nombreux outils installés) peut être **tronqué silencieusement**, cassant l'accès à des programmes précédemment fonctionnels. Pour modifier `PATH` en toute sécurité, l'interface graphique du Panneau de configuration ou PowerShell (chapitre 11) sont préférables à `setx` pour cette variable précise.
</div>

## 7.5 Créer ses propres variables pour un projet

```
C:\>setx PROJET_HOME "D:\Projets\MonAPI"
C:\>setx NODE_ENV "development"
```

Une fois définies, ces variables sont réutilisables dans n'importe quel script Batch (chapitre 8) via `%PROJET_HOME%`, évitant de coder en dur des chemins spécifiques à une machine.

## ⚠️ Attention : erreur fréquente

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier les % de part et d'autre pour utiliser une variable</span>
```
C:\>echo MA_VARIABLE       ← affiche litteralement le texte "MA_VARIABLE", PAS sa valeur
C:\>echo %MA_VARIABLE%     ← affiche la VALEUR de la variable
```
</div>

## Bonnes pratiques

- Utiliser `set` pour tester une valeur temporaire ; `setx` uniquement une fois la valeur validée.
- Éviter `setx PATH` directement : préférer l'interface graphique pour cette variable précise (risque de troncature).
- Nommer ses variables personnalisées en majuscules avec underscores, par convention (`PROJET_HOME`, pas `projetHome`).

## 📝 Exercice facile

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.1</span>

Crée une variable persistante `BACKUP_DIR` pointant vers `D:\Sauvegardes`, puis vérifie sa présence dans une NOUVELLE fenêtre CMD (pas celle où `setx` a été exécuté).
</div>

**✅ Correction.**
```
C:\>setx BACKUP_DIR "D:\Sauvegardes"
$ # Ouvrir une NOUVELLE fenetre CMD, puis :
C:\>echo %BACKUP_DIR%
D:\Sauvegardes
```

## 📝 Exercice intermédiaire

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 7.2</span>

Sans utiliser `setx`, affiche pour la session courante uniquement une variable `ENVIRONNEMENT` valant `test`, puis vérifie qu'elle disparaît bien après fermeture et réouverture de CMD.
</div>

**✅ Correction.**
```
C:\>set ENVIRONNEMENT=test
C:\>echo %ENVIRONNEMENT%
test
$ # Fermer puis rouvrir CMD :
C:\>echo %ENVIRONNEMENT%
%ENVIRONNEMENT%
```
La dernière ligne affiche littéralement `%ENVIRONNEMENT%` (et non une valeur) : CMD ne trouve plus la variable, preuve que `set` seul n'est pas persistant.

## 🔥 Défi

<div class="encadre defi">
<span class="encadre-titre">🔥 Défi 7.3</span>

Un collègue a exécuté `setx PATH "%PATH%;C:\MonOutil"` (sans `/M`) puis se plaint que `C:\MonOutil` n'apparaît "nulle part" dans le Panneau de configuration, section variables **système**. Explique pourquoi, sans même regarder son écran.
</div>

**✅ Correction du défi.** Sans `/M`, `setx` modifie le `PATH` de l'**utilisateur courant**, jamais celui de la **machine** (visible en variables système, section 7.4). Les deux `PATH` (utilisateur et machine) sont combinés au démarrage d'une session, mais restent deux valeurs stockées séparément — le collègue regarde la mauvaise section.

## 🎯 Ce que tu sais maintenant

- Les variables d'environnement (`PATH`, `TEMP`, `USERPROFILE`...) sont des valeurs partagées entre le système et les programmes.
- `PATH` détermine où Windows cherche un exécutable quand on tape son nom sans chemin complet.
- `set` modifie la session courante uniquement ; `setx` persiste la variable, mais nécessite de rouvrir la session pour la voir prise en compte, et peut tronquer une valeur trop longue (notamment `PATH`).
- `/M` sur `setx` cible la machine entière (admin requis) au lieu du seul utilisateur courant.

*Chapitre suivant : les scripts Batch (.bat), pour automatiser des séquences de commandes CMD.*
