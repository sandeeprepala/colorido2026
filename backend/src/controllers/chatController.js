import { askFestivalBot, syncRagIndex } from '../services/ragService.js';

export const handleChatMessage = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'Message is required and must not be empty.',
      });
    }

    const trimmedMsg = message.trim();
    const result = await askFestivalBot(trimmedMsg, Array.isArray(history) ? history : []);

    return res.json({
      success: true,
      reply: result.reply,
      sources: result.sources,
    });
  } catch (err) {
    console.error('[ChatController] Error processing chat query:', err);
    return res.status(500).json({
      error: 'An error occurred while generating festival response.',
    });
  }
};

export const reindexRag = async (req, res) => {
  try {
    await syncRagIndex();
    return res.json({ success: true, message: 'PGVector index synchronized.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to reindex PGVector.' });
  }
};
