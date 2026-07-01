export const HAITI_COMMUNES: Record<string, { label: string; communes: string[] }> = {
  OUEST: {
    label: 'Ouest',
    communes: [
      'Port-au-Prince', 'Pétion-Ville', 'Delmas', 'Carrefour', 'Tabarre',
      'Cité Soleil', 'Kenscoff', 'Croix-des-Bouquets', 'Thomazeau', 'Ganthier',
      'Gressier', 'Léogâne', 'Grand-Goâve', 'Petit-Goâve', 'Arcahaie',
      'Cabaret', 'Fonds-Verrettes', 'Cornillon/Grand-Bois',
    ],
  },
  NORD: {
    label: 'Nord',
    communes: [
      'Cap-Haïtien', 'Limbé', 'Plaisance', 'Pilate', 'Borgne', 'Bahon',
      'Dondon', 'La Victoire', 'Ranquitte', 'Saint-Raphaël', 'Acul-du-Nord',
      'Bas-Limbé', 'Grande-Rivière-du-Nord', 'Limonade', 'Milot',
      'Plaine-du-Nord', 'Quartier-Morin', 'Robillard', 'Sainte-Suzanne',
    ],
  },
  NORD_EST: {
    label: 'Nord-Est',
    communes: [
      'Fort-Liberté', 'Ouanaminthe', 'Trou-du-Nord', 'Capotille', 'Caracol',
      'Ferrier', 'Mombin-Crochu', 'Mont-Organisé', 'Terrier-Rouge', 'Vallières',
    ],
  },
  NORD_OUEST: {
    label: 'Nord-Ouest',
    communes: [
      'Port-de-Paix', 'Môle-Saint-Nicolas', 'Bombardopolis', 'Baie-de-Henne',
      'Chansolme', 'Jean-Rabel', 'La Tortue', 'Saint-Louis-du-Nord',
      'Anse-à-Foleur',
    ],
  },
  ARTIBONITE: {
    label: 'Artibonite',
    communes: [
      'Gonaïves', 'Saint-Marc', 'Dessalines', 'Gros-Morne', "L'Estère",
      'La Chapelle', 'Marmelade', 'Verrettes', 'Desdunes', 'Ennery',
      'Grande-Saline', 'Liancourt', 'Marchand-Dessalines',
      "Petite-Rivière-de-l'Artibonite", 'Saint-Michel-de-l\'Attalaye',
      'Terre-Neuve',
    ],
  },
  CENTRE: {
    label: 'Centre',
    communes: [
      'Hinche', 'Mirebalais', 'Thomonde', 'Savanette', 'Boucan-Carré',
      'Cerca-Carvajal', 'Cerca-La-Source', 'Lascahobas', 'Maïssade',
      'Pignon', 'Saut-d\'Eau', 'Thomassique',
    ],
  },
  SUD: {
    label: 'Sud',
    communes: [
      'Les Cayes', 'Port-Salut', 'Chardonnières', 'Les Anglais', 'Tiburon',
      'Camp-Perrin', 'Maniche', 'Arniquet', 'Saint-Jean-du-Sud', 'Aquin',
      'Cavaillon', 'Côteaux', 'Ile-à-Vache', 'Roche-à-Bateau',
      'Saint-Louis-du-Sud', 'Torbeck',
    ],
  },
  SUD_EST: {
    label: 'Sud-Est',
    communes: [
      'Jacmel', 'Bainet', 'Belle-Anse', 'Cayes-Jacmel', 'Grand-Gosier',
      'La Vallée', 'Marigot', 'Thiotte', 'Côtes-de-Fer',
    ],
  },
  NIPPES: {
    label: 'Nippes',
    communes: [
      'Miragoâne', 'Arnaud', 'Anse-à-Veau', 'Baradères', 'Fond-des-Nègres',
      'Grand-Boucan', 'Paillant', 'Petite-Rivière-de-Nippes',
      'Plaisance-du-Sud', 'Saint-Michel-de-Nippes',
    ],
  },
  GRANDE_ANSE: {
    label: 'Grande-Anse',
    communes: [
      'Jérémie', 'Abricots', 'Anse-d\'Hainault', 'Beaumont', 'Bonbon',
      'Dame-Marie', 'Corail', 'Chambellan', 'Les Irois', 'Moron',
      'Pestel', 'Roseaux',
    ],
  },
};

export const DEPARTMENT_OPTIONS = Object.entries(HAITI_COMMUNES).map(([value, { label }]) => ({
  value,
  label,
}));
