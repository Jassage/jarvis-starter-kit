<div class="chapitre-titre-num">CHAPITRE 32</div>

# Bootstrap (React-Bootstrap)

## 32.1 Bootstrap classique vs React-Bootstrap

Bootstrap est historiquement une librairie CSS + JavaScript (jQuery à l'origine) fournissant des classes toutes prêtes (`.btn`, `.card`, `.modal`) et des composants interactifs (modales, carrousels, dropdowns). Utiliser le Bootstrap "classique" avec React pose un problème : son JavaScript manipule le DOM **directement**, ce qui entre en conflit avec la gestion du DOM par React (rappel du Virtual DOM, chapitre 1).

**React-Bootstrap** réécrit chaque composant interactif de Bootstrap en véritable composant React (state géré par React, pas par du DOM manipulé en coulisses), tout en conservant les mêmes classes CSS visuelles.

```
$ npm install react-bootstrap bootstrap
```

```jsx
// main.jsx
import "bootstrap/dist/css/bootstrap.min.css";
```

## 32.2 Composants de base

```jsx
import { Button, Card, Container, Row, Col } from "react-bootstrap";

function CarteProduit({ nom, prix }) {
  return (
    <Card style={{ width: "18rem" }}>
      <Card.Body>
        <Card.Title>{nom}</Card.Title>
        <Card.Text>{prix} HTG</Card.Text>
        <Button variant="primary">Ajouter au panier</Button>
      </Card.Body>
    </Card>
  );
}

function Grille() {
  return (
    <Container>
      <Row>
        <Col md={4}><CarteProduit nom="Riz" prix={250} /></Col>
        <Col md={4}><CarteProduit nom="Haricots" prix={180} /></Col>
        <Col md={4}><CarteProduit nom="Maïs" prix={150} /></Col>
      </Row>
    </Container>
  );
}
```

Le système de grille (`Container`/`Row`/`Col`) reprend directement le système de 12 colonnes de Bootstrap, avec des breakpoints responsive intégrés (`Col md={4}` = 4/12 colonnes à partir de la taille "medium").

## 32.3 Composants interactifs : le vrai bénéfice de React-Bootstrap

```jsx
import { Modal, Button } from "react-bootstrap";
import { useState } from "react";

function ModalConfirmation() {
  const [afficher, setAfficher] = useState(false);

  return (
    <>
      <Button variant="danger" onClick={() => setAfficher(true)}>
        Supprimer
      </Button>

      <Modal show={afficher} onHide={() => setAfficher(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>Es-tu sûr de vouloir supprimer cet élément ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setAfficher(false)}>Annuler</Button>
          <Button variant="danger" onClick={() => { /* logique de suppression */ setAfficher(false); }}>
            Confirmer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
```

L'affichage de la modale est piloté par un **state React classique** (`afficher`, `useState`) — exactement le pattern vu au chapitre 7, sans aucune manipulation DOM directe (`document.getElementById(...).classList.add("show")`, comme le ferait le Bootstrap "classique" avec jQuery).

<div class="encadre attention">
<span class="encadre-titre">⚠️ Ne jamais utiliser le JavaScript de Bootstrap "classique" avec React</span>
```jsx
// ❌ Incompatible : bootstrap.bundle.js manipule le DOM directement,
// en conflit avec la réconciliation du Virtual DOM (chapitre 1)
import "bootstrap/dist/js/bootstrap.bundle.min.js";
document.getElementById("maModale").classList.add("show");
```
Utiliser React-Bootstrap (composants React purs) plutôt que le CSS Bootstrap accompagné de son JS natif est **la** règle à retenir pour tout composant interactif (modale, dropdown, tooltip, carrousel).
</div>

## 32.4 Formulaires avec React-Bootstrap

```jsx
import { Form, Button } from "react-bootstrap";

function FormulaireConnexion() {
  const [email, setEmail] = useState("");

  return (
    <Form>
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nom@exemple.com"
        />
      </Form.Group>
      <Button variant="primary" type="submit">Se connecter</Button>
    </Form>
  );
}
```

Remarque : `Form.Control` reste un **composant contrôlé classique** (chapitre 11) — React-Bootstrap n'invente pas une nouvelle façon de gérer les formulaires, il habille visuellement les mêmes patterns déjà appris.

## 32.5 Quand choisir Bootstrap/React-Bootstrap

<div class="encadre astuce">
<span class="encadre-titre">💡 Bon choix si...</span>
- L'équipe connaît déjà Bootstrap (beaucoup de développeurs en ont une expérience préalable).
- Le projet a besoin d'être livré rapidement avec une apparence professionnelle "par défaut", sans design sur-mesure poussé.
- Migration d'un projet existant en Bootstrap classique vers React.
</div>

Le chapitre 35 compare en détail Bootstrap, Tailwind, MUI et Ant Design pour t'aider à choisir selon le contexte précis de chaque projet.

## 32.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Mélanger classes CSS Bootstrap brutes et composants React-Bootstrap sans cohérence</span>
```jsx
// ⚠️ Fonctionne, mais mélange deux styles d'écriture différents sans raison claire
<div className="card">
  <Button variant="primary">Action</Button>
</div>
```
Une fois React-Bootstrap installé, privilégie systématiquement ses composants (`<Card>`, `<Container>`) plutôt que les classes CSS brutes (`className="card"`) : cela garde le code cohérent et bénéficie de la vérification TypeScript des props si le projet en utilise (chapitre 18).
</div>

## 32.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 32.1</span>

Construis une barre de navigation avec `Navbar` et `Nav` de React-Bootstrap, contenant un logo et trois liens (Accueil, Produits, Contact), en utilisant `<Link>` de React Router (chapitre 19) pour la navigation réelle.
</div>

**Corrigé :**
```jsx
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function BarreNavigation() {
  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">MonSite</Navbar.Brand>
      <Nav>
        <Nav.Link as={Link} to="/">Accueil</Nav.Link>
        <Nav.Link as={Link} to="/produits">Produits</Nav.Link>
        <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
      </Nav>
    </Navbar>
  );
}
```
La prop `as={Link}` demande à React-Bootstrap de rendre le composant avec le comportement de navigation de React Router, tout en conservant l'apparence visuelle de Bootstrap.

## 32.8 Résumé du chapitre

- React-Bootstrap réécrit les composants interactifs de Bootstrap en véritables composants React, évitant tout conflit avec le Virtual DOM.
- Ne jamais utiliser le JavaScript natif de Bootstrap (`bootstrap.bundle.js`) dans un projet React.
- Les formulaires React-Bootstrap restent des composants contrôlés classiques, juste habillés visuellement.
- La prop `as={Link}` permet d'intégrer proprement React Router aux composants de navigation.

*Chapitre suivant : Material UI (MUI), une librairie de composants complète suivant le Material Design de Google.*
