import { OpenAPIRegistry, OpenApiGeneratorV3, extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { env } from '../config/env';

// La documentation OpenAPI est DÉRIVÉE des schémas Zod déjà écrits dans les modules —
// aucune définition dupliquée. On enregistre le corps de requête (la clé `body` de
// chaque schéma de validation) comme composant réutilisable, puis on décrit les
// chemins des flux principaux. Les modules non encore documentés restent accessibles
// via l'API mais n'apparaissent pas ici : l'objectif est une doc utile, pas
// exhaustive au prix d'un couplage lourd (aucun `.openapi()` ajouté aux schémas).

extendZodWithOpenApi(z);

import { loginSchema } from '../modules/auth/auth.schemas';
import { createEtablissementSchema, updateEtablissementSchema } from '../modules/etablissements/etablissements.schemas';
import { createTypeChambreSchema, basculerMaintenanceSchema } from '../modules/chambres/chambres.schemas';
import { creerReservationSchema } from '../modules/reservations/reservations.schemas';
import { enregistrerPaiementSchema } from '../modules/factures/factures.schemas';
import { creerEmployeSchema } from '../modules/employes/employes.schemas';

const registry = new OpenAPIRegistry();

const bearer = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

// Enveloppe de réponse standard du portefeuille (cf. utils/response.ts).
const reponseSucces = registry.register(
  'ReponseSucces',
  z.object({ success: z.boolean(), message: z.string(), data: z.unknown().optional() })
);

// Chaque schéma de validation est un z.object({ body, query?, params? }) : on extrait
// la forme `body` pour n'exposer que le corps attendu.
function corps(schema: z.ZodObject<{ body: z.ZodTypeAny }>) {
  return schema.shape.body;
}

const LoginBody = registry.register('LoginBody', corps(loginSchema));
const CreerEtablissementBody = registry.register('CreerEtablissementBody', corps(createEtablissementSchema));
const MajEtablissementBody = registry.register('MajEtablissementBody', corps(updateEtablissementSchema));
const CreerTypeChambreBody = registry.register('CreerTypeChambreBody', corps(createTypeChambreSchema));
const MaintenanceBody = registry.register('MaintenanceBody', corps(basculerMaintenanceSchema));
const CreerReservationBody = registry.register('CreerReservationBody', corps(creerReservationSchema));
const PaiementBody = registry.register('PaiementBody', corps(enregistrerPaiementSchema));
const CreerEmployeBody = registry.register('CreerEmployeBody', corps(creerEmployeSchema));

const jsonBody = (schema: z.ZodTypeAny) => ({ content: { 'application/json': { schema } } });
const ok = { 200: { description: 'Succès', ...jsonBody(reponseSucces) } };
const cree = { 201: { description: 'Créé', ...jsonBody(reponseSucces) } };
const secu = [{ [bearer.name]: [] }];

// ── Authentification ──
registry.registerPath({
  method: 'post', path: '/api/auth/login', tags: ['Authentification'],
  summary: 'Connexion (retourne un access token, pose le refresh cookie httpOnly)',
  request: { body: jsonBody(LoginBody) }, responses: ok,
});
registry.registerPath({ method: 'post', path: '/api/auth/refresh', tags: ['Authentification'], summary: 'Renouvelle les tokens depuis le refresh cookie', responses: ok });
registry.registerPath({ method: 'post', path: '/api/auth/logout', tags: ['Authentification'], summary: 'Déconnexion (révoque le refresh token)', responses: ok });
registry.registerPath({ method: 'get', path: '/api/auth/me', tags: ['Authentification'], summary: 'Profil de l\'employé connecté', security: secu, responses: ok });

// ── Établissements ──
registry.registerPath({ method: 'get', path: '/api/etablissements', tags: ['Établissements'], summary: 'Liste publique des établissements (fiche vitrine)', responses: ok });
registry.registerPath({ method: 'get', path: '/api/etablissements/{id}', tags: ['Établissements'], summary: 'Fiche d\'un établissement', request: { params: z.object({ id: z.string() }) }, responses: ok });
registry.registerPath({ method: 'post', path: '/api/etablissements', tags: ['Établissements'], summary: 'Crée un établissement (admin chaîne)', security: secu, request: { body: jsonBody(CreerEtablissementBody) }, responses: cree });
registry.registerPath({ method: 'patch', path: '/api/etablissements/{id}', tags: ['Établissements'], summary: 'Met à jour la fiche (directeur ou admin chaîne)', security: secu, request: { params: z.object({ id: z.string() }), body: jsonBody(MajEtablissementBody) }, responses: ok });
registry.registerPath({ method: 'post', path: '/api/etablissements/{id}/logo', tags: ['Établissements'], summary: 'Upload du logo (multipart, champ "logo")', security: secu, request: { params: z.object({ id: z.string() }) }, responses: ok });

// ── Chambres ──
registry.registerPath({ method: 'get', path: '/api/chambres/types', tags: ['Chambres'], summary: 'Types de chambres (avec tarifs et photos)', security: secu, responses: ok });
registry.registerPath({ method: 'post', path: '/api/chambres/types', tags: ['Chambres'], summary: 'Crée un type de chambre', security: secu, request: { body: jsonBody(CreerTypeChambreBody) }, responses: cree });
registry.registerPath({ method: 'post', path: '/api/chambres/types/{typeChambreId}/photos', tags: ['Chambres'], summary: 'Ajoute des photos (multipart, champ "photos")', security: secu, request: { params: z.object({ typeChambreId: z.string() }) }, responses: cree });
registry.registerPath({ method: 'delete', path: '/api/chambres/photos/{id}', tags: ['Chambres'], summary: 'Supprime une photo (et son fichier disque)', security: secu, request: { params: z.object({ id: z.string() }) }, responses: ok });
registry.registerPath({ method: 'patch', path: '/api/chambres/{id}/maintenance', tags: ['Chambres'], summary: 'Bascule maintenance (rôle MAINTENANCE ou direction)', security: secu, request: { params: z.object({ id: z.string() }), body: jsonBody(MaintenanceBody) }, responses: ok });

// ── Disponibilité & Réservations ──
registry.registerPath({ method: 'get', path: '/api/disponibilite', tags: ['Réservations'], summary: 'Recherche de disponibilité (site public)', responses: ok });
registry.registerPath({ method: 'post', path: '/api/reservations', tags: ['Réservations'], summary: 'Crée une réservation (site public ou back-office)', request: { body: jsonBody(CreerReservationBody) }, responses: cree });
registry.registerPath({ method: 'get', path: '/api/reservations', tags: ['Réservations'], summary: 'Liste des réservations', security: secu, responses: ok });
registry.registerPath({ method: 'post', path: '/api/reservations/{id}/annuler', tags: ['Réservations'], summary: 'Annule une réservation', security: secu, request: { params: z.object({ id: z.string() }) }, responses: ok });

// ── Facturation ──
registry.registerPath({ method: 'get', path: '/api/factures/{reservationId}', tags: ['Facturation'], summary: 'Facture d\'une réservation', security: secu, request: { params: z.object({ reservationId: z.string() }) }, responses: ok });
registry.registerPath({ method: 'get', path: '/api/factures/{reservationId}/pdf', tags: ['Facturation'], summary: 'Facture au format PDF (back-office)', security: secu, request: { params: z.object({ reservationId: z.string() }) }, responses: { 200: { description: 'application/pdf' } } });
registry.registerPath({ method: 'post', path: '/api/factures/{factureId}/paiements', tags: ['Facturation'], summary: 'Enregistre un paiement (réception, direction ou comptable)', security: secu, request: { params: z.object({ factureId: z.string() }), body: jsonBody(PaiementBody) }, responses: cree });

// ── Consultation publique (parcours client sans compte) ──
registry.registerPath({ method: 'get', path: '/api/reservations/public/{reference}', tags: ['Réservations'], summary: 'Consulter sa réservation (référence + email)', request: { params: z.object({ reference: z.string() }), query: z.object({ email: z.string().email() }) }, responses: ok });
registry.registerPath({ method: 'get', path: '/api/reservations/public/{reference}/facture.pdf', tags: ['Facturation'], summary: 'Télécharger sa facture PDF (référence + email)', request: { params: z.object({ reference: z.string() }), query: z.object({ email: z.string().email() }) }, responses: { 200: { description: 'application/pdf' } } });

// ── Employés & Audit ──
registry.registerPath({ method: 'get', path: '/api/employes', tags: ['Employés'], summary: 'Liste des employés', security: secu, responses: ok });
registry.registerPath({ method: 'post', path: '/api/employes', tags: ['Employés'], summary: 'Crée un employé (anti-escalade appliquée)', security: secu, request: { body: jsonBody(CreerEmployeBody) }, responses: cree });
registry.registerPath({ method: 'get', path: '/api/audit', tags: ['Audit'], summary: 'Journal d\'audit (admin chaîne ou propriétaire)', security: secu, responses: ok });

// Modules opérationnels supplémentaires, listés comme tags sans détail de corps :
// réception, ménage, restaurant, room service, spa, minibar, blanchisserie,
// conciergerie, voiturier, rapports. Leurs schémas Zod sont la source de vérité ;
// ils pourront être ajoutés ici de la même façon quand le besoin s'en fait sentir.
const AUTRES_TAGS = ['Réception', 'Ménage', 'Restaurant', 'Spa', 'Rapports', 'Maintenance', 'Inventaire', 'Avis'];

export function genererDocumentOpenApi() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  const document = generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'OTELA — API PMS hôtelier multi-établissements',
      version: '1.0.0',
      description: 'API REST d\'OTELA (Haitech Solutions). Réponses au format { success, message, data }. Authentification par Bearer JWT (access token 15 min) + refresh cookie httpOnly.',
    },
    servers: [{ url: env.PUBLIC_BACKEND_URL }],
  });

  // Complète la liste des tags pour que Swagger UI affiche aussi les sections encore
  // sans chemin documenté.
  document.tags = [
    ...(document.tags ?? []),
    ...AUTRES_TAGS.filter((t) => !(document.tags ?? []).some((d) => d.name === t)).map((name) => ({ name })),
  ];

  return document;
}
