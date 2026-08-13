<div class="chapitre-titre-num">CHAPITRE 45</div>

# Export PDF et autres formats

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : distinguer "Enregistrer sous PDF" (chapitre 5) de la commande Exporter, plus riche en options ; configurer les options avancées d'un export PDF (plage de pages, signets automatiques, balises de structure pour l'accessibilité) ; choisir le format PDF/A pour un archivage à long terme ; convertir un PDF existant en document Word modifiable, en connaissant les limites de cette conversion ; et mener à bien le mini-projet de fin de Partie 11 combinant protection, signature, impression et export.
</div>

**Matrice de compétences MOS**

Ce chapitre approfondit l'objectif MOS Associate 1.3.1 (enregistrer dans des formats alternatifs), déjà crédité au chapitre 5, sans introduire de nouvel objectif propre au référentiel — les options avancées d'export PDF détaillées ici (balises de structure, signets, PDF/A) dépassent le périmètre strictement testé par l'examen, mais restent essentielles pour une utilisation professionnelle complète du format. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 5 (formats de fichiers de base), dont ce chapitre approfondit spécifiquement le cas du PDF.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Le rapport annuel de l'ONG, désormais protégé (chapitre 42) et signé (chapitre 43), doit être exporté en PDF pour le bailleur de fonds — mais ta responsable veut cette fois un PDF avec des signets de navigation reflétant la table des matières (chapitre 28), et s'interroge sur la meilleure façon d'archiver ce même rapport pour qu'il reste lisible dans vingt ans. Elle a aussi reçu, d'un partenaire, un vieux rapport uniquement disponible en PDF, dont elle voudrait réutiliser certains passages dans Word. Ce chapitre répond à ces trois besoins.
</div>

## 45.1 Enregistrer sous PDF contre Exporter

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — le rappel du chapitre 5</span>
Le chapitre 5 a déjà montré comment enregistrer un document en PDF via Fichier > Enregistrer sous > type "PDF". La commande <strong>Fichier > Exporter > Créer un document PDF/XPS</strong> aboutit au même résultat final, mais expose directement un bouton **"Options..."** donnant accès à des réglages plus fins, détaillés dans ce chapitre, sans devoir les chercher séparément.
</div>

## 45.2 Options avancées d'export PDF

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 137 — Exporter le rapport avec des signets de navigation</span>

**Objectif** : répondre à la première demande de la mise en situation d'ouverture.

**Préparation** : reprends le rapport annuel de test, avec ses titres correctement stylés (chapitre 9) et sa table des matières (chapitre 28).

**Étapes détaillées** :
1. Onglet Fichier, **Exporter**, **"Créer un document PDF/XPS"**, puis **"Créer un PDF/XPS"**.
2. Avant de valider l'emplacement d'enregistrement, clique sur **"Options..."**.
3. Sous **"Options de signets"**, coche **"Signets"**, puis choisis **"Titres"** plutôt que "Signets Word" — Word génère alors automatiquement, dans le PDF final, un panneau de navigation latéral reflétant fidèlement la hiérarchie des titres du document (exactement comme le volet de navigation du chapitre 6, mais cette fois dans le PDF lui-même).
4. Sous **"Inclure des informations non imprimables"**, vérifie les cases **"Propriétés du document"** (à décocher si une inspection préalable, chapitre 42, a déjà nettoyé les métadonnées sensibles) et **"Balises de structure du document pour l'accessibilité"** (à toujours cocher, approfondi au chapitre 46).
5. Valide les options, puis clique sur **Publier** (ou Enregistrer).
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Les balises de structure, un pont vers le chapitre 46</span>
Les balises de structure ne sont pas visibles à l'œil dans le PDF final, mais elles permettent à un lecteur d'écran de comprendre la hiérarchie du document (quel texte est un titre, quel texte est un tableau) — exactement le même principe d'accessibilité que celui déjà évoqué pour le texte de remplacement des images au chapitre 21, approfondi dans son ensemble au chapitre 46.
</div>

## 45.3 PDF/A pour l'archivage à long terme

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Le format **PDF/A** est une variante normalisée (ISO 19005) du PDF standard, spécifiquement conçue pour l'<strong>archivage à long terme</strong> : elle interdit certains éléments qui pourraient devenir illisibles avec le temps (polices non intégrées au fichier, liens vers un contenu externe qui pourrait disparaître), garantissant qu'un document reste fidèlement consultable des décennies plus tard, indépendamment de l'évolution des logiciels.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Exporter au format PDF/A</span>

1. Dans la même boîte de dialogue **"Options"** de l'export PDF (section 45.2), coche **"Conforme ISO 19005-1 (PDF/A)"**.
2. Ce réglage peut légèrement augmenter la taille du fichier final (les polices doivent être intégrées plutôt que simplement référencées), un compromis acceptable pour un usage d'archivage plutôt que de diffusion courante.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — pas d'objectif spécifique, prolongement de 1.3.1</span>
Cette procédure répond à la deuxième demande de la mise en situation d'ouverture, sans correspondre à un objectif isolé du référentiel — un choix éditorial professionnel plutôt qu'une compétence testée à l'examen.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — Administration</span>
Une administration publique tenue à des obligations légales d'archivage de plusieurs décennies pour certains types de documents officiels utilise systématiquement le format PDF/A pour toute version définitive archivée, garantissant leur lisibilité future indépendamment des évolutions technologiques ultérieures.
</div>

## 45.4 Convertir un PDF existant en document Word modifiable

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 138 — Réutiliser le contenu d'un ancien rapport PDF</span>

**Objectif** : répondre à la troisième demande de la mise en situation d'ouverture.

**Préparation** : dispose d'un fichier PDF de test contenant du texte (pas uniquement des images scannées).

**Étapes détaillées** :
1. Onglet Fichier, **Ouvrir**, navigue jusqu'au fichier PDF et sélectionne-le directement (Word accepte les fichiers `.pdf` dans sa boîte de dialogue d'ouverture, pas seulement les `.docx`).
2. Un message avertit que Word va convertir le PDF en document modifiable, avec un avertissement que la mise en page pourrait ne pas être parfaitement fidèle à l'original. Clique sur **OK**.
3. Le contenu s'ouvre comme un document Word normal, modifiable avec tous les outils de ce manuel — mais examine attentivement la mise en page, en particulier les tableaux et la disposition des colonnes, qui peuvent avoir été réinterprétés de façon imparfaite.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — une conversion jamais parfaite</span>
Un PDF n'est pas nativement structuré comme un document Word (chapitre 1, sur l'architecture DOCX) : sa conversion reste une reconstitution approximative, particulièrement fragile sur des mises en page complexes (colonnes, tableaux imbriqués, polices non standards). Un PDF composé uniquement d'images scannées (sans couche de texte réelle) ne peut être converti qu'en recourant à une reconnaissance optique de caractères (OCR), une technologie distincte non couverte par la conversion native de Word.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
Après conversion d'un PDF, toujours relire attentivement la mise en page obtenue plutôt que de faire confiance aveuglément au résultat — un tableau mal reconstitué ou un saut de ligne intempestif peut facilement passer inaperçu sans une vérification manuelle.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Produire une chaîne d'export complète</span>
Sur un document de test structuré avec des titres et une table des matières (chapitre 28), exporte-le en PDF avec signets de navigation basés sur les titres, en cochant les balises de structure d'accessibilité. Exporte une seconde fois le même document en PDF/A pour archivage. Compare visuellement les deux fichiers obtenus dans un lecteur PDF, en vérifiant la présence du panneau de signets latéral.
</div>

## Mini-projet de fin de partie

<div class="encadre exercice">
<span class="encadre-titre">🏗️ Mini-projet — Finaliser et diffuser un document professionnel complet</span>

**Contexte** : ce mini-projet combine l'intégralité de la Partie 11 (chapitres 42 à 45) en une chaîne complète de finalisation documentaire, de la protection à la diffusion.

**Objectif** : préparer, pour une organisation fictive de ton choix, un document de test d'au moins cinq pages prêt à être diffusé en toute sécurité et de façon professionnelle.

**Livrables attendus** :
1. Une **inspection du document** (chapitre 42) confirmant l'absence de propriétés personnelles ou de commentaires internes résiduels.
2. Une **restriction de modification** (chapitre 42) limitant le document aux commentaires uniquement, avec mot de passe.
3. Une **ligne de signature** (chapitre 43) ajoutée en fin de document, avec une explication écrite de la différence entre cette signature et une simple image scannée.
4. Une **configuration d'impression** documentée (chapitre 44) : nombre de copies, recto verso avec le bon type de retournement pour ce document précis.
5. Un **export PDF** (ce chapitre) avec signets de navigation basés sur les titres et balises de structure activées pour l'accessibilité.

**Critères de réussite** : le PDF final s'ouvre correctement avec un panneau de signets fonctionnel ; le document Word source ne permet plus de modification directe du texte (seuls les commentaires restent possibles) ; aucune information personnelle résiduelle n'est détectée par une seconde passe de l'Inspecteur de document.

**Format de restitution suggéré** : le document Word protégé, accompagné du fichier PDF exporté et d'un court compte rendu des choix de configuration effectués à chaque étape.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Confondre "Enregistrer sous PDF" et "Exporter" en pensant qu'ils diffèrent fondamentalement</span>
Comme signalé en section 45.1, les deux aboutissent au même résultat final ; la commande Exporter n'est qu'un chemin d'accès plus direct aux options avancées, pas une fonctionnalité radicalement différente.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Oublier les balises de structure pour un document destiné à un public large</span>
Comme signalé en section 45.2, ce réglage invisible à l'écran mais essentiel pour l'accessibilité est parfois négligé faute d'un rappel explicite au moment de l'export — un oubli qui exclut de fait les lecteurs utilisant une technologie d'assistance.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Faire confiance aveuglément à une conversion PDF vers Word sans relecture</span>
Comme signalé dans l'atelier 138, une mise en page complexe se reconstitue rarement de façon parfaite — ne jamais présumer que le résultat est fidèle sans une vérification manuelle attentive.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : les signets n'apparaissent pas dans le PDF exporté</span>

- **Diagnostic** : l'option "Signets" n'a probablement pas été cochée dans la boîte de dialogue Options avant l'export, ou le document ne contient aucun style de titre réel (rappel du chapitre 9 sur la mise en forme manuelle qui imite un titre sans en être un).
- **Résolution** : vérifier que les titres utilisent bien de vrais styles Word, puis relancer l'export en cochant explicitement "Signets" > "Titres" dans les options.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : un PDF converti en Word affiche un texte totalement désorganisé</span>

- **Diagnostic** : le PDF source contenait probablement une mise en page particulièrement complexe (colonnes multiples, tableaux imbriqués) que la conversion automatique ne peut reconstituer fidèlement.
- **Résolution** : accepter de retravailler manuellement la mise en page après conversion, ou envisager de retaper le contenu textuel directement plutôt que de compter sur une conversion parfaite.
</div>

## En entreprise

- **Bonne pratique répandue** : toujours activer les balises de structure d'accessibilité pour tout PDF destiné à une diffusion publique ou institutionnelle, une exigence de plus en plus réglementaire dans de nombreux contextes.
- **Bonne pratique répandue** : réserver le format PDF/A aux documents à valeur d'archive de long terme, le PDF standard restant suffisant pour une diffusion courante à durée de vie plus limitée.
- **Erreur classique observée** : des PDF professionnels sans aucun signet de navigation sur des documents de plusieurs dizaines de pages, obligeant le lecteur à faire défiler manuellement pour retrouver une section précise.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — réduire la taille du fichier PDF pour un envoi par e-mail</span>
La boîte de dialogue Options d'export PDF propose un choix entre **"Standard (publication en ligne et impression)"** et **"Taille minimale (publication en ligne)"** — cette seconde option compresse davantage les images intégrées (rappel du chapitre 21 sur la compression d'images), produisant un fichier nettement plus léger, adapté à un envoi par e-mail dont la taille de pièce jointe serait autrement pénalisante.
</div>

## Résumé du chapitre

- Exporter en PDF (Fichier > Exporter) aboutit au même résultat qu'Enregistrer sous PDF (chapitre 5), avec un accès plus direct aux options avancées.
- Les signets basés sur les titres reproduisent, dans le PDF, la navigation par titres déjà vue au chapitre 6 et à la table des matières du chapitre 28.
- Les balises de structure, invisibles à l'écran, rendent le PDF exploitable par une technologie d'assistance — un prolongement direct du chapitre 46.
- Le format PDF/A convient à l'archivage de long terme, garantissant une lisibilité future indépendante de l'évolution des logiciels.
- Convertir un PDF existant en document Word reste une reconstitution approximative, à toujours vérifier attentivement plutôt que de faire confiance aveuglément au résultat.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Les signets d'un PDF basés sur "Titres" reflètent :
   - a) Les commentaires du document
   - b) La hiérarchie des styles de titre du document
   - c) Les propriétés du fichier
   - d) Les images insérées

2. Le format PDF/A est spécifiquement conçu pour :
   - a) La diffusion rapide par e-mail
   - b) L'archivage à long terme
   - c) L'impression en couleur uniquement
   - d) La coédition en temps réel

3. Convertir un PDF existant en document Word :
   - a) Produit toujours une reconstitution parfaite
   - b) Reste une reconstitution approximative, à vérifier
   - c) Est impossible techniquement
   - d) Nécessite obligatoirement un logiciel tiers

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. "Enregistrer sous PDF" et "Exporter en PDF" produisent des fichiers fondamentalement différents. — **Faux**, le résultat final est identique.
2. Les balises de structure d'un PDF sont visibles à l'œil dans le document. — **Faux**, elles restent invisibles mais lues par les technologies d'assistance.
3. Le format PDF/A interdit certains éléments comme les polices non intégrées, pour garantir une lisibilité future. — **Vrai**.
4. Un PDF composé uniquement d'images scannées se convertit en texte modifiable sans aucune technologie supplémentaire. — **Faux**, une reconnaissance optique de caractères (OCR) serait nécessaire.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi les signets d'un PDF basés sur "Titres" ne fonctionnent que si le document source utilise de vrais styles de titre.
2. Une organisation reçoit un ancien rapport uniquement en PDF et veut en réutiliser certains passages dans un nouveau rapport Word. Quelle procédure lui recommandes-tu, et quelle précaution prendre après la conversion ?

**Corrigé 1** : les signets basés sur "Titres" analysent la structure réelle du document via ses styles de titre (chapitre 9), exactement comme la table des matières automatique (chapitre 28) ou le volet de navigation (chapitre 6) — un texte simplement agrandi et mis en gras sans vrai style de titre reste invisible à cette analyse structurelle, et n'apparaîtra donc jamais dans le panneau de signets du PDF.

**Corrigé 2** : ouvrir directement le fichier PDF depuis Fichier > Ouvrir dans Word (section 45.4), qui convertira automatiquement le contenu en document modifiable — après cette conversion, toujours relire attentivement la mise en page obtenue, en particulier les tableaux et la disposition du texte, qui peuvent avoir été reconstitués de façon imparfaite par rapport à l'apparence du PDF original.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 45.1</span>

Sur un document de test avec au moins trois niveaux de titres, exporte-le en PDF avec l'option "Signets" > "Titres" activée, puis ouvre le PDF résultant dans un lecteur PDF pour vérifier la présence et la structure du panneau de navigation.
</div>

**Corrigé :** réussi si le panneau de signets du PDF reflète fidèlement la hiérarchie des titres du document Word source, permettant une navigation directe vers chaque section en cliquant sur un signet.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 45.2</span>

Exporte ce même document une seconde fois, cette fois en cochant l'option PDF/A, puis compare la taille des deux fichiers obtenus (standard contre PDF/A).
</div>

**Corrigé :** réponse personnelle ; réussi si l'élève constate et explique correctement une différence de taille de fichier entre les deux versions, liée à l'intégration complète des polices exigée par le format PDF/A.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je distingue "Enregistrer sous PDF" d'"Exporter en PDF" et leurs options respectives.</li>
<li>☐ J'exporte un PDF avec des signets de navigation basés sur les titres.</li>
<li>☐ J'active les balises de structure pour l'accessibilité d'un PDF exporté.</li>
<li>☐ Je choisis le format PDF/A pour un document destiné à l'archivage long terme.</li>
<li>☐ Je convertis un PDF existant en document Word, en vérifiant attentivement le résultat.</li>
<li>☐ J'ai mené à bien le mini-projet combinant l'ensemble de la Partie 11.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Exporter en PDF** = même résultat qu'Enregistrer sous PDF, accès plus direct aux options avancées.
- **Signets "Titres"** = nécessite de vrais styles de titre, comme la table des matières (chapitre 28).
- **Balises de structure** = invisibles, essentielles pour l'accessibilité (chapitre 46).
- **PDF/A** = archivage long terme, polices intégrées obligatoires.
- **Conversion PDF → Word** = toujours approximative, à vérifier manuellement.

Aucun raccourci clavier dédié : toutes les commandes passent par Fichier > Exporter ou Fichier > Ouvrir.
</div>

## FAQ

<dl class="faq">
<dt>Un PDF exporté avec restriction de modification (chapitre 42) conserve-t-il cette protection ?</dt>
<dd>Le PDF lui-même dispose de ses propres mécanismes de protection, distincts de ceux de Word ; une restriction Word ne se transfère pas automatiquement au PDF, qui nécessite ses propres réglages de sécurité si une protection équivalente est recherchée dans le fichier PDF final.</dd>

<dt>Peut-on exporter uniquement certaines pages d'un document en PDF ?</dt>
<dd>Oui, la boîte de dialogue d'export PDF propose un champ "Pages" permettant de spécifier une plage précise, similaire au réglage déjà vu pour l'impression au chapitre 44.</dd>

<dt>Le format PDF/A est-il compatible avec tous les lecteurs PDF ?</dt>
<dd>Oui, un fichier PDF/A reste un PDF standard lisible par n'importe quel lecteur PDF courant ; seules ses contraintes de création (polices intégrées, pas de contenu externe) le distinguent d'un PDF ordinaire, sans affecter sa compatibilité de lecture.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur l'export PDF et les formats de fichiers : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Accessibilité des documents dans son ensemble, prolongée par les balises de structure PDF : chapitre 46.

*Chapitre suivant : la Partie 12 s'ouvre sur l'accessibilité des documents, en abordant dans son ensemble un sujet déjà entrevu à plusieurs reprises (texte de remplacement, balises de structure) depuis le début de ce manuel.*
