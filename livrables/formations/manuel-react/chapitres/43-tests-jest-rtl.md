<div class="chapitre-titre-num">CHAPITRE 43</div>

# Tests avec Jest et React Testing Library

## 43.1 Pourquoi tester une application React

Sur tous les projets mentionnés dans ce manuel (BANKA, GESCOM, EduSpher, LAKAY, KONEKTE, MEDIKA), le constat revient systématiquement : **zéro test automatisé**, toute vérification faite manuellement en navigateur à chaque session de développement. Cette approche fonctionne à petite échelle, mais devient risquée à mesure que le projet grossit : une modification dans un composant partagé (`Button`, `AuthContext`) peut casser silencieusement une fonctionnalité éloignée, découverte seulement lors d'un test manuel... ou par un client en production.

Les tests automatisés ne remplacent pas la vérification manuelle en navigateur (toujours nécessaire pour l'expérience visuelle réelle), mais ils **détectent instantanément** les régressions sur la logique métier et le comportement des composants, à chaque modification du code.

## 43.2 Vitest plutôt que Jest, avec Vite

<div class="encadre astuce">
<span class="encadre-titre">💡 Vitest : l'équivalent de Jest, natif pour Vite</span>
Le titre de ce chapitre mentionne Jest (l'outil de test historique de l'écosystème React, popularisé par Create React App), mais sur un projet Vite (chapitre 2), l'outil recommandé est **Vitest** : une API quasiment identique à Jest (`describe`, `it`, `expect`), mais qui réutilise directement la configuration Vite existante, sans configuration de build séparée. Tout ce qui suit dans ce chapitre fonctionne à l'identique avec Jest si un projet en dépend déjà (ex : migration progressive depuis Create React App).
</div>

```
$ npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

```js
// vite.config.js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom", // simule un DOM de navigateur dans Node.js pour les tests
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
```

```js
// src/test/setup.js
import "@testing-library/jest-dom"; // ajoute des matchers pratiques : toBeInTheDocument(), etc.
```

## 43.3 Premier test : un composant simple

```jsx
// components/Bouton.jsx
function Bouton({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}
export default Bouton;
```

```jsx
// components/Bouton.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Bouton from "./Bouton";

describe("Bouton", () => {
  it("affiche le texte reçu en prop", () => {
    render(<Bouton label="Valider" onClick={() => {}} />);
    expect(screen.getByText("Valider")).toBeInTheDocument();
  });

  it("appelle onClick au clic", () => {
    const gererClic = vi.fn(); // fonction "espion" : on peut vérifier si/comment elle a été appelée
    render(<Bouton label="Valider" onClick={gererClic} />);

    fireEvent.click(screen.getByText("Valider"));

    expect(gererClic).toHaveBeenCalledTimes(1);
  });
});
```

```
$ npx vitest

 ✓ components/Bouton.test.jsx (2)
   ✓ Bouton > affiche le texte reçu en prop
   ✓ Bouton > appelle onClick au clic

 Test Files  1 passed (1)
      Tests  2 passed (2)
```

## 43.4 La philosophie de React Testing Library : tester comme un utilisateur

<div class="encadre astuce">
<span class="encadre-titre">💡 "The more your tests resemble the way your software is used, the more confidence they can give you"</span>
C'est la philosophie affichée de React Testing Library : ne **jamais** tester les détails d'implémentation interne d'un composant (quel state a telle valeur, quelle fonction interne a été appelée), mais toujours tester **ce qu'un utilisateur voit et fait réellement** : le texte affiché, les boutons cliqués, les champs remplis. C'est pour cela que `screen.getByText(...)` et `fireEvent.click(...)` sont préférés à toute inspection directe du state interne du composant.
</div>

## 43.5 Tester un formulaire contrôlé

```jsx
// components/FormulaireConnexion.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FormulaireConnexion from "./FormulaireConnexion";

describe("FormulaireConnexion", () => {
  it("affiche une erreur si l'email est invalide", () => {
    render(<FormulaireConnexion />);

    const champEmail = screen.getByPlaceholderText("Email");
    fireEvent.change(champEmail, { target: { value: "email-invalide" } });
    fireEvent.click(screen.getByText("Se connecter"));

    expect(screen.getByText(/email valide/i)).toBeInTheDocument();
  });

  it("appelle le service de connexion avec les bonnes données", async () => {
    const gererConnexion = vi.fn().mockResolvedValue({ utilisateur: { nom: "Jaslin" } });
    render(<FormulaireConnexion onConnexion={gererConnexion} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "jaslin@test.com" } });
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), { target: { value: "motdepasse123" } });
    fireEvent.click(screen.getByText("Se connecter"));

    await waitFor(() => {
      expect(gererConnexion).toHaveBeenCalledWith("jaslin@test.com", "motdepasse123");
    });
  });
});
```

`waitFor` attend qu'une assertion devienne vraie, utile pour tester du code **asynchrone** (un `useEffect`, un appel API simulé) sans figer un délai arbitraire (`setTimeout`) dans le test.

## 43.6 Simuler (mocker) les appels API

```jsx
// services/produitsService.test.js
import { describe, it, expect, vi } from "vitest";
import api from "./api";
import { getProduits } from "./produitsService";

vi.mock("./api"); // remplace le module réel par une version simulée pour ce fichier de test

describe("getProduits", () => {
  it("retourne les données de l'API", async () => {
    api.get.mockResolvedValue({ data: [{ id: 1, nom: "Riz" }] });

    const reponse = await getProduits();

    expect(api.get).toHaveBeenCalledWith("/produits");
    expect(reponse.data).toEqual([{ id: 1, nom: "Riz" }]);
  });
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi mocker les appels réseau dans les tests</span>
Un test automatisé doit rester **rapide, déterministe et indépendant** d'un vrai serveur backend en fonctionnement. Simuler (`mock`) la couche réseau permet de tester la logique du composant (affichage selon la réponse, gestion des erreurs) sans dépendre d'un serveur réel démarré, ni risquer un test qui échoue à cause d'un problème réseau sans rapport avec le code testé.
</div>

## 43.7 Tester un hook personnalisé

```jsx
// hooks/useCompteur.test.js
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useCompteur } from "./useCompteur";

describe("useCompteur", () => {
  it("incrémente correctement", () => {
    const { result } = renderHook(() => useCompteur(0));

    act(() => {
      result.current.incrementer();
    });

    expect(result.current.valeur).toBe(1);
  });
});
```

`renderHook` permet de tester un hook personnalisé (chapitre 17) **isolément**, sans avoir à créer un composant factice juste pour l'utiliser.

## 43.8 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Tester les détails d'implémentation plutôt que le comportement observable</span>
```jsx
// ❌ Fragile : ce test casse si on renomme le state interne, sans que le comportement réel change
expect(component.state.valeur).toBe(1);

// ✅ Robuste : teste ce que l'utilisateur voit réellement à l'écran
expect(screen.getByText("1")).toBeInTheDocument();
```
</div>

## 43.9 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 43.1</span>

Écris un test pour un composant `Compteur` (chapitre 7) qui vérifie qu'un clic sur le bouton "+" fait passer l'affichage de "0" à "1".
</div>

**Corrigé :**
```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Compteur from "./Compteur";

describe("Compteur", () => {
  it("incrémente l'affichage au clic", () => {
    render(<Compteur />);
    expect(screen.getByText("0")).toBeInTheDocument();

    fireEvent.click(screen.getByText("+"));

    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
```

## 43.10 Résumé du chapitre

- Vitest est l'équivalent natif de Jest pour un projet Vite, avec une API quasiment identique.
- React Testing Library teste le comportement observable par l'utilisateur (texte affiché, clics), jamais les détails d'implémentation interne.
- `vi.fn()` crée une fonction espion ; `vi.mock(...)` simule un module entier (typiquement la couche réseau).
- `waitFor` gère proprement les assertions sur du code asynchrone, sans délai arbitraire.
- `renderHook` teste un hook personnalisé isolément, sans composant factice.

*Chapitre suivant : l'accessibilité (ARIA), pour construire des interfaces utilisables par tous, y compris avec des technologies d'assistance.*
