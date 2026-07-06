<div class="chapitre-titre-num">CHAPITRE 49</div>

# Projet final — Tableau de bord et statistiques

## 49.1 Recharts : des graphiques déclaratifs en JSX

**Recharts** est une librairie de graphiques construite nativement pour React : chaque graphique se compose de composants JSX, exactement comme n'importe quel autre composant du manuel.

```
$ npm install recharts
```

## 49.2 Redux Toolkit pour le catalogue de cours (chapitre 21 appliqué)

```jsx
// store/coursSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as coursService from "../services/coursService";

export const chargerCours = createAsyncThunk("cours/charger", async () => {
  const { data } = await coursService.getCours();
  return data;
});

const coursSlice = createSlice({
  name: "cours",
  initialState: { liste: [], statut: "inactif", erreur: null },
  reducers: {
    filtrerParCategorie(state, action) {
      state.filtreCategorie = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(chargerCours.pending, (state) => { state.statut = "chargement"; })
      .addCase(chargerCours.fulfilled, (state, action) => {
        state.statut = "reussi";
        state.liste = action.payload;
      })
      .addCase(chargerCours.rejected, (state, action) => {
        state.statut = "echec";
        state.erreur = action.error.message;
      });
  },
});

export const { filtrerParCategorie } = coursSlice.actions;
export default coursSlice.reducer;
```

## 49.3 Dashboard Étudiant

```jsx
// pages/etudiant/DashboardEtudiant.jsx
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { chargerCours } from "../../store/coursSlice";
import { useFetch } from "../../hooks/useFetch"; // chapitre 17

function DashboardEtudiant() {
  const dispatch = useDispatch();
  const { liste: tousLesCours, statut } = useSelector((state) => state.cours);
  const { donnees: progression, chargement } = useFetch("/user/progression");

  useEffect(() => {
    if (statut === "inactif") dispatch(chargerCours());
  }, [statut, dispatch]);

  if (chargement) return <p>Chargement de ton tableau de bord...</p>;

  const coursInscrits = tousLesCours.filter((c) => progression?.coursIds.includes(c.id));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bonjour {progression?.prenom} 👋</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CarteStat titre="Cours suivis" valeur={coursInscrits.length} />
        <CarteStat titre="Leçons terminées" valeur={progression?.leconsTerminees ?? 0} />
        <CarteStat titre="Série actuelle" valeur={`${progression?.serie ?? 0} jours`} />
      </div>

      <h2 className="text-xl font-semibold mb-2">Reprendre un cours</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {coursInscrits.map((cours) => (
          <CarteCoursEnCours key={cours.id} cours={cours} />
        ))}
      </div>
    </div>
  );
}

function CarteStat({ titre, valeur }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <p className="text-sm text-gray-500">{titre}</p>
      <p className="text-2xl font-bold">{valeur}</p>
    </div>
  );
}
```

## 49.4 Dashboard Formateur avec graphique Recharts

```jsx
// pages/formateur/DashboardFormateur.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useFetch } from "../../hooks/useFetch";

function DashboardFormateur() {
  const { donnees: stats, chargement, erreur } = useFetch("/formateur/stats");

  if (chargement) return <p>Chargement...</p>;
  if (erreur) return <p className="text-red-600">{erreur}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord formateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CarteStat titre="Cours publiés" valeur={stats.nombreCoursPublies} />
        <CarteStat titre="Étudiants inscrits" valeur={stats.nombreEtudiants} />
        <CarteStat titre="Taux de complétion moyen" valeur={`${stats.tauxCompletion}%`} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Nouvelles inscriptions (7 derniers jours)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.inscriptionsParJour}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="jour" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="nombre" stroke="#146ef5" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

`<ResponsiveContainer>` (rappel du chapitre 29 sur le responsive) adapte automatiquement la taille du graphique à son conteneur parent, sans media query manuelle.

## 49.5 Dashboard Admin avec graphique en secteurs

```jsx
// pages/admin/DashboardAdmin.jsx
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COULEURS = ["#146ef5", "#2fa860", "#f0a93a", "#d32f2f"];

function DashboardAdmin() {
  const { donnees: stats, chargement } = useFetch("/admin/stats");

  if (chargement) return <p>Chargement...</p>;

  const repartitionRoles = [
    { nom: "Étudiants", valeur: stats.nombreEtudiants },
    { nom: "Formateurs", valeur: stats.nombreFormateurs },
    { nom: "Admins", valeur: stats.nombreAdmins },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tableau de bord administrateur</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Répartition des utilisateurs</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={repartitionRoles} dataKey="valeur" nameKey="nom" outerRadius={80} label>
                {repartitionRoles.map((_, index) => (
                  <Cell key={index} fill={COULEURS[index % COULEURS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Cours en attente de validation</h2>
          <p className="text-4xl font-bold text-orange-500">{stats.coursEnAttente}</p>
          <Link to="/admin/validation-cours" className="text-blue-600 underline">
            Voir la liste →
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## 49.6 Le composant EtatRequete généralisé (chapitre 24 réutilisé)

```jsx
// Tous les dashboards ci-dessus pourraient être uniformisés avec le composant du chapitre 24
<EtatRequete
  chargement={chargement}
  erreur={erreur}
  enfants={<ContenuDashboard stats={stats} />}
/>
```

<div class="encadre astuce">
<span class="encadre-titre">💡 La réutilisation du chapitre 24 illustre l'intérêt de l'avoir construit une seule fois</span>
Plutôt que de répéter `if (chargement) return <p>...</p>` dans les trois dashboards, le composant générique construit au chapitre 24 pourrait uniformiser l'affichage des trois états sur l'ensemble du projet — exactement le bénéfice recherché en factorisant ce pattern une seule fois.
</div>

## 49.7 Résumé du chapitre

- Recharts permet de construire des graphiques entièrement en JSX, avec `<ResponsiveContainer>` gérant nativement l'adaptation à la taille de l'écran.
- Redux Toolkit (`chargerCours`, `useSelector`) alimente le catalogue partagé par le dashboard étudiant, le catalogue et la recherche.
- Chaque rôle a un dashboard dédié, réutilisant le hook `useFetch` (chapitre 17) et les composants `CarteStat` génériques.
- Le composant `EtatRequete` du chapitre 24 pourrait uniformiser la gestion chargement/erreur sur les trois dashboards.

*Chapitre suivant : les CRUD complets pour la gestion des cours et des utilisateurs.*
