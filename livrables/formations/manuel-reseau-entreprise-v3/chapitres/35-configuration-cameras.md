<div class="chapitre-titre-num">CHAPITRE 35</div>

# Configuration des caméras

## Objectifs pédagogiques

Appliquer une configuration standard et reproductible à chaque caméra IP : réseau (via réservation DHCP, chapitre 11.2), horaire (NTP), qualité vidéo (résolution/FPS/codec/bitrate conforme aux calculs du chapitre 34), image (WDR/IR) et détection d'événements — avant intégration au NVR (chapitre 36).

## Prérequis

Chapitres 33-34.

## OBJECTIF

Chaque caméra du projet dispose d'une adresse réseau stable, d'une horloge synchronisée, d'un flux vidéo conforme au dimensionnement prévu, et d'une détection de mouvement correctement zonée.

## ÉTAPE 1 — Premier accès et changement immédiat du mot de passe

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra</div>

1. Connecter temporairement un ordinateur portable au même segment réseau que la caméra en sortie d'usine (adresse par défaut du fabricant, généralement documentée dans sa notice, ou détectée via l'outil de découverte réseau fourni par le fabricant).
2. Se connecter à l'interface web avec les identifiants par défaut du fabricant.
3. **Changer immédiatement le mot de passe administrateur** avant toute autre configuration.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un mot de passe par défaut inchangé est la faille de sécurité la plus exploitée au monde sur les caméras IP</span>
Des botnets massifs (le plus tristement célèbre étant Mirai) ont, par le passé, compromis des centaines de milliers de caméras IP dans le monde entier en scannant simplement Internet à la recherche d'appareils encore configurés avec leur mot de passe usine — une négligence totalement évitable. **Aucune caméra de ce manuel n'est jamais considérée comme installée tant que son mot de passe par défaut n'a pas été changé**, une règle sans aucune exception, documentée explicitement dans la checklist de fin.
</div>

## ÉTAPE 2 — Configuration réseau : DHCP, pas une adresse statique manuelle

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra, Réseau</div>

```
Reseau → Configuration IP
  → Mode : DHCP (pas IP statique manuelle)
  → Enregistrer
  → Noter l'adresse MAC affichee (necessaire a l'etape suivante)
```

<div class="ou-executer">À EXÉCUTER SUR WINDOWS SERVER — PowerShell (SRV-01, chapitre 31)</div>

```powershell
Add-DhcpServerV4Reservation -ScopeId 10.10.80.0 -IPAddress 10.10.80.11 -ClientId "AA-BB-CC-11-22-33" -Description "Camera entree principale"
```

**Explication** : conformément à la méthode d'attribution retenue pour le VLAN CCTV (chapitre 11.2, "réservation par MAC"), la caméra elle-même reste configurée en **client DHCP standard** — c'est le serveur DHCP (SRV-01) qui garantit qu'elle recevra toujours la même adresse, via une réservation liée à son adresse MAC (`ClientId`), plutôt qu'une adresse statique saisie manuellement dans chaque caméra individuellement (chapitre 6.3, l'avantage étant la modification centralisée si le plan IP évolue).

## ÉTAPE 3 — Synchronisation horaire (NTP)

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra, Système</div>

```
Systeme → Date et heure
  → Synchronisation : Serveur NTP
  → Adresse du serveur NTP : 10.10.30.10 (SRV-01, chapitre 31)
  → Fuseau horaire : America/Port-au-Prince
  → Enregistrer
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un horodatage vidéo incorrect peut invalider une preuve</span>
Une caméra dont l'horloge interne dérive (parfois de plusieurs minutes par mois sans NTP) enregistre un horodatage incorrect sur chaque séquence — un problème mineur pour une simple surveillance générale, mais potentiellement rédhibitoire si l'enregistrement doit un jour servir de preuve dans une procédure (l'heure exacte d'un événement devenant alors contestable). La synchronisation NTP, déjà recommandée globalement au chapitre 40, est ici **non négociable** sur tout projet de vidéosurveillance de ce manuel.
</div>

## ÉTAPE 4 — Résolution, FPS, codec et bitrate

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra, Vidéo</div>

```
Video → Flux principal
  → Resolution : 4 MP (2560x1440)
  → Codec : H.265
  → Frequence d'images : 25 im/s
  → Type de debit : CBR (debit constant)
  → Debit cible : 3 Mbit/s
  → Enregistrer
```

**Explication** : ces valeurs reprennent exactement l'hypothèse de calcul du chapitre 34 (4 MP H.265, ~3 Mbit/s) — une caméra configurée avec des valeurs différentes du calcul de dimensionnement fausserait silencieusement tous les résultats du chapitre 34 (bande passante réellement consommée supérieure au budget prévu, stockage réel qui se remplit plus vite que calculé). `CBR` (débit constant) plutôt que `VBR` (débit variable, qui peut ponctuellement dépasser largement la cible sur une scène très animée) est le choix recommandé par défaut pour un dimensionnement de bande passante et de stockage fiable et prévisible.

## ÉTAPE 5 — WDR et vision nocturne (IR)

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra, Image</div>

```
Image → Parametres avances
  → WDR : Active (si emplacement en contre-jour identifie au chapitre 33.4)
  → IR : Automatique (bascule jour/nuit selon la luminosite ambiante)
  → Portee IR : verifier la valeur annoncee par rapport a la distance reelle mesuree a l'etude de site
  → Enregistrer
```

## ÉTAPE 6 — Détection de mouvement et zonage

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra, Événements</div>

```
Evenements → Detection de mouvement
  → Activer la detection
  → Dessiner la zone de detection (exclure les zones de mouvement parasite : arbre, drapeau, route lointaine visible dans le cadre)
  → Sensibilite : moyenne (a ajuster apres un premier test reel, chapitre 33 etape 18)
  → Enregistrer
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Toujours exclure les zones de mouvement parasite du champ de détection</span>
Une zone de détection couvrant l'intégralité du champ de vision, y compris un arbre agité par le vent ou une route lointaine visible en arrière-plan, génère un flot d'alertes non pertinentes qui finit presque toujours par faire ignorer les vraies alertes par l'équipe de sécurité — un zonage précis, limité à la zone réellement surveillée, est indispensable dès la configuration initiale, jamais un réglage "à affiner plus tard" reporté indéfiniment.
</div>

## ÉTAPE 7 — Configurer l'action déclenchée par un événement

<div class="ou-executer">NAVIGATEUR WEB — Interface web de la caméra, Événements</div>

```
Evenements → Detection de mouvement → Actions
  → Enregistrer sur le NVR : active
  → Envoyer une notification : active (configuree en detail au chapitre 36, centralisee sur le NVR/VMS)
  → Enregistrer
```

## VÉRIFICATION

<div class="ou-executer">À EXÉCUTER SUR WINDOWS — PowerShell</div>

```powershell
Test-NetConnection 10.10.80.11 -Port 80
```

<div class="resultat encadre">
<span class="encadre-titre">📋 Résultat attendu</span>
`TcpTestSucceeded : True` — confirme que la caméra a bien reçu l'adresse réservée (étape 2) et reste joignable. Se reconnecter ensuite à son interface web pour confirmer visuellement chaque paramètre des étapes 3 à 7.
</div>

## DÉPANNAGE

### Si la caméra ne reçoit jamais l'adresse réservée

Vérifier que l'adresse MAC saisie dans la réservation DHCP (étape 2) correspond exactement à celle affichée par la caméra — une erreur de frappe sur un seul caractère hexadécimal est la cause la plus fréquente.

### Si l'image reste surexposée ou sous-exposée malgré le WDR activé

Vérifier que la plage dynamique de la scène ne dépasse pas la capacité du capteur — un WDR "faible" ou "standard" (souvent réglable en plusieurs niveaux) peut nécessiter un ajustement supérieur sur un contre-jour particulièrement extrême, un scénario détaillé au chapitre 46.

## SAUVEGARDE

Exporter la configuration de chaque caméra (`Systeme → Maintenance → Exporter la configuration`, fonction disponible sur la quasi-totalité des caméras IP professionnelles) et l'archiver dans le dossier de projet — accélère considérablement le remplacement d'une caméra en panne (chapitre 46).

## CHECKLIST DE FIN

- [ ] Mot de passe par défaut changé sur chaque caméra, sans exception
- [ ] Mode réseau en DHCP, réservation créée côté serveur pour chaque caméra
- [ ] NTP configuré et fuseau horaire correct
- [ ] Résolution/codec/bitrate conformes aux hypothèses du calcul de dimensionnement (chapitre 34)
- [ ] WDR et IR configurés selon l'emplacement réel de chaque caméra
- [ ] Zone de détection de mouvement dessinée en excluant les sources de mouvement parasite
- [ ] Action d'enregistrement et de notification associée à la détection
- [ ] Configuration de chaque caméra exportée et archivée

## Résumé du chapitre

Chaque caméra reçoit d'abord un nouveau mot de passe administrateur (jamais celui par défaut), puis est configurée en client DHCP standard (la réservation se fait côté serveur, chapitre 6.3), synchronisée en NTP, réglée avec exactement les valeurs de résolution/codec/bitrate utilisées dans le calcul de dimensionnement du chapitre 34 (jamais une valeur différente qui invaliderait ce calcul), avec WDR/IR adaptés à son emplacement réel et une zone de détection de mouvement précisément dessinée pour exclure tout déclenchement parasite.

*Chapitre suivant : NVR et VMS — ajout des caméras, calendrier d'enregistrement, utilisateurs, permissions et export vidéo.*
