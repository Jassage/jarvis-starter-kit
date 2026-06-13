# Workspace History

> Journal chronologique de toutes les sessions et décisions importantes.
> Le plus récent en haut. Mis à jour automatiquement par Claude.
>
> **Comment ça marche :** Quand je lance la commande `/update` après une session importante, ou quand je raconte un changement significatif, Claude ajoute une entrée ici automatiquement. Je n'ai pas à écrire ce fichier manuellement.

---

## 2026-06-13

### Analyse du projet SYGS-IMFP (gestion scolaire)
- Analyse complète du projet `livrables/applications/IMFP_PROTOTYPE` à la demande de Jaslin
- Stack : backend Express 5 + TypeScript + Prisma + MySQL (~25 domaines métier), frontend Vite + React 18 + shadcn/ui (269 fichiers). Projet mature (60+ commits, dépôt git propre et séparé)
- Points forts : architecture en couches propre (routes/controllers/services/validators), schéma Prisma solide, RBAC, workflow de validation des notes, audit, sauvegardes
- Problèmes critiques identifiés : JWT_SECRET non secret (blob d'exemple Prisma copié), secrets réels en clair dans .env (mot de passe MySQL + mot de passe d'application Gmail), fallback de secret en dur, CORS trop permissif en dev, pas de helmet
- Constat stratégique : application **mono-établissement**, pas encore SaaS multi-tenant. Valeurs par défaut de SystemSettings orientées Bénin (Cotonou/XOF), pas Haïti
- Corrections appliquées (lot sécurité) : nouveau JWT_SECRET fort généré, suppression du fallback en dur (throw si absent), CORS configurable via CORS_ORIGINS, ajout de helmet
- Actions restant à la charge de Jaslin : révoquer le mot de passe d'application Gmail exposé, changer le mot de passe MySQL, nettoyer les fichiers de debug/test versionnés
- Ajout de SYGS-IMFP à la liste des projets actifs dans CONTEXT.md
- **Décision d'architecture prise : Option A (Silo)** — une instance + une base par école pour les premiers clients, en gardant la couche services comme point d'accès unique aux données pour préparer une éventuelle migration vers le multi-tenant partagé (Option B) plus tard. Refactor multi-tenant complet jugé prématuré avant validation du marché

## 2026-06-12

### Installation initiale du Jarvis
- Workspace personnalisé pour Jaslin, originaire de Gros-Morne et vivant actuellement à Pignon (Haïti)
- Profil principal : mix (étudiant en sciences informatiques, développeur fullstack freelance et professeur de programmation)
- Activité : développement d'applications web et mobile pour entreprises, particuliers et ONG, rémunéré au projet ; enseignement de la programmation ; études universitaires en cours
- Objectifs court terme identifiés : lancer une plateforme e-learning, concevoir un système de gestion hospitalière, développer des SaaS de gestion scolaire et bancaire et obtenir les premiers clients
- Vision long terme : devenir un entrepreneur technologique reconnu, transformer les SaaS en entreprises rentables, atteindre l'indépendance financière et avoir un impact positif en Haïti grâce à la technologie
- Projets actifs au démarrage : enseignement de la programmation, plateforme e-learning (système d'apprentissage en ligne)
- Domaine d'aide prioritaire : architecture et développement des solutions SaaS (conception logicielle, bases de données, multi-tenant, sécurité, scalabilité, stratégie de lancement)
- Style de communication choisi : mélange selon le contexte (direct pour le technique et le débogage, pédagogique pour l'apprentissage et l'architecture)
- Note : le nom "Jarvis" est provisoire, un prénom définitif sera probablement choisi plus tard
