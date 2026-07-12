import api from './client';

export type TypeCreneau = 'PROGRAMME' | 'MATCH_DIRECT' | 'PUB';
export type PositionOverlay = 'HAUT_GAUCHE' | 'HAUT_DROITE' | 'BAS_GAUCHE' | 'BAS_DROITE';

export interface Incrustation {
  id: string;
  logoUrl: string;
  position: PositionOverlay;
  opacite: number;
  actif: boolean;
  sponsor?: { nomSponsor: string };
}

export interface BandeauItem {
  texte: string;
  logoUrl?: string;
  sponsorId?: string;
}

export interface Bandeau {
  id: string;
  items: BandeauItem[];
  vitesseDefilement: number;
  actif: boolean;
}

export interface CreneauEpg {
  id: string;
  dateHeureDebut: string;
  dateHeureFin: string;
  typeCreneau: TypeCreneau;
  contenu?: { titre: string; sponsor?: { nomSponsor: string } | null } | null;
  match?: { nomEvenement: string; equipes: string; sponsorPrincipal?: { nomSponsor: string } | null } | null;
  incrustations: Incrustation[];
  bandeaux: Bandeau[];
}

export interface EpgResponse {
  enCours: CreneauEpg | null;
  aSuivre: CreneauEpg[];
  cdnBaseUrl: string | null;
}

export async function getEpg(): Promise<EpgResponse> {
  const { data } = await api.get('/epg');
  return data.data;
}
