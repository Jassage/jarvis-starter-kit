<div class="chapitre-titre-num">CHAPITRE 34</div>

# Ant Design

## 34.1 Une librairie taillée pour les applications de gestion (back-office)

**Ant Design (AntD)**, développée par Alibaba, se distingue par sa spécialisation dans les interfaces **denses en données** : tableaux complexes (tri, filtres, pagination, édition en ligne), formulaires longs avec validation intégrée, tableaux de bord d'entreprise. C'est un choix particulièrement pertinent pour des applications comme GESCOM, BANKA ou MEDIKA, où la densité d'information prime souvent sur le design "vitrine".

```
$ npm install antd
```

```jsx
// main.jsx
import "antd/dist/reset.css";
```

## 34.2 Le composant Table : la véritable force d'Ant Design

```jsx
import { Table, Tag } from "antd";

function TableauClients({ clients }) {
  const colonnes = [
    { title: "Nom", dataIndex: "nom", key: "nom", sorter: (a, b) => a.nom.localeCompare(b.nom) },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Statut",
      dataIndex: "statut",
      key: "statut",
      render: (statut) => (
        <Tag color={statut === "actif" ? "green" : "red"}>{statut.toUpperCase()}</Tag>
      ),
      filters: [
        { text: "Actif", value: "actif" },
        { text: "Inactif", value: "inactif" },
      ],
      onFilter: (valeur, enregistrement) => enregistrement.statut === valeur,
    },
  ];

  return (
    <Table
      dataSource={clients}
      columns={colonnes}
      rowKey="id"
      pagination={{ pageSize: 10 }}
    />
  );
}
```

En quelques lignes de configuration déclarative, `<Table>` fournit : tri par colonne, filtres, pagination — des fonctionnalités qui demanderaient, écrites à la main avec les techniques des chapitres 9-10, plusieurs dizaines de lignes de logique (state de tri, state de filtre, state de page, calculs de tranches...).

<div class="encadre astuce">
<span class="encadre-titre">💡 rowKey, l'équivalent de la prop key du chapitre 10</span>
`rowKey="id"` indique à Ant Design quel champ utiliser comme identifiant unique pour chaque ligne — exactement le même principe que la prop `key` vue au chapitre 10 pour les listes `.map()`, ici délégué au composant `Table` en interne.
</div>

## 34.3 Formulaires avec validation intégrée

```jsx
import { Form, Input, Button } from "antd";

function FormulaireClient() {
  const [form] = Form.useForm();

  function gererSoumission(valeurs) {
    console.log("Valeurs validées :", valeurs);
  }

  return (
    <Form form={form} layout="vertical" onFinish={gererSoumission}>
      <Form.Item
        label="Nom"
        name="nom"
        rules={[{ required: true, message: "Le nom est obligatoire" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "L'email est obligatoire" },
          { type: "email", message: "Format d'email invalide" },
        ]}
      >
        <Input />
      </Form.Item>

      <Button type="primary" htmlType="submit">Enregistrer</Button>
    </Form>
  );
}
```

<div class="encadre astuce">
<span class="encadre-titre">💡 Un système de formulaire "maison" différent de React Hook Form</span>
Le `Form` d'Ant Design gère lui-même l'état des champs en interne (via `Form.useForm()`), sans passer par `useState` explicite comme au chapitre 11. Il est possible de combiner Ant Design avec React Hook Form (chapitre 36) pour les projets qui préfèrent une gestion de formulaire unifiée à travers toute l'application, mais le système natif d'AntD suffit largement pour la plupart des cas.
</div>

## 34.4 Composants de mise en page et de feedback

```jsx
import { Layout, Menu, message, Modal } from "antd";
const { Header, Sider, Content } = Layout;

function LayoutAdmin({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider>
        <Menu
          mode="inline"
          items={[
            { key: "dashboard", label: "Tableau de bord" },
            { key: "clients", label: "Clients" },
            { key: "parametres", label: "Paramètres" },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: "#fff" }}>Mon Application</Header>
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
```

```jsx
// Notifications et confirmations, sans composant à monter soi-même dans le JSX
function BoutonSuppression({ id, onSupprime }) {
  function confirmer() {
    Modal.confirm({
      title: "Confirmer la suppression",
      content: "Cette action est irréversible.",
      okText: "Supprimer",
      okType: "danger",
      onOk: () => {
        onSupprime(id);
        message.success("Élément supprimé avec succès");
      },
    });
  }

  return <Button danger onClick={confirmer}>Supprimer</Button>;
}
```

`Modal.confirm()` et `message.success()` s'appellent comme de simples fonctions JavaScript (pas besoin de gérer un state `afficher` comme pour la modale React-Bootstrap du chapitre 32) : Ant Design monte et démonte lui-même le composant nécessaire en coulisses.

## 34.5 Personnaliser le thème

```jsx
import { ConfigProvider } from "antd";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#146ef5",
          borderRadius: 8,
        },
      }}
    >
      <MonApplication />
    </ConfigProvider>
  );
}
```

## 34.6 Erreurs fréquentes

<div class="encadre attention">
<span class="encadre-titre">⚠️ Confondre defaultValue et value dans un composant contrôlé AntD</span>
```jsx
// ❌ Le champ ne se met jamais à jour si l'état externe change, defaultValue ne fixe qu'une valeur INITIALE
<Input defaultValue={nom} onChange={(e) => setNom(e.target.value)} />

// ✅ Composant réellement contrôlé (rappel du chapitre 11)
<Input value={nom} onChange={(e) => setNom(e.target.value)} />
```
</div>

## 34.7 Exercices

<div class="encadre exercice">
<span class="encadre-titre">📝 Exercice 34.1</span>

Construis un tableau `Table` affichant une liste de produits (`nom`, `prix`, `stock`), triable par prix, avec un `Tag` rouge si `stock === 0` et vert sinon.
</div>

**Corrigé :**
```jsx
const colonnes = [
  { title: "Nom", dataIndex: "nom", key: "nom" },
  { title: "Prix", dataIndex: "prix", key: "prix", sorter: (a, b) => a.prix - b.prix },
  {
    title: "Stock",
    dataIndex: "stock",
    key: "stock",
    render: (stock) => <Tag color={stock === 0 ? "red" : "green"}>{stock === 0 ? "Rupture" : stock}</Tag>,
  },
];

<Table dataSource={produits} columns={colonnes} rowKey="id" />
```

## 34.8 Résumé du chapitre

- Ant Design excelle sur les applications denses en données : tableaux triables/filtrables, formulaires longs, back-offices.
- `<Table>` intègre tri, filtres et pagination déclarativement, évitant beaucoup de logique manuelle.
- `Form.useForm()` gère l'état des champs en interne, avec des règles de validation déclaratives.
- `Modal.confirm()`/`message.success()` s'utilisent comme de simples fonctions, sans state à gérer explicitement.

*Chapitre suivant : comment choisir sa stack UI (CSS Modules, Tailwind, Bootstrap, MUI, Ant Design) selon le contexte réel d'un projet.*
