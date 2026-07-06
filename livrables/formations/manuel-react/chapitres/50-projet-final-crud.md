<div class="chapitre-titre-num">CHAPITRE 50</div>

# Projet final — CRUD complets

## 50.1 Le service cours (chapitre 23 appliqué)

```jsx
// services/coursService.js
import api from "./api";

export const getCours = () => api.get("/cours");
export const getCoursParId = (id) => api.get(`/cours/${id}`);
export const creerCours = (donnees) => api.post("/cours", donnees);
export const modifierCours = (id, donnees) => api.put(`/cours/${id}`, donnees);
export const supprimerCours = (id) => api.delete(`/cours/${id}`);
export const publierCours = (id) => api.patch(`/cours/${id}/publier`);
```

## 50.2 Schéma de validation du formulaire de cours (chapitre 38)

```ts
// schemas/coursSchema.ts
import { z } from "zod";

export const coursSchema = z.object({
  titre: z.string().min(5, "Le titre doit contenir au moins 5 caractères").max(100),
  description: z.string().min(20, "La description doit contenir au moins 20 caractères"),
  categorie: z.enum(["informatique", "langues", "affaires", "sante"]),
  prix: z.number().min(0, "Le prix ne peut pas être négatif"),
});

export type CoursDonnees = z.infer<typeof coursSchema>;
```

## 50.3 Formulaire de création/édition de cours (React Hook Form + Zod)

```tsx
// pages/formateur/EditeurCours.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { coursSchema, CoursDonnees } from "../../schemas/coursSchema";
import { creerCours, modifierCours, getCoursParId } from "../../services/coursService";

function EditeurCours() {
  const { id } = useParams(); // undefined en création, présent en édition (chapitre 19)
  const navigate = useNavigate();
  const modeEdition = Boolean(id);
  const [erreurServeur, setErreurServeur] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CoursDonnees>({
    resolver: zodResolver(coursSchema),
    defaultValues: { titre: "", description: "", categorie: "informatique", prix: 0 },
  });

  useEffect(() => {
    if (modeEdition) {
      getCoursParId(id).then((reponse) => reset(reponse.data));
    }
  }, [id, modeEdition, reset]);

  async function onSubmit(donnees) {
    try {
      setErreurServeur(null);
      if (modeEdition) {
        await modifierCours(id, donnees);
      } else {
        await creerCours(donnees);
      }
      navigate("/mes-cours");
    } catch (err) {
      setErreurServeur(err.response?.data?.message || "Erreur lors de l'enregistrement");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
      <h1 className="text-2xl font-bold">{modeEdition ? "Modifier le cours" : "Créer un cours"}</h1>

      <div>
        <label className="block mb-1 font-medium">Titre</label>
        <input {...register("titre")} className="w-full p-2 border rounded" />
        {errors.titre && <p className="text-red-600 text-sm">{errors.titre.message}</p>}
      </div>

      <div>
        <label className="block mb-1 font-medium">Description</label>
        <textarea {...register("description")} rows={4} className="w-full p-2 border rounded" />
        {errors.description && <p className="text-red-600 text-sm">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block mb-1 font-medium">Catégorie</label>
        <select {...register("categorie")} className="w-full p-2 border rounded">
          <option value="informatique">Informatique</option>
          <option value="langues">Langues</option>
          <option value="affaires">Affaires</option>
          <option value="sante">Santé</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">Prix (HTG)</label>
        <input type="number" {...register("prix", { valueAsNumber: true })} className="w-full p-2 border rounded" />
        {errors.prix && <p className="text-red-600 text-sm">{errors.prix.message}</p>}
      </div>

      {erreurServeur && <p className="text-red-600">{erreurServeur}</p>}

      <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white p-2 rounded disabled:opacity-50">
        {isSubmitting ? "Enregistrement..." : modeEdition ? "Enregistrer les modifications" : "Créer le cours"}
      </button>
    </form>
  );
}

export default EditeurCours;
```

<div class="encadre astuce">
<span class="encadre-titre">💡 valueAsNumber, un détail important de React Hook Form</span>
Sans `{ valueAsNumber: true }`, `register("prix")` renverrait la valeur du champ sous forme de **chaîne** (comportement natif d'un `<input>` HTML, rappel du chapitre 11), ce qui ferait échouer la validation Zod `z.number()`. Cette option convertit automatiquement la valeur en nombre avant qu'elle n'atteigne le schéma de validation.
</div>

## 50.4 Liste des cours avec suppression (chapitre 10 : listes et clés)

```jsx
// pages/formateur/MesCours.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCours, supprimerCours } from "../../services/coursService";

function MesCours() {
  const [cours, setCours] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getCours()
      .then((reponse) => setCours(reponse.data))
      .finally(() => setChargement(false));
  }, []);

  async function gererSuppression(id) {
    if (!confirm("Supprimer ce cours définitivement ?")) return;

    await supprimerCours(id);
    setCours((prev) => prev.filter((c) => c.id !== id)); // mise à jour immuable (chapitre 7)
  }

  if (chargement) return <p>Chargement...</p>;
  if (cours.length === 0) return <p>Aucun cours pour l'instant. Créez-en un !</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Mes cours</h1>
        <Link to="/mes-cours/nouveau" className="bg-blue-600 text-white px-4 py-2 rounded">
          + Nouveau cours
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cours.map((c) => (
          <div key={c.id} className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="font-bold">{c.titre}</h3>
            <p className="text-sm text-gray-500">{c.statut}</p>
            <div className="flex gap-2 mt-2">
              <Link to={`/mes-cours/${c.id}`} className="text-blue-600">Modifier</Link>
              <button onClick={() => gererSuppression(c.id)} className="text-red-600">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 50.5 Gestion des utilisateurs (admin)

```jsx
// pages/admin/GestionUtilisateurs.jsx
import { useState, useEffect } from "react";
import * as utilisateursService from "../../services/utilisateursService";

function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [recherche, setRecherche] = useState("");

  useEffect(() => {
    utilisateursService.getUtilisateurs().then((r) => setUtilisateurs(r.data));
  }, []);

  const utilisateursFiltres = utilisateurs.filter((u) =>
    u.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  async function changerRole(id, nouveauRole) {
    await utilisateursService.modifierRole(id, nouveauRole);
    setUtilisateurs((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: nouveauRole } : u))
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <input
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        placeholder="Rechercher un utilisateur..."
        className="w-full p-2 border rounded mb-4"
      />

      <table className="w-full bg-white rounded-lg shadow-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Nom</th>
            <th className="p-3">Email</th>
            <th className="p-3">Rôle</th>
          </tr>
        </thead>
        <tbody>
          {utilisateursFiltres.map((u) => (
            <tr key={u.id} className="border-b">
              <td className="p-3">{u.nom}</td>
              <td className="p-3">{u.email}</td>
              <td className="p-3">
                <select value={u.role} onChange={(e) => changerRole(u.id, e.target.value)}>
                  <option value="ETUDIANT">Étudiant</option>
                  <option value="FORMATEUR">Formateur</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## 50.6 Résumé du chapitre

- Le CRUD cours réutilise directement le pattern React Hook Form + Zod du chapitre 39, avec un même formulaire pour création et édition (`modeEdition` déterminé par la présence d'un `:id` d'URL, chapitre 19).
- `valueAsNumber` évite un piège classique de conversion de type sur les champs numériques.
- Toute suppression/modification met à jour le state local de façon immuable (`filter`, `map`), sans re-fetch complet inutile.
- Le CRUD utilisateurs (admin) illustre un tableau filtrable simple, sans nécessiter Ant Design (chapitre 34) pour ce volume modéré de données.

*Chapitre suivant : l'upload de l'image de couverture d'un cours.*
