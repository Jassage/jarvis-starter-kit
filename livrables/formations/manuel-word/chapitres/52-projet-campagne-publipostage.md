<div class="chapitre-titre-num">CHAPITRE 52</div>

# Projet 3 — Campagne de publipostage pour une organisation

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
Ce troisième et dernier projet fil rouge mobilise particulièrement l'automatisation de la Partie 9. À la fin de ce chapitre, tu sauras concevoir et exécuter une campagne de publipostage complète — lettre personnalisée avec contenu conditionnel, étiquettes d'adresse, composants réutilisables, et une macro automatisant une étape finale répétitive — pour une organisation réelle ou fictive de ton choix.
</div>

**Ce chapitre ne comporte pas de matrice de compétences MOS dédiée** : il mobilise en pratique les objectifs déjà couverts, en particulier ceux du domaine Expert 4.3 (Perform mail merges) et 3.1/4.2 (QuickParts, macros). Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitres 50 et 51 (premiers projets), et en particulier les chapitres 34 à 37 (Partie 9, publipostage et automatisation).

<div class="encadre scenario">
<span class="encadre-titre">🎬 Cahier des charges du projet</span>
L'ONG lance sa campagne annuelle de sollicitation de dons. La coordonnatrice te confie l'ensemble du processus, avec ces exigences précises :

- Une liste de donateurs (minimum 8 lignes de test) avec Civilité, Nom, Prénom, Montant du dernier don, Catégorie ("Particulier", "Entreprise", "Fondation").
- Une lettre type utilisant le thème et au moins un style personnalisé déjà construits au Projet 1 (chapitre 50), ou reconstruits pour ce projet si besoin.
- Un bloc d'adresse et une ligne de salutation avec une formule de repli correcte pour les données incomplètes.
- Un paragraphe de remerciement conditionnel : un texte différent selon que le donateur a donné plus ou moins d'un seuil défini (par exemple 500 unités monétaires).
- Un composant QuickPart réutilisable pour la formule de politesse finale.
- Une vérification par aperçu d'au moins trois destinataires aux profils différents (un nom court, un nom long, une catégorie "Entreprise" sans champ de civilité).
- Un document final regroupant toutes les lettres personnalisées.
- Des étiquettes d'adresse générées à partir de la même liste de donateurs.
- Une macro automatisant l'actualisation et la vérification finale du document de fusion avant impression.
- Une inspection du document avant tout envoi réel.

Adapte les noms et montants à ton propre contexte si tu préfères un scénario différent, tant que chaque exigence structurelle est respectée.
</div>

## Étape 1 — Préparer la liste de donateurs

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Crée un classeur Excel de test avec les colonnes Civilité, Nom, Prénom, Montant, Catégorie, et au moins huit lignes de donateurs fictifs aux profils variés (inclus volontairement : un nom très long, une ligne "Entreprise" sans civilité pertinente, un montant élevé et un montant faible).
2. Enregistre ce classeur, il servira de source de données pour toute la suite du projet.
</div>

## Étape 2 — Construire la lettre type

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Ouvre un nouveau document, applique le thème et au moins un style personnalisé du Projet 1 (chapitre 18, chapitre 17) — ou recrée rapidement un thème simple si tu abordes ce projet indépendamment.
2. Rédige le corps de la lettre de remerciement, en laissant les emplacements personnalisés à compléter à l'étape suivante.
3. Sélectionne le paragraphe de formule de politesse finale, enregistre-le comme composant QuickPart (chapitre 35) nommé "Politesse ONG", réutilisable pour toute future correspondance de l'organisation.
</div>

## Étape 3 — Connecter la source de données et insérer les champs

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Démarre la fusion et le publipostage en mode "Lettres" (chapitre 34), connecte le classeur Excel de l'étape 1.
2. Insère un Bloc d'adresse, puis une Ligne de salutation avec une formule de repli explicite ("Cher(ère) Ami(e)") pour les données incomplètes.
3. Dans le corps du texte, insère un champ de fusion individuel pour le montant du dernier don.
</div>

## Étape 4 — Le paragraphe conditionnel

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Place le point d'insertion à l'endroit du paragraphe de remerciement personnalisé.
2. Onglet Publipostage, groupe Champs d'écriture et d'insertion, clique sur **Règles**, choisis **"Si...Alors...Sinon..."**.
3. Configure la condition : "Champ Montant" "Supérieur ou égal à" "500", texte à insérer si vrai ("Votre générosité exceptionnelle a un impact direct sur nos programmes..."), texte à insérer sinon ("Votre soutien fidèle continue de faire la différence...").
4. Valide : ce champ conditionnel adaptera automatiquement le texte affiché selon le montant réel de chaque destinataire lors de la fusion.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Renvoi</span>
Ce champ conditionnel a déjà été évoqué comme astuce experte au chapitre 34 — ce projet t'en fait maintenant l'usage concret.
</div>

## Étape 5 — Prévisualiser des cas particuliers

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Active l'aperçu des résultats (chapitre 34), navigue spécifiquement vers le donateur au nom très long, celui de catégorie "Entreprise", et celui au montant le plus élevé.
2. Vérifie, pour chacun, que la mise en page reste correcte (le nom long ne déborde pas de façon disgracieuse), que la ligne de salutation reste appropriée, et que le paragraphe conditionnel affiche bien le bon texte selon le montant.
3. Corrige la lettre type si un cas particulier révèle un problème, puis revérifie.
</div>

## Étape 6 — Terminer la fusion et générer les étiquettes

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Termine la fusion en choisissant "Modifier des documents individuels" (chapitre 34), pour obtenir un document unique contenant toutes les lettres personnalisées.
2. Dans un nouveau document séparé, démarre une seconde fusion en mode "Étiquettes", reconnecte la même source de données Excel, insère un Bloc d'adresse, et termine la fusion pour obtenir la planche d'étiquettes complète.
</div>

## Étape 7 — Automatiser la vérification finale par macro

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Sur le document de fusion final (toutes les lettres), ouvre l'éditeur Visual Basic (chapitre 37, `Alt+F11`).
2. Écris une macro qui actualise tous les champs du document, puis compte et affiche le nombre de pages du document final via un message :

```vb
Sub VerifierDocumentFusion()
    ActiveDocument.Fields.Update
    Dim nbPages As Integer
    nbPages = ActiveDocument.ComputeStatistics(wdStatisticPages)
    MsgBox "Document de fusion pret. Nombre de pages : " & nbPages & _
           ". Verifiez ce nombre par rapport au nombre de destinataires attendu avant impression."
End Sub
```

3. Exécute cette macro (`F5` ou `Alt+F8`), vérifie que le nombre de pages annoncé correspond à tes attentes (par exemple, si chaque lettre tient sur une page, ce nombre devrait correspondre au nombre de destinataires non exclus).
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Cette macro illustre concrètement la limite de l'enregistreur simple déjà signalée au chapitre 37 : compter les pages et comparer ce chiffre à une attente précise est une logique qu'aucun enregistreur automatique n'aurait pu produire, nécessitant le code écrit directement.
</div>

## Étape 8 — Inspection finale avant envoi

<div class="encadre exercice">
<span class="encadre-titre">📝 Actions de cette étape</span>

1. Inspecte le document de fusion final (chapitre 42) pour vérifier l'absence de toute donnée de test résiduelle qui ne devrait pas figurer dans un envoi réel.
2. Vérifie l'accessibilité (chapitre 46) si les lettres doivent aussi être partagées en version numérique accessible.
3. Exporte, si nécessaire, une version PDF de chaque lettre ou de l'ensemble regroupé (chapitre 45).
</div>

## Grille d'auto-évaluation finale

<div class="encadre exercice">
<span class="encadre-titre">✅ Vérifie chaque exigence du cahier des charges avant de considérer le projet terminé</span>
<ul class="checklist">
<li>☐ La liste de donateurs de test comprend au moins huit profils variés, dont des cas particuliers volontaires.</li>
<li>☐ La lettre type utilise un thème et au moins un style personnalisé cohérents.</li>
<li>☐ Le bloc d'adresse et la ligne de salutation gèrent correctement une formule de repli.</li>
<li>☐ Le paragraphe conditionnel affiche le bon texte selon le montant de chaque destinataire.</li>
<li>☐ Un composant QuickPart réutilisable a été créé pour la formule de politesse.</li>
<li>☐ Au moins trois profils de destinataires différents ont été vérifiés en aperçu avant la fusion finale.</li>
<li>☐ Un document final regroupe toutes les lettres personnalisées.</li>
<li>☐ Une planche d'étiquettes a été générée à partir de la même source de données.</li>
<li>☐ Une macro a automatisé l'actualisation et le comptage de vérification du document final.</li>
<li>☐ Le document a été inspecté avant tout envoi réel simulé.</li>
</ul>
</div>

## Pour aller plus loin

<div class="encadre defi">
<span class="encadre-titre">🏆 Variante — enrichir la macro de vérification</span>
Modifie la macro de l'étape 7 pour qu'elle parcoure, via une boucle `For Each` (chapitre 37), le texte du document et signale par un message si un champ de fusion n'a apparemment pas été résolu (recherche du symbole `«` qui resterait visible en cas de champ non remplacé) — un contrôle qualité automatisé complémentaire à la vérification manuelle.
</div>

<div class="encadre defi">
<span class="encadre-titre">🏆 Variante — étendre la campagne à un envoi par e-mail</span>
Ajoute une colonne "E-mail" à la source de données Excel, puis termine une troisième fusion via "Envoyer des messages électroniques" (chapitre 34) plutôt que l'impression, si un client de messagerie compatible est configuré sur ton poste.
</div>

---

Ces trois projets fil rouge ont mobilisé, dans des scénarios complets et réalistes, l'ensemble des compétences construites depuis le chapitre 1 de ce manuel. La Partie 14 qui s'ouvre maintenant change de nature : elle ne propose plus de projets pratiques, mais une préparation ciblée et méthodique à la certification Microsoft Office Specialist, avec deux examens blancs corrigés en conditions réelles.

*Chapitre suivant : vue d'ensemble et méthode de préparation à la certification MOS Word.*
