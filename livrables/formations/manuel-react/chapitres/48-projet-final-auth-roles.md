<div class="chapitre-titre-num">CHAPITRE 48</div>

# Projet final — Authentification et gestion des rôles

## 48.1 Le service d'authentification

```jsx
// services/api.js — instance centralisée (chapitre 23)
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // cookie httpOnly du refresh token (chapitre 26)
});

let accessTokenActuel = null;
export function definirAccessToken(token) {
  accessTokenActuel = token;
}

api.interceptors.request.use((config) => {
  if (accessTokenActuel) {
    config.headers.Authorization = `Bearer ${accessTokenActuel}`;
  }
  return config;
});

export default api;
```

```jsx
// services/authService.js
import api, { definirAccessToken } from "./api";

export async function connecter(email, motDePasse) {
  const { data } = await api.post("/auth/login", { email, motDePasse });
  definirAccessToken(data.accessToken);
  return data.utilisateur;
}

export async function inscrire(donnees) {
  const { data } = await api.post("/auth/register", donnees);
  definirAccessToken(data.accessToken);
  return data.utilisateur;
}

export async function rafraichirSession() {
  const { data } = await api.post("/auth/refresh");
  definirAccessToken(data.accessToken);
  return data.utilisateur;
}

export async function deconnecter() {
  await api.post("/auth/logout");
  definirAccessToken(null);
}
```

## 48.2 AuthContext complet (chapitres 13 et 26 assemblés)

```jsx
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    authService
      .rafraichirSession()
      .then(setUtilisateur)
      .catch(() => setUtilisateur(null))
      .finally(() => setChargement(false));
  }, []);

  async function connecter(email, motDePasse) {
    const donneesUtilisateur = await authService.connecter(email, motDePasse);
    setUtilisateur(donneesUtilisateur);
  }

  async function inscrire(donnees) {
    const donneesUtilisateur = await authService.inscrire(donnees);
    setUtilisateur(donneesUtilisateur);
  }

  async function deconnecter() {
    await authService.deconnecter();
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, chargement, connecter, inscrire, deconnecter }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexte = useContext(AuthContext);
  if (!contexte) throw new Error("useAuth doit être utilisé dans un AuthProvider");
  return contexte;
}
```

## 48.3 Le formulaire de connexion (React Hook Form + Zod, chapitre 39)

```ts
// schemas/connexionSchema.ts
import { z } from "zod";

export const connexionSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

export type ConnexionDonnees = z.infer<typeof connexionSchema>;
```

```tsx
// pages/Login.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { connexionSchema, ConnexionDonnees } from "../schemas/connexionSchema";

function Login() {
  const { connecter } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [erreurServeur, setErreurServeur] = useState(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ConnexionDonnees>({
    resolver: zodResolver(connexionSchema),
  });

  async function onSubmit(donnees) {
    try {
      setErreurServeur(null);
      await connecter(donnees.email, donnees.motDePasse);
      const destination = location.state?.depuis || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setErreurServeur("Email ou mot de passe incorrect");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-sm mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Connexion</h1>

      <div>
        <input {...register("email")} placeholder="Email" className="w-full p-2 border rounded" />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
      </div>

      <div>
        <input type="password" {...register("motDePasse")} placeholder="Mot de passe" className="w-full p-2 border rounded" />
        {errors.motDePasse && <p className="text-red-600 text-sm">{errors.motDePasse.message}</p>}
      </div>

      {erreurServeur && <p className="text-red-600 text-sm">{erreurServeur}</p>}

      <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded disabled:opacity-50">
        {isSubmitting ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
}

export default Login;
```

## 48.4 Redirection par rôle après connexion vers le bon dashboard

```jsx
// Après connexion réussie, chaque rôle atterrit sur SON tableau de bord (chapitre 49)
function DashboardRouteur() {
  const { utilisateur } = useAuth();

  switch (utilisateur.role) {
    case "ETUDIANT":
      return <Navigate to="/dashboard/etudiant" replace />;
    case "FORMATEUR":
      return <Navigate to="/dashboard/formateur" replace />;
    case "ADMIN":
      return <Navigate to="/dashboard/admin" replace />;
    default:
      return <Navigate to="/" replace />;
  }
}
```

## 48.5 Routes protégées par rôle (chapitre 20 appliqué)

```jsx
// App.jsx
import { RouteProtegee } from "./components/routes/RouteProtegee";
import { RouteParRole } from "./components/routes/RouteParRole";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Accueil />} />
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />

      <Route element={<RouteProtegee />}>
        <Route path="/dashboard" element={<DashboardRouteur />} />

        <Route element={<RouteParRole rolesAutorises={["ETUDIANT"]} />}>
          <Route path="/dashboard/etudiant" element={<DashboardEtudiant />} />
          <Route path="/catalogue" element={<Catalogue />} />
        </Route>

        <Route element={<RouteParRole rolesAutorises={["FORMATEUR"]} />}>
          <Route path="/dashboard/formateur" element={<DashboardFormateur />} />
          <Route path="/mes-cours" element={<MesCours />} />
        </Route>

        <Route element={<RouteParRole rolesAutorises={["ADMIN"]} />}>
          <Route path="/dashboard/admin" element={<DashboardAdmin />} />
          <Route path="/admin/utilisateurs" element={<GestionUtilisateurs />} />
        </Route>
      </Route>

      <Route path="*" element={<PageIntrouvable />} />
    </Routes>
  );
}
```

## 48.6 Permissions fines à l'intérieur d'une page (chapitre 27)

```jsx
// hooks/usePermissions.js
const PERMISSIONS_PAR_ROLE = {
  ETUDIANT: ["voir_cours", "soumettre_quiz"],
  FORMATEUR: ["voir_cours", "creer_cours", "modifier_cours", "voir_etudiants"],
  ADMIN: ["voir_cours", "creer_cours", "modifier_cours", "voir_etudiants", "gerer_utilisateurs", "valider_cours"],
};

export function usePermissions() {
  const { utilisateur } = useAuth();
  function peut(permission) {
    return utilisateur ? (PERMISSIONS_PAR_ROLE[utilisateur.role] || []).includes(permission) : false;
  }
  return { peut };
}
```

```jsx
// pages/formateur/MesCours.jsx
function MesCours() {
  const { peut } = usePermissions();
  return (
    <div>
      <h1>Mes cours</h1>
      {peut("creer_cours") && <BoutonCreerCours />}
      {/* ... */}
    </div>
  );
}
```

## 48.7 Résumé du chapitre

- `AuthContext` assemble le pattern Provider + hook du chapitre 13 avec le cycle access token/refresh token du chapitre 26.
- Le formulaire de connexion combine React Hook Form + Zod (chapitre 39), avec redirection post-connexion vers la page initialement demandée (chapitre 20).
- Chaque rôle est redirigé vers son propre dashboard après connexion ; les routes de chaque espace sont protégées par `RouteParRole`.
- `usePermissions` (chapitre 27) affine le contrôle d'accès à l'intérieur même d'une page, au-delà du simple accès à la route.

*Chapitre suivant : les tableaux de bord avec statistiques et graphiques, un par rôle.*
