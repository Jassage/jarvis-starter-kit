<div class="chapitre-titre-num">CHAPITRE 38 · 🟠 AVANCÉ</div>

# Terraform en pratique

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Provisionner un vrai serveur avec Terraform : `init`, `plan`, `apply`, `destroy`, en comprenant précisément ce que chaque commande fait, avec un avertissement explicite sur les risques de `destroy`. Ce chapitre reste volontairement au niveau "suffisant pour être opérationnel" — pour un usage avancé (modules réutilisables complexes, remote state partagé en équipe, workspaces), voir Manuel Administration Système, chapitre 53.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le chapitre 37 a expliqué pourquoi décrire l'infrastructure plutôt que la configurer manuellement change tout. Ce chapitre met cette théorie en pratique avec Terraform, l'outil IaC le plus utilisé, indépendant de tout fournisseur cloud particulier — provisionnant, pour la première fois dans ce manuel, un serveur automatiquement, sans jamais cliquer manuellement dans l'interface web d'un fournisseur.
</div>

## 38.1 Installation et structure d'un projet Terraform

```bash
# Sur ta machine locale
winget install --id Hashicorp.Terraform -e
```

```bash
# Sur macOS
brew install terraform
```

```text
mon-infrastructure/
├── main.tf          # ressources principales
├── variables.tf      # déclaration des variables
├── outputs.tf         # valeurs à afficher après application
└── terraform.tfvars   # valeurs réelles des variables (souvent non versionné, chapitre 25)
```

## 38.2 `main.tf` : décrire un serveur

```hcl
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

resource "digitalocean_droplet" "labo" {
  name     = "labo-devops-terraform"
  region   = "nyc1"
  size     = "s-1vcpu-1gb"
  image    = "ubuntu-24-04-x64"
  ssh_keys = [var.ssh_key_fingerprint]
}
```

**Explication :** `terraform { required_providers }` déclare quel **provider** (le plugin qui sait parler à l'API d'un fournisseur précis — ici DigitalOcean, mais Terraform supporte des centaines de providers, dont AWS, Azure, GCP) utiliser ; `resource "digitalocean_droplet" "labo"` déclare la ressource concrète à créer — reprenant exactement la syntaxe déclarative introduite au chapitre 37 (section 37.3).

```hcl
# variables.tf
variable "do_token" {
  description = "Jeton API DigitalOcean"
  type        = string
  sensitive   = true
}

variable "ssh_key_fingerprint" {
  description = "Empreinte de la clé SSH déjà enregistrée sur DigitalOcean"
  type        = string
}
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — `sensitive = true`</span>
Cette option (chapitre 25, appliquée ici) empêche Terraform d'afficher la valeur de cette variable dans ses journaux de sortie — le jeton API reste masqué même dans les logs de `plan`/`apply`, un réflexe systématique pour toute variable sensible.
</div>

## 38.3 Le cycle `init` → `plan` → `apply`

```bash
terraform init
```

**Explication :** télécharge les providers déclarés (`required_providers`) et initialise le dossier de travail — la toute première commande à exécuter dans tout nouveau projet Terraform, ou après l'ajout d'un nouveau provider.

```bash
terraform plan
```

**Résultat attendu** : un rapport détaillé de ce que Terraform **prévoit** de faire (créer, modifier, détruire) pour faire correspondre l'état réel à la description — **sans rien exécuter réellement**. Chaque ressource à créer apparaît précédée d'un `+`, à détruire d'un `-`, à modifier d'un `~`.

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — toujours lire `plan` avant `apply`</span>
Ne jamais exécuter <code>apply</code> sans avoir lu attentivement la sortie de <code>plan</code> juste avant — exactement le même réflexe que <code>nginx -t</code> avant <code>reload</code> (chapitre 15) ou la vérification d'une session SSH de secours avant de fermer l'ancienne (chapitre 6) : toujours vérifier avant d'appliquer un changement potentiellement irréversible.
</div>

```bash
terraform apply
```

**Résultat attendu** : Terraform réaffiche le même plan, demande une confirmation explicite (taper `yes`), puis exécute réellement les actions — créant le serveur décrit dans `main.tf`.

## 38.4 Le state, en pratique

```bash
terraform show
terraform state list
```

**Explication :** après un `apply` réussi, Terraform a créé un fichier `terraform.tfstate` — le "state" introduit conceptuellement au chapitre 37 (section 37.5), qui garde la trace exacte de ce qui a été créé, avec tous ses attributs réels (adresse IP obtenue, identifiants internes du fournisseur).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le fichier state ne doit jamais être versionné directement dans Git</span>
Le state contient souvent des informations sensibles (parfois des mots de passe en clair selon les ressources) et change à chaque exécution — le versionner dans Git (chapitre 7) exposerait ces informations et créerait des conflits de fusion constants. Pour un usage en équipe, un <strong>remote state</strong> (stocké sur un stockage partagé, comme S3, chapitre 40) est la pratique recommandée — approfondi dans Manuel Administration Système, chapitre 53, pour cet usage avancé.
</div>

## 38.5 `outputs.tf` : récupérer des informations après création

```hcl
output "adresse_ip_serveur" {
  value = digitalocean_droplet.labo.ipv4_address
}
```

```bash
terraform output adresse_ip_serveur
```

**Cas pratique DevOps :** cette adresse IP, obtenue automatiquement, peut ensuite alimenter directement le pipeline de déploiement du chapitre 27 (comme secret `SERVEUR_IP`) ou la configuration DNS du chapitre 17 — reliant enfin le provisionnement automatisé de ce chapitre au reste de la chaîne déjà construite.

## 38.6 `destroy` : la commande la plus dangereuse de ce chapitre

<div class="encadre attention">
<span class="encadre-titre">⚠️ `terraform destroy` supprime réellement toutes les ressources décrites</span>
Cette commande détruit <strong>immédiatement et réellement</strong> chaque ressource gérée par ce projet Terraform — le serveur, et tout ce qui n'a pas été sauvegardé ailleurs (rappel du chapitre 31 : une donnée qui n'existe que sur ce serveur, jamais sauvegardée séparément, disparaît définitivement). Ne jamais exécuter cette commande par réflexe ou par curiosité sur un environnement contenant des données réelles.
</div>

```bash
terraform plan -destroy
terraform destroy
```

**Explication :** `plan -destroy` (comme `plan` pour `apply`) montre précisément ce qui serait détruit, **sans rien exécuter** — un ultime filet de sécurité à toujours consulter avant `destroy`, jamais sauté même en environnement de test.

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Alternative plus sûre — `terraform state rm` pour retirer une ressource sans la détruire</span>
Si l'objectif est de retirer une ressource de la gestion Terraform <strong>sans la supprimer réellement</strong> (par exemple, une ressource qu'on souhaite désormais gérer manuellement), <code>terraform state rm</code> retire la ressource du state sans la toucher physiquement — une alternative bien plus sûre que <code>destroy</code> quand la véritable intention n'est pas la suppression.
</div>

## Atelier — Provisionner et détruire un serveur de test, en toute sécurité

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 38.1 — Le cycle complet, avec vérification à chaque étape</span>

**Objectif** : exécuter le cycle complet `init` → `plan` → `apply` → vérification → `destroy`, en lisant attentivement chaque sortie avant de continuer.

**Étapes détaillées** :

1. Écris `main.tf`, `variables.tf` avec un vrai jeton API (chapitre 25, jamais versionné) pour un fournisseur de ton choix.
2. `terraform init`, puis `terraform plan` — lis attentivement le rapport avant de continuer.
3. `terraform apply`, confirme, récupère l'adresse IP via `terraform output`.
4. Connecte-toi en SSH (chapitre 6) au serveur créé, vérifie qu'il correspond bien à la description.
5. `terraform plan -destroy`, lis attentivement, puis `terraform destroy` pour nettoyer les ressources de test.

**Résultat attendu** : un serveur réellement créé puis détruit, entièrement piloté par du code versionnable — la première boucle complète d'Infrastructure as Code de ce manuel.

**Dépannage** : si `terraform apply` échoue à mi-chemin, ne jamais réessayer aveuglément — relire le message d'erreur précis, et relancer `terraform plan` pour voir l'état réel avant toute nouvelle tentative.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Exécuter `apply` sans avoir lu `plan`</span>
Rappel de la section 38.3 : ne jamais appliquer un changement Terraform sans avoir vérifié précisément ce qui sera créé, modifié ou détruit.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Versionner `terraform.tfstate` dans Git</span>
Comme détaillé en section 38.4, le fichier state contient des informations sensibles et change à chaque exécution — ajouter systématiquement `*.tfstate` et `*.tfstate.backup` à `.gitignore` (chapitre 7) dès la création du projet.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — `destroy` exécuté sur le mauvais dossier ou environnement</span>
Exécuter `terraform destroy` dans le mauvais dossier de travail (par exemple, celui de la production plutôt que celui de test) peut détruire des ressources réelles par erreur — toujours vérifier avec `pwd` (chapitre 4) et relire attentivement la sortie de `plan -destroy` avant de confirmer.
</div>

## En entreprise

**Réalité répandue** : Terraform (ou son équivalent open source OpenTofu, né d'un changement de licence) reste l'outil d'Infrastructure as Code le plus utilisé à travers les fournisseurs cloud, précisément parce qu'il n'est lié à aucun fournisseur unique, contrairement à des solutions propriétaires comme AWS CloudFormation.

**Bonne pratique répandue** : les changements d'infrastructure Terraform passent par le même pipeline CI/CD que le code applicatif (chapitre 27) — `terraform plan` exécuté automatiquement sur chaque pull request (chapitre 8), avec le rapport publié en commentaire pour revue avant que `apply` ne soit exécuté, souvent avec une approbation manuelle (chapitre 21, section 21.5).

**Erreur classique observée** : un fichier `.tfvars` contenant de vrais secrets, commité par erreur (exactement l'erreur du chapitre 25) — la même discipline de gestion des secrets s'applique intégralement aux fichiers de variables Terraform.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Explique le cycle `init` → `plan` → `apply` de Terraform."**
Réponse attendue : `init` télécharge les providers nécessaires ; `plan` montre ce qui serait fait sans rien exécuter ; `apply` exécute réellement les changements après confirmation (section 38.3).

**Q2. "Pourquoi le fichier state ne doit-il jamais être versionné directement dans Git ?"**
Réponse attendue : il contient des informations potentiellement sensibles et change à chaque exécution, créant des conflits constants et des risques de sécurité — un remote state partagé est la pratique recommandée en équipe (section 38.4).

**Q3. "Quelles précautions prendrais-tu avant d'exécuter `terraform destroy` ?"**
Réponse attendue : vérifier le dossier de travail exact, exécuter `plan -destroy` pour voir précisément ce qui serait détruit avant toute confirmation, et s'assurer que les données importantes sont sauvegardées séparément (chapitre 31) si elles ne survivent pas à la destruction du serveur (section 38.6).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
`sensitive = true` sur toute variable sensible, `.gitignore` sur les fichiers state et `.tfvars` réels, jamais de secret Terraform en clair — la doctrine du chapitre 25 s'applique intégralement à l'Infrastructure as Code.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Commente les choix non évidents dans les fichiers `.tf` (pourquoi cette taille de serveur précise, pourquoi cette région) — un fichier de description d'infrastructure se relit et se modifie aussi souvent qu'un Dockerfile (chapitre 12).
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
`terraform plan` avant chaque `apply` prend un peu de temps supplémentaire, largement compensé par la sécurité qu'il apporte — jamais un réflexe à sauter pour "gagner du temps" sur une action potentiellement irréversible.
</div>

## Résumé du chapitre

- Terraform décrit l'infrastructure dans des fichiers `.tf`, avec un provider spécifique à chaque fournisseur (DigitalOcean, AWS, Azure, GCP...).
- Le cycle `init` → `plan` → `apply` sépare toujours la prévisualisation de l'exécution réelle — ne jamais sauter `plan`.
- Le state garde la trace de ce qui a été créé, ne doit jamais être versionné directement dans Git, sensible en équipe (remote state).
- `outputs.tf` récupère des informations après création, réutilisables dans le reste du pipeline.
- `terraform destroy` est la commande la plus dangereuse de ce chapitre — toujours précédée d'un `plan -destroy` lu attentivement.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. `terraform plan` :
   - a) Exécute réellement les changements
   - b) Montre ce qui serait fait, sans rien exécuter réellement
   - c) Supprime toutes les ressources
   - d) Télécharge les providers

2. Le fichier `terraform.tfstate` :
   - a) Devrait toujours être versionné directement dans Git
   - b) Ne devrait jamais être versionné directement dans Git, à cause d'informations sensibles
   - c) Est inutile et peut être supprimé sans conséquence
   - d) Contient uniquement le code source de l'application

3. `terraform destroy` :
   - a) Est totalement sans risque
   - b) Supprime réellement les ressources gérées par ce projet Terraform
   - c) Ne fait qu'un aperçu, sans rien exécuter
   - d) Fonctionne uniquement en environnement de développement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Il est acceptable d'exécuter `terraform apply` sans avoir lu la sortie de `plan` au préalable. — **Faux** (section 38.3, bonne pratique).
2. `terraform state rm` supprime physiquement une ressource. — **Faux** (elle retire seulement la ressource du state, sans la toucher, section 38.6).
3. Les variables sensibles Terraform devraient utiliser `sensitive = true` pour éviter leur affichage en clair dans les logs. — **Vrai** (section 38.2).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 38.1</span>

Un collègue propose d'exécuter directement `terraform apply` sans jamais lancer `plan` au préalable, pour "gagner du temps". Explique pourquoi cette pratique est risquée, avec un exemple concret de conséquence possible.
</div>

**Corrigé :** sans consulter `plan`, on applique un changement sans savoir précisément ce qu'il va faire — par exemple, une modification apparemment mineure d'un attribut d'une ressource peut, selon le provider, nécessiter de **détruire et recréer entièrement** la ressource concernée (un comportement clairement visible dans la sortie de `plan`, marqué `-/+`) plutôt qu'une simple mise à jour en place. Sans avoir vérifié ce détail au préalable, on pourrait détruire par surprise un serveur de production en pensant n'appliquer qu'un ajustement mineur — exactement le type d'erreur que la lecture systématique de `plan` avant `apply` (section 38.3) est conçue pour prévenir.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais structurer un projet Terraform (`main.tf`, `variables.tf`, `outputs.tf`).</li>
<li>☐ Je sais exécuter le cycle `init` → `plan` → `apply`, en lisant systématiquement `plan` avant `apply`.</li>
<li>☐ Je comprends le rôle du state et pourquoi il ne doit jamais être versionné directement.</li>
<li>☐ Je sais récupérer des informations post-création via `outputs.tf`.</li>
<li>☐ Je comprends les risques de `terraform destroy` et je sais toujours vérifier avec `plan -destroy` avant.</li>
<li>☐ J'ai réussi, en conditions réelles, à provisionner puis détruire un serveur de test avec Terraform.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Terraform ou OpenTofu ?</dt>
<dd>OpenTofu est un fork open source de Terraform, né d'un changement de licence de HashiCorp en 2023 — les deux partagent une syntaxe quasi identique pour l'usage de ce chapitre, le choix dépendant surtout de préférences organisationnelles sur la licence.</dd>

<dt>Terraform peut-il gérer des ressources déjà créées manuellement ?</dt>
<dd>Oui, via `terraform import`, une fonctionnalité qui permet d'intégrer une ressource existante dans la gestion Terraform — une fonctionnalité utile pour migrer progressivement une infrastructure manuelle (chapitre 26) vers l'Infrastructure as Code, non détaillée en profondeur dans ce chapitre introductif.</dd>

<dt>Faut-il apprendre Ansible en plus de Terraform ?</dt>
<dd>Terraform excelle à provisionner des ressources (créer un serveur, un réseau) ; Ansible excelle à configurer ce qui tourne dessus une fois créé (installer des paquets, gérer des fichiers de configuration) — les deux sont souvent utilisés ensemble dans des infrastructures plus complexes, hors du périmètre de ce manuel introductif.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Terraform : [https://developer.hashicorp.com/terraform/docs](https://developer.hashicorp.com/terraform/docs)
- Registre officiel des providers Terraform : [https://registry.terraform.io](https://registry.terraform.io)
- Manuel Administration Système, chapitre 53 — usage avancé de Terraform (modules complexes, remote state, workspaces).

*Chapitre suivant : comprendre le Cloud — IaaS, PaaS, SaaS, régions, zones, réseau, stockage, compute. Des concepts génériques avant tout outillage spécifique, préparant le chapitre 40 (AWS pour DevOps).*
