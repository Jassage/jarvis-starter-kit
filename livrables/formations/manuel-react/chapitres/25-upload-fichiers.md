<div class="chapitre-titre-num">CHAPITRE 25</div>

# Téléversement de fichiers

## 25.1 Pourquoi &lt;input type="file"&gt; est toujours non contrôlé

Rappel du chapitre 11 : un champ contrôlé garde sa valeur dans le state React. Pour des raisons de sécurité imposées par les navigateurs, **il est impossible de définir programmatiquement la valeur d'un `<input type="file">`** (on ne peut pas "pré-remplir" un champ fichier avec du JavaScript, pour empêcher qu'un site web accède secrètement à des fichiers du disque de l'utilisateur). Ce champ reste donc toujours **non contrôlé** : on lit sa valeur au moment du changement, sans jamais chercher à la fixer via `value`.

```jsx
function SelecteurFichier() {
  const [fichier, setFichier] = useState(null);

  function gererChangement(e) {
    const fichierChoisi = e.target.files[0]; // FileList → on prend le premier fichier
    setFichier(fichierChoisi);
  }

  return (
    <div>
      <input type="file" onChange={gererChangement} accept="image/*" />
      {fichier && <p>Fichier sélectionné : {fichier.name} ({Math.round(fichier.size / 1024)} Ko)</p>}
    </div>
  );
}
```

## 25.2 Prévisualiser une image avant envoi

```jsx
function UploadAvatar() {
  const [fichier, setFichier] = useState(null);
  const [previsualisation, setPrevisualisation] = useState(null);

  function gererChangement(e) {
    const fichierChoisi = e.target.files[0];
    if (!fichierChoisi) return;

    setFichier(fichierChoisi);
    setPrevisualisation(URL.createObjectURL(fichierChoisi)); // URL locale temporaire
  }

  useEffect(() => {
    // Libère la mémoire associée à l'URL temporaire quand elle n'est plus utilisée
    return () => {
      if (previsualisation) URL.revokeObjectURL(previsualisation);
    };
  }, [previsualisation]);

  return (
    <div>
      <input type="file" accept="image/*" onChange={gererChangement} />
      {previsualisation && <img src={previsualisation} alt="Prévisualisation" width={100} />}
    </div>
  );
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais oublier URL.revokeObjectURL</span>
`URL.createObjectURL()` réserve de la mémoire dans le navigateur pour représenter le fichier localement. Sans `revokeObjectURL()` dans le nettoyage de l'effet (chapitre 12), cette mémoire n'est jamais libérée tant que la page reste ouverte — une fuite mémoire discrète mais réelle sur une application où l'utilisateur change souvent d'image (ex : plusieurs tentatives sur un formulaire de profil).
</div>

## 25.3 Envoyer le fichier au serveur avec FormData

Un fichier ne peut pas être envoyé comme du JSON classique. Il faut utiliser l'objet natif **`FormData`**, qui encode les données au format `multipart/form-data` :

```jsx
async function envoyerAvatar(fichier) {
  const formData = new FormData();
  formData.append("avatar", fichier);
  formData.append("userId", "42"); // on peut ajouter d'autres champs au passage

  const reponse = await api.post("/profil/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return reponse.data;
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Axios ajuste le Content-Type automatiquement</span>
En pratique, il n'est même pas toujours nécessaire de préciser `"Content-Type": "multipart/form-data"` manuellement : Axios détecte un objet `FormData` et configure lui-même l'en-tête complet, avec le "boundary" nécessaire (une chaîne de séparation entre les parties du fichier) que Content-Type doit contenir mais qu'il est très difficile de construire correctement à la main.
</div>

## 25.4 Suivre la progression de l'envoi

```jsx
function UploadAvecProgression() {
  const [progression, setProgression] = useState(0);

  async function envoyer(fichier) {
    const formData = new FormData();
    formData.append("fichier", fichier);

    await api.post("/upload", formData, {
      onUploadProgress: (evenementProgres) => {
        const pourcentage = Math.round((evenementProgres.loaded * 100) / evenementProgres.total);
        setProgression(pourcentage);
      },
    });
  }

  return (
    <div>
      <progress value={progression} max={100} />
      <span>{progression}%</span>
    </div>
  );
}
```

## 25.5 Validation avant envoi (taille, type)

```jsx
const TAILLE_MAX_MO = 5;
const TYPES_AUTORISES = ["image/jpeg", "image/png", "image/webp"];

function validerFichier(fichier) {
  if (!TYPES_AUTORISES.includes(fichier.type)) {
    return "Formats acceptés : JPEG, PNG, WebP.";
  }
  if (fichier.size > TAILLE_MAX_MO * 1024 * 1024) {
    return `Fichier trop volumineux (max ${TAILLE_MAX_MO} Mo).`;
  }
  return null; // aucune erreur
}
```

<div class="encadre attention">
<span class="encadre-titre">⚠️ La validation côté frontend ne remplace jamais la validation côté serveur</span>
Exactement comme pour la sécurité des routes protégées (chapitre 20), la validation de type/taille côté React n'est qu'un confort d'expérience utilisateur (retour immédiat, sans attendre l'aller-retour réseau). Un utilisateur malveillant peut envoyer une requête directement à l'API en contournant totalement l'interface. Le serveur (backend) doit **toujours** revalider le type MIME réel du fichier (pas juste son extension) et sa taille avant de l'accepter et de le stocker.
</div>

## 25.6 Plusieurs fichiers à la fois

```jsx
function UploadMultiple() {
  const [fichiers, setFichiers] = useState([]);

  function gererChangement(e) {
    setFichiers(Array.from(e.target.files)); // FileList → tableau JavaScript classique
  }

  return (
    <div>
      <input type="file" multiple onChange={gererChangement} />
      <ul>
        {fichiers.map((f, index) => (
          <li key={index}>{f.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

## 25.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 25.1</span>

Écris un composant `UploadDocument` qui accepte uniquement des fichiers PDF de moins de 2 Mo, affiche un message d'erreur sinon, et affiche le nom du fichier accepté.
</div>

**Corrigé :**
```jsx
function UploadDocument() {
  const [erreur, setErreur] = useState("");
  const [nomFichier, setNomFichier] = useState("");

  function gererChangement(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;

    if (fichier.type !== "application/pdf") {
      setErreur("Seuls les fichiers PDF sont acceptés.");
      setNomFichier("");
      return;
    }
    if (fichier.size > 2 * 1024 * 1024) {
      setErreur("Le fichier ne doit pas dépasser 2 Mo.");
      setNomFichier("");
      return;
    }

    setErreur("");
    setNomFichier(fichier.name);
  }

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={gererChangement} />
      {erreur && <p className="erreur">{erreur}</p>}
      {nomFichier && <p>Fichier accepté : {nomFichier}</p>}
    </div>
  );
}
```

## 25.8 Résumé du chapitre

- `<input type="file">` est toujours non contrôlé ; on lit `e.target.files` au changement.
- `URL.createObjectURL()` permet une prévisualisation locale immédiate ; toujours appeler `URL.revokeObjectURL()` en nettoyage.
- Un fichier s'envoie via `FormData`, jamais en JSON classique ; Axios ajuste automatiquement le `Content-Type`.
- `onUploadProgress` permet d'afficher une barre de progression réelle.
- La validation frontend (type, taille) est un confort d'UX ; le serveur doit toujours revalider indépendamment.

*Chapitre suivant : l'authentification JWT, pour sécuriser l'accès à une application React consommant une API.*
