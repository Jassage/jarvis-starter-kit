<div class="chapitre-titre-num">CHAPITRE 43</div>

# Signatures numériques et authenticité

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : expliquer ce qu'est réellement une signature numérique et en quoi elle diffère fondamentalement d'une image de signature manuscrite insérée ; ajouter une ligne de signature à un document destiné à être signé ; comprendre le rôle d'un certificat numérique dans ce processus ; vérifier l'authenticité et l'intégrité d'un document signé numériquement ; et expliquer pourquoi toute modification postérieure invalide automatiquement une signature numérique.
</div>

**Matrice de compétences MOS**

Ce chapitre ne correspond à aucun objectif du référentiel MOS Word (MO-100/MO-101) : les signatures numériques n'apparaissent pas comme compétence isolée dans ce référentiel. Il reste couvert ici pour la complétude professionnelle du manuel, ce type de fonctionnalité étant de plus en plus demandé dans des contextes contractuels et administratifs. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 42 (protection des documents), dont ce chapitre prolonge la logique vers la vérification d'authenticité plutôt que la seule restriction d'accès.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le conseil d'administration de l'ONG doit valider formellement le rapport financier annuel avant sa transmission au bailleur de fonds. Un membre du conseil propose simplement de scanner sa signature manuscrite et de l'insérer comme image dans le document — une pratique très répandue mais qui n'apporte aucune garantie réelle : n'importe qui pourrait copier cette image et l'apposer sur un tout autre document. Ta responsable veut comprendre s'il existe une méthode plus fiable pour authentifier réellement l'origine et l'intégrité du rapport final.
</div>

## 43.1 Ce qu'est réellement une signature numérique

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la distinction essentielle de ce chapitre</span>
Une image de signature manuscrite scannée et collée dans un document n'est qu'une <strong>image</strong> comme une autre (chapitre 21) : elle ne prouve rien techniquement, peut être copiée sur n'importe quel autre document, et ne détecte aucune modification ultérieure du texte. Une véritable <strong>signature numérique</strong> repose sur un <strong>certificat</strong> cryptographique associé à une identité vérifiée, et surtout, elle <strong>se lie mathématiquement</strong> au contenu exact du document au moment de la signature — toute modification, même d'un seul caractère, après la signature, invalide immédiatement et automatiquement cette signature.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Une image de signature scannée est comme un tampon en caoutchouc : n'importe qui possédant une copie peut l'apposer sur n'importe quel document, authentique ou non. Une signature numérique est plutôt comme un cachet de cire scellé sur une enveloppe fermée : toute tentative d'ouvrir puis de refermer l'enveloppe après coup laisse une trace visible et détectable, révélant immédiatement que le contenu a pu être altéré depuis le scellement d'origine.
</div>

## 43.2 Ajouter une ligne de signature

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 132 — Préparer le rapport pour la signature du conseil</span>

**Objectif** : créer l'emplacement visuel où la signature numérique viendra s'insérer.

**Préparation** : ouvre le document du rapport financier de test.

**Étapes détaillées** :
1. Place le point d'insertion à l'endroit prévu pour la signature (généralement en fin de document).
2. Onglet **Insertion**, groupe Texte, clique sur **Ligne de signature**, puis **"Ligne de signature Microsoft Office"**.
3. Renseigne le nom du signataire suggéré, son titre, et éventuellement son adresse e-mail dans la boîte de dialogue.
4. Coche éventuellement **"Autoriser le signataire à ajouter des commentaires"** (pour une remarque accompagnant la signature) ou **"Afficher la date de signature"**.
5. Valide : une ligne de signature visuelle s'insère dans le document, avec un espace réservé et une croix indicative.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Cette ligne de signature est un <strong>espace réservé visuel</strong>, pas encore une signature réelle — elle indique simplement où et par qui le document devra être signé. La signature elle-même n'intervient qu'à l'étape suivante.
</div>

## 43.3 Apposer une signature numérique

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Signer numériquement le document</span>

1. Double-clique sur la ligne de signature créée à l'atelier 132 (ou clique droit dessus > "Signer").
2. Word demande de sélectionner un **certificat numérique** installé sur l'ordinateur — un identifiant cryptographique délivré par une autorité de certification reconnue, ou un certificat auto-signé pour un usage interne moins formel.
3. Une fois le certificat sélectionné et la signature validée, la ligne affiche visuellement une marque de signature, et le document devient automatiquement en **lecture seule** — toute tentative de modification ultérieure sera immédiatement détectable (section 43.5).
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — l'obtention d'un certificat numérique</span>
Contrairement à une simple image de signature, un certificat numérique fiable et reconnu nécessite généralement une démarche auprès d'une autorité de certification (payante, avec vérification d'identité) pour un usage juridiquement opposable — un certificat auto-signé, gratuit et rapide à créer, reste utile pour un usage interne à une organisation mais n'offre pas la même reconnaissance officielle qu'un certificat délivré par un tiers de confiance.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Cabinet juridique</span>
Un cabinet juridique signant numériquement ses conclusions avant leur dépôt auprès d'une juridiction utilise un certificat délivré par une autorité de certification reconnue, garantissant une valeur probante à la signature en cas de contestation ultérieure sur l'authenticité ou l'intégrité du document déposé.
</div>

## 43.4 Vérifier l'authenticité d'un document signé

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Vérifier une signature reçue</span>

1. À l'ouverture d'un document signé numériquement, une icône de ruban rouge apparaît dans la barre d'état, et un bandeau peut signaler "Ce document a été marqué comme final et signé".
2. Onglet Fichier, Informations, la section **"Signatures"** liste chaque signature apposée, avec le nom du signataire et la date.
3. Cliquer sur une signature dans cette liste affiche les détails du certificat utilisé — l'autorité qui l'a délivré, sa date de validité — permettant de juger du niveau de confiance à accorder à cette signature.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Avant d'accorder une confiance importante à un document signé numériquement (un contrat, un rapport officiel), toujours vérifier les détails du certificat plutôt que de se fier uniquement à la présence visuelle d'une ligne de signature — un certificat expiré ou délivré par une autorité non reconnue affaiblit considérablement la valeur de la signature.
</div>

## 43.5 Pourquoi toute modification invalide la signature

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la propriété de sécurité la plus importante de ce chapitre</span>
Une signature numérique est mathématiquement calculée à partir du contenu exact du document au moment de la signature. Modifier ne serait-ce qu'un seul caractère après coup change ce contenu, ce qui rend le calcul de vérification incohérent avec la signature enregistrée — Word affiche alors immédiatement un avertissement indiquant que la signature n'est plus valide, révélant que le document a été altéré depuis sa signature d'origine.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce que cela implique concrètement</span>
Si une correction doit être apportée à un document déjà signé numériquement, il n'existe qu'une seule méthode correcte : retirer la signature existante, effectuer la correction, puis faire re-signer le document par la ou les personnes concernées — jamais modifier le contenu en espérant que la signature reste valide, ce qui est techniquement impossible.
</div>

## 43.6 Signature numérique contre image de signature scannée

| Critère | Signature numérique | Image de signature scannée |
|---|---|---|
| Détecte une modification postérieure du document | Oui, automatiquement | Non, jamais |
| Peut être copiée sur un autre document | Non (liée mathématiquement au contenu signé) | Oui, facilement |
| Nécessite un certificat | Oui | Non |
| Valeur juridique reconnue | Élevée (selon le certificat utilisé) | Faible à nulle |
| Simplicité de mise en œuvre | Modérée (obtention du certificat) | Très simple |

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — la réponse à la mise en situation d'ouverture</span>
La proposition initiale du membre du conseil (scanner sa signature manuscrite) reste une pratique courante et simple, mais elle n'offre <strong>aucune</strong> des garanties recherchées par ta responsable : ni preuve d'authenticité fiable, ni détection de modification ultérieure. Une vraie signature numérique, bien que plus exigeante à mettre en place, répond précisément à ce besoin de garantie réelle.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Tester la détection d'altération</span>
Crée un document de test, ajoute une ligne de signature, signe-le avec un certificat auto-signé (Windows permet d'en créer un facilement via des outils de développement, ou utilise un certificat de test si disponible sur ton poste). Modifie ensuite une seule lettre du texte après la signature, puis rouvre le document pour observer concrètement l'avertissement d'invalidité qui apparaît.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Considérer une image de signature scannée comme une preuve d'authenticité</span>
Comme signalé en section 43.6, une image de signature n'offre aucune des garanties techniques d'une vraie signature numérique, malgré son apparence visuelle similaire et sa simplicité d'usage.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Modifier un document après signature en espérant que la signature reste valide</span>
Comme signalé en section 43.5, cette modification invalide automatiquement et systématiquement la signature — il n'existe aucun moyen de modifier un document signé sans invalider sa signature d'origine.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Faire confiance à une signature sans vérifier les détails du certificat</span>
Comme signalé en section 43.4, la présence visuelle d'une ligne de signature ne garantit rien en soi — un certificat expiré, révoqué ou délivré par une autorité non fiable affaiblit considérablement la valeur réelle de la signature, une vérification que beaucoup d'utilisateurs négligent par excès de confiance visuelle.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : Word indique qu'une signature n'est plus valide</span>

- **Diagnostic** : le document a très probablement été modifié après sa signature, invalidant celle-ci de façon irréversible (section 43.5).
- **Résolution** : contacter le signataire d'origine pour qu'il examine et, si les modifications sont légitimes, re-signe une nouvelle version du document après retrait de l'ancienne signature.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : aucun certificat numérique disponible pour signer un document</span>

- **Diagnostic** : aucun certificat n'est installé sur le poste, une situation fréquente sur un ordinateur n'ayant jamais eu besoin de cette fonctionnalité auparavant.
- **Résolution** : Word propose généralement un lien vers des services partenaires permettant d'obtenir un certificat numérique reconnu, ou un certificat auto-signé peut être créé pour un usage interne moins formel selon les besoins réels.
</div>

## En entreprise

- **Bonne pratique répandue** : réserver les signatures numériques réelles aux documents à valeur contractuelle ou officielle importante, une simple image de signature restant acceptable pour des usages informels sans enjeu de preuve.
- **Bonne pratique répandue** : toujours vérifier les détails d'un certificat avant d'accorder une confiance importante à un document signé reçu d'un tiers.
- **Erreur classique observée** : des organisations continuant à utiliser exclusivement des images de signature scannées pour des documents à fort enjeu (contrats, validations officielles), sans réaliser l'absence totale de garantie technique que cela implique.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — signatures numériques invisibles</span>
Au-delà de la ligne de signature visible (section 43.2), Word permet aussi d'ajouter une **signature numérique invisible** (Fichier > Informations > Protéger le document > "Ajouter une signature numérique"), sans emplacement visuel dans le document lui-même mais offrant les mêmes garanties cryptographiques de détection d'altération — utile pour authentifier un document sans en modifier l'apparence visuelle.
</div>

## Résumé du chapitre

- Une signature numérique repose sur un certificat cryptographique lié mathématiquement au contenu exact du document, contrairement à une simple image de signature scannée qui n'offre aucune garantie technique.
- Une ligne de signature s'insère comme espace réservé visuel, la signature réelle nécessitant ensuite un certificat numérique.
- Vérifier une signature reçue implique d'examiner les détails du certificat, pas seulement la présence visuelle d'une ligne de signature.
- Toute modification du document après signature invalide automatiquement celle-ci, une propriété de sécurité fondamentale qu'aucune image de signature ne peut offrir.
- Le choix entre signature numérique et image scannée dépend de l'enjeu réel du document — contractuel et officiel pour la première, informel pour la seconde.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Une image de signature manuscrite scannée :
   - a) Offre les mêmes garanties qu'une signature numérique
   - b) Peut être copiée sur n'importe quel autre document sans détection
   - c) Invalide automatiquement toute modification ultérieure
   - d) Nécessite un certificat numérique

2. Une signature numérique devient invalide si :
   - a) Le document est simplement ouvert en lecture
   - b) Le document est modifié après la signature
   - c) Le document est imprimé
   - d) Le document est renommé

3. Pour vérifier la fiabilité d'une signature numérique reçue, il faut :
   - a) Se fier uniquement à la présence visuelle de la ligne de signature
   - b) Examiner les détails du certificat utilisé
   - c) Ouvrir le document dans Word Online uniquement
   - d) Contacter Microsoft directement

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Une signature numérique est liée mathématiquement au contenu exact du document au moment de la signature. — **Vrai**.
2. Un document signé numériquement peut être modifié librement sans que la signature ne soit affectée. — **Faux**.
3. Une ligne de signature Microsoft Office constitue à elle seule une vraie signature, sans certificat. — **Faux**, c'est un espace réservé visuel seulement.
4. Un certificat numérique peut expirer. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi une image de signature scannée n'apporte aucune garantie technique réelle, contrairement à une signature numérique.
2. Un document signé numériquement doit finalement être corrigé d'une erreur mineure. Quelle est la procédure correcte à suivre ?

**Corrigé 1** : une image de signature est un simple fichier graphique (chapitre 21) sans lien technique avec le contenu du document — elle peut être copiée et collée sur n'importe quel autre fichier, et sa présence ne détecte en rien si le texte environnant a été modifié après son insertion. Une signature numérique, elle, résulte d'un calcul cryptographique portant sur le contenu exact du document au moment de la signature, rendant toute modification ultérieure immédiatement détectable.

**Corrigé 2** : retirer la signature numérique existante, effectuer la correction nécessaire dans le document, puis faire re-signer une nouvelle fois le document (par la même personne ou les mêmes personnes concernées) — il est techniquement impossible de modifier un document déjà signé sans invalider sa signature d'origine, aucun raccourci ne permettant de contourner cette propriété de sécurité.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 43.1</span>

Sur un document de test, insère une ligne de signature Microsoft Office avec le nom d'un signataire fictif et son titre, en cochant l'affichage de la date de signature.
</div>

**Corrigé :** réussi si la ligne de signature s'affiche correctement avec le nom, le titre et l'espace pour la date, prête à recevoir une signature réelle.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 43.2</span>

Rédige, en tes propres mots, un court argumentaire (5 à 6 phrases) destiné à un collègue convaincu qu'une image de signature scannée suffit amplement pour tous les documents de son organisation, en t'appuyant sur au moins deux différences concrètes de ce chapitre.
</div>

**Corrigé :** réponse personnelle ; un bon argumentaire mentionne au minimum l'absence de détection d'altération et le risque de copie non autorisée d'une simple image de signature, comparés aux garanties cryptographiques réelles d'une signature numérique.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais expliquer la différence fondamentale entre signature numérique et image de signature scannée.</li>
<li>☐ J'ajoute une ligne de signature à un document destiné à être signé.</li>
<li>☐ Je comprends le rôle d'un certificat numérique dans le processus de signature.</li>
<li>☐ Je vérifie les détails d'un certificat avant d'accorder confiance à une signature reçue.</li>
<li>☐ Je sais que toute modification après signature invalide automatiquement celle-ci.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Signature numérique** ≠ **image scannée** : seule la première détecte une altération et résiste à la copie.
- **Ligne de signature** = espace réservé visuel, pas une signature réelle en soi.
- **Certificat** = élément indispensable, à vérifier (validité, autorité) avant toute confiance importante.
- **Toute modification après signature** = invalide automatiquement, sans exception.

Aucun raccourci clavier dédié : toutes les commandes passent par l'onglet Insertion ou Fichier > Informations.
</div>

## FAQ

<dl class="faq">
<dt>Un certificat auto-signé a-t-il une valeur juridique ?</dt>
<dd>Limitée : il prouve techniquement qu'un document n'a pas été modifié depuis sa signature, mais sans l'identité vérifiée par un tiers de confiance qu'offre un certificat délivré par une véritable autorité de certification reconnue.</dd>

<dt>Plusieurs personnes peuvent-elles signer numériquement le même document ?</dt>
<dd>Oui, plusieurs lignes de signature distinctes peuvent être ajoutées et signées successivement, chacune apparaissant dans la liste des signatures de Fichier > Informations.</dd>

<dt>Une signature numérique fonctionne-t-elle de la même façon dans Word Online ?</dt>
<dd>La création et la vérification de signatures numériques restent plus limitées dans Word Online que dans Word Desktop, cohérent avec les différences déjà signalées au chapitre 1 et approfondies au chapitre 48.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les signatures numériques dans Office : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101), confirmant l'absence d'objectif pour ce chapitre : voir `assets/mos-objectifs.md` dans ce manuel.
- Protection et restriction de modification, complémentaires à l'authenticité : chapitre 42.

*Chapitre suivant : impression avancée — pour finaliser la production physique d'un document, une fois sa protection et son authenticité assurées.*
