<div class="chapitre-titre-num">CHAPITRE 20</div>

# Navigation protégée

## 20.1 Le besoin : empêcher l'accès à certaines pages

Une page comme `/dashboard` ne doit être visible que par un utilisateur **connecté**. Une page comme `/admin` ne doit être visible que par un utilisateur ayant le **rôle** administrateur. React Router ne fournit pas ce mécanisme "clé en main" : on le construit avec un composant dédié qui enveloppe les routes à protéger.

## 20.2 Composant RouteProtegee (connexion requise)

```jsx
// components/RouteProtegee.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // vu au chapitre 13

function RouteProtegee() {
  const { utilisateur, chargement } = useAuth();

  if (chargement) {
    return <p>Vérification de la session...</p>;
  }

  if (!utilisateur) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />; // utilisateur connecté : affiche la route enfant demandée
}

export default RouteProtegee;
```

```jsx
// App.jsx
<Routes>
  <Route path="/login" element={<Login />} />

  <Route element={<RouteProtegee />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profil" element={<Profil />} />
  </Route>

  <Route path="*" element={<PageIntrouvable />} />
</Routes>
```

Toute route déclarée **à l'intérieur** de `<Route element={<RouteProtegee />}>` hérite automatiquement de la vérification : si `utilisateur` est `null`, `<Navigate to="/login" />` redirige avant même que `Dashboard` ne soit affiché.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Attendre la fin de la vérification avant de rediriger</span>
Si l'état de connexion vient d'un token stocké et vérifié auprès du serveur au démarrage de l'application (chapitre 26), il existe un court instant où l'on ne sait pas encore si l'utilisateur est connecté. Rediriger immédiatement vers `/login` pendant ce court instant renverrait à tort un utilisateur pourtant bien connecté. C'est pourquoi `chargement` doit être vérifié **avant** `utilisateur` dans `RouteProtegee`.
</div>

## 20.3 Protection par rôle (RBAC)

```jsx
// components/RouteParRole.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RouteParRole({ rolesAutorises }) {
  const { utilisateur, chargement } = useAuth();

  if (chargement) return <p>Vérification...</p>;
  if (!utilisateur) return <Navigate to="/login" replace />;

  if (!rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to="/acces-refuse" replace />;
  }

  return <Outlet />;
}

export default RouteParRole;
```

```jsx
<Route element={<RouteParRole rolesAutorises={["ADMIN"]} />}>
  <Route path="/admin" element={<PanneauAdmin />} />
</Route>

<Route element={<RouteParRole rolesAutorises={["ADMIN", "FORMATEUR"]} />}>
  <Route path="/gestion-cours" element={<GestionCours />} />
</Route>
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Cas réel</span>
C'est exactement ce pattern qui a été appliqué sur EduSpher (dashboards formateur/admin/étudiant distincts) et sur BANKA (RBAC à 7 rôles) : chaque groupe de routes déclare précisément quels rôles y ont accès, dans un seul composant réutilisable plutôt que de dupliquer la vérification dans chaque page.
</div>

## 20.4 Rediriger vers la page initialement demandée après connexion

Un détail d'expérience utilisateur important : si un utilisateur non connecté essaie d'accéder à `/dashboard/parametres`, après connexion, il devrait atterrir sur `/dashboard/parametres`, pas systématiquement sur `/dashboard`.

```jsx
// components/RouteProtegee.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";

function RouteProtegee() {
  const { utilisateur, chargement } = useAuth();
  const location = useLocation();

  if (chargement) return <p>Vérification...</p>;
  if (!utilisateur) {
    // on transporte l'URL demandée dans le state de navigation
    return <Navigate to="/login" replace state={{ depuis: location.pathname }} />;
  }
  return <Outlet />;
}
```

```jsx
// pages/Login.jsx
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  async function gererConnexion() {
    // ... logique de connexion ...
    const destination = location.state?.depuis || "/dashboard";
    navigate(destination, { replace: true });
  }
}
```

## 20.5 Sécurité : la protection frontend n'est jamais suffisante

<div class="encadre attention">
<span class="encadre-titre">⚠️ La vérification côté React n'est qu'un confort d'interface, pas une sécurité réelle</span>
`RouteProtegee` et `RouteParRole` améliorent l'**expérience utilisateur** (éviter d'afficher un écran qu'il ne devrait pas voir), mais n'importe qui peut ouvrir les outils de développement du navigateur et contourner cette vérification côté client. **La vraie sécurité doit toujours être appliquée côté serveur** (backend) : chaque route API sensible doit revérifier l'authentification et le rôle à chaque requête, indépendamment de ce qu'affiche le frontend. C'est exactement la faille qui avait été corrigée sur KONEKTE (RBAC admin absent côté backend) : la garde ajoutée côté frontend n'était qu'un complément, le vrai correctif était le middleware `requireAdmin` vérifié en base à chaque requête.
</div>

## 20.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 20.1</span>

Explique en une phrase pourquoi ce code est une faille de sécurité s'il constitue la **seule** protection d'une fonctionnalité sensible :
```jsx
function PanneauAdmin() {
  const { utilisateur } = useAuth();
  if (utilisateur.role !== "ADMIN") return <p>Accès refusé</p>;
  return <BoutonSupprimerTousLesComptes />;
}
```
</div>

**Corrigé :** Cette vérification n'empêche que l'**affichage** du bouton côté frontend ; si la route API `DELETE /api/comptes` derrière `BoutonSupprimerTousLesComptes` ne revérifie pas elle-même le rôle côté serveur, n'importe qui connaissant l'URL de l'API peut appeler cette route directement (via Postman, curl, ou la console réseau du navigateur) sans jamais passer par cette interface, contournant totalement la protection.

## 20.7 Résumé du chapitre

- `RouteProtegee` (via `<Navigate>` et `<Outlet>`) redirige un utilisateur non connecté avant d'afficher une route sensible.
- `RouteParRole` généralise ce mécanisme au contrôle d'accès par rôle (RBAC).
- Toujours attendre la fin de la vérification de session (`chargement`) avant de décider de rediriger.
- Transporter l'URL initialement demandée via `location.state` pour y renvoyer l'utilisateur après connexion.
- **La protection frontend est un confort d'UX, jamais une sécurité réelle** : chaque route backend doit revérifier authentification et rôle indépendamment.

*Chapitre suivant : Redux Toolkit, pour gérer un state global complexe et partagé par de nombreux composants.*
