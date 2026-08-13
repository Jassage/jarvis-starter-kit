<div class="chapitre-titre-num">CHAPITRE 40 · 🟠 AVANCÉ</div>

# AWS pour DevOps

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Appliquer concrètement les concepts génériques du chapitre 39 à AWS, le fournisseur cloud le plus utilisé : EC2, VPC, Security Groups, IAM, EBS, S3, RDS, CloudWatch, Load Balancer, Route 53 — jusqu'à une architecture réaliste complète. Ce chapitre reste au niveau des services essentiels ; pour Azure, GCP et le FinOps (optimisation des coûts cloud), voir Manuel Administration Système, chapitres 45-50.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le chapitre 39 a présenté les concepts (IaaS, VPC, stockage, compute) de façon neutre, indépendamment de tout fournisseur. Ce chapitre leur donne un nom et une pratique concrets chez AWS — et surtout, montre comment chaque service AWS correspond à quelque chose déjà construit manuellement dans ce manuel, rendant leur apprentissage bien plus rapide qu'une découverte depuis zéro.
</div>

## 40.1 Correspondance directe avec ce que ce manuel a déjà construit

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Chaque service AWS de ce chapitre a un équivalent déjà construit manuellement</span>

```text
EC2              → le VPS du chapitre 3, chez AWS
VPC              → le réseau isolé du chapitre 39, section 39.3
Security Groups  → le pare-feu UFW du chapitre 5, à l'échelle AWS
IAM              → les utilisateurs et permissions du chapitre 5, appliqués au compte AWS lui-même
EBS              → le volume Docker du chapitre 11, mais un disque géré attaché à une instance EC2
S3               → le stockage hors serveur du chapitre 31, section 31.5
RDS              → PostgreSQL en conteneur (chapitre 11), mais entièrement géré (chapitre 39, section 39.4)
CloudWatch       → Prometheus + Grafana (chapitre 32), mais natif à AWS
Load Balancer    → le bloc upstream Nginx du chapitre 15, section 15.6, géré par AWS
Route 53         → la gestion DNS du chapitre 17, chez AWS
```
</div>

## 40.2 EC2 : une machine virtuelle

```bash
# Avec Terraform (chapitre 38), plutôt que la console web
resource "aws_instance" "labo" {
  ami           = "ami-0c55b159cbfafe1f0"  # Ubuntu 24.04 LTS
  instance_type = "t3.micro"
  key_name      = aws_key_pair.labo.key_name
  vpc_security_group_ids = [aws_security_group.web.id]
}
```

**Explication :** `ami` (*Amazon Machine Image*) désigne l'image de base (équivalent de l'image ISO Ubuntu du chapitre 3) ; `instance_type` désigne la taille de la machine (équivalent du "1 vCPU / 1 Go de RAM" du chapitre 26) ; le reste reprend exactement les concepts du chapitre 38.

## 40.3 VPC et Security Groups

```hcl
resource "aws_vpc" "principal" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.principal.id
  cidr_block = "10.0.1.0/24"
}

resource "aws_security_group" "web" {
  vpc_id = aws_vpc.principal.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["ton.ip.publique.fixe/32"]
  }
}
```

**Explication :** ce Security Group reprend exactement la logique du chapitre 5 (section 5.4) — autoriser explicitement le port 443 (HTTPS) pour tous (`0.0.0.0/0`), mais restreindre SSH (port 22) à une adresse IP précise plutôt qu'à tout Internet, une pratique de sécurité encore plus stricte que le pare-feu UFW de base.

## 40.4 IAM : gérer les accès au compte AWS lui-même

<div class="encadre securite">
<span class="encadre-titre">🔒 Le principe du moindre privilège, appliqué au compte cloud</span>
IAM (<em>Identity and Access Management</em>) contrôle qui peut faire quoi sur le compte AWS lui-même — exactement le même principe déjà appliqué au chapitre 4 (<code>sudo</code>), au chapitre 8 (permissions GitHub) et au chapitre 25 (secrets). Ne jamais utiliser le compte "root" AWS pour un usage quotidien (équivalent direct du chapitre 26, section 26.4, "ne jamais rester connecté en root") — créer des utilisateurs IAM nominatifs, avec des permissions strictement limitées à leur besoin réel.
</div>

```hcl
resource "aws_iam_user" "pipeline_ci" {
  name = "pipeline-ci-deploiement"
}

resource "aws_iam_user_policy" "acces_limite" {
  user = aws_iam_user.pipeline_ci.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ec2:DescribeInstances", "s3:PutObject"]
      Resource = "*"
    }]
  })
}
```

**Cas pratique DevOps :** un utilisateur IAM dédié au pipeline CI/CD (chapitre 27), avec des permissions strictement limitées aux actions réellement nécessaires (ici, décrire des instances et écrire sur S3) — jamais un accès administrateur complet pour une automatisation, même bien intentionnée.

## 40.5 S3 : stockage objet

```hcl
resource "aws_s3_bucket" "sauvegardes" {
  bucket = "mon-projet-sauvegardes-prod"
}
```

```bash
aws s3 cp sauvegarde.sql.gz s3://mon-projet-sauvegardes-prod/db/
```

**Cas pratique DevOps :** reprend exactement l'exemple du chapitre 31 (section 31.5) — un stockage physiquement séparé du serveur, désormais avec la commande AWS CLI précise plutôt qu'un exemple générique.

## 40.6 RDS : base de données managée

```hcl
resource "aws_db_instance" "principale" {
  engine            = "postgres"
  engine_version    = "16"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  db_name           = "app"
  username          = var.db_username
  password          = var.db_password
  backup_retention_period = 7
}
```

**Explication :** `backup_retention_period = 7` configure des sauvegardes automatiques quotidiennes avec 7 jours de rétention — exactement la politique du chapitre 31 (section 31.4), mais entièrement automatisée par AWS plutôt que via un script cron personnalisé.

## 40.7 CloudWatch : monitoring natif

```hcl
resource "aws_cloudwatch_metric_alarm" "cpu_eleve" {
  alarm_name          = "cpu-eleve"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  threshold           = 80
  alarm_actions       = [aws_sns_topic.alertes.arn]
}
```

**Explication :** reprend exactement la logique d'alerte du chapitre 32 (section 32.5) — un seuil (`threshold = 80`), une durée minimale (`evaluation_periods = 2` périodes de 300 secondes), une action déclenchée en cas de dépassement.

## 40.8 Load Balancer et Route 53

<div class="encadre memoriser">
<span class="encadre-titre">🧠 Load Balancer et Route 53 achèvent la correspondance</span>
Un Application Load Balancer AWS répartit le trafic entre plusieurs instances EC2, exactement le rôle du bloc <code>upstream</code> Nginx (chapitre 15, section 15.6) — mais géré et mis à l'échelle automatiquement par AWS. Route 53 gère les enregistrements DNS (chapitre 17) directement dans l'écosystème AWS, simplifiant la configuration quand le reste de l'infrastructure y vit déjà.
</div>

## Atelier — Une architecture AWS complète avec Terraform

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 40.1 — Provisionner l'équivalent AWS du chapitre 26</span>

**Objectif** : reproduire, avec les services de ce chapitre et Terraform (chapitre 38), une architecture équivalente au guide de déploiement manuel du chapitre 26.

**Étapes détaillées** :

1. Crée un VPC avec un sous-réseau public (section 40.3).
2. Provisionne une instance EC2 dans ce sous-réseau, avec un Security Group limitant SSH à ton IP et ouvrant 443 à tous (section 40.3).
3. Crée un bucket S3 pour les sauvegardes (section 40.5).
4. Crée un utilisateur IAM dédié au pipeline CI/CD avec des permissions minimales (section 40.4).
5. Ajoute une alerte CloudWatch sur l'utilisation CPU (section 40.7).

**Résultat attendu** : une architecture AWS de base, entièrement décrite en Terraform, reproduisant en quelques fichiers `.tf` ce que le chapitre 26 avait construit manuellement en 15 étapes.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Utiliser le compte root AWS au quotidien</span>
Comme détaillé en section 40.4, le compte root AWS (créé à l'ouverture du compte) ne devrait servir qu'à des tâches très spécifiques et rares — un utilisateur IAM nominatif avec des permissions appropriées pour tout usage quotidien, exactement le principe du chapitre 26 (section 26.4).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Un Security Group trop permissif ("0.0.0.0/0" partout)</span>
Ouvrir tous les ports à toutes les adresses IP par simplicité ("pour éviter les problèmes de connexion") annule tout l'intérêt du Security Group — reprendre la même discipline que le pare-feu UFW du chapitre 5, ouvrir seulement ce qui est strictement nécessaire.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Ignorer les coûts cumulés de services multiples</span>
Une architecture avec EC2, RDS, un Load Balancer et CloudWatch peut accumuler des coûts significativement plus élevés qu'un simple VPS (chapitre 3), particulièrement pour un projet de faible envergure — évaluer consciemment le besoin réel avant d'ajouter chaque service managé, en cohérence avec le chapitre 39 (section "Erreurs fréquentes", erreur n°2).
</div>

## En entreprise

**Réalité répandue** : AWS reste, en 2026, le fournisseur cloud le plus utilisé au monde en parts de marché, suivi d'Azure et de GCP — une compétence AWS reste la plus généralement recherchée sur le marché de l'emploi DevOps, bien que les concepts (chapitre 39) restent largement transposables entre fournisseurs.

**Bonne pratique répandue** : les architectures AWS de production sont presque systématiquement décrites en Infrastructure as Code (chapitre 38), jamais construites manuellement via la console web au-delà d'une phase d'exploration ou d'apprentissage initial.

**Erreur classique observée** : des factures AWS inattendues et élevées causées par des ressources oubliées (une instance EC2 de test jamais arrêtée, un volume EBS orphelin) — une vigilance régulière sur les ressources réellement actives, ou une politique de tags et de nettoyage automatisé, évite cette dérive.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre EC2 et RDS ?"**
Réponse attendue : EC2 est une machine virtuelle générale sur laquelle on peut installer et gérer soi-même n'importe quel logiciel, y compris une base de données en conteneur (chapitre 11) ; RDS est une base de données managée par AWS, avec sauvegardes et mises à jour automatisées (section 40.6, chapitre 39 section 39.4).

**Q2. "Pourquoi éviter d'utiliser le compte root AWS pour les tâches quotidiennes ?"**
Réponse attendue : principe du moindre privilège — un utilisateur IAM nominatif avec des permissions limitées réduit l'impact d'une erreur ou d'une compromission, le compte root ayant un pouvoir total et irrévocable sur l'ensemble du compte (section 40.4).

**Q3. "Comment limiterais-tu les permissions d'un pipeline CI/CD accédant à AWS ?"**
Réponse attendue : un utilisateur IAM dédié, avec une politique de permissions listant explicitement uniquement les actions nécessaires (par exemple, écrire sur un bucket S3 précis), jamais un accès administrateur complet (section 40.4).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
La correspondance de la section 40.1 est aussi une checklist de sécurité : chaque service AWS mérite la même rigueur déjà appliquée à son équivalent construit manuellement (Security Groups aussi stricts qu'UFW, IAM aussi rigoureux que les permissions Linux du chapitre 5).
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Tague systématiquement chaque ressource AWS créée (projet, environnement, propriétaire) — une pratique qui facilite énormément l'identification de ressources oubliées (section "Erreurs fréquentes", erreur n°3) et la répartition des coûts entre projets.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Choisir une région AWS proche des utilisateurs réels (chapitre 39, section 39.2) et dimensionner les instances selon la charge réelle mesurée (chapitre 32), plutôt que par surestimation préventive, optimise à la fois la performance et le coût.
</div>

## Résumé du chapitre

- Chaque service AWS de ce chapitre correspond à quelque chose déjà construit manuellement dans ce manuel : EC2 (VPS), VPC/Security Groups (réseau/pare-feu), IAM (permissions), S3 (stockage), RDS (base managée), CloudWatch (monitoring), Load Balancer/Route 53 (répartition de charge/DNS).
- Le compte root AWS ne devrait jamais servir à l'usage quotidien — un utilisateur IAM nominatif avec permissions limitées, comme pour tout autre système de ce manuel.
- Les architectures AWS de production se décrivent en Infrastructure as Code (Terraform, chapitre 38), rarement construites manuellement au-delà de l'apprentissage.
- Les coûts cumulés de services multiples méritent une évaluation consciente, jamais un ajout systématique sans réflexion.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. RDS, par rapport à une base de données en conteneur sur EC2 :
   - a) Nécessite de gérer soi-même les sauvegardes et mises à jour
   - b) Est une base de données entièrement managée par AWS
   - c) Ne peut pas utiliser PostgreSQL
   - d) Est toujours gratuit

2. Le compte root AWS devrait être utilisé :
   - a) Pour toutes les tâches quotidiennes
   - b) Rarement, réservé à des tâches très spécifiques, avec un utilisateur IAM nominatif pour le reste
   - c) Uniquement par le pipeline CI/CD
   - d) Jamais, même pour la configuration initiale

3. Un Security Group qui ouvre tous les ports à `0.0.0.0/0` :
   - a) Est une bonne pratique de sécurité
   - b) Annule l'intérêt même du Security Group
   - c) Est obligatoire pour qu'une instance EC2 fonctionne
   - d) Ne concerne que S3

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un utilisateur IAM peut avoir des permissions strictement limitées à certaines actions précises. — **Vrai** (section 40.4).
2. Les architectures AWS de production devraient être construites manuellement via la console web plutôt qu'en Infrastructure as Code. — **Faux** (section "En entreprise").
3. Une instance EC2 de test oubliée peut générer des coûts inattendus si elle n'est jamais arrêtée. — **Vrai** (section "Erreurs fréquentes", erreur n°3).

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 40.1</span>

Une équipe configure un Security Group ouvrant le port 5432 (PostgreSQL) à `0.0.0.0/0` "pour faciliter le débogage à distance". Explique le risque et propose une alternative plus sûre.
</div>

**Corrigé :** exposer directement le port de la base de données à l'ensemble d'Internet permet à quiconque de tenter une connexion, exposant la base à des attaques par force brute ou à l'exploitation d'une éventuelle vulnérabilité, bien au-delà de l'usage de débogage prévu (section "Erreurs fréquentes", erreur n°2, et rappel du chapitre 13, section 13.4 : seul un point d'entrée contrôlé devrait être exposé). Une alternative plus sûre consiste à restreindre l'accès au port 5432 à des adresses IP précises et de confiance (comme pour le port SSH en section 40.3), ou mieux encore, à n'exposer la base de données que sur le réseau privé interne (VPC, chapitre 39, section 39.3), accessible uniquement depuis l'application elle-même ou via un tunnel SSH sécurisé pour un débogage ponctuel.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais faire correspondre chaque service AWS de ce chapitre à son équivalent déjà construit manuellement dans ce manuel.</li>
<li>☐ Je sais provisionner une instance EC2 avec un VPC et un Security Group appropriés via Terraform.</li>
<li>☐ Je sais créer un utilisateur IAM avec des permissions limitées, plutôt que d'utiliser le compte root.</li>
<li>☐ Je sais configurer un bucket S3 et une instance RDS avec sauvegardes automatiques.</li>
<li>☐ Je sais configurer une alerte CloudWatch basique.</li>
<li>☐ Je réfléchis consciemment au coût cumulé avant d'ajouter chaque nouveau service managé.</li>
</ul>

## FAQ

<dl class="faq">
<dt>AWS propose-t-il un plan gratuit pour apprendre ?</dt>
<dd>Oui, AWS Free Tier offre un usage gratuit limité de nombreux services (dont EC2 t2.micro/t3.micro) pendant 12 mois pour un nouveau compte — suffisant pour les exercices de ce chapitre, à condition de bien surveiller les limites pour éviter tout coût imprévu.</dd>

<dt>Faut-il apprendre AWS en profondeur, ou seulement les bases de ce chapitre ?</dt>
<dd>Ce chapitre couvre le niveau "suffisant pour être opérationnel" sur les services les plus essentiels. Une expertise plus poussée (IAM avancé, VPC peering, architectures multi-comptes) dépasse le périmètre de ce manuel introductif — voir Manuel Administration Système, chapitres 45-50, pour Azure, GCP et le FinOps.</dd>

<dt>Comment ce chapitre se relie-t-il à Kubernetes (Partie XIII) ?</dt>
<dd>AWS propose EKS (Elastic Kubernetes Service), un Kubernetes managé qui s'appuie sur les mêmes concepts VPC/IAM/EBS de ce chapitre — la Partie XIII couvre Kubernetes de façon générique, transposable à EKS ou tout autre fournisseur.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle AWS : [https://docs.aws.amazon.com](https://docs.aws.amazon.com)
- AWS Well-Architected Framework — principes de conception d'architecture recommandés par AWS : [https://aws.amazon.com/architecture/well-architected/](https://aws.amazon.com/architecture/well-architected/)
- Manuel Administration Système, chapitres 45-50 — Azure, GCP et FinOps.

*Chapitre suivant : pourquoi Kubernetes — la Partie XIII s'ouvre. Le problème que Kubernetes résout avant le vocabulaire : cluster, node, pod, deployment, service, ingress.*
