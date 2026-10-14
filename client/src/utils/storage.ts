import { Conversation, ChallengeProgress, PromptTemplate, UserSettings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'promptcraft_conversations_v1',
  ACTIVE_CONVERSATION: 'promptcraft_active_conv_id_v1',
  LEARN_COMPLETED: 'promptcraft_completed_lessons_v1',
  CHALLENGE_PROGRESS: 'promptcraft_challenge_progress_v1',
  FAVORITE_PROMPTS: 'promptcraft_favorite_prompts_v1',
  CUSTOM_PROMPTS: 'promptcraft_custom_prompts_v1',
  SETTINGS: 'promptcraft_user_settings_v1'
};

// Safe JSON parser helper
function safeGet<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (e) {
    console.warn(`Failed to parse localStorage key "${key}":`, e);
    return defaultValue;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write to localStorage key "${key}":`, e);
  }
}

// Conversations
export function getSavedConversations(): Conversation[] {
  return safeGet<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
}

export function saveConversations(conversations: Conversation[]): void {
  safeSet(STORAGE_KEYS.CONVERSATIONS, conversations);
}

export function getActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  } catch {
    return null;
  }
}

export function setActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  } catch (e) {
    console.warn('Failed to set active conversation ID:', e);
  }
}

// Learning Progress
export function getCompletedLessons(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.LEARN_COMPLETED, []);
}

export function markLessonCompleted(moduleId: string): string[] {
  const current = getCompletedLessons();
  if (!current.includes(moduleId)) {
    const updated = [...current, moduleId];
    safeSet(STORAGE_KEYS.LEARN_COMPLETED, updated);
    return updated;
  }
  return current;
}

export function toggleLessonCompletion(moduleId: string): string[] {
  const current = getCompletedLessons();
  const exists = current.includes(moduleId);
  const updated = exists ? current.filter(id => id !== moduleId) : [...current, moduleId];
  safeSet(STORAGE_KEYS.LEARN_COMPLETED, updated);
  return updated;
}

// Challenge Progress
export function getChallengeProgress(): Record<string, ChallengeProgress> {
  return safeGet<Record<string, ChallengeProgress>>(STORAGE_KEYS.CHALLENGE_PROGRESS, {});
}

export function recordChallengeScore(progress: ChallengeProgress): Record<string, ChallengeProgress> {
  const current = getChallengeProgress();
  const existing = current[progress.challengeId];
  const bestScore = existing ? Math.max(existing.bestScore, progress.bestScore) : progress.bestScore;
  const completed = existing?.completed || progress.completed;

  const updated = {
    ...current,
    [progress.challengeId]: {
      ...progress,
      bestScore,
      completed
    }
  };
  safeSet(STORAGE_KEYS.CHALLENGE_PROGRESS, updated);
  return updated;
}

// Favorite Prompts
export function getFavoritePromptIds(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.FAVORITE_PROMPTS, []);
}

export function toggleFavoritePromptId(promptId: string): string[] {
  const current = getFavoritePromptIds();
  const exists = current.includes(promptId);
  const updated = exists ? current.filter(id => id !== promptId) : [...current, promptId];
  safeSet(STORAGE_KEYS.FAVORITE_PROMPTS, updated);
  return updated;
}

// Custom Prompts
export function getCustomPrompts(): PromptTemplate[] {
  return safeGet<PromptTemplate[]>(STORAGE_KEYS.CUSTOM_PROMPTS, []);
}

export function saveCustomPrompt(prompt: PromptTemplate): PromptTemplate[] {
  const current = getCustomPrompts();
  const existingIndex = current.findIndex(p => p.id === prompt.id);
  let updated: PromptTemplate[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = prompt;
  } else {
    updated = [prompt, ...current];
  }
  safeSet(STORAGE_KEYS.CUSTOM_PROMPTS, updated);
  return updated;
}

export function deleteCustomPrompt(promptId: string): PromptTemplate[] {
  const current = getCustomPrompts();
  const updated = current.filter(p => p.id !== promptId);
  safeSet(STORAGE_KEYS.CUSTOM_PROMPTS, updated);
  return updated;
}

// Settings
export function getUserSettings(): UserSettings {
  return safeGet<UserSettings>(STORAGE_KEYS.SETTINGS, {
    theme: 'light',
    offlineSimulation: false
  });
}

export function saveUserSettings(settings: UserSettings): void {
  safeSet(STORAGE_KEYS.SETTINGS, settings);
}

// Clear all local data
export function clearAllApplicationData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  } catch (e) {
    console.error('Error clearing application data:', e);
  }
}
