# Manuel complet React — Sommaire détaillé

> Document de travail : ce sommaire doit être validé par Jaslin avant rédaction des chapitres.
> Chaque chapitre visé : ~5-8 pages une fois exporté (théorie + exemples + bonnes pratiques + erreurs fréquentes + exercices corrigés).

## Partie 1 — Fondamentaux
1. Introduction à React (ce que c'est, virtual DOM, écosystème, quand l'utiliser vs autre chose)
2. Installation et environnement avec Vite
3. Structure d'un projet React
4. JSX en profondeur
5. Les composants (fonction, organisation, composition)
6. Les props
7. Le state avec useState
8. Les événements
9. Le rendu conditionnel
10. Les listes et les clés (keys)

## Partie 2 — Formulaires et Hooks
11. Les formulaires (contrôlés vs non contrôlés)
12. useEffect en profondeur (cycle de vie, dépendances, cleanup)
13. Context API et useContext
14. useReducer
15. useMemo et useCallback
16. useRef
17. Créer ses propres hooks personnalisés
18. TypeScript avec React (typer props, state, hooks, événements)

## Partie 3 — Navigation et état global
19. React Router (routes, params, navigation programmatique)
20. Navigation protégée (routes privées, redirections, rôles)
21. Redux Toolkit (store, slices, thunks, RTK Query en aperçu)
22. Choisir entre Context API et Redux

## Partie 4 — Communication avec le backend
23. Axios et consommation d'API REST
24. Gestion des erreurs et des états de chargement
25. Téléversement de fichiers
26. Authentification JWT
27. Autorisation selon les rôles (RBAC)
28. Stockage local (LocalStorage/SessionStorage) et sécurité (XSS, tokens)

## Partie 5 — Style et UI
29. Responsive Design en React
30. CSS Modules
31. Tailwind CSS
32. Bootstrap (React-Bootstrap)
33. Material UI (MUI)
34. Ant Design
35. Comment choisir sa stack UI selon le projet

## Partie 6 — Validation de formulaires
36. React Hook Form
37. Validation avec Yup
38. Validation avec Zod
39. Combo recommandé : React Hook Form + Zod

## Partie 7 — Performance
40. Optimisation des performances et re-renders (React DevTools Profiler)
41. Lazy Loading et Suspense
42. Code Splitting

## Partie 8 — Qualité et mise en production
43. Tests avec Jest et React Testing Library
44. Accessibilité (ARIA)
45. SEO en React (SSR/SSG en bref, meta tags, React Helmet)
46. Déploiement (Vercel, Netlify)

## Partie 9 — Projet final (application de gestion, ex. mini plateforme e-learning)
47. Cahier des charges et architecture du projet final
48. Authentification et gestion des rôles
49. Tableau de bord et statistiques (graphiques)
50. CRUD complets (utilisateurs, contenus)
51. Upload de fichiers
52. Tests du projet final
53. Déploiement du projet final

## Annexes
A. Aide-mémoire des hooks (cheat sheet)
B. Récapitulatif des erreurs fréquentes et solutions
C. Glossaire des termes React
D. Ressources pour aller plus loin

---

**Total : 53 chapitres + 4 annexes.**

## Points à valider avec Jaslin

1. Le projet final : je propose une **mini plateforme e-learning simplifiée** (cohérent avec ton projet EduSpher, donc plus facile à réutiliser pédagogiquement). OK ou tu préfères ERP/gestion hospitalière ?
2. Node.js/Express minimal sera fourni pour le backend du projet final (juste ce qu'il faut pour consommer une vraie API), pas un cours backend complet — confirme que c'est bien ce que tu veux.
3. Ordre de rédaction : je pars chapitre 1 puis dans l'ordre, sauf si tu préfères prioriser une partie (ex: Hooks ou Projet final en premier).
4. Export : Markdown source → HTML stylé (lisible dans le navigateur, imprimable en PDF) + conversion Word (.docx) et PDF via Pandoc, générés à la fin (ou au fur et à mesure si tu préfères vérifier le rendu dès les premiers chapitres).
