import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Fallback: load environment variables from .env.example if key is not defined yet
if (!process.env.GEMINI_API_KEY) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.example') });
}

const isProd = process.env.NODE_ENV === 'production';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Server-side lazy loaded Gemini client
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      let apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined');
      }

      // Trim surrounding quotes if present
      if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
        apiKey = apiKey.slice(1, -1);
      } else if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
        apiKey = apiKey.slice(1, -1);
      }

      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Secure API endpoint for private Gemini Mindful AI
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      if (!prompt) {
        res.status(400).json({ error: 'Missing prompt' });
        return;
      }

      const ai = getGeminiClient();
      let response;
      try {
        console.log('Attempting content generation with primary model: gemini-3.5-flash');
        response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });
      } catch (primaryError: any) {
        console.warn('Primary model gemini-3.5-flash failed or experienced high demand. Trying fallback model: gemini-3.1-flash-lite...', primaryError);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: systemInstruction ? { systemInstruction } : undefined,
        });
      }

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Gemini API call and fallback failed:', error);
      res.status(500).json({
        error: error.message || 'An error occurred while communicating with the Mindful AI service.',
      });
    }
  });

  // Health check route
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', datetime: '2026-06-10T06:57:44Z' });
  });

  // Serve static assets or mount Vite dev middleware
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted for development.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build from dist folder.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
