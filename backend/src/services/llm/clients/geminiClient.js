import { GoogleGenAI } from '@google/genai';
import { env } from '../../../config/env.js';
import { logger } from '../../../config/logger.js';

// ─── Gemini Client ────────────────────────────────────────────────────────────
// Adapter for Google Gemini API using the @google/genai Interactions SDK.
// Default model: gemini-3.6-flash.
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

    this._client = new GoogleGenAI({ apiKey: env.geminiApiKey });
    this._modelName = env.geminiModel || 'gemini-3.6-flash';

    logger.info({ model: this._modelName }, 'GeminiClient: initialized with @google/genai');
  }

  /**
   * Send a prompt to Gemini and return the parsed JSON output with token usage.
   *
   * @param {string} prompt - The full extraction prompt
   * @returns {Promise<{ rawText: string, inputTokens: number, outputTokens: number }>}
   */
  async generateJSON(prompt) {
    const startMs = Date.now();

    let interaction;
    try {
      interaction = await this._client.interactions.create({
        model: this._modelName,
        input: prompt,
      });
    } catch (err) {
      throw this._formatError(err);
    }

    const rawText = interaction.output_text || '';
    const durationMs = Date.now() - startMs;

    logger.debug(
      {
        model: this._modelName,
        durationMs,
      },
      'GeminiClient: response received'
    );

    return {
      rawText,
      inputTokens: 0,
      outputTokens: 0,
    };
  }

  _formatError(err) {
    if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('401')) {
      return new Error('Gemini API key is invalid or expired. Check GEMINI_API_KEY in .env');
    }
    if (err.message?.includes('429') || err.message?.includes('RESOURCE_EXHAUSTED')) {
      return new Error('Gemini rate limit exceeded. Reduce LLM_BATCH_SIZE or increase LLM_DELAY_MS');
    }
    if (err.message?.includes('SAFETY')) {
      return new Error(`Gemini blocked content for safety reasons: ${err.message}`);
    }
    return new Error(`Gemini API error: ${err.message}`);
  }

  /** Singleton accessor */
  static getInstance() {
    if (!_instance) _instance = new GeminiClient();
    return _instance;
  }

  /** Reset singleton (used in tests) */
  static reset() {
    _instance = null;
  }
}
