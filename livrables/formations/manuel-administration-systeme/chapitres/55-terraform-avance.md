<div class="chapitre-titre-num">CHAPITRE 55</div>

# Terraform avancé : modules, state distant et multi-provider

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Structurer Terraform à l'échelle de plusieurs environnements et de plusieurs fournisseurs cloud, plutôt que de dupliquer du code HCL comme un playbook Ansible non structuré (chapitre 53). À la fin de ce chapitre, tu sauras écrire un module réutilisable, gérer plusieurs environnements sans duplication, approfondir la protection du state en équipe, et faire cohabiter AWS et Azure dans un même projet Terraform.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Après le succès de la configuration Terraform du chapitre 54, l'équipe doit maintenant créer trois environnements distincts pour le portail client : développement, test et production. Le premier réflexe — copier-coller le fichier HCL du chapitre 54 dans trois dossiers, en changeant quelques valeurs à la main dans chaque copie — reproduit exactement le problème déjà résolu pour Ansible au chapitre 53 : trois versions divergentes d'une même logique, de plus en plus difficiles à maintenir cohérentes dans le temps. Simultanément, la stratégie multi-cloud du chapitre 49 (AWS pour le portail, Azure envisagé pour la gestion documentaire) pose une question supplémentaire : peut-on gérer les deux fournisseurs avec le même outil ? Ce chapitre répond aux deux problèmes.
</div>

## 55.1 Le problème de la duplication entre environnements

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le même problème que les rôles Ansible, un autre outil</span>
Copier-coller une configuration Terraform pour chaque environnement reproduit exactement le problème déjà résolu par les rôles Ansible au chapitre 53 : toute correction ou amélioration doit être répétée manuellement dans chaque copie, avec un risque croissant de divergence non intentionnelle entre les environnements — précisément l'inverse de la reproductibilité que Terraform est censé garantir.
</div>

## 55.2 Les modules : la réponse directe, rappel des rôles Ansible

```hcl
# modules/reseau/main.tf -- un module reutilisable, parametre
variable "environnement" {
  type = string
}

variable "cidr_vpc" {
  type = string
}

resource "aws_vpc" "principal" {
  cidr_block = var.cidr_vpc
  tags = {
    Nom           = "vpc-${var.environnement}"
    Environnement = var.environnement
  }
}

output "vpc_id" {
  value = aws_vpc.principal.id
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un module Terraform, exactement l'équivalent d'un rôle Ansible</span>
Un **module** Terraform regroupe une logique réutilisable, paramétrée par des variables — exactement le même principe déjà établi pour les rôles Ansible au chapitre 53 : écrire la logique une seule fois, puis l'appeler avec des paramètres différents pour chaque contexte, plutôt que de dupliquer le code lui-même.
</div>

## 55.3 Utiliser le module pour chaque environnement

```hcl
# environnements/dev/main.tf
module "reseau_dev" {
  source        = "../../modules/reseau"
  environnement = "developpement"
  cidr_vpc      = "10.0.0.0/16"
}

# environnements/production/main.tf
module "reseau_production" {
  source        = "../../modules/reseau"
  environnement = "production"
  cidr_vpc      = "10.1.0.0/16"
}
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Une seule logique, trois environnements, zéro duplication</span>
Une correction ou une amélioration apportée au module `reseau` bénéficie automatiquement à tous les environnements qui l'utilisent, dès leur prochain `terraform apply` — résolvant exactement le problème du scénario d'ouverture, sans jamais avoir à répéter manuellement un changement dans trois copies distinctes.
</div>

## 55.4 Séparer les environnements : dossiers distincts plutôt que workspaces

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une recommandation pragmatique, pas une règle absolue</span>
Terraform propose une fonctionnalité native de "workspaces" pour gérer plusieurs environnements avec un seul dossier de configuration — mais l'expérience répandue dans l'industrie montre que des **dossiers séparés par environnement** (comme dans l'exemple de la section 55.3), chacun avec son propre fichier d'état, offrent une séparation plus claire et réduisent le risque d'appliquer accidentellement un changement destiné au développement sur la production. Cette approche reste un choix pragmatique majoritaire, pas une règle technique absolue.
</div>

## 55.5 State distant approfondi : le verrouillage en pratique

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — répondre à la question centrale de ce chapitre pour une équipe</span>
Rappel direct de la section 54.5, approfondi ici : un backend distant comme S3 (chapitre 46) associé à une table de verrouillage (souvent via DynamoDB sur AWS) empêche deux exécutions simultanées de `terraform apply` sur le même environnement — la seconde tentative attend ou échoue explicitement plutôt que de corrompre silencieusement le fichier d'état, exactement le même principe de protection contre les écritures concurrentes déjà rencontré pour le compare-and-swap du chapitre 6.
</div>

```hcl
terraform {
  backend "s3" {
    bucket         = "assuranceht-terraform-state"
    key            = "portail/production/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
  }
}
```

## 55.6 Multi-provider : AWS et Azure dans le même projet

<div class="encadre astuce">
<span class="encadre-titre">💡 Répondre à la question multi-cloud du chapitre 49</span>
Terraform peut gérer plusieurs providers simultanément dans un même projet — utile pour une organisation en situation multi-cloud consciente (chapitre 49), comme celle de ce manuel avec AWS pour le portail et Azure envisagé pour la gestion documentaire.
</div>

```hcl
provider "aws" {
  region = "us-east-1"
}

provider "azurerm" {
  features {}
}

resource "aws_instance" "portail" {
  # ... configuration AWS
}

resource "azurerm_linux_virtual_machine" "documentaire" {
  # ... configuration Azure
}
```

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — un outil unique pour une gouvernance cohérente</span>
Gérer AWS et Azure via le même outil Terraform, avec la même discipline de state distant et de revue de plan, apporte une cohérence de gouvernance directement alignée sur la recommandation du chapitre 49 : documenter et gérer consciemment une infrastructure multi-cloud, plutôt que de laisser chaque fournisseur être géré avec des outils et des pratiques complètement disjoints.
</div>

## 55.7 Un module réutilisable complet

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — la structure finale répond aux deux problèmes du scénario d'ouverture</span>
Un module `reseau` paramétré (section 55.2), appelé trois fois avec des variables différentes pour dev/test/production (section 55.3), chacun avec son propre state distant verrouillé (section 55.5), et une organisation prête à intégrer un second provider Azure si nécessaire (section 55.6) — la réponse complète et structurée aux deux problèmes soulevés dans le scénario d'ouverture.
</div>

## Atelier — Créer un module réseau pour les trois environnements

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 55 — Éliminer la duplication du scénario d'ouverture</span>

**Objectif** : structurer un module Terraform réutilisable pour les trois environnements du portail client.

**Préparation** : accès à un compte AWS de test avec Terraform installé, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Écris un module `reseau` paramétré par `environnement` et `cidr_vpc`, reprenant la structure de la section 55.2.
2. Crée trois dossiers d'environnement (développement, test, production) qui appellent ce module avec des valeurs différentes.
3. Configure un backend distant distinct pour chaque environnement, avec verrouillage.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le module unique dans `modules/reseau/` est appelé trois fois depuis `environnements/dev/`, `environnements/test/` et `environnements/production/`, chacun avec sa propre plage CIDR et son propre fichier de state distant (une `key` S3 différente par environnement, section 55.5) — garantissant qu'une opération sur l'environnement de test ne peut jamais affecter accidentellement le state ou l'infrastructure de production, tout en partageant la même logique de base sans duplication.

**Dépannage** : si une modification du module ne semble pas se propager à un environnement particulier, vérifie que `terraform init` a bien été relancé après la modification du module — Terraform doit retélécharger ou revalider les modules référencés après tout changement de leur code source.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — copier-coller la configuration entre environnements</span>
Exactement le problème initial du scénario d'ouverture — les modules (section 55.2) éliminent structurellement ce risque de divergence non intentionnelle.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — un state partagé sans verrouillage pour une équipe de plusieurs personnes</span>
Rappel de la section 55.5 : deux exécutions simultanées sans verrouillage peuvent corrompre le fichier d'état, un risque bien réel dès qu'une équipe dépasse une seule personne travaillant sur la même infrastructure.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — mélanger les environnements dans un seul fichier d'état</span>
Rappel de la section 55.4 : un seul state partagé entre développement et production augmente considérablement le risque qu'une opération destinée à un environnement de test affecte accidentellement la production.
</div>

## Diagnostiquer un conflit d'exécution simultanée

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Deux membres de l'équipe exécutent `terraform apply` en même temps sur le même environnement"</span>

- **Diagnostic** : avec un backend correctement verrouillé (section 55.5), la seconde exécution reçoit un message explicite indiquant que le state est déjà verrouillé par une autre opération en cours — jamais une corruption silencieuse.
- **Comment vérifier** : le message d'erreur de Terraform précise généralement qui détient le verrou et depuis quand, permettant de contacter directement la personne concernée plutôt que de forcer une action risquée.
- **Résolution** : attendre que la première opération se termine normalement ; si le verrou semble bloqué anormalement longtemps (par exemple après un crash du processus initial), `terraform force-unlock` existe mais doit être utilisé avec une extrême prudence, seulement après avoir confirmé qu'aucune opération n'est réellement encore en cours.
</div>

## En entreprise

- **Bonne pratique répandue** : structurer systématiquement toute logique Terraform destinée à être réutilisée dans plusieurs environnements en modules dès le départ, plutôt que d'attendre qu'une duplication déjà existante devienne pénible à maintenir.
- **Bonne pratique répandue** : documenter (chapitre 3) la structure des environnements et des states distants, pour que toute personne rejoignant l'équipe comprenne immédiatement où trouver et comment intervenir sur chaque environnement.
- **Erreur classique observée** : une organisation qui découvre, après un incident de production, qu'un changement testé et validé en développement n'avait en réalité jamais été appliqué de façon identique en production, faute de module partagé garantissant cette cohérence.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Qu'est-ce qu'un module Terraform, et pourquoi l'utiliser plutôt que de dupliquer du code ?"**
Réponse attendue : un module regroupe une logique réutilisable et paramétrée, appelable plusieurs fois avec des valeurs différentes — exactement le même principe déjà établi pour les rôles Ansible au chapitre 53, évitant la divergence progressive entre plusieurs copies d'une même configuration.

**Q2. "Pourquoi séparer les environnements (dev/test/production) en dossiers et states distincts, plutôt qu'un seul state partagé ?"**
Réponse attendue : un state partagé augmente le risque qu'une opération destinée à un environnement affecte accidentellement un autre — des states distincts, chacun correspondant à un environnement précis, isolent structurellement ce risque, au prix d'une légère duplication de la structure de dossiers (compensée par la réutilisation du module lui-même).

**Q3. "Comment le verrouillage du state Terraform protège-t-il une équipe de plusieurs personnes ?"**
Réponse attendue : il empêche deux exécutions simultanées de `terraform apply` sur le même environnement, la seconde tentative recevant un refus explicite plutôt que de risquer une corruption silencieuse du fichier d'état — le même principe de protection contre les écritures concurrentes déjà rencontré pour d'autres systèmes critiques dans ce manuel.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Configure systématiquement un verrouillage de state pour toute infrastructure gérée par plus d'une personne — le réflexe de sécurité le plus important de ce chapitre pour tout travail d'équipe.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Structure toute logique Terraform réutilisable en modules dès sa conception initiale, plutôt que d'attendre qu'une duplication déjà existante devienne difficile à corriger — le même principe déjà établi pour les rôles Ansible au chapitre 53.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Sépare les states par environnement pour limiter l'impact et la durée d'une opération Terraform à son périmètre réel, plutôt qu'un state géant unique ralentissant chaque `plan` et `apply` par l'évaluation de ressources sans rapport avec le changement réellement en cours.
</div>

## Résumé du chapitre

- Copier-coller une configuration Terraform entre environnements reproduit le même problème déjà résolu par les rôles Ansible au chapitre 53 — les modules Terraform apportent la même solution structurelle.
- Un module paramétré par variables peut être appelé plusieurs fois pour différents environnements, sans duplication de la logique elle-même.
- Des dossiers et states distincts par environnement, plutôt qu'un state partagé unique, réduisent le risque qu'une opération affecte accidentellement le mauvais environnement.
- Le verrouillage du state distant empêche une corruption silencieuse lors d'exécutions simultanées, un risque bien réel dès qu'une équipe dépasse une seule personne.
- Terraform peut gérer plusieurs providers (AWS, Azure) dans un même projet, apportant une cohérence de gouvernance à une infrastructure multi-cloud consciente (chapitre 49).

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un module Terraform sert principalement à :
   - a) Chiffrer le fichier d'état
   - b) Regrouper une logique réutilisable, paramétrée par des variables
   - c) Remplacer le besoin de providers
   - d) Accélérer uniquement `terraform init`

2. La bonne pratique pour gérer plusieurs environnements (dev/test/production) est de :
   - a) Utiliser un seul state partagé pour tous les environnements
   - b) Utiliser des dossiers et des states distincts par environnement, avec un module partagé
   - c) Dupliquer entièrement le code sans aucune structure commune
   - d) Ne jamais séparer les environnements

3. Le verrouillage du state Terraform sert à :
   - a) Chiffrer automatiquement les secrets
   - b) Empêcher deux exécutions simultanées de corrompre le fichier d'état
   - c) Accélérer l'exécution de `terraform apply`
   - d) Supprimer automatiquement les ressources inutilisées

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un module Terraform peut être appelé plusieurs fois avec des variables différentes, sans dupliquer sa logique interne. — **Vrai**.
2. Un state partagé unique entre tous les environnements est la pratique la plus sûre. — **Faux** (des states distincts par environnement réduisent le risque, section 55.4).
3. Terraform ne peut gérer qu'un seul fournisseur cloud à la fois dans un même projet. — **Faux** (multi-provider possible, section 55.6).
4. Sans verrouillage de state, deux exécutions simultanées de `terraform apply` peuvent corrompre le fichier d'état. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le problème résolu par les modules Terraform (section 55.2) est structurellement identique à celui déjà résolu par les rôles Ansible au chapitre 53.
2. Reprends le scénario d'ouverture. Explique comment la structure modulaire de ce chapitre facilite une future migration partielle vers Azure pour la gestion documentaire, sans perturber l'infrastructure AWS existante du portail.

**Corrigé 1** : dans les deux cas, une logique correcte mais dupliquée manuellement à travers plusieurs contextes (playbooks pour plusieurs objectifs, configurations pour plusieurs environnements) devient de plus en plus difficile à maintenir cohérente à mesure que les copies divergent au fil du temps — les rôles et les modules répondent tous deux en isolant cette logique une seule fois, réutilisable et paramétrable, garantissant qu'une correction ou une amélioration se propage automatiquement partout où elle est utilisée.

**Corrigé 2** : grâce au multi-provider (section 55.6) et à la structure modulaire déjà en place, ajouter les ressources Azure pour la gestion documentaire consisterait à ajouter un nouveau provider `azurerm` et de nouveaux modules dédiés, dans des dossiers et des states distincts de ceux du portail AWS déjà en production — la séparation stricte des états par environnement et par périmètre (déjà établie pour dev/test/production) garantit qu'aucune opération sur les nouvelles ressources Azure ne pourrait accidentellement affecter l'infrastructure AWS existante, exactement le bénéfice recherché par une gouvernance multi-cloud consciente.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 55.1</span>

Une équipe utilise un seul fichier de state partagé pour développement et production. Un ingénieur, en testant un changement en développement, exécute accidentellement `terraform apply` en pensant être sur cet environnement, mais le state chargé correspond en réalité à la production. Explique la conséquence, et comment la structure de la section 55.4 aurait évité cet incident.
</div>

**Corrigé :** Avec un state partagé, Terraform appliquerait le changement destiné au développement directement sur les ressources de production réelles — une confusion qui pourrait provoquer une interruption de service ou une perte de données selon la nature exacte du changement appliqué par erreur. Avec des dossiers et des states distincts par environnement (section 55.4), cette confusion devient structurellement impossible : l'ingénieur devrait explicitement naviguer vers le dossier `environnements/production/` et utiliser son backend distinct pour affecter la production, une action bien plus délibérée et difficile à déclencher accidentellement qu'une simple confusion de contexte au sein d'un état unique partagé.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 55.2</span>

Rédige, en 3 à 5 phrases, pourquoi la gouvernance multi-cloud déjà recommandée au chapitre 49 devient plus facile à appliquer concrètement une fois Terraform multi-provider adopté, plutôt qu'avec des outils entièrement séparés pour chaque fournisseur.
</div>

**Corrigé (exemple de réponse) :** Le chapitre 49 recommandait de documenter consciemment "quel système vit où et pourquoi" plutôt que de laisser une dispersion s'accumuler sans gouvernance — un projet Terraform unique, gérant à la fois AWS et Azure avec la même discipline de modules, de state distant verrouillé et de revue de plan avant application, rend cette gouvernance directement visible et applicable dans le code lui-même, plutôt que dispersée entre des outils et des pratiques complètement différents pour chaque fournisseur. Cette cohérence facilite aussi la formation de l'équipe, qui n'a besoin de maîtriser qu'un seul outil et une seule discipline opérationnelle, indépendamment du fournisseur cloud concerné par un changement donné.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais écrire un module Terraform paramétré et réutilisable.</li>
<li>☐ Je sais organiser plusieurs environnements avec des dossiers et states distincts.</li>
<li>☐ Je comprends pourquoi le verrouillage du state est indispensable pour une équipe de plusieurs personnes.</li>
<li>☐ Je sais configurer plusieurs providers (AWS, Azure) dans un même projet Terraform.</li>
<li>☐ Je sais diagnostiquer et résoudre un conflit d'exécution simultanée sur le state.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Les modules Terraform peuvent-ils être partagés entre plusieurs projets ou équipes ?</dt>
<dd>Oui, un module peut être publié dans un dépôt Git distinct ou sur le Terraform Registry public, puis référencé depuis plusieurs projets — une pratique qui rejoint directement la réutilisation déjà recherchée pour les rôles Ansible via Ansible Galaxy au chapitre 53.</dd>

<dt>Faut-il toujours utiliser DynamoDB pour le verrouillage du state sur AWS ?</dt>
<dd>C'est le mécanisme le plus répandu et documenté pour un backend S3, mais d'autres backends (Azure Storage, Terraform Cloud) proposent leurs propres mécanismes de verrouillage natifs — le principe reste identique, seule l'implémentation technique varie selon le backend choisi.</dd>

<dt>Combien de modules faut-il créer pour une infrastructure de taille moyenne ?</dt>
<dd>Il n'existe pas de chiffre universel — un bon repère est de créer un module dès qu'une logique doit être réutilisée dans plus d'un contexte (plusieurs environnements, ou des ressources similaires répétées), plutôt que de modulariser prématurément une logique utilisée une seule fois.</dd>

<dt>Un incident de verrouillage bloqué (state verrouillé après un crash) est-il fréquent ?</dt>
<dd>Relativement rare avec un backend correctement configuré, mais possible en cas d'interruption brutale d'une exécution en cours (perte de connexion réseau, arrêt forcé du processus) — `terraform force-unlock` existe précisément pour ce cas, à utiliser uniquement après confirmation qu'aucune opération n'est réellement encore active, rappel de la section "Diagnostiquer un conflit d'exécution simultanée".</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Terraform — Modules : [https://developer.hashicorp.com/terraform/language/modules](https://developer.hashicorp.com/terraform/language/modules)
- Documentation officielle Terraform — Verrouillage du state : [https://developer.hashicorp.com/terraform/language/state/locking](https://developer.hashicorp.com/terraform/language/state/locking)
- Terraform Registry — providers multi-cloud (AWS, Azure, GCP) : [https://registry.terraform.io/browse/providers](https://registry.terraform.io/browse/providers)

*Chapitre suivant : Jenkins et intégration continue pour l'infrastructure — automatiser l'exécution des playbooks Ansible et des plans Terraform à chaque changement, plutôt que de les exécuter manuellement depuis un poste individuel.*
