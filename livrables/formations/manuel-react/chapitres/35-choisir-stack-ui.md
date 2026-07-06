<div class="chapitre-titre-num">CHAPITRE 35</div>

# Comment choisir sa stack UI

## 35.1 Il n'existe pas de "meilleur choix" universel

Après avoir vu CSS Modules, Tailwind, Bootstrap, MUI et Ant Design, la question naturelle est : lequel utiliser ? La réponse dépend entièrement du **type de projet**, pas d'une préférence stylistique isolée.

## 35.2 Tableau de décision

| Projet | Choix recommandé | Pourquoi |
|---|---|---|
| Site vitrine, landing page, design très personnalisé | Tailwind CSS ou CSS Modules | Contrôle total du design, aucune contrainte visuelle imposée par une librairie de composants |
| Application de gestion interne (ERP, back-office, beaucoup de tableaux) | Ant Design | `<Table>` avec tri/filtres/pagination intégrés fait gagner un temps considérable |
| Application grand public avec identité de marque forte (SaaS, réseau social) | Tailwind CSS + composants custom | Design sur-mesure sans lutter contre l'apparence imposée d'une librairie |
| MVP à livrer très rapidement, équipe connaissant déjà Bootstrap | React-Bootstrap | Composants prêts à l'emploi, apparence professionnelle par défaut |
| Application suivant strictement le Material Design (cohérence Google/Android) | Material UI | Fidélité totale aux guidelines Material Design |
| Équipe multi-développeurs préférant séparer strictement logique et style | CSS Modules (+ éventuellement Tailwind pour l'utilitaire) | Scoping automatique, pas de classes globales à gérer |

## 35.3 Grille de questions à te poser avant de choisir

1. **Le projet a-t-il beaucoup de tableaux de données complexes (tri, filtres, édition en ligne) ?** → Ant Design fait gagner énormément de temps.
2. **Le design doit-il être unique et distinctif (image de marque forte) ?** → Tailwind CSS (ou CSS Modules) laisse le plus de liberté, sans "look" reconnaissable d'une librairie de composants.
3. **L'équipe a-t-elle déjà de l'expérience avec l'une de ces librairies ?** → La familiarité de l'équipe pèse souvent plus que les qualités théoriques d'un outil.
4. **Le délai de livraison est-il très court ?** → Une librairie de composants complète (MUI, AntD, Bootstrap) accélère fortement par rapport à tout construire à la main avec Tailwind/CSS Modules.
5. **Le projet doit-il rester léger en taille de bundle final ?** → Tailwind (classes générées uniquement pour ce qui est utilisé) et CSS Modules sont plus légers qu'une librairie de composants complète comme MUI ou AntD.

## 35.4 Les choix réels sur les projets de Jaslin

- **EduSpher** (plateforme e-learning grand public) : un design system sur-mesure convient mieux, pour donner une identité propre à la plateforme plutôt qu'un "look Material" ou "look Ant Design" reconnaissable.
- **GESCOM** (ERP ventes/stock/comptabilité) : la refonte de design system observée (Badge/StatCard/PageToolbar/EmptyState, classe `table-shell`) illustre exactement le pattern "composants custom + classes utilitaires cohérentes" — une approche proche de Tailwind, adaptée à une application de gestion sans pour autant adopter Ant Design en bloc.
- **BANKA** (système bancaire complet, RBAC 7 rôles, comptabilité SYSCOHADA) : les nombreux tableaux (transactions, comptes, rapports BRH) en feraient un candidat naturel pour évaluer Ant Design, si une refonte future cherchait à réduire le code de gestion de tableaux écrit à la main.

## 35.5 On peut combiner plusieurs approches

Rien n'empêche d'utiliser Tailwind CSS pour la mise en page générale d'une application, **et** d'importer ponctuellement un composant Ant Design (`<Table>`) uniquement pour un écran spécifique nécessitant un tableau complexe — à condition de garder une cohérence visuelle volontaire (même palette de couleurs, mêmes rayons de bordure) entre les deux systèmes.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Éviter de mélanger 3-4 librairies de composants sans discipline</span>
Combiner MUI **et** Ant Design **et** Bootstrap dans le même projet, chacun avec son propre système de thème et sa propre feuille de style de base, produit rapidement une interface incohérente (boutons de styles visuellement différents selon l'écran) et alourdit inutilement le bundle final (chapitre 42). Si plusieurs librairies coexistent, que ce soit un choix **délibéré et limité** (une seule librairie principale + une seconde pour un besoin très spécifique non couvert), jamais un empilement accidentel au fil du temps.
</div>

## 35.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 35.1</span>

Pour chacun des projets suivants, propose une stack UI et justifie en une phrase : (a) un site portfolio personnel avec un design très original, (b) un logiciel de caisse pour une boutique avec de nombreux tableaux de vente, (c) un MVP à livrer en une semaine pour valider une idée auprès d'investisseurs.
</div>

**Corrigé :**
(a) **Tailwind CSS** — contrôle total du design, aucune contrainte visuelle d'une librairie de composants sur un projet où l'originalité visuelle est l'objectif principal.
(b) **Ant Design** — `<Table>` avec tri/filtres/pagination intégrés correspond exactement au besoin dominant de ce type d'application.
(c) **React-Bootstrap** ou **Material UI** — composants prêts à l'emploi permettant une apparence professionnelle sans investir de temps de design, priorité à la vitesse de livraison.

## 35.7 Résumé du chapitre

- Le choix d'une stack UI dépend du **type de projet** (densité de données, besoin d'identité visuelle, délai, familiarité de l'équipe) — jamais d'une préférence isolée.
- Ant Design excelle pour les back-offices denses en tableaux ; Tailwind/CSS Modules pour un design sur-mesure ; MUI/Bootstrap pour une livraison rapide avec apparence professionnelle par défaut.
- Combiner plusieurs approches est possible mais doit rester un choix délibéré et limité, jamais un empilement accidentel.

*Ceci clôt la Partie 5 (Style et UI). Chapitre suivant : React Hook Form, première étape de la Partie 6 (validation de formulaires).*
