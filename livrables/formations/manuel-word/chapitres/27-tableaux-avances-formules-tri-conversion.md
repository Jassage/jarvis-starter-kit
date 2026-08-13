<div class="chapitre-titre-num">CHAPITRE 27</div>

# Tableaux avancés : formules, tri, conversion texte ↔ tableau

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : convertir un texte structuré (séparé par tabulations ou virgules) directement en tableau ; convertir un tableau existant en texte, en choisissant le séparateur adapté ; trier les données d'un tableau selon un ou plusieurs critères ; insérer une formule simple dans un tableau pour calculer une somme ou une moyenne ; et comprendre les limites réelles du calcul dans un tableau Word comparé à un vrai classeur Excel.
</div>

**Matrice de compétences MOS**

| Compétence traitée dans ce chapitre | Domaine MOS | Code |
|---|---|---|
| Convertir du texte en tableau | MO-100 Word Associate — Manage Tables and Lists | 3.1.1 |
| Convertir un tableau en texte | MO-100 Word Associate — Manage Tables and Lists | 3.1.2 |
| Trier les données d'un tableau | MO-100 Word Associate — Manage Tables and Lists | 3.2.1 |

Ce chapitre clôt la Partie 7 en couvrant les trois derniers objectifs du domaine MOS **3. Manage Tables and Lists**. Les formules de tableau, elles, ne correspondent à aucun objectif du référentiel (comme les graphiques du chapitre 24, cette compétence relève davantage du référentiel Excel) mais restent couvertes ici pour la complétude du manuel. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 26 (création et mise en forme de base des tableaux).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
Un collègue de l'ONG a rédigé la liste des dépenses du mois directement en texte, une ligne par dépense avec le montant séparé par une tabulation, sans jamais utiliser de tableau. Ta responsable te demande de transformer cela en un vrai tableau, de le trier par montant décroissant pour identifier rapidement les postes les plus coûteux, et d'ajouter une ligne de total calculé automatiquement — sans ressaisir un seul chiffre à la main. Ce chapitre couvre exactement ce scénario, de bout en bout.
</div>

## 27.1 Convertir du texte en tableau

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 78 — Transformer la liste du collègue en tableau</span>

**Objectif** : répondre à la première demande de la mise en situation, sans ressaisir les données.

**Préparation** : tape (ou colle) un texte de test structuré ainsi, une ligne par dépense, avec une **tabulation** entre le libellé et le montant :
```
Fournitures scolaires	450
Transport	280
Communication	120
Frais bancaires	65
```

**Étapes détaillées** :
1. Sélectionne l'intégralité de ce texte.
2. Onglet **Insertion**, groupe Tableaux, clique sur **Tableau**, puis **"Convertir le texte en tableau..."**.
3. Word détecte automatiquement le nombre de colonnes nécessaires en analysant le séparateur : vérifie que **"Tabulations"** est bien sélectionné sous "Séparer le texte au niveau des", puis clique sur **OK**.

**Résultat attendu** : un vrai tableau de deux colonnes et quatre lignes, chaque libellé et son montant correctement répartis dans des cellules distinctes, sans avoir retapé une seule valeur.

**Dépannage** : si les colonnes ne se séparent pas correctement, vérifie que le texte source utilise bien un séparateur **cohérent** sur toutes les lignes (uniquement des tabulations, jamais un mélange de tabulations et d'espaces) — une incohérence de séparateur est la cause la plus fréquente d'une conversion ratée.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.1.1 Convert text to tables (MO-100 Associate)</span>
L'atelier 78 correspond exactement à cet objectif. **Recommandation** : s'entraîner aussi avec un texte séparé par des virgules plutôt que des tabulations (un format d'export courant depuis certains systèmes), en sélectionnant l'option "Virgules" plutôt que "Tabulations" dans la même boîte de dialogue.
</div>

## 27.2 Convertir un tableau en texte

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Extraire le contenu d'un tableau en texte simple</span>

1. Clique sur le repère de sélection du tableau entier (chapitre 26, section 26.2).
2. Onglet contextuel Disposition, groupe Données, clique sur **"Convertir en texte"**.
3. Choisis le séparateur souhaité entre les anciennes colonnes : **Tabulations** (pour un texte qui pourra être reconverti en tableau plus tard, section 27.1), **Virgules** (format proche d'un fichier CSV), ou **Marques de paragraphe** (chaque cellule devient un paragraphe séparé, perdant toute structure en colonnes).
4. Clique sur **OK**.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.1.2 Convert tables to text (MO-100 Associate)</span>
Cette procédure correspond exactement à cet objectif. **Piège fréquent** : choisir "Marques de paragraphe" en pensant conserver une structure lisible perd en réalité tout alignement en colonnes — un choix à réserver aux cas où la structure tabulaire n'a plus d'utilité après conversion.
</div>

<div class="encadre cas-pro">
<span class="encadre-titre">💼 Cas professionnel — PME</span>
Une PME qui doit importer une liste de contacts (initialement en tableau Word) dans un logiciel tiers acceptant uniquement un format texte structuré convertit ce tableau en texte séparé par virgules, produisant un résultat proche d'un fichier CSV directement exploitable par le logiciel de destination.
</div>

## 27.3 Trier les données d'un tableau

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 79 — Trier les dépenses par montant décroissant</span>

**Objectif** : répondre à la deuxième demande de la mise en situation d'ouverture.

**Préparation** : reprends le tableau de l'atelier 78.

**Étapes détaillées** :
1. Clique n'importe où dans le tableau, onglet contextuel Disposition, groupe Données, clique sur **Trier**.
2. Sous "Trier par", choisis la colonne des montants (identifiée par son en-tête si le tableau en possède un, sinon par son numéro de colonne).
3. Vérifie que **"Type"** est bien réglé sur **"Numérique"** (et non "Texte", qui trierait "120" avant "65" en comparant les caractères plutôt que les valeurs) et choisis **"Décroissant"**.
4. Clique sur **OK** : les lignes se réorganisent instantanément, la dépense la plus élevée apparaissant en premier.
</div>

<div class="encadre mos">
<span class="encadre-titre">🎓 Compétence MOS — 3.2.1 Sort table data (MO-100 Associate)</span>
L'atelier 79 correspond exactement à cet objectif. **Piège fréquent en examen** : oublier de vérifier le "Type" (Texte, Numérique, Date) avant de valider — un tri numérique effectué par erreur en mode "Texte" trie "100" avant "20" (comparaison caractère par caractère, "1" étant avant "2"), un résultat visuellement absurde mais qui ne provoque aucune erreur explicite de la part de Word.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Tri multi-critères</span>
La même boîte de dialogue Trier propose "Puis par" et un second "Puis par", permettant un tri sur plusieurs colonnes successives — par exemple, trier d'abord par catégorie de dépense (ordre alphabétique), puis, à catégorie égale, par montant décroissant.
</div>

## 27.4 Insérer une formule dans un tableau

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Un tableau Word peut effectuer des calculs simples via des <strong>formules</strong>, une fonctionnalité qui rappelle Excel sans en avoir la puissance ni l'automatisme : contrairement à Excel, une formule de tableau Word ne se recalcule <strong>jamais automatiquement</strong> quand une valeur source change — une mise à jour manuelle est toujours nécessaire.
</div>

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 80 — Calculer le total des dépenses</span>

**Objectif** : répondre à la troisième demande de la mise en situation d'ouverture.

**Préparation** : reprends le tableau trié de l'atelier 79, ajoute une nouvelle ligne en bas avec "Total" dans la première colonne.

**Étapes détaillées** :
1. Place le point d'insertion dans la cellule vide de la colonne des montants, sur la ligne "Total".
2. Onglet contextuel Disposition, groupe Données, clique sur **Formule**.
3. Word propose par défaut **`=SUM(ABOVE)`** ("above" = au-dessus) puisqu'il détecte des valeurs numériques dans les cellules situées au-dessus : conserve cette formule proposée.
4. Sous "Format", choisis un format d'affichage numérique si souhaité (par exemple avec séparateur de milliers), puis clique sur **OK** : le total calculé apparaît dans la cellule.
5. Modifie ensuite l'une des valeurs sources (par exemple, corrige "450" en "500"), puis clique dans la cellule du total et appuie sur **`F9`** (touche d'actualisation des champs, déjà rencontrée pour les dates automatiques au chapitre 14) : le total se met à jour pour refléter la correction.

**Résultat attendu** : un total calculé automatiquement à partir des valeurs du tableau, actualisable en une touche après toute modification.

**Dépannage** : si le total ne se met pas à jour après `F9`, vérifie que le point d'insertion se trouvait bien **dans** la cellule contenant la formule au moment d'appuyer sur cette touche.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attention — l'absence de recalcul automatique, une limite réelle</span>
Contrairement à une cellule Excel, une formule de tableau Word affiche une valeur **figée** jusqu'à actualisation manuelle (`F9`) — modifier une valeur source sans penser à actualiser laisse un total visuellement incorrect, sans aucun avertissement de la part de Word. Pour des calculs fréquemment mis à jour ou complexes, un vrai tableau Excel inséré ou lié (chapitre 24, section sur les graphiques liés, principe transférable) reste largement préférable.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Quelques fonctions courantes disponibles</span>
Au-delà de `SUM` (somme), Word propose `AVERAGE` (moyenne), `MAX`/`MIN` (valeur maximale/minimale), `COUNT` (nombre de valeurs) — accessibles dans le menu déroulant "Coller la fonction" de la même boîte de dialogue Formule, avec une syntaxe proche des fonctions Excel de base.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Reproduire le scénario complet de bout en bout</span>
Reproduis intégralement la mise en situation d'ouverture : rédige d'abord une liste de six dépenses fictives en texte simple séparé par tabulations, convertis-la en tableau, trie-la par montant décroissant, ajoute une ligne de total avec formule, puis modifie une valeur et actualise le total avec `F9` pour vérifier qu'il reflète bien la correction.
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Mélanger les séparateurs dans un texte à convertir en tableau</span>
Comme signalé dans l'atelier 78, un texte utilisant tantôt des tabulations tantôt des espaces pour séparer les mêmes types de données produit une conversion incohérente, certaines lignes se répartissant correctement en colonnes et d'autres non.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Trier une colonne numérique en mode "Texte" par erreur</span>
Comme signalé en section 27.3, ce piège produit un ordre absurde ("100" avant "20") sans aucun message d'erreur, un résultat qui peut passer inaperçu si le tableau n'est pas relu attentivement après le tri.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Oublier d'actualiser une formule après modification d'une valeur source</span>
Comme signalé en section 27.4, un total resté figé après une correction en amont donne une fausse impression d'exactitude, un risque réel dans un rapport financier si cette actualisation manuelle est oubliée avant l'envoi du document.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la conversion texte-tableau crée trop ou trop peu de colonnes</span>

- **Diagnostic** : le texte source contient probablement des séparateurs incohérents ou en nombre variable d'une ligne à l'autre (par exemple, une ligne avec deux tabulations consécutives par erreur).
- **Résolution** : afficher les marques de mise en forme (`Ctrl+Maj+8`, chapitre 6) sur le texte source avant conversion pour repérer et corriger ces incohérences.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : `=SUM(ABOVE)` inclut une valeur qui ne devrait pas être comptée</span>

- **Diagnostic** : une ligne intermédiaire non numérique (un sous-titre de section à l'intérieur du tableau, par exemple) peut interrompre ou fausser la plage "ABOVE" selon sa position exacte.
- **Résolution** : remplacer `ABOVE` par une référence de cellules plus précise si nécessaire (Word accepte aussi des références de type `B2:B5`, similaires à Excel), pour ne calculer que la plage réellement souhaitée.
</div>

## En entreprise

- **Bonne pratique répandue** : convertir systématiquement une liste de données collée en texte brut (depuis un e-mail, un export système) en vrai tableau dès réception, plutôt que de la laisser en texte tabulé peu exploitable.
- **Bonne pratique répandue** : pour tout calcul appelé à évoluer fréquemment ou à devenir complexe, privilégier un vrai classeur Excel lié (chapitre 24) plutôt que des formules de tableau Word, dont l'absence de recalcul automatique constitue un risque d'erreur réel.
- **Erreur classique observée** : des tableaux financiers Word avec des totaux figés depuis plusieurs modifications, jamais actualisés avec `F9`, donnant une image financière obsolète sans que personne ne s'en aperçoive avant une vérification approfondie.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — actualiser toutes les formules d'un document en une fois</span>
Plutôt que de cliquer dans chaque cellule de formule individuellement pour appuyer sur `F9`, sélectionner l'intégralité du document (`Ctrl+A`) puis appuyer sur `F9` actualise en une seule fois tous les champs et formules du document entier — un réflexe à adopter systématiquement avant tout envoi ou impression final d'un document contenant plusieurs tableaux calculés.
</div>

## Résumé du chapitre

- Convertir du texte en tableau nécessite un séparateur cohérent (tabulations ou virgules) sur toutes les lignes du texte source — objectif MOS 3.1.1.
- Convertir un tableau en texte propose plusieurs séparateurs, "Marques de paragraphe" perdant toute structure en colonnes — objectif MOS 3.1.2.
- Trier un tableau exige de vérifier le type de tri (Texte/Numérique/Date) pour éviter un ordre absurde sur une colonne de chiffres — objectif MOS 3.2.1.
- Une formule de tableau Word (`=SUM(ABOVE)` et quelques autres fonctions) ne se recalcule jamais automatiquement, contrairement à Excel — une actualisation manuelle via `F9` est systématiquement nécessaire après toute modification des valeurs sources.
- Pour des calculs fréquents ou complexes, un vrai classeur Excel lié reste préférable aux formules de tableau Word.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Pour convertir du texte en tableau, le texte source doit utiliser :
   - a) Des couleurs différentes par ligne
   - b) Un séparateur cohérent sur toutes les lignes
   - c) Une police spécifique
   - d) Un style de paragraphe particulier

2. Trier une colonne de chiffres en mode "Texte" plutôt que "Numérique" produit :
   - a) Exactement le même résultat que "Numérique"
   - b) Un ordre basé sur la comparaison des caractères, potentiellement absurde
   - c) Un message d'erreur bloquant
   - d) La suppression des valeurs non numériques

3. Une formule de tableau Word se met à jour après modification d'une valeur source :
   - a) Automatiquement, comme dans Excel
   - b) Uniquement après actualisation manuelle avec `F9`
   - c) Jamais, quelle que soit l'action de l'utilisateur
   - d) Uniquement à la fermeture du document

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. Convertir un tableau en texte avec l'option "Marques de paragraphe" conserve l'alignement en colonnes. — **Faux**.
2. Le tri d'un tableau peut se faire sur plusieurs colonnes successives ("Puis par"). — **Vrai**.
3. Une formule `=SUM(ABOVE)` recalcule automatiquement dès qu'une valeur au-dessus change. — **Faux**, une actualisation manuelle est nécessaire.
4. Sélectionner tout le document (`Ctrl+A`) puis appuyer sur `F9` actualise toutes les formules et champs en une fois. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi trier une colonne de montants en mode "Texte" plutôt que "Numérique" peut produire un résultat trompeur, avec un exemple concret.
2. Un collègue modifie une valeur dans un tableau Word contenant un total calculé, puis envoie immédiatement le document sans vérifier le total. Quel risque cela représente-t-il, et comment l'éviter ?

**Corrigé 1** : en mode "Texte", Word compare les valeurs caractère par caractère plutôt que numériquement — "100" serait ainsi trié avant "20", car le caractère "1" précède "2" dans l'ordre des caractères, alors que numériquement 100 est supérieur à 20. Ce résultat semble absurde à la lecture mais ne déclenche aucune erreur explicite, rendant l'erreur facile à manquer sans relecture attentive.

**Corrigé 2** : le total affiché resterait figé à son ancienne valeur, ne reflétant pas la modification apportée — un risque réel d'erreur si le document (par exemple un rapport financier) est envoyé avec un total obsolète, sans que quiconque ne s'en aperçoive avant une vérification approfondie. Pour l'éviter, toujours cliquer dans la cellule de formule (ou sélectionner tout le document avec `Ctrl+A`) et appuyer sur `F9` juste avant tout envoi ou impression final d'un tableau contenant des calculs.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.1</span>

Rédige un texte de cinq lignes séparées par des tabulations (nom, quantité), convertis-le en tableau, puis trie-le par quantité croissante en vérifiant bien le type de tri "Numérique".
</div>

**Corrigé :** réussi si le tableau obtenu affiche les lignes dans un ordre numérique correct (et non alphabétique) de la quantité la plus faible à la plus élevée.

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.2</span>

Sur ce même tableau, ajoute une ligne de total avec une formule `=SUM(ABOVE)`, puis modifie une des quantités et actualise le total avec `F9` pour vérifier la mise à jour.
</div>

**Corrigé :** réponse personnelle ; réussi si le total affiché après actualisation reflète correctement la somme des valeurs modifiées, confirmant la bonne utilisation de la touche `F9`.

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je convertis un texte structuré (tabulations ou virgules) en tableau.</li>
<li>☐ Je convertis un tableau en texte en choisissant le bon séparateur.</li>
<li>☐ Je trie un tableau en vérifiant systématiquement le type de tri (Texte/Numérique/Date).</li>
<li>☐ J'insère une formule de somme dans un tableau et je l'actualise avec `F9`.</li>
<li>☐ Je sais qu'un tableau Word ne recalcule jamais automatiquement, contrairement à Excel.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **Convertir texte → tableau** = séparateur cohérent obligatoire — MOS 3.1.1.
- **Convertir tableau → texte** = choisir le bon séparateur, éviter "Marques de paragraphe" si la structure doit être conservée — MOS 3.1.2.
- **Trier** = toujours vérifier le "Type" (Texte/Numérique/Date) — MOS 3.2.1.
- **Formule de tableau** = jamais de recalcul automatique, toujours `F9` après modification.

**Raccourci clavier de ce chapitre** :
- `F9` : actualiser un champ ou une formule sélectionnée (ou tout le document si `Ctrl+A` d'abord).
</div>

## FAQ

<dl class="faq">
<dt>Une formule de tableau Word peut-elle référencer une cellule d'un autre tableau du même document ?</dt>
<dd>Non, les formules de tableau Word ne peuvent référencer que des cellules du même tableau, contrairement à Excel où les références entre feuilles ou classeurs sont courantes.</dd>

<dt>Le tri d'un tableau peut-il se faire sur une seule colonne sans affecter l'ordre des autres ?</dt>
<dd>Non, trier un tableau réorganise toujours des lignes entières : trier par la colonne des montants déplace automatiquement avec elle le libellé de dépense correspondant sur la même ligne, préservant la cohérence de chaque enregistrement.</dd>

<dt>Existe-t-il une limite au nombre de lignes qu'un tableau Word peut contenir ?</dt>
<dd>Il n'existe pas de limite pratique courante, mais un tableau de plusieurs centaines de lignes de données chiffrées à recalculer manuellement devient vite peu maniable — un signe qu'un vrai classeur Excel lié (chapitre 24) serait plus adapté à ce volume.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle sur les formules et le tri dans les tableaux Word : [https://support.microsoft.com/office](https://support.microsoft.com/office)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Graphiques liés à un classeur Excel externe, pour des calculs plus avancés : chapitre 24.

*Chapitre suivant : la Partie 8 s'ouvre sur les documents longs et les références, en commençant par la table des matières automatique — l'aboutissement direct de la discipline des styles de titre pratiquée depuis le chapitre 9.*
