<div class="chapitre-titre-num">CHAPITRE 38</div>

# Supervision réseau

## Objectifs pédagogiques

Installer et configurer un système de supervision centralisé (Zabbix) surveillant l'ensemble des équipements du projet via SNMP et des agents dédiés, avec un tableau de bord, des alertes et des rapports de disponibilité.

## Prérequis

Volumes 1-12.

## Scénario du volume

**SRV-03** (Ubuntu Server, `10.10.30.12`, VLAN Serveurs), hébergeant Zabbix — choisi dans ce manuel pour sa couverture complète (SNMP, agents, alertes, tableaux de bord) et sa nature open source, sans licence à budgétiser (une alternative valable comme PRTG ou Centreon reste possible, choix à documenter si retenu, principe du chapitre 55).

## OBJECTIF

Chaque équipement critique du projet (switches, routeur/firewall, serveurs, NVR) est surveillé en continu, avec des alertes déclenchées avant qu'une panne ne devienne visible pour les utilisateurs, et un historique consultable.

## ÉTAPE 1 — Installer Zabbix sur SRV-03

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux (SRV-03, reprendre d'abord les étapes 1-8 du chapitre 32)</div>

```bash
wget https://repo.zabbix.com/zabbix/6.4/ubuntu/pool/main/z/zabbix-release/zabbix-release_6.4-1+ubuntu22.04_all.deb
sudo dpkg -i zabbix-release_6.4-1+ubuntu22.04_all.deb
sudo apt update
sudo apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent mysql-server -y
```

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux</div>

```bash
sudo mysql -e "CREATE DATABASE zabbix CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;"
sudo mysql -e "CREATE USER zabbix@localhost IDENTIFIED BY 'MotDePasseZabbixDB2026!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON zabbix.* TO zabbix@localhost;"
zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | sudo mysql --default-character-set=utf8mb4 -uzabbix -p zabbix
sudo systemctl restart zabbix-server zabbix-agent apache2
sudo systemctl enable zabbix-server zabbix-agent apache2
```

## VÉRIFICATION

<div class="ou-executer">NAVIGATEUR WEB</div>

```
http://10.10.30.12/zabbix
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
L'assistant d'installation web de Zabbix s'affiche, confirmant que le serveur, la base de données et le frontend communiquent correctement — un écran blanc ou une erreur de connexion indique un problème de configuration Apache/PHP ou de connexion à la base, à diagnostiquer avant de poursuivre.
</div>

## ÉTAPE 2 — Activer SNMPv3 sur les équipements réseau

<div class="encadre attention">
<span class="encadre-titre">⚠️ SNMPv2c transmet sa "communauté" (mot de passe) en clair sur le réseau</span>
SNMPv1 et SNMPv2c authentifient l'accès par une simple chaîne de caractères (la "communauté", souvent `public` par défaut) transmise **sans aucun chiffrement** — n'importe qui capturant le trafic réseau peut la lire directement. Ce manuel utilise systématiquement **SNMPv3**, qui authentifie et chiffre réellement les échanges, sur l'ensemble de ses projets.
</div>

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (répété sur SW-COEUR, SW-COEUR-02, SW-ACCES-01)</div>

```
SW-COEUR(config)# snmp-server group GRP-SUPERVISION v3 priv
SW-COEUR(config)# snmp-server user zabbix-svc GRP-SUPERVISION v3 auth sha AuthPass2026Solide! priv aes 128 PrivPass2026Solide!
SW-COEUR(config)# snmp-server contact admin@entreprise.local
SW-COEUR(config)# snmp-server location "Local technique - Batiment principal"
```

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01)</div>

```
config system snmp sysinfo
    set status enable
end
config system snmp user
    edit "zabbix-svc"
        set auth-pwd AuthPass2026Solide!
        set priv-pwd PrivPass2026Solide!
        set security-level auth-priv
        set auth-proto sha256
        set priv-proto aes128
    next
end
```

## ÉTAPE 3 — Installer l'agent Zabbix sur les serveurs

<div class="ou-executer">À EXÉCUTER SUR LE SERVEUR — Linux (SRV-02)</div>

```bash
sudo apt install zabbix-agent2 -y
sudo nano /etc/zabbix/zabbix_agent2.conf
```

Modification à apporter : `Server=10.10.30.12`, puis :

```bash
sudo systemctl restart zabbix-agent2
sudo systemctl enable zabbix-agent2
```

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell (SRV-01)</div>

```powershell
Invoke-WebRequest -Uri "https://cdn.zabbix.com/zabbix/binaries/stable/6.4/6.4.0/zabbix_agent2-6.4.0-windows-amd64-openssl.msi" -OutFile "$env:TEMP\zabbix-agent.msi"
Start-Process msiexec.exe -ArgumentList "/i $env:TEMP\zabbix-agent.msi SERVER=10.10.30.12 /qn" -Wait
```

## ÉTAPE 4 — Ajouter les équipements dans Zabbix

<div class="ou-executer">GUI — Zabbix</div>

```
Data collection → Hosts → Create host
  → Host name : SW-COEUR
  → Templates : "Cisco IOS SNMPv3" (ou template generique SNMP)
  → Interfaces → SNMP → Adresse : 10.10.10.1, Port 161, SNMPv3, identifiants de l'etape 2
  → Enregistrer
```

Répéter pour chaque équipement (SW-COEUR-02, SW-ACCES-01, RTR-BORDURE-01/FW-01, SRV-01, SRV-02, NVR) — un tableau de reproduction, jamais un simple "répéter pour les autres" sans détail :

| Équipement | Type de surveillance | Template |
|---|---|---|
| SW-COEUR, SW-COEUR-02, SW-ACCES-01 | SNMPv3 | Générique switch (interfaces, CPU, température) |
| FW-01 | SNMPv3 | Générique firewall (sessions, CPU, débit) |
| SRV-01, SRV-02, SRV-03 | Agent Zabbix | Windows/Linux générique (CPU, RAM, disque, services) |
| NVR | SNMPv3 (si supporté) ou ping simple | Générique ou disponibilité seule |

## ÉTAPE 5 — Configurer le tableau de bord

<div class="ou-executer">GUI — Zabbix</div>

```
Dashboards → Create dashboard
  → Ajouter un widget "Problems" (vue synthetique des alertes actives)
  → Ajouter un widget "Graph" par equipement critique (utilisation CPU, bande passante)
  → Ajouter un widget "Host availability" (vue d'ensemble en ligne/hors ligne)
  → Enregistrer
```

## ÉTAPE 6 — Configurer les alertes

<div class="ou-executer">GUI — Zabbix</div>

```
Alerts → Actions → Trigger actions → Create action
  → Nom : Alerte-Equipement-Hors-Ligne
  → Condition : Trigger severity >= High
  → Operation : Envoyer un message (email) au groupe "Administrateurs reseau"
  → Enregistrer
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Alerter avant la panne, pas seulement après</span>
Au-delà de la simple alerte "équipement hors ligne" (déjà trop tard), configurer des seuils **prédictifs** — utilisation disque du NVR dépassant 85 % (avant le scénario "stockage NVR plein" du chapitre 46), charge CPU d'un serveur dépassant durablement 90 %, budget PoE d'un switch approchant sa limite (chapitre 13.4) — transforme la supervision d'un simple constat de panne en un véritable outil de prévention.
</div>

## ÉTAPE 7 — Rapports de disponibilité

<div class="ou-executer">GUI — Zabbix</div>

```
Reports → Availability report
  → Periode : mensuelle
  → Exporter en PDF, joindre a la documentation de maintenance (chapitre 43)
```

## VÉRIFICATION

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
Chaque équipement ajouté à l'étape 4 apparaît "Available" (vert) dans `Data collection → Hosts` — un statut "Not available" (rouge) indique un problème de communication SNMP ou d'agent, à diagnostiquer avant de considérer la supervision opérationnelle pour cet équipement.
</div>

## DÉPANNAGE

### Si un équipement reste "Not available" en SNMPv3

Vérifier la cohérence exacte des identifiants (nom d'utilisateur, mots de passe d'authentification et de confidentialité, protocoles) entre la configuration de l'équipement (étape 2) et celle saisie côté Zabbix (étape 4) — SNMPv3 échoue silencieusement au moindre paramètre différent, sans message d'erreur explicite côté équipement supervisé.

## SAUVEGARDE

Sauvegarder la base de données Zabbix elle-même (`mysqldump`) selon la politique du chapitre 39 — perdre l'historique de supervision serait dommage, sans être aussi critique que la perte d'une donnée métier.

## CHECKLIST DE FIN

- [ ] Zabbix installé et accessible via son interface web
- [ ] SNMPv3 activé sur tous les équipements réseau, jamais SNMPv1/v2c
- [ ] Agent Zabbix installé sur tous les serveurs
- [ ] Tous les équipements critiques ajoutés et confirmés "Available"
- [ ] Tableau de bord synthétique créé
- [ ] Alertes configurées, incluant des seuils prédictifs
- [ ] Rapport de disponibilité mensuel configuré

## Laboratoire complet — ce chapitre est déjà son propre laboratoire

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi ce chapitre ne répète pas une procédure de laboratoire distincte</span>
Contrairement aux chapitres précédents, la totalité des étapes 1 à 7 de ce chapitre **est** déjà la procédure de laboratoire complète — Zabbix s'installe et se pratique directement sur une VM, sans matériel réseau réel indispensable pour les premières étapes (une supervision par ping simple, sans SNMP, suffit pour valider l'installation de base).
</div>

**VM à créer (résumé)** : Ubuntu Server 22.04 (méthode chapitre 32), 4 Go de RAM, 2 cœurs, 40 Go de disque — hébergée dans VirtualBox sur le même "Réseau interne" que le laboratoire du chapitre 32, pour permettre à Zabbix de superviser SRV-01/SRV-02 par agent sans configuration réseau supplémentaire.

**Test minimal réalisable sans équipement réseau physique** : ajouter SRV-02 (chapitre 32) comme hôte de type "Agent Zabbix" (étape 4), confirmer son passage à "Available", puis arrêter volontairement le service `zabbix-agent2` sur SRV-02 (`sudo systemctl stop zabbix-agent2`) et observer, dans Zabbix, le déclenchement d'un problème de sévérité élevée en quelques minutes — la preuve concrète que l'alerte de l'étape 6 fonctionne réellement, avant même de disposer du moindre switch ou firewall physique à superviser.

## Résumé du chapitre

La supervision centralise, via SNMPv3 (jamais les versions non chiffrées) et des agents dédiés, l'état de tous les équipements du projet dans un outil unique (Zabbix), avec un tableau de bord synthétique, des alertes couvrant à la fois les pannes déjà survenues et des seuils prédictifs qui les anticipent, et des rapports de disponibilité réguliers versés à la documentation de maintenance.

*Chapitre suivant : la politique de sauvegarde — quoi, où, quand, combien de temps, et surtout comment tester une restauration.*
