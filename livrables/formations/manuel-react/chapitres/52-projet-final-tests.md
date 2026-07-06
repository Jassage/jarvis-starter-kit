<div class="chapitre-titre-num">CHAPITRE 52</div>

# Projet final — Tests du projet

## 52.1 Prioriser : que tester en premier sur un projet réel

<div class="encadre astuce">
<span class="encadre-titre">💡 Face à un temps limité, où investir l'effort de test en premier</span>
Sur un vrai projet (rappel du chapitre 43 : zéro test sur tous les SaaS de Jaslin à ce jour), il est irréaliste de viser 100% de couverture dès le départ. Priorise dans cet ordre : (1) la logique métier critique et sans dépendance UI (validation, calculs), (2) l'authentification et les permissions (un bug ici a l'impact le plus grave), (3) les formulaires et CRUD les plus utilisés, (4) le reste, progressivement.
</div>

## 52.2 Tester le schéma Zod (logique pure, chapitre 38)

```ts
// schemas/coursSchema.test.ts
import { describe, it, expect } from "vitest";
import { coursSchema } from "./coursSchema";

describe("coursSchema", () => {
  it("accepte un cours valide", () => {
    const resultat = coursSchema.safeParse({
      titre: "Introduction à React",
      description: "Un cours complet pour découvrir React depuis zéro, étape par étape.",
      categorie: "informatique",
      prix: 500,
      imageCouverture: "https://exemple.com/image.jpg",
    });
    expect(resultat.success).toBe(true);
  });

  it("rejette un titre trop court", () => {
    const resultat = coursSchema.safeParse({
      titre: "Abc",
      description: "Une description suffisamment longue pour passer la validation.",
      categorie: "informatique",
      prix: 500,
      imageCouverture: "https://exemple.com/image.jpg",
    });
    expect(resultat.success).toBe(false);
    if (!resultat.success) {
      expect(resultat.error.issues[0].path).toEqual(["titre"]);
    }
  });

  it("rejette un prix négatif", () => {
    const resultat = coursSchema.safeParse({
      titre: "Introduction à React",
      description: "Une description suffisamment longue pour passer la validation.",
      categorie: "informatique",
      prix: -50,
      imageCouverture: "https://exemple.com/image.jpg",
    });
    expect(resultat.success).toBe(false);
  });
});
```

Ces tests, totalement indépendants de React (chapitre 43, section sur la philosophie de test), s'exécutent en quelques millisecondes et couvrent la logique de validation la plus critique du formulaire de cours.

## 52.3 Tester le formulaire de connexion (chapitre 48)

```jsx
// pages/Login.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import * as AuthContext from "../context/AuthContext";

describe("Login", () => {
  it("affiche une erreur si les identifiants sont incorrects", async () => {
    vi.spyOn(AuthContext, "useAuth").mockReturnValue({
      connecter: vi.fn().mockRejectedValue(new Error("Identifiants invalides")),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), { target: { value: "motdepasse" } });
    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(screen.getByText("Email ou mot de passe incorrect")).toBeInTheDocument();
    });
  });

  it("affiche une erreur de validation si l'email est vide", async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(screen.getByText(/format d'email invalide/i)).toBeInTheDocument();
    });
  });
});
```

`<MemoryRouter>` fournit un contexte de routage simulé en mémoire, nécessaire ici car `Login` utilise `useNavigate`/`useLocation` (chapitre 19) — sans lui, ces hooks lèveraient une erreur hors d'un vrai `<BrowserRouter>`.

## 52.4 Tester une route protégée par rôle (chapitre 20)

```jsx
// components/routes/RouteParRole.test.jsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RouteParRole } from "./RouteParRole";
import * as AuthContext from "../../context/AuthContext";

function renduAvecRole(role) {
  vi.spyOn(AuthContext, "useAuth").mockReturnValue({
    utilisateur: { role },
    chargement: false,
  });

  return render(
    <MemoryRouter initialEntries={["/admin"]}>
      <Routes>
        <Route element={<RouteParRole rolesAutorises={["ADMIN"]} />}>
          <Route path="/admin" element={<p>Panneau admin</p>} />
        </Route>
        <Route path="/acces-refuse" element={<p>Accès refusé</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RouteParRole", () => {
  it("affiche la page pour un rôle autorisé", () => {
    renduAvecRole("ADMIN");
    expect(screen.getByText("Panneau admin")).toBeInTheDocument();
  });

  it("redirige un rôle non autorisé", () => {
    renduAvecRole("ETUDIANT");
    expect(screen.getByText("Accès refusé")).toBeInTheDocument();
  });
});
```

Ce test vérifie **exactement** la garde de sécurité côté frontend décrite au chapitre 20 — rappel important : ce test valide le comportement de l'interface, pas la sécurité réelle, qui doit être testée indépendamment côté API backend.

## 52.5 Tester le CRUD cours avec l'API simulée

```jsx
// pages/formateur/MesCours.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import MesCours from "./MesCours";
import * as coursService from "../../services/coursService";

vi.mock("../../services/coursService");

describe("MesCours", () => {
  it("affiche la liste des cours du formateur", async () => {
    coursService.getCours.mockResolvedValue({
      data: [{ id: 1, titre: "React pour débutants", statut: "PUBLIE" }],
    });

    render(<MesCours />);

    await waitFor(() => {
      expect(screen.getByText("React pour débutants")).toBeInTheDocument();
    });
  });

  it("retire un cours de la liste après confirmation de suppression", async () => {
    coursService.getCours.mockResolvedValue({
      data: [{ id: 1, titre: "React pour débutants", statut: "PUBLIE" }],
    });
    coursService.supprimerCours.mockResolvedValue({});
    vi.spyOn(window, "confirm").mockReturnValue(true); // simule le clic "OK" sur la boîte de dialogue native

    render(<MesCours />);
    await waitFor(() => screen.getByText("React pour débutants"));

    fireEvent.click(screen.getByText("Supprimer"));

    await waitFor(() => {
      expect(screen.queryByText("React pour débutants")).not.toBeInTheDocument();
    });
  });
});
```

## 52.6 Résumé du chapitre

- Prioriser les tests sur la logique métier pure (schémas Zod) et l'authentification/permissions avant de couvrir l'ensemble du projet.
- `MemoryRouter` est nécessaire pour tester tout composant utilisant les hooks de React Router.
- `vi.spyOn(AuthContext, "useAuth")` simule un utilisateur avec un rôle donné, sans passer par un vrai flux de connexion complet.
- `vi.mock(...)` sur la couche services isole les tests de composants de toute dépendance réseau réelle.

*Chapitre suivant : le déploiement final de MiniCours sur Vercel, dernière étape du projet et du manuel.*
