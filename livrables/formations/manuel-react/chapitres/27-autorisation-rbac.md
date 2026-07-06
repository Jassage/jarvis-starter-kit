<div class="chapitre-titre-num">CHAPITRE 27</div>

# Autorisation selon les rôles (RBAC)

## 27.1 Authentification vs autorisation : une distinction essentielle

- **Authentification** (chapitre 26) : *qui es-tu ?* — vérifier l'identité d'un utilisateur.
- **Autorisation** (ce chapitre) : *qu'as-tu le droit de faire ?* — une fois l'identité connue, déterminer les actions et pages accessibles.

Le **RBAC** (*Role-Based Access Control*, contrôle d'accès basé sur les rôles) est le modèle le plus répandu : chaque utilisateur a un ou plusieurs **rôles** (`ETUDIANT`, `FORMATEUR`, `ADMIN`...), et chaque rôle donne accès à un ensemble de fonctionnalités précis.

## 27.2 Exposer le rôle dans le contexte d'authentification

```jsx
// L'utilisateur retourné par /auth/login ou /auth/refresh (chapitre 26) contient son rôle
{
  id: 42,
  nom: "Jaslin",
  email: "jaslin@example.com",
  role: "FORMATEUR"
}
```

## 27.3 Un hook de vérification de permissions

```jsx
// hooks/usePermissions.js
import { useAuth } from "../context/AuthContext";

const PERMISSIONS_PAR_ROLE = {
  ETUDIANT: ["voir_cours", "soumettre_quiz"],
  FORMATEUR: ["voir_cours", "creer_cours", "modifier_cours", "voir_etudiants"],
  ADMIN: ["voir_cours", "creer_cours", "modifier_cours", "voir_etudiants", "gerer_utilisateurs", "gerer_revenus"],
};

export function usePermissions() {
  const { utilisateur } = useAuth();

  function peut(permission) {
    if (!utilisateur) return false;
    const permissions = PERMISSIONS_PAR_ROLE[utilisateur.role] || [];
    return permissions.includes(permission);
  }

  return { peut };
}
```

```jsx
function BoutonCreerCours() {
  const { peut } = usePermissions();
  if (!peut("creer_cours")) return null;
  return <button>Créer un nouveau cours</button>;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi une table de permissions plutôt que des if role === "..." partout</span>
```jsx
// ❌ Logique de rôle éparpillée dans toute l'application, difficile à auditer et à faire évoluer
if (utilisateur.role === "ADMIN" || utilisateur.role === "FORMATEUR") { ... }
```
Centraliser les permissions dans une seule table (`PERMISSIONS_PAR_ROLE`) rend le système d'autorisation **lisible d'un coup d'œil**, facile à modifier (ajouter un rôle "MODERATEUR" ne touche qu'un seul fichier), et plus facile à faire correspondre exactement aux permissions vérifiées côté backend.
</div>

## 27.4 Composant conditionnel réutilisable : `<PeutAcceder>`

```jsx
// components/PeutAcceder.jsx
import { usePermissions } from "../hooks/usePermissions";

function PeutAcceder({ permission, children, repli = null }) {
  const { peut } = usePermissions();
  return peut(permission) ? children : repli;
}

export default PeutAcceder;
```

```jsx
function BarreOutilsCours() {
  return (
    <div>
      <PeutAcceder permission="modifier_cours">
        <button>Modifier</button>
      </PeutAcceder>
      <PeutAcceder permission="gerer_utilisateurs" repli={<p>Section réservée aux administrateurs</p>}>
        <PanneauUtilisateurs />
      </PeutAcceder>
    </div>
  );
}
```

## 27.5 Rôles multiples et hiérarchie

Certains systèmes (comme BANKA, avec ses 7 rôles) ont besoin d'une **hiérarchie** plutôt que d'une simple liste plate, où un rôle "supérieur" hérite automatiquement des droits des rôles "inférieurs" :

```jsx
const NIVEAU_HIERARCHIE = {
  VISITEUR: 0,
  EMPLOYE: 10,
  GERANT: 20,
  SUPER_ADMIN: 100,
};

function aAuMoinsLeNiveau(utilisateur, roleMinimum) {
  if (!utilisateur) return false;
  return NIVEAU_HIERARCHIE[utilisateur.role] >= NIVEAU_HIERARCHIE[roleMinimum];
}

// Un GERANT (niveau 20) satisfait aAuMoinsLeNiveau(utilisateur, "EMPLOYE") (niveau 10) automatiquement
```

Ce modèle hiérarchique évite de lister explicitement chaque rôle autorisé pour chaque fonctionnalité (`["GERANT", "SUPER_ADMIN"]`) et se contente d'un seuil minimum.

## 27.6 Encore une fois : ceci reste de l'UX, pas de la sécurité

<div class="encadre attention">
<span class="encadre-titre">⚠️ Répétition volontaire — ce point ne doit jamais être oublié</span>
Exactement comme au chapitre 20 : `usePermissions`, `<PeutAcceder>` et `RouteParRole` améliorent uniquement l'**expérience utilisateur** en évitant d'afficher des boutons ou pages inaccessibles. **Chaque route API sensible doit revérifier indépendamment le rôle côté serveur**, à partir d'une source fiable (la base de données ou le token vérifié), jamais en faisant confiance à ce que le frontend affiche ou n'affiche pas. La faille RBAC identifiée sur KONEKTE (routes `/admin/*` protégées uniquement par `requireAuth`, sans vérification réelle du rôle) illustre exactement ce qui arrive quand ce principe est oublié côté serveur.
</div>

## 27.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 27.1</span>

Ajoute un rôle `MODERATEUR` au système de permissions de la section 27.3, avec les droits `voir_cours` et `voir_etudiants` uniquement, sans toucher au reste de l'application.
</div>

**Corrigé :**
```jsx
const PERMISSIONS_PAR_ROLE = {
  ETUDIANT: ["voir_cours", "soumettre_quiz"],
  MODERATEUR: ["voir_cours", "voir_etudiants"],
  FORMATEUR: ["voir_cours", "creer_cours", "modifier_cours", "voir_etudiants"],
  ADMIN: ["voir_cours", "creer_cours", "modifier_cours", "voir_etudiants", "gerer_utilisateurs", "gerer_revenus"],
};
```
Aucun autre fichier n'a besoin d'être modifié : `usePermissions`, `<PeutAcceder>` et `RouteParRole` (chapitre 20) fonctionnent immédiatement avec ce nouveau rôle, exactement l'intérêt de la centralisation.

## 27.8 Résumé du chapitre

- L'autorisation (RBAC) détermine les actions permises **après** authentification.
- Une table centralisée `PERMISSIONS_PAR_ROLE` évite d'éparpiller des `if role === ...` dans toute l'application.
- Un composant `<PeutAcceder>` réutilisable masque/affiche du contenu selon la permission requise.
- Une hiérarchie de rôles (niveaux numériques) simplifie les systèmes à rôles multiples ordonnés.
- Cette couche reste un confort d'UX : la sécurité réelle est **toujours** revérifiée côté serveur.

*Chapitre suivant : le stockage local (LocalStorage/SessionStorage) et les bonnes pratiques de sécurité associées.*
