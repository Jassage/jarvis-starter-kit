<div class="chapitre-titre-num">CHAPITRE 37</div>

# Introduction à VBA pour Word

<div class="encadre objectif">
<span class="encadre-titre">🎯 Objectifs pédagogiques</span>
À la fin de ce chapitre, tu sauras : ouvrir et te repérer dans l'éditeur Visual Basic ; lire et comprendre l'anatomie d'une procédure VBA générée par l'enregistreur de macros ; écrire une macro simple directement au clavier, sans passer par l'enregistreur ; utiliser une variable et une boucle simple pour automatiser une action sur plusieurs éléments d'un document ; déboguer une macro pas à pas en cas de comportement inattendu ; et mener à bien le mini-projet de fin de Partie 9 combinant publipostage, champs et automatisation.
</div>

**Matrice de compétences MOS**

Ce chapitre prolonge l'objectif MOS Expert 4.2.3 (modifier des macros simples, déjà couvert au chapitre 36) sans introduire de nouvel objectif propre : l'écriture de VBA à partir de zéro dépasse le périmètre de l'examen Word Expert, centré sur l'enregistrement et la modification légère de macros simples. Ce chapitre reste inclus pour la complétude du manuel, à destination des lecteurs souhaitant aller plus loin que le strict nécessaire pour la certification. Voir `assets/mos-objectifs.md`.

**Prérequis** : chapitre 36 (macros enregistrées), dont ce chapitre explique enfin en détail le code généré automatiquement.

<div class="encadre scenario">
<span class="encadre-titre">🎬 Mise en situation</span>
La macro enregistrée au chapitre 36 fonctionne bien pour styler un seul titre, mais ta responsable voudrait désormais une automatisation plus ambitieuse : parcourir automatiquement **tous** les paragraphes en majuscules du rapport mensuel et leur appliquer le style "Titre 2", sans savoir à l'avance combien de tels paragraphes existent ni où ils se trouvent. L'enregistreur de macros, qui ne fait que rejouer une séquence fixe, ne peut pas s'adapter à un nombre inconnu d'éléments. Ce chapitre montre comment écrire ce type de logique directement en code.
</div>

## 37.1 Se repérer dans l'éditeur Visual Basic

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 113 — Explorer l'éditeur VBA</span>

**Objectif** : comprendre la structure de base de l'environnement de programmation intégré à Word.

**Préparation** : ouvre un document de test.

**Étapes détaillées** :
1. Onglet **Développeur** (chapitre 35), groupe Code, clique sur **Visual Basic**, ou raccourci **`Alt+F11`**.
2. Le volet **"Explorateur de projets"** à gauche affiche une arborescence : **"Normal"** (le projet correspondant à Normal.dotm, chapitre 4) et un projet portant le nom du document actif, chacun contenant un dossier **"Microsoft Word Objects"** (avec "ThisDocument") et éventuellement des **"Modules"** — c'est dans un module que vivent les macros enregistrées au chapitre 36.
3. Double-clique sur "Module1" (ou le module contenant la macro du chapitre 36) pour afficher son code dans le grand volet central.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir</span>
Ce même éditeur, cette même fenêtre, est celui déjà entrevu au chapitre 36 pour modifier une macro simple — ce chapitre ne présente pas un nouvel outil, mais approfondit la <strong>lecture</strong> et l'<strong>écriture</strong> de ce que cet éditeur contient.
</div>

## 37.2 Anatomie d'une procédure VBA

Une macro enregistrée au chapitre 36 génère toujours une structure similaire :

```vb
Sub MiseEnFormeRapportONG()
'
' MiseEnFormeRapportONG Macro
'
    Selection.Style = ActiveDocument.Styles("Titre 1")
End Sub
```

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — vocabulaire de base</span>
- <strong>`Sub ... End Sub`</strong> délimite une <strong>procédure</strong> (le bloc de code exécuté quand la macro est lancée).
- <strong>`ActiveDocument`</strong> est un <strong>objet</strong> représentant le document actuellement actif — Word expose ainsi ses éléments (documents, paragraphes, styles, sélection) comme des objets manipulables par du code.
- <strong>`Selection`</strong> est un objet représentant le texte actuellement sélectionné dans le document.
- <strong>`.Style`</strong> est une <strong>propriété</strong> de l'objet Selection, ici modifiée (assignée) à une nouvelle valeur.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Analogie</span>
Un objet VBA se comporte comme une fiche technique consultable et modifiable : `ActiveDocument.Paragraphs.Count` consulte une information (le nombre de paragraphes), tandis que `Selection.Style = ...` modifie une caractéristique (change le style appliqué) — exactement comme consulter puis remplir les champs d'une fiche papier, mais fait ici par du code plutôt qu'à la main.
</div>

## 37.3 Écrire une macro simple sans l'enregistreur

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 114 — Écrire directement une macro affichant un message</span>

**Objectif** : taper du code VBA pour la première fois, sans passer par l'enregistreur automatique.

**Préparation** : dans l'éditeur VBA, clic droit sur "Normal" dans l'Explorateur de projets, **Insérer > Module** (pour créer un module vide plutôt que de réutiliser celui d'une macro existante).

**Étapes détaillées** :
1. Dans le nouveau module vide, tape :
```vb
Sub SaluerUtilisateur()
    MsgBox "Rapport mensuel pret a etre finalise !"
End Sub
```
2. Place le curseur n'importe où dans cette procédure, appuie sur **`F5`** (Exécuter) : une boîte de dialogue Windows standard s'affiche avec le message tapé.
3. Retourne dans Word (`Alt+F11` bascule entre les deux fenêtres), onglet Développeur, Macros (`Alt+F8`) : "SaluerUtilisateur" apparaît dans la liste, exactement comme une macro enregistrée, bien qu'elle ait été entièrement tapée à la main.
</div>

<div class="encadre bonne-pratique">
<span class="encadre-titre">✅ Bonne pratique</span>
`MsgBox` est un excellent premier réflexe pour vérifier qu'une macro s'exécute bien au bon moment, avant d'y ajouter une logique plus complexe — un message de confirmation simple confirme que le code tapé est syntaxiquement correct et déclenché correctement.
</div>

## 37.4 Variables et boucles : automatiser sur un nombre inconnu d'éléments

<div class="encadre exercice">
<span class="encadre-titre">🛠️ Atelier 115 — Styliser tous les paragraphes en majuscules du rapport</span>

**Objectif** : répondre précisément à la demande de la mise en situation d'ouverture, impossible à réaliser avec le simple enregistreur.

**Préparation** : ouvre un document de test contenant plusieurs paragraphes, dont certains entièrement en majuscules (simulant des titres non stylés) mélangés à du texte normal.

**Étapes détaillées** :
1. Dans un nouveau module, tape :
```vb
Sub StyliserTitresMajuscules()
    Dim monParagraphe As Paragraph

    For Each monParagraphe In ActiveDocument.Paragraphs
        If monParagraphe.Range.Text = UCase(monParagraphe.Range.Text) Then
            monParagraphe.Range.Style = ActiveDocument.Styles("Titre 2")
        End If
    Next monParagraphe

    MsgBox "Mise en forme terminee !"
End Sub
```
2. Reviens dans Word, exécute cette macro (`Alt+F8`, Exécuter) sur le document de test.
3. Observe que **tous** les paragraphes en majuscules, quel que soit leur nombre ou leur position, adoptent désormais le style "Titre 2" — sans que la macro n'ait eu besoin de connaître à l'avance combien il y en avait.
</div>

<div class="encadre retenir">
<span class="encadre-titre">📌 À retenir — les deux nouveaux concepts de cet atelier</span>
- <strong>`Dim monParagraphe As Paragraph`</strong> déclare une <strong>variable</strong> nommée "monParagraphe", qui contiendra temporairement chaque paragraphe rencontré.
- <strong>`For Each ... In ... / Next`</strong> est une <strong>boucle</strong> qui répète une action pour chaque élément d'une collection (ici, chaque paragraphe du document) — c'est précisément cette boucle qui permet de traiter un nombre <strong>inconnu</strong> d'éléments, contrairement à l'enregistreur du chapitre 36 qui ne peut rejouer qu'une séquence fixe et prédéterminée.
</div>

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — la condition `If...Then`</span>
La ligne `If monParagraphe.Range.Text = UCase(...) Then` compare le texte du paragraphe à sa propre version tout en majuscules (`UCase`) : si les deux sont identiques, c'est que le texte était déjà entièrement en majuscules — une condition qui filtre précisément les paragraphes à traiter, sans toucher aux autres.
</div>

## 37.5 Déboguer une macro pas à pas

<div class="encadre exercice">
<span class="encadre-titre">📝 Procédure — Exécuter une macro ligne par ligne pour comprendre un problème</span>

1. Place le curseur dans la procédure à déboguer, appuie sur **`F8`** (plutôt que `F5`) : seule la première ligne s'exécute, une flèche jaune indiquant la ligne actuellement active.
2. Appuie à nouveau sur `F8` pour avancer d'une ligne à la fois, observant l'effet de chaque instruction avant de passer à la suivante.
3. La fenêtre **"Exécution immédiate"** (Affichage > Exécution immédiate dans l'éditeur) permet de taper `? monParagraphe.Range.Text` pendant une pause de débogage, pour afficher la valeur actuelle d'une variable et comprendre pourquoi une condition se comporte de façon inattendue.
</div>

<div class="encadre astuce">
<span class="encadre-titre">💡 Astuce</span>
L'exécution pas à pas (`F8`) est l'outil de diagnostic le plus utile face à une macro qui produit un résultat inattendu — plutôt que de deviner où se situe le problème, observer concrètement, ligne par ligne, à quel moment le comportement diverge de ce qui était attendu.
</div>

## Défi

<div class="encadre defi">
<span class="encadre-titre">🏆 Défi — Écrire une macro de comptage</span>
Écris une macro nommée `CompterMots` qui affiche, via `MsgBox`, le nombre total de mots du document actif (indice : l'objet `ActiveDocument` possède une propriété `Words.Count`), ainsi qu'un message différent selon que ce nombre dépasse ou non 500 mots (en utilisant une structure `If...Then...Else`).
</div>

## Mini-projet de fin de partie

<div class="encadre exercice">
<span class="encadre-titre">🏗️ Mini-projet — Automatiser intégralement la routine du rapport mensuel</span>

**Contexte** : ce mini-projet combine l'intégralité de la Partie 9 (chapitres 34 à 37) en une automatisation complète, à la manière d'un vrai outil interne développé pour une petite organisation.

**Objectif** : construire, pour l'ONG ou une organisation fictive de ton choix, une chaîne d'automatisation combinant publipostage et macro.

**Livrables attendus** :
1. Une liste de destinataires de test (au moins cinq personnes) et une lettre type utilisant Bloc d'adresse, Ligne de salutation et au moins un champ de fusion individuel (chapitre 34).
2. Au moins un composant **QuickPart** réutilisable (chapitre 35) inséré dans la lettre type (par exemple une formule de politesse standardisée).
3. Une **macro enregistrée** (chapitre 36) automatisant une mise en forme finale répétitive sur le document de fusion terminé.
4. Une **macro écrite à la main** (ce chapitre) utilisant une boucle pour parcourir automatiquement un élément du document fusionné (par exemple, compter le nombre total de lettres générées, ou vérifier qu'aucun champ de fusion n'est resté non résolu).

**Critères de réussite** : la fusion produit un document final cohérent pour chaque destinataire ; la macro enregistrée s'exécute sans erreur sur ce document final ; la macro écrite à la main affiche un résultat exact (nombre de lettres, ou confirmation d'absence de champ non résolu) via `MsgBox`.

**Format de restitution suggéré** : le document de fusion final, accompagné du code des deux macros (copié dans un fichier texte ou conservé dans le module VBA du document, chapitre 36 section sur le transfert vers un modèle).
</div>

## Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°1 — Oublier `Next` ou `End Sub` en fin de bloc</span>
VBA signale une erreur de compilation si une boucle `For Each` n'est pas refermée par `Next`, ou une procédure par `End Sub` — un oubli fréquent chez qui découvre la syntaxe pour la première fois, généralement signalé clairement par l'éditeur avant même l'exécution.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°2 — Confondre `=` de comparaison et `=` d'assignation</span>
Dans `If monParagraphe.Range.Text = UCase(...)`, le signe `=` compare deux valeurs ; dans `monParagraphe.Range.Style = ActiveDocument.Styles("Titre 2")`, le même signe assigne une nouvelle valeur — VBA distingue les deux usages selon le contexte (`If...Then` contre une simple ligne d'instruction), une nuance qui peut dérouter un débutant en programmation.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Erreur n°3 — Exécuter une macro non testée directement sur un document important</span>
Toujours tester une nouvelle macro, en particulier une boucle parcourant tout un document, sur une **copie** de test plutôt que sur l'original — une boucle mal écrite peut modifier bien plus d'éléments que prévu avant que l'erreur ne soit remarquée.
</div>

## Dépannage

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : VBA affiche "Erreur de compilation" avant même l'exécution</span>

- **Diagnostic** : une erreur de syntaxe existe quelque part dans le code (mot-clé mal orthographié, parenthèse ou guillemet manquant).
- **Résolution** : l'éditeur surligne généralement la ligne fautive en rouge ; relire attentivement cette ligne précise plutôt que l'ensemble du code.
</div>

<div class="encadre attention">
<span class="encadre-titre">🩺 Symptôme : la boucle `For Each` semble ne rien faire, aucun paragraphe n'est modifié</span>

- **Diagnostic** : la condition `If` ne correspond peut-être à aucun paragraphe réel du document de test (par exemple, si aucun paragraphe n'est réellement en majuscules strictes).
- **Résolution** : exécuter en pas à pas (`F8`, section 37.5) et observer, via la fenêtre Exécution immédiate, la valeur réelle de `monParagraphe.Range.Text` à chaque itération pour comprendre pourquoi la condition ne se déclenche jamais.
</div>

## En entreprise

- **Bonne pratique répandue** : toujours tester une macro contenant une boucle sur une copie de document plutôt que sur l'original, en particulier lors des premiers essais.
- **Bonne pratique répandue** : commenter le code d'une macro complexe (lignes commençant par une apostrophe `'`, ignorées par VBA) pour qu'un autre membre de l'équipe puisse comprendre son fonctionnement des mois plus tard.
- **Erreur classique observée** : des macros écrites sans aucun commentaire ni nom de variable explicite, devenues illisibles et donc jamais modifiées ni réutilisées par qui que ce soit d'autre que leur auteur d'origine.

## Astuces avancées

<div class="encadre expert">
<span class="encadre-titre">🚀 Astuce experte — enregistrer une macro puis la compléter manuellement</span>
La méthode la plus efficace pour progresser en VBA sans repartir de zéro à chaque fois consiste à enregistrer une macro simple (chapitre 36) pour la partie répétitive et prévisible, puis à ouvrir son code dans l'éditeur pour y ajouter manuellement une boucle ou une condition (ce chapitre) là où l'enregistreur automatique ne suffit plus — combinant ainsi la rapidité de l'enregistrement et la flexibilité de l'écriture manuelle.
</div>

## Résumé du chapitre

- L'éditeur Visual Basic (`Alt+F11`) organise le code en projets (Normal, document actif) et modules, le même environnement déjà entrevu au chapitre 36.
- Une procédure VBA (`Sub ... End Sub`) manipule des objets (ActiveDocument, Selection) via leurs propriétés et méthodes.
- Une macro peut être écrite entièrement à la main, sans passer par l'enregistreur, notamment pour utiliser `MsgBox` à des fins de vérification.
- Une variable (`Dim`) et une boucle (`For Each ... Next`) permettent d'automatiser une action sur un nombre inconnu d'éléments, une limite structurelle que l'enregistreur seul ne peut jamais dépasser.
- Le débogage pas à pas (`F8`) et la fenêtre Exécution immédiate permettent de comprendre précisément le comportement d'une macro qui ne fonctionne pas comme prévu.

## Quiz

<div class="encadre exercice">
<span class="encadre-titre">📝 QCM (une seule bonne réponse par question)</span>

1. Le raccourci pour ouvrir l'éditeur Visual Basic est :
   - a) `Alt+F8`
   - b) `Alt+F11`
   - c) `Ctrl+F9`
   - d) `F5`

2. Une boucle `For Each ... Next` sert à :
   - a) Afficher une boîte de message
   - b) Répéter une action pour chaque élément d'une collection
   - c) Supprimer toutes les macros
   - d) Enregistrer le document

3. Pour exécuter une macro ligne par ligne à des fins de débogage, on utilise :
   - a) `F5`
   - b) `F8`
   - c) `Ctrl+S`
   - d) `Alt+F4`

**Corrigé** : 1-b, 2-b, 3-b.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Vrai ou Faux</span>

1. L'enregistreur de macros du chapitre 36 peut automatiquement s'adapter à un nombre inconnu d'éléments dans un document. — **Faux**, seule une boucle écrite manuellement le permet.
2. `MsgBox` affiche une boîte de dialogue avec un message personnalisé. — **Vrai**.
3. Une macro doit obligatoirement être enregistrée via l'enregistreur automatique, jamais tapée directement. — **Faux**.
4. L'exécution pas à pas (`F8`) permet d'observer l'effet de chaque ligne de code avant de passer à la suivante. — **Vrai**.
</div>

<div class="encadre exercice">
<span class="encadre-titre">📝 Questions ouvertes</span>

1. Explique pourquoi l'enregistreur de macros du chapitre 36 ne peut pas résoudre le besoin de la mise en situation d'ouverture de ce chapitre.
2. Un collègue a écrit une macro avec une boucle `For Each` qui semble ne rien faire du tout à l'exécution. Quelle méthode lui recommandes-tu pour comprendre le problème ?

**Corrigé 1** : l'enregistreur ne fait que rejouer une séquence d'actions fixe, capturée une seule fois sur un cas précis (par exemple, un seul paragraphe styké) — il ne peut ni compter, ni tester une condition, ni s'adapter à un nombre variable et inconnu d'éléments. Seule une boucle écrite manuellement (`For Each ... Next`), combinée à une condition (`If...Then`), permet de traiter automatiquement tous les paragraphes correspondant à un critère, quel que soit leur nombre réel dans le document.

**Corrigé 2** : lui recommander l'exécution pas à pas (`F8`) combinée à la fenêtre Exécution immédiate (section 37.5), pour observer concrètement, à chaque itération de la boucle, la valeur réelle des variables et vérifier si la condition testée se déclenche effectivement ou non — une méthode bien plus efficace que de deviner la cause du problème à la seule lecture du code.

</div>

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 37.1</span>

Écris une macro `AfficherNombreParagraphes` qui affiche, via `MsgBox`, le nombre total de paragraphes du document actif, en utilisant la propriété `ActiveDocument.Paragraphs.Count`.
</div>

**Corrigé :**
```vb
Sub AfficherNombreParagraphes()
    MsgBox "Ce document contient " & ActiveDocument.Paragraphs.Count & " paragraphes."
End Sub
```

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 37.2</span>

Sur un document de test contenant plusieurs paragraphes, écris une macro utilisant une boucle `For Each` pour compter combien de paragraphes sont entièrement vides (indice : comparer `monParagraphe.Range.Text` à une chaîne ne contenant que le caractère de fin de paragraphe, ou tester sa longueur), puis affiche ce nombre via `MsgBox`.
</div>

**Corrigé :** réponse personnelle, structure attendue proche de :
```vb
Sub CompterParagraphesVides()
    Dim monParagraphe As Paragraph
    Dim compteur As Integer
    compteur = 0

    For Each monParagraphe In ActiveDocument.Paragraphs
        If Len(Trim(monParagraphe.Range.Text)) <= 1 Then
            compteur = compteur + 1
        End If
    Next monParagraphe

    MsgBox "Nombre de paragraphes vides : " & compteur
End Sub
```

## Checklist de fin de chapitre

<ul class="checklist">
<li>☐ Je sais ouvrir et me repérer dans l'éditeur Visual Basic.</li>
<li>☐ Je comprends l'anatomie d'une procédure VBA (Sub, objets, propriétés).</li>
<li>☐ J'écris une macro simple directement au clavier, sans l'enregistreur.</li>
<li>☐ J'utilise une variable et une boucle `For Each` pour traiter un nombre inconnu d'éléments.</li>
<li>☐ Je débogue une macro pas à pas avec `F8` et la fenêtre Exécution immédiate.</li>
<li>☐ J'ai mené à bien le mini-projet combinant l'ensemble de la Partie 9.</li>
</ul>

## Aide-mémoire

<div class="encadre retenir">
<span class="encadre-titre">📌 Points clés à retenir</span>

- **`Alt+F11`** = ouvrir l'éditeur Visual Basic.
- **`Sub ... End Sub`** = délimite une procédure ; **objets** (ActiveDocument, Selection) manipulés via propriétés/méthodes.
- **`Dim`** = déclare une variable ; **`For Each ... Next`** = boucle sur une collection, seule solution pour un nombre inconnu d'éléments.
- **`F5`** = exécuter ; **`F8`** = exécuter pas à pas pour déboguer.
- **`MsgBox`** = afficher un message de vérification.

**Raccourcis clavier de ce chapitre** :
- `Alt+F11` : ouvrir/fermer l'éditeur Visual Basic.
- `F5` : exécuter la macro.
- `F8` : exécuter pas à pas.
</div>

## FAQ

<dl class="faq">
<dt>Faut-il des connaissances de programmation préalables pour suivre ce chapitre ?</dt>
<dd>Non, ce chapitre a été conçu comme une introduction pour un lecteur n'ayant jamais programmé, en s'appuyant sur les concepts déjà familiers du manuel (styles, sélection) plutôt que sur un vocabulaire de programmation abstrait.</dd>

<dt>VBA est-il encore d'actualité face à des langages plus modernes ?</dt>
<dd>Oui, pour l'automatisation locale de Word et des autres applications Office, VBA reste le langage natif et le plus directement intégré, sans installation supplémentaire — des alternatives modernes comme Office Scripts (pour le cloud, Excel principalement) ou Power Automate existent en complément pour des scénarios plus larges, mais ne remplacent pas VBA pour une automatisation locale simple comme celle de ce chapitre.</dd>

<dt>Peut-on annuler (Ctrl+Z) l'effet d'une macro après son exécution ?</dt>
<dd>Généralement oui pour les actions simples (comme un changement de style), Word traitant souvent l'exécution d'une macro comme une seule action annulable — mais ce comportement n'est pas garanti pour toute action, d'où l'importance de tester sur une copie (section "Erreurs fréquentes") plutôt que de compter systématiquement sur l'annulation.</dd>
</dl>

## Références et ressources complémentaires

- Documentation officielle du modèle d'objets VBA pour Word : [https://learn.microsoft.com/office/vba/api/overview/word](https://learn.microsoft.com/office/vba/api/overview/word)
- Référentiel officiel des objectifs MOS Word (MO-100/MO-101) : voir `assets/mos-objectifs.md` dans ce manuel.
- Enregistreur de macros, point de départ recommandé avant l'écriture manuelle : chapitre 36.

*Chapitre suivant : la Partie 10 s'ouvre sur la collaboration et la révision, en commençant par le suivi des modifications — pour que plusieurs personnes travaillent ensemble sur un même document en toute transparence.*
