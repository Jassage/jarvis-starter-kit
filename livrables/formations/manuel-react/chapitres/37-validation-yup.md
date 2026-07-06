<div class="chapitre-titre-num">CHAPITRE 37</div>

# Validation avec Yup

## 37.1 Pourquoi un schéma de validation séparé

Au chapitre 36, les règles de validation (`required`, `pattern`, `minLength`) sont écrites **directement dans le JSX**, au niveau de chaque `register`. Sur un formulaire complexe avec des règles croisées (ex : "confirmer le mot de passe doit être égal au mot de passe"), ou quand la **même** validation doit s'appliquer côté frontend et être documentée clairement pour l'équipe backend, une approche par **schéma déclaratif séparé** devient plus maintenable.

**Yup** est une librairie de validation de schéma, historiquement la plus utilisée dans l'écosystème React/Node avant l'essor de Zod (chapitre 38).

```
$ npm install yup @hookform/resolvers
```

## 37.2 Définir un schéma Yup

```jsx
// schemas/inscriptionSchema.js
import * as yup from "yup";

export const inscriptionSchema = yup.object({
  nom: yup.string().required("Le nom est obligatoire").min(2, "Trop court"),
  email: yup.string().required("L'email est obligatoire").email("Format d'email invalide"),
  age: yup.number().required("L'âge est obligatoire").min(18, "Tu dois avoir au moins 18 ans").integer(),
  motDePasse: yup.string().required("Le mot de passe est obligatoire").min(8, "8 caractères minimum"),
  confirmationMotDePasse: yup
    .string()
    .required("Merci de confirmer le mot de passe")
    .oneOf([yup.ref("motDePasse")], "Les mots de passe ne correspondent pas"),
});
```

`yup.ref("motDePasse")` référence dynamiquement la valeur d'un **autre** champ du même schéma — exactement le type de règle croisée difficile à exprimer proprement avec les règles inline du chapitre 36.

## 37.3 Brancher le schéma sur React Hook Form

```jsx
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { inscriptionSchema } from "../schemas/inscriptionSchema";

function FormulaireInscription() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(inscriptionSchema),
  });

  function onSubmit(donnees) {
    console.log("Données validées :", donnees);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nom")} placeholder="Nom" />
      {errors.nom && <p className="erreur">{errors.nom.message}</p>}

      <input {...register("email")} placeholder="Email" />
      {errors.email && <p className="erreur">{errors.email.message}</p>}

      <input type="password" {...register("motDePasse")} placeholder="Mot de passe" />
      {errors.motDePasse && <p className="erreur">{errors.motDePasse.message}</p>}

      <input type="password" {...register("confirmationMotDePasse")} placeholder="Confirmer" />
      {errors.confirmationMotDePasse && <p className="erreur">{errors.confirmationMotDePasse.message}</p>}

      <button type="submit">S'inscrire</button>
    </form>
  );
}
```

Le **resolver** `yupResolver` fait le pont entre le schéma Yup et le système `errors` de React Hook Form vu au chapitre 36 : toute la logique de validation est désormais centralisée dans `inscriptionSchema.js`, plus aucune règle éparpillée dans le JSX.

## 37.4 Validation conditionnelle

```jsx
const schemaAnnonce = yup.object({
  type: yup.string().required().oneOf(["location", "vente"]),
  prix: yup.number().required("Le prix est obligatoire").positive("Le prix doit être positif"),
  loyerMensuel: yup.number().when("type", {
    is: "location",
    then: (schema) => schema.required("Le loyer mensuel est obligatoire pour une location"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
```

`yup.when(...)` applique une règle **seulement si** une condition sur un autre champ est vraie — utile sur des formulaires où certains champs ne sont pertinents que selon un choix précédent (exactement le genre de logique rencontrée sur un formulaire de création d'annonce comme sur LAKAY).

## 37.5 Validation d'un tableau et d'objets imbriqués

```jsx
const schemaCommande = yup.object({
  client: yup.object({
    nom: yup.string().required(),
    email: yup.string().email().required(),
  }),
  articles: yup
    .array()
    .of(
      yup.object({
        produitId: yup.number().required(),
        quantite: yup.number().required().min(1, "Quantité minimum : 1"),
      })
    )
    .min(1, "Au moins un article est requis"),
});
```

## 37.6 Réutiliser un schéma pour valider en dehors d'un formulaire

```jsx
import { inscriptionSchema } from "../schemas/inscriptionSchema";

async function validerAvantEnvoi(donnees) {
  try {
    const donneesValidees = await inscriptionSchema.validate(donnees, { abortEarly: false });
    return { valide: true, donnees: donneesValidees };
  } catch (erreur) {
    return { valide: false, erreurs: erreur.errors }; // tableau de tous les messages d'erreur
  }
}
```

`{ abortEarly: false }` demande à Yup de collecter **toutes** les erreurs du schéma plutôt que de s'arrêter à la première rencontrée — utile pour afficher une liste complète de problèmes plutôt qu'un message à la fois.

## 37.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier que Yup valide de façon asynchrone</span>
```jsx
// ❌ .validate() retourne une Promise, pas un résultat synchrone
const resultat = inscriptionSchema.validate(donnees);
console.log(resultat.valide); // undefined — resultat est une Promise, pas encore résolue
```
```jsx
// ✅ Toujours attendre la validation, ou utiliser .then()/.catch()
const donneesValidees = await inscriptionSchema.validate(donnees);
```
</div>

## 37.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 37.1</span>

Écris un schéma Yup pour un formulaire de contact avec `nom` (obligatoire, 2-50 caractères), `email` (obligatoire, format valide), `sujet` (un choix parmi `"support"`, `"commercial"`, `"autre"`), `message` (obligatoire, minimum 10 caractères).
</div>

**Corrigé :**
```jsx
const schemaContact = yup.object({
  nom: yup.string().required("Nom obligatoire").min(2).max(50),
  email: yup.string().required("Email obligatoire").email("Format invalide"),
  sujet: yup.string().required().oneOf(["support", "commercial", "autre"]),
  message: yup.string().required("Message obligatoire").min(10, "10 caractères minimum"),
});
```

## 37.9 Résumé du chapitre

- Yup permet de définir des règles de validation dans un **schéma séparé**, réutilisable et plus lisible que des règles inline sur chaque champ.
- `yupResolver` branche un schéma Yup directement sur `useForm` de React Hook Form.
- `yup.ref(...)` et `yup.when(...)` gèrent respectivement les validations croisées entre champs et les règles conditionnelles.
- Un schéma Yup peut aussi être utilisé indépendamment d'un formulaire, pour valider n'importe quelle donnée applicative.

*Chapitre suivant : Zod, une alternative moderne à Yup, avec une intégration TypeScript particulièrement soignée.*
