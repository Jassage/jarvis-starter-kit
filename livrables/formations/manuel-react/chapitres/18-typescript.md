<div class="chapitre-titre-num">CHAPITRE 18</div>

# TypeScript avec React

## 18.1 Pourquoi TypeScript en environnement professionnel

TypeScript est un **sur-ensemble** de JavaScript qui ajoute un système de **types statiques**, vérifiés **avant l'exécution** (à la compilation), directement dans ton éditeur.

**Analogie :** JavaScript sans types, c'est comme recevoir un colis sans étiquette : tu dois l'ouvrir (exécuter le code) pour savoir ce qu'il contient, parfois pour découvrir une mauvaise surprise. TypeScript, c'est l'étiquette sur le colis : tu sais **à l'avance**, sans l'ouvrir, ce qu'il contient et si tu peux l'utiliser comme prévu.

```jsx
// JavaScript : l'erreur n'apparaît qu'à l'EXÉCUTION, potentiellement en production
function calculerTotal(prix, quantite) {
  return prix * quantite;
}
calculerTotal("250", "trois"); // NaN — aucune erreur avant l'exécution
```

```tsx
// TypeScript : l'erreur est détectée AVANT même de lancer le code, dans l'éditeur
function calculerTotal(prix: number, quantite: number): number {
  return prix * quantite;
}
calculerTotal("250", "trois");
// ❌ Erreur de compilation : Argument of type 'string' is not assignable to parameter of type 'number'
```

C'est particulièrement précieux sur les projets que tu développes déjà (BANKA, GESCOM...) : moins de bugs de type "undefined n'est pas une fonction" découverts en production, auto-complétion fiable dans l'éditeur, et un code qui documente lui-même la forme de ses données.

## 18.2 Typer les props

```tsx
// Interface décrivant la forme exacte des props attendues
interface CarteProduitProps {
  nom: string;
  prix: number;
  enPromo?: boolean; // le ? indique une prop optionnelle
}

function CarteProduit({ nom, prix, enPromo = false }: CarteProduitProps) {
  return (
    <div>
      <h3>{nom}</h3>
      <p>{prix} HTG {enPromo && "(Promo !)"}</p>
    </div>
  );
}

// ✅ Correct
<CarteProduit nom="Riz" prix={250} />

// ❌ Erreur de compilation : prix attend un number, pas une string
<CarteProduit nom="Riz" prix="250" />
```

## 18.3 Typer le state avec useState

Dans la majorité des cas, TypeScript **infère automatiquement** le type à partir de la valeur initiale :

```tsx
const [compteur, setCompteur] = useState(0); // TypeScript déduit : number
const [nom, setNom] = useState("");          // TypeScript déduit : string
```

Quand la valeur initiale ne suffit pas à déterminer le type complet (cas très fréquent : une valeur initiale `null` qui deviendra un objet plus tard), on précise le type explicitement avec la syntaxe générique `<Type>` :

```tsx
interface Utilisateur {
  id: number;
  nom: string;
  email: string;
}

const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);

// Plus loin dans le composant :
if (utilisateur) {
  console.log(utilisateur.email); // TypeScript SAIT que utilisateur n'est plus null ici (narrowing)
}
```

## 18.4 Typer les événements

```tsx
import { ChangeEvent, FormEvent } from "react";

function FormulaireConnexion() {
  const [email, setEmail] = useState("");

  function gererChangement(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function gererSoumission(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(email);
  }

  return (
    <form onSubmit={gererSoumission}>
      <input type="email" value={email} onChange={gererChangement} />
      <button type="submit">Envoyer</button>
    </form>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Pas besoin de mémoriser tous les types d'événements</span>
Dans la pratique, on écrit rarement `(e: ChangeEvent<HTMLInputElement>) => ...` de mémoire : on écrit `onChange={(e) => setEmail(e.target.value)}` directement en ligne, et **TypeScript infère automatiquement** le type correct de `e` à partir du type de l'élément JSX (`<input>`) sur lequel l'événement est attaché. On ne type explicitement l'événement que lorsqu'on extrait le gestionnaire dans une fonction séparée, comme ci-dessus.
</div>

## 18.5 Typer les hooks personnalisés

```tsx
interface UseFetchResultat<T> {
  donnees: T | null;
  chargement: boolean;
  erreur: string | null;
}

function useFetch<T>(url: string): UseFetchResultat<T> {
  const [donnees, setDonnees] = useState<T | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((json: T) => setDonnees(json))
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [url]);

  return { donnees, chargement, erreur };
}

// Utilisation : <Produit[]> précise le type attendu pour "donnees"
interface Produit { id: number; nom: string; }
const { donnees } = useFetch<Produit[]>("/api/produits");
```

Le `<T>` est un **générique** : il permet à `useFetch` de rester réutilisable pour n'importe quel type de données (`Produit[]`, `Utilisateur`, etc.), tout en gardant une vérification de type précise à chaque utilisation.

## 18.6 Typer children et les composants "enveloppe"

```tsx
import { ReactNode } from "react";

interface CarteProps {
  titre: string;
  children: ReactNode; // type couvrant tout ce qui peut être rendu par React (texte, JSX, tableau de JSX...)
}

function Carte({ titre, children }: CarteProps) {
  return (
    <div className="carte">
      <h3>{titre}</h3>
      {children}
    </div>
  );
}
```

## 18.7 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Utiliser `any` pour "faire taire" une erreur</span>
```tsx
// ❌ any désactive complètement la vérification de type — annule l'intérêt de TypeScript
function traiterDonnees(donnees: any) {
  return donnees.valeurQuiNexistePas.toUpperCase(); // aucune erreur détectée, plantera à l'exécution
}
```
`any` est parfois nécessaire en dernier recours (données externes vraiment imprévisibles), mais l'utiliser par facilité pour éviter de réfléchir au vrai type revient à écrire du JavaScript classique avec une étape de compilation en plus, sans aucun des bénéfices. Préfère `unknown` (qui **force** à vérifier le type avant utilisation) si le type est réellement incertain.
</div>

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier que le narrowing ne survit pas à un changement de state entre deux vérifications</span>
TypeScript déduit qu'une valeur n'est plus `null` **au moment où tu le vérifies dans le code**, mais cette certitude ne "traverse" pas un appel asynchrone ou un second rendu. Il faut souvent revérifier après un `await` ou dans un nouveau `useEffect`.
</div>

## 18.8 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 18.1</span>

Type le composant suivant en définissant une interface `BoutonProps` (avec `label: string`, `onClick: () => void`, `variante?: "primaire" | "secondaire"`).
```jsx
function Bouton({ label, onClick, variante = "primaire" }) {
  return <button className={`btn-${variante}`} onClick={onClick}>{label}</button>;
}
```
</div>

**Corrigé :**
```tsx
interface BoutonProps {
  label: string;
  onClick: () => void;
  variante?: "primaire" | "secondaire";
}

function Bouton({ label, onClick, variante = "primaire" }: BoutonProps) {
  return <button className={`btn-${variante}`} onClick={onClick}>{label}</button>;
}
```
Le type `"primaire" | "secondaire"` est un **type union littéral** : seules ces deux chaînes exactes sont acceptées, ce qui empêche par exemple une faute de frappe `"primair"` de passer inaperçue.

## 18.9 Résumé du chapitre

- TypeScript détecte les erreurs de type **avant l'exécution**, directement dans l'éditeur.
- Props : une `interface` décrit leur forme exacte, avec `?` pour les champs optionnels.
- State : le type est souvent inféré depuis la valeur initiale ; sinon, préciser via `useState<Type | null>(null)`.
- Événements : généralement inférés automatiquement en ligne ; typage explicite (`ChangeEvent<HTMLInputElement>`) surtout utile pour un gestionnaire extrait en fonction séparée.
- Évite `any` ; préfère `unknown` si le type est réellement incertain.

*Ceci clôt la Partie 2 (Hooks). Chapitre suivant : React Router, pour naviguer entre les pages d'une application.*
