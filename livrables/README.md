# livrables/

Ce dossier contient tous les **livrables produits par Claude** pour Jaslin : sites, applications, scripts, contenus, documents de conseil, supports de cours, etc.

## Règle d'or

- **Inputs** (documents que Jaslin fournit : briefs, exports, captures, PDF...) → `context/import/`
- **Outputs** (ce que Claude produit) → `livrables/`

Ne jamais mélanger les deux. Si un fichier dans `livrables/` doit être retravaillé à partir d'un document fourni, le document source reste dans `context/import/` et seul le résultat va dans `livrables/`.

## Organisation par sous-dossier

| Dossier | Contenu |
|---------|---------|
| [sites-web/](sites-web/) | Sites internet (vitrines, landing pages, plateformes) |
| [applications/](applications/) | Outils, scripts, automatisations |
| [youtube/](youtube/) | Briefs vidéos, scripts, hooks, calendrier éditorial |
| [cabinet/](cabinet/) | Livrables pour le cabinet de conseil Chatflow |
| [ecole/](ecole/) | Livrables pour IApreneur Académie |

## Convention de nommage des projets

Chaque livrable ou groupe de livrables vit dans son propre dossier, à l'intérieur du sous-dossier thématique concerné.

**Format général :** `nom-du-projet/` (kebab-case, sans accents ni espaces)

- Pour un projet ou client récurrent (site, appli, client cabinet, cours...) : un dossier persistant nommé d'après le projet ou le client, ex. `cabinet/client-acme/`, `ecole/cours-prompting-101/`
- Pour un livrable ponctuel daté (script one-shot, brief vidéo, document de conseil daté) : préfixer par la date au format `AAAA-MM-JJ_` suivi d'un nom court, ex. `youtube/2026-06-12_lancement-saas-hook/`

À l'intérieur de chaque dossier de projet, organiser librement les fichiers (versions, sous-dossiers `assets/`, `drafts/`, etc.) selon les besoins du projet.
