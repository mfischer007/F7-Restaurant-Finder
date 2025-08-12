import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'F7LTD Restaurant Aggregator API',
    version: '1.1.0',
    description: 'ZIP-based restaurant discovery with menu, hours, website, phone.'
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: 'apiKey', in: 'header', name: 'x-api-key' }
    }
  },
  security: [{ ApiKeyAuth: [] }],
  paths: {
    '/health': { get: { security: [], summary: 'Health check', responses: { '200': { description: 'OK' } } } },
    '/search': {
      get: {
        summary: 'Search restaurants by ZIP',
        parameters: [
          { name: 'zip', in: 'query', required: true, schema: { type: 'string' } },
          { name: 'radius_miles', in: 'query', required: false, schema: { type: 'number', default: 15 } }
        ],
        responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } }
      }
    },
    '/restaurants/{id}': {
      get: { summary: 'Get restaurant details', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } } }
    },
    '/refresh/{id}': {
      post: { summary: 'Force refresh (private key required)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'OK' }, '401': { description: 'Unauthorized' } } }
    }
  }
} as const;

export const docsRouter = Router()
  .get('/json', (_req, res) => res.json(openapi))
  .use('/', swaggerUi.serve, swaggerUi.setup(openapi));
