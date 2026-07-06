<div class="chapitre-titre-num">CHAPITRE 47</div>

# Projet final — Cahier des charges et architecture

## 47.1 Présentation : MiniCours, une mini plateforme e-learning

Le projet final de ce manuel consiste à construire **MiniCours**, une plateforme e-learning simplifiée, reprenant en miniature les fonctionnalités essentielles d'une plateforme comme EduSpher. L'objectif n'est pas de reconstruire un produit complet, mais d'**assembler** dans un seul projet cohérent la quasi-totalité des notions vues dans les 46 chapitres précédents.

## 47.2 Cahier des charges fonctionnel

**Trois rôles :**
- **ETUDIANT** : parcourt le catalogue de cours, s'inscrit, suit sa progression, passe des quiz.
- **FORMATEUR** : crée et gère ses propres cours (modules, leçons), consulte la liste de ses étudiants.
- **ADMIN** : gère l'ensemble des utilisateurs, valide/publie les cours, consulte des statistiques globales.

**Fonctionnalités couvertes :**
1. Authentification (inscription, connexion, déconnexion) avec JWT.
2. Autorisation par rôle (RBAC) sur les routes et actions.
3. Tableau de bord avec statistiques et graphiques, différent selon le rôle.
4. CRUD complet des cours (formateur/admin) et des utilisateurs (admin).
5. Upload d'image de couverture pour un cours.
6. Formulaires validés avec React Hook Form + Zod.
7. Navigation protégée par rôle avec React Router.
8. Tests automatisés sur les fonctionnalités critiques.
9. Déploiement sur Vercel.

## 47.3 Stack technique retenue

| Couche | Choix | Chapitre de référence |
|---|---|---|
| Bundler | Vite + React + TypeScript | 2, 18 |
| Navigation | React Router | 19-20 |
| État global | Context API (auth) + Redux Toolkit (catalogue de cours) | 13, 21-22 |
| Requêtes HTTP | Axios | 23-24 |
| Formulaires | React Hook Form + Zod | 36, 38-39 |
| Style | Tailwind CSS | 31 |
| Graphiques | Recharts (librairie de graphiques légère, compatible React) | 49 |
| Tests | Vitest + React Testing Library | 43 |
| Backend (minimal) | Node.js + Express + JWT (fourni, non détaillé — ce manuel est centré React) | 26 |
| Déploiement | Vercel (frontend) | 46 |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi Context API ET Redux Toolkit dans le même projet</span>
Ce choix illustre concrètement le chapitre 22 : l'utilisateur connecté (donnée qui change rarement) reste sur Context API, tandis que le catalogue de cours (filtré, trié, mis à jour par plusieurs composants distants — catalogue, dashboard formateur, recherche) passe par Redux Toolkit, qui bénéficie ici de `useSelector` ciblé et de Redux DevTools pour déboguer les filtres complexes.
</div>

## 47.4 Architecture des dossiers

```
minicours-frontend/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── ui/                    # Button, Card, Badge, Modal (chapitre 5-6)
│   │   ├── EtatRequete.jsx         # chapitre 24
│   │   └── ErrorBoundary.jsx       # chapitre 24
│   ├── pages/
│   │   ├── Accueil.jsx
│   │   ├── Login.jsx
│   │   ├── Inscription.jsx
│   │   ├── etudiant/
│   │   │   ├── DashboardEtudiant.jsx
│   │   │   ├── Catalogue.jsx
│   │   │   └── DetailCours.jsx
│   │   ├── formateur/
│   │   │   ├── DashboardFormateur.jsx
│   │   │   ├── MesCours.jsx
│   │   │   └── EditeurCours.jsx
│   │   └── admin/
│   │       ├── DashboardAdmin.jsx
│   │       ├── GestionUtilisateurs.jsx
│   │       └── ValidationCours.jsx
│   ├── context/
│   │   └── AuthContext.jsx        # chapitre 13, 26
│   ├── store/
│   │   ├── store.js                # chapitre 21
│   │   └── coursSlice.js
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── usePermissions.js       # chapitre 27
│   │   └── useFetch.js             # chapitre 17
│   ├── services/
│   │   ├── api.js                  # chapitre 23, 26
│   │   ├── authService.js
│   │   ├── coursService.js
│   │   └── utilisateursService.js
│   ├── schemas/
│   │   ├── connexionSchema.ts      # chapitre 38
│   │   └── coursSchema.ts
│   ├── components/routes/
│   │   ├── RouteProtegee.jsx       # chapitre 20
│   │   └── RouteParRole.jsx        # chapitre 20
│   ├── App.jsx
│   └── main.jsx
└── vite.config.js
```

## 47.5 Modèle de données simplifié

```ts
// Types partagés (chapitre 18)
interface Utilisateur {
  id: number;
  nom: string;
  email: string;
  role: "ETUDIANT" | "FORMATEUR" | "ADMIN";
}

interface Cours {
  id: number;
  titre: string;
  description: string;
  imageCouverture: string | null;
  formateurId: number;
  statut: "BROUILLON" | "PUBLIE";
  modules: Module[];
}

interface Module {
  id: number;
  titre: string;
  lecons: Lecon[];
}

interface Lecon {
  id: number;
  titre: string;
  type: "VIDEO" | "TEXTE" | "QUIZ";
  terminee: boolean; // du point de vue de l'étudiant connecté
}

interface Inscription {
  id: number;
  utilisateurId: number;
  coursId: number;
  progression: number; // pourcentage 0-100
}
```

## 47.6 Découpage du travail sur les chapitres suivants

- **Chapitre 48** : authentification JWT + RBAC (routes protégées par rôle).
- **Chapitre 49** : tableaux de bord avec statistiques et graphiques (Recharts).
- **Chapitre 50** : CRUD cours (formateur/admin) et utilisateurs (admin).
- **Chapitre 51** : upload de l'image de couverture d'un cours.
- **Chapitre 52** : tests automatisés sur l'authentification et le CRUD cours.
- **Chapitre 53** : déploiement final sur Vercel.

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce n'est pas un exercice supplémentaire, c'est une synthèse</span>
Contrairement aux exercices des chapitres précédents, les chapitres 48 à 53 ne proposent pas d'exercice corrigé séparé : le projet **est** l'exercice. Chaque section assemble directement du code déjà expliqué en détail dans les chapitres correspondants, sans réexpliquer les concepts de base.
</div>

## 47.7 Résumé du chapitre

- MiniCours reprend les trois rôles et fonctionnalités essentielles d'EduSpher, à échelle réduite, pour servir de synthèse pratique du manuel.
- La stack combine délibérément Context API et Redux Toolkit, chacun sur le domaine de données qui lui correspond le mieux (chapitre 22).
- L'architecture de dossiers reprend exactement les conventions vues au chapitre 3, appliquées à un projet réel de taille modeste.
- Les 6 chapitres suivants construisent MiniCours fonctionnalité par fonctionnalité, jusqu'au déploiement.

*Chapitre suivant : authentification JWT et gestion des rôles, la fondation du projet MiniCours.*
