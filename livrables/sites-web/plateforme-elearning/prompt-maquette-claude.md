# Prompt - Maquette plateforme e-learning

> À copier-coller dans Claude (mode design / artifacts) pour générer les maquettes interactives (HTML + Tailwind CSS).
> Génère un écran à la fois pour garder la cohérence visuelle (voir instructions en bas).

---

## Prompt à copier

```
Tu es un designer UI/UX senior spécialisé dans les plateformes SaaS éducatives.

CONTEXTE DU PROJET
Je développe une plateforme e-learning grand public, dans l'esprit d'Udemy : marketplace de cours en ligne avec des étudiants, des professeurs/créateurs de cours, et un administrateur de la plateforme. Les fonctionnalités principales sont : catalogue de cours, inscription et progression, contenu vidéo/texte par modules et leçons, quiz et évaluations, certificats de réussite, gestion des cours par les professeurs, et back-office d'administration.

ÉTAPE 1 - SYSTÈME DE DESIGN
Avant de générer les écrans, propose un système de design cohérent :
- Un nom de marque pour la plateforme (court, mémorable, en lien avec l'apprentissage/la progression)
- Une palette de couleurs colorée et dynamique, adaptée à un public étudiant (1 couleur primaire vive, 1-2 couleurs secondaires/accent, couleurs neutres pour les fonds et textes)
- Une typographie (police de titres + police de texte, disponibles sur Google Fonts)
- Le style des composants : boutons, cards, badges, barres de progression, navigation (coins arrondis, ombres légères, micro-interactions)

Affiche ce système de design sous forme de mini "style guide" (palette avec codes couleurs, exemples de boutons/cards) avant de passer aux écrans.

ÉTAPE 2 - ÉCRANS À GÉNÉRER
Génère ensuite, un par un, les écrans suivants en HTML + Tailwind CSS, responsive (desktop + mobile), en réutilisant strictement le système de design défini à l'étape 1 :

1. PAGE D'ACCUEIL (landing page publique)
   - Header avec logo, navigation, boutons connexion/inscription
   - Hero avec accroche forte, CTA principal, visuel/illustration
   - Section catégories de cours populaires
   - Section cours mis en avant (cards avec image, titre, prof, note, prix)
   - Section témoignages/chiffres clés (nombre d'étudiants, de cours, etc.)
   - Footer complet

2. DASHBOARD ÉTUDIANT
   - Sidebar de navigation (mes cours, explorer, évaluations, certificats, profil)
   - Vue d'ensemble : cours en cours avec barre de progression, prochaine leçon à continuer
   - Section "recommandés pour vous"
   - Section certificats obtenus

3. PAGE D'UN COURS (vue étudiant en train de suivre un cours)
   - Lecteur vidéo/contenu principal
   - Sidebar avec plan du cours (modules et leçons), indicateur de progression et de leçons complétées
   - Onglets : aperçu, ressources, discussion/Q&A, avis

4. ESPACE ÉVALUATIONS / QUIZ
   - Liste des quiz/évaluations disponibles et complétés avec scores
   - Vue d'un quiz en cours (question à choix multiples, barre de progression du quiz, boutons suivant/valider)
   - Écran de résultat avec score et feedback

5. CERTIFICAT
   - Design d'un certificat de réussite (nom de l'étudiant, titre du cours, date, signature/logo plateforme), au format paysage imprimable

6. DASHBOARD PROFESSEUR / CRÉATEUR DE COURS
   - Vue d'ensemble de ses cours (statuts, nombre d'inscrits, revenus, note moyenne)
   - Interface de gestion d'un cours : liste des modules/leçons avec actions d'édition, ajout de contenu
   - Statistiques simples (graphique d'inscriptions, revenus)

7. DASHBOARD ADMINISTRATEUR
   - Vue d'ensemble de la plateforme (utilisateurs, cours, revenus, croissance)
   - Table de gestion des utilisateurs (étudiants/professeurs) avec actions (activer/suspendre)
   - Table de modération des cours (validation des nouveaux cours soumis par les professeurs)

CONTRAINTES GÉNÉRALES
- Style coloré et dynamique, mais lisible et professionnel : pas de surcharge visuelle
- Données fictives réalistes (noms de cours, profs, étudiants en français)
- Icônes via une librairie type Lucide ou Heroicons (inline SVG)
- Chaque écran doit être un artifact HTML autonome et complet
```

---

## Instructions d'utilisation

1. Colle le prompt complet dans une nouvelle conversation Claude.
2. Laisse Claude générer le système de design (étape 1) et valide-le ou demande des ajustements (couleurs, nom de marque) avant de continuer.
3. Demande ensuite les écrans un par un (ex. "Génère l'écran 1 : page d'accueil"), en lui rappelant de réutiliser le système de design validé.
4. Sauvegarde chaque maquette générée (export HTML ou capture d'écran) dans ce dossier `livrables/sites-web/plateforme-elearning/`.

## Convention de noms pour les fichiers générés

- `maquette-landing.html`
- `maquette-dashboard-etudiant.html`
- `maquette-cours.html`
- `maquette-evaluations.html`
- `maquette-certificat.html`
- `maquette-dashboard-prof.html`
- `maquette-dashboard-admin.html`
