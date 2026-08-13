<div class="chapitre-titre-num">CHAPITRE 67</div>

# Mikrotik : routage avancé

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Découvrir Mikrotik et RouterOS comme alternative accessible pour approfondir les concepts de routage déjà rencontrés avec Cisco (chapitre 65), particulièrement répandue pour les sites secondaires et les budgets plus restreints. À la fin de ce chapitre, tu sauras configurer le routage et le NAT sur RouterOS, gérer la bande passante via les queues, construire des règles de pare-feu par chaînes, et sécuriser correctement l'accès administratif à distance — un point de vigilance particulièrement important sur cet équipement.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
L'entreprise ouvre un petit bureau satellite à Cap-Haïtien, distinct du site principal déjà équipé en Cisco et Fortinet (chapitres 65-66), avec seulement une quinzaine d'employés et un budget d'équipement nettement plus restreint. Investir dans du matériel Cisco et Fortinet de niveau entreprise pour ce petit site représenterait une dépense disproportionnée par rapport au besoin réel. <em>"On n'a pas besoin du même niveau d'équipement pour quinze personnes que pour notre siège,"</em> résume le DSI. Mikrotik, avec du matériel RouterOS à la fois puissant et nettement plus accessible financièrement, répond directement à ce besoin.
</div>

## 67.1 Un choix pragmatique, le même raisonnement déjà rencontré à plusieurs reprises

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct des chapitres 14, 59 et 63</span>
Mikrotik n'est pas choisi ici parce qu'il serait objectivement supérieur à Cisco ou Fortinet, mais parce qu'il correspond au contexte réel de ce site précis : un petit nombre d'utilisateurs, un budget restreint, un besoin fonctionnel réel mais sans la complexité justifiant un investissement de niveau entreprise. Ce raisonnement rejoint exactement celui déjà appliqué au choix d'Ubuntu Server (chapitre 14), de Zabbix (chapitre 59) et de Graylog (chapitre 63) : le bon outil dépend du contexte précis, pas d'une hiérarchie absolue de qualité entre les solutions disponibles.
</div>

## 67.2 RouterOS : un système d'exploitation réseau complet

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**RouterOS** est le système d'exploitation propriétaire des équipements Mikrotik, offrant routage, pare-feu, VPN, gestion de bande passante et bien d'autres fonctionnalités réseau dans un seul système, généralement accessible via une interface graphique dédiée (**Winbox**) ou en ligne de commande — une richesse fonctionnelle comparable à des équipements bien plus coûteux, avec une courbe d'apprentissage propre à sa syntaxe.
</div>

## 67.3 Routage et NAT : les fondations, approfondies

```
/ip address add address=192.168.50.1/24 interface=ether2
/ip route add dst-address=0.0.0.0/0 gateway=41.20.10.1
/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Cette configuration reprend les mêmes concepts fondamentaux déjà rencontrés au chapitre 11 — adressage, route par défaut, traduction d'adresse (NAT) pour permettre au réseau interne du bureau satellite d'accéder à Internet via une seule adresse publique — appliqués ici à la syntaxe propre de RouterOS.
</div>

## 67.4 Gestion de la bande passante avec les Queues

<div class="encadre astuce">
<span class="encadre-titre">💡 Une fonctionnalité particulièrement mature sur RouterOS</span>
Les **queues** de RouterOS permettent de limiter ou de prioriser la bande passante allouée à une adresse, un sous-réseau ou un type de trafic — évitant qu'un seul poste ou un seul usage (comme un téléchargement volumineux) ne monopolise l'intégralité du lien Internet limité de ce petit site, au détriment des autres utilisateurs.
</div>

```
/queue simple add name="limite-generale" target=192.168.50.0/24 max-limit=10M/10M
```

## 67.5 Le pare-feu Mikrotik : chaînes et refus par défaut

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Le même principe de refus par défaut qu'au chapitre 66, une syntaxe différente</span>
Le pare-feu RouterOS organise ses règles en **chaînes** (`input` pour le trafic destiné au routeur lui-même, `forward` pour le trafic traversant le routeur, `output` pour le trafic émis par le routeur) — une organisation différente des zones de sécurité Fortinet (section 66.2), mais reposant sur exactement le même principe de refus par défaut déjà établi : chaque chaîne devrait se terminer par une règle explicite de rejet du trafic non couvert par les règles précédentes.
</div>

```
/ip firewall filter add chain=input action=accept protocol=tcp dst-port=8291 src-address=192.168.50.0/24
/ip firewall filter add chain=input action=drop
```

## 67.6 VPN site à site : un aperçu avant le chapitre 69

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Mikrotik supporte nativement plusieurs types de VPN, permettant de relier ce bureau satellite au siège de façon sécurisée à travers Internet — un sujet approfondi au chapitre 69 de ce manuel, consacré spécifiquement au VPN d'entreprise, quel que soit le fabricant d'équipement utilisé à chaque extrémité.
</div>

## 67.7 Sécuriser l'accès administratif : un point de vigilance spécifique à Mikrotik

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — un risque réel et documenté sur les équipements Mikrotik</span>
L'interface d'administration de RouterOS (Winbox, port 8291, ou l'API) a fait l'objet, dans le monde réel, de nombreuses campagnes de compromission lorsqu'elle est exposée directement sur Internet sans restriction. La règle du firewall de la section 67.5 restreint explicitement l'accès à ce port au seul sous-réseau interne légitime — une pratique impérative, jamais optionnelle, pour tout équipement Mikrotik dont une interface fait face à Internet.
</div>

## Atelier — Déployer le routeur du bureau satellite

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 67 — Répondre au besoin du scénario d'ouverture</span>

**Objectif** : configurer un routeur Mikrotik pour le bureau satellite de Cap-Haïtien, avec routage, limitation de bande passante et pare-feu de base.

**Préparation** : un équipement Mikrotik avec RouterOS installé, un accès Winbox initial depuis le réseau local uniquement.

**Étapes détaillées** :

1. Configure l'adressage, la route par défaut et le NAT (section 67.3) pour permettre l'accès Internet du réseau interne.
2. Configure une queue limitant la bande passante globale disponible pour le réseau interne (section 67.4).
3. Configure les règles de pare-feu restreignant l'accès à l'interface d'administration au seul sous-réseau interne (section 67.7).
4. Ajoute une règle de rejet final à la chaîne `input`, conformément au principe de refus par défaut (section 67.5).
5. Explique pourquoi l'ordre des règles de pare-feu est important dans cette configuration.
6. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le bureau satellite dispose d'un accès Internet fonctionnel via NAT, avec une bande passante partagée équitablement grâce à la queue configurée, empêchant qu'un seul poste ne sature le lien limité de ce site. L'accès administratif au routeur reste restreint au seul réseau interne, conformément au risque de sécurité spécifique évoqué à la section 67.7. L'ordre des règles de pare-feu est déterminant car RouterOS évalue les règles séquentiellement et applique la première correspondance trouvée — une règle de rejet placée avant une règle d'autorisation légitime bloquerait ce trafic malgré l'existence d'une règle d'autorisation plus loin dans la liste, jamais atteinte.

**Dépannage** : si l'accès administratif au routeur devient impossible après application des règles de pare-feu, vérifie que la règle d'autorisation pour le sous-réseau interne a bien été créée et placée avant la règle de rejet final — une erreur d'ordre fréquente lors d'une première configuration.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — l'interface d'administration exposée directement sur Internet sans restriction</span>
Rappel de la section 67.7 : un risque de sécurité réel et documenté, spécifique aux équipements Mikrotik, jamais à négliger.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — des règles de pare-feu mal ordonnées</span>
Rappel de l'atelier : RouterOS applique la première règle correspondante rencontrée dans l'ordre de la liste — un ordre incorrect peut bloquer un trafic légitime ou, pire, autoriser un trafic qui aurait dû être refusé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — aucune limitation de bande passante sur un lien Internet limité</span>
Rappel de la section 67.4 : sans queue configurée, un seul usage intensif peut dégrader la connectivité de l'ensemble des utilisateurs du site, un impact particulièrement sensible sur un lien à bande passante limitée.
</div>

## Diagnostiquer un lien Internet saturé par un seul poste

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : l'ensemble des utilisateurs du bureau satellite signale une lenteur générale de connexion Internet</span>

- **Diagnostic** : vérifier si une queue de limitation de bande passante est effectivement active et correctement dimensionnée, et identifier si un poste ou un usage spécifique consomme une part disproportionnée de la bande passante disponible.
- **Comment vérifier** : consulter les statistiques de trafic par adresse dans RouterOS, ou utiliser une capture réseau (chapitre 64) pour identifier la source du trafic dominant.
- **Résolution** : ajuster ou créer les queues manquantes pour répartir équitablement la bande passante disponible, ou identifier et corriger un usage anormal (mise à jour non planifiée, transfert de fichier volumineux) à l'origine de la saturation.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter clairement quel type de site (siège, bureau satellite) justifie quel niveau d'équipement, évitant une décision ad hoc à chaque nouveau site sans cohérence d'ensemble.
- **Bonne pratique répandue** : restreindre systématiquement l'accès administratif de tout équipement réseau, quel que soit le fabricant, au seul réseau interne ou à un VPN dédié, jamais directement exposé sur Internet.
- **Erreur classique observée** : un équipement Mikrotik déployé rapidement pour un besoin ponctuel, avec l'interface d'administration laissée accessible depuis Internet "temporairement" pour faciliter une configuration à distance — une exposition qui, dans les faits, reste souvent bien plus longtemps que prévu et constitue une cible réelle pour des campagnes de compromission automatisées.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Dans quel contexte Mikrotik constitue-t-il un choix pertinent par rapport à des équipements Cisco ou Fortinet ?"**
Réponse attendue : pour des sites de taille plus modeste avec un budget restreint, où le besoin fonctionnel réel ne justifie pas l'investissement associé à des équipements de niveau entreprise — un choix de contexte plutôt qu'un jugement de qualité absolue.

**Q2. "Comment fonctionnent les chaînes du pare-feu RouterOS ?"**
Réponse attendue : `input` couvre le trafic destiné au routeur lui-même, `forward` le trafic traversant le routeur, `output` le trafic émis par le routeur ; les règles sont évaluées séquentiellement, la première correspondance déterminant le traitement appliqué.

**Q3. "Pourquoi l'interface d'administration Winbox constitue-t-elle un point de vigilance particulier sur les équipements Mikrotik ?"**
Réponse attendue : elle a fait l'objet, dans le monde réel, de nombreuses campagnes de compromission lorsqu'elle est exposée directement sur Internet sans restriction — son accès doit impérativement être restreint au réseau interne ou à un VPN dédié.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne jamais exposer l'interface d'administration Winbox ou l'API RouterOS directement sur Internet — restreins systématiquement cet accès au réseau interne ou à un VPN dédié, une règle sans exception sur cet équipement en particulier.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente clairement, pour chaque site de l'organisation, le niveau d'équipement retenu et sa justification — une cohérence explicite évite des décisions incohérentes d'un site à l'autre au fil du temps.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Dimensionne les queues de bande passante en fonction du lien Internet réel disponible sur le site, en laissant une marge suffisante pour éviter qu'une limitation trop stricte ne dégrade inutilement l'expérience des utilisateurs même en l'absence de saturation réelle.
</div>

## Résumé du chapitre

- Mikrotik constitue un choix pragmatique pour des sites de taille modeste avec un budget restreint, suivant le même raisonnement de contexte déjà appliqué à plusieurs reprises dans ce manuel.
- RouterOS offre routage, pare-feu, VPN et gestion de bande passante dans un système unique, accessible via Winbox.
- Les queues RouterOS permettent de limiter ou de prioriser la bande passante, évitant qu'un seul usage ne monopolise un lien Internet limité.
- Le pare-feu RouterOS s'organise en chaînes (input, forward, output), évaluées séquentiellement selon le même principe de refus par défaut déjà établi au chapitre 66.
- L'interface d'administration Winbox constitue un point de vigilance de sécurité spécifique, jamais à exposer directement sur Internet.
- Mikrotik supporte nativement plusieurs types de VPN, approfondis au chapitre 69 de ce manuel.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Mikrotik est choisi dans le scénario d'ouverture principalement pour :
   - a) Sa supériorité technique absolue sur Cisco et Fortinet
   - b) Son accessibilité financière adaptée à un site de taille modeste
   - c) Son incapacité à gérer le pare-feu
   - d) L'absence totale de besoin de configuration

2. Les queues RouterOS servent principalement à :
   - a) Chiffrer le trafic réseau
   - b) Limiter ou prioriser la bande passante allouée à une adresse ou un sous-réseau
   - c) Remplacer le besoin du pare-feu
   - d) Configurer le VPN site à site

3. L'interface Winbox ne devrait jamais être :
   - a) Utilisée pour la configuration initiale
   - b) Exposée directement sur Internet sans restriction
   - c) Accessible depuis le réseau interne
   - d) Documentée dans la configuration du site

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Mikrotik est objectivement supérieur à Cisco et Fortinet dans tous les contextes. — **Faux** (section 67.1, un choix de contexte).
2. Le pare-feu RouterOS évalue les règles séquentiellement, la première correspondance déterminant le traitement appliqué. — **Vrai**.
3. L'interface d'administration Winbox peut être exposée sans risque directement sur Internet si le mot de passe est suffisamment complexe. — **Faux** (section 67.7).
4. Une queue mal dimensionnée peut dégrader inutilement l'expérience des utilisateurs même sans saturation réelle du lien. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique en quoi le choix de Mikrotik pour le bureau satellite de Cap-Haïtien rejoint le même raisonnement déjà appliqué au choix d'Ubuntu Server au chapitre 14.
2. Un collègue configure une règle de pare-feu autorisant l'accès Winbox depuis "n'importe quelle adresse", en expliquant que cela facilitera le dépannage à distance en cas de besoin urgent. Explique le risque de cette configuration.

**Corrigé 1** : au chapitre 14, Ubuntu Server avait été choisi non pas parce qu'il serait objectivement le meilleur système d'exploitation serveur disponible dans l'absolu, mais parce qu'il correspondait au contexte réel de l'équipe à ce moment précis. Le choix de Mikrotik pour le bureau satellite suit exactement le même raisonnement : plutôt que d'imposer le même niveau d'équipement Cisco et Fortinet déjà déployé au siège, un choix dicté par le contexte spécifique de ce petit site (budget restreint, besoin fonctionnel modeste) permet une allocation de ressources proportionnée au besoin réel, sans compromettre la sécurité ni la fonctionnalité nécessaire pour ce contexte précis.

**Corrigé 2** : autoriser l'accès Winbox depuis "n'importe quelle adresse" expose directement l'interface d'administration du routeur à Internet dans son ensemble — exactement le risque documenté à la section 67.7, exploité dans le monde réel par des campagnes de compromission automatisées ciblant spécifiquement les équipements Mikrotik mal sécurisés. Le bénéfice recherché (faciliter un dépannage urgent) peut être obtenu de façon bien plus sûre via un VPN dédié (chapitre 69) permettant un accès distant authentifié et chiffré, sans exposer l'interface d'administration elle-même à l'ensemble d'Internet — un compromis qui élimine le risque de compromission tout en conservant la capacité d'intervention à distance recherchée.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 67.1</span>

Écris, dans l'ordre correct, un ensemble de règles de pare-feu RouterOS pour la chaîne `input`, autorisant l'accès Winbox uniquement depuis le sous-réseau interne 192.168.50.0/24, et refusant tout autre trafic vers le routeur lui-même.
</div>

**Corrigé :**
```
/ip firewall filter add chain=input action=accept protocol=tcp dst-port=8291 src-address=192.168.50.0/24
/ip firewall filter add chain=input action=drop
```
L'ordre est essentiel : la règle d'autorisation pour le sous-réseau interne légitime doit impérativement être placée avant la règle de rejet final, puisque RouterOS applique la première correspondance rencontrée dans l'ordre de la liste (section 67.5). Si la règle de rejet était placée en premier, elle bloquerait systématiquement tout trafic, y compris l'accès légitime depuis le sous-réseau interne, rendant la règle d'autorisation suivante inatteignable et donc inutile.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 67.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucun équipement Mikrotik n'est jamais déployé avec son interface d'administration exposée sur Internet, même temporairement, en t'appuyant sur le risque décrit dans ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Tout déploiement d'un équipement Mikrotik devra inclure, dès sa mise en service initiale, une règle de pare-feu restreignant explicitement l'accès à l'interface Winbox et à l'API au seul réseau interne ou à un VPN dédié — cette étape sera considérée comme aussi indispensable que la configuration du routage lui-même, jamais comme une amélioration optionnelle à réaliser ultérieurement. Aucune exception "temporaire" ne sera tolérée pour faciliter un dépannage ponctuel, un accès distant sécurisé via VPN restant toujours disponible pour ce besoin. Cette règle sera vérifiée systématiquement lors de toute revue de configuration réseau, au même titre que les autres contrôles de sécurité déjà établis dans ce manuel pour les équipements périmétriques.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi Mikrotik constitue un choix pragmatique pour un site de taille modeste.</li>
<li>☐ Je sais configurer le routage et le NAT de base sur RouterOS.</li>
<li>☐ Je sais configurer une queue pour limiter la bande passante d'un sous-réseau.</li>
<li>☐ Je sais construire des règles de pare-feu RouterOS respectant le principe de refus par défaut.</li>
<li>☐ Je comprends pourquoi l'interface Winbox ne doit jamais être exposée directement sur Internet.</li>
<li>☐ Je sais diagnostiquer un lien Internet saturé par un usage anormal.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Mikrotik peut-il remplacer complètement Cisco et Fortinet pour l'ensemble de l'infrastructure de l'entreprise ?</dt>
<dd>Techniquement possible pour certains besoins, mais généralement peu pertinent pour un siège aux besoins de résilience et de sécurité avancés déjà couverts aux chapitres 65-66 — le bon choix, comme rappelé dans ce chapitre, dépend du contexte spécifique de chaque site plutôt que d'un remplacement systématique.</dd>

<dt>RouterOS nécessite-t-il un apprentissage complètement séparé de Cisco ou Fortinet ?</dt>
<dd>Sa syntaxe est propre à RouterOS, mais les concepts fondamentaux (routage, NAT, pare-feu par refus par défaut) restent les mêmes que ceux déjà maîtrisés aux chapitres 65 et 66 — l'apprentissage porte principalement sur une nouvelle syntaxe, pas sur de nouveaux concepts réseau.</dd>

<dt>Faut-il éviter Mikrotik pour des raisons de sécurité, compte tenu du risque évoqué pour Winbox ?</dt>
<dd>Non, le risque évoqué provient d'une mauvaise configuration (interface exposée sans restriction), pas d'une faiblesse intrinsèque de la plateforme — un équipement Mikrotik correctement configuré, avec l'accès administratif restreint comme recommandé dans ce chapitre, reste une solution fiable et largement déployée dans le monde entier.</dd>

<dt>Les queues RouterOS peuvent-elles prioriser certains types de trafic plutôt que de simplement limiter la bande passante globale ?</dt>
<dd>Oui, RouterOS permet une gestion de bande passante plus fine, priorisant par exemple un trafic de visioconférence sensible à la latence par rapport à un téléchargement en arrière-plan moins urgent — une configuration plus avancée que la limitation simple présentée dans ce chapitre.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Mikrotik RouterOS : [https://help.mikrotik.com/docs/](https://help.mikrotik.com/docs/)
- Mikrotik — Guide de sécurisation de RouterOS : [https://help.mikrotik.com/docs/display/ROS/Securing+your+router](https://help.mikrotik.com/docs/display/ROS/Securing+your+router)

*Chapitre suivant : proxy et reverse proxy (Nginx, Apache, IIS) — un composant essentiel pour exposer de façon contrôlée et sécurisée les services internes de l'entreprise, comme le portail client, vers l'extérieur.*
