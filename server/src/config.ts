import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root promptcraft-ai directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface AppConfig {
  port: number;
  aiProvider: 'openai' | 'gemini' | 'anthropic' | 'groq' | 'openrouter' | 'ollama' | 'custom';
  apiKey: string;
  aiModel: string;
  aiBaseUrl?: string;
  isConfigured: boolean;
}

const defaultModels: Record<string, string> = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-1.5-flash',
  groq: 'llama-3.3-70b-versatile',
  openrouter: 'meta-llama/llama-3.3-70b-instruct',
  anthropic: 'claude-3-5-sonnet-20241022',
  ollama: 'llama3:latest',
  custom: 'gpt-4o-mini'
};

const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase() as AppConfig['aiProvider'];
let apiKey = process.env.AI_API_KEY || '';

// If AI_API_KEY was not explicitly provided in .env, check provider-specific keys
if (!apiKey) {
  if (provider === 'gemini') {
    apiKey = process.env.GEMINI_API_KEY || '';
  } else if (provider === 'groq') {
    apiKey = process.env.GROQ_API_KEY || '';
  } else if (provider === 'openai') {
    apiKey = process.env.OPENAI_API_KEY || '';
  }
}

apiKey = apiKey.trim();

// Detect dummy placeholder keys
const isPlaceholder =
  !apiKey ||
  apiKey === 'sk-xxxxxxxx' ||
  apiKey.toLowerCase().includes('placeholder') ||
  apiKey.toLowerCase().includes('your_api_key') ||
  apiKey.toLowerCase().includes('your-api-key') ||
  apiKey.length < 10;

const isConfigured = provider === 'ollama' ? true : !isPlaceholder;
const model = process.env.AI_MODEL || defaultModels[provider] || 'gpt-4o-mini';
const baseUrl = process.env.AI_BASE_URL;

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  aiProvider: provider,
  apiKey: isPlaceholder ? '' : apiKey,
  aiModel: model.trim(),
  aiBaseUrl: baseUrl?.trim(),
  isConfigured
};
