export type NavigationTab =
  | 'chat'
  | 'improve'
  | 'generate'
  | 'learn'
  | 'practice'
  | 'library'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export interface HealthStatus {
  status: string;
  configured: boolean;
  provider: string;
  model: string;
  hasKey: boolean;
  message: string;
}

export interface PromptImprovementResult {
  originalPrompt: string;
  improvedPrompt: string;
  keyImprovements: string[];
  explanation: string;
  potentialLimitations: string[];
  alternativeVariations?: string[];
}

export interface GeneratedPromptResult {
  title: string;
  prompt: string;
  useCase: string;
  customizationSuggestions: string[];
  assumptions: string[];
}

export interface LessonExample {
  title: string;
  weak: string;
  improved: string;
  explanation: string;
}

export interface LessonQuiz {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface LessonModule {
  id: string;
  moduleNumber: number;
  title: string;
  category: string;
  estimatedTime: string;
  description: string;
  objectives: string[];
  content: string;
  examples: LessonExample[];
  quiz: LessonQuiz;
}

export interface Challenge {
  id: string;
  title: string;
  tier: 'Beginner' | 'Intermediate' | 'Advanced';
  scenario: string;
  task: string;
  criteria: string;
  hint: string;
  initialPrompt?: string;
}

export interface ChallengeEvaluation {
  score: number;
  maxScore: number;
  passed: boolean;
  feedback: string;
  strengths: string[];
  areasForImprovement: string[];
  suggestedAnswer: string;
}

export interface ChallengeProgress {
  challengeId: string;
  completed: boolean;
  bestScore: number;
  lastAttemptDate: number;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  prompt: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  tags: string[];
  isFavorite?: boolean;
  isCustom?: boolean;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  offlineSimulation: boolean;
}
