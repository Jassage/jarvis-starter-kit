<div class="chapitre-titre-num">CHAPITRE 40</div>

# Cybersécurité : configuration de base sécurisée

## Objectifs pédagogiques

Consolider, en un chapitre de référence unique, l'ensemble des mesures de sécurité déjà appliquées progressivement depuis le début de ce manuel — et compléter les deux points encore ouverts : l'authentification multifacteur (MFA) et une hiérarchie NTP cohérente sur tout le projet.

## Prérequis

Volumes 1-13.

## OBJECTIF

Une base de sécurité complète et vérifiable, point par point, sur l'ensemble des équipements du projet — ce chapitre est le point d'arrivée de toutes les mentions "chapitre 40" disséminées depuis le début de ce manuel.

## 40.1 Mots de passe

Politique appliquée sans exception sur l'ensemble du projet, déjà utilisée dans chaque chapitre de configuration : **12 caractères minimum, majuscules, minuscules, chiffres et caractère spécial**, jamais un mot de passe par défaut laissé inchangé (chapitre 35.1, la règle la plus souvent violée dans l'industrie réelle).

## 40.2 SSH partout, Telnet nulle part

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (audit, à répéter sur chaque équipement)</div>

```
SW-COEUR# show running-config | include transport input
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`transport input ssh` sur chaque ligne VTY de chaque équipement du projet — la présence de `telnet` dans ce résultat, sur n'importe quel équipement, doit être corrigée immédiatement (chapitre 19.4).
</div>

## 40.3 Cloisonnement VLAN et ACL

Récapitulatif : 9 VLAN standards + extensions par projet (chapitre 8.4), VLAN natif dédié jamais utilisé (chapitre 12.4), ACL appliquées sur les flux sensibles (chapitre 26.2), règles de firewall explicites en double couche sur les flux critiques (chapitre 28).

## 40.4 Authentification multifacteur (MFA)

<div class="encadre astuce">
<span class="encadre-titre">💡 Priorité : les comptes à privilège élevé, pas tous les comptes d'un coup</span>
Le MFA apporte le plus de valeur là où une compromission aurait le plus grand impact — les comptes administrateur des équipements réseau et du firewall, avant les comptes utilisateurs standards. Ce manuel active le MFA en priorité sur FW-01 (l'équipement le plus exposé, en frontière directe avec Internet).
</div>

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI (FW-01)</div>

```
config user local
    edit "admin"
        set two-factor fortitoken
        set fortitoken "FTK200XXXXXXXX"
    next
end
```

**Explication** : `FortiToken` associe au compte administrateur un générateur de code à usage unique (application mobile ou jeton matériel) — une connexion à l'interface d'administration du firewall exige désormais le mot de passe **et** ce code temporaire, rendant un mot de passe seul compromis (par hameçonnage, par exemple) insuffisant pour un accès complet.

<div class="encadre attention">
<span class="encadre-titre">⚠️ MFA sur les comptes Active Directory : une dépendance externe à documenter, pas à improviser</span>
Étendre le MFA aux comptes Windows/Active Directory (chapitre 31) nécessite généralement un service tiers (Azure MFA/Entra ID, ou un serveur RADIUS-MFA dédié) — une dépendance à une connectivité Internet fiable et, souvent, à un abonnement cloud externe non disponible dans tous les contextes de déploiement. Ce manuel documente cette recommandation sans la configurer par défaut sur tous les projets (même principe de prudence déjà appliqué ailleurs dans ce manuel face à une dépendance externe non garantie, chapitre 29) — à activer explicitement si le client dispose de l'infrastructure nécessaire.
</div>

## 40.5 Mises à jour

Mises à jour de sécurité automatiques sur les serveurs Linux (chapitre 32.7). Sur les équipements réseau (switches, routeur/firewall), aucune mise à jour automatique n'est recommandée par défaut (un firmware réseau mal testé peut provoquer une interruption de service) — une politique de vérification manuelle **régulière et planifiée** (chapitre 43, maintenance mensuelle) des correctifs de sécurité critiques du fabricant est préférable, appliqués en fenêtre de maintenance planifiée, jamais en production sans test préalable.

## 40.6 Sauvegardes

Politique complète au chapitre 39 — un pilier de la cybersécurité à part entière : une sauvegarde testée et restaurable est la meilleure protection contre un rançongiciel (ransomware), qui ne peut chiffrer que ce qu'il peut atteindre, jamais une copie hors ligne correctement isolée.

## 40.7 Journalisation (logs) centralisée

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (répété sur chaque équipement réseau)</div>

```
SW-COEUR(config)# logging host 10.10.30.12
SW-COEUR(config)# logging trap informational
```

<div class="ou-executer">À EXÉCUTER SUR LE FIREWALL — FortiOS CLI</div>

```
config log syslogd setting
    set status enable
    set server "10.10.30.12"
end
```

**Explication** : chaque équipement envoie désormais ses journaux vers SRV-03 (chapitre 38), permettant une corrélation d'événements entre équipements — un incident de sécurité laisse rarement une trace sur un seul équipement isolé, et la capacité à croiser les journaux du switch, du firewall et des serveurs en un seul endroit est souvent ce qui distingue un incident détecté à temps d'un incident découvert des semaines plus tard.

## 40.8 NTP : une hiérarchie horaire cohérente sur tout le projet

<div class="encadre attention">
<span class="encadre-titre">⚠️ Sans NTP cohérent, les journaux centralisés (40.7) deviennent inexploitables</span>
Corréler un événement du firewall avec un événement du switch cœur survenu "à la même seconde" n'a aucun sens si les horloges des deux équipements dérivent chacune de leur côté — la centralisation des journaux (40.7) perd une grande partie de sa valeur sans une synchronisation horaire rigoureuse sur l'ensemble du projet.
</div>

<div class="ou-executer">À EXÉCUTER SUR LE SWITCH — Cisco IOS (répété sur chaque équipement réseau)</div>

```
SW-COEUR(config)# ntp server 10.10.30.10
```

`10.10.30.10` (SRV-01) sert de source de temps de référence interne pour l'ensemble des équipements réseau et des caméras (déjà configuré au chapitre 35.3) — SRV-01 lui-même se synchronise, en tant que contrôleur de domaine, sur une source NTP externe fiable via sa configuration Active Directory par défaut.

## 40.9 Comptes individuels et moindre privilège

Récapitulatif de deux principes appliqués systématiquement depuis le chapitre 19 : **jamais de compte générique partagé** ("admin" utilisé par toute l'équipe technique, empêchant toute traçabilité individuelle d'une action) — chaque technicien dispose de son propre compte nominatif ; et le **moindre privilège** (chapitre 36.6) — un compte ne reçoit jamais plus de droits que son rôle réel ne l'exige, du RBAC des équipements réseau jusqu'aux permissions du NVR.

## VÉRIFICATION — audit de sécurité consolidé

| Point | Chapitre de référence | Vérifié |
|---|---|---|
| Mots de passe forts, aucun défaut inchangé | 40.1, 35.1 | ☐ |
| SSH partout, Telnet nulle part | 40.2, 19.4 | ☐ |
| VLAN natif dédié, jamais VLAN 1 | 12.4 | ☐ |
| ACL et règles firewall en double couche sur les flux critiques | 26.2, 28 | ☐ |
| Port Security et DHCP Snooping actifs | 23 | ☐ |
| MFA actif sur les comptes à privilège élevé | 40.4 | ☐ |
| Mises à jour de sécurité planifiées | 40.5, 32.7 | ☐ |
| Sauvegardes testées en restauration réelle | 39 | ☐ |
| Journaux centralisés sur tous les équipements | 40.7 | ☐ |
| NTP cohérent sur tout le projet | 40.8 | ☐ |
| Comptes individuels, aucun compte générique partagé | 40.9 | ☐ |
| Moindre privilège appliqué (réseau, serveurs, NVR) | 40.9, 36.6 | ☐ |

## CHECKLIST DE FIN — Volume 13 complet

- [ ] Supervision opérationnelle (chapitre 38)
- [ ] Politique de sauvegarde complète et testée (chapitre 39)
- [ ] Audit de sécurité consolidé entièrement coché

## Résumé du chapitre

Ce chapitre ne réintroduit aucun nouveau principe — il consolide et vérifie l'ensemble des mesures de sécurité déjà appliquées depuis le chapitre 19, tout en complétant les deux derniers points laissés ouverts jusqu'ici : le MFA (priorisé sur les comptes à privilège élevé, notamment le firewall) et une hiérarchie NTP cohérente sur l'ensemble du projet, indispensable à l'exploitation réelle des journaux désormais centralisés.

*Fin du Volume 13. Chapitre suivant : la méthode de diagnostic experte — premier chapitre du Volume 14, consacré au dépannage.*
