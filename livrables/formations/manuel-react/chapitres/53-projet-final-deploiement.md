<div class="chapitre-titre-num">CHAPITRE 53</div>

# Projet final — Déploiement

## 53.1 Checklist avant déploiement

Avant de déployer MiniCours (chapitre 46 appliqué), une checklist de vérification finale :

- [ ] `npm run build` se termine sans erreur.
- [ ] `npm run preview` (chapitre 2) affiche l'application correctement en local, en mode production.
- [ ] Toutes les variables `VITE_*` nécessaires sont identifiées et prêtes à être configurées sur Vercel.
- [ ] Les tests automatisés (chapitre 52) passent (`npx vitest --run`).
- [ ] Aucun `console.log` de débogage oublié dans le code de production.
- [ ] Le fichier `.env` local (contenant potentiellement des URLs de développement) est bien listé dans `.gitignore`, jamais commité.

## 53.2 Variables d'environnement de MiniCours

```
# .env.production (jamais commité, configuré directement dans Vercel)
VITE_API_URL=https://minicours-api.railway.app/api
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Rappel du chapitre 46 : ces variables sont figées au build</span>
Si l'URL de l'API backend change après le premier déploiement (migration d'hébergeur, par exemple), il ne suffit pas de modifier la variable dans les Settings Vercel : un **nouveau déploiement** doit être déclenché pour que le changement prenne effet (un simple `git push` vide, ou un redéploiement manuel depuis le tableau de bord Vercel).
</div>

## 53.3 Configuration du fichier vercel.json

```json
// vercel.json — réécriture SPA (chapitre 46) indispensable pour React Router (chapitre 19)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sans ce fichier, rafraîchir directement l'URL `/dashboard/etudiant` ou `/mes-cours/42` après déploiement produirait une erreur 404 — exactement le piège décrit en détail au chapitre 46.

## 53.4 Déploiement effectif

```
$ git add .
$ git commit -m "MiniCours : version finale prête pour déploiement"
$ git push origin main
```

```
1. vercel.com → "Add New Project" → sélectionner le dépôt "minicours-frontend"
2. Vercel détecte Vite automatiquement (Framework Preset: Vite)
3. Ajouter VITE_API_URL dans Environment Variables
4. "Deploy"

✅ Production: https://minicours.vercel.app
```

## 53.5 Vérification post-déploiement

Une checklist de vérification manuelle en conditions réelles, complémentaire aux tests automatisés du chapitre 52 :

1. Créer un compte étudiant, se connecter, naviguer vers `/dashboard/etudiant`.
2. **Rafraîchir la page** sur une route profonde (`/catalogue`) — vérifier l'absence de 404 (chapitre 46).
3. Se connecter en tant que formateur, créer un cours avec image de couverture (chapitres 50-51).
4. Tenter d'accéder à `/admin/utilisateurs` avec un compte étudiant — vérifier la redirection (chapitre 20).
5. Vérifier la console du navigateur : aucune erreur, aucun avertissement React non attendu.
6. Tester sur mobile (responsive, chapitre 29) : menu, formulaires, dashboards restent utilisables.

## 53.6 Ce que ce projet final a assemblé

<div class="encadre astuce">
<span class="encadre-titre">💡 Récapitulatif de bout en bout</span>
MiniCours a mobilisé, dans un seul projet cohérent : composants et props (partie 1), tous les hooks fondamentaux et TypeScript (partie 2), React Router et Redux Toolkit combinés avec Context API selon le bon usage de chacun (partie 3), Axios/JWT/RBAC/stockage sécurisé (partie 4), Tailwind CSS (partie 5), React Hook Form + Zod (partie 6), les bases de l'optimisation et du code splitting (partie 7), et enfin tests + déploiement (partie 8). C'est exactement la même méthodologie qui sous-tend la construction de tes projets réels (EduSpher, BANKA, GESCOM, LAKAY, KONEKTE, MEDIKA) : les mêmes briques, assemblées selon les besoins spécifiques de chaque produit.
</div>

## 53.7 Pour aller plus loin après ce manuel

- Migrer MiniCours vers **Next.js** pour un vrai SSR (chapitre 45), si un besoin SEO public apparaît (ex : rendre le catalogue de cours indexable par Google).
- Ajouter des tests end-to-end avec **Playwright** (déjà utilisé dans plusieurs sessions de travail sur BANKA/GESCOM/EduSpher), complémentaires aux tests unitaires/composants du chapitre 52.
- Explorer **RTK Query** (chapitre 21) pour remplacer les appels Axios manuels par un cache automatique.
- Ajouter un système de paiement (Stripe/MonCash, comme sur EduSpher/LAKAY) pour les cours payants.
- Consulter les annexes de ce manuel (aide-mémoire des hooks, glossaire, ressources) comme référence rapide au quotidien.

## 53.8 Résumé du chapitre

- Une checklist de vérification (build, preview, tests, variables d'environnement) précède tout déploiement réel.
- `vercel.json` avec une règle de réécriture reste indispensable pour toute application utilisant React Router.
- La vérification post-déploiement en conditions réelles (rafraîchissement sur route profonde, permissions par rôle, responsive) complète les tests automatisés, sans les remplacer.
- Ce projet final a mobilisé l'ensemble des notions du manuel, de l'introduction à React jusqu'au déploiement en production.

*Ceci clôt la Partie 9 et le corps principal du manuel. Les annexes suivantes (aide-mémoire, erreurs fréquentes, glossaire, ressources) servent de référence rapide pour la suite de ta pratique.*
