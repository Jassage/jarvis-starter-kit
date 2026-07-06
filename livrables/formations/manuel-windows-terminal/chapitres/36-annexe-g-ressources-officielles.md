<div class="chapitre-titre-num">ANNEXE G</div>

# Ressources officielles Microsoft

<div class="encadre astuce">
<span class="encadre-titre">💡 Note sur cette annexe</span>
Cette annexe recense la documentation officielle Microsoft par domaine, pour approfondir au-delà de ce manuel. La documentation Microsoft Learn est la référence la plus systématiquement à jour, chaque commande et cmdlet y étant documentée avec l'ensemble de ses paramètres et des exemples.
</div>

## G.1 PowerShell

- **Documentation PowerShell (Microsoft Learn)** — référence complète des cmdlets, concepts du langage, guides d'apprentissage.
- **PowerShell sur GitHub** — code source ouvert de PowerShell 7+, suivi des problèmes et nouveautés.
- **PowerShell Gallery** — registre officiel des modules PowerShell communautaires et Microsoft.
- **about_* (aide conceptuelle intégrée)** — accessible directement via `Get-Help about_Functions`, `Get-Help about_Scopes`, etc., sans connexion internet requise.

## G.2 Windows Terminal

- **Documentation Windows Terminal (Microsoft Learn)** — installation, personnalisation, fichier `settings.json`.
- **Windows Terminal sur GitHub** — code source ouvert, demandes de fonctionnalités, thèmes communautaires.

## G.3 CMD et scripts batch

- **Référence des commandes Windows (Microsoft Learn)** — documentation exhaustive de chaque commande CMD interne et externe.

## G.4 Active Directory et sécurité

- **Documentation Active Directory Domain Services (Microsoft Learn)** — concepts, déploiement, module PowerShell `ActiveDirectory`.
- **Centre de sécurité Microsoft (Microsoft Learn Security)** — bonnes pratiques de durcissement Windows, guides de conformité.
- **Documentation Windows Defender (Microsoft Learn)** — configuration avancée, intégration entreprise (Defender for Endpoint).

## G.5 Azure et cloud

- **Documentation Azure PowerShell (module Az) (Microsoft Learn)** — référence complète des cmdlets `Az.*`.
- **Azure Free Account** — offre gratuite pour pratiquer les concepts du chapitre 24 sans frais.
- **Azure DevOps Documentation (Microsoft Learn)** — pipelines CI/CD, intégration avec PowerShell.

## G.6 Développement et outils

- **Visual Studio Code + extension PowerShell (Microsoft Learn / Marketplace)** — environnement de développement et débogage recommandé pour tout script substantiel.
- **Windows Package Manager (winget) Documentation (Microsoft Learn)** — installation et gestion de logiciels en ligne de commande.
- **Windows Subsystem for Linux (WSL) Documentation (Microsoft Learn)** — complément pour les développeurs ayant besoin d'un environnement Linux natif aux côtés de PowerShell/CMD.

## G.7 Communautés et formations complémentaires

- **Microsoft Learn (parcours PowerShell et administration Windows)** — modules d'apprentissage gratuits et structurés, avec exercices pratiques et certifications associées.
- **Microsoft Q&A / Stack Overflow (tag powershell)** — communautés actives pour des questions précises non couvertes par la documentation.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Toujours vérifier la version documentée face à la version installée</span>
PowerShell 5.1 (Windows PowerShell, intégré à Windows) et PowerShell 7+ (PowerShell Core, multiplateforme) présentent des différences de comportement et de cmdlets disponibles — `$PSVersionTable.PSVersion` (chapitre 8) permet de vérifier la version réellement utilisée avant de s'appuyer sur une fonctionnalité documentée pour une version différente.
</div>

## Conclusion du manuel

Ce manuel a couvert l'ensemble du parcours de l'invite de commandes CMD jusqu'aux usages professionnels avancés de PowerShell : objets, automatisation, sécurité, cloud, DevOps, et dix projets complets directement réutilisables. La maîtrise du terminal Windows ne s'arrête pas à ce manuel — elle se construit par la pratique quotidienne, la lecture de la documentation officielle, et la curiosité face à chaque nouvelle commande rencontrée.
