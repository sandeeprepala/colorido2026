import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
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

// API Routes
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🎉 COLORIDO '26 Monolithic Backend Running`);
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
  console.log(`📡 Realtime SSE channel at http://localhost:${config.port}/api/realtime/events`);
  console.log(`===============================================`);
});
