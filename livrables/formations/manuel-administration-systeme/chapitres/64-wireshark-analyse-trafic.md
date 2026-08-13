<div class="chapitre-titre-num">CHAPITRE 64</div>

# Wireshark et analyse de trafic réseau

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Descendre un niveau plus bas que les logs applicatifs et les métriques déjà couverts dans cette partie, pour observer directement ce qui circule réellement sur le réseau, paquet par paquet, lorsque les outils de plus haut niveau ne suffisent plus à expliquer un problème. À la fin de ce chapitre, tu sauras capturer du trafic réseau avec Wireshark, distinguer un filtre de capture d'un filtre d'affichage, suivre un flux réseau complet, et diagnostiquer si un problème est réseau ou applicatif.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Rappel du chapitre précédent : lorsque des messages Syslog attendus n'apparaissaient jamais dans Graylog, la méthode de diagnostic proposée consistait à "capturer le trafic réseau directement sur le serveur Graylog pour confirmer si les paquets Syslog atteignent réellement le serveur". Ce chapitre met enfin cette méthode en pratique. Plus largement, chaque fois qu'un problème résiste aux outils de supervision et de centralisation déjà couverts — une connexion qui échoue sans message d'erreur clair, une latence dont l'origine reste incertaine — l'analyse directe du trafic réseau reste le dernier niveau de vérité disponible.
</div>

## 64.1 Quand les logs et les métriques ne suffisent plus

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le niveau de détail ultime</span>
Les métriques (chapitre 58) répondent à "combien" ; les logs (chapitres 62-63) répondent à "que s'est-il passé, selon l'application ou l'équipement lui-même". Aucun des deux ne répond directement à la question "qu'est-ce qui a réellement transité sur le câble ou l'onde radio" — une question qui devient essentielle lorsque le problème se situe précisément entre ce qu'une application croit avoir envoyé et ce que l'autre partie affirme avoir reçu.
</div>

## 64.2 Wireshark : capturer et analyser le trafic réseau

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — la mise sur écoute légale d'un flux plutôt que le journal de bord de ses participants</span>
Un log applicatif est comparable au journal de bord tenu par l'un des participants à une conversation — il décrit ce que ce participant croit avoir dit ou reçu. Wireshark, lui, capture directement le flux réel transitant sur le réseau, sans dépendre de ce qu'une application choisit ou non de journaliser — une preuve indépendante de toute interprétation applicative, particulièrement utile quand les logs eux-mêmes ne suffisent pas à trancher.
</div>

## 64.3 Filtres de capture et filtres d'affichage : ne pas les confondre

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le piège le plus fréquent chez un débutant</span>
Un **filtre de capture** est appliqué avant l'enregistrement — les paquets qui ne correspondent pas ne sont jamais capturés ni conservés. Un **filtre d'affichage** est appliqué après coup sur une capture déjà complète — il masque simplement certains paquets à l'écran, sans les supprimer. Un filtre de capture trop restrictif peut faire disparaître définitivement le paquet recherché avant même qu'il ne soit enregistré, rendant tout diagnostic ultérieur impossible.
</div>

```
# Filtre de capture (appliqué au démarrage, syntaxe BPF)
udp port 514

# Filtre d'affichage (appliqué après capture, syntaxe Wireshark)
udp.port == 514 && ip.addr == 10.10.1.8
```

## 64.4 Lire une trame capturée

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Chaque paquet capturé s'affiche en couches successives — trame Ethernet, en-tête IP, en-tête TCP ou UDP, puis les données applicatives elles-mêmes. Cette structure en couches reflète directement l'encapsulation réseau standard : chaque couche protocolaire ajoute son propre en-tête autour des données de la couche supérieure, une structure que la Partie 11 de ce manuel approfondira pour les équipements réseau eux-mêmes.
</div>

## 64.5 Résoudre concrètement le problème du chapitre 63

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Suivre un flux pour confirmer ou infirmer une hypothèse</span>
Pour le problème du scénario d'ouverture, une capture lancée directement sur le serveur Graylog, filtrée sur le port UDP 514, répond immédiatement à la question posée : si aucun paquet n'apparaît malgré l'attente, le problème se situe bien avant Graylog — un pare-feu intermédiaire, une mauvaise adresse de destination configurée sur le pare-feu source, ou une route réseau incorrecte. Si les paquets apparaissent bien dans la capture mais que Graylog ne les traite toujours pas, le problème se situe alors réellement dans la configuration de Graylog lui-même — une distinction que les outils de plus haut niveau ne pouvaient pas trancher seuls.
</div>

## 64.6 Diagnostiquer une latence réseau ou une latence applicative

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect du chapitre 58 — compléter une métrique par une preuve directe</span>
Une métrique de latence élevée sur le portail client (section 58.3, chapitre 60) indique qu'un problème existe, mais pas nécessairement où. Une capture Wireshark, en mesurant précisément le délai entre l'envoi d'une requête et la réception de sa réponse au niveau réseau, permet de distinguer une latence due au réseau lui-même (délai de transmission, perte de paquets nécessitant une retransmission) d'une latence due à l'application qui met simplement du temps à répondre après avoir bien reçu la requête.
</div>

## 64.7 Ce que Wireshark révèle aussi sur le trafic en clair

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct de la section 63.4</span>
Une capture Wireshark sur un flux Syslog en clair (chapitre 63) révèle directement en texte lisible le contenu complet des messages transmis, y compris toute donnée sensible qui y figurerait par erreur — une démonstration concrète, plutôt que théorique, du risque déjà évoqué pour tout protocole non chiffré. Cette même capacité de lecture directe est précisément ce qu'un attaquant positionné sur le réseau pourrait exploiter, justifiant les recommandations de chiffrement déjà formulées.
</div>

## Atelier — Diagnostiquer l'absence de paquets Syslog

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 64 — Compléter le diagnostic laissé en suspens au chapitre 63</span>

**Objectif** : utiliser Wireshark pour déterminer précisément où se situe le problème lorsque des messages Syslog attendus n'apparaissent pas dans Graylog.

**Préparation** : un accès au serveur Graylog avec les droits nécessaires pour lancer une capture réseau.

**Étapes détaillées** :

1. Lance une capture sur l'interface réseau du serveur Graylog, avec un filtre de capture restreint au port UDP 514 (section 64.3).
2. Provoque un événement sur le pare-feu source censé générer un message Syslog.
3. Observe si le paquet correspondant apparaît dans la capture.
4. Selon le résultat, détermine si le problème se situe avant Graylog (réseau, pare-feu intermédiaire) ou dans Graylog lui-même (section 64.5).
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : si aucun paquet UDP 514 n'apparaît dans la capture malgré l'événement provoqué sur le pare-feu source, la cause se situe nécessairement entre le pare-feu et le serveur Graylog — un pare-feu intermédiaire bloquant le trafic, ou une erreur de configuration de l'adresse de destination sur l'équipement source. Si le paquet apparaît bien dans la capture, le problème réside dans le traitement de ce paquet par Graylog lui-même (input mal configuré, service arrêté) — une distinction cruciale que l'observation des logs ou de l'interface Graylog seule, sans capture réseau, ne permettait pas de trancher avec certitude.

**Dépannage** : si aucun trafic n'apparaît dans la capture, quel que soit le filtre appliqué, y compris un trafic qui devrait être manifestement présent, vérifie que la capture est bien lancée sur la bonne interface réseau — une erreur fréquente sur un serveur disposant de plusieurs interfaces réseau distinctes.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — confondre filtre de capture et filtre d'affichage</span>
Rappel de la section 64.3 : un filtre de capture trop restrictif peut faire disparaître définitivement le paquet recherché.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — capturer sur la mauvaise interface réseau</span>
Rappel de l'atelier : sur un serveur disposant de plusieurs interfaces, une capture lancée sur la mauvaise interface ne montrera jamais le trafic recherché, même s'il existe bel et bien ailleurs.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — laisser tourner une capture indéfiniment sans limite de taille</span>
Une capture non bornée dans le temps ou en taille peut produire un fichier extrêmement volumineux, reproduisant le même risque de saturation disque déjà rencontré à plusieurs reprises dans cette partie du manuel — toujours définir une durée ou une taille maximale avant de lancer une capture prolongée.
</div>

## Diagnostiquer une capture qui n'affiche aucun paquet

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une capture Wireshark ne montre aucun paquet, malgré un trafic manifestement actif sur le réseau</span>

- **Diagnostic** : vérifier que l'interface réseau sélectionnée pour la capture est bien celle qui transporte réellement le trafic recherché, et que le mode promiscuous (nécessaire pour capturer du trafic qui ne serait pas explicitement adressé à cette interface) est activé si pertinent pour le contexte de capture.
- **Comment vérifier** : lancer une capture sans aucun filtre, sur toutes les interfaces disponibles, pour confirmer sur laquelle le trafic recherché apparaît réellement.
- **Résolution** : relancer la capture sur l'interface correcte identifiée — une erreur d'interface reste la cause la plus fréquente d'une capture apparemment vide.
</div>

## En entreprise

- **Bonne pratique répandue** : réserver l'analyse de paquets aux situations où les outils de plus haut niveau (métriques, logs) ne suffisent pas à trancher, plutôt que d'en faire un réflexe systématique — une capture reste plus coûteuse en temps d'analyse qu'une simple consultation de tableau de bord.
- **Bonne pratique répandue** : toujours limiter une capture en durée ou en taille avant de la lancer sur un système de production, pour éviter tout impact de performance ou de stockage non maîtrisé.
- **Erreur classique observée** : une capture réseau lancée en urgence pendant un incident, sans filtre ni limite, produisant un fichier de plusieurs gigaoctets impossible à analyser efficacement dans le temps disponible — une préparation minimale (filtre pertinent, limite de taille) reste toujours préférable, même en situation d'urgence.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre un filtre de capture et un filtre d'affichage dans Wireshark ?"**
Réponse attendue : un filtre de capture est appliqué avant l'enregistrement et détermine quels paquets sont réellement conservés ; un filtre d'affichage est appliqué après coup sur une capture déjà complète, et masque simplement certains paquets sans les supprimer.

**Q2. "Dans quelles situations l'analyse de paquets devient-elle nécessaire, alors que les logs et les métriques ne suffisent pas ?"**
Réponse attendue : lorsque le problème se situe précisément entre ce qu'une application croit avoir envoyé ou reçu et ce qui a réellement transité sur le réseau — par exemple pour confirmer si un paquet attendu atteint réellement sa destination, ou pour distinguer une latence réseau d'une latence applicative.

**Q3. "Comment une capture réseau peut-elle aider à diagnostiquer si une latence observée est due au réseau ou à l'application ?"**
Réponse attendue : en mesurant précisément le délai entre l'envoi d'une requête et la réception de sa réponse au niveau réseau, une capture permet de distinguer un délai dû à la transmission réseau elle-même d'un délai dû au temps de traitement de l'application après réception effective de la requête.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Une capture réseau peut elle-même contenir des données sensibles (identifiants, contenu de messages en clair) — protège et supprime les fichiers de capture après usage, avec la même rigueur que pour tout autre document sensible de l'infrastructure.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente le filtre exact utilisé pour chaque capture réalisée dans le cadre d'un diagnostic, permettant de reproduire ou d'affiner l'analyse ultérieurement sans devoir redécouvrir la syntaxe appropriée depuis le début.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Toujours limiter une capture en durée ou en taille de fichier avant de la lancer sur un système de production, particulièrement sur un serveur à fort trafic — une capture non bornée peut consommer un espace disque et une charge CPU significatifs.
</div>

## Résumé du chapitre

- L'analyse de paquets constitue le niveau de détail ultime, au-delà des métriques et des logs, pour observer directement ce qui transite réellement sur le réseau.
- Wireshark capture le trafic réel, indépendamment de ce qu'une application choisit ou non de journaliser elle-même.
- Un filtre de capture détermine ce qui est enregistré ; un filtre d'affichage détermine ce qui est visible après coup sur une capture déjà complète — les deux ne doivent jamais être confondus.
- Une capture ciblée permet de distinguer avec certitude si un problème se situe avant, ou après, un point précis de l'infrastructure — comme démontré pour le diagnostic Syslog du chapitre 63.
- Une capture réseau permet également de distinguer une latence due au réseau d'une latence due au traitement applicatif.
- Une capture doit toujours être bornée en durée ou en taille, et ses fichiers protégés au même titre que tout autre document sensible.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un filtre de capture, contrairement à un filtre d'affichage :
   - a) Est appliqué après la capture, pour trier les résultats
   - b) Détermine quels paquets sont réellement enregistrés au moment de la capture
   - c) Ne peut jamais faire disparaître un paquet recherché
   - d) Chiffre automatiquement les paquets capturés

2. Wireshark est particulièrement utile lorsque :
   - a) Les métriques et les logs suffisent déjà à comprendre le problème
   - b) Un doute existe entre ce qu'une application croit avoir envoyé et ce qui a réellement transité sur le réseau
   - c) Aucun trafic réseau n'existe sur le système concerné
   - d) Le problème concerne uniquement l'espace disque disponible

3. Une capture réseau non bornée en durée ou en taille sur un système de production risque principalement de :
   - a) Améliorer automatiquement les performances réseau
   - b) Produire un fichier volumineux et consommer des ressources non maîtrisées
   - c) Chiffrer automatiquement le trafic capturé
   - d) Remplacer le besoin de tout autre outil de supervision

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un filtre d'affichage supprime définitivement les paquets qui ne correspondent pas au filtre. — **Faux** (il les masque seulement, section 64.3).
2. Une capture réseau peut aider à déterminer si un paquet Syslog attendu atteint réellement sa destination. — **Vrai**.
3. Une capture réseau sur un flux en clair peut révéler le contenu exact des messages transmis, y compris des données sensibles. — **Vrai**.
4. Il est recommandé de toujours lancer une capture réseau sans aucune limite de durée, pour ne rater aucun événement. — **Faux** (risque de saturation, section "Erreur n°3").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique comment une capture réseau permet de trancher, dans le scénario du chapitre 63, entre un problème situé avant Graylog et un problème situé dans Graylog lui-même.
2. Un collègue affirme qu'il n'est jamais nécessaire d'utiliser Wireshark tant qu'un système de supervision comme Zabbix ou Prometheus est en place. Discute cette affirmation.

**Corrigé 1** : une capture lancée directement sur le serveur Graylog, filtrée sur le port UDP 514, observe le trafic exactement au point où il atteint (ou n'atteint pas) le serveur. Si le paquet Syslog attendu n'apparaît jamais dans cette capture malgré l'événement déclencheur provoqué sur l'équipement source, cela prouve que le problème se situe nécessairement en amont — quelque part entre la source et le serveur Graylog, sur le réseau lui-même. Si, au contraire, le paquet apparaît bien dans la capture, cela prouve que le réseau a correctement transporté le message jusqu'au serveur, et que le problème réside donc dans le traitement de ce paquet par Graylog lui-même, une fois reçu. Cette capacité à observer précisément le point de transition entre "avant" et "après" un système donné est ce qui rend la capture réseau irremplaçable pour ce type de diagnostic.

**Corrigé 2** : cette affirmation est excessive. Zabbix et Prometheus (chapitres 59-60) mesurent des métriques agrégées et détectent des anomalies de haut niveau, mais ne montrent jamais le contenu exact d'un échange réseau précis ni ne permettent de vérifier si un paquet donné a réellement atteint sa destination. Pour la grande majorité des situations courantes, ces outils de supervision suffisent effectivement et une capture réseau serait disproportionnée. Mais pour les situations où le doute porte précisément sur ce qui transite réellement sur le réseau — comme le diagnostic Syslog du chapitre 63 — aucun outil de supervision de plus haut niveau ne peut remplacer une observation directe du trafic, faisant de Wireshark un complément nécessaire plutôt qu'un outil concurrent des systèmes de supervision déjà en place.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 64.1</span>

Écris un filtre de capture et un filtre d'affichage distincts pour observer uniquement le trafic HTTPS (port 443) entre un poste client à l'adresse 10.10.2.15 et le portail client, et explique la différence de comportement entre les deux si un paquet correspondant existe déjà avant le lancement de la capture.
</div>

**Corrigé :** Filtre de capture : `tcp port 443 and host 10.10.2.15`. Filtre d'affichage équivalent : `tcp.port == 443 && ip.addr == 10.10.2.15`. La différence de comportement se manifeste sur une capture déjà en cours ou déjà enregistrée : un filtre de capture doit être défini avant le lancement de la capture et ne peut pas être appliqué rétroactivement à des paquets déjà passés sans les avoir capturés — tout paquet correspondant qui aurait circulé avant le lancement de cette capture spécifique reste définitivement perdu. Un filtre d'affichage, en revanche, peut être appliqué ou modifié à tout moment sur une capture déjà réalisée sans aucune perte de données, puisqu'il ne fait que masquer ou révéler des paquets déjà enregistrés dans leur intégralité.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 64.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe encadrant l'usage de Wireshark sur les systèmes de production, en t'appuyant sur les risques de sécurité et de performance décrits dans ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Toute capture réseau lancée sur un système de production devra être bornée explicitement en durée ou en taille de fichier avant son lancement, évitant tout risque de saturation de ressources non maîtrisé. Tout fichier de capture généré sera considéré comme potentiellement sensible, susceptible de contenir des données confidentielles transmises en clair, et devra être supprimé dès la fin de l'analyse plutôt que conservé indéfiniment sur le poste de l'administrateur. L'usage de Wireshark restera réservé aux situations où les outils de supervision de plus haut niveau (Zabbix, Prometheus, ELK, Graylog) n'ont pas permis de trancher le diagnostic, plutôt que d'en faire un réflexe systématique disproportionné pour des problèmes courants.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends dans quelles situations l'analyse de paquets devient nécessaire, au-delà des métriques et des logs.</li>
<li>☐ Je sais distinguer un filtre de capture d'un filtre d'affichage.</li>
<li>☐ Je sais lire la structure en couches d'une trame capturée.</li>
<li>☐ Je sais utiliser une capture réseau pour trancher entre un problème réseau et un problème applicatif.</li>
<li>☐ Je comprends le risque de sécurité d'une capture sur un flux en clair.</li>
<li>☐ Je sais limiter une capture en durée ou en taille pour éviter tout impact de performance non maîtrisé.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il des droits d'administrateur pour lancer une capture réseau ?</dt>
<dd>Oui, généralement, car la capture nécessite un accès direct à l'interface réseau en mode d'écoute — un droit qui doit rester restreint aux personnes autorisées, cohérent avec le principe de moindre privilège déjà appliqué ailleurs dans ce manuel.</dd>

<dt>Wireshark peut-il déchiffrer du trafic HTTPS chiffré ?</dt>
<dd>Pas directement sans disposer de la clé privée correspondante ou d'une configuration spécifique côté client permettant l'export des clés de session — dans le cas général, un flux correctement chiffré reste illisible dans une capture, ce qui constitue précisément l'objectif du chiffrement.</dd>

<dt>Existe-t-il une alternative à Wireshark en ligne de commande pour les serveurs sans interface graphique ?</dt>
<dd>Oui, `tcpdump` remplit un rôle équivalent en ligne de commande, souvent utilisé pour capturer le trafic directement sur un serveur distant avant d'analyser le fichier de capture résultant avec l'interface graphique de Wireshark sur un poste local.</dd>

<dt>Une capture réseau ralentit-elle significativement le système sur lequel elle est lancée ?</dt>
<dd>L'impact reste généralement modéré pour une capture ciblée et de courte durée, mais peut devenir significatif sur un système à très fort trafic ou pour une capture prolongée et non filtrée — d'où l'importance de toujours cibler et borner une capture avant de la lancer sur un système de production.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Wireshark : [https://www.wireshark.org/docs/](https://www.wireshark.org/docs/)
- Wireshark — Guide de la syntaxe des filtres d'affichage : [https://www.wireshark.org/docs/dfref/](https://www.wireshark.org/docs/dfref/)

*Cette partie du manuel se termine ici. La Partie 11 s'ouvre sur le réseau d'entreprise avancé — Cisco en environnement d'entreprise, Fortinet, Mikrotik, proxy et VPN — pour approfondir les équipements dont ce chapitre a montré comment observer et diagnostiquer le trafic.*
