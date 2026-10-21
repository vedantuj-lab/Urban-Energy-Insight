import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { apiRouter } from './src/server/routes';
import { initDatabase } from './src/server/db';

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Initialize DB engine (PostgreSQL or persistent store)
  const dbStatus = await initDatabase();
  console.log(`[UrbanEnergy Insight] DB Engine initialized: ${dbStatus.mode} (${dbStatus.details})`);

  // Mount API endpoints
  app.use('/api', apiRouter);

  if (!isProd) {
    // Dynamic import to keep dev server clean
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('[UrbanEnergy Insight] Dev server mounted with Vite middleware');
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UrbanEnergy Insight] Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[UrbanEnergy Insight] Fatal server error:', err);
  process.exit(1);
});
