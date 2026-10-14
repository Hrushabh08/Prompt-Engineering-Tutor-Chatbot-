import {
  HealthStatus,
  PromptImprovementResult,
  GeneratedPromptResult,
  ChallengeEvaluation
} from '../types';

export class ApiError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data: any = {};
  const isJson = res.headers.get('content-type')?.includes('application/json');

  if (isJson) {
    try {
      data = await res.json();
    } catch {
      data = {};
    }
  } else {
    data = { message: await res.text() };
  }

  if (!res.ok) {
    const code = data?.error || 'API_ERROR';
    const message = data?.message || `Request failed with status ${res.status}`;
    throw new ApiError(code, message, res.status);
  }

  return data as T;
}

export async function fetchHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch('/api/health');
    return await handleResponse<HealthStatus>(res);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'SERVER_UNREACHABLE',
      'Cannot connect to PromptCraft backend server. Please verify the backend is running on port 5000.',
      503
    );
  }
}

export async function sendChatMessage(
  messages: { role: 'user' | 'assistant'; content: string }[],
  mode: 'tutor' | 'practice' | 'general' = 'tutor',
  signal?: AbortSignal
): Promise<{ response: string; provider: string; model: string }> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, mode }),
      signal
    });
    return await handleResponse<{ response: string; provider: string; model: string }>(res);
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new ApiError('REQUEST_ABORTED', 'Message generation was stopped by user.', 0);
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK_ERROR', err.message || 'Network error sending chat message.', 500);
  }
}

export async function improvePrompt(data: {
  prompt: string;
  intendedOutcome?: string;
  audience?: string;
  tone?: string;
  outputFormat?: string;
  difficulty?: string;
}): Promise<PromptImprovementResult> {
  try {
    const res = await fetch('/api/improve-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await handleResponse<PromptImprovementResult>(res);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK_ERROR', err.message || 'Network error improving prompt.', 500);
  }
}

export async function generatePrompt(data: {
  category: string;
  objective: string;
  requirements?: string;
  audience?: string;
  format?: string;
}): Promise<GeneratedPromptResult> {
  try {
    const res = await fetch('/api/generate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await handleResponse<GeneratedPromptResult>(res);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK_ERROR', err.message || 'Network error generating prompt.', 500);
  }
}

export async function evaluateAnswer(data: {
  challengeId: string;
  challengeTitle: string;
  question: string;
  criteria: string;
  userSubmission: string;
}): Promise<ChallengeEvaluation> {
  try {
    const res = await fetch('/api/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await handleResponse<ChallengeEvaluation>(res);
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('NETWORK_ERROR', err.message || 'Network error evaluating submission.', 500);
  }
}
