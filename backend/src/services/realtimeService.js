const clients = new Set();

/**
 * Register a new SSE client
 */
export const registerRealtimeClient = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const clientId = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6);
  const newClient = { id: clientId, res };
  clients.add(newClient);

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', clientId })}\n\n`);

  req.on('close', () => {
    clients.delete(newClient);
  });
};

/**
 * Broadcast an event to all connected clients
 */
export const broadcastRealtime = (type, payload) => {
  const message = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
  for (const client of clients) {
    try {
      client.res.write(`data: ${message}\n\n`);
    } catch (e) {
      clients.delete(client);
    }
  }
};
