<div class="chapitre-titre-num">CHAPITRE 33</div>

# Material UI (MUI)

## 33.1 Une librairie de composants complète, pensée React dès l'origine

Contrairement à Bootstrap (né hors de React, adapté ensuite), **Material UI (MUI)** est conçu **nativement** pour React, en suivant les principes du *Material Design* de Google. C'est l'une des librairies de composants les plus complètes de l'écosystème : boutons, formulaires, tableaux de données, dates, menus, notifications, tout est fourni avec un système de thème cohérent.

```
$ npm install @mui/material @emotion/react @emotion/styled
```

## 33.2 Premiers composants

```jsx
import { Button, TextField, Card, CardContent, Typography } from "@mui/material";

function CarteProduit({ nom, prix }) {
  return (
    <Card sx={{ maxWidth: 300 }}>
      <CardContent>
        <Typography variant="h6">{nom}</Typography>
        <Typography variant="body2" color="text.secondary">{prix} HTG</Typography>
        <Button variant="contained" sx={{ mt: 2 }}>
          Ajouter au panier
        </Button>
      </CardContent>
    </Card>
  );
}
```

La prop **`sx`** (présente sur quasiment tous les composants MUI) permet d'appliquer des styles CSS-in-JS directement en ligne, avec accès aux valeurs du thème (`mt: 2` = `margin-top: 16px`, 2 unités de l'échelle d'espacement MUI, par défaut 8px par unité).

## 33.3 Le système de thème centralisé

```jsx
// theme.js
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#146ef5" },
    secondary: { main: "#f50057" },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
});
```

```jsx
// main.jsx
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";

createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* réinitialise les styles par défaut du navigateur, cohérent entre navigateurs */}
    <App />
  </ThemeProvider>
);
```

Une fois le thème défini, **tous** les composants MUI de l'application (`<Button variant="contained">`) utilisent automatiquement `#146ef5` comme couleur primaire, sans avoir à la répéter — exactement le genre de cohérence de design system qu'on retrouve sur des projets comme GESCOM ou BANKA.

## 33.4 Formulaires et validation visuelle

```jsx
import { TextField } from "@mui/material";

function ChampEmail({ valeur, onChange, erreur }) {
  return (
    <TextField
      label="Email"
      type="email"
      value={valeur}
      onChange={onChange}
      error={Boolean(erreur)}
      helperText={erreur || "Nous ne partagerons jamais ton email"}
      fullWidth
    />
  );
}
```

`error` (booléen) et `helperText` (message) sont directement intégrés au composant `TextField`, avec l'apparence visuelle standard (bordure rouge, texte d'aide) gérée automatiquement selon leur valeur — un pattern qui s'articulera naturellement avec React Hook Form au chapitre 36.

## 33.5 Composants de mise en page : Box, Stack, Grid

```jsx
import { Box, Stack, Grid } from "@mui/material";

function TableauDeBord() {
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <StatCard titre="Ventes" valeur="12 400 HTG" />
        <StatCard titre="Clients" valeur="342" />
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <GraphiqueVentes />
        </Grid>
        <Grid item xs={12} md={6}>
          <ListeCommandesRecentes />
        </Grid>
      </Grid>
    </Box>
  );
}
```

- `Box` : équivalent d'un `<div>` avec accès direct à `sx`.
- `Stack` : aligne des éléments en ligne/colonne avec un espacement uniforme (`spacing`).
- `Grid` : système de grille responsive à 12 colonnes (`xs`, `md`, `lg` = breakpoints, comme le `Col md={4}` de Bootstrap au chapitre précédent).

## 33.6 Icônes

```
$ npm install @mui/icons-material
```

```jsx
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";

<IconButton onClick={supprimer} color="error">
  <DeleteIcon />
</IconButton>
```

## 33.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger sx et className sans cohérence</span>
```jsx
// ⚠️ Fonctionne, mais les deux systèmes de style se chevauchent sans logique claire
<Button className="mon-bouton-custom" sx={{ mt: 2 }}>Valider</Button>
```
Sur un projet utilisant MUI, privilégie systématiquement `sx` (ou le système de thème) plutôt que du CSS externe pour les composants MUI eux-mêmes — réserve les classes CSS classiques aux éléments qui n'appartiennent pas à MUI.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Bundle final volumineux si mal importé</span>
```jsx
// ❌ Importe potentiellement TOUT MUI si mal configuré côté bundler
import * as MUI from "@mui/material";

// ✅ Import nommé précis : seul ce qui est utilisé finit dans le bundle final
import { Button, TextField } from "@mui/material";
```
Avec Vite et les imports nommés précis (comme dans tous les exemples de ce chapitre), le tree-shaking élimine automatiquement le code non utilisé — voir chapitre 42 (Code Splitting) pour approfondir ce sujet.
</div>

## 33.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 33.1</span>

Crée un thème MUI avec une couleur primaire `#2e7d32` (vert), applique-le via `ThemeProvider`, puis utilise un `Button variant="contained"` pour vérifier que la couleur s'applique automatiquement.
</div>

**Corrigé :**
```jsx
const theme = createTheme({
  palette: { primary: { main: "#2e7d32" } },
});
// Une fois enveloppé dans <ThemeProvider theme={theme}>, <Button variant="contained"> devient vert automatiquement
```

## 33.9 Résumé du chapitre

- MUI est conçu nativement pour React, avec une bibliothèque de composants très complète suivant le Material Design.
- La prop `sx`, présente sur presque tous les composants, permet un style en ligne avec accès aux valeurs du thème.
- `createTheme` + `ThemeProvider` centralisent couleurs et typographie pour toute l'application.
- `Box`/`Stack`/`Grid` couvrent la majorité des besoins de mise en page sans CSS externe.

*Chapitre suivant : Ant Design, une alternative particulièrement adaptée aux applications de gestion et tableaux de données denses.*
