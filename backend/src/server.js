import app from './app.js';
import { config } from './config/index.js';
import { syncRagIndex } from './services/ragService.js';

app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🎉 COLORIDO '26 Monolithic Backend Running`);
  console.log(`🚀 Server listening on http://localhost:${config.port}`);
  console.log(`📡 Realtime SSE channel at http://localhost:${config.port}/api/realtime/events`);
  console.log(`===============================================`);

  // Ensure PGVector RAG index is synced
  syncRagIndex().catch((err) => console.error('[Startup RAG Sync Error]:', err.message));
});
