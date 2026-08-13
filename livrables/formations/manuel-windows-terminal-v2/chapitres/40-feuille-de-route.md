<div class="chapitre-titre-num">CHAPITRE 40</div>

# La feuille de route : dix niveaux, du débutant au professionnel

## 🎯 Objectifs

Situer précisément où tu en es dans ton apprentissage, et savoir ce qu'il reste à maîtriser pour progresser au niveau suivant, jusqu'au niveau professionnel.

## 🧠 Comprendre : pourquoi une feuille de route

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Ce chapitre est la carte de la montagne que tu viens de gravir, chapitre après chapitre. Elle te permet de répondre, à tout moment de ta carrière, à une question simple : "où en suis-je, et que dois-je apprendre ensuite ?"
</div>

```{.uml}
Niveau 1  Utilisateur du terminal
   |
Niveau 2  Utilisateur CMD
   |
Niveau 3  Utilisateur PowerShell
   |
Niveau 4  Scripteur PowerShell
   |
Niveau 5  Administrateur Windows
   |
Niveau 6  Automatisation
   |
Niveau 7  PowerShell avance
   |
Niveau 8  Administration distante
   |
Niveau 9  Cloud / DevOps
   |
Niveau 10 PowerShell professionnel
```

---

## Niveau 1 — Utilisateur du terminal

**Compétences** : comprendre ce qu'est un ordinateur (processeur, RAM, disque), ce qu'est un terminal, un shell, une invite de commandes.

**Commandes à maîtriser** : aucune encore — la compréhension prime sur la mémorisation à ce stade (chapitres 1-2).

**Exercice** : ouvrir CMD et PowerShell, observer la différence d'invite, exécuter `$PSVersionTable`.

**Projet** : aucun — ce niveau est fondationnel.

**Critère de passage** : tu peux expliquer, sans notes, la différence entre terminal, shell et invite de commandes (chapitre 2).

---

## Niveau 2 — Utilisateur CMD

**Compétences** : naviguer et gérer des fichiers en CMD, comprendre les variables d'environnement, écrire un script Batch simple.

**Commandes à maîtriser** : `dir`, `cd`, `mkdir`, `copy`, `xcopy`, `robocopy`, `del`, `set`, `setx` (chapitres 4-7).

**Exercice** : automatiser une copie de dossier avec `robocopy /mir`, journalisée.

**Projet** : un script `.bat` de nettoyage simple (chapitre 8).

**Critère de passage** : tu sais expliquer pourquoi `robocopy` ne suit pas la convention "0 = succès" des autres commandes.

---

## Niveau 3 — Utilisateur PowerShell

**Compétences** : comprendre les objets PowerShell, utiliser le pipeline, naviguer et gérer des fichiers avec les vraies cmdlets.

**Commandes à maîtriser** : `Get-Help`, `Get-Command`, `Get-Member`, `Get-ChildItem`, `Where-Object`, `Sort-Object`, `Select-Object` (chapitres 9-12).

**Exercice** : reproduire, en PowerShell orienté objet, une tâche déjà faite en CMD au niveau 2 — comparer la lisibilité.

**Projet** : un script qui liste et exporte en CSV les 10 plus gros fichiers d'un dossier.

**Critère de passage** : tu peux expliquer, avec un exemple concret, pourquoi `Format-Table` doit toujours être la dernière étape d'un pipeline.

---

## Niveau 4 — Scripteur PowerShell

**Compétences** : variables typées, conditions, boucles, fonctions avec paramètres validés.

**Commandes/notions à maîtriser** : `if`/`switch`, `foreach`/`while`, `param()` avec `[Validate*]`, `[CmdletBinding()]` (chapitres 13-16).

**Exercice** : écrire une fonction `Test-MotDePasseFort` avec validation par expression régulière.

**Projet** : un script paramétrable de génération de rapport, avec valeurs par défaut sensées.

**Critère de passage** : tu sais pourquoi un `Write-Output` de débogage oublié peut casser la valeur de retour d'une fonction.

---

## Niveau 5 — Administrateur Windows

**Compétences** : gérer processus, services, consulter les informations système en profondeur.

**Commandes à maîtriser** : `Get-Process`, `Stop-Process`, `Get-Service`, `Restart-Service`, `Get-CimInstance` (chapitres 17-19).

**Exercice** : écrire un script qui détecte tout service `Automatic` mais arrêté, et propose (sans l'exécuter automatiquement) un redémarrage.

**Projet** : le Projet 6 — Gestionnaire de services (chapitre 35).

**Critère de passage** : tu peux construire, sans aide, un inventaire matériel complet d'une machine via `Get-CimInstance`.

---

## Niveau 6 — Automatisation

**Compétences** : diagnostic réseau méthodique, consommation d'API REST, tâches planifiées, scripts d'automatisation robustes.

**Commandes à maîtriser** : `Test-NetConnection`, `Resolve-DnsName`, `Invoke-RestMethod`, `Register-ScheduledTask` (chapitres 20-23).

**Exercice** : planifier une tâche quotidienne qui exécute un script de nettoyage et journalise son résultat.

**Projet** : le Projet 7 — Système de sauvegarde (chapitre 36).

**Critère de passage** : tu sais toujours répondre, sans hésiter, "quel étage de la chaîne réseau ai-je testé, et lequel reste à tester ?"

---

## Niveau 7 — PowerShell avancé

**Compétences** : sécurité (UAC, ACL, Execution Policy, secrets), modules personnels, profil PowerShell.

**Commandes/notions à maîtriser** : `Get-Acl`/`Set-Acl`, `SecretManagement`, `Export-ModuleMember`, `$PROFILE` (chapitres 22, 24).

**Exercice** : construire un module de 3 fonctions minimum, avec manifeste, documenté.

**Projet** : le Projet 9 — Module PowerShell personnel (chapitre 38).

**Critère de passage** : ton module personnel se charge automatiquement à chaque nouvelle session, sans action manuelle.

---

## Niveau 8 — Administration distante

**Compétences** : PowerShell Remoting, administration de plusieurs machines, gestion robuste des échecs partiels.

**Commandes à maîtriser** : `Invoke-Command`, `New-PSSession`, `Enter-PSSession`, `ForEach-Object -Parallel` (chapitres 15, 25).

**Exercice** : exécuter une même vérification sur 3 machines (réelles ou simulées), avec gestion propre d'une machine injoignable.

**Projet** : le Projet 8 — Administration de plusieurs machines (chapitre 37).

**Critère de passage** : ton script d'administration multi-machines ne s'arrête jamais entièrement à cause d'une seule machine en panne.

---

## Niveau 9 — Cloud / DevOps

**Compétences** : PowerShell avec Azure, intégration CI/CD, vérification systématique des codes de sortie.

**Commandes/notions à maîtriser** : `Connect-AzAccount`, `New-AzVM`, `$LASTEXITCODE`, intégration GitHub Actions (chapitres 26, 28).

**Exercice** : écrire un pipeline GitHub Actions qui bloque un déploiement si les tests échouent.

**Projet** : un environnement Azure de test provisionné et nettoyé automatiquement par script.

**Critère de passage** : tu ne laisses jamais une ressource Cloud de test tourner sans surveillance après un exercice.

---

## Niveau 10 — PowerShell professionnel

**Compétences** : méthode de dépannage systématique, conception d'outils complets (cahier des charges → documentation), capacité à former d'autres personnes.

**Commandes/notions à maîtriser** : l'ensemble du manuel, mobilisé selon le besoin réel plutôt que par cœur.

**Exercice** : diagnostiquer, en suivant la méthode en 8 étapes (chapitre 29), un incident que tu n'as jamais rencontré auparavant.

**Projet** : le Projet 10 — Outil complet d'administration Windows (chapitre 39), étendu et adapté à ton propre contexte de travail.

**Critère de passage** : il n'y en a plus — à ce niveau, tu deviens la personne qui écrit la prochaine feuille de route, pour d'autres.

## 🎯 Ce que tu sais maintenant

- Progresser en administration Windows/PowerShell suit une trajectoire reconnaissable, du terminal nu jusqu'à l'outillage professionnel complet.
- Chaque niveau a un critère de passage concret et vérifiable, pas seulement "avoir lu le chapitre".
- Revenir consulter cette feuille de route périodiquement, même une fois avancé, reste utile pour identifier une lacune oubliée.

*Chapitre suivant : les annexes — glossaire, cheat sheets, erreurs fréquentes et ressources officielles.*
