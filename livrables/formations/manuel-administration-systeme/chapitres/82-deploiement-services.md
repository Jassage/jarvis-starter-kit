<div class="chapitre-titre-num">CHAPITRE 82</div>

# Déploiement des services Windows/Linux

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Mettre en œuvre concrètement l'architecture conçue au chapitre 81 sur l'ensemble des quatre sites de l'entreprise, en s'appuyant sur l'automatisation déjà maîtrisée dans ce manuel plutôt que sur un déploiement manuel répété. À la fin de ce chapitre, tu sauras structurer un déploiement multi-sites avec Ansible, respecter l'ordre de dépendance entre services, intégrer le durcissement dès le déploiement, et valider automatiquement que chaque service fonctionne réellement une fois déployé.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Face à l'échéance serrée d'ouverture du nouveau site, un administrateur propose de déployer rapidement les services nécessaires manuellement, "juste cette fois, pour respecter les délais", en reportant l'intégration à l'automatisation existante à plus tard. Le DSI s'y oppose fermement : <em>"On a justement construit toute cette automatisation Ansible et Terraform pour ne plus jamais avoir à faire ça manuellement. Le nouveau site doit être déployé exactement de la même façon reproductible que les autres, sinon on recrée le même problème de configuration divergente qu'on a déjà résolu au chapitre 52."</em> Ce chapitre déploie donc l'ensemble des services en s'appuyant systématiquement sur l'automatisation déjà en place.
</div>

## 82.1 Le problème : déployer quatre sites sans répéter manuellement chaque étape

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct du chapitre 52</span>
Un déploiement manuel, même bien documenté, introduit inévitablement de petites divergences entre sites au fil du temps — exactement le même risque de dérive de configuration déjà dénoncé au chapitre 52 pour une administration manuelle multi-serveurs. Un déploiement automatisé garantit que chaque site, y compris le nouveau, reçoit une configuration strictement identique pour les mêmes types de services, éliminant cette source d'incohérence dès le départ.
</div>

## 82.2 Playbooks Ansible pour un déploiement standardisé par rôle

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du chapitre 53</span>
Les rôles Ansible déjà présentés au chapitre 53 structurent le déploiement de chaque type de service — un rôle `controleur-domaine`, un rôle `serveur-dns`, un rôle `agent-supervision` — chacun réutilisable et appliqué de façon cohérente à tout serveur du type correspondant, quel que soit le site concerné.
</div>

```yaml
# site.yml - playbook principal de deploiement
- hosts: controleurs_domaine
  roles:
    - role: controleur-domaine
    - role: durcissement-cis-windows

- hosts: serveurs_linux
  roles:
    - role: durcissement-cis-linux
    - role: agent-supervision
    - role: agent-edr
```

## 82.3 Déployer le nouveau site avec le même playbook

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Répondre directement au scénario d'ouverture</span>
Le nouveau site n'exige aucun nouveau playbook — il s'agit simplement d'ajouter ses serveurs à l'inventaire Ansible existant (chapitre 52), avec les rôles appropriés selon les décisions d'architecture du chapitre 81 (pas de contrôleur de domaine local, mais un agent de supervision et un agent EDR malgré tout). Cette réutilisation directe de l'automatisation déjà éprouvée sur les trois autres sites répond exactement à l'exigence du DSI dans le scénario d'ouverture — une cohérence garantie structurellement, plutôt que par la seule discipline d'un déploiement manuel suivant une documentation.
</div>

```yaml
# inventaire - ajout du nouveau site
[serveurs_linux]
nouveau-site-app01 ansible_host=10.10.4.10

[agents_edr:children]
serveurs_linux
serveurs_windows
```

## 82.4 Respecter l'ordre de dépendance entre services

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel indirect des chapitres 9-10</span>
Certains services dépendent d'autres pour fonctionner correctement — un serveur DNS interne dépend généralement d'un contrôleur de domaine déjà opérationnel, un service DHCP dépend d'un serveur DNS déjà configuré pour l'enregistrement dynamique. Le playbook de déploiement doit respecter cet ordre de dépendance, Ansible exécutant les tâches dans l'ordre défini plutôt que de façon simultanée non coordonnée — un déploiement qui ignore cet ordre risque des échecs de service au démarrage, même avec une configuration par ailleurs correcte.
</div>

## 82.5 Intégrer le durcissement dès le déploiement initial

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct de la section 73.7</span>
Le rôle `durcissement-cis-windows` et `durcissement-cis-linux` du playbook de la section 82.2 applique les recommandations CIS Benchmarks déjà présentées au chapitre 73 dès le déploiement initial de chaque serveur, plutôt que comme une action ponctuelle réalisée après coup — exactement le principe déjà établi de durcir une fois dans l'automatisation, puis réutiliser systématiquement sur chaque nouveau déploiement, garantissant qu'aucun serveur du nouveau site n'entre en production sans ce niveau de protection de base.
</div>

## 82.6 Valider automatiquement que chaque service fonctionne réellement

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel indirect du chapitre 57</span>
Une fois le déploiement effectué, une validation automatisée confirme que chaque service fonctionne réellement — une résolution DNS test, une authentification test contre le contrôleur de domaine, une vérification que l'agent de supervision remonte bien ses métriques — plutôt que de considérer le déploiement comme réussi sur la seule base de l'absence d'erreur durant l'exécution du playbook, exactement le même réflexe de vérification déjà établi pour les étapes du pipeline DevSecOps.
</div>

## 82.7 Documenter le déploiement réalisé

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct des chapitres 2 et 80</span>
Chaque déploiement de site devrait être documenté — quels rôles ont été appliqués, quelle version du playbook, quelle date — rejoignant directement le principe de documentation déjà établi comme fondation du métier au chapitre 2, et alimentant la documentation finale qui sera consolidée au chapitre 86 pour la remise complète du projet.
</div>

## Atelier — Déployer le nouveau site avec l'automatisation existante

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 82 — Répondre concrètement au scénario d'ouverture</span>

**Objectif** : ajouter le nouveau site à l'automatisation Ansible existante et déployer ses services conformément à l'architecture du chapitre 81, sans aucun déploiement manuel.

**Préparation** : l'inventaire Ansible et les rôles déjà établis pour les trois autres sites.

**Étapes détaillées** :

1. Ajoute les serveurs du nouveau site à l'inventaire Ansible, avec les groupes appropriés selon les décisions d'architecture du chapitre 81 (section 82.3).
2. Vérifie que l'ordre de dépendance des rôles appliqués respecte les besoins réels de ce site, en tenant compte de l'absence de contrôleur de domaine local (section 82.4).
3. Exécute le playbook de déploiement et documente les rôles appliqués.
4. Effectue une validation post-déploiement confirmant que l'agent de supervision et l'agent EDR remontent correctement leurs données (section 82.6).
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le nouveau site reçoit exactement les mêmes rôles de durcissement, de supervision et de protection EDR que les autres sites, sans configuration manuelle distincte — répondant directement à l'exigence du DSI dans le scénario d'ouverture. La validation post-déploiement confirme concrètement que ces services fonctionnent réellement, plutôt que de simplement supposer leur bon fonctionnement sur la base de l'exécution sans erreur du playbook. La documentation de ce déploiement rejoint directement le principe déjà établi au chapitre 2, et prépare la consolidation finale prévue au chapitre 86.

**Dépannage** : si le déploiement échoue sur une tâche liée à l'authentification contre le contrôleur de domaine du siège, vérifie en priorité la connectivité VPN entre le nouveau site et le siège (rappel du chapitre 81) — une dépendance réseau facilement négligée lorsque l'attention se concentre sur la configuration logicielle elle-même.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — un déploiement manuel "exceptionnel" pour respecter un délai serré</span>
Rappel du scénario d'ouverture : une exception ponctuelle recrée précisément le risque de dérive de configuration que l'automatisation avait pour but d'éliminer.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — un ordre de dépendance entre services non respecté dans le playbook</span>
Rappel de la section 82.4 : un service déployé avant sa dépendance échoue généralement au démarrage, même avec une configuration par ailleurs correcte.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — aucune validation post-déploiement, un service supposé fonctionnel sans vérification réelle</span>
Rappel de la section 82.6 : l'absence d'erreur durant l'exécution d'un playbook ne garantit pas nécessairement le bon fonctionnement réel du service déployé.
</div>

## Diagnostiquer un service qui échoue au démarrage sur un nouveau site

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un service échoue à démarrer correctement immédiatement après un déploiement automatisé sur un nouveau site</span>

- **Diagnostic** : vérifier si ce service dépend d'un autre service qui n'était pas encore pleinement opérationnel au moment de son propre démarrage — un problème d'ordre de dépendance (section 82.4) plutôt qu'une erreur de configuration du service lui-même.
- **Comment vérifier** : consulter l'ordre d'exécution des rôles dans le playbook et le comparer à l'ordre de dépendance réel entre les services concernés.
- **Résolution** : réordonner les rôles dans le playbook selon la dépendance réelle, ou ajouter une vérification explicite qu'un service prérequis est bien opérationnel avant de poursuivre le déploiement du service suivant.
</div>

## En entreprise

- **Bonne pratique répandue** : traiter toute demande de "déploiement manuel exceptionnel" comme un signal d'alerte nécessitant une justification forte, plutôt qu'une simplicité acceptée par défaut sous la pression d'un délai.
- **Bonne pratique répandue** : maintenir l'inventaire Ansible comme la source de vérité unique de l'ensemble des serveurs de l'organisation, tout nouveau serveur y étant ajouté avant tout déploiement, jamais après.
- **Erreur classique observée** : un nouveau site déployé rapidement "à la main" pour respecter une échéance commerciale, avec la promesse de "l'intégrer proprement à l'automatisation plus tard" — une promesse rarement tenue une fois le site opérationnel et l'urgence apparente disparue, laissant une divergence de configuration permanente.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi est-il important de déployer un nouveau site avec exactement la même automatisation que les sites existants, plutôt qu'une configuration ad hoc plus rapide à mettre en place ?"**
Réponse attendue : garantir une cohérence de configuration structurelle plutôt que dépendante de la discipline humaine, éliminant le risque de dérive déjà dénoncé pour toute administration manuelle répétée, et assurant que le nouveau site bénéficie du même niveau de durcissement et de supervision que les autres.

**Q2. "Pourquoi l'ordre d'exécution des rôles dans un playbook de déploiement est-il important ?"**
Réponse attendue : certains services dépendent d'autres services déjà opérationnels pour fonctionner correctement ; un déploiement qui ignore cet ordre de dépendance risque des échecs au démarrage, même avec une configuration individuellement correcte pour chaque service.

**Q3. "Pourquoi une validation post-déploiement automatisée reste-t-elle nécessaire, même après une exécution de playbook sans erreur signalée ?"**
Réponse attendue : l'absence d'erreur durant l'exécution confirme uniquement que les tâches se sont déroulées sans échec technique immédiat, pas nécessairement que le service fonctionne réellement comme attendu dans son usage concret ; une vérification fonctionnelle explicite reste nécessaire pour s'en assurer.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
N'accorde jamais d'exception à l'automatisation de déploiement, même sous la pression d'un délai serré — un déploiement manuel exceptionnel recrée systématiquement le risque de dérive de configuration que l'automatisation vise précisément à éliminer.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Maintiens l'inventaire Ansible comme source de vérité unique pour l'ensemble des serveurs de l'organisation, avec une documentation systématique de chaque déploiement réalisé.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Un déploiement automatisé et validé reste significativement plus rapide, sur la durée, qu'un déploiement manuel répété pour chaque nouveau site — l'investissement initial dans l'automatisation se rentabilise dès le deuxième ou troisième déploiement similaire.
</div>

## Résumé du chapitre

- Un déploiement manuel, même exceptionnel et ponctuel, recrée le risque de dérive de configuration déjà résolu par l'automatisation Ansible.
- Les rôles Ansible déjà présentés au chapitre 53 structurent un déploiement standardisé, réutilisable pour tout nouveau site sans nouveau playbook.
- L'ordre de dépendance entre services doit être respecté dans le playbook, sous peine d'échecs au démarrage.
- Le durcissement CIS Benchmarks s'intègre dès le déploiement initial, garantissant un niveau de protection de base sur chaque nouveau serveur.
- Une validation post-déploiement automatisée confirme le bon fonctionnement réel des services, au-delà de la simple absence d'erreur d'exécution.
- Chaque déploiement doit être documenté, alimentant la documentation finale du projet qui sera consolidée au chapitre 86.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Déployer un nouveau site avec l'automatisation Ansible déjà existante, plutôt qu'une configuration manuelle exceptionnelle, permet principalement de :
   - a) Réduire le nombre total de serveurs nécessaires
   - b) Garantir une cohérence de configuration structurelle plutôt que dépendante de la discipline humaine
   - c) Éliminer le besoin de tout playbook
   - d) Remplacer le besoin d'une architecture définie au préalable

2. Un service déployé avant sa dépendance requise risque de :
   - a) Fonctionner normalement sans aucun impact
   - b) Échouer au démarrage, même avec une configuration individuellement correcte
   - c) Améliorer automatiquement les performances
   - d) Remplacer le besoin de validation post-déploiement

3. Une validation post-déploiement automatisée sert principalement à :
   - a) Remplacer le besoin du playbook lui-même
   - b) Confirmer le bon fonctionnement réel des services, au-delà de l'absence d'erreur d'exécution
   - c) Documenter automatiquement l'architecture globale
   - d) Réduire le temps d'exécution du playbook

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un déploiement manuel exceptionnel, réalisé pour respecter un délai serré, ne présente aucun risque particulier tant qu'il est bien documenté. — **Faux** (section "Erreur n°1").
2. Le nouveau site peut être ajouté à l'inventaire Ansible existant sans nécessiter de nouveau playbook. — **Vrai** (section 82.3).
3. L'absence d'erreur durant l'exécution d'un playbook garantit à elle seule le bon fonctionnement réel des services déployés. — **Faux** (section 82.6).
4. Le durcissement CIS Benchmarks devrait être appliqué après le déploiement initial, plutôt qu'intégré dès le départ. — **Faux** (section 82.5).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le DSI, dans le scénario d'ouverture, refuse la proposition de déploiement manuel exceptionnel malgré l'urgence réelle du délai d'ouverture du nouveau site.
2. Un collègue propose de valider le succès du déploiement du nouveau site uniquement sur la base de l'absence d'erreur affichée par Ansible durant l'exécution du playbook. Explique pourquoi cette validation reste insuffisante.

**Corrigé 1** : le DSI reconnaît que l'urgence du délai, bien que réelle, ne justifie pas de recréer un risque déjà identifié et résolu par l'automatisation existante — un déploiement manuel "exceptionnel" laisserait le nouveau site dans un état de configuration potentiellement divergent des trois autres, exactement le problème que l'adoption d'Ansible au chapitre 52 avait pour but d'éliminer structurellement. De plus, l'automatisation existante ne rend pas nécessairement le déploiement plus lent qu'une approche manuelle — au contraire, elle devrait accélérer un déploiement déjà éprouvé sur trois sites précédents, rendant l'argument de gain de temps par le contournement manuel discutable dans les faits, pas seulement risqué en principe.

**Corrigé 2** : l'exécution sans erreur d'un playbook Ansible confirme uniquement que chaque tâche technique s'est déroulée sans échec immédiat détecté par l'outil lui-même — elle ne garantit pas que le service configuré fonctionne réellement comme attendu dans son usage concret. Un service pourrait démarrer sans erreur technique tout en étant mal configuré fonctionnellement (une résolution DNS incorrecte, un agent de supervision démarré mais ne remontant aucune métrique réelle) — des problèmes invisibles à Ansible lui-même mais détectables par une validation fonctionnelle explicite (section 82.6), comme celle déjà pratiquée pour chaque étape critique d'un pipeline de déploiement tout au long de ce manuel.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 82.1</span>

Ordonne les tâches suivantes selon leurs dépendances logiques pour le déploiement d'un nouveau serveur applicatif sur le nouveau site : configuration de l'agent EDR, installation du système d'exploitation durci selon les CIS Benchmarks, connexion au VPN vers le siège, authentification contre le contrôleur de domaine du siège, configuration de l'agent de supervision.
</div>

**Corrigé :** L'ordre logique serait : 1) installation du système d'exploitation durci selon les CIS Benchmarks (la fondation du serveur lui-même, section 82.5) ; 2) connexion au VPN vers le siège (nécessaire pour toute communication ultérieure avec les services centralisés) ; 3) authentification contre le contrôleur de domaine du siège (dépend de la connectivité VPN établie à l'étape précédente, rappel de l'architecture du chapitre 81) ; 4) configuration de l'agent de supervision (peut nécessiter une identification du serveur, généralement liée à son intégration au domaine) ; 5) configuration de l'agent EDR (typiquement indépendant de l'authentification au domaine, mais placé en dernier pour confirmer que le serveur est pleinement intégré et fonctionnel avant l'activation de sa protection active). Cet ordre respecte le principe de dépendance déjà établi à la section 82.4 — chaque étape s'appuie sur la réussite effective de la précédente.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 82.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe interdisant tout déploiement manuel exceptionnel, même sous la pression d'un délai commercial urgent, en t'appuyant sur le scénario d'ouverture de ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Aucun serveur ou service ne sera déployé en production en dehors de l'automatisation Ansible déjà établie, quelle que soit l'urgence commerciale invoquée pour justifier une exception ponctuelle. Toute contrainte de délai perçue comme incompatible avec le déploiement automatisé standard sera traitée comme un problème à résoudre au sein du processus d'automatisation lui-même (par exemple, en accélérant ou en parallélisant certaines étapes), plutôt que comme une justification pour le contourner. Cette règle s'applique en particulier à l'ouverture de tout nouveau site, garantissant que la cohérence structurelle de configuration entre tous les sites de l'organisation ne soit jamais compromise par une pression temporelle ponctuelle, aussi légitime soit-elle par ailleurs.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi un déploiement automatisé reste préférable à un déploiement manuel, même exceptionnel.</li>
<li>☐ Je sais structurer un déploiement multi-sites avec des rôles Ansible réutilisables.</li>
<li>☐ Je sais respecter l'ordre de dépendance entre services dans un playbook de déploiement.</li>
<li>☐ Je sais intégrer le durcissement CIS Benchmarks dès le déploiement initial d'un serveur.</li>
<li>☐ Je sais concevoir une validation post-déploiement confirmant le bon fonctionnement réel des services.</li>
<li>☐ Je comprends l'importance de documenter chaque déploiement réalisé.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Faut-il un playbook Ansible entièrement distinct pour chaque nouveau site ?</dt>
<dd>Non, l'objectif même de l'automatisation par rôles réutilisables (chapitre 53) est de permettre l'ajout d'un nouveau site simplement en l'intégrant à l'inventaire existant avec les groupes appropriés, sans nécessiter de nouveau playbook dédié.</dd>

<dt>Que faire si un besoin réellement spécifique à un site ne peut pas être couvert par les rôles génériques existants ?</dt>
<dd>Un nouveau rôle spécifique peut être créé pour ce besoin particulier, tout en conservant les rôles génériques pour l'ensemble des besoins communs — l'objectif reste la réutilisation maximale, pas une uniformité absolue qui ignorerait un besoin légitimement distinct.</dd>

<dt>Combien de temps devrait prendre le déploiement d'un nouveau site avec cette automatisation déjà en place ?</dt>
<dd>Significativement moins de temps qu'un déploiement manuel équivalent, une fois l'inventaire mis à jour — la durée exacte dépend du nombre de serveurs et de rôles à appliquer, mais l'essentiel du travail de configuration a déjà été capitalisé dans l'automatisation existante lors des déploiements précédents.</dd>

<dt>La validation post-déploiement doit-elle être manuelle ou peut-elle également être automatisée ?</dt>
<dd>Une validation automatisée, intégrée directement au processus de déploiement, reste préférable à une vérification manuelle a posteriori — reproduisant le même principe déjà établi pour les vérifications automatisées du pipeline DevSecOps au chapitre 57.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Ansible — Roles : rappel du chapitre 53 de ce manuel.
- Microsoft Learn — Bonnes pratiques de déploiement Active Directory multi-sites : rappel des chapitres 5-6 de ce manuel.

*Chapitre suivant : la conteneurisation et le CI/CD du projet — étendre l'automatisation de ce chapitre aux applications conteneurisées de l'entreprise, notamment pour le nouveau site s'il vient à héberger des services applicatifs propres.*
