<div class="chapitre-titre-num">CHAPITRE 69</div>

# VPN d'entreprise (site à site, accès distant)

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Étendre le réseau de confiance de l'entreprise à travers Internet — entre les sites de Port-au-Prince et Cap-Haïtien, et pour les collaborateurs en déplacement, sans jamais exposer directement un service d'administration comme évoqué au chapitre 67. À la fin de ce chapitre, tu sauras distinguer un VPN site à site d'un VPN d'accès distant, comprendre les protocoles courants, et pourquoi le VPN seul ne suffit plus dans une approche Zero Trust déjà introduite au chapitre 26.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Deux besoins distincts se présentent simultanément à l'entreprise. D'abord, la liaison entre les sites de Port-au-Prince et Cap-Haïtien, déjà rendue redondante par OSPF au chapitre 65, transite par des liens Internet publics non chiffrés — un risque d'interception que personne n'avait encore adressé. Ensuite, plusieurs commerciaux itinérants ont besoin d'accéder ponctuellement au réseau interne depuis l'extérieur, un besoin jusqu'ici résolu de façon informelle et peu sécurisée. <em>"On a besoin de deux choses différentes,"</em> résume le DSI, <em>"relier nos deux sites en toute confidentialité, et permettre un accès distant individuel encadré."</em> Le VPN répond aux deux besoins, avec deux architectures distinctes.
</div>

## 69.1 Deux besoins distincts, deux architectures de VPN

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un **VPN site à site** relie en permanence deux réseaux entiers à travers Internet, comme s'ils étaient connectés par un câble privé — pertinent pour relier durablement Port-au-Prince et Cap-Haïtien. Un **VPN d'accès distant** relie un poste individuel au réseau de l'entreprise, à la demande, le temps d'une session — pertinent pour un commercial en déplacement ou un administrateur devant intervenir à distance, exactement le besoin déjà évoqué comme alternative sécurisée à l'exposition directe de Winbox au chapitre 67.
</div>

```mermaid
flowchart LR
    PAP[Site Port-au-Prince] <-->|VPN site a site chiffre| CAP[Site Cap-Haitien]
    Commercial[Poste commercial itinerant] -->|VPN acces distant| PAP
```

## 69.2 VPN site à site : chiffrer la liaison inter-sites

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — combler l'angle mort identifié dans le scénario d'ouverture</span>
La liaison OSPF entre Port-au-Prince et Cap-Haïtien (chapitre 65) assurait la disponibilité et la bascule automatique en cas de panne d'un lien, mais ne garantissait aucune confidentialité si ce lien empruntait un réseau public non maîtrisé. Un tunnel **IPsec** établi entre les routeurs des deux sites chiffre l'ensemble du trafic inter-sites, garantissant qu'une interception sur le trajet public ne révèle aucune donnée exploitable — une protection complémentaire, et non redondante, à la résilience déjà assurée par OSPF.
</div>

## 69.3 VPN d'accès distant : la réponse au besoin des commerciaux itinérants

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un VPN d'accès distant permet à un poste individuel authentifié d'obtenir un accès chiffré et contrôlé au réseau interne, comme s'il s'y trouvait physiquement, sans jamais exposer directement un service d'administration ou applicatif sur Internet — exactement le principe déjà recommandé au chapitre 67 en alternative à l'exposition directe de l'interface Winbox.
</div>

## 69.4 Choisir un protocole : IPsec, IKEv2, OpenVPN, WireGuard

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — un tableau de décision honnête, dans le même esprit que la section 63.6</span>

| Protocole | Points forts | Contexte d'usage typique |
|---|---|---|
| IPsec / IKEv2 | Standard largement supporté, bonne performance | VPN site à site entre équipements réseau |
| OpenVPN | Flexible, largement compatible, configuration mature | VPN d'accès distant sur des postes variés |
| WireGuard | Simplicité de configuration, performance élevée | VPN d'accès distant moderne, adoption croissante |

Aucun protocole n'est universellement supérieur — le choix dépend à nouveau du contexte réel, comme pour de nombreuses décisions déjà rencontrées dans ce manuel.
</div>

## 69.5 Authentification du VPN : le même principe que le chapitre 25

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rappel direct du chapitre 25 — le même incident, une nouvelle porte d'entrée possible</span>
Un mot de passe seul, même robuste, reste vulnérable au phishing déjà rencontré au chapitre 25. Un accès VPN d'accès distant représente une porte d'entrée directe vers le réseau interne — exiger une authentification multifacteur pour toute connexion VPN n'est donc pas optionnel, mais applique directement la même protection déjà mise en place pour Active Directory suite à l'incident de phishing du chapitre 25, cette fois à un point d'entrée tout aussi critique.
</div>

## 69.6 Tunnel complet ou split tunneling

<div class="encadre astuce">
<span class="encadre-titre">💡 Un arbitrage entre sécurité et performance</span>
Un **tunnel complet** achemine l'intégralité du trafic du poste distant à travers le VPN, y compris la navigation Internet générale, maximisant le contrôle mais ajoutant une latence et une charge sur l'infrastructure centrale. Le **split tunneling** n'achemine que le trafic destiné au réseau interne à travers le VPN, laissant le reste du trafic emprunter directement la connexion locale de l'utilisateur — un compromis de performance qui réduit toutefois la visibilité de sécurité sur l'ensemble du trafic de l'utilisateur distant. Le choix dépend de la sensibilité des données concernées et du niveau de contrôle souhaité par la RSSI.
</div>

## 69.7 Le VPN seul ne suffit plus : rappel direct du chapitre 26

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — une nuance essentielle avec l'approche Zero Trust</span>
Un VPN classique accorde généralement une confiance implicite large une fois la connexion établie — l'utilisateur connecté au VPN se retrouve traité comme s'il était physiquement sur le réseau interne, avec un accès potentiellement excessif. Le principe Zero Trust, déjà introduit au chapitre 26, recommande au contraire de ne jamais accorder de confiance implicite, même après authentification via VPN — chaque accès à une ressource spécifique devrait continuer d'être vérifié individuellement, plutôt que de considérer la connexion VPN elle-même comme une preuve suffisante de légitimité pour tout accès ultérieur.
</div>

## Atelier — Répondre aux deux besoins du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 69 — Concevoir les deux architectures VPN nécessaires</span>

**Objectif** : concevoir un VPN site à site entre Port-au-Prince et Cap-Haïtien, et un VPN d'accès distant pour les commerciaux itinérants.

**Préparation** : la liaison OSPF déjà établie entre les deux sites (chapitre 65) comme contexte de départ.

**Étapes détaillées** :

1. Propose un protocole pour le VPN site à site, en justifiant ton choix à partir du tableau de la section 69.4.
2. Propose un protocole pour le VPN d'accès distant des commerciaux, en justifiant ton choix.
3. Précise l'exigence d'authentification pour le VPN d'accès distant (section 69.5).
4. Choisis entre tunnel complet et split tunneling pour les commerciaux, en justifiant ton choix (section 69.6).
5. Explique pourquoi l'accès obtenu via ce VPN ne devrait pas, à lui seul, garantir un accès illimité aux ressources internes.
6. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : IPsec/IKEv2 convient bien au VPN site à site entre équipements réseau fixes, tandis qu'OpenVPN ou WireGuard conviennent mieux à un VPN d'accès distant sur des postes variés et nomades. L'authentification multifacteur reste obligatoire pour tout accès VPN distant, sans exception, conformément à la leçon du chapitre 25. Le split tunneling représente souvent un compromis raisonnable pour des commerciaux n'accédant qu'à des ressources internes spécifiques, réduisant la charge sur l'infrastructure centrale, à condition que les données réellement sensibles restent protégées par d'autres moyens. Enfin, conformément au principe Zero Trust (section 69.7), l'accès VPN devrait être combiné à une vérification continue des droits d'accès réels de l'utilisateur, plutôt que de considérer la seule connexion VPN comme une autorisation implicite et suffisante pour l'ensemble des ressources internes.

**Dépannage** : si un tunnel VPN se déconnecte fréquemment sans raison apparente, vérifie en priorité les paramètres de taille maximale de paquet (MTU) et les intervalles de "keepalive" configurés — une cause fréquente de déconnexions intermittentes sur les liaisons VPN.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un accès VPN distant sans authentification multifacteur</span>
Rappel de la section 69.5 : reproduit exactement le même risque déjà dénoncé pour Active Directory suite à l'incident du chapitre 25, cette fois à un point d'entrée réseau tout aussi critique.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — considérer l'accès VPN comme une autorisation implicite et suffisante</span>
Rappel de la section 69.7 : contredit directement le principe Zero Trust déjà établi au chapitre 26 — l'authentification VPN ne devrait jamais remplacer la vérification continue des droits d'accès à chaque ressource.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — un tunnel complet imposé sans justification, dégradant l'expérience utilisateur sans bénéfice de sécurité proportionné</span>
Rappel de la section 69.6 : le choix entre tunnel complet et split tunneling devrait résulter d'une analyse de risque réelle, pas d'une configuration par défaut appliquée sans réflexion.
</div>

## Diagnostiquer un tunnel VPN instable

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un tunnel VPN se déconnecte fréquemment, nécessitant une reconnexion répétée</span>

- **Diagnostic** : vérifier les paramètres de MTU (une taille de paquet mal ajustée peut provoquer une fragmentation problématique sur certains réseaux intermédiaires) et les intervalles de "keepalive" configurés entre les deux extrémités du tunnel.
- **Comment vérifier** : consulter les journaux du VPN sur les deux extrémités au moment précis d'une déconnexion, souvent explicites sur la cause immédiate.
- **Résolution** : ajuster la taille de MTU à une valeur compatible avec l'ensemble du trajet réseau emprunté, ou resserrer les intervalles de keepalive pour détecter et corriger plus rapidement une coupure transitoire.
</div>

## En entreprise

- **Bonne pratique répandue** : exiger systématiquement l'authentification multifacteur pour tout accès VPN distant, sans exception, quel que soit le niveau hiérarchique ou l'urgence de la demande.
- **Bonne pratique répandue** : combiner l'accès VPN à une segmentation réseau interne appropriée (chapitre 70), plutôt que de considérer le VPN comme la seule et unique barrière de sécurité.
- **Erreur classique observée** : un accès VPN accordé une fois pour un besoin ponctuel, puis jamais révoqué ni révisé — un compte d'ancien collaborateur ou un accès temporaire devenu permanent par oubli représente un risque résiduel que peu d'organisations auditent systématiquement.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre un VPN site à site et un VPN d'accès distant ?"**
Réponse attendue : un VPN site à site relie en permanence deux réseaux entiers à travers Internet, typiquement entre deux sites d'une même organisation ; un VPN d'accès distant relie un poste individuel au réseau de l'entreprise, à la demande, pour la durée d'une session.

**Q2. "Pourquoi l'authentification multifacteur est-elle particulièrement critique pour un VPN d'accès distant ?"**
Réponse attendue : un accès VPN représente une porte d'entrée directe vers le réseau interne ; un mot de passe seul reste vulnérable au phishing, une authentification multifacteur ajoute une protection déjà éprouvée dans ce manuel pour ce type de risque.

**Q3. "Pourquoi un VPN classique n'est-il pas suffisant dans une approche Zero Trust ?"**
Réponse attendue : un VPN classique accorde généralement une confiance implicite large une fois la connexion établie, traitant l'utilisateur comme s'il était physiquement sur le réseau interne ; le principe Zero Trust recommande de continuer à vérifier chaque accès individuellement, sans jamais considérer la seule connexion VPN comme une preuve suffisante de légitimité.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'accorde jamais d'accès VPN distant sans authentification multifacteur, et combine systématiquement cet accès à une segmentation interne appropriée plutôt que de le considérer comme une barrière de sécurité suffisante à elle seule.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Audite périodiquement la liste des accès VPN actifs et leur justification, révoquant systématiquement tout accès associé à un collaborateur ayant quitté l'organisation ou à un besoin temporaire devenu obsolète.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le choix entre tunnel complet et split tunneling a un impact direct sur la latence perçue par l'utilisateur distant — évalue ce choix en fonction du niveau de contrôle réellement nécessaire, plutôt que d'imposer systématiquement l'option la plus restrictive.
</div>

## Résumé du chapitre

- Un VPN site à site relie en permanence deux réseaux entiers, tandis qu'un VPN d'accès distant relie un poste individuel à la demande.
- Le VPN site à site entre Port-au-Prince et Cap-Haïtien chiffre la liaison déjà rendue résiliente par OSPF, une protection complémentaire et non redondante.
- Le choix du protocole VPN (IPsec/IKEv2, OpenVPN, WireGuard) dépend du contexte, sans supériorité absolue de l'un sur l'autre.
- L'authentification multifacteur reste obligatoire pour tout accès VPN distant, sans exception.
- Le tunnel complet et le split tunneling représentent un arbitrage entre contrôle de sécurité et performance.
- Un VPN classique accorde une confiance implicite qui contredit le principe Zero Trust — la vérification continue des accès reste nécessaire même après connexion VPN.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Un VPN site à site est principalement utilisé pour :
   - a) Un accès ponctuel d'un poste individuel au réseau interne
   - b) Relier en permanence deux réseaux entiers à travers Internet
   - c) Remplacer le besoin d'un reverse proxy
   - d) Chiffrer uniquement le trafic web

2. L'authentification multifacteur pour un accès VPN distant est :
   - a) Optionnelle si le mot de passe est suffisamment complexe
   - b) Obligatoire, sans exception, conformément à la leçon du chapitre 25
   - c) Uniquement nécessaire pour les administrateurs
   - d) Remplacée automatiquement par le chiffrement du tunnel VPN

3. Le split tunneling, comparé à un tunnel complet, présente l'avantage de :
   - a) Chiffrer davantage de trafic
   - b) Réduire la charge sur l'infrastructure centrale en n'acheminant que le trafic interne nécessaire
   - c) Éliminer le besoin d'authentification multifacteur
   - d) Remplacer le besoin de Zero Trust

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un VPN d'accès distant relie en permanence deux réseaux entiers, comme un VPN site à site. — **Faux** (section 69.1).
2. Une fois connecté via VPN classique, un utilisateur bénéficie généralement d'une confiance implicite large, contredisant le principe Zero Trust. — **Vrai**.
3. Le choix entre IPsec, OpenVPN et WireGuard dépend du contexte d'usage, sans protocole universellement supérieur. — **Vrai**.
4. Un accès VPN accordé pour un besoin temporaire n'a pas besoin d'être révoqué une fois ce besoin terminé. — **Faux** (section "En entreprise").
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le VPN site à site entre Port-au-Prince et Cap-Haïtien apporte une protection complémentaire, et non redondante, à la résilience déjà assurée par OSPF au chapitre 65.
2. Un collègue affirme que, puisque le VPN d'accès distant chiffre déjà la connexion et exige une authentification multifacteur, aucune vérification supplémentaire n'est nécessaire une fois l'utilisateur connecté. Discute cette affirmation à la lumière du principe Zero Trust.

**Corrigé 1** : OSPF (chapitre 65) garantit la disponibilité et la continuité de la liaison entre les deux sites, en recalculant automatiquement un chemin alternatif en cas de panne d'un lien — un objectif de résilience et de continuité. Le VPN site à site, via IPsec, garantit la confidentialité du contenu qui transite sur cette liaison, quel que soit le chemin physique effectivement emprunté — un objectif de protection des données contre l'interception. Ces deux objectifs sont indépendants l'un de l'autre : une liaison parfaitement résiliente mais non chiffrée resterait vulnérable à l'interception ; une liaison chiffrée mais sans redondance resterait vulnérable à une simple panne de lien. Les deux mécanismes se complètent donc sans se substituer l'un à l'autre.

**Corrigé 2** : cette affirmation contredit directement le principe Zero Trust déjà établi au chapitre 26. Le chiffrement et l'authentification multifacteur du VPN garantissent que la connexion elle-même est légitime et sécurisée, mais ne disent rien sur ce que cet utilisateur devrait être autorisé à faire une fois connecté — un utilisateur légitimement authentifié via VPN ne devrait pas, pour autant, obtenir un accès illimité à l'ensemble des ressources internes. Le principe Zero Trust recommande de continuer à vérifier chaque accès à une ressource spécifique, indépendamment de la connexion VPN elle-même, garantissant qu'un compte compromis après authentification (par exemple si l'appareil du commercial est lui-même infecté) ne se traduise pas automatiquement par un accès total et incontrôlé à l'ensemble du réseau interne.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 69.1</span>

Pour chacun des deux besoins suivants, indique s'il s'agit d'un cas d'usage pour un VPN site à site ou un VPN d'accès distant, et justifie brièvement : (a) un nouveau site secondaire de l'entreprise doit accéder en permanence aux mêmes ressources internes que le siège ; (b) un administrateur doit occasionnellement intervenir à distance sur un équipement, en remplacement de l'exposition directe de Winbox déjà déconseillée au chapitre 67.
</div>

**Corrigé :** (a) un VPN site à site convient à ce besoin — la connexion doit être permanente et concerner l'ensemble du réseau du nouveau site, exactement le même besoin que celui déjà couvert entre Port-au-Prince et Cap-Haïtien (section 69.2). (b) un VPN d'accès distant convient à ce besoin — l'accès est ponctuel, initié à la demande par un poste individuel, pour la durée d'une intervention spécifique, exactement le cas d'usage déjà identifié comme alternative sécurisée à l'exposition directe de l'interface d'administration au chapitre 67 (section 69.3).

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 69.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucun accès VPN d'accès distant n'est jamais accordé sans authentification multifacteur, en t'appuyant sur le risque décrit à la section 69.5.
</div>

**Corrigé (exemple de réponse) :** Tout accès VPN d'accès distant devra être configuré avec une exigence d'authentification multifacteur activée dès sa création, sans possibilité de dérogation même pour un besoin jugé temporaire ou urgent. Cette exigence rejoint directement la mesure déjà mise en place pour Active Directory suite à l'incident de phishing du chapitre 25, un accès VPN représentant une porte d'entrée tout aussi critique vers le réseau interne. Toute demande de création d'un nouvel accès VPN sans authentification multifacteur activée sera automatiquement refusée par le processus de mise en service, plutôt que de dépendre de la vigilance individuelle de la personne configurant cet accès.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends la différence entre un VPN site à site et un VPN d'accès distant.</li>
<li>☐ Je sais pourquoi un VPN site à site apporte une protection complémentaire à la résilience OSPF déjà établie.</li>
<li>☐ Je sais choisir un protocole VPN adapté au contexte (IPsec/IKEv2, OpenVPN, WireGuard).</li>
<li>☐ Je comprends pourquoi l'authentification multifacteur reste obligatoire pour tout accès VPN distant.</li>
<li>☐ Je sais arbitrer entre tunnel complet et split tunneling selon le besoin réel.</li>
<li>☐ Je comprends pourquoi un VPN classique ne suffit pas à lui seul dans une approche Zero Trust.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Un VPN reste-t-il pertinent dans une infrastructure entièrement adoptant l'approche Zero Trust ?</dt>
<dd>Oui, souvent en complément d'autres mécanismes plutôt qu'en remplacement complet — certaines architectures Zero Trust modernes remplacent progressivement le VPN traditionnel par un accès applicatif granulaire (ZTNA, Zero Trust Network Access), mais le VPN reste largement répandu et pertinent, notamment pour les liaisons site à site.</dd>

<dt>WireGuard est-il suffisamment mature pour un usage en entreprise, malgré sa relative jeunesse par rapport à IPsec ?</dt>
<dd>Oui, WireGuard est aujourd'hui largement adopté en environnement professionnel, apprécié pour la simplicité de sa configuration et ses performances, bien que son adoption reste plus récente que celle d'IPsec pour les VPN site à site traditionnels.</dd>

<dt>Faut-il un VPN distinct pour chaque catégorie d'utilisateur (commerciaux, administrateurs), ou un seul VPN suffit-il ?</dt>
<dd>Un seul système VPN peut généralement servir plusieurs catégories d'utilisateurs, à condition que les droits d'accès une fois connecté restent correctement différenciés selon le profil de l'utilisateur — une distinction qui relève davantage de la segmentation interne (chapitre 70) que du VPN lui-même.</dd>

<dt>Le VPN protège-t-il contre un appareil déjà compromis avant sa connexion ?</dt>
<dd>Non, le VPN sécurise le canal de communication, pas l'intégrité de l'appareil qui l'utilise — un poste déjà infecté avant sa connexion VPN reste une menace une fois connecté au réseau interne, ce qui renforce l'importance du principe Zero Trust et de la vérification continue déjà évoqués à la section 69.7.</dd>
</dl>

## Références et pour aller plus loin

- NIST — Guide to IPsec VPNs (SP 800-77) : [https://csrc.nist.gov/publications/detail/sp/800-77/rev-1/final](https://csrc.nist.gov/publications/detail/sp/800-77/rev-1/final)
- Documentation officielle WireGuard : [https://www.wireguard.com/](https://www.wireguard.com/)
- Documentation officielle OpenVPN : [https://openvpn.net/community-resources/](https://openvpn.net/community-resources/)

*Chapitre suivant : la segmentation VLAN, pour clore la Partie 11 — approfondir et formaliser la logique de segmentation déjà rencontrée à plusieurs reprises dans cette partie, appliquée à l'ensemble de l'infrastructure réseau interne de l'entreprise.*
