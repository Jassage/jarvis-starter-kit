<div class="chapitre-titre-num">ANNEXE A</div>

# Aide-mémoire des commandes Windows/Linux

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de l'annexe</span>
Rassembler, par thème et par chapitre de référence, les commandes natives Windows et Linux utilisées tout au long de ce manuel — hors PowerShell, CMD et scripts d'automatisation, déjà couverts en profondeur par le manuel dédié <em>manuel-windows-terminal</em>. Cette annexe sert de pense-bête rapide pour un administrateur en intervention, pas de substitut à la compréhension conceptuelle déjà développée dans les chapitres correspondants.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Portée de cette annexe</span>
Les commandes ci-dessous sont classées par domaine fonctionnel plutôt que par ordre alphabétique, pour rester utilisables comme un pense-bête de travail. Chaque section renvoie au chapitre où le concept sous-jacent est expliqué en détail — cette annexe ne remplace jamais cette explication, elle en facilite seulement le rappel rapide une fois la notion déjà comprise.
</div>

## A.1 Active Directory et identité (chapitres 5-8, 22-26)

```
dsquery user -name "*"                    # Rechercher des comptes utilisateurs
dsget user "<DN>" -memberof               # Lister les groupes d'un utilisateur
gpupdate /force                           # Forcer l'application des GPO
gpresult /r                               # Afficher les GPO appliquees a la session
repadmin /replsummary                     # Etat de la replication AD (chapitre 6)
repadmin /showrepl                        # Detail des partenaires de replication
nltest /dsgetdc:domaine.local             # Localiser un controleur de domaine
klist                                     # Afficher les tickets Kerberos en cache (chapitre 23)
klist purge                               # Purger les tickets Kerberos (depannage "clock skew")
w32tm /query /status                      # Etat de synchronisation horaire (chapitre 23)
certutil -verify -urlfetch cert.cer       # Verifier une chaine de certificats (chapitre 24)
```

## A.2 DNS et DHCP Windows Server (chapitres 9-10)

```
dnscmd /enumzones                         # Lister les zones DNS
dnscmd /zoneprint domaine.local           # Afficher les enregistrements d'une zone
ipconfig /flushdns                        # Vider le cache DNS local
ipconfig /registerdns                     # Forcer le reenregistrement DNS dynamique
netsh dhcp show scope                     # Lister les etendues DHCP
```

## A.3 Stockage, fichiers et clustering Windows (chapitres 11-13, 27)

```
wbadmin start backup -backupTarget:E:     # Sauvegarde Windows Server (chapitre 30)
wbadmin get versions                      # Lister les points de sauvegarde disponibles
diskpart                                  # Gestion interactive des disques
Get-ClusterNode  # (rappel : sortie PowerShell, mais commande generalement lancee via cluster.exe)
cluster.exe /prop                         # Etat du cluster de basculement (chapitre 13)
```

## A.4 Distributions Linux : paquets et services (chapitres 14-16)

```
# Debian/Ubuntu
apt update && apt upgrade                 # Mettre a jour le systeme
apt install <paquet>                      # Installer un paquet
dpkg -l | grep <paquet>                   # Verifier un paquet installe

# Rocky Linux/RHEL
dnf update                                # Mettre a jour le systeme
dnf install <paquet>                      # Installer un paquet
rpm -qa | grep <paquet>                   # Verifier un paquet installe

# systemd (les deux familles, chapitre 16)
systemctl status <service>                # Etat d'un service
systemctl enable --now <service>          # Activer et demarrer un service
journalctl -u <service> -f                # Suivre les journaux d'un service en direct
journalctl --since "1 hour ago"           # Journaux des dernieres 60 minutes
```

## A.5 Stockage Linux : LVM et RAID (chapitre 17)

```
lsblk                                     # Lister les blocs de peripheriques
pvcreate /dev/sdb                         # Creer un volume physique LVM
vgcreate vg_data /dev/sdb                 # Creer un groupe de volumes
lvcreate -L 50G -n lv_app vg_data         # Creer un volume logique
mdadm --detail /dev/md0                   # Detail d'un volume RAID logiciel
df -hT                                    # Espace disque et types de systemes de fichiers
```

## A.6 Utilisateurs, permissions et durcissement Linux (chapitres 18-19, 73)

```
useradd -m -s /bin/bash <utilisateur>     # Creer un utilisateur
usermod -aG <groupe> <utilisateur>        # Ajouter un utilisateur a un groupe
chmod 750 <fichier>                       # Modifier les permissions
setfacl -m u:<utilisateur>:rx <fichier>   # ACL etendue (chapitre 18)
getenforce                                # Etat de SELinux (chapitre 19)
semanage fcontext -l                      # Lister les contextes SELinux
setsebool -P httpd_can_network_connect on # Modifier un booleen SELinux persistant
sudo -l                                   # Lister les privileges sudo de l'utilisateur courant
```

## A.7 Réseau et diagnostic (chapitres 65-70)

```
ip addr show                              # Adressage IP (Linux)
ip route show                             # Table de routage (Linux)
ss -tulnp                                 # Ports en ecoute (Linux, remplace netstat)
firewall-cmd --list-all                   # Regles firewalld actives (Rocky Linux)
nft list ruleset                          # Regles nftables
traceroute <hote>                         # Tracer le chemin reseau (Linux)
tracert <hote>                            # Tracer le chemin reseau (Windows)
nslookup <hote>                           # Resolution DNS manuelle
tcpdump -i eth0 port 514                  # Capture reseau ciblee (rappel chapitre 64, en ligne de commande)
```

## A.8 Virtualisation et conteneurs (chapitres 33-44)

```
qm list                                   # Lister les VM Proxmox (chapitre 36)
qm start <id>                             # Demarrer une VM Proxmox
docker ps                                 # Conteneurs en cours d'execution (chapitre 40)
docker logs -f <conteneur>                # Suivre les journaux d'un conteneur
docker compose up -d                      # Demarrer une stack Compose (chapitre 41)
kubectl get pods -n <namespace>           # Lister les pods d'un namespace (chapitre 43)
kubectl describe pod <pod> -n <namespace> # Detail et evenements d'un pod
kubectl logs <pod> -n <namespace>         # Journaux d'un pod
kubectl rollout status deployment/<nom>   # Etat d'un deploiement en cours
```

## A.9 Automatisation et infrastructure as code (chapitres 51-57)

```
ansible-inventory --list                  # Afficher l'inventaire Ansible (chapitre 52)
ansible-playbook site.yml --check         # Simulation sans application reelle
ansible-vault edit secrets.yml            # Editer un fichier chiffre (chapitre 53)
terraform plan                            # Previsualiser un changement (chapitre 54)
terraform apply                           # Appliquer un changement
terraform state list                      # Lister les ressources gerees par l'etat
git log --oneline --graph                 # Historique condense (chapitre 51)
git diff --staged                         # Differences des changements indexes
```

## A.10 Supervision et sécurité (chapitres 58-79)

```
zabbix_agent2 -t agent.ping               # Tester un item Zabbix localement (chapitre 59)
curl localhost:9100/metrics               # Verifier un exporter Prometheus (chapitre 60)
tail -f /var/log/secure                   # Suivre les journaux d'authentification (Rocky Linux)
fail2ban-client status                    # Etat de la protection anti-brute-force
openssl s_client -connect hote:443        # Verifier un certificat TLS (chapitre 24)
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Comment utiliser cette annexe</span>
Ne mémorise pas cette liste par cœur — reviens-y ponctuellement lors d'une intervention réelle, une fois que le concept sous-jacent a déjà été compris via le chapitre correspondant. Une commande copiée sans comprendre son effet reproduit exactement le risque déjà dénoncé au chapitre 20 pour tout script exécuté sans en comprendre le contenu.
</div>

*Annexe suivante : le glossaire technique complet, définissant chaque terme clé rencontré tout au long de ce manuel.*
