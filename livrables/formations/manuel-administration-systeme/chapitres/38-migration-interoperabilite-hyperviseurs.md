<div class="chapitre-titre-num">CHAPITRE 38</div>

# Migration et interopérabilité entre hyperviseurs

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Comprendre comment déplacer une machine virtuelle d'un hyperviseur vers un autre — un besoin réel, pas théorique, dans une infrastructure qui combine déjà VMware, Hyper-V et Proxmox comme celle de ce manuel. À la fin de ce chapitre, tu sauras planifier une migration entre hyperviseurs comme un changement maîtrisé (chapitre 2), utiliser les formats d'échange standards, et éviter les pièges les plus fréquents liés aux résidus de pilotes de l'hyperviseur d'origine.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Dix-huit mois après la migration des contrôleurs de domaine vers VMware (chapitre 34), l'éditeur annonce une refonte majeure de sa politique de licence, avec une hausse de coût significative pour l'entreprise — une situation bien réelle qu'ont vécue de nombreuses organisations ces dernières années suite à des changements de politique commerciale de grands éditeurs de virtualisation. Le DSI, échaudé, demande une évaluation sérieuse : peut-on migrer certaines charges de travail VMware vers Proxmox (chapitre 36), dont le succès au Cap-Haïtien a déjà fait ses preuves, pour réduire cette dépendance et ce coût ? Ce chapitre répond à cette question bien réelle du marché de la virtualisation d'entreprise : la portabilité entre hyperviseurs n'est jamais totalement transparente, mais elle est loin d'être impossible avec une méthode rigoureuse.
</div>

## 38.1 Pourquoi la portabilité entre hyperviseurs compte réellement

<div class="encadre memoriser">
<span class="encadre-titre">🧠 À mémoriser — le risque de dépendance à un fournisseur unique (vendor lock-in)</span>
Le scénario d'ouverture illustre un risque stratégique réel : une dépendance trop forte à un seul fournisseur d'hyperviseur expose l'organisation aux décisions commerciales de ce fournisseur, hors de son contrôle. Ce n'est pas un argument contre le choix initial de VMware (parfaitement justifié au chapitre 34 pour sa maturité), mais une raison supplémentaire de comprendre comment une migration reste possible si le contexte économique ou stratégique évolue — la portabilité comme option de secours, pas comme critère de choix initial exclusif.
</div>

## 38.2 Les formats d'échange : standards ouverts vs formats propriétaires

| Format | Nature | Compatibilité |
|---|---|---|
| **OVA/OVF** (*Open Virtualization Format*) | Standard ouvert, indépendant du fournisseur | Largement supporté en import/export par la plupart des hyperviseurs |
| **VMDK** | Format de disque propriétaire VMware | Natif VMware, lisible par certains autres outils avec conversion |
| **VHDX** | Format de disque propriétaire Microsoft | Natif Hyper-V |
| **qcow2** | Format de disque natif de KVM/QEMU | Natif Proxmox (et Linux/KVM en général) |

<div class="encadre astuce">
<span class="encadre-titre">💡 OVA/OVF comme dénominateur commun</span>
Exporter une VM au format OVA/OVF (une archive contenant la définition de la VM et ses disques) offre le chemin de migration le plus largement supporté entre hyperviseurs différents — même s'il ne garantit jamais une compatibilité à 100% sans ajustement, exactement comme un fichier bureautique exporté dans un format standard reste généralement plus portable qu'un format propriétaire, mais peut nécessiter des ajustements mineurs de mise en forme après import dans un autre logiciel.
</div>

## 38.3 P2V et V2V : deux directions de conversion

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
**P2V** (*Physical to Virtual*) convertit un serveur physique existant en machine virtuelle — un besoin historique, moins fréquent aujourd'hui dans une infrastructure déjà largement virtualisée comme celle de ce manuel, mais toujours pertinent pour un dernier serveur physique legacy. **V2V** (*Virtual to Virtual*) convertit une VM d'un hyperviseur vers un autre — exactement le besoin du scénario d'ouverture, migrer une VM VMware vers Proxmox.
</div>

## 38.4 Outils concrets pour une migration V2V vers Proxmox

```
# Sur Proxmox, importer un disque virtuel exporte depuis VMware
# (converti prealablement au format qcow2 ou directement compatible)
qm importdisk <id-vm> chemin/vers/disque.vmdk <stockage-cible>

# Exemple : importer le disque d'une VM ID 105 vers le stockage local-lvm
qm importdisk 105 dc-pap-01-disk.vmdk local-lvm
```

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — ne jamais migrer directement un système en production sans copie de test</span>
Rappel direct du principe de test déjà établi aux chapitres 30 et 31 : la première tentative de migration V2V ne doit jamais porter sur le système de production lui-même, mais sur une copie de test — exactement le même principe qu'un test de restauration de sauvegarde, appliqué ici à une migration entre hyperviseurs plutôt qu'à une reprise après sinistre.
</div>

## 38.5 Le piège classique : les résidus de pilotes de l'ancien hyperviseur

<div class="encadre attention">
<span class="encadre-titre">⚠️ VMware Tools ou les Services d'intégration Hyper-V ne disparaissent pas automatiquement</span>
Après une migration V2V, les outils d'intégration spécifiques à l'ancien hyperviseur (VMware Tools, chapitre 34 ; Services d'intégration Hyper-V, chapitre 35) restent généralement installés dans le système d'exploitation invité, même s'ils ne servent plus à rien sur le nouvel hyperviseur — au mieux inutiles, au pire source de comportements imprévisibles (pilotes orphelins, services qui échouent silencieusement à démarrer). Un nettoyage explicite de ces composants après migration doit faire partie intégrante de toute procédure de migration V2V, jamais une étape "si on y pense".
</div>

## 38.6 Revérifier systématiquement la synchronisation temporelle après toute migration

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — le piège des chapitres 34 et 35 se pose à nouveau, dans l'autre sens</span>
Rappel direct : si une VM migre de VMware (où la synchronisation temporelle VMware Tools avait été correctement désactivée, chapitre 34) vers Proxmox, il faut vérifier qu'aucun mécanisme équivalent propre à Proxmox/KVM ne réintroduit le même risque pour un contrôleur de domaine migré. Ce réflexe de vérification — jamais supposer qu'une configuration correcte sur l'ancien hyperviseur reste automatiquement correcte sur le nouveau — s'applique à bien plus que la seule synchronisation temporelle, mais elle en reste l'exemple le plus documenté et le plus fréquemment oublié.
</div>

## 38.7 Tester avant de considérer une migration terminée

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance — une checklist de validation post-migration, pas une simple vérification de démarrage</span>
Rappel du principe déjà établi au chapitre 30 (tester une restauration) et au chapitre 31 (tester un PRA) : une VM qui démarre après migration n'est pas une VM dont la migration est validée. Pour un contrôleur de domaine migré, par exemple, la validation doit inclure un test d'authentification réel (chapitre 5), une vérification de la réplication avec les autres contrôleurs (chapitre 6), et la confirmation de l'absence d'erreur Kerberos (chapitre 23) — une checklist de validation fonctionnelle complète, pas seulement "l'écran de connexion Windows s'affiche".
</div>

## 38.8 Planifier une migration comme un changement maîtrisé

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique — appliquer intégralement le processus du chapitre 2</span>
Une migration V2V entre hyperviseurs de production répond exactement à la définition d'un **changement normal** du chapitre 2 : un risque réel, nécessitant une évaluation au cas par cas, une fenêtre de maintenance, et surtout un **plan de retour arrière** explicite — dans ce cas, la VM d'origine sur l'ancien hyperviseur, qui ne doit jamais être supprimée avant que la migration ne soit entièrement validée en conditions réelles sur le nouvel hyperviseur.
</div>

## Atelier — Planifier la migration du scénario d'ouverture

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 38 — Rédiger une checklist de migration V2V complète</span>

**Objectif** : construire une checklist de migration complète pour un contrôleur de domaine, du VMware du chapitre 34 vers le Proxmox du chapitre 36, en réponse au scénario d'ouverture.

**Préparation** : aucune installation nécessaire — cet atelier est un exercice de planification structurée.

**Étapes détaillées** :

1. Liste les étapes de préparation avant toute migration, en t'appuyant sur les sections 38.4 et 38.8.
2. Liste les étapes de nettoyage post-migration nécessaires, en t'appuyant sur la section 38.5.
3. Liste les vérifications de validation fonctionnelle avant de considérer la migration terminée, en t'appuyant sur les sections 38.6 et 38.7.
4. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la préparation inclut l'export au format OVA/OVF ou la conversion de disque appropriée, un test préalable sur une copie non productive, et une fenêtre de maintenance planifiée avec plan de retour arrière (garder la VM d'origine intacte sur VMware). Le nettoyage post-migration inclut la désinstallation de VMware Tools et l'installation des outils d'intégration natifs Proxmox/KVM le cas échéant. La validation fonctionnelle inclut un test d'authentification réel, une vérification de la réplication Active Directory (chapitre 6), une confirmation de l'absence d'erreur Kerberos, et une vérification explicite de la configuration de synchronisation temporelle sur le nouvel hyperviseur — la VM d'origine sur VMware n'étant supprimée qu'après validation complète et une période d'observation raisonnable.

**Dépannage** : si tu hésites sur la durée de la période d'observation avant de supprimer la VM d'origine, reviens au principe du chapitre 2 sur les fenêtres de test progressives — une période d'une à deux semaines de fonctionnement stable sur le nouvel hyperviseur est une référence raisonnable pour un système aussi critique qu'un contrôleur de domaine, à ajuster selon la criticité réelle du système migré.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — supprimer la VM d'origine immédiatement après la migration</span>
Rappel de la section 38.8 : sans période de validation ni plan de retour arrière conservé, une migration qui semblait réussie mais révèle un problème après quelques jours devient bien plus difficile à corriger.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — ne pas nettoyer les résidus de pilotes de l'ancien hyperviseur</span>
Rappel de la section 38.5 : des composants orphelins peuvent provoquer des comportements imprévisibles, parfois bien après la migration elle-même, rendant le diagnostic ultérieur plus complexe qu'il ne devrait l'être.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — considérer un simple démarrage réussi comme une validation suffisante</span>
Rappel de la section 38.7 : une VM qui démarre n'est pas une VM entièrement fonctionnelle — seule une checklist de validation fonctionnelle complète confirme réellement le succès d'une migration.
</div>

## Diagnostiquer une VM qui démarre mal après migration

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une VM migrée démarre mais présente des comportements anormaux (services en erreur, lenteurs inexpliquées)</span>

- **Diagnostic** : vérifier en priorité la présence de résidus de pilotes de l'ancien hyperviseur (section 38.5) — une cause fréquente de comportements anormaux après une migration V2V, souvent négligée au profit d'hypothèses plus complexes.
- **Comment vérifier** : consulter la liste des services et pilotes installés (rappel du chapitre 16 pour systemd sur Linux, ou le Gestionnaire de périphériques sur Windows) à la recherche de composants spécifiques à l'ancien hyperviseur encore présents.
- **Résolution** : désinstaller proprement les composants de l'ancien hyperviseur et installer les outils d'intégration natifs du nouvel hyperviseur, puis redémarrer et revalider entièrement selon la checklist de la section 38.7.
</div>

## En entreprise

- **Bonne pratique répandue** : maintenir une compétence minimale sur au moins deux hyperviseurs différents au sein de l'équipe infrastructure, précisément pour réduire le risque de dépendance opérationnelle en cas de nécessité de migration future, rejoignant le risque de "bus factor" déjà évoqué au chapitre 1, appliqué ici à l'expertise technologique plutôt qu'aux connaissances d'un système précis.
- **Bonne pratique répandue** : documenter (chapitre 3) toute migration V2V réalisée, avec sa date, sa justification et les problèmes rencontrés pendant le processus — une référence précieuse pour toute migration future similaire.
- **Erreur classique observée** : une organisation qui découvre, seulement au moment où une migration devient nécessaire pour des raisons économiques urgentes (comme dans le scénario d'ouverture), qu'aucune procédure ni compétence de migration n'a jamais été anticipée ni testée à l'avance.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi une entreprise choisirait-elle de migrer une charge de travail d'un hyperviseur à un autre ?"**
Réponse attendue : plusieurs raisons possibles — un changement de politique de licence ou de tarification de l'éditeur (le scénario le plus documenté ces dernières années), une consolidation stratégique vers un écosystème unique, ou une réduction de coûts. La portabilité entre hyperviseurs constitue une option stratégique de secours face à ce type de risque de dépendance à un fournisseur unique.

**Q2. "Quel est le principal piège technique d'une migration V2V entre hyperviseurs différents ?"**
Réponse attendue : les résidus de pilotes et d'outils d'intégration spécifiques à l'ancien hyperviseur (VMware Tools, Services d'intégration Hyper-V), qui restent installés après migration et peuvent provoquer des comportements imprévisibles — un nettoyage explicite reste indispensable, jamais automatique.

**Q3. "Comment appliquerais-tu le processus de gestion du changement du chapitre 2 à une migration entre hyperviseurs ?"**
Réponse attendue : traiter la migration comme un changement normal à risque réel, avec une évaluation préalable, un test sur une copie non productive, une fenêtre de maintenance planifiée, et surtout un plan de retour arrière explicite (conserver la VM d'origine intacte jusqu'à validation complète du succès de la migration).
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Ne supprime jamais la VM d'origine avant une période de validation suffisante sur le nouvel hyperviseur (section 38.8) — un plan de retour arrière n'a de valeur que s'il reste réellement disponible, pas seulement documenté en théorie.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente (chapitre 3) chaque migration V2V réalisée, avec la checklist complète utilisée et les éventuels problèmes rencontrés — une base de connaissance précieuse pour accélérer et fiabiliser toute migration future similaire.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Teste systématiquement une migration sur une copie non productive avant toute tentative sur un système réel — le temps investi dans ce test préalable reste toujours inférieur au coût d'une migration ratée en production, un principe déjà établi pour les sauvegardes (chapitre 30) et directement transposable ici.
</div>

## Résumé du chapitre

- La portabilité entre hyperviseurs réduit le risque de dépendance à un fournisseur unique (vendor lock-in), un risque stratégique bien réel et documenté sur le marché de la virtualisation.
- OVA/OVF constitue le format d'échange le plus largement supporté entre hyperviseurs différents, même s'il ne garantit jamais une compatibilité parfaite sans ajustement.
- P2V convertit un serveur physique en VM ; V2V convertit une VM d'un hyperviseur vers un autre.
- Les résidus de pilotes de l'ancien hyperviseur (VMware Tools, Services d'intégration Hyper-V) doivent être nettoyés explicitement après toute migration V2V.
- La synchronisation temporelle doit être revérifiée après chaque migration, jamais supposée automatiquement correcte simplement parce qu'elle l'était sur l'ancien hyperviseur.
- Une migration entre hyperviseurs de production doit suivre le processus de changement du chapitre 2, avec un plan de retour arrière conservé jusqu'à validation complète.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. OVA/OVF est :
   - a) Un format propriétaire exclusif à VMware
   - b) Un standard ouvert largement supporté entre différents hyperviseurs
   - c) Un protocole réseau
   - d) Un outil de sauvegarde

2. V2V désigne :
   - a) La conversion d'un serveur physique en VM
   - b) La conversion d'une VM d'un hyperviseur vers un autre
   - c) La virtualisation d'un réseau
   - d) Une méthode de chiffrement

3. Après une migration V2V, la première cause de comportements anormaux à vérifier est généralement :
   - a) Un problème de mot de passe
   - b) Des résidus de pilotes de l'ancien hyperviseur
   - c) Une panne du réseau physique
   - d) Un problème de licence Windows

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une migration V2V entre hyperviseurs différents est toujours parfaitement transparente, sans aucun ajustement nécessaire. — **Faux** (des ajustements et un nettoyage restent généralement nécessaires, section 38.5).
2. La VM d'origine devrait être supprimée immédiatement après une migration réussie, pour économiser de l'espace de stockage. — **Faux** (elle doit être conservée jusqu'à validation complète, section 38.8).
3. Une VM qui démarre correctement après migration est automatiquement considérée comme entièrement validée. — **Faux** (une checklist de validation fonctionnelle complète reste nécessaire, section 38.7).
4. La dépendance à un fournisseur unique d'hyperviseur (vendor lock-in) représente un risque stratégique réel pour une organisation. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une migration entre hyperviseurs devrait toujours être traitée comme un changement normal du chapitre 2, jamais comme une simple opération technique routinière.
2. Reprends le scénario d'ouverture. Explique pourquoi ce type de situation illustre l'intérêt d'avoir déjà une infrastructure multi-hyperviseurs (VMware, Hyper-V, Proxmox) plutôt qu'un choix unique et exclusif.

**Corrigé 1** : une migration entre hyperviseurs comporte un risque réel de dysfonctionnement (résidus de pilotes, comportements imprévisibles, sections 38.5-38.6), touchant potentiellement un système critique comme un contrôleur de domaine — exactement le type de risque que le processus de changement du chapitre 2 est conçu pour maîtriser, avec une évaluation préalable, un test, et surtout un plan de retour arrière. Traiter cette opération comme une simple tâche technique routinière, sans cette rigueur, exposerait l'entreprise à un risque disproportionné par rapport au bénéfice recherché.

**Corrigé 2** : une infrastructure déjà partiellement diversifiée entre plusieurs hyperviseurs (comme celle construite au fil de ce manuel) offre une option de repli immédiate et déjà éprouvée (Proxmox, déjà utilisé avec succès au Cap-Haïtien) face à un changement défavorable chez un fournisseur — contrairement à une organisation entièrement dépendante d'un seul hyperviseur, qui devrait à la fois apprendre un nouvel écosystème ET migrer dans l'urgence, cumulant les risques et les délais. La diversification, même partielle, réduit concrètement l'impact d'un risque de dépendance à un fournisseur unique, exactement l'argument central de la section 38.1.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 38.1</span>

Une VM migrée de VMware vers Proxmox démarre normalement, mais un service applicatif qui dépendait auparavant d'une intégration spécifique à VMware Tools (par exemple, un script de sauvegarde automatisé qui interrogeait des informations fournies par VMware Tools) échoue silencieusement. Explique la cause probable et la démarche de correction.
</div>

**Corrigé :** La cause probable est la dépendance du script à une fonctionnalité ou une information spécifiquement fournie par VMware Tools (section 38.5), qui n'a plus d'équivalent après la migration vers Proxmox sans adaptation. La démarche de correction consiste à identifier précisément cette dépendance (en consultant la documentation ou le code du script concerné), puis à l'adapter pour utiliser l'équivalent natif de Proxmox/KVM si disponible, ou à repenser cette fonctionnalité différemment — un exemple concret de pourquoi la checklist de validation post-migration (section 38.7) doit couvrir explicitement tous les scripts et automatisations dépendant potentiellement de l'ancien hyperviseur, pas seulement le système d'exploitation de base.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 38.2</span>

Rédige, en 3 à 5 phrases, pourquoi documenter (chapitre 3) chaque migration V2V réalisée constitue un investissement qui profite à l'organisation bien au-delà de la migration elle-même.
</div>

**Corrigé (exemple de réponse) :** Documenter une migration V2V — les étapes suivies, les problèmes rencontrés, les solutions appliquées — crée une référence directement réutilisable pour toute migration future similaire, réduisant le temps et le risque d'erreur la prochaine fois qu'une situation comparable se présente. Cette documentation devient particulièrement précieuse si l'entreprise doit un jour migrer plusieurs charges de travail similaires (comme dans le scénario d'ouverture, où plusieurs VM VMware pourraient nécessiter une migration suite au changement de politique de licence) — chaque migration suivante bénéficiant de l'expérience déjà acquise et documentée, plutôt que de repartir de zéro à chaque fois, exactement le même principe de valeur cumulative déjà établi pour les runbooks au chapitre 3.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends le risque de dépendance à un fournisseur unique (vendor lock-in) et son lien avec la portabilité entre hyperviseurs.</li>
<li>☐ Je connais le rôle du format OVA/OVF comme dénominateur commun entre hyperviseurs différents.</li>
<li>☐ Je sais distinguer P2V et V2V.</li>
<li>☐ Je sais pourquoi les résidus de pilotes de l'ancien hyperviseur doivent être nettoyés après toute migration V2V.</li>
<li>☐ Je sais pourquoi la synchronisation temporelle doit être revérifiée après chaque migration.</li>
<li>☐ Je sais planifier une migration entre hyperviseurs comme un changement maîtrisé, avec un plan de retour arrière.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Une migration V2V entraîne-t-elle toujours une interruption de service ?</dt>
<dd>Généralement oui, sauf outils spécialisés de migration à chaud entre hyperviseurs différents (plus rares et souvent limités que la migration à chaud au sein d'un même écosystème, comme vMotion ou Live Migration) — une fenêtre de maintenance planifiée (chapitre 2) reste l'approche la plus courante et la plus fiable pour ce type de migration.</dd>

<dt>Faut-il migrer toute l'infrastructure d'un coup, ou progressivement ?</dt>
<dd>Une approche progressive est fortement recommandée, en commençant par les systèmes les moins critiques pour valider la méthode avant de l'appliquer à des systèmes plus sensibles — exactement le même principe de déploiement pilote déjà recommandé pour les GPO au chapitre 7.</dd>

<dt>Les licences logicielles du système d'exploitation invité sont-elles affectées par une migration V2V ?</dt>
<dd>Cela dépend des conditions de licence spécifiques du système d'exploitation et des logiciels installés — certaines licences sont liées au matériel physique sous-jacent ou à des identifiants spécifiques à l'hyperviseur d'origine, un point à vérifier attentivement avant toute migration pour éviter une invalidation de licence inattendue.</dd>

<dt>Existe-t-il des outils qui automatisent entièrement une migration V2V ?</dt>
<dd>Des outils facilitent certaines étapes (conversion de format, transfert de disque), mais aucun outil ne remplace entièrement la vigilance humaine nécessaire au nettoyage des résidus et à la validation fonctionnelle complète décrite dans ce chapitre — l'automatisation aide, elle ne dispense jamais de la rigueur de vérification.</dd>
</dl>

## Références et pour aller plus loin

- Documentation officielle Proxmox — Importation de VM depuis d'autres hyperviseurs : [https://pve.proxmox.com/pve-docs/](https://pve.proxmox.com/pve-docs/)
- Spécification OVF (DMTF) : [https://www.dmtf.org/standards/ovf](https://www.dmtf.org/standards/ovf)
- Microsoft Learn — Importer et exporter des machines virtuelles Hyper-V : [https://learn.microsoft.com/fr-fr/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines](https://learn.microsoft.com/fr-fr/windows-server/virtualization/hyper-v/deploy/export-and-import-virtual-machines)

*Fin de la Partie 6. La Partie 7 aborde maintenant la conteneurisation — Docker et Kubernetes — un niveau d'abstraction supplémentaire au-delà de la VM, pour des applications packagées et déployées différemment de tout ce qui a été couvert jusqu'ici.*
