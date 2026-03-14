import http from 'http';

import app from './app.js';
import env from './config/env.js';
import connectDatabase from './config/db.js';
import createSocketServer from './sockets/index.js';

async function bootstrap() {
  await connectDatabase(env.mongoUri);

  const server = http.createServer(app);
  createSocketServer(server);

  server.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
});
