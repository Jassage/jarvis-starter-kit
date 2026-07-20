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
  id: string | null;
  dateHeureDebut: string | null;
  dateHeureFin: string | null;
  typeCreneau: TypeCreneau;
  estRepli?: boolean;
  contenu?: { titre: string; sponsor?: { nomSponsor: string } | null } | null;
  match?: { nomEvenement: string; equipes: string; sponsorPrincipal?: { nomSponsor: string } | null } | null;
  incrustations: Incrustation[];
  bandeaux: Bandeau[];
}

export interface ConfigChaine {
  nomChaine: string;
  logoUrl: string;
  logoPosition: PositionOverlay;
  logoOpacite: number;
}

export interface EpgResponse {
  enCours: CreneauEpg | null;
  aSuivre: CreneauEpg[];
  cdnBaseUrl: string | null;
  configChaine: ConfigChaine | null;
}

export interface JourGuide {
  date: string;
  creneaux: CreneauEpg[];
}

export interface GuideResponse {
  jours: JourGuide[];
  configChaine: ConfigChaine | null;
}

export async function getEpg(): Promise<EpgResponse> {
  const { data } = await api.get('/epg');
  return data.data;
}

export async function getGuide(jours = 5): Promise<GuideResponse> {
  const { data } = await api.get('/epg/guide', { params: { jours } });
  return data.data;
}
