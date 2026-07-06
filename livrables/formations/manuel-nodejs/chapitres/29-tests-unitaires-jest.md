<div class="chapitre-titre-num">CHAPITRE 29</div>

# Tests unitaires (Jest)

## Objectifs pédagogiques

Configurer Jest, écrire des tests unitaires sur des services (logique métier pure), et utiliser les mocks pour isoler le code testé de ses dépendances.

## 29.1 Pourquoi tester en priorité les services

<div class="encadre astuce">
<span class="encadre-titre">💡 Rappel de l'architecture en couches (chapitre 17)</span>
Les **services** contiennent la logique métier pure, indépendante de HTTP et de la base de données réelle (grâce à l'injection du repository). Ce sont les candidats **idéaux** pour des tests unitaires rapides et fiables — contrairement aux contrôleurs (qui nécessitent une vraie requête HTTP, chapitre 30) ou aux repositories (qui nécessitent une vraie base de données).
</div>

## 29.2 Installation et configuration

```
$ npm install --save-dev jest
```

```json
// package.json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

## 29.3 Premier test unitaire

```js
// src/services/calculs.service.js
function calculerTotalPanier(articles) {
  return articles.reduce((total, article) => total + article.prix * article.quantite, 0);
}

module.exports = { calculerTotalPanier };
```

```js
// src/services/calculs.service.test.js
const { calculerTotalPanier } = require("./calculs.service");

describe("calculerTotalPanier", () => {
  it("calcule correctement le total de plusieurs articles", () => {
    const articles = [
      { prix: 250, quantite: 2 },
      { prix: 100, quantite: 3 },
    ];
    expect(calculerTotalPanier(articles)).toBe(800); // 250*2 + 100*3
  });

  it("retourne 0 pour un panier vide", () => {
    expect(calculerTotalPanier([])).toBe(0);
  });
});
```

```
$ npm test

 PASS  src/services/calculs.service.test.js
  calculerTotalPanier
    ✓ calcule correctement le total de plusieurs articles (2 ms)
    ✓ retourne 0 pour un panier vide (1 ms)

Test Suites: 1 passed, 1 total
Tests:       2 passed, 2 total
```

## 29.4 Les matchers Jest essentiels

```js
expect(resultat).toBe(5);                    // égalité STRICTE (===), pour primitives
expect(objet).toEqual({ nom: "Jaslin" });     // égalité PROFONDE de structure, pour objets/tableaux
expect(valeur).toBeNull();
expect(valeur).toBeUndefined();
expect(valeur).toBeTruthy();
expect(tableau).toContain("element");
expect(tableau).toHaveLength(3);
expect(fonction).toThrow("message d'erreur"); // vérifie qu'une fonction lève bien une exception
```

## 29.5 Tester du code asynchrone

```js
// service à tester
async function verifierAge(age) {
  if (age < 0 || age > 120) {
    throw new Error("Âge invalide");
  }
  return true;
}
```

```js
describe("verifierAge", () => {
  it("résout à true pour un âge valide", async () => {
    await expect(verifierAge(25)).resolves.toBe(true);
  });

  it("rejette pour un âge invalide", async () => {
    await expect(verifierAge(-5)).rejects.toThrow("Âge invalide");
  });
});
```

## 29.6 Mocker un repository pour tester un service isolément

```js
// services/utilisateurs.service.js
async function creerUtilisateur({ nom, email, motDePasse }, utilisateurRepository, bcrypt) {
  const existant = await utilisateurRepository.trouverParEmail(email);
  if (existant) {
    throw new ConflitError("Cet email est déjà utilisé");
  }
  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  return utilisateurRepository.creer({ nom, email, motDePasseHash });
}
```

```js
describe("creerUtilisateur", () => {
  it("lève une ConflitError si l'email existe déjà", async () => {
    const repositoryFactice = {
      trouverParEmail: jest.fn().mockResolvedValue({ id: 1, email: "jaslin@mail.com" }), // simule un utilisateur EXISTANT
      creer: jest.fn(),
    };
    const bcryptFactice = { hash: jest.fn() };

    await expect(
      creerUtilisateur({ nom: "Jaslin", email: "jaslin@mail.com", motDePasse: "abc12345" }, repositoryFactice, bcryptFactice)
    ).rejects.toThrow("Cet email est déjà utilisé");

    expect(repositoryFactice.creer).not.toHaveBeenCalled(); // vérifie que creer() n'a JAMAIS été appelé
  });

  it("crée l'utilisateur si l'email est disponible", async () => {
    const repositoryFactice = {
      trouverParEmail: jest.fn().mockResolvedValue(null), // aucun utilisateur existant
      creer: jest.fn().mockResolvedValue({ id: 1, nom: "Jaslin" }),
    };
    const bcryptFactice = { hash: jest.fn().mockResolvedValue("hash-simule") };

    const resultat = await creerUtilisateur(
      { nom: "Jaslin", email: "jaslin@mail.com", motDePasse: "abc12345" },
      repositoryFactice,
      bcryptFactice
    );

    expect(resultat.nom).toBe("Jaslin");
    expect(repositoryFactice.creer).toHaveBeenCalledWith({
      nom: "Jaslin", email: "jaslin@mail.com", motDePasseHash: "hash-simule",
    });
  });
});
```

<div class="encadre astuce">
<span class="encadre-titre">💡 jest.fn() crée une fonction "espion", vérifiable et simulable</span>
`jest.fn()` crée une fonction factice dont on peut définir la valeur de retour (`mockResolvedValue` pour une Promise résolue, `mockRejectedValue` pour une Promise rejetée) et vérifier **comment** elle a été appelée (`toHaveBeenCalledWith(...)`, `toHaveBeenCalledTimes(...)`) — la base de l'isolation d'un service de ses dépendances réelles.
</div>

## 29.7 jest.mock() : mocker un module entier

```js
// Alternative : mocker automatiquement TOUT un module (plutôt que de passer des dépendances en paramètre)
jest.mock("../repositories/utilisateurs.repository");
const UtilisateurRepository = require("../repositories/utilisateurs.repository");

describe("UtilisateurService avec jest.mock", () => {
  it("appelle bien le repository mocké", async () => {
    UtilisateurRepository.trouverParEmail.mockResolvedValue(null);
    UtilisateurRepository.creer.mockResolvedValue({ id: 1 });

    await UtilisateurService.creerUtilisateur({ nom: "Jaslin", email: "jaslin@mail.com", motDePasse: "abc12345" });

    expect(UtilisateurRepository.creer).toHaveBeenCalled();
  });
});
```

## 29.8 Organisation des tests et couverture de code

```
src/
├── services/
│   ├── utilisateurs.service.js
│   └── utilisateurs.service.test.js  # convention : fichier de test À CÔTÉ du fichier testé
```

```
$ npm run test:coverage

--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
utilisateurs.service |   85.71 |    75.00 |  100.00 |   85.71 |
--------------------|---------|----------|---------|---------|
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un taux de couverture élevé n'est pas une fin en soi</span>
100% de couverture ne garantit **pas** l'absence de bugs — cela signifie seulement que chaque ligne a été **exécutée** au moins une fois par les tests, pas que tous les cas limites ont été vérifiés. Vise une couverture élevée sur la logique métier critique, sans en faire un objectif chiffré aveugle qui pousserait à écrire des tests superficiels juste pour "faire du chiffre".
</div>

## 29.9 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Oublier await sur une assertion Jest asynchrone</span>
```js
it("rejette pour un âge invalide", () => {
  expect(verifierAge(-5)).rejects.toThrow("Âge invalide"); // ❌ pas de "await" : le test PASSE même si l'assertion échoue !
});
```
```js
it("rejette pour un âge invalide", async () => {
  await expect(verifierAge(-5)).rejects.toThrow("Âge invalide"); // ✅ "await" garantit que Jest attend le résultat réel
});
```
Sans `await` (ou `return`), Jest ne sait pas attendre la résolution de la Promise avant de conclure le test réussi — un piège **silencieux** qui donne une fausse impression de test fonctionnel alors qu'il ne vérifie en réalité rien du tout.
</div>

## 29.10 Résumé du chapitre

- Les services (logique métier pure) sont les candidats prioritaires pour des tests unitaires rapides et fiables.
- Les matchers Jest (`toBe`, `toEqual`, `toThrow`, `resolves`/`rejects`) couvrent la quasi-totalité des besoins d'assertion.
- `jest.fn()` crée des fonctions espion simulables, permettant d'isoler un service de son repository réel.
- Toujours `await` (ou `return`) une assertion Jest sur du code asynchrone, sinon le test peut réussir silencieusement sans rien vérifier.

## Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 29.1</span>

Écris un test unitaire pour une fonction `calculerRemise(montant, pourcentage)` qui retourne le montant après application d'une remise, en vérifiant qu'elle lève une erreur si le pourcentage est hors de la plage 0-100.
</div>

**Corrigé :**
```js
function calculerRemise(montant, pourcentage) {
  if (pourcentage < 0 || pourcentage > 100) {
    throw new Error("Pourcentage invalide");
  }
  return montant * (1 - pourcentage / 100);
}

describe("calculerRemise", () => {
  it("applique correctement une remise de 20%", () => {
    expect(calculerRemise(1000, 20)).toBe(800);
  });

  it("lève une erreur pour un pourcentage invalide", () => {
    expect(() => calculerRemise(1000, 150)).toThrow("Pourcentage invalide");
  });
});
```

*Chapitre suivant : les tests d'intégration avec Supertest, pour tester l'API dans son ensemble, requête HTTP complète incluse.*
