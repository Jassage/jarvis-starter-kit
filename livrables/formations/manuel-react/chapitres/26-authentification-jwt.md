<div class="chapitre-titre-num">CHAPITRE 26</div>

# Authentification JWT

## 26.1 Rappel du principe JWT côté serveur

Un **JWT** (JSON Web Token) est une chaîne encodée (pas chiffrée !) contenant des informations sur l'utilisateur (son id, parfois son rôle) et signée cryptographiquement par le serveur. Le frontend ne fait jamais que **transporter** ce token ; toute la logique de génération et de vérification vit côté backend. Ce chapitre se concentre sur la partie React : comment stocker, transmettre et rafraîchir ce token.

<div class="encadre attention">
<span class="encadre-titre">⚠️ Un JWT n'est pas chiffré, juste signé</span>
N'importe qui peut décoder un JWT et lire son contenu (essaie sur jwt.io) — seule la signature empêche de le **modifier** sans être détecté. Ne mets jamais d'information sensible (mot de passe, numéro de carte...) dans le payload d'un JWT.
</div>

## 26.2 Approche simple (et ses limites) : tout dans localStorage

L'approche la plus simple à mettre en place, souvent vue dans les tutoriels d'introduction :

```jsx
// services/authService.js
import api from "./api";

export async function connecter(email, motDePasse) {
  const reponse = await api.post("/auth/login", { email, motDePasse });
  localStorage.setItem("token", reponse.data.token);
  return reponse.data.utilisateur;
}

export function deconnecter() {
  localStorage.removeItem("token");
}
```

```jsx
// services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Pourquoi cette approche est déconseillée en production</span>
Tout script JavaScript exécuté sur la page (y compris un script malveillant injecté via une faille XSS dans une librairie tierce, une publicité compromise, ou une dépendance npm piratée) peut lire `localStorage` et voler le token. Un token volé de cette façon reste utilisable **jusqu'à son expiration**, sans aucun moyen de le révoquer immédiatement à distance. C'est exactement la faille identifiée sur KONEKTE lors d'un audit sécurité : un JWT unique de 7 jours en localStorage, volable via une seule faille XSS, non révocable avant expiration.
</div>

## 26.3 Approche recommandée : access token en mémoire + refresh token en cookie httpOnly

L'approche professionnelle recommandée sépare deux tokens aux rôles différents :

- **Access token** : durée de vie **courte** (10-15 minutes), gardé uniquement **en mémoire JavaScript** (jamais persisté), transmis via le header `Authorization`.
- **Refresh token** : durée de vie plus longue, stocké dans un **cookie httpOnly** (donc totalement invisible et inaccessible à tout JavaScript, y compris un script malveillant), envoyé automatiquement par le navigateur sur les requêtes vers le domaine de l'API.

```jsx
// context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // en mémoire uniquement, jamais persisté
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Au démarrage de l'application : tenter de restaurer la session via le cookie httpOnly
    api.post("/auth/refresh", {}, { withCredentials: true })
      .then((reponse) => {
        setAccessToken(reponse.data.accessToken);
        setUtilisateur(reponse.data.utilisateur);
      })
      .catch(() => {
        setUtilisateur(null); // aucune session valide, l'utilisateur devra se reconnecter
      })
      .finally(() => setChargement(false));
  }, []);

  async function connecter(email, motDePasse) {
    const reponse = await api.post(
      "/auth/login",
      { email, motDePasse },
      { withCredentials: true } // permet au navigateur de recevoir/envoyer le cookie httpOnly
    );
    setAccessToken(reponse.data.accessToken);
    setUtilisateur(reponse.data.utilisateur);
  }

  async function deconnecter() {
    await api.post("/auth/logout", {}, { withCredentials: true }); // révoque le refresh token en base côté serveur
    setAccessToken(null);
    setUtilisateur(null);
  }

  return (
    <AuthContext.Provider value={{ utilisateur, accessToken, chargement, connecter, deconnecter }}>
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

<div class="encadre astuce">
<span class="encadre-titre">💡 withCredentials : indispensable pour les cookies cross-origin</span>
Si le frontend et le backend tournent sur des domaines/ports différents (cas courant en développement : `localhost:5173` vs `localhost:4000`), Axios n'envoie **pas** les cookies par défaut. `withCredentials: true` (ou `axios.defaults.withCredentials = true` une seule fois dans la config) l'active explicitement. Le serveur doit, en miroir, configurer CORS avec `credentials: true` et une origine précise (jamais `*` avec des credentials).
</div>

## 26.4 Rafraîchir automatiquement un token expiré (intercepteur de réponse)

```jsx
// services/api.js
api.interceptors.request.use((config) => {
  if (accessTokenActuel) {
    config.headers.Authorization = `Bearer ${accessTokenActuel}`;
  }
  return config;
});

api.interceptors.response.use(
  (reponse) => reponse,
  async (erreur) => {
    const requeteOriginale = erreur.config;

    if (erreur.response?.status === 401 && !requeteOriginale._dejaRetentee) {
      requeteOriginale._dejaRetentee = true; // évite une boucle infinie de tentatives
      try {
        const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });
        accessTokenActuel = data.accessToken;
        requeteOriginale.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(requeteOriginale); // rejoue la requête originale avec le nouveau token
      } catch {
        // Le refresh token est lui-même invalide/expiré : déconnexion forcée
        window.location.href = "/login";
      }
    }
    return Promise.reject(erreur);
  }
);
```

Ce mécanisme rend le rafraîchissement **invisible pour l'utilisateur** : si l'access token a expiré pendant qu'il utilisait l'application, la requête échoue une fois en silence, un nouveau token est obtenu via le refresh token, et la requête originale est rejouée automatiquement.

## 26.5 Déconnexion réelle : la révoquer aussi côté serveur

<div class="encadre attention">
<span class="encadre-titre">⚠️ Une "déconnexion" qui ne fait qu'effacer le state React ne révoque rien</span>
```jsx
// ❌ Insuffisant : le refresh token reste valide côté serveur, un cookie volé reste utilisable
function deconnecter() {
  setUtilisateur(null);
  setAccessToken(null);
}
```
Une vraie déconnexion doit appeler une route serveur qui **invalide le refresh token en base de données** (comme vu au chapitre 20 sur la sécurité côté serveur). Sans cet appel, effacer uniquement le state côté React n'empêche pas un cookie volé (par exemple via un poste partagé mal sécurisé) de continuer à fonctionner jusqu'à son expiration naturelle.
</div>

## 26.6 Résumé comparatif des deux approches

| | localStorage (simple) | access en mémoire + refresh en cookie httpOnly (recommandé) |
|---|---|---|
| Vulnérable au vol via XSS | Oui, directement | Non pour le refresh token (invisible en JS) |
| Révocable à distance | Non, avant expiration | Oui, en supprimant le refresh token en base |
| Complexité de mise en place | Faible | Modérée (cookies, CORS, intercepteurs) |
| Recommandé pour | Prototypes, apprentissage | Toute application en production |

## 26.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 26.1</span>

Explique pourquoi stocker un JWT dans une variable `let token` au niveau module (comme `accessTokenActuel` dans l'exemple 26.4) au lieu du state React est un choix délibéré, et pas un oubli.
</div>

**Corrigé :** Un intercepteur Axios est configuré **une seule fois**, hors du cycle de rendu React, et n'a pas accès direct au state d'un composant (qui n'existe que dans le contexte d'un rendu). Une variable de module partagée (mise à jour par `AuthContext` via une fonction exposée, ou lue depuis un store externe) permet à l'intercepteur d'accéder toujours à la valeur la plus récente du token, indépendamment du cycle de vie des composants React.

## 26.8 Résumé du chapitre

- Un JWT est signé, pas chiffré : jamais d'information sensible dans son payload.
- localStorage est simple mais vulnérable au vol via XSS et non révocable avant expiration — acceptable pour l'apprentissage, déconseillé en production.
- L'approche recommandée : access token courte durée en mémoire + refresh token longue durée en cookie httpOnly, avec `withCredentials: true`.
- Un intercepteur de réponse Axios peut rafraîchir automatiquement un token expiré et rejouer la requête, de façon invisible pour l'utilisateur.
- La déconnexion doit toujours révoquer le refresh token côté serveur, pas seulement effacer le state React local.

*Chapitre suivant : l'autorisation selon les rôles, pour contrôler précisément qui peut faire quoi une fois authentifié.*
