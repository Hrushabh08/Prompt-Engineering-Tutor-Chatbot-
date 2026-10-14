import { useState, useEffect, useRef } from 'react';
import type {
  NavigationTab,
  ChatMessage,
  Conversation,
  HealthStatus,
  UserSettings,
  ChallengeProgress,
  PromptTemplate
} from './types';
import {
  getSavedConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  getCompletedLessons,
  toggleLessonCompletion,
  getChallengeProgress,
  recordChallengeScore,
  getFavoritePromptIds,
  toggleFavoritePromptId,
  getCustomPrompts,
  saveCustomPrompt,
  deleteCustomPrompt,
  getUserSettings,
  saveUserSettings,
  clearAllApplicationData
} from './utils/storage';
import { fetchHealth, sendChatMessage } from './services/api';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ChatView } from './components/chat/ChatView';
import { ImprovePromptView } from './components/improve/ImprovePromptView';
import { PromptGeneratorView } from './components/generate/PromptGeneratorView';
import { LearnView } from './components/learn/LearnView';
import { PracticeView } from './components/practice/PracticeView';
import { PromptLibraryView } from './components/library/PromptLibraryView';
import { SettingsView } from './components/settings/SettingsView';
import { Toast } from './components/common/Toast';
import { LESSON_MODULES } from './data/lessons';

export function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Health and System Diagnostics
  const [health, setHealth] = useState<HealthStatus | null>(null);

  // Settings & Theme
  const [userSettings, setUserSettings] = useState<UserSettings>(getUserSettings);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(getSavedConversations);
  const [activeConversationIdState, setActiveConversationIdState] = useState<string | null>(
    getActiveConversationId
  );

  // Chat Execution State
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Academy & Practice State
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(getCompletedLessons);
  const [challengeScores, setChallengeScores] = useState<Record<string, ChallengeProgress>>(
    getChallengeProgress
  );

  // Library & Favorites State
  const [favoritePromptIds, setFavoritePromptIds] = useState<string[]>(getFavoritePromptIds);
  const [customPrompts, setCustomPrompts] = useState<PromptTemplate[]>(getCustomPrompts);

  // Toast Notifications
  const [toasts, setToasts] = useState<Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Check health on mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const h = await fetchHealth();
      setHealth(h);
    } catch (err: any) {
      setHealth({
        status: 'error',
        configured: false,
        provider: 'offline',
        model: 'unknown',
        hasKey: false,
        message: err.message || 'Cannot contact backend service.'
      });
    }
  };

  // Apply dark mode class to document
  useEffect(() => {
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveUserSettings(userSettings);
  }, [userSettings]);

  // Current active conversation
  const currentConversation = conversations.find(c => c.id === activeConversationIdState) || null;
  const currentMessages = currentConversation ? currentConversation.messages : [];

  // Start a new chat
  const handleNewChat = () => {
    setActiveConversationIdState(null);
    setActiveConversationId(null);
    setCurrentTab('chat');
  };

  // Select an existing conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationIdState(id);
    setActiveConversationId(id);
    setCurrentTab('chat');
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    saveConversations(updated);
    if (activeConversationIdState === id) {
      handleNewChat();
    }
    addToast('Conversation deleted.', 'info');
  };

  // Rename a conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map(c => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c));
    setConversations(updated);
    saveConversations(updated);
    addToast('Conversation renamed.', 'success');
  };

  // Clear all chats
  const handleClearAllChats = () => {
    setConversations([]);
    saveConversations([]);
    handleNewChat();
  };

  // Reset entire application
  const handleResetAllData = () => {
    clearAllApplicationData();
    setConversations([]);
    setActiveConversationIdState(null);
    setCompletedLessonIds([]);
    setChallengeScores({});
    setFavoritePromptIds([]);
    setCustomPrompts([]);
    setUserSettings({ theme: 'light', offlineSimulation: false });
    handleNewChat();
  };

  // Send a chat message
  const handleSendMessage = async (userText: string) => {
    if (!userText.trim() || isLoading) return;

    // Create or append to conversation
    let convId = activeConversationIdState;
    let existingConv = conversations.find(c => c.id === convId);

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'user',
      content: userText,
      timestamp: Date.now()
    };

    let updatedConv: Conversation;
    if (!existingConv) {
      // Create new conversation with title derived from first message
      const generatedTitle = userText.length > 36 ? `${userText.slice(0, 36)}...` : userText;
      convId = `conv-${Date.now()}`;
      updatedConv = {
        id: convId,
        title: generatedTitle,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [userMessage]
      };
      const updatedConversations = [updatedConv, ...conversations];
      setConversations(updatedConversations);
      saveConversations(updatedConversations);
      setActiveConversationIdState(convId);
      setActiveConversationId(convId);
    } else {
      updatedConv = {
        ...existingConv,
        updatedAt: Date.now(),
        messages: [...existingConv.messages, userMessage]
      };
      const updatedConversations = conversations.map(c => (c.id === convId ? updatedConv : c));
      setConversations(updatedConversations);
      saveConversations(updatedConversations);
    }

    // Call API
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    try {
      // Build message history for context
      const historyPayload = updatedConv.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await sendChatMessage(historyPayload, 'tutor', abortControllerRef.current.signal);

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        role: 'assistant',
        content: res.response,
        timestamp: Date.now()
      };

      const finalConv = {
        ...updatedConv,
        messages: [...updatedConv.messages, assistantMessage]
      };

      const finalConversations = conversations.map(c => (c.id === convId ? finalConv : c));
      const existsInList = finalConversations.some(c => c.id === convId);
      const toSave = existsInList ? finalConversations : [finalConv, ...conversations];

      setConversations(toSave);
      saveConversations(toSave);
    } catch (err: any) {
      if (err.code === 'REQUEST_ABORTED') {
        addToast('Message generation stopped.', 'info');
        return;
      }

      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**AI Notice:** ${err.message || 'Unable to connect to the configured AI service.'}\n\n*If you haven't set up an API key, visit the **Settings** tab to review setup instructions.*`,
        timestamp: Date.now(),
        isError: true
      };

      const convWithError = {
        ...updatedConv,
        messages: [...updatedConv.messages, errorMessage]
      };
      const toSave = conversations.map(c => (c.id === convId ? convWithError : c));
      if (!toSave.some(c => c.id === convId)) toSave.unshift(convWithError);

      setConversations(toSave);
      saveConversations(toSave);
      addToast(err.message || 'Request failed.', 'error');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Stop generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!currentConversation || currentConversation.messages.length === 0 || isLoading) return;

    const msgs = [...currentConversation.messages];
    let lastUserIndex = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIndex = i;
        break;
      }
    }

    if (lastUserIndex === -1) return;

    const lastUserText = msgs[lastUserIndex].content;
    const trimmedMsgs = msgs.slice(0, lastUserIndex);
    const updatedConv = {
      ...currentConversation,
      messages: trimmedMsgs
    };

    const updatedConversations = conversations.map(c => (c.id === currentConversation.id ? updatedConv : c));
    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    handleSendMessage(lastUserText);
  };

  // Test in chat
  const handleTestInChat = (promptText: string) => {
    handleNewChat();
    handleSendMessage(promptText);
  };

  // Learning progress toggle
  const handleToggleLessonComplete = (moduleId: string) => {
    const updated = toggleLessonCompletion(moduleId);
    setCompletedLessonIds(updated);
  };

  // Practice score record
  const handleRecordChallengeScore = (progress: ChallengeProgress) => {
    const updated = recordChallengeScore(progress);
    setChallengeScores(updated);
  };

  // Favorite prompts toggle
  const handleToggleFavoritePrompt = (promptId: string) => {
    const updated = toggleFavoritePromptId(promptId);
    setFavoritePromptIds(updated);
    addToast(
      updated.includes(promptId) ? 'Saved to favorites!' : 'Removed from favorites',
      'success'
    );
  };

  // Custom prompt management
  const handleSaveCustomPrompt = (p: PromptTemplate) => {
    const updated = saveCustomPrompt(p);
    setCustomPrompts(updated);
  };

  const handleDeleteCustomPrompt = (id: string) => {
    const updated = deleteCustomPrompt(id);
    setCustomPrompts(updated);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onNavigate={setCurrentTab}
        conversations={conversations}
        activeConversationId={activeConversationIdState}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        completedLessonsCount={completedLessonIds.length}
        totalLessonsCount={LESSON_MODULES.length}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          health={health}
          theme={userSettings.theme}
          onToggleTheme={() =>
            setUserSettings(prev => ({
              ...prev,
              theme: prev.theme === 'dark' ? 'light' : 'dark'
            }))
          }
          onNewChat={handleNewChat}
          onNavigate={setCurrentTab}
        />

        {/* Dynamic View Display */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {currentTab === 'chat' && (
            <ChatView
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              onStopGeneration={handleStopGeneration}
              onRegenerate={currentMessages.length > 1 ? handleRegenerate : undefined}
              onNavigate={setCurrentTab}
              health={health}
              onNotify={addToast}
            />
          )}

          {currentTab === 'improve' && (
            <ImprovePromptView
              onTestInChat={handleTestInChat}
              onNotify={addToast}
            />
          )}

          {currentTab === 'generate' && (
            <PromptGeneratorView
              onTestInChat={handleTestInChat}
              onNotify={addToast}
            />
          )}

          {currentTab === 'learn' && (
            <LearnView
              completedLessonIds={completedLessonIds}
              onToggleComplete={handleToggleLessonComplete}
              onTestPromptInChat={handleTestInChat}
              onNotify={addToast}
            />
          )}

          {currentTab === 'practice' && (
            <PracticeView
              progress={challengeScores}
              onRecordScore={handleRecordChallengeScore}
              onTestPromptInChat={handleTestInChat}
              onNotify={addToast}
            />
          )}

          {currentTab === 'library' && (
            <PromptLibraryView
              favoriteIds={favoritePromptIds}
              customPrompts={customPrompts}
              onToggleFavorite={handleToggleFavoritePrompt}
              onSaveCustomPrompt={handleSaveCustomPrompt}
              onDeleteCustomPrompt={handleDeleteCustomPrompt}
              onUseInChat={handleTestInChat}
              onNotify={addToast}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              health={health}
              onRefreshHealth={checkSystemHealth}
              userSettings={userSettings}
              onUpdateSettings={setUserSettings}
              stats={{
                conversationsCount: conversations.length,
                completedLessonsCount: completedLessonIds.length,
                challengesCount: Object.values(challengeScores).filter(c => c.completed).length,
                customPromptsCount: customPrompts.length
              }}
              onClearChats={handleClearAllChats}
              onResetAllData={handleResetAllData}
              onNotify={addToast}
            />
          )}
        </main>
      </div>

      {/* Floating Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
