<div class="chapitre-titre-num">ANNEXE D</div>

# Modèles de documents

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif de l'annexe</span>
Fournir des gabarits directement réutilisables pour trois documents fondamentaux de la pratique quotidienne de l'administration système : le runbook opérationnel (chapitre 86), le plan de reprise d'activité (chapitre 31), et la politique de sécurité (Partie 12). Chaque gabarit reste volontairement générique — à adapter au contexte réel de chaque organisation, jamais à copier tel quel sans réflexion.
</div>

## D.1 Modèle de runbook opérationnel

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct de la section 86.2</span>
Un runbook consolide les procédures opérationnelles essentielles d'un service, permettant à toute personne — y compris une personne extérieure au projet initial — d'intervenir efficacement en cas de besoin.
</div>

```
RUNBOOK — [Nom du service]
================================

1. DESCRIPTION DU SERVICE
   - Fonction : [ce que fait ce service]
   - Criticite : [critique / important / secondaire]
   - Proprietaire : [equipe ou personne responsable]

2. ARCHITECTURE
   - Serveurs/composants impliques : [liste]
   - Dependances (services dont celui-ci depend) : [liste]
   - Services dependants (qui depend de celui-ci) : [liste]

3. ACCES ET AUTHENTIFICATION
   - Console/interface d'administration : [URL, methode d'acces]
   - Comptes autorises : [reference au groupe AD ou IAM concerne]

4. DEMARRAGE / ARRET / REDEMARRAGE
   - Commande de demarrage : [commande exacte]
   - Commande d'arret : [commande exacte]
   - Ordre de dependance a respecter : [le cas echeant]

5. JOURNAUX ET SUPERVISION
   - Emplacement des journaux locaux : [chemin]
   - Tableau de bord de supervision : [lien Grafana/Zabbix]
   - Alertes configurees : [liste des seuils critiques]

6. PROCEDURES COURANTES
   - [Procedure 1, ex : renouveler un certificat]
   - [Procedure 2, ex : ajouter une nouvelle instance]

7. DIAGNOSTIC DES PROBLEMES FREQUENTS
   | Symptome | Cause probable | Action |
   |---|---|---|
   | [symptome] | [cause] | [action corrective] |

8. CONTACTS D'ESCALADE
   - Niveau 1 : [contact]
   - Niveau 2 : [contact]
   - Astreinte : [contact]

9. DERNIERE MISE A JOUR : [date] — [auteur]
```

## D.2 Modèle de plan de reprise d'activité (PRA)

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct du chapitre 31</span>
Le PRA formalise comment restaurer un système après un sinistre, avec des objectifs de temps (RTO) et de perte de données (RPO) explicites.
</div>

```
PLAN DE REPRISE D'ACTIVITE — [Systeme/Service]
================================================

1. OBJECTIFS
   - RTO (temps de reprise cible) : [ex. 4 heures]
   - RPO (perte de donnees maximale acceptable) : [ex. 1 heure]

2. SCENARIOS DE SINISTRE COUVERTS
   - [Scenario 1 : panne materielle du serveur]
   - [Scenario 2 : perte du site physique]
   - [Scenario 3 : compromission de securite majeure]

3. SAUVEGARDES
   - Frequence : [ex. quotidienne]
   - Emplacement(s) : [local + hors site, rappel regle 3-2-1, chapitre 30]
   - Retention : [duree]
   - Chiffrement : [oui/non, methode]

4. PROCEDURE DE RESTAURATION
   Etape 1 : [ex. provisionner un nouveau serveur / instance]
   Etape 2 : [ex. restaurer la derniere sauvegarde valide]
   Etape 3 : [ex. verifier l'integrite des donnees restaurees]
   Etape 4 : [ex. reconfigurer le reseau / DNS]
   Etape 5 : [ex. valider le fonctionnement avec les utilisateurs cles]

5. ROLES ET RESPONSABILITES
   - Decideur de declenchement du PRA : [role]
   - Executant technique : [role]
   - Communication aux parties prenantes : [role]

6. TESTS DE VALIDATION
   - Frequence des tests : [ex. trimestrielle, rappel chapitre 27]
   - Date du dernier test reussi : [date]
   - Resultat du dernier test : [conforme / ecarts constates]

7. DERNIERE MISE A JOUR : [date] — [auteur]
```

## D.3 Modèle de politique de sécurité

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct de la Partie 12</span>
Une politique de sécurité formalise les règles et attentes de l'organisation, servant de référence pour les décisions techniques et les audits de conformité (chapitres 71-72).
</div>

```
POLITIQUE DE SECURITE — [Organisation]
========================================

1. PORTEE
   - Systemes couverts : [ensemble de l'infrastructure / perimetre specifique]
   - Personnes concernees : [tous les employes / equipe technique uniquement]

2. GESTION DES IDENTITES ET DES ACCES
   - Principe de moindre privilege applique (chapitre 22)
   - Authentification multifacteur obligatoire pour : [liste des cas]
   - Revue des acces : [frequence]

3. DURCISSEMENT DES SYSTEMES
   - Reference technique : CIS Benchmarks Level [1/2] (chapitre 73)
   - Delai d'application des correctifs critiques : [ex. 48h]

4. SUPERVISION ET DETECTION
   - Outils en place : [Zabbix/Prometheus/SIEM/IDS-IPS/EDR]
   - Retention des journaux de securite : [duree]

5. REPONSE A INCIDENT
   - Reference : procedure de reponse a incident (chapitre 79)
   - Contact d'urgence : [contact]

6. TESTS ET AUDITS
   - Test d'intrusion : [frequence, chapitre 77]
   - Audit de conformite : [reference NIST CSF/ISO 27001, chapitres 71-72]

7. FORMATION ET SENSIBILISATION
   - Frequence de sensibilisation des employes : [ex. annuelle]

8. REVISION DE CETTE POLITIQUE
   - Frequence de revision : [ex. annuelle]
   - Derniere revision : [date] — [auteur]
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Comment utiliser ces modèles</span>
Chaque gabarit reste un point de départ, jamais un document définitif — adapte-le au contexte réel de l'organisation, en t'appuyant sur les principes déjà détaillés dans les chapitres référencés. Un modèle rempli mécaniquement, sans réflexion sur sa pertinence réelle, reproduit exactement le risque déjà dénoncé pour une déclaration d'applicabilité artificiellement complète au chapitre 72.
</div>

*Annexe suivante : les erreurs fréquentes récapitulées, un rappel condensé des pièges les plus courants rencontrés tout au long de ce manuel.*
