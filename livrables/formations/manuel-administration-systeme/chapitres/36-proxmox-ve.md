<div class="chapitre-titre-num">CHAPITRE 36</div>

# Proxmox VE

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Découvrir Proxmox VE, l'hyperviseur open source et gratuit qui complète le panorama VMware (chapitre 34) et Hyper-V (chapitre 35), avec un modèle économique radicalement différent. À la fin de ce chapitre, tu sauras distinguer les VM complètes (KVM) des conteneurs légers (LXC) que Proxmox propose tous deux nativement, comprendre l'intérêt du système de fichiers ZFS pour l'intégrité des données, et justifier objectivement le choix de Proxmox pour un contexte précis plutôt que par simple préférence pour la gratuité.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le bureau du Cap-Haïtien, plus petit que celui de Port-au-Prince (rappel du chapitre 5), a besoin de sa propre capacité de virtualisation locale — rappel direct du chapitre 6 sur l'autonomie de chaque site en cas de coupure réseau, un principe qui s'applique tout autant à la disponibilité des services virtualisés qu'à l'authentification. Mais étendre les licences VMware (chapitre 34) ou Windows Server Datacenter (chapitre 35) à ce second site représenterait un coût difficile à justifier pour un bureau de cette taille. Le DSI demande une option "sans coût de licence, mais toujours sérieuse et professionnelle" — exactement le positionnement de Proxmox VE, l'objet de ce chapitre.
</div>

## 36.1 Proxmox VE : Debian, KVM et LXC réunis

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**Proxmox VE** (*Virtual Environment*) est construit par-dessus **Debian** (rappel direct du chapitre 14 sur les familles de distributions Linux), avec deux technologies de virtualisation intégrées nativement : **KVM** (*Kernel-based Virtual Machine*, des machines virtuelles complètes, comme sur VMware ou Hyper-V) et **LXC** (*Linux Containers*, des conteneurs légers, une anticipation directe de la Partie 7 de ce manuel sur la conteneurisation). Cette double capacité, native et intégrée dans une seule interface de gestion, distingue Proxmox des deux hyperviseurs précédents.
</div>

## 36.2 Le modèle économique : gratuit, avec support optionnel

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Un contraste direct avec les chapitres 34 et 35</span>
Proxmox VE est entièrement **open source et gratuit** à utiliser, sans limitation de fonctionnalités — contrairement à VMware (licences pour les fonctionnalités avancées, chapitre 34) et à Hyper-V (avantageux uniquement si des licences Windows Server Datacenter sont déjà possédées, chapitre 35). Une souscription payante optionnelle donne accès à un dépôt de paquets plus stable et à un support commercial officiel — un modèle économique qui rejoint directement celui de Rocky Linux face à RHEL, déjà comparé au chapitre 14.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Répondre précisément à la demande du DSI</span>
Le DSI du scénario d'ouverture a raison de vouloir éviter une extension de licence coûteuse pour le bureau du Cap-Haïtien, mais "gratuit" ne doit jamais vouloir dire "sans rigueur professionnelle" — une souscription de support Proxmox, même pour un site secondaire, reste une dépense raisonnable à envisager sérieusement si la criticité du site le justifie, plutôt que de partir du principe que la gratuité totale du logiciel dispense de tout investissement dans sa fiabilité opérationnelle.
</div>

## 36.3 KVM vs LXC : deux niveaux d'isolation différents

| Critère | KVM (VM complète) | LXC (conteneur) |
|---|---|---|
| Isolation | Complète — noyau propre, totalement indépendant de l'hôte | Partagée — utilise le noyau Linux de l'hôte |
| Flexibilité de système d'exploitation | N'importe quel OS (Windows, toute distribution Linux) | Linux uniquement, compatible avec le noyau de l'hôte |
| Performance et légèreté | Bonne, avec une surcharge de virtualisation classique | Excellente — démarrage quasi instantané, très faible surcharge |
| Cas d'usage typique | Contrôleur de domaine, serveur applicatif Windows, isolation stricte requise | Services Linux légers, environnements de test rapides |

<div class="encadre attention">
<span class="encadre-titre">⚠️ LXC n'offre pas la même isolation de sécurité qu'une VM complète</span>
Un conteneur LXC, partageant le noyau de l'hôte, présente une surface d'isolation plus fine qu'une VM KVM complète — une vulnérabilité du noyau pourrait, dans certains scénarios, affecter l'hôte ou d'autres conteneurs d'une façon qu'une VM KVM totalement isolée ne permettrait pas. Ce compromis (léger et rapide, mais moins isolé) doit être évalué selon la criticité et la sensibilité de la charge de travail concernée — un contrôleur de domaine, par exemple, mérite l'isolation complète d'une VM KVM plutôt qu'un conteneur LXC.
</div>

## 36.4 Cluster Proxmox et migration à chaud

<div class="encadre astuce">
<span class="encadre-titre">💡 Le même besoin, une troisième implémentation</span>
Proxmox propose sa propre migration à chaud (équivalente à vMotion et Live Migration, chapitres 34-35) et son propre mécanisme de cluster, basé sur **Corosync** pour la communication entre nœuds — le même besoin de quorum déjà rencontré au chapitre 13 (et rappelé au chapitre 35 pour Hyper-V) s'applique ici aussi : une majorité de nœuds doit s'accorder sur l'état du cluster pour éviter un split-brain, avec un nombre impair de nœuds généralement recommandé pour faciliter l'obtention d'une majorité claire.
</div>

## 36.5 ZFS : un système de fichiers pensé pour l'intégrité des données

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ ZFS, le choix de stockage recommandé pour Proxmox en production</span>
**ZFS** est un système de fichiers avancé, largement recommandé pour Proxmox VE, qui combine plusieurs fonctionnalités déjà rencontrées séparément dans ce manuel — la gestion de volumes flexible (rappel du LVM, chapitre 17), le RAID logiciel intégré (rappel du chapitre 17 et 27), et des **snapshots natifs très légers**. Sa particularité distinctive : un **checksumming** systématique de chaque bloc de données, qui détecte et corrige automatiquement une corruption silencieuse de données (*bit rot*) — un risque réel sur le long terme que les systèmes de fichiers plus traditionnels (ext4, NTFS) ne détectent généralement pas activement.
</div>

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — les snapshots ZFS restent soumis au même principe déjà établi</span>
Rappel direct du chapitre 33 (snapshots de VM) et du chapitre 28 (snapshots NAS) : même si les snapshots ZFS sont particulièrement légers et rapides à créer, ils restent stockés sur le même pool de stockage physique que les données qu'ils protègent — le même principe s'applique sans exception : un snapshot ZFS ne remplace jamais une sauvegarde vers un support physiquement distinct (chapitre 30).
</div>

## 36.6 Sauvegardes intégrées : Proxmox Backup Server

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — une solution de sauvegarde pensée nativement pour la virtualisation</span>
**Proxmox Backup Server** est une solution de sauvegarde dédiée, intégrée à l'écosystème Proxmox, offrant une déduplication efficace et des sauvegardes incrémentielles rapides de VM et de conteneurs — une application directe des principes déjà posés au chapitre 30 (RTO/RPO, tests de restauration réguliers, règle 3-2-1), avec un outil spécifiquement optimisé pour ce cas d'usage plutôt qu'un outil de sauvegarde générique adapté après coup à la virtualisation.
</div>

## 36.7 Le bilan économique complet pour le scénario d'ouverture

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — un bilan honnête, pas seulement "c'est gratuit"</span>
Pour le bureau du Cap-Haïtien : Proxmox VE élimine le coût de licence d'hyperviseur (contrairement à VMware) et ne dépend pas de licences Windows Server Datacenter déjà possédées (contrairement à l'argument spécifique du chapitre 35, qui ne s'appliquerait de toute façon pas à un nouveau site sans cette même base de licences). Le bilan honnête doit néanmoins inclure : le temps de montée en compétence de l'équipe sur un nouvel écosystème (rappel du critère d'expertise déjà présent aux chapitres 14 et 33), et l'éventuelle souscription de support si la criticité du site le justifie — un choix économiquement avantageux, mais qui reste une vraie décision à documenter, pas un choix "par défaut" sans réflexion.
</div>

## Atelier — Recommander une architecture Proxmox pour le Cap-Haïtien

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 36 — Concevoir la réponse au DSI</span>

**Objectif** : proposer une architecture Proxmox VE concrète pour le bureau du Cap-Haïtien, en tenant compte de sa taille et de sa criticité.

**Préparation** : aucune installation nécessaire — cet atelier est un exercice de conception argumentée.

**Étapes détaillées** :

1. Propose un choix entre KVM et LXC pour héberger un contrôleur de domaine local du Cap-Haïtien (rappel du chapitre 6 sur l'autonomie de chaque site), en justifiant ton choix à partir de la section 36.3.
2. Propose un système de fichiers de stockage pour cette infrastructure, en justifiant ton choix à partir de la section 36.5.
3. Recommande, ou déconseille, une souscription de support Proxmox pour ce site, en justifiant ta position à partir de la section 36.7.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : KVM est le choix approprié pour un contrôleur de domaine, malgré la légèreté de LXC, car l'isolation complète reste préférable pour un service aussi critique et sensible que l'authentification de tout un site (section 36.3). ZFS est recommandé pour son intégrité de données renforcée et ses snapshots légers, particulièrement utile pour un site avec potentiellement moins de personnel technique disponible pour surveiller manuellement l'intégrité du stockage. Une souscription de support est recommandée si le Cap-Haïtien héberge effectivement un contrôleur de domaine critique pour l'autonomie du site (rappel du chapitre 6) — la criticité de ce service justifie l'investissement modeste d'un support commercial, même pour un site de taille plus réduite.

**Dépannage** : si tu hésites sur la nécessité du support commercial, reviens à la question centrale du chapitre 1 sur le principe de gestion des risques : quel est l'impact réel si ce service tombe en panne sans accès à un support professionnel réactif, comparé au coût de la souscription elle-même ?
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — utiliser LXC pour une charge de travail nécessitant une isolation stricte</span>
Rappel de la section 36.3 : la légèreté et la rapidité de LXC ont un coût en termes d'isolation, à ne jamais négliger pour des services critiques ou sensibles.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — confondre la gratuité de la licence avec l'absence de besoin de rigueur opérationnelle</span>
Rappel de la section 36.2 : un système gratuit mérite exactement la même discipline de sauvegarde, de surveillance et de documentation qu'un système sous licence payante.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — compter sur les snapshots ZFS comme seule protection des données</span>
Rappel de la section 36.5 : malgré leur légèreté et leur rapidité impressionnantes, les snapshots ZFS restent soumis au même principe déjà établi tout au long de ce manuel — ils ne remplacent jamais une sauvegarde externe.
</div>

## Diagnostiquer un choix entre KVM et LXC

<div class="encadre attention">
<span class="encadre-titre">🩺 Situation : "Je ne sais pas si je dois déployer ce service en VM KVM ou en conteneur LXC"</span>

- **Diagnostic** : poser la question centrale de la section 36.3 — ce service a-t-il besoin d'un système d'exploitation autre que Linux, ou d'une isolation stricte au niveau du noyau (sécurité renforcée, séparation complète des ressources) ?
- **Comment vérifier** : si la réponse est oui à l'une de ces deux questions, KVM s'impose ; si le service est un service Linux léger sans exigence de sécurité renforcée particulière, LXC offre un gain de performance et de rapidité de déploiement réel.
- **Résolution** : en cas de doute persistant sur la criticité réelle du service, privilégier KVM par prudence — le surcoût de performance reste généralement modéré, alors qu'une isolation insuffisante pour un service qui s'avérerait finalement sensible pourrait avoir des conséquences bien plus coûteuses.
</div>

## En entreprise

- **Bonne pratique répandue** : documenter (chapitre 3) le choix entre KVM et LXC pour chaque charge de travail déployée sous Proxmox, avec sa justification — une distinction moins évidente à deviner après coup que le simple choix d'un hyperviseur unique.
- **Bonne pratique répandue** : utiliser Proxmox Backup Server (section 36.6) plutôt qu'une solution de sauvegarde générique non spécifiquement conçue pour la virtualisation, pour bénéficier de la déduplication et de l'efficacité native de l'outil.
- **Erreur classique observée** : une infrastructure Proxmox déployée en LXC "par défaut" pour tous les services, y compris des services sensibles, sans réflexion consciente sur le compromis d'isolation — un choix de facilité initiale qui peut devenir un risque de sécurité non anticipé.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Quelle est la différence entre KVM et LXC sur Proxmox ?"**
Réponse attendue : KVM crée des machines virtuelles complètes avec leur propre noyau, offrant une isolation totale et la possibilité d'exécuter n'importe quel système d'exploitation ; LXC crée des conteneurs légers partageant le noyau Linux de l'hôte, plus rapides et légers mais avec une isolation moins stricte, limités aux systèmes Linux.

**Q2. "Pourquoi ZFS est-il souvent recommandé comme système de fichiers pour Proxmox ?"**
Réponse attendue : ZFS combine gestion de volumes flexible, RAID logiciel intégré et checksumming systématique des données, détectant et corrigeant automatiquement une corruption silencieuse (bit rot) que des systèmes de fichiers plus traditionnels ne détectent pas activement — un gain d'intégrité des données significatif pour un stockage de production.

**Q3. "Le fait que Proxmox soit gratuit signifie-t-il qu'il convient moins bien à un usage professionnel critique que VMware ?"**
Réponse attendue : non, la gratuité de la licence n'implique aucune infériorité technique fondamentale — Proxmox propose des fonctionnalités de production sérieuses (cluster, migration à chaud, sauvegarde dédiée). Le vrai critère de décision reste, comme pour tout choix technique de ce manuel, l'adéquation au contexte précis (coût, expertise disponible, criticité du service), pas un jugement de valeur automatique sur la gratuité.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Choisis KVM plutôt que LXC pour tout service critique ou sensible nécessitant une isolation stricte, malgré la tentation de la rapidité et de la légèreté de LXC — le compromis d'isolation doit être une décision consciente, jamais un choix par défaut sans réflexion.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) la décision de souscrire ou non au support Proxmox pour chaque site, avec sa justification liée à la criticité réelle du service concerné — une décision économique qui mérite la même rigueur de documentation que tout autre choix d'architecture.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Exploite les snapshots ZFS légers (section 36.5) pour des tests rapides et des retours en arrière fréquents pendant le développement ou la validation de changements (chapitre 2), tout en maintenant une vraie stratégie de sauvegarde externe (chapitre 30) pour la protection réelle des données à long terme.
</div>

## Résumé du chapitre

- Proxmox VE, construit sur Debian, combine nativement KVM (VM complètes) et LXC (conteneurs légers) dans une seule interface de gestion.
- Le modèle économique de Proxmox est gratuit et open source, avec une souscription de support optionnelle — un contraste direct avec les modèles de licence de VMware et Hyper-V.
- KVM offre une isolation complète adaptée aux services critiques ; LXC offre légèreté et rapidité, au prix d'une isolation moins stricte, limitée aux charges Linux.
- ZFS, largement recommandé pour Proxmox, ajoute un checksumming systématique détectant la corruption silencieuse de données, en plus de ses snapshots légers.
- Proxmox Backup Server complète l'écosystème avec une solution de sauvegarde dédiée, respectant les mêmes principes déjà établis au chapitre 30.
- La gratuité de licence ne dispense jamais de la rigueur opérationnelle habituelle (sauvegarde, surveillance, documentation, éventuel support commercial selon la criticité).

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Proxmox VE est construit par-dessus :
   - a) Windows Server
   - b) Debian
   - c) Rocky Linux
   - d) macOS

2. LXC se distingue de KVM car il :
   - a) Offre une isolation totale avec son propre noyau
   - b) Partage le noyau Linux de l'hôte, offrant légèreté mais isolation moindre
   - c) Ne peut héberger que des VM Windows
   - d) Nécessite toujours une licence payante

3. ZFS est particulièrement apprécié pour Proxmox car il :
   - a) Élimine totalement le besoin de sauvegardes
   - b) Détecte et corrige automatiquement la corruption silencieuse de données
   - c) Fonctionne uniquement sur Windows
   - d) Remplace le besoin de RAID

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Proxmox VE ne propose aucune fonctionnalité de cluster ou de migration à chaud, contrairement à VMware et Hyper-V. — **Faux** (il propose ses propres équivalents, section 36.4).
2. LXC convient mieux qu'KVM pour héberger un contrôleur de domaine critique. — **Faux** (KVM offre une isolation plus adaptée, section 36.3).
3. Un snapshot ZFS remplace le besoin d'une sauvegarde externe. — **Faux** (même principe que tout snapshot déjà établi dans ce manuel, section 36.5).
4. La gratuité de Proxmox n'empêche pas de souscrire à un support commercial optionnel. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le choix entre KVM et LXC est une décision à prendre service par service, plutôt qu'un choix unique pour toute l'infrastructure Proxmox.
2. Reprends le scénario d'ouverture. Explique pourquoi "c'est gratuit" ne devrait jamais être le seul argument présenté au DSI pour justifier le choix de Proxmox.

**Corrigé 1** : chaque service a un profil de risque et un besoin d'isolation différents — un contrôleur de domaine critique justifie l'isolation complète de KVM, tandis qu'un service de test léger ou un outil interne peu sensible peut bénéficier pleinement de la rapidité et de la légèreté de LXC sans risque disproportionné. Imposer un choix unique pour toute l'infrastructure reviendrait soit à sur-sécuriser inutilement des services peu sensibles (gaspillage de ressources), soit à sous-sécuriser des services critiques (risque de sécurité réel) — la décision doit rester contextuelle à chaque service, exactement le même principe déjà appliqué au choix de distribution Linux (chapitre 14) ou au choix RAID (chapitre 27).

**Corrigé 2** : un argument limité à la gratuité ignorerait les vrais coûts et compromis réels — le temps de montée en compétence de l'équipe sur un nouvel écosystème, la nécessité éventuelle d'une souscription de support pour un service critique, et la responsabilité accrue de l'équipe interne pour la maintenance sans le filet de sécurité d'un support commercial systématique. Une présentation honnête au DSI doit inclure ce bilan complet (section 36.7), pas seulement l'absence de coût de licence, pour permettre une décision réellement informée plutôt qu'une décision fondée sur un seul critère incomplet.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 36.1</span>

Une équipe déploie un environnement de développement temporaire, destiné à être détruit après deux semaines de tests, sur Proxmox. Recommande KVM ou LXC pour ce cas précis, et justifie ta réponse.
</div>

**Corrigé :** LXC est le choix approprié pour ce cas précis — un environnement de développement temporaire et de courte durée bénéficie directement de la rapidité de déploiement et de démarrage de LXC, sans nécessiter l'isolation complète et le surcoût de performance d'une VM KVM. La nature temporaire et non critique de cet environnement (contrairement à un contrôleur de domaine ou un service de production sensible, section 36.3) rend le compromis d'isolation de LXC parfaitement acceptable ici, l'objectif principal étant la rapidité d'itération plutôt qu'une sécurité renforcée pour un environnement destiné à être détruit après seulement deux semaines.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 36.2</span>

Rédige, en 3 à 5 phrases, pourquoi le choix entre VMware, Hyper-V et Proxmox (chapitres 34-36) ne devrait jamais reposer sur une seule ligne directrice universelle appliquée à toute l'entreprise, en synthétisant les trois chapitres.
</div>

**Corrigé (exemple de réponse) :** Chaque hyperviseur présente un profil de compromis différent — VMware pour sa maturité et son écosystème établi malgré un coût de licence significatif (chapitre 34), Hyper-V pour son intégration native et son économie réelle si des licences Windows Server Datacenter sont déjà possédées (chapitre 35), Proxmox pour sa gratuité totale et sa flexibilité KVM/LXC combinée (ce chapitre). L'entreprise de ce manuel illustre d'ailleurs cette réalité en choisissant VMware pour ses contrôleurs de domaine les plus critiques, Hyper-V pour son second périmètre grâce à des licences déjà possédées, et Proxmox pour un site secondaire à budget plus contraint — une coexistence de plusieurs hyperviseurs justifiée par le contexte spécifique de chaque périmètre, plutôt qu'un choix unique et universel qui ignorerait ces différences réelles de contexte.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends que Proxmox VE est construit sur Debian, combinant KVM et LXC nativement.</li>
<li>☐ Je sais distinguer KVM (VM complète, isolation totale) de LXC (conteneur léger, isolation partielle).</li>
<li>☐ Je comprends le modèle économique de Proxmox (gratuit, support optionnel) et ses implications.</li>
<li>☐ Je connais l'intérêt de ZFS pour l'intégrité des données (checksumming) au-delà du simple RAID.</li>
<li>☐ Je sais pourquoi un snapshot ZFS ne remplace jamais une sauvegarde externe.</li>
<li>☐ Je sais choisir entre KVM et LXC selon la criticité et la sensibilité d'un service donné.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Proxmox peut-il cohabiter avec VMware et Hyper-V dans la même infrastructure, comme le suggère ce manuel ?</dt>
<dd>Oui, techniquement chaque hyperviseur gère son propre périmètre d'hôtes indépendamment — la cohabitation est courante en pratique, avec la même exigence de documentation claire déjà évoquée au chapitre 35 pour éviter la confusion entre écosystèmes différents.</dd>

<dt>Peut-on migrer une VM existante de VMware ou Hyper-V vers Proxmox ?</dt>
<dd>Oui, des outils et des procédures existent pour ce type de migration, mais rarement de façon totalement transparente — le sujet est approfondi au chapitre 38 (migration et interopérabilité entre hyperviseurs), qui couvre les défis réels de ce type d'opération quel que soit le sens de la migration.</dd>

<dt>LXC est-il comparable aux conteneurs Docker déjà mentionnés dans ce manuel ?</dt>
<dd>Les deux reposent sur des principes de conteneurisation Linux proches (partage du noyau de l'hôte), mais avec des philosophies différentes : LXC vise à conteneuriser un système Linux complet (proche d'une VM légère), tandis que Docker (Partie 7) vise à conteneuriser une application unique — une distinction approfondie au chapitre 39.</dd>

<dt>ZFS est-il obligatoire pour utiliser Proxmox ?</dt>
<dd>Non, Proxmox supporte plusieurs systèmes de fichiers et technologies de stockage (LVM classique, ext4, Ceph pour du stockage distribué à plus grande échelle) — ZFS reste une recommandation forte pour ses bénéfices d'intégrité des données, pas une obligation technique absolue.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Proxmox VE : [https://pve.proxmox.com/pve-docs/](https://pve.proxmox.com/pve-docs/)
- Documentation officielle ZFS on Linux : [https://openzfs.github.io/openzfs-docs/](https://openzfs.github.io/openzfs-docs/)
- Documentation officielle Proxmox Backup Server : [https://pbs.proxmox.com/docs/](https://pbs.proxmox.com/docs/)

*Chapitre suivant : VirtualBox — l'hyperviseur de Type 2 destiné à l'apprentissage et aux tests personnels, complétant le panorama de la virtualisation avant d'aborder la migration entre hyperviseurs.*
