<div class="chapitre-titre-num">ANNEXE A</div>

# Aide-mémoire syntaxe Node.js/Express

## npm (chapitres 3-4)

```
npm init -y
npm install express          # dependencies
npm install --save-dev jest  # devDependencies
npm ci                        # installation stricte et reproductible (production/CI)
npm outdated / npm audit
npx prisma init
```

## Async/Await (chapitres 8-10)

```js
async function exemple() {
  try {
    const resultat = await uneFonctionAsync();
  } catch (erreur) {
    console.error(erreur.message);
  }
}

// Parallélisme
const [a, b] = await Promise.all([fonctionA(), fonctionB()]);
```

## Express — routage et middlewares (chapitres 13-14)

```js
const express = require("express");
const app = express();
app.use(express.json());

const router = express.Router();
router.get("/", controleur.lister);
router.post("/", middleware1, middleware2, controleur.creer);
app.use("/api/ressource", router);

function monMiddleware(req, res, next) {
  // ...
  next();
}
```

## Architecture en couches (chapitres 15-17)

```
Route → Contrôleur (extrait req, appelle service) → Service (logique métier)
      → Repository (accès aux données) → Base de données
```

## Validation Zod (chapitre 18)

```js
const { z } = require("zod");
const schema = z.object({
  email: z.string().email(),
  age: z.number().int().min(18),
});
const resultat = schema.safeParse(data);
```

## Gestion d'erreurs (chapitre 19)

```js
class ErreurApplicative extends Error {
  constructor(message, statut) { super(message); this.statut = statut; }
}

function gestionnaireErreurs(err, req, res, next) {
  res.status(err.statut || 500).json({ message: err.message });
}
app.use(gestionnaireErreurs); // TOUJOURS en dernier
```

## JWT (chapitre 23)

```js
const jwt = require("jsonwebtoken");
const token = jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

## bcrypt (chapitre 22)

```js
const hash = await bcrypt.hash(motDePasse, 10);
const estValide = await bcrypt.compare(motDePasseSaisi, hash);
```

## Prisma (chapitre 34)

```prisma
model Utilisateur {
  id    Int    @id @default(autoincrement())
  email String @unique
}
```
```js
await prisma.utilisateur.create({ data: {...} });
await prisma.utilisateur.findUnique({ where: { id } });
await prisma.utilisateur.findMany({ where: {...}, include: {...} });
await prisma.$transaction(async (tx) => { ... });
```

## Docker (chapitres 37-38)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```
```
docker build -t mon-api .
docker compose up -d --build
```

## Tests (chapitres 29-30)

```js
describe("groupe", () => {
  it("teste quelque chose", () => {
    expect(valeur).toBe(attendu);
  });
});

// Supertest
const request = require("supertest");
await request(app).post("/api/route").send({...});
```
