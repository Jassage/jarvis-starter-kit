<div class="chapitre-titre-num">CHAPITRE 54</div>

# Terraform : fondamentaux

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Provisionner l'infrastructure elle-même (VPC, instances, bases de données) de façon déclarative et reproductible, là où Ansible (chapitres 52-53) configure des systèmes déjà existants. À la fin de ce chapitre, tu sauras écrire une configuration Terraform de base, comprendre le rôle central et sensible du fichier d'état, et recréer l'architecture AWS du chapitre 46 de façon entièrement reproductible.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
L'architecture AWS du portail client (chapitre 46) — VPC, sous-réseaux, instance EC2, RDS — a été entièrement créée à la main via la console web AWS. Quand l'équipe doit recréer un environnement de test identique, personne ne se souvient précisément de tous les paramètres exacts choisis lors de la création initiale — la taille de l'instance, les plages d'adresses IP du VPC, les règles de pare-feu associées. Reconstruire cet environnement "à l'œil" via la console prend des heures et risque de produire un résultat subtilement différent. <em>"On a exactement le même problème que la dérive de configuration du chapitre 52,"</em> observe le DSI, <em>"mais appliqué à l'infrastructure elle-même plutôt qu'à la configuration des serveurs."</em> Terraform résout précisément ce problème.
</div>

## 54.1 Le problème du "ClickOps"

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — un terme qui désigne exactement le scénario d'ouverture</span>
Le **ClickOps** désigne la pratique de construire une infrastructure cloud manuellement, clic par clic, via une console web — exactement comment l'architecture AWS du chapitre 46 a été construite. Cette approche fonctionne pour une première exploration, mais devient rapidement un problème de reproductibilité (rappel direct du scénario d'ouverture) et de traçabilité (aucun historique de "qui a changé quoi et pourquoi", contrairement à Git, chapitre 51).
</div>

## 54.2 Terraform : provisionner, là où Ansible configure

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — une distinction essentielle avec les chapitres 52-53</span>
**Terraform** crée et gère le cycle de vie de l'infrastructure elle-même (une instance EC2 existe-t-elle, avec quelle taille, dans quel VPC) — **Ansible** configure ce qui tourne à l'intérieur d'une infrastructure déjà existante (quels paquets installés, quels utilisateurs, chapitres 52-53). Les deux outils sont complémentaires, pas concurrents : un flux de travail courant utilise Terraform pour provisionner une instance, puis Ansible pour la configurer une fois créée — exactement la transition annoncée à la fin du chapitre 53.
</div>

## 54.3 HCL : le langage déclaratif de Terraform

```hcl
# main.tf
resource "aws_instance" "portail_app" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.public.id

  tags = {
    Projet      = "PortailClient"
    Environnement = "Production"
  }
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 HCL, une syntaxe déclarative proche de YAML dans l'esprit</span>
**HCL** (*HashiCorp Configuration Language*) décrit un état désiré — exactement la même philosophie déclarative déjà pratiquée en YAML pour Docker Compose (chapitre 41), Kubernetes (chapitre 43) et Ansible (chapitres 52-53), avec une syntaxe propre à Terraform. Le rappel du tagging systématique (chapitre 50, FinOps) apparaît directement dans cet exemple — une discipline désormais appliquée dès la définition de l'infrastructure elle-même, pas ajoutée après coup.
</div>

## 54.4 Les providers : rappel direct des chapitres 46-48

<div class="encadre astuce">
<span class="encadre-titre">💡 Un seul outil, plusieurs fournisseurs</span>
Un **provider** Terraform connecte la configuration HCL à un fournisseur précis (AWS, Azure, GCP — chapitres 46-48, ou même Kubernetes, chapitre 42). Une même syntaxe et une même discipline de travail s'appliquent quel que soit le fournisseur, ce qui explique en partie pourquoi Terraform reste pertinent dans une stratégie multi-cloud (chapitre 49) : la compétence Terraform elle-même reste largement transférable d'un fournisseur à l'autre, même si les ressources spécifiques diffèrent.
</div>

```hcl
provider "aws" {
  region = "us-east-1"
}
```

## 54.5 Le fichier d'état : le concept le plus sensible de ce chapitre

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le state Terraform, une information critique à protéger</span>
Terraform maintient un **fichier d'état** (*state*) qui associe chaque ressource déclarée dans la configuration HCL à la ressource réelle correspondante dans le cloud — c'est ce fichier qui permet à Terraform de savoir ce qui existe déjà, ce qui doit être créé, modifié ou détruit. Ce fichier peut contenir des informations sensibles (parfois des mots de passe générés automatiquement) et représente une cartographie complète et à jour de l'infrastructure — sa perte ou sa corruption peut rendre Terraform incapable de gérer correctement l'infrastructure existante, un risque bien plus grave qu'une simple gêne opérationnelle.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — ne jamais committer le state en clair dans Git</span>
Exactement le même principe déjà établi pour les secrets Ansible (chapitre 53) : le fichier d'état ne doit jamais être committé en clair dans un dépôt Git partagé, en raison des informations sensibles qu'il peut contenir. La bonne pratique consiste à utiliser un **backend distant** (comme un bucket S3 chiffré, chapitre 46, avec verrouillage pour éviter les écritures concurrentes) plutôt qu'un fichier local — une pratique d'autant plus nécessaire pour une équipe de plusieurs personnes travaillant sur la même infrastructure.
</div>

```hcl
# backend.tf -- stocker le state a distance, jamais en local uniquement
terraform {
  backend "s3" {
    bucket = "assuranceht-terraform-state"
    key    = "portail/terraform.tfstate"
    region = "us-east-1"
  }
}
```

## 54.6 `plan` et `apply` : le "dry run" universel

```
# Initialiser le repertoire de travail (telecharge les providers necessaires)
terraform init

# Afficher precisement ce qui SERAIT change, sans rien appliquer --
# le meme reflexe de prudence deja etabli pour --check au chapitre 52
terraform plan

# Appliquer reellement les changements, apres avoir revu le plan
terraform apply
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours lire le plan avant d'appliquer</span>
Rappel direct du principe déjà établi pour `--check` avec Ansible (chapitre 52) et pour tout changement à risque (chapitre 2) : `terraform plan` affiche précisément ce qui serait créé, modifié ou **détruit**, avant toute application réelle — ignorer cette étape et appliquer directement expose au risque de suppression accidentelle d'une ressource critique, sans avertissement préalable.
</div>

## 54.7 Recréer l'architecture du chapitre 46

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — la réponse complète au scénario d'ouverture</span>
Une fois le VPC, les sous-réseaux, l'instance EC2 et RDS du chapitre 46 décrits en HCL, recréer un environnement de test identique devient une simple exécution de `terraform apply` sur une nouvelle configuration nommée différemment — exactement le besoin exprimé par le DSI dans le scénario d'ouverture, résolu en quelques minutes plutôt qu'en plusieurs heures de reconstruction manuelle incertaine via la console.
</div>

## Atelier — Décrire l'architecture AWS en Terraform

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 54 — Rendre reproductible l'architecture du chapitre 46</span>

**Objectif** : traduire l'architecture VPC/EC2/RDS du chapitre 46 en configuration Terraform.

**Préparation** : accès à un compte AWS de test avec Terraform installé, ou une lecture attentive suffit pour cet atelier conceptuel.

**Étapes détaillées** :

1. Décris, en HCL, les ressources VPC et sous-réseaux public/privé du chapitre 46 (section 46.4).
2. Ajoute la ressource EC2 pour l'application, avec un tagging cohérent (rappel du chapitre 50).
3. Explique pourquoi le backend distant (section 54.5) est indispensable avant que l'équipe entière ne commence à utiliser cette configuration.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : les ressources `aws_vpc`, `aws_subnet` (public et privé, rappel de la segmentation du chapitre 46) et `aws_instance` reprennent exactement la même architecture déjà construite manuellement, mais désormais entièrement décrite en code. Le backend distant est indispensable dès qu'une seconde personne pourrait exécuter `terraform apply` sur la même infrastructure — sans lui, chaque personne disposerait d'un état local potentiellement désynchronisé de la réalité, provoquant des conflits ou des actions destructrices imprévues.

**Dépannage** : si `terraform plan` propose de recréer une ressource qui existe déjà manuellement (créée via la console avant l'adoption de Terraform), utilise `terraform import` pour faire correspondre cette ressource existante à sa déclaration HCL, plutôt que de la laisser détruire et recréer inutilement.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un fichier d'état local, jamais partagé ni sauvegardé</span>
Exactement le risque de la section 54.5 — la perte de ce fichier laisse Terraform incapable de gérer correctement l'infrastructure existante, un risque bien supérieur à une simple gêne.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — committer le state en clair dans Git</span>
Rappel de la section 54.5 : ce fichier peut contenir des informations sensibles, exactement le même risque déjà dénoncé pour les secrets Ansible non chiffrés au chapitre 53.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — exécuter `terraform apply` sans avoir lu le plan au préalable</span>
Rappel de la section 54.6 : ignorer cette étape expose au risque de suppression accidentelle d'une ressource critique, sans avertissement préalable — le même risque déjà dénoncé pour tout changement appliqué sans revue au chapitre 2.
</div>

## Diagnostiquer une dérive entre le state et la réalité

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "L'infrastructure réelle a été modifiée manuellement (ClickOps) après l'adoption de Terraform, et `terraform plan` propose maintenant des changements inattendus"</span>

- **Diagnostic** : une modification manuelle (via la console, en dehors de Terraform) crée une divergence entre le fichier d'état et la réalité — exactement la même dérive de configuration déjà dénoncée au chapitre 52, appliquée ici à l'infrastructure plutôt qu'à la configuration système.
- **Comment vérifier** : `terraform plan` révèle précisément cette divergence, en comparant l'état enregistré à l'état réel actuel de l'infrastructure.
- **Résolution** : soit aligner l'infrastructure réelle sur la configuration HCL (en appliquant le plan proposé), soit mettre à jour la configuration HCL pour refléter le changement manuel voulu, puis exécuter `terraform apply` pour resynchroniser le state — jamais laisser cette divergence s'accumuler sans la traiter consciemment, au risque de perdre progressivement le contrôle réel de l'infrastructure gérée par Terraform.
</div>

## En entreprise

- **Bonne pratique répandue** : configurer un backend distant avec verrouillage dès le premier projet Terraform d'une équipe de plus d'une personne, jamais après coup une fois le risque de conflit déjà matérialisé.
- **Bonne pratique répandue** : interdire toute modification manuelle (ClickOps) des ressources gérées par Terraform, pour préserver la cohérence entre le state et la réalité — une discipline d'équipe à faire respecter, pas seulement une bonne pratique individuelle.
- **Erreur classique observée** : une infrastructure Terraform et des modifications manuelles ponctuelles coexistant sans discipline claire, provoquant des divergences de state de plus en plus fréquentes et difficiles à résoudre à mesure que le temps passe.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre Terraform et Ansible ?"**
Réponse attendue : Terraform provisionne et gère le cycle de vie de l'infrastructure elle-même (créer, modifier, détruire des ressources cloud) ; Ansible configure ce qui tourne à l'intérieur d'une infrastructure déjà existante — les deux outils sont complémentaires, souvent utilisés ensemble dans un même flux de travail.

**Q2. "Pourquoi le fichier d'état Terraform est-il si sensible, et comment le protéger correctement ?"**
Réponse attendue : il associe chaque ressource déclarée à sa ressource réelle correspondante, peut contenir des informations sensibles, et sa perte rend Terraform incapable de gérer correctement l'infrastructure existante — il doit être stocké dans un backend distant avec verrouillage, jamais localement ni committé en clair dans Git.

**Q3. "Que se passe-t-il si quelqu'un modifie manuellement une ressource gérée par Terraform, en dehors de tout `apply` ?"**
Réponse attendue : une divergence (drift) apparaît entre le fichier d'état et la réalité, détectable via `terraform plan` — cette divergence doit être résolue consciemment, soit en réalignant l'infrastructure sur la configuration, soit en mettant à jour la configuration pour refléter le changement voulu, jamais laissée sans traitement.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Configure systématiquement un backend distant chiffré pour le fichier d'état, avec verrouillage — jamais un state local ou committé en clair, le réflexe de sécurité le plus important de ce chapitre.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Applique le même tagging systématique déjà établi au chapitre 50 dès la définition des ressources en HCL — la discipline FinOps commence dès la conception de l'infrastructure, pas ajoutée après coup une fois les ressources déjà créées.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Structure les configurations Terraform en modules réutilisables (approfondi au chapitre 55) plutôt qu'un seul fichier monolithique — le même principe déjà établi pour les rôles Ansible (chapitre 53), appliqué ici au provisionnement d'infrastructure.
</div>

## Résumé du chapitre

- Terraform provisionne l'infrastructure elle-même (VPC, instances, bases de données), tandis qu'Ansible configure ce qui tourne à l'intérieur d'une infrastructure déjà existante.
- HCL décrit un état désiré de façon déclarative, dans le même esprit que YAML déjà pratiqué pour Docker Compose, Kubernetes et Ansible.
- Le fichier d'état associe chaque ressource déclarée à sa ressource réelle correspondante — il doit toujours résider dans un backend distant sécurisé, jamais localement ni en clair dans Git.
- `terraform plan` doit toujours précéder `terraform apply`, exactement le même principe de prudence déjà établi pour `--check` avec Ansible.
- Une modification manuelle (ClickOps) d'une ressource gérée par Terraform crée une divergence détectable, à résoudre consciemment plutôt qu'ignorée.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Terraform sert principalement à :
   - a) Configurer des paquets sur un serveur déjà existant
   - b) Provisionner et gérer le cycle de vie de l'infrastructure elle-même
   - c) Chiffrer des secrets applicatifs
   - d) Remplacer entièrement Ansible

2. Le fichier d'état Terraform devrait être stocké :
   - a) Localement uniquement, sur le poste de chaque développeur
   - b) Dans un backend distant sécurisé avec verrouillage
   - c) En clair dans le dépôt Git public du projet
   - d) Il n'est pas nécessaire de le conserver

3. `terraform plan` sert à :
   - a) Appliquer immédiatement tous les changements
   - b) Afficher ce qui serait modifié, sans rien appliquer réellement
   - c) Supprimer le fichier d'état
   - d) Installer les providers nécessaires

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Terraform et Ansible sont des outils concurrents, on ne devrait jamais les utiliser ensemble. — **Faux** (complémentaires, section 54.2).
2. Une modification manuelle d'une ressource gérée par Terraform crée une divergence détectable via `terraform plan`. — **Vrai**.
3. Le fichier d'état Terraform ne contient jamais d'information sensible. — **Faux** (il peut contenir des secrets, section 54.5).
4. Appliquer directement `terraform apply` sans consulter le plan au préalable est une pratique recommandée pour gagner du temps. — **Faux** (rappel du même risque déjà dénoncé pour tout changement non revu).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le "ClickOps" du scénario d'ouverture rend la reconstruction d'un environnement de test particulièrement risquée et lente.
2. Reprends la section 54.2. Explique avec un exemple concret comment Terraform et Ansible se combineraient pour provisionner et configurer un nouveau serveur pour le portail client.

**Corrigé 1** : sans description explicite et versionnée de l'infrastructure, la reconstruction dépend entièrement de la mémoire humaine des paramètres exacts utilisés lors de la création initiale — une mémoire faillible et sujette à l'oubli de détails apparemment mineurs (une plage d'adresses IP précise, un paramètre de sécurité spécifique) qui peuvent pourtant avoir un impact réel sur le comportement de l'environnement recréé. Ce risque est exactement celui déjà identifié pour la dérive de configuration au chapitre 52, ici appliqué à l'infrastructure plutôt qu'aux serveurs déjà provisionnés.

**Corrigé 2** : Terraform créerait d'abord l'instance EC2 elle-même (avec sa taille, son VPC, ses règles réseau, section 54.3), puis, une fois cette instance disponible, un playbook Ansible (chapitres 52-53) s'y connecterait via SSH pour installer les paquets nécessaires, configurer les utilisateurs et déployer l'application — chaque outil intervenant exactement dans son domaine de responsabilité respectif : Terraform pour l'existence et la forme de l'infrastructure, Ansible pour ce qui tourne à l'intérieur une fois cette infrastructure disponible.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 54.1</span>

Un membre de l'équipe supprime accidentellement le fichier d'état Terraform local, sans backend distant configuré. Explique les conséquences concrètes pour la gestion future de l'infrastructure déjà créée.
</div>

**Corrigé :** Sans ce fichier, Terraform perd toute connaissance de la correspondance entre sa configuration HCL et les ressources réellement existantes dans le cloud — une nouvelle exécution de `terraform plan` proposerait probablement de recréer l'ensemble de l'infrastructure depuis zéro, ignorant totalement que ces ressources existent déjà, avec un risque réel de duplication ou de conflit si cette recréation était appliquée sans discernement. La récupération nécessiterait soit une sauvegarde antérieure du fichier d'état (d'où l'importance cruciale d'un backend distant, section 54.5, qui inclut généralement un historique de versions), soit une reconstruction laborieuse du state via `terraform import` ressource par ressource, un travail long et sujet à l'erreur comparé à la simple restauration d'un backend correctement configuré dès le départ.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 54.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe à proposer pour éviter que le "ClickOps" ne reprenne une fois Terraform adopté, en t'appuyant sur la section "Diagnostiquer une dérive entre le state et la réalité".
</div>

**Corrigé (exemple de réponse) :** Toute ressource gérée par Terraform ne doit plus jamais être modifiée manuellement via la console du fournisseur cloud — tout changement doit passer par une modification de la configuration HCL suivie de `terraform plan` puis `terraform apply`, exactement le même principe déjà établi pour "modifier le manifeste, jamais l'objet en direct" au chapitre 43. Un contrôle périodique (`terraform plan` exécuté régulièrement, même sans changement prévu) permettrait de détecter proactivement toute dérive accidentelle avant qu'elle ne s'accumule, dans le même esprit de supervision proactive déjà établi au chapitre 1.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends la différence entre Terraform (provisionnement) et Ansible (configuration).</li>
<li>☐ Je sais écrire une configuration HCL de base avec des ressources et un provider.</li>
<li>☐ Je comprends pourquoi le fichier d'état est sensible et doit résider dans un backend distant sécurisé.</li>
<li>☐ Je sais utiliser `terraform plan` avant `terraform apply`, systématiquement.</li>
<li>☐ Je sais diagnostiquer une divergence entre le state et la réalité (drift).</li>
<li>☐ Je comprends le risque du "ClickOps" et pourquoi Terraform y répond directement.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il migrer immédiatement toute l'infrastructure existante vers Terraform ?</dt>
<dd>Non, une migration progressive reste plus réaliste — `terraform import` permet d'intégrer une ressource existante à la gestion Terraform sans la recréer, une approche à privilégier pour les systèmes déjà en production plutôt qu'une bascule complète et risquée en une seule fois.</dd>

<dt>Terraform peut-il gérer des ressources on-premise, pas seulement le cloud ?</dt>
<dd>Oui, des providers existent pour de nombreuses technologies on-premise (VMware vSphere, Proxmox déjà rencontrés en Partie 6) — Terraform n'est pas limité aux fournisseurs cloud publics, bien que son usage le plus répandu reste effectivement le provisionnement cloud.</dd>

<dt>Que se passe-t-il si deux personnes exécutent `terraform apply` simultanément sur la même infrastructure ?</dt>
<dd>Sans backend distant avec verrouillage (section 54.5), ce scénario peut corrompre le fichier d'état ou provoquer des actions contradictoires — le verrouillage empêche précisément cette situation en refusant une seconde exécution tant que la première n'est pas terminée, exactement le même principe de protection contre les écritures concurrentes déjà rencontré ailleurs dans ce manuel (comme le compare-and-swap du chapitre 6).</dd>

<dt>Faut-il connaître un fournisseur cloud spécifique (AWS, Azure, GCP) avant d'apprendre Terraform ?</dt>
<dd>Une connaissance de base d'au moins un fournisseur (comme AWS, chapitre 46) facilite grandement la compréhension des ressources Terraform correspondantes — les concepts de Terraform lui-même (state, plan, apply) restent cependant transférables d'un fournisseur à l'autre, une fois maîtrisés une première fois.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Terraform (HashiCorp) : [https://developer.hashicorp.com/terraform/docs](https://developer.hashicorp.com/terraform/docs)
- Terraform Registry — providers et modules officiels et communautaires : [https://registry.terraform.io/](https://registry.terraform.io/)
- HashiCorp — Bonnes pratiques de gestion du fichier d'état : [https://developer.hashicorp.com/terraform/language/state](https://developer.hashicorp.com/terraform/language/state)

*Chapitre suivant : Terraform avancé — modules, state distant approfondi et gestion multi-provider, pour structurer une infrastructure Terraform à l'échelle de toute l'entreprise.*
