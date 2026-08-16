import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../../config/env.js';
import { logger } from '../../../config/logger.js';

// ─── Gemini Client ────────────────────────────────────────────────────────────
// Adapter for Google Gemini API.
// Free tier: gemini-2.0-flash — 15 RPM, 1M tokens/day, no card required.
//
// JSON mode: We use responseMimeType='application/json' which forces Gemini
// to return valid JSON. This eliminates markdown-wrapped JSON issues.
//
// Temperature: 0.1 — low temperature for factual extraction tasks.
// We want deterministic, factual output, not creative generation.
// ─────────────────────────────────────────────────────────────────────────────

let _instance = null;

export class GeminiClient {
  constructor() {
    if (!env.geminiApiKey) {
      throw new Error(
        'Gemini API key not found. Set GEMINI_API_KEY in .env\n' +
        '(or set OPENAI_API_KEY as a fallback for backward compatibility)'
      );
    }

    const genAI = new GoogleGenerativeAI(env.geminiApiKey);

    this._model = genAI.getGenerativeModel({
      model: env.geminiModel,
      generationConfig: {
        // Force JSON output — prevents markdown wrapping
        responseMimeType: 'application/json',
        // Low temperature: we want facts, not creativity
        temperature: 0.1,
        // Cap tokens to control cost (our schema fits in ~512 output tokens)
        maxOutputTokens: 1024,
        // No top_k/top_p tweaking needed — temperature 0.1 is already sufficient
      },
    });

    logger.info({ model: env.geminiModel }, 'GeminiClient: initialized');
  }

  /**
   * Send a prompt to Gemini and return the parsed response with token usage.
   *
   * @param {string} prompt - The full extraction prompt
   * @returns {Promise<{ rawText: string, inputTokens: number, outputTokens: number }>}
   */
  async generateJSON(prompt) {
    const startMs = Date.now();

    let result;
    try {
      result = await this._model.generateContent(prompt);
    } catch (err) {
      // Surface meaningful error messages
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('401')) {
        throw new Error('Gemini API key is invalid or expired. Check GEMINI_API_KEY in .env');
      }
      if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Gemini rate limit exceeded. Reduce LLM_BATCH_SIZE or increase LLM_DELAY_MS');
      }
      if (err.message?.includes('SAFETY')) {
        throw new Error(`Gemini blocked content for safety reasons: ${err.message}`);
      }
      throw new Error(`Gemini API error: ${err.message}`);
    }

    const rawText = result.response.text();
    const usage = result.response.usageMetadata;

    const durationMs = Date.now() - startMs;

    logger.debug(
      {
        model: env.geminiModel,
        inputTokens: usage?.promptTokenCount,
        outputTokens: usage?.candidatesTokenCount,
        durationMs,
      },
      'GeminiClient: response received'
    );

    return {
      rawText,
      inputTokens: usage?.promptTokenCount || 0,
      outputTokens: usage?.candidatesTokenCount || 0,
    };
  }

  /** Singleton accessor — reuse the same model instance across calls */
  static getInstance() {
    if (!_instance) _instance = new GeminiClient();
    return _instance;
  }

  /** Reset singleton (used in tests) */
  static reset() {
    _instance = null;
  }
}
