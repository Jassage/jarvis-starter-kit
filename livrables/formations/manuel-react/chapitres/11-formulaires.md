<div class="chapitre-titre-num">CHAPITRE 11</div>

# Les formulaires

## 11.1 Composants contrôlés vs non contrôlés

C'est **la** distinction fondamentale à maîtriser avant d'aller plus loin (React Hook Form, chapitre 36, en dépend directement).

**Un composant non contrôlé** : le navigateur gère lui-même la valeur du champ (comme en HTML classique). React n'y touche pas tant qu'on ne va pas la lire explicitement.

```jsx
import { useRef } from "react";

function FormulaireNonControle() {
  const inputRef = useRef(null);

  function gererSoumission(e) {
    e.preventDefault();
    alert("Valeur saisie : " + inputRef.current.value); // on va lire la valeur seulement au besoin
  }

  return (
    <form onSubmit={gererSoumission}>
      <input type="text" ref={inputRef} />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

**Un composant contrôlé** : la valeur du champ vit dans le **state React** (`useState`), et le champ HTML n'est qu'un "reflet" de ce state. C'est l'approche **recommandée** dans l'immense majorité des cas.

```jsx
import { useState } from "react";

function FormulaireControle() {
  const [email, setEmail] = useState("");

  function gererSoumission(e) {
    e.preventDefault();
    alert("Email : " + email);
  }

  return (
    <form onSubmit={gererSoumission}>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

| | Contrôlé | Non contrôlé |
|---|---|---|
| Source de vérité | Le state React | Le DOM du navigateur |
| Validation en temps réel (à chaque frappe) | Facile (`onChange`) | Plus difficile |
| Réinitialiser/pré-remplir le champ | Trivial (`setEmail("")`) | Nécessite de manipuler le DOM via `ref` |
| Performance sur formulaires très longs | Un re-rendu à chaque frappe | Aucun re-rendu tant qu'on ne lit pas la valeur |
| Cas d'usage recommandé | La grande majorité des formulaires | Upload de fichier (`<input type="file">`, toujours non contrôlé), intégration avec une librairie DOM tierce |

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi la plupart des projets utilisent des composants contrôlés</span>
Avoir la valeur dans le state permet de valider en temps réel, désactiver le bouton "Envoyer" tant que le formulaire est invalide, afficher des messages d'erreur dynamiques, et réinitialiser le formulaire facilement après soumission — tout ce qu'on attend d'un vrai formulaire d'application.
</div>

## 11.2 Formulaire avec plusieurs champs : un seul objet de state

Plutôt qu'un `useState` par champ, on regroupe souvent les champs liés dans un seul objet :

```jsx
function FormulaireInscription() {
  const [formulaire, setFormulaire] = useState({
    nom: "",
    email: "",
    motDePasse: "",
  });

  function gererChangement(e) {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
  }

  function gererSoumission(e) {
    e.preventDefault();
    console.log(formulaire);
  }

  return (
    <form onSubmit={gererSoumission}>
      <input name="nom" value={formulaire.nom} onChange={gererChangement} placeholder="Nom" />
      <input name="email" value={formulaire.email} onChange={gererChangement} placeholder="Email" />
      <input
        name="motDePasse"
        type="password"
        value={formulaire.motDePasse}
        onChange={gererChangement}
        placeholder="Mot de passe"
      />
      <button type="submit">S'inscrire</button>
    </form>
  );
}
```

Le point clé : l'attribut `name` de chaque `<input>` correspond exactement à la clé de l'objet `formulaire`, ce qui permet d'utiliser **un seul gestionnaire `gererChangement` générique** pour tous les champs, via la syntaxe de clé calculée `[name]: value`.

## 11.3 Les cases à cocher et boutons radio

```jsx
function Preferences() {
  const [accepteNewsletter, setAccepteNewsletter] = useState(false);
  const [plan, setPlan] = useState("gratuit");

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={accepteNewsletter}
          onChange={(e) => setAccepteNewsletter(e.target.checked)}
        />
        Recevoir la newsletter
      </label>

      <label>
        <input type="radio" name="plan" value="gratuit" checked={plan === "gratuit"} onChange={(e) => setPlan(e.target.value)} />
        Gratuit
      </label>
      <label>
        <input type="radio" name="plan" value="premium" checked={plan === "premium"} onChange={(e) => setPlan(e.target.value)} />
        Premium
      </label>
    </div>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ checked, pas value, pour les cases à cocher</span>
Une case à cocher contrôlée utilise `checked` (booléen) et `e.target.checked`, pas `value`/`e.target.value`. C'est l'erreur la plus fréquente lors du premier formulaire avec checkbox.
</div>

## 11.4 Les listes déroulantes (`<select>`)

```jsx
function SelecteurDepartement() {
  const [departement, setDepartement] = useState("");

  return (
    <select value={departement} onChange={(e) => setDepartement(e.target.value)}>
      <option value="">-- Choisir --</option>
      <option value="ouest">Ouest</option>
      <option value="nord">Nord</option>
      <option value="artibonite">Artibonite</option>
    </select>
  );
}
```

## 11.5 Validation basique côté client

```jsx
function FormulaireConnexion() {
  const [email, setEmail] = useState("");
  const [erreur, setErreur] = useState("");

  function gererSoumission(e) {
    e.preventDefault();

    if (!email.includes("@")) {
      setErreur("Merci d'entrer un email valide");
      return;
    }
    setErreur("");
    console.log("Envoi de", email);
  }

  return (
    <form onSubmit={gererSoumission}>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      {erreur && <p className="erreur">{erreur}</p>}
      <button type="submit">Se connecter</button>
    </form>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Ce chapitre pose les bases ; les chapitres 36 à 39 vont plus loin</span>
Cette validation manuelle devient vite répétitive et fragile sur un formulaire complexe (plusieurs champs, règles croisées, messages d'erreur par champ). Les chapitres 36 (React Hook Form), 37 (Yup) et 38 (Zod) résolvent ce problème de façon bien plus robuste et professionnelle. Comprendre d'abord les formulaires contrôlés "à la main" ici est indispensable pour apprécier ce que ces librairies automatisent ensuite.
</div>

## 11.6 Erreurs fréquentes récapitulées

<div class="encadre attention">
<span class="encadre-titre">⚠️ Champ "non contrôlé devenant contrôlé" (ou l'inverse)</span>
```jsx
// ❌ email démarre à `undefined` (état initial mal défini), puis devient une chaîne après la première frappe
const [email, setEmail] = useState();
```
React affiche un avertissement "a component is changing an uncontrolled input to be controlled" si la `value` passe de `undefined` à une chaîne en cours de vie du composant. Toujours initialiser le state d'un champ contrôlé avec une valeur du **bon type** dès le départ (`useState("")` pour du texte, jamais `useState()`).
</div>

## 11.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 11.1</span>

Crée un formulaire contrôlé `FormulaireContact` avec deux champs (`nom`, `message`) regroupés dans un seul objet de state, et un bouton désactivé (`disabled`) tant que l'un des deux champs est vide.
</div>

**Corrigé :**
```jsx
function FormulaireContact() {
  const [formulaire, setFormulaire] = useState({ nom: "", message: "" });

  function gererChangement(e) {
    const { name, value } = e.target;
    setFormulaire((prev) => ({ ...prev, [name]: value }));
  }

  const estValide = formulaire.nom.trim() !== "" && formulaire.message.trim() !== "";

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <input name="nom" value={formulaire.nom} onChange={gererChangement} placeholder="Nom" />
      <textarea name="message" value={formulaire.message} onChange={gererChangement} placeholder="Message" />
      <button type="submit" disabled={!estValide}>Envoyer</button>
    </form>
  );
}
```

## 11.8 Résumé du chapitre

- **Contrôlé** (state React source de vérité) est l'approche recommandée dans la grande majorité des cas ; **non contrôlé** (via `ref`) reste utile pour l'upload de fichiers.
- Un objet de state unique + attribut `name` + gestionnaire générique évite de dupliquer le code sur les formulaires à plusieurs champs.
- Case à cocher : `checked`/`e.target.checked`. Champ texte/select : `value`/`e.target.value`.
- Toujours initialiser le state d'un champ contrôlé avec une valeur du bon type dès le départ.

*Chapitre suivant : useEffect en profondeur, pour synchroniser un composant avec le monde extérieur (API, timers, abonnements...).*
