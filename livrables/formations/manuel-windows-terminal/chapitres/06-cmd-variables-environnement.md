<div class="chapitre-titre-num">CHAPITRE 6</div>

# CMD — Variables d'environnement

## Objectifs pédagogiques

Comprendre le rôle des variables d'environnement système (PATH, TEMP, USERPROFILE), les consulter et les modifier avec `set`/`setx`, et créer ses propres variables persistantes.

## Prérequis

Chapitres 3-5.

## 6.1 Qu'est-ce qu'une variable d'environnement

Une **variable d'environnement** est une valeur nommée, accessible par **tous les programmes** lancés depuis une session — un mécanisme de configuration partagé entre le système d'exploitation et les applications.

```
C:\>echo %USERPROFILE%
C:\Users\Jaslin

C:\>echo %TEMP%
C:\Users\Jaslin\AppData\Local\Temp

C:\>echo %PATH%
C:\Windows\system32;C:\Windows;C:\Program Files\Git\bin;...
```

## 6.2 PATH : où Windows cherche les programmes

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi taper "node" fonctionne depuis n'importe quel dossier</span>
Quand tu tapes une commande (`node`, `git`, `python`), Windows cherche un exécutable de ce nom dans **chacun** des dossiers listés dans `PATH`, dans l'ordre, jusqu'à en trouver un. Si l'installation de Node.js a ajouté son propre dossier à `PATH`, la commande `node` fonctionne partout — sans cela, il faudrait taper le chemin complet à chaque fois.
</div>

```{.uml}
Taper "node" dans le terminal
      │
      ▼
Windows cherche node.exe dans CHAQUE dossier de PATH, dans l'ordre :
  C:\Windows\system32          → pas trouvé
  C:\Windows                    → pas trouvé
  C:\Program Files\nodejs\      → TROUVÉ ! → exécuté
  (les dossiers suivants ne sont même pas vérifiés)
```

## 6.3 TEMP, USERPROFILE et autres variables système courantes

| Variable | Contenu typique |
|---|---|
| `%USERPROFILE%` | `C:\Users\Jaslin` |
| `%TEMP%` / `%TMP%` | Dossier des fichiers temporaires de l'utilisateur |
| `%APPDATA%` | Données d'application "roaming" (synchronisées entre machines dans un domaine) |
| `%LOCALAPPDATA%` | Données d'application locales (jamais synchronisées) |
| `%COMPUTERNAME%` | Nom de la machine |
| `%USERNAME%` | Nom de l'utilisateur connecté |
| `%WINDIR%` / `%SystemRoot%` | Dossier d'installation de Windows (`C:\Windows`) |

## 6.4 set : consulter et définir une variable (session courante uniquement)

```
C:\>set                        ← liste TOUTES les variables d'environnement actuelles
C:\>set USERNAME                ← affiche les variables commençant par "USERNAME"
C:\>set MA_VARIABLE=valeur       ← définit une variable pour CETTE session CMD uniquement
C:\>echo %MA_VARIABLE%
valeur
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ set ne modifie que la session en cours, jamais de façon permanente</span>
Une variable définie via `set` disparaît à la fermeture de la fenêtre CMD, et n'est visible que dans **cette** session (pas dans une autre fenêtre CMD ouverte en parallèle, ni dans les futures sessions). Pour une variable **persistante**, `setx` est nécessaire (section 6.5).
</div>

## 6.5 setx : définir une variable de façon persistante

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

## 6.6 Modifier PATH sans dupliquer par erreur

<div class="encadre attention">
<span class="encadre-titre">⚠️ setx PATH peut tronquer une très longue valeur PATH (limite historique de 1024 caractères)</span>
`setx` a une limite historique de 1024 caractères pour la valeur écrite — un `PATH` déjà long (fréquent avec de nombreux outils installés) peut être **tronqué silencieusement**, cassant l'accès à des programmes précédemment fonctionnels. Pour modifier `PATH` en toute sécurité, l'interface graphique ("Variables d'environnement" du Panneau de configuration) ou PowerShell (chapitre 11) sont préférables à `setx` pour cette variable précise.
</div>

## 6.7 Créer ses propres variables pour un projet

```
C:\>setx PROJET_HOME "D:\Projets\MonAPI"
C:\>setx NODE_ENV "development"
```

Une fois définies, ces variables sont réutilisables dans n'importe quel script Batch (chapitre 7) via `%PROJET_HOME%`, évitant de coder en dur des chemins spécifiques à une machine.

## 6.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier les % de part et d'autre pour utiliser une variable</span>
```
C:\>echo MA_VARIABLE       ← affiche littéralement le texte "MA_VARIABLE", PAS sa valeur
C:\>echo %MA_VARIABLE%     ← affiche la VALEUR de la variable
```
</div>

## 6.9 Bonnes pratiques

- Utiliser `set` pour tester une valeur temporaire ; `setx` uniquement une fois la valeur validée.
- Éviter `setx PATH` directement : préférer l'interface graphique pour cette variable précise (risque de troncature).
- Nommer ses variables personnalisées en majuscules avec underscores, par convention (`PROJET_HOME`, pas `projetHome`).

## 6.10 Résumé du chapitre

- Les variables d'environnement (`PATH`, `TEMP`, `USERPROFILE`...) sont des valeurs partagées entre le système et les programmes.
- `PATH` détermine où Windows cherche un exécutable quand on tape son nom sans chemin complet.
- `set` modifie la session courante uniquement ; `setx` persiste la variable, mais nécessite de rouvrir la session pour la voir prise en compte, et peut tronquer une valeur trop longue (notamment `PATH`).

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 6.1</span>

Crée une variable persistante `BACKUP_DIR` pointant vers `D:\Sauvegardes`, puis vérifie sa présence dans une NOUVELLE fenêtre CMD (pas celle où `setx` a été exécuté).
</div>

**Corrigé :**
```
C:\>setx BACKUP_DIR "D:\Sauvegardes"
$ # Ouvrir une NOUVELLE fenêtre CMD, puis :
C:\>echo %BACKUP_DIR%
D:\Sauvegardes
```

*Chapitre suivant : les scripts Batch (.bat), pour automatiser des séquences de commandes CMD.*
