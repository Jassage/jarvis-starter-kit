<div class="chapitre-titre-num">CHAPITRE 36</div>

# React Hook Form

## 36.1 Le problème des formulaires contrôlés "à la main" à grande échelle

Rappel du chapitre 11 : un champ contrôlé stocke sa valeur dans le state, et **chaque frappe** déclenche un nouveau rendu du composant (puisque `setEmail(...)` est appelé à chaque `onChange`). Sur un petit formulaire, c'est négligeable. Sur un **grand** formulaire (20+ champs, comme un formulaire d'inscription complet ou un formulaire d'annonce immobilière à plusieurs étapes), cela peut provoquer des re-rendus fréquents et une gestion d'erreurs par champ vite répétitive à écrire à la main.

**React Hook Form (RHF)** résout ce problème en gérant les champs de façon **non contrôlée en interne** (rappel du chapitre 11), tout en offrant une API simple pour lire les valeurs, valider et afficher les erreurs — sans re-rendre le composant à chaque frappe.

```
$ npm install react-hook-form
```

## 36.2 Utilisation de base avec register

```jsx
import { useForm } from "react-hook-form";

function FormulaireContact() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  function onSubmit(donnees) {
    console.log(donnees); // { nom: "...", email: "...", message: "..." }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nom", { required: "Le nom est obligatoire" })} placeholder="Nom" />
      {errors.nom && <p className="erreur">{errors.nom.message}</p>}

      <input
        {...register("email", {
          required: "L'email est obligatoire",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Format d'email invalide" },
        })}
        placeholder="Email"
      />
      {errors.email && <p className="erreur">{errors.email.message}</p>}

      <textarea {...register("message", { required: "Le message est obligatoire" })} />
      {errors.message && <p className="erreur">{errors.message.message}</p>}

      <button type="submit">Envoyer</button>
    </form>
  );
}
```

**Ce que fait `register("nom", { required: "..." })` :** il retourne un objet contenant `name`, `onChange`, `onBlur` et `ref`, que l'opérateur de décomposition `{...register(...)}` applique directement au champ. C'est ce mécanisme (basé sur les `ref`, chapitre 16) qui permet à React Hook Form de lire la valeur du champ **sans** passer par un `useState` contrôlé classique — d'où l'absence de re-rendu à chaque frappe.

<div class="encadre astuce">
<span class="encadre-titre">💡 handleSubmit valide AVANT d'appeler ta fonction</span>
`handleSubmit(onSubmit)` encapsule ta fonction : React Hook Form exécute d'abord toutes les règles de validation, et n'appelle `onSubmit(donnees)` **que si tout est valide**. Si des erreurs existent, `onSubmit` n'est jamais appelé, et `errors` se remplit automatiquement pour afficher les messages.
</div>

## 36.3 Valeurs par défaut et réinitialisation

```jsx
const { register, handleSubmit, reset } = useForm({
  defaultValues: {
    nom: "",
    email: "",
  },
});

function onSubmit(donnees) {
  enregistrerContact(donnees);
  reset(); // vide le formulaire après soumission réussie
}
```

## 36.4 Champs contrôlés dans React Hook Form : le composant Controller

Certains composants tiers (un sélecteur de date personnalisé, un composant MUI ou Ant Design, chapitre 33-34) ne peuvent pas fonctionner directement avec `register` (ils n'exposent pas de `ref` compatible). Pour ces cas, React Hook Form fournit `<Controller>`, qui fait le pont entre son système et un composant contrôlé classique :

```jsx
import { Controller, useForm } from "react-hook-form";
import { Select, MenuItem } from "@mui/material";

function FormulaireAvecSelectMUI() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Controller
        name="departement"
        control={control}
        defaultValue=""
        rules={{ required: "Sélectionne un département" }}
        render={({ field }) => (
          <Select {...field}>
            <MenuItem value="ouest">Ouest</MenuItem>
            <MenuItem value="nord">Nord</MenuItem>
          </Select>
        )}
      />
    </form>
  );
}
```

## 36.5 watch : réagir en temps réel à une valeur

```jsx
function FormulaireMotDePasse() {
  const { register, watch } = useForm();
  const motDePasse = watch("motDePasse", "");

  return (
    <form>
      <input type="password" {...register("motDePasse")} />
      <p>Force du mot de passe : {motDePasse.length >= 8 ? "Forte" : "Faible"}</p>
    </form>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ watch réintroduit des re-rendus à chaque frappe, sur le champ observé</span>
`watch("motDePasse")` réactive volontairement un re-rendu à chaque frappe **pour ce champ précis**, exactement pour permettre l'affichage en temps réel voulu ici. N'utilise `watch` que pour les champs qui ont réellement besoin d'un retour visuel immédiat pendant la frappe — pas sur tous les champs "par habitude", ce qui annulerait le bénéfice de performance de React Hook Form.
</div>

## 36.6 Formulaires à plusieurs étapes (wizard)

```jsx
function FormulaireMultiEtapes() {
  const [etape, setEtape] = useState(1);
  const { register, handleSubmit, trigger, getValues } = useForm();

  async function etapeSuivante() {
    const champsValides = await trigger(["nom", "email"]); // valide seulement les champs de l'étape 1
    if (champsValides) setEtape(2);
  }

  if (etape === 1) {
    return (
      <div>
        <input {...register("nom", { required: true })} placeholder="Nom" />
        <input {...register("email", { required: true })} placeholder="Email" />
        <button type="button" onClick={etapeSuivante}>Suivant</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit((donnees) => console.log({ ...getValues(), ...donnees }))}>
      <textarea {...register("message")} />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

## 36.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier le spread sur register</span>
```jsx
// ❌ register("nom") retourne un objet de props, pas un ref direct utilisable ainsi
<input ref={register("nom")} />

// ✅ Décomposition obligatoire pour répartir name/onChange/onBlur/ref sur l'input
<input {...register("nom")} />
```
</div>

## 36.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 36.1</span>

Construis un formulaire d'inscription avec React Hook Form : `nom` (obligatoire), `email` (obligatoire, format email), `motDePasse` (obligatoire, minimum 8 caractères), affichant les messages d'erreur sous chaque champ.
</div>

**Corrigé :**
```jsx
function FormulaireInscription() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit((d) => console.log(d))}>
      <input {...register("nom", { required: "Nom obligatoire" })} />
      {errors.nom && <p>{errors.nom.message}</p>}

      <input
        {...register("email", {
          required: "Email obligatoire",
          pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalide" },
        })}
      />
      {errors.email && <p>{errors.email.message}</p>}

      <input
        type="password"
        {...register("motDePasse", {
          required: "Mot de passe obligatoire",
          minLength: { value: 8, message: "8 caractères minimum" },
        })}
      />
      {errors.motDePasse && <p>{errors.motDePasse.message}</p>}

      <button type="submit">S'inscrire</button>
    </form>
  );
}
```

## 36.9 Résumé du chapitre

- React Hook Form gère les champs de façon non contrôlée en interne, évitant les re-rendus à chaque frappe des formulaires contrôlés classiques.
- `register(nom, regles)` + `{...register(...)}` branche un champ ; `handleSubmit(onSubmit)` valide avant d'appeler ta fonction.
- `<Controller>` fait le pont avec des composants tiers (MUI, Ant Design) qui n'exposent pas de `ref` compatible.
- `watch` réintroduit volontairement des re-rendus pour un retour visuel en temps réel, à réserver aux champs qui en ont vraiment besoin.

*Chapitre suivant : Yup, pour définir des schémas de validation réutilisables et plus expressifs que des règles inline.*
