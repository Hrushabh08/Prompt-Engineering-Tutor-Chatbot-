import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Key,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sun,
  Moon,
  Trash2,
  Download,
  Database,
  ExternalLink,
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { HealthStatus, UserSettings } from '../../types';
import { fetchHealth } from '../../services/api';
import { Modal } from '../common/Modal';

interface SettingsViewProps {
  health: HealthStatus | null;
  onRefreshHealth: () => void;
  userSettings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  stats: {
    conversationsCount: number;
    completedLessonsCount: number;
    challengesCount: number;
    customPromptsCount: number;
  };
  onClearChats: () => void;
  onResetAllData: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  health,
  onRefreshHealth,
  userSettings,
  onUpdateSettings,
  stats,
  onClearChats,
  onResetAllData,
  onNotify
}) => {
  const [isChecking, setIsChecking] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearChatsModalOpen, setClearChatsModalOpen] = useState(false);

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      await fetchHealth();
      onRefreshHealth();
      onNotify('Connection test passed!', 'success');
    } catch (err: any) {
      onNotify(err.message || 'Connection test failed.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleExportData = () => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        conversations: localStorage.getItem('promptcraft_conversations_v1'),
        learningProgress: localStorage.getItem('promptcraft_completed_lessons_v1'),
        challengeProgress: localStorage.getItem('promptcraft_challenge_progress_v1'),
        customPrompts: localStorage.getItem('promptcraft_custom_prompts_v1'),
        favorites: localStorage.getItem('promptcraft_favorite_prompts_v1')
      };

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `promptcraft-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      onNotify('Data backup exported successfully!', 'success');
    } catch {
      onNotify('Failed to export data.', 'error');
    }
  };

  const isConfigured = health?.configured ?? false;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Settings & Provider Status
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Monitor AI service connectivity, examine provider setup instructions, and manage local storage.
          </p>
        </div>

        {/* 1. Live AI Connection & Health Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Service Diagnostic
              </h3>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isChecking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Checking...' : 'Test Connection'}</span>
            </button>
          </div>

          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isConfigured
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {isConfigured ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {isConfigured ? 'Live AI Provider Connected' : 'API Key Not Configured'}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {health?.message || 'Checking backend service status...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                Provider: {health?.provider?.toUpperCase() || 'NONE'}
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                Model: {health?.model || 'gpt-4o-mini'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Provider Setup Guide */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Provider Setup & Configuration Guide
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            PromptCraft AI integrates via server-side environment variables. Your keys are kept secure on the backend and are never sent to the browser.
          </p>

          <div className="space-y-3 pt-2">
            {/* OpenAI */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Option A: OpenAI (Default)</span>
                <span className="text-[10px] text-slate-400">Recommended for highest quality</span>
              </div>
              <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
                AI_PROVIDER=openai<br />
                AI_API_KEY=sk-proj-...<br />
                AI_MODEL=gpt-4o-mini
              </div>
            </div>

            {/* Google Gemini */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Option B: Google Gemini</span>
                <span className="text-[10px] text-slate-400">Generous free tier</span>
              </div>
              <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
                AI_PROVIDER=gemini<br />
                AI_API_KEY=AIzaSy...<br />
                AI_MODEL=gemini-1.5-flash
              </div>
            </div>

            {/* Groq */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Option C: Groq (Ultra-fast Llama 3)</span>
                <span className="text-[10px] text-slate-400">Blazing inference speeds</span>
              </div>
              <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
                AI_PROVIDER=groq<br />
                AI_API_KEY=gsk_...<br />
                AI_MODEL=llama-3.3-70b-versatile
              </div>
            </div>

            {/* Local Ollama */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Option D: Local Ollama (Completely Free & Offline)</span>
                <span className="text-[10px] text-slate-400">Runs locally on your machine</span>
              </div>
              <div className="p-2 rounded bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto">
                AI_PROVIDER=ollama<br />
                AI_BASE_URL=http://localhost:11434/v1<br />
                AI_MODEL=llama3:latest
              </div>
            </div>
          </div>
        </div>

        {/* 3. Appearance & Interface */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Appearance & Theme
            </h3>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Interface Color Scheme
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose between professional light mode or distraction-free dark mode.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ ...userSettings, theme: 'light' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  userSettings.theme === 'light'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...userSettings, theme: 'dark' })}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  userSettings.theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Local Storage & Data Management */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Local Storage & Data Management
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats.conversationsCount}
              </div>
              <div className="text-[11px] text-slate-500">Saved Chats</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats.completedLessonsCount}
              </div>
              <div className="text-[11px] text-slate-500">Lessons Finished</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats.challengesCount}
              </div>
              <div className="text-[11px] text-slate-500">Challenges Solved</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {stats.customPromptsCount}
              </div>
              <div className="text-[11px] text-slate-500">Custom Prompts</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Local Backup (JSON)</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setClearChatsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors"
              >
                Clear All Chats
              </button>

              <button
                onClick={() => setResetModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs"
              >
                Reset All Data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Clear Chats Modal */}
      <Modal
        isOpen={clearChatsModalOpen}
        onClose={() => setClearChatsModalOpen(false)}
        title="Clear All Chat History"
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          This will permanently delete all saved conversations from this browser. Your learning progress and custom prompts will be retained.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setClearChatsModalOpen(false)}
            className="px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClearChats();
              setClearChatsModalOpen(false);
              onNotify('All conversations cleared.', 'info');
            }}
            className="px-3.5 py-1.5 text-xs text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-medium"
          >
            Clear Chats
          </button>
        </div>
      </Modal>

      {/* Reset All Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Entire Application"
      >
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Are you sure you want to completely erase all local data, including chats, course progress, challenge scores, and custom prompts?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={() => setResetModalOpen(false)}
            className="px-3.5 py-1.5 text-xs text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onResetAllData();
              setResetModalOpen(false);
              onNotify('Application reset to factory defaults.', 'info');
            }}
            className="px-3.5 py-1.5 text-xs text-white bg-rose-600 rounded-lg hover:bg-rose-700 font-medium"
          >
            Reset Everything
          </button>
        </div>
      </Modal>
    </div>
  );
};
