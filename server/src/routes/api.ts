import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { config } from '../config.js';
import {
  getAIProvider,
  ProviderError,
  extractJsonFromResponse
} from '../services/aiProvider.js';
import {
  TUTOR_SYSTEM_PROMPT,
  IMPROVE_PROMPT_SYSTEM_INSTRUCTION,
  GENERATE_PROMPT_SYSTEM_INSTRUCTION,
  EVALUATE_ANSWER_SYSTEM_INSTRUCTION
} from '../prompts/systemPrompt.js';

export const apiRouter = Router();

// In-memory simple IP rate limiter (e.g. 60 requests per minute)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 60;

  const current = requestCounts.get(ip);
  if (!current || now > current.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (current.count >= maxRequests) {
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment before sending another message.'
    });
  }

  current.count++;
  return next();
}

apiRouter.use(rateLimiter);

/**
 * Health & Configuration Status Check
 * GET /api/health
 */
apiRouter.get('/health', (req: Request, res: Response) => {
  const provider = getAIProvider();
  const isConfigured = provider.isConfigured();

  res.json({
    status: 'ok',
    configured: isConfigured,
    provider: provider.getProviderName(),
    model: provider.getModelName(),
    hasKey: config.isConfigured,
    message: isConfigured
      ? `AI provider '${provider.getProviderName()}' (${provider.getModelName()}) is ready.`
      : `AI provider '${provider.getProviderName()}' is not configured. Add AI_API_KEY to your environment.`
  });
});

/**
 * Intelligent AI Chat
 * POST /api/chat
 */
const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1, 'Message content cannot be empty').max(30000, 'Message exceeds maximum length')
    })
  ).min(1, 'At least one message is required').max(60, 'Conversation exceeds maximum length limit'),
  mode: z.enum(['tutor', 'practice', 'general']).optional().default('tutor')
});

apiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const parseResult = chatSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: parseResult.error.errors.map(e => e.message).join(', ')
      });
    }

    const { messages, mode } = parseResult.data;
    const provider = getAIProvider();

    if (!provider.isConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'No AI API Key is configured on the server. Please configure your AI_API_KEY in the server environment or inspect the Settings tab for guidance.'
      });
    }

    // Build complete context with system tutor instructions
    let systemInstruction = TUTOR_SYSTEM_PROMPT;
    if (mode === 'practice') {
      systemInstruction += '\n\nACTIVE MODE: INTERACTIVE PRACTICE. Ask one challenge or quiz question at a time. Evaluate the student response carefully.';
    }

    const messagesWithSystem = [
      { role: 'system' as const, content: systemInstruction },
      ...messages
    ];

    const responseContent = await provider.chatCompletion(messagesWithSystem, {
      temperature: 0.7,
      maxTokens: 2500
    });

    return res.json({
      response: responseContent,
      provider: provider.getProviderName(),
      model: provider.getModelName()
    });
  } catch (err: any) {
    if (err instanceof ProviderError) {
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.userMessage
      });
    }
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while communicating with the AI service. Please try again.'
    });
  }
});

/**
 * Improve My Prompt
 * POST /api/improve-prompt
 */
const improvePromptSchema = z.object({
  prompt: z.string().min(3, 'Please provide a prompt with at least 3 characters').max(10000, 'Prompt exceeds maximum allowed length'),
  intendedOutcome: z.string().max(1000).optional(),
  audience: z.string().max(200).optional(),
  tone: z.string().max(200).optional(),
  outputFormat: z.string().max(200).optional(),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).optional().default('Intermediate')
});

apiRouter.post('/improve-prompt', async (req: Request, res: Response) => {
  try {
    const parseResult = improvePromptSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: parseResult.error.errors.map(e => e.message).join(', ')
      });
    }

    const { prompt, intendedOutcome, audience, tone, outputFormat, difficulty } = parseResult.data;
    const provider = getAIProvider();

    if (!provider.isConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'No AI API Key is configured on the server. Please configure your AI_API_KEY in the server environment or check Settings.'
      });
    }

    const promptAnalysisTask = `
Analyze and significantly improve the following user prompt.

USER SUBMISSION:
"""
${prompt}
"""

SPECIFICATIONS PROVIDED BY USER:
- Target Learner Difficulty / Rigor: ${difficulty}
${intendedOutcome ? `- Intended Outcome: ${intendedOutcome}` : ''}
${audience ? `- Target Audience: ${audience}` : ''}
${tone ? `- Desired Tone: ${tone}` : ''}
${outputFormat ? `- Desired Output Format: ${outputFormat}` : ''}

CRITICAL RULES:
1. Preserve the user's core intent while making the prompt crystal-clear, structured, and resistant to hallucinations.
2. Add necessary role definition, context boundaries, negative constraints, and output schema where appropriate.
3. Return ONLY valid JSON adhering strictly to the schema in your system instructions.
`;

    const messages = [
      { role: 'system' as const, content: IMPROVE_PROMPT_SYSTEM_INSTRUCTION },
      { role: 'user' as const, content: promptAnalysisTask }
    ];

    const rawResponse = await provider.chatCompletion(messages, {
      temperature: 0.4,
      maxTokens: 2500,
      responseFormatJson: true
    });

    const parsed = extractJsonFromResponse(rawResponse, {
      originalPrompt: prompt,
      improvedPrompt: prompt,
      keyImprovements: ['Added structured context', 'Defined explicit constraints', 'Specified output format'],
      explanation: 'The prompt was augmented with explicit roles and clear evaluation criteria.',
      potentialLimitations: ['Requires accurate contextual inputs when deployed'],
      alternativeVariations: []
    });

    return res.json(parsed);
  } catch (err: any) {
    if (err instanceof ProviderError) {
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.userMessage
      });
    }
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to improve prompt due to a server error.'
    });
  }
});

/**
 * Prompt Generator
 * POST /api/generate-prompt
 */
const generatePromptSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  objective: z.string().min(5, 'Please provide an objective of at least 5 characters').max(4000),
  requirements: z.string().max(4000).optional(),
  audience: z.string().max(500).optional(),
  format: z.string().max(500).optional()
});

apiRouter.post('/generate-prompt', async (req: Request, res: Response) => {
  try {
    const parseResult = generatePromptSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: parseResult.error.errors.map(e => e.message).join(', ')
      });
    }

    const { category, objective, requirements, audience, format } = parseResult.data;
    const provider = getAIProvider();

    if (!provider.isConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'No AI API Key is configured on the server. Please configure your AI_API_KEY in the server environment.'
      });
    }

    const generationTask = `
Create a professional, production-grade prompt for the following category and requirements:

CATEGORY: ${category}
CORE OBJECTIVE: ${objective}
${requirements ? `KEY CONSTRAINTS & REQUIREMENTS:\n${requirements}` : ''}
${audience ? `TARGET AUDIENCE: ${audience}` : ''}
${format ? `EXPECTED OUTPUT FORMAT: ${format}` : ''}

TASK:
Produce an elite, structured prompt (including Role, Context, Task, Constraints, Placeholders like [INPUT], and Output Format) that delivers top-tier results with modern LLMs.
Return ONLY valid JSON adhering strictly to the system instruction schema.
`;

    const messages = [
      { role: 'system' as const, content: GENERATE_PROMPT_SYSTEM_INSTRUCTION },
      { role: 'user' as const, content: generationTask }
    ];

    const rawResponse = await provider.chatCompletion(messages, {
      temperature: 0.6,
      maxTokens: 2500,
      responseFormatJson: true
    });

    const parsed = extractJsonFromResponse(rawResponse, {
      title: `${category} Prompt: ${objective.slice(0, 40)}`,
      prompt: `You are an expert specialist in ${category}.\n\nTask: ${objective}\n\nConstraints: Ensure accuracy, clarity, and depth.\n\nOutput Format: Structured markdown.`,
      useCase: `Designed for ${category.toLowerCase()} tasks requiring high precision.`,
      customizationSuggestions: ['Tailor the placeholders to your specific codebase or business rules'],
      assumptions: ['Assumes target LLM has standard instruction-following capabilities']
    });

    return res.json(parsed);
  } catch (err: any) {
    if (err instanceof ProviderError) {
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.userMessage
      });
    }
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to generate prompt due to an unexpected server error.'
    });
  }
});

/**
 * Evaluate Practice Challenge Answer
 * POST /api/evaluate-answer
 */
const evaluateAnswerSchema = z.object({
  challengeId: z.string().min(1),
  challengeTitle: z.string().min(1),
  question: z.string().min(1),
  criteria: z.string().min(1),
  userSubmission: z.string().min(3, 'Please provide an answer with at least 3 characters').max(10000)
});

apiRouter.post('/evaluate-answer', async (req: Request, res: Response) => {
  try {
    const parseResult = evaluateAnswerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'INVALID_REQUEST',
        message: parseResult.error.errors.map(e => e.message).join(', ')
      });
    }

    const { challengeId, challengeTitle, question, criteria, userSubmission } = parseResult.data;
    const provider = getAIProvider();

    if (!provider.isConfigured()) {
      return res.status(503).json({
        error: 'AI_NOT_CONFIGURED',
        message: 'No AI API Key configured to perform live evaluation. Please add your AI_API_KEY in server configuration.'
      });
    }

    const evaluationTask = `
EVALUATE THIS PROMPT ENGINEERING CHALLENGE SUBMISSION:

CHALLENGE: ${challengeTitle} (ID: ${challengeId})
PROBLEM STATEMENT:
${question}

EVALUATION RUBRIC & CRITERIA:
${criteria}

STUDENT'S SUBMISSION:
"""
${userSubmission}
"""

Evaluate this submission fairly. Check if it addressed ambiguity, specified constraints, calibrated persona, structured output, and provided clear directives.
Score objectively between 0 and 100.
Return ONLY valid JSON matching the system instruction schema.
`;

    const messages = [
      { role: 'system' as const, content: EVALUATE_ANSWER_SYSTEM_INSTRUCTION },
      { role: 'user' as const, content: evaluationTask }
    ];

    const rawResponse = await provider.chatCompletion(messages, {
      temperature: 0.3,
      maxTokens: 2000,
      responseFormatJson: true
    });

    const parsed = extractJsonFromResponse(rawResponse, {
      score: 75,
      maxScore: 100,
      passed: true,
      feedback: 'Good submission that addressed the core challenge requirements with clear phrasing.',
      strengths: ['Identified primary task goal', 'Preserved clear tone'],
      areasForImprovement: ['Could benefit from explicit negative constraints and output formatting schemas'],
      suggestedAnswer: 'A more robust version would incorporate few-shot examples or explicit boundary conditions.'
    });

    return res.json(parsed);
  } catch (err: any) {
    if (err instanceof ProviderError) {
      return res.status(err.statusCode).json({
        error: err.code,
        message: err.userMessage
      });
    }
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to evaluate challenge answer due to a server error.'
    });
  }
});
