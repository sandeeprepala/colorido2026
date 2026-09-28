import { pool, db } from '../data/db.js';
import { config } from '../config/index.js';

const GEMINI_API_KEY = config.gemini.apiKey;
const GEMINI_MODEL = config.gemini.model || 'gemini-2.5-flash';
const EMBED_MODEL = 'gemini-embedding-001';

/**
 * Generate 768-dimensional embedding vector using Google Gemini
 */
export const getEmbedding = async (text) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:embedContent?key=${GEMINI_API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text: text.slice(0, 4000) }] },
        outputDimensionality: 768,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[RAG] Gemini Embedding Error:', errText);
      return null;
    }

    const data = await res.json();
    return data.embedding?.values || null;
  } catch (err) {
    console.error('[RAG] Error calling embedding API:', err.message);
    return null;
  }
};

/**
 * Initialize PGVector extension and event_embeddings table
 */
export const initRagSchema = async () => {
  try {
    await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_embeddings (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255),
        category VARCHAR(100),
        content TEXT NOT NULL,
        metadata JSONB,
        embedding vector(768),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('[RAG] PGVector schema and event_embeddings table ready.');
  } catch (err) {
    console.error('[RAG] Error initializing PGVector schema:', err.message);
  }
};

/**
 * Synchronize and index all festival events into pgvector
 */
export const syncRagIndex = async () => {
  try {
    await initRagSchema();

    // Check existing count in event_embeddings
    const countRes = await pool.query('SELECT count(*) FROM event_embeddings');
    const existingCount = parseInt(countRes.rows[0]?.count || '0', 10);

    const events = db.getAllEvents();
    if (!events || events.length === 0) {
      console.log('[RAG] No events found to index.');
      return;
    }

    // Only skip if already indexed all events plus general docs
    if (existingCount >= events.length + 3) {
      console.log(`[RAG] Vector index already up to date with ${existingCount} items.`);
      return;
    }

    console.log(`[RAG] Generating embeddings for ${events.length} events using Gemini...`);

    // 1. General Festival Overview Document
    const festOverview = {
      id: 'fest-overview-general',
      title: 'COLORIDO 2026 College Festival Overview',
      category: 'general',
      content: `
COLORIDO 2026 is the annual mega college festival organized at R.V.R & J.C College of Engineering.
Dates: October 15, 16, and 17, 2026.
Venue: R.V.R & J.C College of Engineering Campus, Guntur, Andhra Pradesh.
Festival Arenas:
1. Technical Arena: Hackathons, Web Blitz, Robo Soccer, AI Circuit, Circuit Debugging, Paper Presentation.
2. Cultural Arena: Battle of Bands, Step Up Solo & Group Dance, Fashion Walk, Drama & Monologue, Photography.
3. Sports Arena: Box Cricket, Futsal Championship, Volleyball, Basketball 3v3, Badminton, Table Tennis, Baseball, Pickle Ball.
Registration: Students register on the portal and receive a cryptographic gate entry QR pass with instant digital verification.
Prize Pool: Over ₹5,00,000+ in cash prizes across 1st, 2nd, and 3rd rank winners with verified digital certificates.
Food & Game Stalls: Student and visitor stalls available with live menus, game stalls, and treats.
      `.trim(),
      metadata: { type: 'general_info' },
    };

    // 2. Gate Verification & Pass Details Document
    const gateInfo = {
      id: 'fest-gate-verification-info',
      title: 'Festival Passes and QR Gate Verification',
      category: 'general',
      content: `
Festival Gate Entry & QR Verification:
- Upon event registration, each student receives a secure digital Festival Pass featuring a unique QR code.
- Pass URL domain: https://colorido2026-five.vercel.app/registration/verify/:token
- Volunteers and security guards scan the QR pass with any smartphone camera to instantly verify student admission, team roster, registration ID, and event venue.
- Students can access their QR pass anytime under "My Festival" -> "My Registrations" on the website.
      `.trim(),
      metadata: { type: 'gate_passes' },
    };

    const docsToIndex = [festOverview, gateInfo];

    // Build event docs
    for (const ev of events) {
      const minTeam = Math.max(1, Number(ev.min_team_size) || 1);
      const maxTeam = Math.max(minTeam, Number(ev.max_team_size) || minTeam);
      const isSolo = maxTeam === 1;

      const pFirst = ev.prize_pool_first ? `₹${Number(ev.prize_pool_first).toLocaleString()}` : 'Trophy & Certificate';
      const pSecond = ev.prize_pool_second ? `₹${Number(ev.prize_pool_second).toLocaleString()}` : 'Trophy & Certificate';
      const pThird = ev.prize_pool_third ? `₹${Number(ev.prize_pool_third).toLocaleString()}` : 'Certificate';
      const pTotal = ev.prize_pool ? `₹${Number(ev.prize_pool).toLocaleString()}` : 'Exciting Prizes';

      const roundsText = Array.isArray(ev.rounds) && ev.rounds.length > 0
        ? ev.rounds.map((r, i) => `Round ${i + 1} (${r.title || 'Phase'}): ${r.description || ''}`).join('; ')
        : 'Single round competition with final live judging.';

      const content = `
Event Name: ${ev.name}
Category: ${ev.category}
Tagline: ${ev.tagline || ''}
Date: ${ev.event_date || 'October 2026'}
Time: ${ev.start_time || '10:00 AM'}
Venue: ${ev.venue || 'R.V.R & J.C College of Engineering'}
Participation Type: ${isSolo ? 'Solo Participation (1 person)' : `Team Event (Team size: ${minTeam} to ${maxTeam} members)`}
Cash Prizes: 1st Prize: ${pFirst}, 2nd Prize: ${pSecond}, 3rd Prize: ${pThird} (Total Prize Pool: ${pTotal})
Registration Fee: ${ev.registration_fee ? `₹${ev.registration_fee}` : 'Free Entry'}
Registration Deadline: ${ev.registration_deadline || 'Open'}
Event Coordinator: ${ev.coordinator_name || 'Fest Committee'} (${ev.coordinator_phone || 'Contact Student Desk'})
Description: ${ev.description || ''}
Rules & Guidelines: ${ev.rules || 'Standard festival fair-play and identity card verification rules apply.'}
Competition Structure: ${roundsText}
      `.trim();

      docsToIndex.push({
        id: `ev-${ev.id}`,
        title: ev.name,
        category: ev.category,
        content,
        metadata: {
          event_id: ev.id,
          name: ev.name,
          category: ev.category,
          venue: ev.venue,
          event_date: ev.event_date,
          prize_pool: pTotal,
        },
      });
    }

    // Embed and insert each document sequentially
    for (const doc of docsToIndex) {
      try {
        const vec = await getEmbedding(doc.content);
        if (vec && vec.length === 768) {
          const vecString = `[${vec.join(',')}]`;
          await pool.query(`
            INSERT INTO event_embeddings (id, title, category, content, metadata, embedding, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6::vector, NOW())
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              category = EXCLUDED.category,
              content = EXCLUDED.content,
              metadata = EXCLUDED.metadata,
              embedding = EXCLUDED.embedding,
              updated_at = NOW();
          `, [doc.id, doc.title, doc.category, doc.content, JSON.stringify(doc.metadata || {}), vecString]);
        }
      } catch (embErr) {
        console.error(`[RAG] Error embedding doc ${doc.title}:`, embErr.message);
      }
    }

    console.log(`[RAG] Successfully indexed ${docsToIndex.length} documents into PGVector!`);
  } catch (err) {
    console.error('[RAG] Error during syncRagIndex:', err.message);
  }
};

/**
 * Search top matching documents in PGVector
 */
export const searchSimilarEvents = async (queryText, limit = 5) => {
  try {
    const queryVec = await getEmbedding(queryText);
    if (!queryVec || queryVec.length !== 768) {
      console.warn('[RAG] Could not generate query embedding, using keyword fallback.');
      return await keywordFallbackSearch(queryText, limit);
    }

    const vecString = `[${queryVec.join(',')}]`;
    const res = await pool.query(`
      SELECT id, title, category, content, metadata,
             1 - (embedding <=> $1::vector) AS similarity
      FROM event_embeddings
      ORDER BY embedding <=> $1::vector ASC
      LIMIT $2;
    `, [vecString, limit]);

    return res.rows;
  } catch (err) {
    console.error('[RAG] Vector search error:', err.message);
    return await keywordFallbackSearch(queryText, limit);
  }
};

/**
 * Keyword text fallback if vector search encounters issue
 */
const keywordFallbackSearch = async (queryText, limit = 5) => {
  try {
    const terms = queryText.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const events = db.getAllEvents();
    if (!events || events.length === 0) return [];

    const matches = events.filter((ev) => {
      const full = `${ev.name} ${ev.category} ${ev.venue} ${ev.description} ${ev.rules}`.toLowerCase();
      return terms.some((t) => full.includes(t));
    }).slice(0, limit);

    return matches.map((ev) => ({
      id: `ev-${ev.id}`,
      title: ev.name,
      category: ev.category,
      content: `Event: ${ev.name}, Category: ${ev.category}, Venue: ${ev.venue}, Date: ${ev.event_date}, Time: ${ev.start_time}, Prizes: 1st ₹${ev.prize_pool_first || ''}, 2nd ₹${ev.prize_pool_second || ''}. Rules: ${ev.rules || ''}`,
      metadata: { event_id: ev.id, name: ev.name },
      similarity: 0.85,
    }));
  } catch (e) {
    return [];
  }
};

/**
 * Main RAG Chat query handler using Gemini 2.5 Flash
 */
export const askFestivalBot = async (userMessage, chatHistory = []) => {
  try {
    // 1. Vector Search for relevant festival context via PGVector
    const similarDocs = await searchSimilarEvents(userMessage, 4);

    let contextText = '';
    if (similarDocs && similarDocs.length > 0) {
      contextText = similarDocs
        .map((d, i) => `[Source ${i + 1}: ${d.title} (${d.category || 'General'})]\n${d.content}`)
        .join('\n\n');
    } else {
      contextText = 'General festival events are taking place across Technical, Cultural, and Sports categories at R.V.R & J.C College of Engineering.';
    }

    // 2. System Instructions
    const systemPrompt = `
You are the official AI Assistant for COLORIDO '26, the premier annual college festival of R.V.R & J.C College of Engineering.
Your goal is to assist students, participants, and visitors with accurate, clear, and helpful information about all events, schedules, venues, rules, team sizes, prize money, passes, and stalls.

CRITICAL FORMATTING RULES:
1. Do NOT add '**' or any special characters (such as asterisks, markdown bolding, hashes, backticks, or raw formatting symbols) to the response.
2. Present all information in clean, plain text. For lists, use simple numbers (1., 2.) or simple dashes (-), never asterisks (* or **).
3. Keep the response to the point, professional, and detailed as required. Avoid fluff, unnecessary disclaimers, or excessive greetings.

Content Guidelines:
- College Name: R.V.R & J.C College of Engineering (Guntur, AP).
- Categories: Technical, Cultural, Sports.
- Rely strictly on the provided festival context to give exact details (dates, venues, start times, prize money for 1st, 2nd, and 3rd place, team size limits).
- If asked how to register: State the steps directly (Go to Events page, select event, click Register Now, fill participant/team details, and receive gate QR pass).
- If asked about passes or gate entry: State that digital QR passes can be accessed under My Festival and verified at https://colorido2026-five.vercel.app/registration/verify/:token.

Context from COLORIDO '26 Database:
${contextText}
    `.trim();

    // 3. Format conversation history for Gemini API
    const contents = [];

    // Include last 4 history turns for context
    const recentHistory = chatHistory.slice(-4);
    for (const h of recentHistory) {
      if (h.role === 'user' || h.role === 'model' || h.role === 'assistant') {
        contents.push({
          role: h.role === 'assistant' ? 'model' : h.role,
          parts: [{ text: (h.content || h.text || '').replace(/\*\*/g, '') }],
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // 4. Call Gemini 2.5 Flash
    const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const genRes = await fetch(genUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 800,
        },
      }),
    });

    if (!genRes.ok) {
      const errBody = await genRes.text();
      console.error('[RAG] Gemini Generation API Error:', errBody);
      return {
        reply: `Hello from COLORIDO '26. Here is the information regarding your query:\n\n${(similarDocs[0]?.content || 'Please check our Events section or ask at the registration help desk.').replace(/\*\*/g, '')}`,
        sources: similarDocs.map((s) => ({ title: s.title, category: s.category })),
      };
    }

    const genData = await genRes.json();
    let reply = genData.candidates?.[0]?.content?.parts?.[0]?.text || "I am ready to answer any questions about COLORIDO '26 events, venues, and schedules.";

    // Ensure no '**' or markdown asterisks/hashes remain in the output
    reply = reply
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .trim();

    return {
      reply,
      sources: (similarDocs || []).map((s) => ({
        title: s.title,
        category: s.category,
      })),
    };
  } catch (err) {
    console.error('[RAG] askFestivalBot error:', err);
    return {
      reply: "Welcome to COLORIDO '26! Explore all our exciting Technical, Cultural, and Sports events right on the homepage or ask about any specific event!",
      sources: [],
    };
  }
};
