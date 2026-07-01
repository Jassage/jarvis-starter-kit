import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LAKAY API',
      version: '1.0.0',
      description: 'API REST — Plateforme immobilière haïtienne LAKAY',
      contact: {
        name: 'Support LAKAY',
        email: 'support@lakay.ht',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.lakay.ht/api',
        description: 'Serveur de production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            pages: { type: 'integer' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion de session' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Listings', description: 'Annonces immobilières' },
      { name: 'Search', description: 'Recherche et filtres avancés' },
      { name: 'Messages', description: 'Messagerie temps réel' },
      { name: 'Agencies', description: 'Gestion des agences' },
      { name: 'Favorites', description: 'Annonces favorites' },
      { name: 'Reviews', description: 'Avis et notations' },
      { name: 'Visits', description: 'Demandes de visite' },
      { name: 'Notifications', description: 'Notifications' },
      { name: 'Payments', description: 'Paiements et abonnements' },
      { name: 'Admin', description: 'Administration' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts', './src/modules/**/*.controller.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
