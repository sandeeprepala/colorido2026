import express from 'express';
import cors from 'cors';
import { db } from './data/db.js';
import routes from './routes/index.js';

const app = express();

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    festival: 'COLORIDO \'26',
    time: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    festival: 'COLORIDO \'26',
    time: new Date().toISOString(),
  });
});

// Middleware to ensure DB sync before handling API requests
app.use(async (req, res, next) => {
  try {
    if (db.ensureSynced) {
      await db.ensureSynced();
    }
  } catch (e) {
    // continue even if sync fails
  }
  next();
});

// Mount routes on /api AND / to seamlessly handle direct hits & Vercel rewrites
app.use('/api', routes);
app.use('/', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
