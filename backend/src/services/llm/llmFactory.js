import { env } from '../../config/env.js';
import { GeminiClient } from './clients/geminiClient.js';
import { OpenAIClient } from './clients/openaiClient.js';

// ─── LLM Factory ─────────────────────────────────────────────────────────────
// Returns the correct LLM client based on LLM_PROVIDER env var.
// Switching providers: change LLM_PROVIDER in .env — no code changes needed.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the configured LLM client singleton.
 * @returns {GeminiClient | OpenAIClient}
 */
export function getLLMClient() {
  switch (env.llmProvider) {
    case 'gemini':
      return GeminiClient.getInstance();
    case 'openai':
      return OpenAIClient.getInstance();
    default:
      throw new Error(
        `Unknown LLM provider: "${env.llmProvider}". Must be "gemini" or "openai".`
      );
  }
}
