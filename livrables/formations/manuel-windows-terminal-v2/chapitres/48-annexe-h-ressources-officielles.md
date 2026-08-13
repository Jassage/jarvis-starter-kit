<div class="chapitre-titre-num">ANNEXE H</div>

# Ressources officielles Microsoft

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Documentation officielle Microsoft par domaine, pour approfondir au-delà de ce manuel. Microsoft Learn est la référence la plus systématiquement à jour, chaque commande et cmdlet y étant documentée avec l'ensemble de ses paramètres et des exemples.
</div>

## H.1 PowerShell

- **Documentation PowerShell (Microsoft Learn)** — référence complète des cmdlets, concepts du langage, guides d'apprentissage.
- **PowerShell sur GitHub** — code source ouvert de PowerShell 7+, suivi des problèmes et nouveautés.
- **PowerShell Gallery** — registre officiel des modules PowerShell communautaires et Microsoft (chapitre 24).
- **about_* (aide conceptuelle intégrée)** — accessible directement via `Get-Help about_Functions`, `Get-Help about_Scopes`, sans connexion internet requise (rappel du chapitre 10).

## H.2 Windows Terminal et CMD

- **Documentation Windows Terminal (Microsoft Learn)** — installation, personnalisation, fichier `settings.json` (chapitre 3).
- **Windows Terminal sur GitHub** — code source ouvert, demandes de fonctionnalités, thèmes communautaires.
- **Référence des commandes Windows (Microsoft Learn)** — documentation exhaustive de chaque commande CMD interne et externe (chapitres 4-8).

## H.3 Sécurité

- **Centre de sécurité Microsoft (Microsoft Learn Security)** — bonnes pratiques de durcissement Windows, guides de conformité.
- **Documentation Windows Defender (Microsoft Learn)** — configuration avancée, intégration entreprise (chapitre 22).
- **SecretManagement (Microsoft Learn / PowerShell Gallery)** — documentation du module de gestion de secrets (chapitre 22).

## H.4 Réseau et administration à distance

- **Documentation réseau PowerShell (module NetTCPIP) (Microsoft Learn)** — référence complète des cmdlets `Get-Net*` (chapitre 20).
- **Documentation PowerShell Remoting / WinRM (Microsoft Learn)** — configuration avancée, sécurité du remoting (chapitre 25).

## H.5 Azure et cloud

- **Documentation Azure PowerShell (module Az) (Microsoft Learn)** — référence complète des cmdlets `Az.*` (chapitre 26).
- **Azure Free Account** — offre gratuite pour pratiquer les concepts du chapitre 26 sans frais.
- **Azure DevOps Documentation (Microsoft Learn)** — pipelines CI/CD, intégration avec PowerShell (chapitre 28).

## H.6 Développement et outils

- **Visual Studio Code + extension PowerShell (Microsoft Learn / Marketplace)** — environnement de développement et débogage recommandé pour tout script substantiel.
- **Windows Package Manager (winget) Documentation (Microsoft Learn)** — installation et gestion de logiciels en ligne de commande (chapitre 3).
- **Windows Subsystem for Linux (WSL) Documentation (Microsoft Learn)** — complément pour les développeurs ayant besoin d'un environnement Linux natif aux côtés de PowerShell/CMD.
- **GitHub Actions Documentation** — référence complète des workflows CI/CD (chapitre 28).

## H.7 Communautés et formations complémentaires

- **Microsoft Learn (parcours PowerShell et administration Windows)** — modules d'apprentissage gratuits et structurés, avec exercices pratiques et certifications associées.
- **Microsoft Q&A / Stack Overflow (tag powershell)** — communautés actives pour des questions précises non couvertes par la documentation.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours vérifier la version documentée face à la version installée</span>
PowerShell 5.1 (Windows PowerShell, intégré à Windows) et PowerShell 7+ (multiplateforme) présentent des différences de comportement et de cmdlets disponibles — `$PSVersionTable.PSVersion` (chapitre 2) permet de vérifier la version réellement utilisée avant de s'appuyer sur une fonctionnalité documentée pour une version différente.
</div>

## Conclusion du manuel

Ce manuel a couvert l'ensemble du parcours, du fonctionnement d'un ordinateur (chapitre 1) jusqu'aux usages professionnels avancés de PowerShell : objets, administration Windows, réseau, sécurité, automatisation, remoting, Cloud, DevOps, méthode de dépannage, et dix projets complets directement réutilisables (chapitres 30-39).

La maîtrise du terminal Windows ne s'arrête pas à ce manuel — elle se construit par la pratique quotidienne, la lecture de la documentation officielle, et la curiosité face à chaque nouvelle commande rencontrée. La feuille de route du chapitre 40 reste le meilleur point de repère pour savoir où reprendre, à tout moment de ta progression.
