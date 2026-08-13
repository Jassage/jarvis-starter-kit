<div class="chapitre-titre-num">CHAPITRE 84</div>

# Composant cloud hybride

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectif du chapitre</span>
Étendre délibérément l'infrastructure du projet vers le cloud public, en s'appuyant sur les principes multi-cloud déjà établis à la Partie 8 de ce manuel. À la fin de ce chapitre, tu sauras formaliser une stratégie cloud gouvernée pour l'ensemble du projet, concevoir une sauvegarde hors site dans le cloud comme composant du plan de reprise d'activité, et intégrer les événements cloud à la gouvernance de sécurité déjà établie.
</div>

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Rappel du chapitre 49 : l'entreprise s'était retrouvée "hybride multi-cloud par accident", chaque décision cloud prise isolément sans gouvernance d'ensemble. Pour le projet final, le DSI refuse de reproduire ce schéma : <em>"Cette fois, on formalise notre stratégie cloud dès le départ — quels services y vont, pourquoi, avec quelle gouvernance — plutôt que de laisser chaque équipe décider au coup par coup comme on l'a fait par le passé."</em> Ce chapitre construit ce composant cloud de façon délibérée, en synthétisant l'ensemble des principes déjà établis à la Partie 8.
</div>

## 84.1 Le problème : formaliser ce qui s'était construit par accident

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — rappel direct des chapitres 49 et 50</span>
L'entreprise dispose déjà d'une présence cloud réelle — AWS pour le portail client (chapitre 46), Entra ID hybride pour l'identité (chapitre 8) — mais ces décisions, prises isolément à des moments différents, n'avaient jamais été consolidées dans une stratégie cohérente avant le travail de gouvernance du chapitre 49. Le projet final formalise explicitement cette stratégie, exactement le même exercice de structuration déjà appliqué au cahier des charges global du chapitre 80, appliqué ici spécifiquement au périmètre cloud.
</div>

## 84.2 Synthèse des choix cloud motivés par service

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct des chapitres 46-49</span>
La stratégie cloud du projet final réaffirme les choix déjà justifiés dans ce manuel : AWS pour le portail client, choisi pour sa popularité et sa documentation abondante (chapitre 46) ; Azure pour tout service nécessitant une intégration native à Entra ID, comme évalué pour le serveur de gestion documentaire (chapitre 47) ; l'absence délibérée de GCP, pour éviter une dispersion technologique inutile (chapitre 48) — chaque choix reste motivé par le service concerné, jamais par une préférence générale pour un fournisseur unique ni par une accumulation history-driven de décisions non coordonnées.
</div>

## 84.3 Modules Terraform pour un déploiement cloud cohérent

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct du chapitre 55</span>
L'ensemble de l'infrastructure cloud du projet, y compris pour le nouveau site qui pourrait s'appuyer sur des services cloud plutôt qu'une infrastructure locale (rappel de la section 81.5), s'appuie sur les modules Terraform réutilisables déjà établis au chapitre 55 — garantissant une configuration cohérente entre les différents environnements et évitant la duplication de code déjà dénoncée pour une configuration cloud répétée manuellement à chaque nouveau besoin.
</div>

## 84.4 La sauvegarde hors site dans le cloud comme composant du PRA

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — préparer directement le chapitre 86</span>
Le cloud public offre un emplacement de sauvegarde hors site naturel, géographiquement distinct de l'ensemble des sites physiques de l'entreprise — un composant précieux pour le plan de reprise d'activité déjà établi au chapitre 31, protégeant contre un scénario où un sinistre affecterait simultanément un site physique et ses sauvegardes locales (rappel du chapitre 32, exercice de simulation d'ouragan). Ce composant sera directement repris et détaillé au chapitre 86, consacré à la consolidation finale du PRA et du PCA du projet.
</div>

```
Politique de sauvegarde hors site :
  - Sauvegardes locales quotidiennes (regle 3-2-1, chapitre 30)
  - Copie chiffree vers stockage cloud (AWS S3, classe de stockage froide)
  - Retention : 90 jours, conforme a la politique de conformite deja etablie (chapitre 72)
  - Test de restauration trimestriel (rappel direct chapitre 27)
```

## 84.5 Gouvernance multi-cloud à l'échelle du projet complet

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel direct du chapitre 50</span>
La gouvernance FinOps déjà établie au chapitre 50 (étiquetage systématique des ressources, budgets et alertes de dépassement, cycle Informer-Optimiser-Opérer) s'applique à l'échelle complète du projet, couvrant désormais l'ensemble des services cloud utilisés par les quatre sites de l'entreprise — évitant la surprise de facturation déjà vécue au chapitre 50, cette fois à une échelle où l'impact financier d'un dérapage non maîtrisé serait proportionnellement plus important.
</div>

## 84.6 Sécuriser le composant cloud et l'intégrer au SIEM

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité — rappel direct des chapitres 46 et 74</span>
Les principes IAM de moindre privilège déjà établis pour AWS au chapitre 46 s'appliquent à l'ensemble des ressources cloud du projet, avec un chiffrement systématique des données sensibles (rappel de la section 84.4). Les journaux d'activité cloud (connexions, modifications de configuration, accès aux ressources) sont intégrés au SIEM déjà construit au chapitre 74, comme une source supplémentaire enrichissant les règles de corrélation existantes — un événement d'accès cloud inhabituel, corrélé avec une authentification Active Directory suspecte, révélant potentiellement une compromission s'étendant au-delà de l'infrastructure locale.
</div>

## 84.7 Valider face au cahier des charges du chapitre 80

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Rappel direct de la boucle déjà établie aux chapitres 81 et 83</span>
Vérifie explicitement que ce composant cloud répond aux exigences pertinentes du cahier des charges — la disponibilité du portail client (déjà couverte par l'architecture cloud existante), la conformité aux référentiels de sécurité déjà adoptés (section 84.6), et les contraintes budgétaires (section 84.5) — avant de considérer ce composant comme validé pour le projet final.
</div>

## Atelier — Formaliser la stratégie cloud complète du projet

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 84 — Répondre à l'exigence de gouvernance du DSI</span>

**Objectif** : rédiger une stratégie cloud formalisée pour le projet, couvrant les choix de services, la sauvegarde hors site, et la gouvernance financière et de sécurité.

**Préparation** : une relecture des chapitres 46 à 50 pour synthétiser les décisions cloud déjà justifiées.

**Étapes détaillées** :

1. Récapitule, pour chaque service cloud déjà utilisé (portail client sur AWS, considérations Azure), la justification motivée par le service plutôt que par une préférence générale.
2. Conçois une politique de sauvegarde hors site dans le cloud pour l'ensemble des sites de l'entreprise, en t'appuyant sur la section 84.4.
3. Définis un budget cloud cible et un mécanisme d'alerte de dépassement, rappelant la section 84.5.
4. Identifie les journaux cloud à intégrer en priorité au SIEM, en justifiant ce choix par leur valeur pour la détection d'incident.
5. Compare ta démarche à la section "Résultat attendu".

**Résultat attendu** : la stratégie cloud reste cohérente avec les choix déjà justifiés dans ce manuel, sans introduire de nouveau fournisseur sans justification explicite. La politique de sauvegarde hors site applique la règle 3-2-1 déjà établie au chapitre 30, avec une copie chiffrée dans le cloud testée trimestriellement. Le budget et les alertes de dépassement reprennent directement le cycle FinOps du chapitre 50, désormais appliqué à l'échelle complète du projet. Les journaux d'authentification et de modification de configuration cloud constituent généralement la priorité d'intégration au SIEM, ces événements étant les plus révélateurs d'une activité potentiellement malveillante.

**Dépannage** : si le budget cloud cible semble difficile à estimer sans données historiques suffisantes, base l'estimation initiale sur le coût observé du portail client déjà en production (chapitre 50), ajusté proportionnellement aux nouveaux services envisagés, plutôt que de partir d'une estimation arbitraire sans ancrage dans l'usage réel déjà observé.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — de nouveaux services cloud adoptés sans revenir à la gouvernance déjà établie</span>
Rappel des chapitres 49-50 : reproduire, pour le projet final, exactement le schéma "hybride par accident" que l'entreprise avait déjà corrigé.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — une sauvegarde cloud jamais testée en restauration</span>
Rappel direct du chapitre 27 : une sauvegarde hors site non vérifiée offre une fausse impression de protection, un risque particulièrement critique pour le composant spécifiquement destiné au plan de reprise d'activité.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — des journaux d'activité cloud jamais intégrés au SIEM</span>
Rappel direct du chapitre 74 : une source d'événements cloud non intégrée crée un angle mort, exactement le même risque déjà dénoncé pour toute source de sécurité critique non couverte.
</div>

## Diagnostiquer une dérive de gouvernance cloud sur le projet final

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : une facture cloud dépasse significativement le budget cible défini pour le projet, sans alerte préalable</span>

- **Diagnostic** : ce symptôme, rappel direct du même incident déjà rencontré au chapitre 50, indique généralement une absence d'étiquetage systématique des ressources ou un mécanisme d'alerte de budget mal configuré ou inexistant.
- **Comment vérifier** : consulter la répartition des coûts par étiquette et par service, identifiant les ressources responsables du dépassement — une répartition impossible à établir révèle elle-même l'absence d'étiquetage systématique.
- **Résolution** : appliquer rétroactivement l'étiquetage manquant, configurer les alertes de budget appropriées, et reprendre le cycle Informer-Optimiser-Opérer déjà établi au chapitre 50 pour l'ensemble du périmètre du projet.
</div>

## En entreprise

- **Bonne pratique répandue** : formaliser la stratégie cloud dès la phase de conception d'un projet d'infrastructure, plutôt que de la reconstruire après coup une fois plusieurs décisions déjà prises isolément.
- **Bonne pratique répandue** : intégrer systématiquement les journaux cloud au SIEM dès l'adoption de tout nouveau service cloud, sans attendre un exercice de consolidation ultérieur.
- **Erreur classique observée** : une organisation qui investit dans une gouvernance cloud rigoureuse pour son infrastructure existante, mais qui néglige d'appliquer cette même rigueur à chaque nouveau projet, reproduisant progressivement le même problème de dispersion déjà résolu ailleurs dans l'organisation.

## Entretien technique

<div class="encadre exercice">
<span class="encadre-titre">💼 Questions fréquemment posées en entretien</span>

**Q1. "Pourquoi est-il important de formaliser une stratégie cloud dès le départ d'un projet, plutôt que de laisser chaque décision se prendre isolément ?"**
Réponse attendue : une gouvernance formalisée évite la dispersion technologique, le risque de facturation inattendue, et les lacunes de sécurité qui résultent typiquement de décisions cloud non coordonnées, exactement le problème déjà rencontré et corrigé aux chapitres 49-50.

**Q2. "Pourquoi le cloud public constitue-t-il un emplacement particulièrement adapté pour une sauvegarde hors site dans le cadre d'un plan de reprise d'activité ?"**
Réponse attendue : il offre une séparation géographique naturelle par rapport à l'ensemble des sites physiques de l'entreprise, protégeant contre un scénario où un sinistre affecterait simultanément un site et ses sauvegardes locales.

**Q3. "Pourquoi intégrer les journaux d'activité cloud au SIEM plutôt que de les laisser consultables uniquement dans la console du fournisseur cloud ?"**
Réponse attendue : cette intégration permet de corréler un événement cloud avec d'autres sources déjà en place (Active Directory, pare-feu, EDR), révélant potentiellement une compromission s'étendant au-delà de l'infrastructure locale, une capacité qu'une consultation isolée de la console cloud ne permettrait pas.
</div>

## Optimisation, sécurité et maintenabilité — les réflexes dès ce chapitre

<div class="encadre securite">
<span class="encadre-titre">🔒 Sécurité</span>
Chiffre systématiquement toute donnée sensible stockée dans le cloud, en particulier les sauvegardes hors site destinées au plan de reprise d'activité, appliquant le principe de moindre privilège à l'ensemble des accès IAM correspondants.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Maintenabilité</span>
Documente explicitement la justification de chaque service cloud adopté pour le projet, évitant la reconstitution laborieuse d'une gouvernance a posteriori déjà nécessaire une fois par le passé au chapitre 49.
</div>

<div class="encadre performance">
<span class="encadre-titre">🚀 Performance</span>
Adapte la classe de stockage cloud utilisée pour la sauvegarde hors site à la fréquence réelle d'accès attendue (stockage froid pour une sauvegarde rarement consultée), optimisant le coût sans compromettre la disponibilité en cas de besoin réel de restauration.
</div>

## Résumé du chapitre

- La stratégie cloud du projet final formalise délibérément ce qui s'était construit par accident aux chapitres 46-50, plutôt que de reproduire ce schéma.
- Chaque service cloud reste choisi selon sa pertinence spécifique, jamais par préférence générale pour un fournisseur unique.
- Les modules Terraform réutilisables du chapitre 55 garantissent une configuration cloud cohérente à travers le projet.
- Le cloud public constitue un composant naturel de sauvegarde hors site pour le plan de reprise d'activité, à intégrer directement au chapitre 86.
- La gouvernance FinOps du chapitre 50 s'applique à l'échelle complète du projet, incluant étiquetage et alertes de budget.
- Les journaux d'activité cloud doivent être intégrés au SIEM comme toute autre source de sécurité critique.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. La stratégie cloud du projet final vise principalement à :
   - a) Adopter systématiquement le fournisseur cloud le moins cher disponible
   - b) Formaliser délibérément les choix cloud, évitant la dispersion déjà rencontrée aux chapitres 49-50
   - c) Éliminer complètement le besoin d'infrastructure cloud
   - d) Remplacer entièrement l'infrastructure locale existante

2. Le cloud public est particulièrement adapté à la sauvegarde hors site car il offre :
   - a) Une garantie automatique contre toute perte de données
   - b) Une séparation géographique naturelle par rapport aux sites physiques de l'entreprise
   - c) Un coût toujours inférieur au stockage local
   - d) Une dispense de tout test de restauration

3. Intégrer les journaux d'activité cloud au SIEM permet principalement de :
   - a) Réduire le coût des services cloud utilisés
   - b) Corréler un événement cloud avec d'autres sources pour révéler une compromission plus large
   - c) Remplacer le besoin d'IAM et de moindre privilège
   - d) Éliminer le besoin de gouvernance FinOps

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Chaque service cloud du projet final devrait être choisi selon sa pertinence spécifique, jamais par préférence générale pour un fournisseur unique. — **Vrai** (section 84.2).
2. Une sauvegarde cloud jamais testée en restauration offre la même garantie qu'une sauvegarde régulièrement vérifiée. — **Faux** (section "Erreur n°2").
3. La gouvernance FinOps établie au chapitre 50 ne s'applique qu'au portail client, pas aux nouveaux services cloud du projet final. — **Faux** (section 84.5).
4. Les journaux cloud consultables uniquement dans la console du fournisseur offrent la même valeur de détection qu'une intégration au SIEM. — **Faux** (section "Entretien technique", Q3).
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi le DSI, dans le scénario d'ouverture, insiste pour formaliser la stratégie cloud du projet final dès le départ, plutôt que de laisser chaque équipe décider au fil des besoins comme cela s'est produit par le passé.
2. Un collègue propose d'adopter GCP pour le nouveau composant de sauvegarde hors site, "pour diversifier les fournisseurs et réduire la dépendance à un seul acteur". Discute cette proposition à la lumière du choix déjà justifié au chapitre 48.

**Corrigé 1** : le DSI a directement vécu, aux chapitres 49-50, les conséquences d'une adoption cloud non gouvernée — une dispersion technologique découverte tardivement et une facturation inattendue. Formaliser la stratégie dès le départ du projet final permet d'éviter de reproduire ces mêmes conséquences à une échelle plus large (300 employés, quatre sites), où l'impact d'une dérive non maîtrisée serait proportionnellement plus significatif. Cette insistance illustre directement le principe du retour d'expérience déjà établi au chapitre 79 — une leçon apprise d'un incident passé (ici, une dérive de gouvernance plutôt qu'un incident de sécurité) alimentant une amélioration structurelle pour l'avenir, plutôt qu'un oubli qui laisserait le même problème se reproduire.

**Corrigé 2** : la proposition de diversifier les fournisseurs part d'une préoccupation légitime (éviter une dépendance excessive à un seul acteur), mais le chapitre 48 avait déjà explicitement écarté GCP pour cette même entreprise, précisément pour éviter la dispersion technologique qu'une multiplication de fournisseurs impliquerait — chaque fournisseur supplémentaire ajoutant une charge de compétence et de gouvernance distincte à maintenir. La diversification des risques pour la sauvegarde hors site peut être obtenue autrement, par exemple via plusieurs régions géographiques distinctes au sein du même fournisseur déjà maîtrisé (AWS), plutôt que par l'introduction d'un troisième fournisseur cloud entièrement nouveau pour l'équipe — un compromis répondant à la préoccupation de résilience sans reproduire la dispersion déjà écartée au chapitre 48.
</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 84.1</span>

Propose une politique de retention et de test pour la sauvegarde hors site cloud du projet final, en distinguant les données du siège et celles du nouveau site, en t'appuyant sur les principes de criticité différenciée déjà établis dans ce manuel.
</div>

**Corrigé :** Les données du siège, hébergeant les services les plus critiques (portail client, contrôleur de domaine principal), justifient une rétention étendue de 90 jours minimum avec un test de restauration trimestriel rigoureux, incluant une vérification complète de l'intégrité des données restaurées. Les données du nouveau site, de criticité moindre compte tenu de sa taille modeste et de sa dépendance déjà établie aux services centralisés du siège (section 81.5), pourraient justifier une rétention plus courte (30 à 60 jours) avec un test semestriel plutôt que trimestriel — un dimensionnement proportionné à la criticité réelle de ce site, reproduisant le même principe de proportionnalité déjà appliqué au choix de virtualisation par site au chapitre 81, appliqué ici à la politique de sauvegarde.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 84.2</span>

Rédige, en 3 à 5 phrases, une règle d'équipe garantissant qu'aucun nouveau service cloud n'est adopté pour le projet sans étiquetage systématique et intégration au SIEM dès son activation, en t'appuyant sur les erreurs décrites dans ce chapitre.
</div>

**Corrigé (exemple de réponse) :** Tout nouveau service cloud adopté dans le cadre du projet devra être étiqueté conformément à la convention déjà établie au chapitre 50 dès sa création, avant toute utilisation en production, sans exception pour un usage jugé temporaire ou expérimental. L'intégration des journaux d'activité de ce service au SIEM sera réalisée dans le même mouvement que son activation, plutôt que reportée à une phase de consolidation ultérieure. Toute demande d'adoption d'un nouveau service cloud ne respectant pas ces deux exigences sera refusée par défaut jusqu'à leur mise en conformité, garantissant que la gouvernance formalisée dans ce chapitre reste appliquée de façon systématique plutôt que ponctuelle.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je comprends pourquoi la stratégie cloud du projet final doit être formalisée dès le départ.</li>
<li>☐ Je sais synthétiser les choix cloud déjà justifiés dans ce manuel selon leur pertinence par service.</li>
<li>☐ Je sais concevoir une politique de sauvegarde hors site dans le cloud comme composant du PRA.</li>
<li>☐ Je sais appliquer la gouvernance FinOps à l'échelle complète d'un projet.</li>
<li>☐ Je comprends pourquoi les journaux cloud doivent être intégrés au SIEM.</li>
<li>☐ Je sais vérifier un composant cloud par rapport aux exigences du cahier des charges initial.</li>
</ul>

## FAQ

<dl class="faq">
<dt>Le nouveau site du projet final doit-il nécessairement s'appuyer sur le cloud, ou peut-il rester entièrement dépendant du siège ?</dt>
<dd>Le choix dépend du contexte réel de ce site, comme déjà établi à la section 81.5 — s'appuyer sur le VPN et les services du siège reste une option parfaitement valide, le cloud n'étant qu'une option supplémentaire à considérer selon les besoins réels qui se préciseront avec la croissance du site.</dd>

<dt>Faut-il tester la restauration de la sauvegarde cloud aussi fréquemment que les sauvegardes locales ?</dt>
<dd>Un test régulier reste nécessaire pour les deux, mais la fréquence peut être adaptée à la criticité relative — une sauvegarde hors site destinée spécifiquement à un scénario de sinistre majeur peut justifier un test moins fréquent qu'une sauvegarde locale utilisée pour des restaurations plus courantes, tout en restant testée au minimum une fois par trimestre pour les données critiques.</dd>

<dt>La gouvernance cloud formalisée dans ce chapitre remplace-t-elle le besoin d'ISO 27001 déjà établi au chapitre 72 ?</dt>
<dd>Non, elle s'inscrit dans le même cadre de gouvernance globale déjà établi — le composant cloud devrait être intégré à la déclaration d'applicabilité ISO 27001 existante, plutôt que traité comme un périmètre de conformité séparé.</dd>

<dt>Comment savoir si le budget cloud cible défini pour le projet reste réaliste dans la durée ?</dt>
<dd>Une révision périodique du budget, alimentée par les données réelles de consommation observées via le cycle FinOps déjà établi (chapitre 50), permet d'ajuster ce budget de façon informée plutôt que de le fixer une fois pour toutes sans jamais le revoir.</dd>
</dl>

## Références et pour aller plus loin

- AWS — Bonnes pratiques de sauvegarde et de reprise d'activité : rappel des chapitres 30-31 de ce manuel.
- FinOps Foundation — Framework FinOps : rappel du chapitre 50 de ce manuel.

*Chapitre suivant : la supervision et la sécurisation de bout en bout — consolider l'ensemble des outils de supervision et de sécurité déjà construits dans ce manuel en une vision cohérente couvrant l'intégralité de l'infrastructure du projet, des quatre sites physiques jusqu'au composant cloud de ce chapitre.*
