<div class="chapitre-titre-num">CHAPITRE 39</div>

# Combo recommandé : React Hook Form + Zod

## 39.1 Pourquoi ce combo est devenu le standard professionnel

Ce chapitre assemble tout ce qui a été vu dans la Partie 6 en un exemple complet et réaliste : un formulaire de création de compte bancaire, inspiré directement du module Clients de BANKA (KYC : pièce d'identité obligatoire, âge ≥ 18 ans validé). C'est la combinaison **React Hook Form + Zod** qui domine aujourd'hui la majorité des nouveaux projets React/TypeScript professionnels, pour les raisons cumulées des chapitres 36 et 38 : performance (pas de re-rendu par frappe), schéma déclaratif réutilisable, et typage TypeScript automatiquement synchronisé.

## 39.2 Le schéma complet

```ts
// schemas/clientSchema.ts
import { z } from "zod";

export const clientSchema = z
  .object({
    typeClient: z.enum(["INDIVIDUEL", "ENTREPRISE"]),
    nomComplet: z.string().min(2, "Trop court").max(100),
    email: z.string().email("Format d'email invalide"),
    dateNaissance: z.string().refine((valeur) => {
      const age = (Date.now() - new Date(valeur).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18;
    }, "Le client doit avoir au moins 18 ans"),
    numeroPieceIdentite: z.string().optional(),
    telephone: z.string().regex(/^\+?[0-9]{8,15}$/, "Numéro de téléphone invalide"),
  })
  .refine(
    (donnees) => donnees.typeClient !== "INDIVIDUEL" || Boolean(donnees.numeroPieceIdentite),
    {
      message: "Le numéro de pièce d'identité est obligatoire pour un client individuel",
      path: ["numeroPieceIdentite"],
    }
  );

export type ClientDonnees = z.infer<typeof clientSchema>;
```

Ce schéma illustre trois techniques déjà vues, combinées dans un cas réel : validation avec règle métier calculée (`refine` sur l'âge), champ conditionnellement obligatoire selon un autre champ (`refine` croisé, chapitre 37-38), et un type TypeScript entièrement déduit.

## 39.3 Le composant de formulaire complet

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { clientSchema, ClientDonnees } from "../schemas/clientSchema";
import { creerClient } from "../services/clientsService";

function FormulaireNouveauClient() {
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurServeur, setErreurServeur] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClientDonnees>({
    resolver: zodResolver(clientSchema),
    defaultValues: { typeClient: "INDIVIDUEL" },
  });

  const typeClient = watch("typeClient"); // pour afficher conditionnellement le champ pièce d'identité

  async function onSubmit(donnees: ClientDonnees) {
    setEnvoiEnCours(true);
    setErreurServeur(null);
    try {
      await creerClient(donnees);
      reset();
    } catch (err: any) {
      setErreurServeur(err.response?.data?.message || "Erreur lors de la création du client");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="formulaire-client">
      <label>
        Type de client
        <select {...register("typeClient")}>
          <option value="INDIVIDUEL">Individuel</option>
          <option value="ENTREPRISE">Entreprise</option>
        </select>
      </label>

      <label>
        Nom complet
        <input {...register("nomComplet")} />
      </label>
      {errors.nomComplet && <p className="erreur">{errors.nomComplet.message}</p>}

      <label>
        Email
        <input type="email" {...register("email")} />
      </label>
      {errors.email && <p className="erreur">{errors.email.message}</p>}

      <label>
        Date de naissance
        <input type="date" {...register("dateNaissance")} />
      </label>
      {errors.dateNaissance && <p className="erreur">{errors.dateNaissance.message}</p>}

      {typeClient === "INDIVIDUEL" && (
        <>
          <label>
            Numéro de pièce d'identité
            <input {...register("numeroPieceIdentite")} />
          </label>
          {errors.numeroPieceIdentite && <p className="erreur">{errors.numeroPieceIdentite.message}</p>}
        </>
      )}

      <label>
        Téléphone
        <input {...register("telephone")} />
      </label>
      {errors.telephone && <p className="erreur">{errors.telephone.message}</p>}

      {erreurServeur && <p className="erreur-serveur">{erreurServeur}</p>}

      <button type="submit" disabled={envoiEnCours}>
        {envoiEnCours ? "Création en cours..." : "Créer le client"}
      </button>
    </form>
  );
}

export default FormulaireNouveauClient;
```

## 39.4 Ce que cet exemple assemble, chapitre par chapitre

- **Chapitre 11** : le principe des composants contrôlés/non contrôlés qui sous-tend `register`.
- **Chapitre 18** : `ClientDonnees` typé, propagé jusque dans `onSubmit`.
- **Chapitre 20/27** : le rappel implicite que cette validation reste côté client — le backend de BANKA revalide indépendamment (âge, format, obligation du numéro de pièce).
- **Chapitre 23-24** : l'appel `creerClient` (service Axios) avec gestion d'erreur serveur distincte de la validation de schéma.
- **Chapitre 36** : `watch("typeClient")` pour un affichage conditionnel réactif.
- **Chapitre 38** : le schéma Zod avec règles croisées et type déduit.

## 39.5 Erreur serveur vs erreur de validation : bien les distinguer

<div class="encadre astuce">
<span class="encadre-titre">💡 Deux sources d'erreurs différentes, deux affichages différents</span>
`errors.email.message` (Zod/React Hook Form) signale une erreur de **format/règle métier**, détectée **avant** l'envoi au serveur. `erreurServeur` (state séparé) signale un problème survenu **après** l'envoi (email déjà utilisé en base, erreur réseau, erreur 500) — une information que le schéma de validation frontend ne peut, par nature, jamais connaître à l'avance. Garder ces deux mécanismes bien distincts (comme dans cet exemple) évite de mélanger deux catégories d'erreurs fondamentalement différentes dans un seul état confus.
</div>

## 39.6 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 39.1</span>

Ajoute au schéma `clientSchema` un champ `numeroFiscal` obligatoire uniquement si `typeClient === "ENTREPRISE"`, en suivant le même pattern que `numeroPieceIdentite`.
</div>

**Corrigé :**
```ts
export const clientSchema = z
  .object({
    typeClient: z.enum(["INDIVIDUEL", "ENTREPRISE"]),
    // ... champs existants ...
    numeroFiscal: z.string().optional(),
  })
  .refine(
    (donnees) => donnees.typeClient !== "ENTREPRISE" || Boolean(donnees.numeroFiscal),
    { message: "Le numéro fiscal est obligatoire pour une entreprise", path: ["numeroFiscal"] }
  );
```

## 39.7 Résumé du chapitre

- React Hook Form + Zod combine performance (pas de re-rendu par frappe), schéma déclaratif réutilisable, et typage TypeScript garanti synchronisé.
- `watch` permet un affichage conditionnel réactif de certains champs selon la valeur d'un autre.
- Distinguer systématiquement les erreurs de validation (schéma, avant envoi) des erreurs serveur (après envoi) évite de mélanger deux catégories de problèmes différentes.
- Ce pattern complet (formulaire + schéma + service + gestion d'erreurs à deux niveaux) sera repris tel quel dans le projet final (partie 9).

*Ceci clôt la Partie 6 (validation de formulaires). Chapitre suivant : l'optimisation des performances, première étape de la Partie 7.*
