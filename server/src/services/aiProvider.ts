import { config } from '../config.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormatJson?: boolean;
}

export interface IAIProvider {
  chatCompletion(messages: ChatMessage[], options?: CompletionOptions): Promise<string>;
  isConfigured(): boolean;
  getProviderName(): string;
  getModelName(): string;
}

export class ProviderError extends Error {
  public statusCode: number;
  public code: string;
  public userMessage: string;

  constructor(code: string, userMessage: string, statusCode: number = 500, details?: string) {
    super(details || userMessage);
    this.name = 'ProviderError';
    this.code = code;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
  }
}

/**
 * OpenAI-Compatible Provider (OpenAI, Groq, OpenRouter, Together, Ollama, vLLM, etc.)
 */
export class OpenAICompatibleProvider implements IAIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private providerName: string;

  constructor(providerName: string, apiKey: string, model: string, baseUrl?: string) {
    this.providerName = providerName;
    this.apiKey = apiKey;
    this.model = model;

    if (baseUrl) {
      this.baseUrl = baseUrl.replace(/\/+$/, '');
    } else if (providerName === 'groq') {
      this.baseUrl = 'https://api.groq.com/openai/v1';
    } else if (providerName === 'openrouter') {
      this.baseUrl = 'https://openrouter.ai/api/v1';
    } else if (providerName === 'ollama') {
      this.baseUrl = 'http://localhost:11434/v1';
    } else {
      this.baseUrl = 'https://api.openai.com/v1';
    }
  }

  isConfigured(): boolean {
    if (this.providerName === 'ollama') return true; // Local Ollama may not require an API key
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  getProviderName(): string {
    return this.providerName;
  }

  getModelName(): string {
    return this.model;
  }

  async chatCompletion(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
    if (!this.isConfigured()) {
      throw new ProviderError(
        'AI_NOT_CONFIGURED',
        `No API key configured for ${this.providerName.toUpperCase()}. Please configure your AI_API_KEY in the server environment or Settings.`,
        400
      );
    }

    const endpoint = `${this.baseUrl}/chat/completions`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (this.providerName === 'openrouter') {
      headers['HTTP-Referer'] = 'http://localhost:5000';
      headers['X-Title'] = 'PromptCraft AI Tutor';
    }

    const payload: any = {
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2500
    };

    if (options.responseFormatJson) {
      // Some models support json_object mode
      payload.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: { message: await response.text() } };
        }

        const rawMsg = errorData?.error?.message || errorData?.message || response.statusText;

        if (response.status === 401 || response.status === 403) {
          throw new ProviderError(
            'INVALID_API_KEY',
            `The ${this.providerName.toUpperCase()} API key provided is invalid or unauthorized. Please verify your credentials.`,
            401,
            rawMsg
          );
        } else if (response.status === 429) {
          const isQuota = rawMsg.toLowerCase().includes('quota') || rawMsg.toLowerCase().includes('insufficient_quota');
          throw new ProviderError(
            isQuota ? 'QUOTA_EXCEEDED' : 'RATE_LIMITED',
            isQuota
              ? `Your ${this.providerName.toUpperCase()} account quota has been exceeded or billing is not active.`
              : `Rate limit reached with ${this.providerName.toUpperCase()}. Please slow down and try again shortly.`,
            429,
            rawMsg
          );
        } else {
          throw new ProviderError(
            'PROVIDER_ERROR',
            `${this.providerName.toUpperCase()} service returned an error (${response.status}): ${rawMsg}`,
            response.status,
            rawMsg
          );
        }
      }

      const data: any = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new ProviderError(
          'EMPTY_MODEL_RESPONSE',
          'The AI model returned an empty response. Please retry with a slightly different prompt.',
          502
        );
      }

      return content.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ProviderError) {
        throw err;
      }
      if (err.name === 'AbortError') {
        throw new ProviderError('REQUEST_TIMEOUT', 'Request to the AI provider timed out after 60 seconds.', 504);
      }
      throw new ProviderError(
        'NETWORK_ERROR',
        `Network error communicating with ${this.providerName.toUpperCase()}: ${err.message || 'Connection failed.'}`,
        503,
        err.message
      );
    }
  }
}

/**
 * Google Gemini REST Provider
 */
export class GeminiProvider implements IAIProvider {
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model || 'gemini-1.5-flash';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  getProviderName(): string {
    return 'gemini';
  }

  getModelName(): string {
    return this.model;
  }

  async chatCompletion(messages: ChatMessage[], options: CompletionOptions = {}): Promise<string> {
    if (!this.isConfigured()) {
      throw new ProviderError(
        'AI_NOT_CONFIGURED',
        'No Google Gemini API key configured. Please set AI_API_KEY or GEMINI_API_KEY in the server environment or Settings.',
        400
      );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    // Separate system messages and user/assistant messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const systemInstruction = systemMessages.length > 0
      ? { parts: [{ text: systemMessages.map(m => m.content).join('\n\n') }] }
      : undefined;

    const contents = conversationMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const generationConfig: any = {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 2500
    };

    if (options.responseFormatJson) {
      generationConfig.responseMimeType = 'application/json';
    }

    const payload: any = {
      contents,
      generationConfig
    };

    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        let errData: any = {};
        try {
          errData = await response.json();
        } catch {
          errData = { error: { message: await response.text() } };
        }

        const rawMsg = errData?.error?.message || response.statusText;
        if (response.status === 400 && rawMsg.toLowerCase().includes('api_key_invalid')) {
          throw new ProviderError('INVALID_API_KEY', 'The Gemini API key provided is invalid.', 401, rawMsg);
        } else if (response.status === 429) {
          throw new ProviderError('RATE_LIMITED', 'Gemini API quota or rate limit exceeded.', 429, rawMsg);
        } else {
          throw new ProviderError('PROVIDER_ERROR', `Gemini API returned error (${response.status}): ${rawMsg}`, response.status, rawMsg);
        }
      }

      const data: any = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText || typeof candidateText !== 'string') {
        throw new ProviderError(
          'EMPTY_MODEL_RESPONSE',
          'Gemini model returned an empty response. Please retry with a revised prompt.',
          502
        );
      }

      return candidateText.trim();
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ProviderError) throw err;
      if (err.name === 'AbortError') {
        throw new ProviderError('REQUEST_TIMEOUT', 'Request to Gemini timed out after 60 seconds.', 504);
      }
      throw new ProviderError('NETWORK_ERROR', `Network error contacting Gemini: ${err.message}`, 503, err.message);
    }
  }
}

/**
 * Factory to return the selected AI Provider
 */
export function getAIProvider(): IAIProvider {
  const providerType = config.aiProvider;

  if (providerType === 'gemini') {
    return new GeminiProvider(config.apiKey, config.aiModel);
  }

  // Default to OpenAI-compatible for openai, groq, openrouter, ollama, custom, etc.
  return new OpenAICompatibleProvider(
    providerType,
    config.apiKey,
    config.aiModel,
    config.aiBaseUrl
  );
}

/**
 * Safely parse JSON from LLM responses even if wrapped in markdown codeblocks
 */
export function extractJsonFromResponse<T = any>(rawText: string, fallback: T): T {
  try {
    // If exact JSON
    return JSON.parse(rawText);
  } catch {
    // Strip markdown code fences if present
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      // Find first '{' and last '}'
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        try {
          const slice = cleaned.slice(firstBrace, lastBrace + 1);
          return JSON.parse(slice);
        } catch {
          // Return fallback
        }
      }
      return fallback;
    }
  }
}
