// ─── OpenAI Client ────────────────────────────────────────────────────────────
// Production LLM client using OpenAI's structured output (JSON mode).
// Requires: npm install openai
//
// To activate:
//   1. Set LLM_PROVIDER=openai in .env
//   2. Set OPENAI_API_KEY=sk-... in .env
//   3. Run: npm install openai
//   4. Uncomment the implementation below
//
// NOTE: This stub lets the app start without the openai package installed.
//       The Gemini client (LLM_PROVIDER=gemini) handles all demo use cases.
// ─────────────────────────────────────────────────────────────────────────────

export class OpenAIClient {
  constructor() {
    throw new Error(
      'OpenAI provider is not yet activated.\n\n' +
      'For demo: Set LLM_PROVIDER=gemini in .env (free, no card required)\n\n' +
      'For production with OpenAI:\n' +
      '  1. npm install openai\n' +
      '  2. Set LLM_PROVIDER=openai and OPENAI_API_KEY=sk-... in .env\n' +
      '  3. Uncomment the implementation in src/services/llm/clients/openaiClient.js'
    );
  }

  // ─── Production Implementation (uncomment when ready) ────────────────────
  //
  // constructor() {
  //   const { default: OpenAI } = await import('openai');
  //   this._client = new OpenAI({ apiKey: env.openaiApiKey });
  // }
  //
  // async generateJSON(prompt) {
  //   const response = await this._client.chat.completions.create({
  //     model: env.openaiModel,
  //     messages: [{ role: 'user', content: prompt }],
  //     response_format: { type: 'json_object' },
  //     temperature: 0.1,
  //     max_tokens: 1024,
  //   });
  //   return {
  //     rawText: response.choices[0].message.content,
  //     inputTokens: response.usage.prompt_tokens,
  //     outputTokens: response.usage.completion_tokens,
  //   };
  // }
  //
  // static getInstance() { ... }
}
