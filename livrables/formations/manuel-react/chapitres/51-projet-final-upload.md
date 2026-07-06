<div class="chapitre-titre-num">CHAPITRE 51</div>

# Projet final — Upload de fichiers

## 51.1 Ajouter l'image de couverture à l'éditeur de cours

En reprenant `EditeurCours` du chapitre 50, on ajoute un champ d'upload d'image (chapitre 25), avec prévisualisation avant envoi.

```jsx
// pages/formateur/EditeurCours.jsx (extrait ajouté)
import { useState, useEffect } from "react";
import { uploaderImageCouverture } from "../../services/coursService";

function ChampImageCouverture({ imageActuelle, onImageEnvoyee }) {
  const [fichier, setFichier] = useState(null);
  const [previsualisation, setPrevisualisation] = useState(imageActuelle);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState("");

  function gererSelection(e) {
    const fichierChoisi = e.target.files[0];
    if (!fichierChoisi) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(fichierChoisi.type)) {
      setErreur("Formats acceptés : JPEG, PNG, WebP");
      return;
    }
    if (fichierChoisi.size > 3 * 1024 * 1024) {
      setErreur("Image trop volumineuse (max 3 Mo)");
      return;
    }

    setErreur("");
    setFichier(fichierChoisi);
    setPrevisualisation(URL.createObjectURL(fichierChoisi));
  }

  useEffect(() => {
    return () => {
      if (previsualisation?.startsWith("blob:")) URL.revokeObjectURL(previsualisation);
    };
  }, [previsualisation]);

  async function envoyer() {
    if (!fichier) return;
    setEnCours(true);
    try {
      const formData = new FormData();
      formData.append("image", fichier);
      const { data } = await uploaderImageCouverture(formData);
      onImageEnvoyee(data.url); // l'URL définitive stockée en base, retournée par le serveur
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-medium">Image de couverture</label>
      {previsualisation && (
        <img src={previsualisation} alt="Prévisualisation" className="w-full max-w-xs rounded-lg" />
      )}
      <input type="file" accept="image/*" onChange={gererSelection} />
      {erreur && <p className="text-red-600 text-sm">{erreur}</p>}
      {fichier && (
        <button type="button" onClick={envoyer} disabled={enCours} className="bg-gray-700 text-white px-3 py-1 rounded w-fit">
          {enCours ? "Envoi..." : "Téléverser l'image"}
        </button>
      )}
    </div>
  );
}
```

```jsx
// services/coursService.js (ajout, chapitre 25)
export const uploaderImageCouverture = (formData) =>
  api.post("/upload/cours-couverture", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
```

## 51.2 Intégration dans le formulaire principal

```jsx
function EditeurCours() {
  // ... code du chapitre 50 ...
  const [imageCouverture, setImageCouverture] = useState(null);

  async function onSubmit(donnees) {
    const donneesCompletes = { ...donnees, imageCouverture };
    // ... enregistrement comme au chapitre 50, avec le champ image inclus ...
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 flex flex-col gap-4">
      {/* ... champs titre/description/catégorie/prix du chapitre 50 ... */}

      <ChampImageCouverture
        imageActuelle={imageCouverture}
        onImageEnvoyee={(url) => setImageCouverture(url)}
      />

      <button type="submit">Enregistrer</button>
    </form>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pourquoi l'upload d'image est séparé de la soumission du formulaire principal</span>
Une image est envoyée **dès sa sélection confirmée** (bouton "Téléverser l'image" séparé), avant même la soumission du formulaire complet. Cela évite qu'un échec réseau sur l'image seule (souvent plus lente à envoyer qu'un texte) ne fasse échouer tout le formulaire, et permet d'afficher un état de progression dédié (chapitre 25, `onUploadProgress`) sans bloquer la saisie des autres champs.
</div>

## 51.3 Étendre le schéma Zod pour valider l'URL d'image

```ts
// schemas/coursSchema.ts (mise à jour du chapitre 50)
export const coursSchema = z.object({
  titre: z.string().min(5).max(100),
  description: z.string().min(20),
  categorie: z.enum(["informatique", "langues", "affaires", "sante"]),
  prix: z.number().min(0),
  imageCouverture: z.string().url("L'image de couverture est requise").nullable(),
});
```

## 51.4 Résumé du chapitre

- L'upload de l'image de couverture réutilise directement le pattern de validation/prévisualisation/envoi du chapitre 25, sans rien y ajouter de nouveau conceptuellement.
- Séparer l'envoi de l'image de la soumission du formulaire principal isole les deux opérations asynchrones, avec leurs propres états de chargement et d'erreur.
- Le schéma Zod du cours (chapitre 50) est étendu pour exiger une URL d'image valide, garantissant la cohérence entre validation frontend et donnée réellement attendue par le backend.

*Chapitre suivant : les tests automatisés du projet MiniCours.*
