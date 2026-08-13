<div class="chapitre-titre-num">CHAPITRE 25</div>

# MFA et authentification forte

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre pourquoi le mot de passe seul, aussi complexe soit-il, ne suffit plus à protéger un compte en 2026, et comment l'authentification multifacteur (MFA) comble cette lacune. À la fin de ce chapitre, tu sauras expliquer les trois facteurs d'authentification, choisir la méthode MFA adaptée à un contexte donné (TOTP, clé de sécurité, notification push), et déployer le MFA aussi bien côté Windows/Entra ID que côté Linux.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un service externe de notification de fuites de données alerte l'entreprise : l'adresse email professionnelle d'un employé de la comptabilité, avec son mot de passe, apparaît dans une fuite de données provenant d'un site totalement extérieur à l'entreprise, où cet employé avait malheureusement réutilisé le même mot de passe. Tu t'attends au pire — un compte compromis, un accès potentiel aux systèmes financiers de l'entreprise. Mais en vérifiant les journaux d'authentification, tu ne trouves aucune connexion suspecte : le MFA activé sur ce compte, exactement comme recommandé au chapitre 4 pour tout accès distant, a bloqué la tentative de connexion d'un attaquant qui possédait pourtant le mot de passe exact et valide. Ce chapitre explique pourquoi ce second facteur a suffi à transformer un incident potentiellement grave en non-événement.
</div>

## 25.1 Pourquoi le mot de passe seul ne suffit plus

Un mot de passe, même complexe, reste vulnérable à plusieurs risques structurels : la **réutilisation** entre plusieurs sites (exactement la cause du scénario d'ouverture — un mot de passe compromis ailleurs devient exploitable ici), le **phishing** (l'utilisateur saisit lui-même son mot de passe sur un faux site), et les **fuites de données** massives, malheureusement fréquentes, touchant des services totalement extérieurs à l'entreprise.

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le MFA ne part pas du principe qu'un mot de passe ne sera jamais compromis — il part du principe **inverse**, réaliste : un mot de passe finira, tôt ou tard, par être exposé d'une façon ou d'une autre (réutilisation, phishing, fuite), et prévoit une seconde barrière indépendante pour que cette exposition seule ne suffise pas à un attaquant.
</div>

## 25.2 Les trois facteurs d'authentification

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le coffre-fort à double serrure</span>
Un coffre-fort à double serrure, nécessitant deux clés détenues par deux personnes différentes, ne peut être ouvert que si les deux clés sont réunies — voler une seule clé ne suffit pas. Le MFA applique exactement ce principe à l'authentification : posséder le mot de passe seul (une "clé") ne suffit plus si un second facteur, d'une nature totalement différente, est également exigé.
</div>

| Facteur | Principe | Exemple |
|---|---|---|
| **Quelque chose que tu sais** | Une information mémorisée | Mot de passe, code PIN |
| **Quelque chose que tu as** | Un objet physique en ta possession | Téléphone (application d'authentification), clé de sécurité physique |
| **Quelque chose que tu es** | Une caractéristique biométrique | Empreinte digitale, reconnaissance faciale |

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — le MFA combine des facteurs de nature DIFFÉRENTE</span>
Deux mots de passe différents ne constituent pas du MFA — ce sont deux instances du même facteur ("quelque chose que tu sais"), compromises par les mêmes risques structurels (phishing, réutilisation). Le MFA exige la combinaison de facteurs de <strong>nature différente</strong>, précisément parce qu'un attaquant qui compromet un facteur (le mot de passe via une fuite, comme dans le scénario d'ouverture) n'a statistiquement aucune raison d'avoir compromis simultanément un facteur de nature totalement différente (le téléphone physique de la victime).
</div>

## 25.3 Les méthodes MFA courantes, du moins au plus recommandé

| Méthode | Fonctionnement | Niveau de sécurité |
|---|---|---|
| **SMS** | Code à usage unique envoyé par SMS | Le moins recommandé — vulnérable au détournement de numéro (*SIM swapping*) |
| **TOTP** (*Time-based One-Time Password*) | Code à 6 chiffres généré par une application (Google Authenticator, Microsoft Authenticator), change toutes les 30 secondes | Bon niveau, largement répandu |
| **Notification push** | Une notification envoyée à une application mobile, approuvée d'un geste | Bon niveau, plus confortable que TOTP, mais vulnérable à la "fatigue MFA" (section 25.7) |
| **Clé de sécurité physique** (FIDO2/WebAuthn) | Un dispositif physique (type YubiKey) branché ou approché du poste | Le plus robuste, résistant au phishing par conception |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Pourquoi le SMS reste le moins recommandé</span>
Le SMS dépend du réseau téléphonique de l'opérateur mobile, vulnérable au <strong>SIM swapping</strong> : un attaquant convainc (par ingénierie sociale) l'opérateur téléphonique de transférer le numéro de la victime vers une carte SIM qu'il contrôle, recevant alors directement les codes SMS destinés à la victime. Ce n'est pas une vulnérabilité du MFA en tant que principe — c'est une faiblesse spécifique du canal SMS, que les autres méthodes de ce tableau n'ont pas.
</div>

## 25.4 Comment fonctionne réellement TOTP

<div class="encadre astuce">
<span class="encadre-titre">💡 Explication technique — un secret partagé et l'heure actuelle</span>
Lors de l'activation du MFA par TOTP, un secret cryptographique unique est généré et partagé une seule fois entre le serveur et l'application d'authentification (souvent via un QR code scanné). Ensuite, à intervalles de 30 secondes, **les deux parties** (serveur et application) calculent indépendamment le même code à partir de ce secret partagé **et de l'heure actuelle** — sans jamais échanger d'information supplémentaire. C'est exactement pour cette raison que la synchronisation d'horloge, déjà critique pour Kerberos (chapitre 23), l'est également pour TOTP : un décalage d'horloge trop important entre le serveur et l'appareil de l'utilisateur invaliderait les codes générés, un écho direct du problème "Clock skew too great" déjà rencontré.
</div>

## 25.5 Déployer le MFA en entreprise

**Côté Windows/Entra ID**, rappel direct du chapitre 8 : Entra ID permet d'étendre le MFA à l'ensemble des utilisateurs, avec des politiques d'accès conditionnel (exiger le MFA uniquement dans certains contextes, comme une connexion depuis un lieu inhabituel).

**Côté Linux**, le MFA peut être ajouté à l'authentification SSH via le module PAM (*Pluggable Authentication Modules*) et une application TOTP :

```
# Installer le module PAM Google Authenticator (compatible avec
# toute application TOTP standard, pas seulement Google)
sudo apt install libpam-google-authenticator

# Generer un secret TOTP pour l'utilisateur courant (affiche un QR
# code a scanner avec une application d'authentification)
google-authenticator

# Ajouter la ligne suivante a /etc/pam.d/sshd pour exiger le TOTP
# en plus de la cle SSH deja recommandee au chapitre 4
auth required pam_google_authenticator.so
```

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — MFA en complément de la clé SSH, pas à sa place</span>
Rappel direct du chapitre 4 : l'authentification par clé SSH reste la méthode recommandée par défaut. Ajouter le MFA par-dessus (authentification par clé ET code TOTP) plutôt qu'à la place renforce encore la protection du bastion (chapitre 4) sans en réduire la robustesse — une clé privée SSH volée ne suffirait alors plus, à elle seule, à accéder au serveur.
</div>

## 25.6 Retour sur le scénario d'ouverture

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Ce qui a réellement protégé le compte de l'employé</span>
Le mot de passe compromis (facteur "quelque chose que tu sais") était bien exposé et valide — un attaquant l'a probablement testé. Mais sans le second facteur (le téléphone physique de l'employé, générant les codes TOTP ou recevant la notification push), la tentative de connexion a été rejetée, générant même une entrée dans les journaux d'authentification consultables (rejoignant directement la journalisation systématique recommandée au chapitre 4). Ce scénario illustre exactement pourquoi le MFA est devenu une exigence non négociable plutôt qu'une simple recommandation optionnelle : le mot de passe seul a échoué, le second facteur a tenu.
</div>

## 25.7 Les pièges du MFA : la fatigue MFA

<div class="encadre attention">
<span class="encadre-titre">⚠️ La "fatigue MFA" (MFA fatigue / MFA bombing)</span>
Une technique d'attaque de plus en plus documentée consiste, pour un attaquant qui possède déjà un mot de passe valide, à déclencher de multiples notifications push MFA en succession rapide, espérant que la victime, agacée ou pensant à une erreur technique, finisse par approuver l'une d'elles par lassitude ou confusion — sans jamais avoir tenté de se connecter elle-même. Cette technique a été documentée dans plusieurs intrusions majeures récentes et réelles.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Contre-mesures à la fatigue MFA</span>
- Configurer une **correspondance de numéro** (*number matching*) : l'utilisateur doit saisir un code précis affiché sur son écran de connexion dans l'application MFA, rendant impossible une approbation "en aveugle" par simple réflexe.
- **Former** les utilisateurs (chapitre 1, compétences humaines) à ne jamais approuver une notification MFA qu'ils n'ont pas eux-mêmes déclenchée, et à signaler immédiatement toute notification inattendue et répétée — un signal d'alerte de sécurité à part entière, pas une simple nuisance technique à ignorer.
</div>

## 25.8 Codes de récupération : le plan de secours

<div class="encadre attention">
<span class="encadre-titre">⚠️ Que se passe-t-il si l'utilisateur perd son téléphone ?</span>
Sans plan de secours, la perte de l'appareil détenant le second facteur bloquerait totalement l'accès légitime au compte — un risque opérationnel réel à anticiper. Les **codes de récupération** (une série de codes à usage unique générés au moment de l'activation du MFA, à stocker en lieu sûr, jamais dans le même appareil que celui utilisé pour le MFA lui-même) offrent une voie de secours planifiée, plutôt qu'une procédure d'urgence improvisée découverte seulement au moment de la crise.
</div>

## Atelier — Choisir une méthode MFA selon le contexte

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 25 — Recommander une méthode MFA pour trois profils</span>

**Objectif** : appliquer les principes de ce chapitre pour choisir une méthode MFA adaptée à trois contextes distincts.

**Préparation** : aucune installation nécessaire.

**Étapes détaillées** :

1. Pour chacun des trois profils suivants, recommande une méthode MFA et justifie ton choix : (a) un administrateur système accédant au bastion (chapitre 4) ; (b) un employé standard accédant à sa messagerie professionnelle ; (c) un compte de service utilisé par un script automatisé (chapitre 20-21).
2. Compare tes réponses à la section "Résultat attendu".

**Résultat attendu** : (a) une clé de sécurité physique FIDO2 pour l'administrateur système, le niveau de protection le plus élevé étant justifié par l'accès privilégié au bastion, point d'entrée unique vers toute l'infrastructure (chapitre 4). (b) TOTP ou notification push avec correspondance de numéro pour l'employé standard, un bon compromis sécurité/confort pour un usage quotidien. (c) un compte de service automatisé ne peut techniquement pas "approuver" une notification MFA interactive — la bonne pratique n'est pas d'y appliquer un MFA classique, mais de le protéger par d'autres moyens adaptés à l'automatisation (rotation de clés, restriction d'IP source, principe du moindre privilège du chapitre 1), un sujet approfondi en Partie 9.

**Dépannage** : si tu hésites sur le compte de service, rappelle-toi qu'aucun humain n'est présent pour approuver une notification en temps réel — le MFA interactif classique de ce chapitre ne s'applique tout simplement pas à ce cas de figure, qui nécessite une approche de sécurité différente.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — considérer deux mots de passe comme du MFA</span>
Rappel de la section 25.2 : le MFA exige des facteurs de nature différente, jamais deux instances du même facteur.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — approuver une notification push sans vérification</span>
Exactement le risque de la fatigue MFA (section 25.7) — une habitude d'approbation réflexe, sans vérifier qu'on est bien à l'origine de la tentative de connexion, annule une bonne partie du bénéfice de sécurité du MFA.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — n'avoir aucun plan de codes de récupération</span>
Rappel de la section 25.8 : sans plan de secours documenté, la perte d'un appareil MFA devient une crise improvisée plutôt qu'une procédure déjà anticipée.
</div>

## Diagnostiquer une situation de blocage MFA

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Un utilisateur a perdu son téléphone et ne peut plus se connecter"</span>

- **Diagnostic** : vérifier immédiatement si l'utilisateur dispose de ses codes de récupération (section 25.8) — s'il les a bien conservés en lieu sûr, la résolution est immédiate et ne nécessite aucune intervention administrative.
- **Comment vérifier** : demander à l'utilisateur ses codes de récupération ; s'il ne les a pas ou plus, une procédure de réinitialisation MFA administrative devient nécessaire.
- **Résolution** : toute réinitialisation MFA administrative doit suivre une procédure de vérification d'identité rigoureuse (jamais une simple demande par email, potentiellement usurpée) — exactement le type de procédure à documenter à l'avance dans un runbook (chapitre 3), pour éviter qu'un attaquant ne puisse se faire passer pour un utilisateur légitime en prétendant avoir perdu son téléphone.
</div>

## En entreprise

- **Bonne pratique répandue** : exiger le MFA sans exception sur tout compte à privilège élevé (administrateurs, bastion) et l'étendre progressivement à l'ensemble des utilisateurs, en commençant par les comptes les plus exposés ou les plus sensibles.
- **Bonne pratique répandue** : documenter une procédure claire de vérification d'identité pour toute réinitialisation MFA administrative — un point d'entrée fréquemment ciblé par l'ingénierie sociale, où un attaquant tente de se faire passer pour un employé légitime ayant "perdu son téléphone".
- **Erreur classique observée** : un déploiement MFA généralisé sans formation des utilisateurs sur la fatigue MFA (section 25.7), rendant l'organisation vulnérable à cette technique d'attaque malgré la présence technique du MFA lui-même.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi deux mots de passe différents ne constituent-ils pas du MFA ?"**
Réponse attendue : le MFA exige la combinaison de facteurs de nature différente (quelque chose que tu sais, as, es) — deux mots de passe restent deux instances du même facteur, vulnérables aux mêmes risques structurels (phishing, réutilisation, fuite de données).

**Q2. "Qu'est-ce que la 'fatigue MFA', et comment s'en protéger ?"**
Réponse attendue : une technique d'attaque où un attaquant, possédant déjà un mot de passe valide, déclenche de multiples notifications push pour qu'une victime finisse par en approuver une par lassitude ou confusion. Les contre-mesures incluent la correspondance de numéro (exigeant une action précise plutôt qu'une simple approbation) et la formation des utilisateurs à ne jamais approuver une notification non déclenchée par eux-mêmes.

**Q3. "Pourquoi le SMS est-il considéré comme la méthode MFA la moins recommandée ?"**
Réponse attendue : il dépend du réseau de l'opérateur téléphonique, vulnérable au SIM swapping, où un attaquant transfère le numéro de la victime vers une carte SIM qu'il contrôle par ingénierie sociale auprès de l'opérateur — une faiblesse spécifique au canal SMS, absente des autres méthodes MFA comme TOTP ou les clés de sécurité physiques.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Exige le MFA sans exception sur tout compte à privilège élevé, avec une méthode robuste (clé de sécurité physique ou TOTP, jamais SMS seul) — rappel direct et concret du principe déjà posé au chapitre 4 sur l'accès distant administratif.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) la procédure de réinitialisation MFA administrative, avec ses exigences de vérification d'identité précises — une procédure improvisée en pleine urgence est bien plus vulnérable à l'ingénierie sociale qu'une procédure déjà réfléchie et écrite à l'avance.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Les politiques d'accès conditionnel (chapitre 8) permettent d'exiger le MFA de façon ciblée selon le contexte réel du risque (connexion depuis un lieu inhabituel, par exemple), plutôt que de l'imposer uniformément de façon rigide — un équilibre entre sécurité et confort d'usage qui évite la lassitude et donc, indirectement, la vulnérabilité à la fatigue MFA.
</div>

## Résumé du chapitre

- Le mot de passe seul ne suffit plus face aux risques de réutilisation, de phishing et de fuites de données massives.
- Le MFA combine des facteurs d'authentification de nature différente (savoir, avoir, être), jamais deux instances du même facteur.
- TOTP, les notifications push et les clés de sécurité physiques offrent un meilleur niveau de sécurité que le SMS, vulnérable au SIM swapping.
- TOTP repose sur un secret partagé et l'heure actuelle — la synchronisation d'horloge, déjà critique pour Kerberos, l'est aussi pour TOTP.
- La fatigue MFA est une technique d'attaque réelle, contrée par la correspondance de numéro et la formation des utilisateurs.
- Des codes de récupération et une procédure administrative rigoureuse de réinitialisation doivent être planifiés à l'avance, jamais improvisés en urgence.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le MFA exige la combinaison de :
   - a) Deux mots de passe différents
   - b) Facteurs d'authentification de nature différente
   - c) Uniquement des méthodes biométriques
   - d) Un seul facteur renforcé

2. La méthode MFA la moins recommandée, en raison du risque de SIM swapping, est :
   - a) TOTP
   - b) Les clés de sécurité physiques
   - c) Le SMS
   - d) La notification push

3. La "fatigue MFA" désigne :
   - a) Une panne technique du serveur MFA
   - b) Une technique d'attaque par notifications push répétées, espérant une approbation par lassitude
   - c) Un problème de batterie sur le téléphone de l'utilisateur
   - d) Un délai d'expiration trop court des codes TOTP

**Corrigé** : 1-b, 2-c, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Deux mots de passe distincts constituent une forme valide de MFA. — **Faux** (ce sont deux instances du même facteur, section 25.2).
2. TOTP repose sur un secret partagé et l'heure actuelle, sans échange supplémentaire à chaque code généré. — **Vrai**.
3. La correspondance de numéro (number matching) est une contre-mesure efficace contre la fatigue MFA. — **Vrai**.
4. Un compte de service automatisé devrait toujours utiliser une notification push MFA classique, comme un compte utilisateur humain. — **Faux** (aucun humain n'est présent pour l'approuver, une autre approche de sécurité est nécessaire).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la synchronisation d'horloge, déjà critique pour Kerberos (chapitre 23), l'est également pour TOTP.
2. Reprends le scénario d'ouverture. Explique en 3-4 phrases pourquoi ce type d'incident illustre bien la philosophie centrale du MFA : ne pas supposer qu'un mot de passe restera toujours secret.

**Corrigé 1** : TOTP calcule un code à partir d'un secret partagé ET de l'heure actuelle, indépendamment côté serveur et côté application d'authentification — si les horloges des deux parties divergent significativement, les codes calculés de chaque côté ne correspondront plus, provoquant un rejet des codes pourtant générés par l'application légitime de l'utilisateur, un mécanisme structurellement similaire à la tolérance d'horloge de Kerberos (chapitre 23), même si les deux protocoles sont par ailleurs indépendants.

**Corrigé 2** : le scénario d'ouverture montre concrètement qu'un mot de passe fort et jamais deviné par force brute peut quand même être compromis par un canal totalement extérieur à l'entreprise (une fuite de données sur un site tiers où l'employé avait réutilisé ce mot de passe) — un risque hors du contrôle direct de l'équipe IT. Le MFA ne cherche pas à empêcher cette fuite (impossible à contrôler depuis l'entreprise), mais à s'assurer qu'elle seule, sans le second facteur physique, reste insuffisante pour accéder au compte — exactement la philosophie "supposer que le mot de passe sera un jour compromis" de la section 25.1, validée en conditions réelles dans ce scénario précis.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Un employé reçoit cinq notifications push MFA en l'espace de deux minutes, sans avoir lui-même tenté de se connecter. Explique ce que cela signifie probablement, et ce qu'il devrait faire, en t'appuyant sur la section 25.7.
</div>

**Corrigé :** Ce comportement correspond exactement à une tentative de fatigue MFA (section 25.7) — un attaquant possédant déjà le mot de passe de cet employé tente de le pousser à approuver une notification par lassitude ou confusion. L'employé ne doit approuver aucune de ces notifications, doit immédiatement signaler l'incident à l'équipe de sécurité (rejoignant la chaîne d'escalade du chapitre 1), et devrait envisager de changer son mot de passe par précaution, puisque la présence de ces notifications confirme que quelqu'un d'autre possède effectivement ses identifiants valides.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.2</span>

Rédige, en 3 à 5 phrases, pourquoi une procédure de réinitialisation MFA administrative mal conçue (par exemple, une simple demande par email suffisante) pourrait totalement annuler le bénéfice de sécurité du MFA lui-même.
</div>

**Corrigé (exemple de réponse) :** Si un attaquant peut obtenir une réinitialisation du MFA d'un compte simplement en envoyant un email prétendant avoir perdu son téléphone, il contourne entièrement la protection du second facteur sans jamais avoir eu à le posséder réellement — l'email lui-même devenant le véritable "facteur" exploité, souvent plus facile à usurper qu'un appareil physique. Une procédure de réinitialisation robuste doit exiger une vérification d'identité forte et documentée (rejoignant le chapitre 3 sur les runbooks), par exemple une vérification vidéo ou en personne pour un compte à privilège élevé, pour que la sécurité du MFA repose sur l'ensemble de son cycle de vie, pas seulement sur son fonctionnement au quotidien.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi le mot de passe seul ne suffit plus en 2026.</li>
<li>☐ Je connais les trois facteurs d'authentification et pourquoi le MFA en combine au moins deux de nature différente.</li>
<li>☐ Je sais comparer les méthodes MFA courantes (SMS, TOTP, push, clé physique) et leurs niveaux de sécurité respectifs.</li>
<li>☐ Je comprends comment TOTP fonctionne techniquement, et son lien avec la synchronisation d'horloge.</li>
<li>☐ Je sais reconnaître et me protéger contre la fatigue MFA.</li>
<li>☐ Je comprends l'importance des codes de récupération et d'une procédure de réinitialisation MFA rigoureuse.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Le MFA rend-il un compte totalement inviolable ?</dt>
<dd>Non, aucune mesure de sécurité n'est absolue — le MFA réduit drastiquement le risque lié à un mot de passe seul compromis, mais reste vulnérable à des techniques plus sophistiquées comme la fatigue MFA (section 25.7) ou certaines attaques de phishing avancées contournant même le MFA (hors du périmètre de ce chapitre introductif). Le MFA est une couche de défense majeure, pas une garantie absolue à elle seule.</dd>

<dt>Faut-il imposer le MFA à absolument tous les comptes, y compris les plus anodins ?</dt>
<dd>La priorité doit aller aux comptes à privilège élevé et aux accès exposés (rappel du chapitre 4), avec une extension progressive à l'ensemble des utilisateurs — un déploiement trop brutal sans accompagnement peut générer de la résistance ou des contournements de la part des utilisateurs, un risque à gérer avec la même prudence que tout changement du chapitre 2.</dd>

<dt>Les clés de sécurité physiques (FIDO2) sont-elles adaptées à toute une entreprise ?</dt>
<dd>Elles offrent le meilleur niveau de sécurité mais représentent un coût matériel et logistique (distribution, remplacement en cas de perte) qui les rend généralement réservées aux comptes les plus sensibles (administrateurs, dirigeants) plutôt qu'à l'ensemble du personnel, où TOTP ou la notification push restent un compromis pratique plus courant.</dd>

<dt>Comment un compte de service automatisé peut-il être sécurisé sans MFA interactif ?</dt>
<dd>Par d'autres mécanismes adaptés à l'absence d'intervention humaine : rotation régulière des clés d'authentification, restriction stricte par adresse IP source, principe du moindre privilège limitant strictement ce que ce compte peut faire — des sujets approfondis dans la Partie 9 sur l'automatisation et l'Infrastructure as Code.</dd>
</dl>

## Références et pour aller plus loin

- Microsoft Learn — Authentification multifacteur Entra ID : [https://learn.microsoft.com/fr-fr/entra/identity/authentication/concept-mfa-howitworks](https://learn.microsoft.com/fr-fr/entra/identity/authentication/concept-mfa-howitworks)
- NIST Special Publication 800-63B — lignes directrices sur l'authentification numérique : [https://pages.nist.gov/800-63-3/sp800-63b.html](https://pages.nist.gov/800-63-3/sp800-63b.html)
- FIDO Alliance — documentation sur les standards FIDO2/WebAuthn : [https://fidoalliance.org/fido2/](https://fidoalliance.org/fido2/)
- CISA — recommandations sur la protection contre la fatigue MFA : [https://www.cisa.gov](https://www.cisa.gov)

*Chapitre suivant : Zero Trust — comment généraliser la philosophie de ce chapitre ("ne jamais supposer qu'une protection suffit à elle seule") à l'ensemble de l'architecture de sécurité d'une organisation.*
