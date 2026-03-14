import express from 'express';
import cors from 'cors';

import apiRoutes from './routes/index.js';
import { corsOptions } from './config/cors.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();

app.use(cors(corsOptions));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
