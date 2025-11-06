import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';

import { config } from './config.js';
import { logger } from './logger.js';
import { registerRoutes } from './routes.js';

const app = Fastify({
  logger,
  trustProxy: true,
});

await app.register(cors, {
  origin: (origin, cb) => {
    if (!origin) {
      cb(null, true);
      return;
    }

    cb(null, true);
  },
  credentials: true,
});

await app.register(rateLimit, {
  max: 120,
  timeWindow: '1 minute',
  hook: 'onSend',
  allowList: (req) => req.headers['x-internal-call'] === 'true',
});

await registerRoutes(app);

app.setErrorHandler((error, request, reply) => {
  request.log.error({ error, route: request.routerPath ?? request.routeOptions.url }, 'request_error');
  reply.status(error.statusCode ?? 500).send({ error: 'internal_error', message: error.message });
});

const closeGracefully = async (signal: NodeJS.Signals) => {
  app.log.info({ signal }, 'shutting down');
  try {
    await app.close();
    process.exit(0);
  } catch (error) {
    app.log.error({ error }, 'error during shutdown');
    process.exit(1);
  }
};

process.on('SIGINT', closeGracefully);
process.on('SIGTERM', closeGracefully);

try {
  await app.listen({ port: config.port, host: config.host });
  app.log.info(`Server listening on ${config.host}:${config.port}`);
} catch (error) {
  app.log.error({ error }, 'failed to start server');
  process.exit(1);
}
