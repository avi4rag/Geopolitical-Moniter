import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

async function testSDK() {
  console.log('Testing @google/genai SDK...');
  const key = env.geminiApiKey;
  console.log('Key prefix:', key.substring(0, 8) + '...');

  const client = new GoogleGenAI({ apiKey: key });

  const modelsToTest = [
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-2.5-flash',
  ];

  for (const model of modelsToTest) {
    try {
      console.log(`Testing model: ${model}...`);
      const interaction = await client.interactions.create({
        model,
        input: 'Say hello in 3 words',
      });
      console.log(`✅ SUCCESS with ${model}:`, interaction.output_text);
      return;
    } catch (err) {
      console.log(`❌ Failed with ${model}:`, err.message);
    }
  }
}

testSDK();
