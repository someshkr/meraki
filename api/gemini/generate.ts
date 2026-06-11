import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // Set CORS headers for security and integration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    let apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY environment variable is not defined' });
      return;
    }

    // Trim surrounding quotes if present in environment
    if (apiKey.startsWith('"') && apiKey.endsWith('"')) {
      apiKey = apiKey.slice(1, -1);
    } else if (apiKey.startsWith("'") && apiKey.endsWith("'")) {
      apiKey = apiKey.slice(1, -1);
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-vercel',
        },
      },
    });

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

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini API call on Vercel failed:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while communicating with the Mindful AI service.',
    });
  }
}
