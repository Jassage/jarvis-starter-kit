<div class="chapitre-titre-num">CHAPITRE 30</div>

# Stratégies de sauvegarde

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Construire enfin la stratégie de sauvegarde complète que ce manuel évoque depuis le chapitre 1 ("une sauvegarde jamais testée n'est pas une sauvegarde") sans jamais l'avoir détaillée. À la fin de ce chapitre, tu sauras appliquer la règle 3-2-1, définir un RTO et un RPO réalistes, comprendre pourquoi une sauvegarde immuable protège spécifiquement contre un rançongiciel, et surtout organiser un vrai test de restauration périodique.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un employé de la comptabilité, malgré la formation Zero Trust du chapitre 26 et les protections MFA du chapitre 25, ouvre une pièce jointe piégée dans un email d'apparence légitime — une erreur humaine qui peut arriver malgré toutes les précautions techniques. Un rançongiciel se propage depuis son poste et commence à chiffrer les fichiers du partage NAS comptabilité (chapitre 28) auquel il a accès. L'équipe de sécurité isole le réseau en quelques minutes, limitant les dégâts, mais plusieurs centaines de fichiers sont déjà chiffrés, inutilisables. Le DSI pose la question que redoute tout administrateur système : <em>"Est-ce qu'on a une sauvegarde qui n'a pas été touchée ?"</em> La réponse à cette question — et la certitude de cette réponse — dépend entièrement de la stratégie de sauvegarde construite bien avant cet incident. Ce chapitre explique comment la construire correctement.
</div>

## 30.1 La règle 3-2-1

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — la règle 3-2-1</span>
- <strong>3</strong> copies des données au total (l'original plus deux sauvegardes).
- <strong>2</strong> supports de stockage différents (par exemple, disque local ET stockage cloud, ou disque ET bande magnétique).
- <strong>1</strong> copie conservée hors site, physiquement séparée du site principal.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi chaque chiffre compte, appliqué au scénario d'ouverture</span>
Le rançongiciel du scénario d'ouverture a chiffré les fichiers **originaux** sur le NAS — la première des trois copies. S'il n'existait qu'une seule sauvegarde, stockée sur le même réseau et accessible en permanence, elle aurait très probablement été chiffrée également (un rançongiciel moderne cherche activement les partages réseau accessibles, chapitre 18 sur les permissions). La règle du "support différent" et surtout du "hors site" garantit qu'au moins une copie reste **physiquement inaccessible** au rançongiciel au moment de l'infection, quelle que soit l'étendue de sa propagation sur le réseau principal.
</div>

## 30.2 Types de sauvegarde : compromis entre temps, espace et complexité de restauration

| Type | Fonctionnement | Avantage | Inconvénient |
|---|---|---|---|
| **Complète** | Copie intégrale de toutes les données à chaque exécution | Restauration simple, un seul jeu de données | Lente, consomme beaucoup d'espace |
| **Incrémentielle** | Copie uniquement ce qui a changé depuis la dernière sauvegarde (complète OU incrémentielle) | Rapide, économe en espace | Restauration plus complexe : nécessite la dernière complète + toute la chaîne d'incrémentielles |
| **Différentielle** | Copie tout ce qui a changé depuis la dernière sauvegarde **complète** | Restauration plus simple que l'incrémentielle (complète + une seule différentielle) | Grossit progressivement jusqu'à la prochaine complète |

<div class="encadre attention">
<span class="encadre-titre">⚠️ Le piège de la chaîne d'incrémentielles trop longue</span>
Une stratégie purement incrémentielle sans complète récente régulière crée une chaîne de dépendance fragile : restaurer nécessite la dernière sauvegarde complète **et l'intégralité** de la chaîne d'incrémentielles qui suit, dans l'ordre exact. Si un seul maillon de cette chaîne est corrompu ou manquant, toute restauration au-delà de ce point devient impossible — un risque à limiter en programmant des sauvegardes complètes régulières (par exemple hebdomadaires), même dans une stratégie majoritairement incrémentielle.
</div>

## 30.3 RTO et RPO : les deux métriques qui définissent une vraie stratégie

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — deux questions différentes, deux métriques différentes</span>
Le <strong>RPO</strong> (*Recovery Point Objective*) répond à la question : "combien de données peut-on se permettre de perdre ?", exprimé en temps (par exemple, un RPO de 4 heures signifie qu'au pire, les 4 dernières heures de travail seraient perdues). Le <strong>RTO</strong> (*Recovery Time Objective*) répond à une question différente : "combien de temps peut-on se permettre d'être indisponible avant que le service ne soit restauré ?" Ces deux métriques déterminent directement la fréquence des sauvegardes (pour le RPO) et les moyens techniques de restauration à prévoir (pour le RTO) — elles seront approfondies concrètement dans le plan de reprise d'activité du chapitre 31.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Un RPO et un RTO différents selon la criticité du système</span>
Tous les systèmes de l'entreprise n'ont pas la même criticité, et n'ont donc pas besoin du même RPO/RTO : le NAS comptabilité du scénario d'ouverture pourrait tolérer un RPO de 24 heures (perdre au pire une journée de saisie), tandis qu'un système transactionnel critique nécessiterait un RPO de quelques minutes seulement — une distinction qui rejoint directement la priorisation par impact/urgence déjà vue au chapitre 2, appliquée ici à la fréquence de sauvegarde plutôt qu'à la gestion d'incident.
</div>

## 30.4 Sauvegardes immuables et air-gapped : la protection spécifique contre le rançongiciel

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — pourquoi une sauvegarde "toujours connectée" n'est pas suffisante face à un rançongiciel</span>
Un rançongiciel moderne ne se contente pas de chiffrer les fichiers accessibles — il recherche activement les partages réseau, y compris les destinations de sauvegarde connectées en permanence, pour les chiffrer également et priver la victime de tout recours. Une sauvegarde <strong>immuable</strong> (dont le contenu ne peut être ni modifié ni supprimé pendant une période définie, même par un compte administrateur compromis) ou <strong>air-gapped</strong> (physiquement déconnectée du réseau la plupart du temps, comme une bande magnétique retirée après sauvegarde, ou un stockage cloud avec verrouillage d'objet) élimine ce risque spécifique — exactement ce qui a permis, dans le scénario d'ouverture, de répondre "oui" à la question du DSI.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — au moins une copie que même un administrateur compromis ne peut pas détruire</span>
Le principe le plus important de cette section : si un attaquant obtient un accès administrateur complet à l'infrastructure (via un rançongiciel sophistiqué ou une compromission de compte), une sauvegarde immuable ou air-gapped doit rester hors de sa portée même dans ce scénario extrême — une protection qui va au-delà de la simple séparation réseau, exigeant une véritable barrière technique (verrouillage d'immuabilité) ou physique (déconnexion réelle).
</div>

## 30.5 Choisir des outils selon le contexte

<div class="encadre astuce">
<span class="encadre-titre">💡 Pas d'outil universel, encore une fois</span>
Exactement le même principe de décision contextuelle déjà appliqué au choix de distribution (chapitre 14) et au choix RAID matériel/logiciel (chapitre 27) : Windows Server dispose d'outils natifs (`wbadmin`, Sauvegarde Windows Server) ; Linux dispose d'outils robustes comme `rsync` (pour des copies simples), Borg ou Restic (pour des sauvegardes chiffrées et dédupliquées) ; des solutions commerciales comme Veeam couvrent des environnements virtualisés hétérogènes à grande échelle (pertinent pour la Partie 6 de ce manuel). Le choix dépend de la taille de l'infrastructure, du budget, et de la complexité de l'environnement à protéger.
</div>

```
# Exemple simple avec Restic (Linux), incluant le chiffrement natif --
# une sauvegarde non chiffree vers un support externe ou cloud
# exposerait les donnees en cas de vol du support lui-meme
restic -r /mnt/sauvegarde-externe backup /donnees/comptabilite

# Restic gere nativement les sauvegardes incrementielles (section 30.2)
# de facon transparente, sans configuration complexe supplementaire
restic -r /mnt/sauvegarde-externe snapshots
```

## 30.6 Tester réellement une restauration : le cœur de tout ce chapitre

<div class="encadre mauvaise-pratique">
<span class="encadre-titre">❌ Mauvaise pratique — supposer qu'une sauvegarde fonctionne parce qu'elle "se termine sans erreur"</span>
Rappel exact du chapitre 1 (section 1.4), maintenant pleinement développé : une tâche de sauvegarde qui se termine "avec succès" chaque nuit ne garantit absolument pas qu'un fichier de cette sauvegarde peut réellement être restauré — corruption silencieuse, erreur de configuration, support défaillant, tous ces problèmes peuvent exister sans jamais provoquer d'erreur visible au moment de la sauvegarde elle-même.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — un calendrier de tests de restauration, pas une intention vague</span>
Un test de restauration doit être **planifié** (par exemple, mensuellement pour les systèmes critiques, trimestriellement pour les moins critiques) et **documenté** (chapitre 3) — pas laissé à une intention vague "on devrait le faire un jour". Le test doit inclure une restauration réelle dans un environnement isolé, suivie d'une vérification concrète (le fichier restauré s'ouvre-t-il correctement ? les données sont-elles complètes et cohérentes ?), exactement le type de vérification qui aurait permis à l'entreprise du scénario d'ouverture de répondre au DSI avec une certitude réelle, pas un espoir.
</div>

## 30.7 Retour sur le scénario d'ouverture

<div class="encadre securite">
<span class="encadre-titre">🔒 Ce qui a permis de répondre "oui" au DSI</span>
Une copie hors ligne (air-gapped, section 30.4) des données comptables, synchronisée chaque nuit puis physiquement déconnectée, n'a jamais été exposée au rançongiciel actif uniquement sur le réseau de production au moment de l'infection — exactement le principe de la règle 3-2-1 (une copie hors site, sur un support différent) combiné à l'immuabilité de la section 30.4. Les fichiers chiffrés ont pu être restaurés depuis cette copie, avec une perte de données limitée à la fenêtre entre la dernière synchronisation et l'incident — la définition concrète du RPO de la section 30.3, ici mesurée en heures plutôt qu'en semaines ou en perte totale.
</div>

## Atelier — Construire la stratégie de sauvegarde de l'entreprise

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 30 — Appliquer la règle 3-2-1 avec RTO/RPO définis</span>

**Objectif** : concevoir une stratégie de sauvegarde complète pour deux systèmes de criticité différente de l'entreprise.

**Préparation** : aucune installation nécessaire pour cet atelier conceptuel.

**Étapes détaillées** :

1. Pour le NAS comptabilité (chapitre 28) et pour le serveur de base de données financière critique (chapitre 27), propose un RPO et un RTO distincts, justifiés par leur criticité respective.
2. Applique la règle 3-2-1 à chacun, en précisant les deux supports différents et la destination hors site.
3. Propose une fréquence de test de restauration pour chacun.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : le serveur de base de données financière critique justifie un RPO court (quelques heures, voire moins) et un RTO court (restauration rapide exigée pour limiter l'impact métier), avec des tests de restauration mensuels compte tenu de sa criticité. Le NAS comptabilité peut tolérer un RPO plus large (24 heures) et un RTO plus souple, avec des tests trimestriels suffisants. Les deux appliquent la règle 3-2-1 : original + sauvegarde locale rapide (pour un RTO court) + copie hors site immuable ou air-gapped (protection spécifique contre le rançongiciel, section 30.4).

**Dépannage** : si tu hésites sur la fréquence de test appropriée, pose-toi la question : "si cette sauvegarde échouait silencieusement, combien de temps s'écoulerait avant qu'on ne le découvre avec la fréquence de test actuelle ?" — un délai de découverte trop long pour un système critique justifie des tests plus fréquents.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — une sauvegarde jamais testée</span>
Rappel une dernière fois du principe fondateur du chapitre 1, maintenant pleinement développé en section 30.6 — l'erreur la plus coûteuse et la plus fréquente de ce domaine entier.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — toutes les copies de sauvegarde connectées en permanence au même réseau</span>
Rappel de la section 30.4 : sans copie immuable ou air-gapped, un rançongiciel suffisamment étendu peut chiffrer l'original ET toutes les sauvegardes accessibles simultanément, éliminant tout recours.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — une chaîne d'incrémentielles trop longue sans complète récente</span>
Rappel de la section 30.2 : un seul maillon corrompu dans une longue chaîne d'incrémentielles peut rendre impossible toute restauration au-delà de ce point.
</div>

## Diagnostiquer une stratégie de sauvegarde insuffisante

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Comment savoir si notre stratégie de sauvegarde actuelle est réellement suffisante ?"</span>

- **Diagnostic** : vérifier successivement les quatre piliers de ce chapitre — la règle 3-2-1 est-elle réellement respectée (pas seulement sur le papier) ? Le RPO et le RTO ont-ils été explicitement définis pour chaque système critique, ou laissés implicites ? Existe-t-il au moins une copie immuable ou air-gapped ? Un test de restauration réel a-t-il été réalisé récemment, avec succès documenté ?
- **Comment vérifier** : un audit simple consiste à répondre honnêtement à ces quatre questions pour chaque système critique de l'organisation — l'absence de réponse claire à l'une d'elles constitue déjà un signal d'alerte.
- **Résolution** : prioriser la correction dans l'ordre suivant : d'abord garantir qu'une copie immuable/air-gapped existe (la protection la plus critique contre un rançongiciel), puis tester une restauration réelle dès que possible, puis formaliser RPO/RTO explicites pour orienter les ajustements futurs de fréquence et d'outillage.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter (chapitre 3) la stratégie de sauvegarde complète de chaque système — fréquence, type, destination, RPO/RTO, dernier test de restauration réussi avec sa date — un document vivant consulté et mis à jour régulièrement, pas rédigé une fois puis oublié.
- **Bonne pratique répandue** : inclure la vérification de l'exécution réelle des sauvegardes (pas seulement leur planification) dans le script ou l'outil de supervision quotidien, exactement dans le même esprit que les vérifications déjà ajoutées aux chapitres 23 et 24.
- **Erreur classique observée** : une entreprise victime d'un rançongiciel découvrant, au moment critique, que ses sauvegardes étaient soit corrompues, soit elles-mêmes chiffrées par l'attaque faute d'isolation suffisante — exactement le scénario que ce chapitre vise à éviter.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Explique la règle 3-2-1 et pourquoi chacun de ses trois chiffres compte."**
Réponse attendue : 3 copies des données, sur 2 supports différents, avec 1 copie hors site — chaque élément protège contre un scénario de défaillance distinct (panne d'un support précis, incident localisé au site principal), la combinaison des trois offrant une protection bien plus robuste qu'une seule sauvegarde, même redondante en apparence.

**Q2. "Quelle est la différence entre RPO et RTO ?"**
Réponse attendue : le RPO définit combien de données on peut se permettre de perdre (mesuré en temps depuis la dernière sauvegarde valide) ; le RTO définit combien de temps on peut se permettre d'être indisponible avant restauration complète du service — deux questions différentes qui orientent des décisions techniques différentes (fréquence de sauvegarde pour le RPO, moyens de restauration rapide pour le RTO).

**Q3. "Pourquoi une sauvegarde 'toujours connectée' au réseau n'est-elle pas suffisante face à un rançongiciel moderne ?"**
Réponse attendue : un rançongiciel recherche activement les partages réseau accessibles, y compris les destinations de sauvegarde, et peut les chiffrer également si elles restent connectées en permanence — une sauvegarde immuable ou air-gapped élimine ce risque en restant hors de portée même d'un accès administrateur compromis.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Assure-toi qu'au moins une copie de sauvegarde de chaque système critique reste immuable ou air-gapped — la protection la plus directement efficace contre un rançongiciel, indépendamment de toutes les autres mesures de sécurité déjà couvertes dans ce manuel.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Planifie et documente (chapitre 3) un calendrier de tests de restauration récurrents, avec une trace de chaque test réussi (ou des correctifs apportés suite à un test révélant un problème) — jamais une intention vague sans échéance concrète.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Calibre le type de sauvegarde (complète/incrémentielle/différentielle) et sa fréquence selon le RPO réellement nécessaire pour chaque système, plutôt qu'une politique uniforme appliquée sans réflexion à toute l'infrastructure — un système peu critique n'a pas besoin de la même fréquence coûteuse qu'un système transactionnel critique.
</div>

## Résumé du chapitre

- La règle 3-2-1 (3 copies, 2 supports différents, 1 copie hors site) reste le fondement de toute stratégie de sauvegarde robuste.
- Les sauvegardes complètes, incrémentielles et différentielles offrent des compromis différents entre temps, espace et complexité de restauration.
- Le RPO (perte de données tolérable) et le RTO (temps d'indisponibilité tolérable) doivent être définis explicitement pour chaque système selon sa criticité réelle.
- Une sauvegarde immuable ou air-gapped protège spécifiquement contre un rançongiciel, qui peut sinon chiffrer aussi des sauvegardes connectées en permanence.
- Un test de restauration réel et planifié régulièrement est la seule façon de savoir, avec certitude, qu'une sauvegarde fonctionne réellement — jamais une simple supposition basée sur l'absence d'erreur au moment de la sauvegarde.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La règle 3-2-1 recommande :
   - a) 3 supports, 2 copies, 1 test par an
   - b) 3 copies, 2 supports différents, 1 copie hors site
   - c) 3 sites, 2 copies, 1 support
   - d) 1 copie suffit si elle est chiffrée

2. Le RPO (Recovery Point Objective) définit :
   - a) Le temps maximal d'indisponibilité acceptable
   - b) La quantité de données qu'on peut se permettre de perdre, mesurée en temps
   - c) Le nombre de copies de sauvegarde nécessaires
   - d) Le type de support de stockage à utiliser

3. Une sauvegarde immuable ou air-gapped protège spécifiquement contre :
   - a) Une panne électrique
   - b) Un rançongiciel qui chiffrerait aussi des sauvegardes connectées en permanence
   - c) Une erreur de syntaxe dans un script
   - d) Un problème de résolution DNS

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une sauvegarde qui se termine sans erreur est automatiquement restaurable avec certitude. — **Faux** (seul un test de restauration réel le confirme, section 30.6).
2. Tous les systèmes d'une organisation devraient avoir le même RPO et le même RTO. — **Faux** (à calibrer selon la criticité réelle de chaque système, section 30.3).
3. Une chaîne d'incrémentielles trop longue sans sauvegarde complète récente augmente le risque de restauration impossible. — **Vrai**.
4. Une sauvegarde connectée en permanence au même réseau que les données originales offre la même protection contre un rançongiciel qu'une sauvegarde air-gapped. — **Faux** (elle peut être chiffrée par le même rançongiciel, section 30.4).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le RPO et le RTO ne sont pas la même métrique, en donnant un exemple où l'un pourrait être court et l'autre plus long pour un même système.
2. Reprends le scénario d'ouverture. Explique pourquoi l'existence d'une copie air-gapped, à elle seule, ne suffit pas — quelles autres conditions devaient être remplies pour que la restauration réussisse réellement.

**Corrigé 1** : le RPO mesure la perte de données tolérable, le RTO mesure le temps d'indisponibilité tolérable — un système pourrait avoir un RPO court (sauvegardé très fréquemment, peu de perte de données acceptable) mais un RTO plus long si sa restauration complète, bien que rare, prend intrinsèquement du temps (un très gros volume de données à restaurer, par exemple), sans que cela pose de problème métier majeur si l'indisponibilité reste rare et brève par rapport à l'activité normale.

**Corrigé 2** : une copie air-gapped inutilisable (jamais testée, potentiellement corrompue silencieusement, rappel de la section 30.6) n'aurait offert aucune protection réelle malgré son isolation physique correcte. La restauration réussie du scénario d'ouverture supposait aussi que cette copie avait déjà été testée avec succès par le passé (donnant confiance dans sa fiabilité), que sa fréquence de synchronisation correspondait à un RPO acceptable pour ce système (limitant la perte de données réelle), et que l'équipe disposait d'une procédure documentée (chapitre 3) pour exécuter la restauration rapidement plutôt que de l'improviser en pleine crise.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 30.1</span>

Une entreprise sauvegarde quotidiennement ses données vers un second disque dur connecté en permanence au même serveur. Explique en quoi cette configuration ne respecte pas la règle 3-2-1, et identifie précisément quel(s) élément(s) manque(nt).
</div>

**Corrigé :** Cette configuration ne dispose que de 2 copies (l'original et cette seule sauvegarde), pas 3. Le support est différent (un second disque), ce qui respecte partiellement cette exigence, mais aucune copie n'est conservée hors site — un incident touchant physiquement le serveur (incendie, dégât des eaux, vol) ou un rançongiciel se propageant sur le réseau local pourrait affecter simultanément l'original et cette unique sauvegarde connectée en permanence au même système. Il manque à la fois une troisième copie et surtout une destination hors site, idéalement immuable ou air-gapded (section 30.4), pour respecter réellement la règle 3-2-1.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 30.2</span>

Rédige, en 3 à 5 phrases, un calendrier de test de restauration que tu proposerais pour le serveur de base de données financière critique de l'entreprise, en justifiant la fréquence choisie.
</div>

**Corrigé (exemple de réponse) :** Je proposerais un test de restauration mensuel dans un environnement isolé, incluant une vérification concrète de l'intégrité et de la cohérence des données restaurées (pas seulement la réussite technique de l'opération de restauration elle-même), suivi d'une documentation du résultat (chapitre 3). Cette fréquence mensuelle se justifie par la criticité de ce système financier, où un délai de découverte trop long d'une sauvegarde défaillante représenterait un risque disproportionné par rapport au coût raisonnable de ce test régulier. Un système moins critique, comme évoqué dans l'atelier de ce chapitre, pourrait se contenter d'une fréquence trimestrielle, proportionnée à son impact réel en cas de défaillance de sa propre stratégie de sauvegarde.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer et appliquer la règle 3-2-1.</li>
<li>☐ Je comprends les compromis entre sauvegarde complète, incrémentielle et différentielle.</li>
<li>☐ Je sais définir un RPO et un RTO adaptés à la criticité réelle d'un système.</li>
<li>☐ Je comprends pourquoi une sauvegarde immuable ou air-gapped protège spécifiquement contre un rançongiciel.</li>
<li>☐ Je sais qu'un test de restauration réel et planifié est indispensable, pas optionnel.</li>
<li>☐ Je sais diagnostiquer les lacunes d'une stratégie de sauvegarde existante.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Le cloud est-il automatiquement une bonne destination de sauvegarde hors site ?</dt>
<dd>Le cloud offre naturellement une séparation géographique, mais il faut vérifier que le compte cloud utilisé pour la sauvegarde n'est pas accessible avec les mêmes identifiants que l'infrastructure principale (sinon un attaquant ayant compromis ces identifiants pourrait aussi altérer les sauvegardes cloud) — un verrouillage d'immuabilité spécifique au fournisseur cloud (section 30.4) reste recommandé même dans le cloud, pas seulement une simple séparation géographique.</dd>

<dt>Combien de temps faut-il conserver les sauvegardes ?</dt>
<dd>Cela dépend des exigences légales et métier propres à chaque organisation (obligations de conservation comptable, par exemple) — une politique de rétention explicite, distincte du RPO et du RTO, doit être définie et documentée, plutôt que de conserver indéfiniment ou de supprimer arbitrairement sans réflexion sur ces exigences.</dd>

<dt>Une sauvegarde chiffrée peut-elle être restaurée si la clé de chiffrement est perdue ?</dt>
<dd>Non, jamais — une sauvegarde chiffrée sans plan de gestion sécurisée de la clé de déchiffrement (jamais stockée au même endroit que la sauvegarde elle-même, mais accessible en cas de besoin réel) devient aussi inutilisable qu'une sauvegarde corrompue, un risque tout aussi grave à anticiper dès la conception de la stratégie.</dd>

<dt>Faut-il sauvegarder aussi les configurations système, pas seulement les données ?</dt>
<dd>Oui, une restauration complète après un incident majeur (approfondie au chapitre 31) nécessite souvent de reconstruire aussi la configuration des serveurs eux-mêmes, pas seulement leurs données — un besoin qui rejoint directement l'intérêt de l'Infrastructure as Code (chapitre 3, section sur les outils, et développé en Partie 9), où la configuration elle-même devient reproductible depuis du code versionné.</dd>
</dl>

## Références et pour aller plus loin

- CISA — recommandations sur la protection contre les rançongiciels et les sauvegardes : [https://www.cisa.gov/stopransomware](https://www.cisa.gov/stopransomware)
- Documentation officielle Restic (outil de sauvegarde open source) : [https://restic.readthedocs.io/](https://restic.readthedocs.io/)
- Microsoft Learn — Sauvegarde Windows Server (wbadmin) : [https://learn.microsoft.com/fr-fr/windows-server/administration/windows-commands/wbadmin](https://learn.microsoft.com/fr-fr/windows-server/administration/windows-commands/wbadmin)

*Chapitre suivant : le Plan de Reprise d'Activité (PRA) — comment transformer une stratégie de sauvegarde technique en un plan d'action complet et documenté pour reconstruire l'infrastructure entière après un sinistre majeur.*
