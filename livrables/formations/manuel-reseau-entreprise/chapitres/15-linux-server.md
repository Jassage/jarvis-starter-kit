<div class="chapitre-titre-num">CHAPITRE 15</div>

# Linux Server

## Objectifs pédagogiques

Déployer Samba pour l'interopérabilité avec Windows, NFS pour le partage de fichiers Unix, sécuriser l'accès SSH, configurer Apache/Nginx, et conteneuriser des services avec Docker.

## Prérequis

Chapitres 1-14.

## 15.1 Samba : interopérabilité Windows/Linux

<div class="encadre astuce">
<span class="encadre-titre">💡 Samba permet à un serveur Linux de rejoindre un domaine Active Directory existant</span>
Samba réimplémente les protocoles Microsoft (SMB/CIFS, et depuis Samba 4 le protocole Active Directory lui-même) — un serveur de fichiers Linux peut ainsi s'intégrer de façon transparente à l'annuaire Active Directory du chapitre 14, authentifiant les accès avec les mêmes comptes utilisateurs Windows.
</div>

```bash
sudo apt install samba samba-common-bin winbind libpam-winbind libnss-winbind

sudo net ads join -U administrateur entreprise.local

# Partage Samba integre a Active Directory
sudo tee -a /etc/samba/smb.conf <<EOF
[Documents-Projets]
   path = /srv/partages/projets
   valid users = @"ENTREPRISE\Comptabilite-Users"
   read only = no
EOF

sudo systemctl restart smbd
```

## 15.2 NFS (Network File System)

<div class="encadre astuce">
<span class="encadre-titre">💡 NFS : le partage de fichiers natif du monde Unix/Linux</span>
Contrairement à Samba (pensé pour l'interopérabilité Windows), NFS est le protocole natif de partage de fichiers entre systèmes Unix/Linux, plus performant dans cet environnement homogène — pertinent notamment pour des clusters de calcul ou des environnements de virtualisation Linux (chapitre 36, datacenter).
</div>

```bash
sudo apt install nfs-kernel-server

sudo tee -a /etc/exports <<EOF
/srv/partages/donnees 10.10.20.0/23(rw,sync,no_subtree_check)
EOF

sudo exportfs -a
sudo systemctl restart nfs-kernel-server
```

Côté client :

```bash
sudo mount -t nfs 10.10.60.20:/srv/partages/donnees /mnt/donnees
```

## 15.3 SSH : accès distant sécurisé

<div class="encadre attention">
<span class="encadre-titre">⚠️ Désactiver l'authentification par mot de passe au profit des clés SSH</span>
L'authentification par mot de passe reste vulnérable au bruteforce même avec un mot de passe complexe (tentatives automatisées 24/7 depuis Internet) — l'authentification par clé publique/privée, combinée à la désactivation de la connexion directe du compte root, constitue le standard de sécurité minimal pour tout serveur exposé, même en interne.
</div>

```bash
# Generation de la paire de cles cote client
ssh-keygen -t ed25519 -C "admin@entreprise.local"
ssh-copy-id admin@10.10.60.20

# Cote serveur : /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no
Port 2222
AllowUsers admin technicien

sudo systemctl restart sshd
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Changer le port SSH par défaut réduit le bruit des scans automatisés, sans remplacer une vraie politique de sécurité</span>
Modifier le port 22 par défaut (`Port 2222`) diminue le volume de tentatives de connexion automatisées non ciblées, mais ne doit jamais être considéré comme une mesure de sécurité suffisante à elle seule — la désactivation de `PasswordAuthentication` reste la protection réellement efficace.
</div>

## 15.4 Apache et Nginx

<div class="encadre astuce">
<span class="encadre-titre">💡 Apache : configuration riche et modulaire ; Nginx : performance et faible empreinte mémoire</span>
Apache (via des fichiers `.htaccess` et une architecture par modules) reste répandu pour des applications héritées ou nécessitant une configuration très fine par dossier. Nginx, à l'architecture événementielle plus légère, s'impose comme reverse proxy performant devant des applications modernes (rappel direct du manuel Node.js/Express de cette même collection) et pour des sites à fort trafic.
</div>

**Nginx en reverse proxy devant une application interne**

```nginx
server {
    listen 443 ssl;
    server_name intranet.entreprise.local;

    ssl_certificate /etc/nginx/ssl/intranet.crt;
    ssl_certificate_key /etc/nginx/ssl/intranet.key;

    location / {
        proxy_pass http://10.10.60.15:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 15.5 Docker : conteneurisation de services

<div class="encadre astuce">
<span class="encadre-titre">💡 Docker isole chaque service applicatif dans son propre environnement reproductible</span>
Rappel direct du manuel Node.js/Express de cette même collection (chapitre Docker) : conteneuriser un VMS de vidéosurveillance (chapitre 22), un outil de supervision (chapitre 24), ou une application métier interne facilite le déploiement, la mise à jour et la portabilité entre serveurs, sans "pollution" de dépendances sur le système hôte.
</div>

```bash
sudo apt install docker.io docker-compose-plugin

# Exemple : deployer un outil de supervision (Zabbix, chapitre 24) via Docker Compose
docker compose up -d
```

```yaml
# docker-compose.yml
services:
  zabbix-server:
    image: zabbix/zabbix-server-mysql
    ports:
      - "10051:10051"
    environment:
      DB_SERVER_HOST: "mysql-server"
    restart: unless-stopped

  zabbix-web:
    image: zabbix/zabbix-web-nginx-mysql
    ports:
      - "8080:8080"
    restart: unless-stopped
```

## 15.6 Virtualisation Linux (KVM, alternative à Hyper-V)

```bash
sudo apt install qemu-kvm libvirt-daemon-system virtinst bridge-utils

virt-install --name srv-nginx-01 --memory 2048 --vcpus 2 \
  --disk size=20 --os-variant ubuntu22.04 \
  --network bridge=br0 --cdrom /iso/ubuntu-22.04.iso
```

## 15.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Exposer un partage NFS sans restriction d'adresse source</span>
Un export NFS ouvert à `*` (toutes les adresses) permet à n'importe quel poste du réseau, y compris compromis, de monter le partage — toujours restreindre l'export à un sous-réseau précis (rappel de la section 15.2, `10.10.20.0/23`), cohérent avec la segmentation VLAN du chapitre 6.
</div>

## 15.8 Bonnes pratiques

- Désactiver systématiquement l'authentification SSH par mot de passe au profit des clés.
- Restreindre chaque export NFS et partage Samba au VLAN/sous-réseau strictement nécessaire.
- Conteneuriser les services applicatifs autant que possible, pour simplifier maintenance et migration.

## 15.9 Résumé du chapitre

- Samba assure l'interopérabilité avec Active Directory (chapitre 14) ; NFS reste le partage natif performant entre systèmes Unix/Linux.
- L'authentification SSH par clé, combinée à la désactivation de la connexion root directe, est le standard de sécurité minimal.
- Nginx s'impose comme reverse proxy performant ; Docker conteneurise et isole les services applicatifs.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 15.1</span>

Sécurisez un accès SSH en désactivant l'authentification par mot de passe et la connexion root directe, sur un port non standard.
</div>

**Corrigé :**
```
# /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no
Port 2222
```
```bash
sudo systemctl restart sshd
```

*Chapitre suivant : la cybersécurité d'entreprise (segmentation, Zero Trust, MFA, EDR, SIEM).*
