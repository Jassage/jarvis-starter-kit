<div class="chapitre-titre-num">CHAPITRE 57</div>

# Pipelines DevSecOps

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Intégrer des vérifications de sécurité automatisées directement dans le pipeline Jenkins construit au chapitre précédent, plutôt que de les traiter comme une étape séparée réalisée après coup. À la fin de ce chapitre, tu sauras ajouter des étapes d'analyse de code, de dépendances et de configuration à un pipeline, faire échouer volontairement un pipeline en présence d'un problème critique, et doser les seuils d'alerte pour éviter qu'une équipe ne finisse par contourner des vérifications devenues trop bruyantes.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le pipeline Jenkins du chapitre 56 fonctionne bien : les changements d'infrastructure s'appliquent désormais de façon cohérente et tracée. Lors d'une revue trimestrielle, la RSSI pose une question inconfortable : <em>"Ce pipeline applique des changements plus vite qu'avant. Qu'est-ce qui l'empêche d'appliquer, tout aussi vite, une configuration réseau qui expose un port sensible à Internet, ou une image Docker contenant une bibliothèque vulnérable connue ?"</em> Personne n'a de réponse solide. Le pipeline vérifie que le plan est cohérent et approuvé — il ne vérifie rien sur la sécurité du contenu de ce plan. Ce chapitre corrige ce manque.
</div>

## 57.1 Automatiser sans vérifier : plus rapide, pas plus sûr

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un rappel essentiel</span>
Le pipeline du chapitre 56 valide que le changement est cohérent (même version d'outils) et revu par un humain avant application — il ne vérifie en rien que ce changement est lui-même sûr. Un pipeline mal conçu peut ainsi appliquer une erreur de sécurité avec la même rapidité et la même confiance qu'un changement légitime, exactement le même risque que celui déjà observé pour l'application directe d'un manifeste Kubernetes sans revue au chapitre 43 — l'automatisation amplifie la vitesse d'exécution, dans un sens comme dans l'autre.
</div>

## 57.2 DevSecOps : la sécurité intégrée au pipeline, pas ajoutée après coup

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie — le contrôle qualité sur la chaîne, pas à la sortie d'usine</span>
**DevSecOps** consiste à intégrer des vérifications de sécurité directement dans le pipeline d'intégration continue, à chaque changement, plutôt que de les réaliser ponctuellement en fin de projet ou après un incident. C'est l'équivalent d'un contrôle qualité effectué à chaque étape d'une chaîne de production, plutôt qu'un contrôle unique effectué sur le produit fini — un défaut est détecté et corrigé immédiatement après son introduction, pas des semaines plus tard quand son origine est devenue difficile à retracer.
</div>

## 57.3 Analyse statique du code d'infrastructure

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — analyser le code Terraform et Ansible avant même de l'exécuter</span>
Des outils d'analyse statique (SAST — *Static Application Security Testing*, appliqué ici au code d'infrastructure plutôt qu'applicatif) examinent le code Terraform et les playbooks Ansible sans les exécuter, à la recherche de pratiques dangereuses connues — un mot de passe en clair, un bucket de stockage rendu public par erreur, une règle de pare-feu trop permissive.
</div>

```groovy
stage('Analyse de securite du code') {
    steps {
        sh 'tfsec .'
    }
}
```

## 57.4 Scanner les dépendances et les images

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct du chapitre 39</span>
Une image Docker construite à partir d'une base obsolète (chapitre 39) peut contenir des bibliothèques avec des vulnérabilités connues et déjà publiées. Un scan d'image (*SCA — Software Composition Analysis*) compare le contenu de l'image aux bases de données publiques de vulnérabilités avant que cette image ne soit déployée, plutôt que de découvrir le problème après coup lors d'un audit de sécurité ou, pire, lors d'une intrusion.
</div>

```groovy
stage('Scan de l\'image Docker') {
    steps {
        sh 'trivy image portail-client:${BUILD_NUMBER}'
    }
}
```

## 57.5 Scanner la configuration cloud et Terraform

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct des chapitres 46-50 et 54-55</span>
Les mêmes outils d'analyse peuvent vérifier un plan Terraform avant application, à la recherche de configurations cloud risquées déjà rencontrées dans ce manuel — un groupe de sécurité AWS ouvert sur Internet (chapitre 46), un compte de stockage sans chiffrement, une base de données accessible publiquement. Cette vérification s'insère naturellement entre l'étape `terraform plan` et l'étape d'approbation déjà établies au chapitre 56.
</div>

## 57.6 Faire échouer le pipeline en présence d'un problème critique

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Un scan qui n'interrompt jamais le pipeline ne sert à rien</span>
Un scan de sécurité qui se contente d'afficher un avertissement, sans jamais bloquer le pipeline, finit rapidement ignoré par l'équipe — exactement le même risque que celui déjà observé pour une alerte non exploitée. Configure le pipeline pour qu'il échoue explicitement (`exit 1`) lorsqu'une vulnérabilité critique est détectée, empêchant structurellement l'étape d'approbation et l'application du changement tant que le problème n'est pas corrigé ou explicitement accepté par une personne autorisée.
</div>

## 57.7 Doser les seuils : éviter la fatigue d'alerte dès la conception

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un pipeline qui bloque sur tout finit contourné</span>
Un scan configuré pour bloquer le pipeline sur la moindre vulnérabilité, même mineure ou sans exploitation connue, produit rapidement une telle quantité de blocages que l'équipe cherche des moyens de contourner le pipeline plutôt que de corriger chaque problème signalé — un risque qui sera détaillé plus largement au chapitre consacré à la supervision (Partie 10), mais qui s'applique déjà pleinement ici : ne fais échouer le pipeline que sur les niveaux de sévérité réellement critiques, et journalise le reste pour une revue périodique plutôt qu'un blocage systématique.
</div>

## Atelier — Sécuriser le pipeline du chapitre 56

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 57 — Un pipeline DevSecOps complet</span>

**Objectif** : enrichir le Jenkinsfile du chapitre 56 avec des étapes de sécurité automatisées.

**Préparation** : le Jenkinsfile de l'atelier du chapitre 56 comme point de départ.

**Étapes détaillées** :

1. Ajoute une étape d'analyse statique du code Terraform (section 57.3) immédiatement après le checkout et avant `terraform plan`.
2. Ajoute une étape de scan de configuration (section 57.5) entre `terraform plan` et l'étape d'approbation.
3. Configure ces deux étapes pour faire échouer le pipeline uniquement sur une sévérité "critique" (section 57.7), pas sur toute vulnérabilité mineure.
4. Explique où se positionnent ces nouvelles étapes par rapport à l'étape d'approbation humaine déjà en place, et pourquoi cet ordre est important.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : les étapes de sécurité doivent s'exécuter **avant** l'étape d'approbation humaine, jamais après — l'objectif est de présenter à la personne qui approuve un plan déjà vérifié, pas de découvrir un problème de sécurité après que le changement a déjà été validé et appliqué. En limitant l'échec automatique aux seules vulnérabilités critiques (section 57.7), le pipeline reste utilisable au quotidien tout en bloquant structurellement les problèmes les plus graves, un compromis directement inspiré du principe de dosage des seuils déjà appliqué à la criticité des incidents au chapitre 2.

**Dépannage** : si l'équipe commence à demander de désactiver temporairement les scans de sécurité pour "aller plus vite", c'est généralement le signe que les seuils sont mal calibrés (trop de faux positifs bloquants) plutôt qu'un problème avec le principe même du scan — revoir les seuils de sévérité avant d'envisager toute désactivation.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — aucun scan de sécurité automatisé dans le pipeline</span>
Rappel de la section 57.1 : un pipeline sans aucune vérification de sécurité applique une erreur de sécurité avec la même rapidité et la même confiance qu'un changement légitime.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — des scans configurés pour ne jamais bloquer le pipeline</span>
Rappel de la section 57.6 : un scan qui se contente d'afficher un avertissement sans jamais interrompre le pipeline finit rapidement ignoré par l'équipe.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des seuils si stricts que le pipeline bloque en permanence</span>
Rappel de la section 57.7 : un excès de blocages sur des problèmes mineurs pousse l'équipe à chercher des contournements, un résultat opposé à l'objectif recherché.
</div>

## Diagnostiquer un pipeline devenu bruyant

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : l'équipe commence à contourner ou désactiver systématiquement les étapes de sécurité du pipeline</span>

- **Diagnostic** : examiner l'historique récent des échecs de pipeline liés aux scans de sécurité — un taux élevé d'échecs sur des vulnérabilités mineures ou déjà connues et acceptées est le signe le plus fréquent d'un seuil mal calibré.
- **Comment vérifier** : comparer le nombre de blocages liés à des vulnérabilités réellement critiques au nombre total de blocages sur une période donnée.
- **Résolution** : ajuster le seuil de sévérité qui déclenche un échec du pipeline (section 57.7), et mettre en place une liste d'exceptions documentées et revues périodiquement pour les vulnérabilités mineures déjà connues et jugées acceptables, plutôt que de laisser l'équipe désactiver silencieusement l'ensemble du dispositif.
</div>

## En entreprise

- **Bonne pratique répandue** : positionner les étapes de sécurité le plus tôt possible dans le pipeline ("shift left"), avant l'étape d'approbation humaine, pour que la personne qui approuve dispose d'une vision déjà vérifiée du changement.
- **Bonne pratique répandue** : revoir périodiquement, avec l'équipe sécurité, les seuils de sévérité configurés dans le pipeline, plutôt que de les fixer une seule fois et de ne jamais les ajuster.
- **Erreur classique observée** : une équipe sécurité qui impose des scans bloquants sans jamais consulter l'équipe infrastructure sur les seuils réalistes, provoquant un contournement généralisé du dispositif quelques semaines après sa mise en place — un échec organisationnel plus que technique.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Qu'est-ce que le DevSecOps, et en quoi se distingue-t-il d'une simple revue de sécurité en fin de projet ?"**
Réponse attendue : le DevSecOps intègre les vérifications de sécurité directement dans le pipeline d'intégration continue, à chaque changement, plutôt que ponctuellement en fin de projet — un défaut est détecté et corrigé immédiatement après son introduction, pas des semaines plus tard.

**Q2. "Pourquoi est-il important qu'un pipeline puisse échouer automatiquement en présence d'une vulnérabilité critique ?"**
Réponse attendue : sans ce blocage automatique, un scan se limite à informer sans empêcher réellement l'application d'un changement dangereux — le blocage transforme une simple alerte en contrôle effectif, empêchant structurellement l'application du changement tant que le problème n'est pas corrigé.

**Q3. "Pourquoi faut-il doser soigneusement les seuils de sévérité qui déclenchent un blocage, plutôt que de bloquer sur toute vulnérabilité détectée ?"**
Réponse attendue : un excès de blocages sur des problèmes mineurs épuise la patience de l'équipe et la pousse à chercher des contournements, un résultat opposé à l'objectif recherché — un dosage raisonnable, limité aux problèmes réellement critiques, maintient l'efficacité du dispositif dans la durée.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Positionne toujours les étapes de scan de sécurité avant l'étape d'approbation humaine du pipeline, jamais après — la personne qui approuve un changement doit disposer d'une vision déjà vérifiée, pas découvrir un problème après application.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente et journalise les vulnérabilités mineures acceptées comme exceptions, avec une date de revue — une exception sans date de revue devient rapidement une exception permanente et oubliée.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Les scans les plus rapides (analyse statique du code) peuvent s'exécuter tôt et systématiquement ; les scans plus lents (analyse approfondie d'image) peuvent être réservés aux changements touchant réellement les images concernées, pour éviter d'allonger inutilement chaque exécution du pipeline.
</div>

## Résumé du chapitre

- Un pipeline automatisé applique les changements plus vite qu'une exécution manuelle, dans un sens comme dans l'autre — l'automatisation seule ne garantit aucune sécurité.
- Le DevSecOps intègre les vérifications de sécurité directement dans le pipeline, à chaque changement, plutôt qu'en fin de projet.
- Une analyse statique du code Terraform et Ansible détecte des pratiques dangereuses avant même l'exécution.
- Un scan des images Docker et des dépendances détecte des vulnérabilités déjà connues avant leur déploiement.
- Un scan de configuration cloud détecte des erreurs comme un groupe de sécurité trop permissif avant l'application du plan.
- Un pipeline doit pouvoir échouer explicitement sur un problème critique, sinon les scans deviennent de simples avertissements ignorés.
- Les seuils de sévérité doivent rester raisonnables, sous peine de pousser l'équipe à contourner le dispositif.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le DevSecOps consiste principalement à :
   - a) Remplacer l'équipe sécurité par de l'automatisation
   - b) Intégrer les vérifications de sécurité directement dans le pipeline, à chaque changement
   - c) Effectuer un audit de sécurité annuel unique
   - d) Bloquer systématiquement toute vulnérabilité, quelle que soit sa sévérité

2. Où doivent se positionner les étapes de scan de sécurité par rapport à l'étape d'approbation humaine du pipeline ?
   - a) Après l'approbation, pour ne pas ralentir la revue
   - b) Avant l'approbation, pour présenter un plan déjà vérifié
   - c) Peu importe l'ordre
   - d) Uniquement en fin de pipeline, après l'application

3. Un pipeline qui bloque systématiquement sur la moindre vulnérabilité mineure risque de :
   - a) Améliorer immédiatement la sécurité sans effet secondaire
   - b) Pousser l'équipe à contourner le dispositif
   - c) Réduire le temps d'exécution du pipeline
   - d) Remplacer le besoin d'une étape d'approbation

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Un pipeline automatisé applique par nature des changements plus sûrs qu'une exécution manuelle. — **Faux** (l'automatisation accélère l'exécution, elle ne garantit rien sur la sécurité du contenu, section 57.1).
2. Un scan qui se contente d'afficher un avertissement sans bloquer le pipeline finit généralement ignoré. — **Vrai**.
3. Les seuils de sévérité déclenchant un blocage du pipeline devraient rester fixes indéfiniment, sans jamais être révisés. — **Faux** (une revue périodique reste nécessaire, section 57.7).
4. Une analyse statique du code Terraform peut détecter un problème avant même l'exécution du code. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi la question posée par la RSSI dans le scénario d'ouverture ("qu'est-ce qui empêche ce pipeline d'appliquer un changement dangereux ?") était légitime malgré la solidité du pipeline déjà construit au chapitre 56.
2. Un membre de l'équipe propose de configurer le pipeline pour bloquer sur toute vulnérabilité détectée, sans distinction de sévérité, "pour être certain de ne rien laisser passer". Explique pourquoi cette approche, bien qu'intentionnée positivement, risque de produire l'effet inverse.

**Corrigé 1** : le pipeline du chapitre 56 résolvait un problème de cohérence et de traçabilité de l'exécution — il garantissait que le changement appliqué correspondait exactement au code committé, exécuté dans un environnement reproductible, avec une approbation humaine enregistrée. Rien dans ce dispositif n'évaluait la sécurité du contenu même du changement : un plan Terraform ouvrant un port sensible sur Internet aurait été appliqué avec la même rigueur procédurale qu'un changement inoffensif, simplement parce que la procédure elle-même avait été respectée. La question de la RSSI pointait précisément cette limite : la cohérence d'exécution et la sécurité du contenu sont deux problèmes distincts, et résoudre le premier ne résout pas automatiquement le second.

**Corrigé 2** : un blocage systématique sur toute vulnérabilité, y compris les plus mineures ou sans exploitation connue, produit un très grand nombre d'échecs de pipeline pour des problèmes de faible impact réel. Face à cette accumulation de blocages perçus comme excessifs, l'équipe cherche typiquement des moyens de contourner le dispositif — désactiver temporairement les scans, ignorer systématiquement les échecs, ou dans le pire des cas, retourner à une exécution manuelle en dehors du pipeline pour éviter les blocages. Le résultat final est une sécurité effective plus faible qu'avec un seuil raisonnable limité aux vulnérabilités réellement critiques, exactement le même mécanisme de fatigue d'alerte qui sera approfondi au chapitre consacré à la supervision.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 57.1</span>

Place, dans l'ordre correct, les étapes suivantes d'un pipeline DevSecOps complet combinant les chapitres 56 et 57 : `terraform apply`, `checkout`, `terraform plan`, scan de configuration, approbation humaine, analyse statique du code.
</div>

**Corrigé :** L'ordre correct est : `checkout` (récupérer le code), analyse statique du code (section 57.3, vérifier le code source avant toute exécution), `terraform plan` (générer le plan de changement, chapitre 56), scan de configuration (section 57.5, vérifier le contenu du plan généré), approbation humaine (chapitre 56, valider un plan déjà vérifié), `terraform apply` (appliquer le changement approuvé). Cet ordre garantit que chaque vérification de sécurité s'exécute sur l'artefact le plus pertinent disponible à ce stade, et que la personne qui approuve dispose toujours d'une vision déjà passée au crible des vérifications automatisées.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 57.2</span>

Rédige, en 3 à 5 phrases, une politique d'équipe définissant comment traiter une vulnérabilité mineure détectée par le pipeline mais jugée non critique, en t'appuyant sur les principes de la section 57.7.
</div>

**Corrigé (exemple de réponse) :** Toute vulnérabilité détectée par le pipeline et jugée non critique sera journalisée automatiquement sans bloquer l'exécution, plutôt que de provoquer un échec systématique. Chaque vulnérabilité ainsi journalisée sera consignée dans une liste d'exceptions documentée, accompagnée d'une justification et d'une date de revue fixée à un maximum de trois mois. Cette liste sera examinée collectivement lors d'une revue périodique impliquant l'équipe infrastructure et l'équipe sécurité, qui décidera de corriger, d'accepter durablement, ou de reclasser en critique chaque élément selon l'évolution du contexte. Cette politique évite à la fois l'accumulation silencieuse de dette de sécurité et le blocage systématique du pipeline sur des problèmes de faible impact réel.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi un pipeline automatisé n'est pas automatiquement plus sûr, seulement plus rapide.</li>
<li>☐ Je sais définir le principe DevSecOps par rapport à une revue de sécurité ponctuelle.</li>
<li>☐ Je sais ajouter une étape d'analyse statique du code d'infrastructure à un pipeline.</li>
<li>☐ Je sais ajouter un scan de vulnérabilités des images et un scan de configuration cloud.</li>
<li>☐ Je sais positionner correctement ces étapes par rapport à l'approbation humaine.</li>
<li>☐ Je comprends pourquoi les seuils de sévérité doivent rester raisonnables pour éviter le contournement du dispositif.</li>
</ul>

## FAQ

<dl class="faq">
<dt>DevSecOps remplace-t-il le besoin d'une équipe sécurité dédiée ?</dt>
<dd>Non, il change la façon dont cette équipe intervient — plutôt que de valider ponctuellement des changements déjà réalisés, elle définit les règles et les seuils intégrés au pipeline, et intervient en priorité sur les cas les plus critiques ou les exceptions documentées, un rôle différent mais tout aussi nécessaire.</dd>

<dt>Faut-il scanner absolument tout à chaque exécution du pipeline, même les changements mineurs ?</dt>
<dd>Pas nécessairement au même niveau de profondeur — les scans rapides (analyse statique du code) peuvent s'exécuter systématiquement, tandis que les scans plus longs peuvent être réservés aux changements touchant réellement les éléments concernés (section "Performance"), un compromis entre couverture et rapidité d'exécution.</dd>

<dt>Que faire si un scan bloque un pipeline en urgence, alors qu'un changement critique doit être appliqué immédiatement ?</dt>
<dd>Une procédure d'exception documentée et tracée, nécessitant une validation explicite d'une personne autorisée (souvent la RSSI ou un responsable désigné), reste préférable à une désactivation informelle du scan — l'urgence ne devrait jamais devenir un prétexte silencieux pour contourner durablement le dispositif.</dd>

<dt>Les mêmes outils de scan couvrent-ils à la fois le code Terraform, les images Docker et le code applicatif ?</dt>
<dd>Pas toujours avec un seul et même outil — des outils spécialisés existent souvent pour chaque type d'analyse (code d'infrastructure, images de conteneurs, dépendances applicatives), qu'il convient de combiner selon les besoins réels de l'organisation plutôt que de chercher un outil unique couvrant tous les cas.</dd>
</dl>

## Références et pour aller plus loin

- OWASP — DevSecOps Guideline : [https://owasp.org/www-project-devsecops-guideline/](https://owasp.org/www-project-devsecops-guideline/)
- NIST — Secure Software Development Framework (SSDF) : [https://csrc.nist.gov/Projects/ssdf](https://csrc.nist.gov/Projects/ssdf)
- CIS Benchmarks — configurations de référence sécurisées : [https://www.cisecurity.org/cis-benchmarks](https://www.cisecurity.org/cis-benchmarks)

*Chapitre suivant : ouverture de la Partie 10 de ce manuel, consacrée à la supervision, la journalisation et l'observabilité — comment savoir, en temps réel, ce qui se passe réellement sur une infrastructure devenue largement automatisée, plutôt que de l'apprendre après coup lors d'un incident.*
