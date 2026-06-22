export type Role = 'ADMIN' | 'MEDECIN' | 'INFIRMIER' | 'CAISSIER' | 'ACCUEIL'
export type Sexe = 'M' | 'F'
export type AppointmentStatut = 'PLANIFIE' | 'EN_ATTENTE' | 'EN_CONSULTATION' | 'TERMINE' | 'ANNULE'
export type FactureStatut = 'EN_ATTENTE' | 'PARTIELLEMENT_PAYE' | 'PAYE' | 'ANNULE'
export type MethodePaiement = 'CASH' | 'CARTE' | 'ASSURANCE' | 'MONCASH'
export type ExamenStatut = 'EN_ATTENTE' | 'EN_COURS' | 'RESULTAT_DISPONIBLE' | 'ANNULE'
export type StatutAttente = 'EN_ATTENTE' | 'EN_CONSULTATION' | 'TERMINE' | 'ABSENT'

export interface User {
  id: string
  prenom: string
  nom: string
  email: string
  role: Role
  serviceId?: string
}

export interface Patient {
  id: string
  numero: string
  prenom: string
  nom: string
  dateNaissance: string
  sexe: Sexe
  telephone: string
  adresse?: string
  groupeSanguin?: string
  antecedents?: string
  allergies?: string
  actif: boolean
  createdAt: string
}

export interface Service {
  id: string
  nom: string
  description?: string
  actif: boolean
}

export interface Appointment {
  id: string
  patientId: string
  medecinId: string
  serviceId: string
  dateHeure: string
  statut: AppointmentStatut
  motif?: string
  notes?: string
  patient: Pick<Patient, 'id' | 'prenom' | 'nom' | 'numero' | 'telephone'>
  medecin: Pick<User, 'id' | 'prenom' | 'nom' | 'role'>
  service: Service
}

export interface Consultation {
  id: string
  patientId: string
  medecinId: string
  appointmentId?: string
  date: string
  plainte?: string
  diagnostic?: string
  notes?: string
  prescriptions?: string
  prochainRdv?: string
  signesVitaux?: { tension?: string; temperature?: number; poids?: number }
  patient: Pick<Patient, 'id' | 'prenom' | 'nom' | 'numero'>
  medecin: Pick<User, 'id' | 'prenom' | 'nom'>
  examens?: Examen[]
}

export interface FileAttenteEntry {
  id: string
  numero: number
  patientId: string
  appointmentId?: string
  medecinId?: string
  motif?: string
  priorite: string
  statut: StatutAttente
  dateFile: string
  appelleA?: string
  termineA?: string
  createdAt: string
  patient: Pick<Patient, 'id' | 'prenom' | 'nom' | 'numero' | 'telephone'>
  medecin?: Pick<User, 'id' | 'prenom' | 'nom' | 'role'>
  appointment?: { id: string; dateHeure: string; motif?: string; statut: string }
}

export interface FileAttenteStats {
  enAttente: number
  enConsultation: number
  termine: number
  absent: number
  total: number
}

export interface Examen {
  id: string
  numero: string
  patientId: string
  consultationId?: string
  medecinId: string
  type: string
  description?: string
  statut: ExamenStatut
  resultat?: string
  resultatStructure?: Record<string, string>
  dateResultat?: string
  createdAt: string
  updatedAt: string
  patient: Pick<Patient, 'id' | 'prenom' | 'nom' | 'numero'>
  medecin: Pick<User, 'id' | 'prenom' | 'nom'>
  consultation?: { id: string; date: string; diagnostic?: string }
}

export interface LigneFacture {
  id: string
  description: string
  quantite: number
  prixUnitaire: number
  montant: number
}

export interface Paiement {
  id: string
  montant: number
  methode: MethodePaiement
  date: string
}

export interface Facture {
  id: string
  numero: string
  patientId: string
  montantTotal: number
  montantPaye: number
  statut: FactureStatut
  createdAt: string
  patient: Pick<Patient, 'id' | 'prenom' | 'nom' | 'numero'>
  lignes: LigneFacture[]
  paiements: Paiement[]
}

export interface TarifMedical {
  id: string
  code: string
  libelle: string
  categorie?: string | null
  prixDefaut: number
  actif: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
