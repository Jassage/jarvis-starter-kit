<div class="chapitre-titre-num">CHAPITRE 48</div>

# Google Cloud Platform : architecture et services essentiels

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Compléter la vue d'ensemble des trois grands fournisseurs cloud en identifiant l'argument différenciateur de GCP : son lien historique avec Kubernetes, déjà largement pratiqué en Partie 7. À la fin de ce chapitre, tu sauras situer les équivalents GCP des services déjà appris, comprendre GKE comme service Kubernetes managé, et juger objectivement si déléguer la gestion du plan de contrôle Kubernetes à un fournisseur se justifie pour l'entreprise de ce manuel.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le cluster Kubernetes du portail client (chapitres 42-44) fonctionne bien, mais maintenir le plan de contrôle représente une charge opérationnelle réelle pour une équipe encore réduite. Un membre de l'équipe, qui a suivi une formation externe, mentionne que Google Kubernetes Engine (GKE) — le service managé de Google Cloud — bénéficierait d'une maturité particulière, Google ayant elle-même créé et open-sourcé Kubernetes en 2014. <em>"Est-ce qu'on ne devrait pas confier notre cluster à ceux qui l'ont inventé ?"</em> demande-t-il. Une question légitime, mais qui mérite d'être posée avec la même rigueur que chaque choix technologique de ce manuel, pas par simple fascination pour l'origine du projet.
</div>

## 48.1 L'argument différenciateur de GCP : l'origine de Kubernetes

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — un fait historique réel, à ne pas confondre avec une garantie de supériorité</span>
Rappel direct du chapitre 42 : Kubernetes est né en interne chez Google (dérivé de son système interne Borg) avant d'être open-sourcé en 2014. **GKE** (*Google Kubernetes Engine*) bénéficie de cette antériorité — souvent cité comme le service Kubernetes managé historiquement le plus mature de l'industrie. Cet héritage constitue un argument réel, mais AWS (EKS) et Azure (AKS) ont depuis largement rattrapé cette avance sur les fonctionnalités essentielles — l'origine historique ne garantit pas, à elle seule, une supériorité actuelle décisive pour tous les besoins.
</div>

## 48.2 Régions et zones : le même principe déjà établi

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct des chapitres 46-47</span>
GCP utilise également des régions et des zones, avec la même logique de répartition déjà expliquée pour AWS et Azure — le même principe de site de repli du chapitre 31, transposé une troisième fois sans changement conceptuel.
</div>

## 48.3 Correspondances directes avec les services déjà appris

| Besoin déjà couvert | AWS (chapitre 46) | Azure (chapitre 47) | GCP |
|---|---|---|---|
| Instance de calcul | EC2 | Virtual Machines | Compute Engine |
| Stockage d'objets | S3 | Blob Storage | Cloud Storage |
| Base de données managée | RDS | Azure SQL Database | Cloud SQL |
| Service Kubernetes managé | EKS | AKS | **GKE** (section 48.6) |
| Identité et permissions | IAM | Microsoft Entra ID | Cloud IAM |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le même piège de stockage public, sous un troisième nom</span>
Rappel direct des chapitres 46-47 : un bucket **Cloud Storage** mal configuré présente exactement le même risque d'exposition publique accidentelle qu'un bucket S3 ou un compte de stockage Azure Blob — la vigilance de configuration reste identique, quel que soit le fournisseur, exactement le même principe de responsabilité partagée rappelé à chaque chapitre de cette partie.
</div>

## 48.4 Une vraie différence technique : le VPC global de GCP

<div class="encadre astuce">
<span class="encadre-titre">💡 Une différence réelle, pas seulement cosmétique</span>
Contrairement à AWS et Azure, où un VPC/VNet reste généralement circonscrit à une seule région (nécessitant un appairage explicite entre régions pour les faire communiquer), un **VPC GCP est global par défaut** — un seul réseau virtuel peut s'étendre nativement à travers toutes les régions GCP, simplifiant une architecture multi-régions par rapport aux deux autres fournisseurs. Une différence technique réelle à connaître, même si elle ne concerne pas tous les besoins.
</div>

## 48.5 GKE : le service Kubernetes managé, rappel direct des chapitres 42-44

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ GKE délègue exactement ce qui a été manuellement géré aux chapitres 42-44</span>
Rappel direct du chapitre 42 : le plan de contrôle Kubernetes (API Server, etcd, Scheduler, Controller Manager) demande une charge opérationnelle réelle à maintenir. GKE délègue entièrement cette responsabilité à Google — l'équipe ne gère plus que les nœuds de travail et les charges applicatives elles-mêmes (les manifestes déjà maîtrisés au chapitre 43), exactement la même distinction déjà établie pour RDS et Azure SQL Database au sein du modèle PaaS (chapitre 45).
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — le mode "Autopilot" de GKE</span>
GKE propose un mode "Autopilot" qui va plus loin encore, gérant automatiquement le dimensionnement des nœuds eux-mêmes selon la charge — une automatisation supplémentaire de l'HPA déjà présenté au chapitre 44, réduisant encore la charge opérationnelle au prix d'une flexibilité de configuration réduite, un compromis à évaluer selon les besoins réels de contrôle fin de l'équipe.
</div>

## 48.6 Cloud IAM et Cloud SQL : les mêmes principes, un troisième vocabulaire

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — la répétition confirme un principe transversal</span>
Cloud IAM applique exactement le même principe du moindre privilège déjà établi pour AWS IAM et Microsoft Entra ID (sections 46.6 et 47.5) — jamais de compte disposant d'un accès total par défaut. Cloud SQL applique le même modèle PaaS que RDS et Azure SQL Database. La répétition de ces principes à travers trois fournisseurs différents n'est pas une coïncidence : ce sont des principes fondamentaux de sécurité cloud, indépendants de toute marque particulière.
</div>

## 48.7 Le vrai critère de décision : la compétence de l'équipe, pas l'origine du projet

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Répondre à la question du scénario d'ouverture</span>
Le fait que Google ait créé Kubernetes ne garantit pas, à lui seul, que GKE soit le meilleur choix pour cette entreprise précise — exactement le même principe de décision contextuelle déjà appliqué au chapitre 14 (choix de distribution) et au chapitre 47 (AWS vs Azure). Le critère décisif reste : l'équipe a-t-elle déjà une compétence ou une infrastructure sur un fournisseur particulier (comme AWS, déjà pilote pour le portail au chapitre 46) ? Introduire un troisième fournisseur cloud pour un seul avantage historique, sans autre justification concrète, disperse la compétence de l'équipe plutôt que de la consolider.
</div>

## Atelier — Évaluer la proposition de migration vers GKE

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 48 — Appliquer le cadre de décision à la question du collègue</span>

**Objectif** : trancher objectivement la proposition du scénario d'ouverture, en s'appuyant sur les principes déjà établis dans ce manuel.

**Préparation** : aucune installation nécessaire.

**Étapes détaillées** :

1. Liste les arguments réels en faveur d'une migration vers GKE, en distinguant les arguments techniques concrets (section 48.5) de l'argument historique seul (section 48.1).
2. Liste les arguments contre l'introduction d'un troisième fournisseur cloud, sachant que le portail est déjà pilote sur AWS (chapitre 46).
3. Formule une recommandation, en proposant une alternative si une migration complète vers GCP ne se justifie pas.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : l'argument technique réel est la réduction de charge opérationnelle du plan de contrôle (section 48.5) — un bénéfice concret, mais **également disponible via EKS sur AWS**, déjà le fournisseur en place pour le portail. L'argument historique seul (Google a créé Kubernetes) ne constitue pas, à lui seul, une justification suffisante selon le principe de la section 48.7. La recommandation raisonnable est d'évaluer EKS (le service Kubernetes managé d'AWS, le fournisseur déjà en place) avant d'introduire un troisième fournisseur cloud uniquement pour un avantage historique non déterminant — cohérent avec le principe déjà établi de ne jamais disperser la compétence de l'équipe sans besoin réellement démontré.

**Dépannage** : si tu penches malgré tout vers GCP, assure-toi que ta justification s'appuie sur un besoin technique concret (comme le VPC global de la section 48.4, si l'entreprise prévoit une expansion multi-régions réelle), jamais uniquement sur la réputation historique du fournisseur.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — choisir un fournisseur cloud par fascination pour son histoire plutôt que par besoin réel</span>
Exactement le piège du scénario d'ouverture — l'origine de Kubernetes chez Google est un fait intéressant, pas un critère de décision suffisant en soi, rappel direct de la section 48.7.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — négliger la vérification de configuration de Cloud Storage</span>
Rappel de la section 48.3 : le même risque d'exposition publique accidentelle qu'AWS S3 et Azure Blob Storage, sous un nom différent — la vigilance reste identique.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — sous-estimer le coût de disperser la compétence de l'équipe sur trois fournisseurs</span>
Rappel de la section 48.7 : chaque fournisseur cloud supplémentaire adopté représente un coût réel de formation et de maintien de compétence, un facteur souvent sous-estimé face à l'attrait d'une fonctionnalité ou d'une réputation particulière.
</div>

## En entreprise

- **Bonne pratique répandue** : évaluer d'abord si le fournisseur cloud déjà en place propose une solution équivalente au besoin identifié, avant d'envisager l'introduction d'un nouveau fournisseur — ici, EKS sur AWS avant GKE sur GCP.
- **Bonne pratique répandue** : documenter (chapitre 3) la justification précise de chaque fournisseur cloud adopté par l'organisation, distinguant les arguments techniques concrets des préférences ou réputations non déterminantes.
- **Erreur classique observée** : des équipes qui adoptent un troisième ou quatrième fournisseur cloud au fil de projets successifs, chacun justifié individuellement de façon isolée, aboutissant collectivement à une dispersion de compétence et de coût opérationnel jamais évaluée dans son ensemble.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi GKE est-il souvent cité comme particulièrement mature pour Kubernetes ?"**
Réponse attendue : Google a créé et open-sourcé Kubernetes en 2014, dérivé de son système interne Borg — GKE bénéficie de cette antériorité historique, bien qu'AWS (EKS) et Azure (AKS) aient depuis largement rattrapé cette avance sur les fonctionnalités essentielles.

**Q2. "Qu'est-ce qui distingue techniquement le VPC de GCP de ceux d'AWS et Azure ?"**
Réponse attendue : un VPC GCP est global par défaut, pouvant s'étendre nativement à travers toutes les régions GCP sans appairage explicite, contrairement aux VPC/VNet d'AWS et Azure, généralement circonscrits à une seule région.

**Q3. "Faut-il choisir un fournisseur cloud uniquement sur des critères techniques objectifs ?"**
Réponse attendue : non — la compétence déjà acquise par l'équipe et l'infrastructure déjà en place pèsent souvent davantage qu'un avantage technique ou historique isolé, rappel direct du principe de décision contextuelle déjà appliqué à chaque choix technologique de ce manuel (chapitres 14, 42, 47).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Applique la même vigilance de configuration (Cloud IAM au moindre privilège, Cloud Storage jamais public par défaut) sur GCP que sur AWS et Azure — les principes de sécurité cloud restent transversaux, indépendants de la marque du fournisseur.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) la justification de chaque fournisseur cloud adopté, en distinguant explicitement les arguments techniques concrets des préférences non déterminantes — une distinction utile pour toute future revue d'architecture.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Le mode Autopilot de GKE (section 48.5) réduit la charge opérationnelle au prix d'une flexibilité réduite — un compromis à évaluer selon le besoin réel de contrôle fin de l'équipe, pas un choix par défaut automatique.
</div>

## Résumé du chapitre

- GCP offre les mêmes concepts fondamentaux qu'AWS et Azure (régions, zones, calcul, stockage, base de données managée, IAM) sous un troisième vocabulaire.
- L'origine historique de Kubernetes chez Google constitue un argument réel mais non suffisant à lui seul pour justifier l'adoption de GKE.
- Le VPC global de GCP constitue une différence technique réelle par rapport aux VPC/VNet régionaux d'AWS et Azure.
- GKE délègue la gestion du plan de contrôle Kubernetes, exactement la charge opérationnelle déjà identifiée aux chapitres 42-44, un service également disponible via EKS sur AWS.
- Le critère de décision décisif reste la compétence déjà acquise par l'équipe et l'infrastructure déjà en place, jamais la seule réputation ou l'origine historique d'un fournisseur.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Kubernetes a été créé à l'origine par :
   - a) Amazon
   - b) Microsoft
   - c) Google
   - d) Une fondation indépendante dès le départ

2. Une différence technique réelle entre GCP et les autres fournisseurs est :
   - a) L'absence totale de régions
   - b) Un VPC global par défaut, contrairement aux VPC/VNet généralement régionaux d'AWS et Azure
   - c) L'impossibilité d'utiliser Kubernetes
   - d) L'absence de service de stockage d'objets

3. Le critère décisif pour choisir entre AWS, Azure et GCP devrait être :
   - a) Uniquement l'origine historique du fournisseur
   - b) La compétence déjà acquise par l'équipe et l'infrastructure déjà en place
   - c) La couleur du logo du fournisseur
   - d) Le nombre de services proposés, sans autre critère

**Corrigé** : 1-c, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. GKE est le seul service cloud capable d'exécuter Kubernetes de façon managée. — **Faux** (EKS sur AWS et AKS sur Azure existent également, section 48.3).
2. Un bucket Cloud Storage mal configuré présente le même risque d'exposition publique qu'un bucket S3 ou un compte de stockage Azure Blob. — **Vrai**.
3. L'origine historique de Kubernetes chez Google garantit que GKE est toujours objectivement meilleur qu'EKS ou AKS. — **Faux** (un argument réel mais non suffisant à lui seul, section 48.1).
4. Introduire un troisième fournisseur cloud n'a aucun coût réel pour une équipe. — **Faux** (un coût de compétence et de complexité opérationnelle, section 48.7).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la réduction de charge opérationnelle offerte par GKE (section 48.5) n'est pas, à elle seule, un argument suffisant pour migrer vers GCP.
2. Reprends le scénario d'ouverture. Rédige la réponse que tu donnerais à ton collègue, reconnaissant la légitimité de sa question tout en la recadrant avec le bon critère de décision.

**Corrigé 1** : cette réduction de charge opérationnelle est réelle, mais elle n'est pas propre à GCP — EKS sur AWS (déjà le fournisseur en place pour le portail, chapitre 46) offre exactement le même bénéfice de délégation du plan de contrôle Kubernetes. Migrer vers GCP pour ce seul bénéfice, alors qu'il est également disponible sans changer de fournisseur, ignorerait le coût réel d'introduire un nouveau fournisseur cloud (section 48.7) pour un gain qui pourrait être obtenu sans ce changement.

**Corrigé 2** : je lui dirais que sa question est légitime et que l'historique de Google avec Kubernetes est effectivement réel et intéressant, mais que le bénéfice concret qu'il recherche — réduire la charge de gestion du plan de contrôle — est également disponible via EKS, directement sur AWS où le portail est déjà hébergé. Plutôt que d'introduire un troisième fournisseur cloud avec le coût de compétence et de complexité que cela implique, je proposerais d'évaluer d'abord EKS, qui répond au même besoin sans disperser davantage l'infrastructure de l'entreprise entre plusieurs écosystèmes distincts.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 48.1</span>

Une entreprise choisit GCP uniquement parce qu'un développeur senior de l'équipe a une forte expérience personnelle sur GCP acquise dans un précédent emploi, sans autre analyse. Explique si ce critère est légitime, en le distinguant de l'erreur dénoncée dans ce chapitre.
</div>

**Corrigé :** Contrairement à un choix basé uniquement sur l'origine historique d'un projet (l'erreur dénoncée en section 48.7), la compétence réelle et déjà acquise par un membre de l'équipe constitue un critère de décision légitime et concret — il rejoint directement le principe déjà établi : la compétence déjà en place pèse dans la décision. La nuance importante est que ce critère doit être mis en balance avec les autres facteurs (infrastructure déjà existante sur un autre fournisseur, coût de dispersion pour le reste de l'équipe) plutôt que d'être automatiquement décisif à lui seul — un vrai critère de décision contextuelle, mais qui mérite quand même d'être posé explicitement et pesé, pas simplement suivi par défaut.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 48.2</span>

Rédige, en 3 à 5 phrases, pourquoi la répétition des mêmes principes de sécurité (IAM, stockage jamais public, modèle de responsabilité partagée) à travers les trois chapitres consacrés à AWS, Azure et GCP renforce, plutôt qu'elle ne dilue, la compréhension de ces principes.
</div>

**Corrigé (exemple de réponse) :** Voir ces principes se répéter systématiquement, sous des noms différents mais avec la même logique sous-jacente, confirme qu'il s'agit de véritables fondamentaux de sécurité cloud plutôt que de particularités propres à un seul fournisseur — une leçon plus solide que si elle n'avait été présentée qu'une seule fois pour un seul fournisseur. Cette répétition permet aussi de reconnaître immédiatement ces mêmes principes lors d'une future rencontre avec un quatrième fournisseur cloud non couvert dans ce manuel, puisque la structure générale (calcul, stockage, réseau segmenté, identité au moindre privilège) reste remarquablement constante à travers l'industrie du cloud.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais situer les équivalents GCP des services AWS et Azure déjà appris.</li>
<li>☐ Je comprends l'origine historique de Kubernetes chez Google et pourquoi elle ne suffit pas seule à justifier GKE.</li>
<li>☐ Je connais la différence réelle du VPC global de GCP par rapport aux VPC/VNet régionaux d'AWS et Azure.</li>
<li>☐ Je comprends ce que GKE délègue par rapport à la gestion manuelle du plan de contrôle des chapitres 42-44.</li>
<li>☐ Je sais appliquer le critère de décision contextuelle (compétence de l'équipe, infrastructure déjà en place) plutôt qu'une réputation de marque.</li>
</ul>

## FAQ

<dl class="faq">
<dt>GKE est-il vraiment plus performant qu'EKS ou AKS pour Kubernetes ?</dt>
<dd>Les différences de performance pure entre ces trois services managés restent généralement marginales pour la plupart des cas d'usage — le choix repose davantage sur l'intégration avec l'infrastructure déjà en place et la compétence de l'équipe, rappel direct du principe de décision contextuelle de ce chapitre.</dd>

<dt>Peut-on migrer facilement un cluster Kubernetes d'un fournisseur cloud à un autre ?</dt>
<dd>Les manifestes Kubernetes eux-mêmes (chapitre 43) restent largement portables entre fournisseurs, Kubernetes étant un standard ouvert — mais les services spécifiques à chaque fournisseur (comme les Load Balancers natifs ou les intégrations IAM) nécessitent généralement des ajustements lors d'une migration, un coût réel à anticiper.</dd>

<dt>GCP propose-t-il un équivalent à Microsoft Entra ID pour l'intégration avec Active Directory ?</dt>
<dd>GCP propose des mécanismes de fédération d'identité avec Active Directory, mais sans l'intégration aussi native que celle d'Azure avec Entra ID (chapitre 47) — un facteur supplémentaire à considérer si l'identité interne de l'entreprise doit jouer un rôle central dans le choix du fournisseur.</dd>

<dt>Faut-il connaître les trois fournisseurs (AWS, Azure, GCP) pour travailler en tant qu'administrateur système en 2026 ?</dt>
<dd>Une connaissance approfondie d'un seul fournisseur reste largement suffisante pour la plupart des postes — comprendre les concepts fondamentaux communs aux trois (comme développé dans ces trois chapitres) permet de transposer rapidement cette compétence à un second fournisseur si le besoin se présente, plutôt que de chercher une maîtrise simultanée et superficielle des trois dès le départ.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Google Cloud Platform : [https://cloud.google.com/docs](https://cloud.google.com/docs)
- Google Cloud — Documentation GKE : [https://cloud.google.com/kubernetes-engine/docs](https://cloud.google.com/kubernetes-engine/docs)
- Google Cloud Architecture Framework : [https://cloud.google.com/architecture/framework](https://cloud.google.com/architecture/framework)

*Chapitre suivant : stratégies hybrides et multi-cloud — comment combiner consciemment plusieurs fournisseurs (ou le cloud avec l'infrastructure on-premise déjà construite dans ce manuel), plutôt que de choisir un seul fournisseur par défaut.*
