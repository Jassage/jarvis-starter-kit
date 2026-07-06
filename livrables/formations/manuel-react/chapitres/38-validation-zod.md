<div class="chapitre-titre-num">CHAPITRE 38</div>

# Validation avec Zod

## 38.1 Pourquoi Zod a largement remplacé Yup sur les projets récents

**Zod** résout le même problème que Yup (chapitre 37) — définir un schéma de validation déclaratif — mais avec un avantage décisif dans un projet TypeScript (chapitre 18) : Zod peut **déduire automatiquement un type TypeScript directement depuis le schéma**, sans jamais avoir à écrire une `interface` séparée qui pourrait diverger du schéma de validation réel.

```
$ npm install zod @hookform/resolvers
```

## 38.2 Définir un schéma Zod

```ts
// schemas/inscriptionSchema.ts
import { z } from "zod";

export const inscriptionSchema = z
  .object({
    nom: z.string().min(2, "Trop court").max(50),
    email: z.string().email("Format d'email invalide"),
    age: z.number().int().min(18, "Tu dois avoir au moins 18 ans"),
    motDePasse: z.string().min(8, "8 caractères minimum"),
    confirmationMotDePasse: z.string(),
  })
  .refine((donnees) => donnees.motDePasse === donnees.confirmationMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmationMotDePasse"], // rattache l'erreur à ce champ précis
  });

// Le type TypeScript est DÉDUIT du schéma, jamais écrit à la main séparément
export type InscriptionDonnees = z.infer<typeof inscriptionSchema>;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 z.infer : la fonctionnalité qui change tout en TypeScript</span>
Avec Yup + TypeScript, il faut écrire séparément une `interface InscriptionDonnees { nom: string; email: string; ... }` et le schéma Yup, avec le risque réel qu'ils divergent au fil des modifications (un champ ajouté au schéma, oublié dans l'interface). Avec Zod, `z.infer<typeof inscriptionSchema>` génère le type **automatiquement à partir du schéma**, garantissant qu'ils ne peuvent jamais être désynchronisés.
</div>

## 38.3 Brancher Zod sur React Hook Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inscriptionSchema, InscriptionDonnees } from "../schemas/inscriptionSchema";

function FormulaireInscription() {
  const { register, handleSubmit, formState: { errors } } = useForm<InscriptionDonnees>({
    resolver: zodResolver(inscriptionSchema),
  });

  function onSubmit(donnees: InscriptionDonnees) {
    console.log(donnees); // entièrement typé, auto-complétion garantie dans l'éditeur
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("nom")} placeholder="Nom" />
      {errors.nom && <p className="erreur">{errors.nom.message}</p>}
      {/* ... reste du formulaire identique au pattern du chapitre 37 ... */}
    </form>
  );
}
```

`useForm<InscriptionDonnees>` reçoit directement le type déduit du schéma : si un champ est renommé dans le schéma Zod, TypeScript signale **immédiatement** toute incohérence dans le JSX (`register("nomIncorrect")` deviendrait une erreur de compilation).

## 38.4 Validation conditionnelle avec Zod

```ts
const schemaAnnonce = z
  .object({
    type: z.enum(["location", "vente"]),
    prix: z.number().positive("Le prix doit être positif"),
    loyerMensuel: z.number().positive().optional(),
  })
  .refine(
    (donnees) => donnees.type !== "location" || donnees.loyerMensuel !== undefined,
    { message: "Le loyer mensuel est obligatoire pour une location", path: ["loyerMensuel"] }
  );
```

`z.enum([...])` restreint une valeur à un ensemble précis de chaînes (équivalent du type union littéral TypeScript vu au chapitre 18), avec validation ET typage garantis simultanément.

## 38.5 Schémas imbriqués et tableaux

```ts
const schemaCommande = z.object({
  client: z.object({
    nom: z.string().min(1),
    email: z.string().email(),
  }),
  articles: z
    .array(
      z.object({
        produitId: z.number(),
        quantite: z.number().int().min(1, "Quantité minimum : 1"),
      })
    )
    .min(1, "Au moins un article est requis"),
});

type CommandeDonnees = z.infer<typeof schemaCommande>;
// CommandeDonnees est déduit automatiquement :
// { client: { nom: string; email: string }; articles: { produitId: number; quantite: number }[] }
```

## 38.6 Validation manuelle (hors formulaire) avec safeParse

```ts
const resultat = inscriptionSchema.safeParse(donneesRecues);

if (!resultat.success) {
  console.log(resultat.error.issues); // liste structurée des erreurs, sans exception levée
} else {
  console.log(resultat.data); // donnees typées et validées, prêtes à l'emploi
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 safeParse vs parse</span>
`.parse(donnees)` **lève une exception** si la validation échoue (il faut l'entourer d'un `try/catch`). `.safeParse(donnees)` retourne toujours un objet `{ success, data ou error }`, sans jamais lever d'exception — souvent préférable pour un code de validation explicite et lisible, sans dépendre du contrôle de flux par exceptions.
</div>

## 38.7 Zod côté backend aussi : un schéma, deux usages

<div class="encadre astuce">
<span class="encadre-titre">💡 Le même schéma peut valider frontend ET backend</span>
Si le backend est écrit en Node.js/TypeScript (comme sur BANKA, GESCOM, LAKAY, tous en Express + TypeScript), le **même** fichier de schéma Zod peut être partagé entre le frontend React et le backend Express (via un package partagé dans un monorepo, ou simplement dupliqué de façon synchronisée). Cela garantit que la validation appliquée au moment de la saisie utilisateur correspond **exactement** à celle appliquée en dernier rempart côté serveur — la seule qui compte réellement pour la sécurité (rappel des chapitres 20, 25, 27).
</div>

## 38.8 Zod vs Yup : tableau de décision

| Critère | Yup | Zod |
|---|---|---|
| Projet en JavaScript pur | Bon choix, syntaxe mature | Fonctionne aussi très bien |
| Projet en TypeScript | Nécessite une interface séparée du schéma | `z.infer` déduit le type automatiquement — avantage décisif |
| Ancienneté / présence dans du code existant | Très répandu dans les projets plus anciens | Devenu le standard pour les projets démarrés récemment |
| Partage de schéma frontend/backend | Possible | Particulièrement naturel en environnement TypeScript full-stack |

## 38.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser .parse() sans try/catch</span>
```ts
// ❌ Une validation échouée lève une exception NON interceptée : plantage de l'application
const donnees = inscriptionSchema.parse(donneesRecues);
```
```ts
// ✅ safeParse pour un contrôle de flux explicite, sans risque de plantage
const resultat = inscriptionSchema.safeParse(donneesRecues);
if (!resultat.success) {
  // gérer l'erreur proprement
}
```
</div>

## 38.10 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 38.1</span>

Réécris en Zod le schéma de contact de l'exercice 37.1 (`nom`, `email`, `sujet` parmi trois valeurs, `message`), puis déduis son type TypeScript avec `z.infer`.
</div>

**Corrigé :**
```ts
const schemaContact = z.object({
  nom: z.string().min(2).max(50),
  email: z.string().email("Format invalide"),
  sujet: z.enum(["support", "commercial", "autre"]),
  message: z.string().min(10, "10 caractères minimum"),
});

type ContactDonnees = z.infer<typeof schemaContact>;
```

## 38.11 Résumé du chapitre

- Zod définit un schéma déclaratif comme Yup, avec un avantage décisif en TypeScript : `z.infer` déduit automatiquement le type, sans risque de divergence avec une interface écrite à la main.
- `zodResolver` branche un schéma Zod sur React Hook Form, exactement comme `yupResolver` pour Yup.
- `.safeParse()` est préférable à `.parse()` pour éviter une exception non gérée.
- Un schéma Zod peut être partagé entre frontend et backend TypeScript, garantissant une validation cohérente des deux côtés.

*Chapitre suivant : le combo recommandé React Hook Form + Zod, pour clore la Partie 6 avec un exemple complet et professionnel.*
