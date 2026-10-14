import React from 'react';
import {
  Menu,
  Sparkles,
  Sun,
  Moon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { HealthStatus, NavigationTab } from '../../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  health: HealthStatus | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNewChat: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  health,
  theme,
  onToggleTheme,
  onNewChat,
  onNavigate
}) => {
  const isConfigured = health?.configured ?? false;
  const provider = health?.provider?.toUpperCase() || 'AI';
  const model = health?.model || 'Model';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              PromptCraft AI
            </h1>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Tutor
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden xs:block">
            AI-Powered Prompt Engineering Tutor
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Connection Status Badge */}
        {health ? (
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
              isConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
            }`}
            title={
              isConfigured
                ? `Connected to ${provider} (${model})`
                : 'Click to configure your AI API key in Settings'
            }
          >
            <span className="relative flex h-2 w-2">
              {isConfigured ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              )}
            </span>
            <span className="hidden md:inline font-mono text-[11px]">
              {isConfigured ? `${provider} (${model})` : 'API Key Required'}
            </span>
            <span className="md:hidden">
              {isConfigured ? 'Ready' : 'Setup'}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span className="hidden sm:inline">Connecting...</span>
          </div>
        )}

        {/* Quick New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
          title="Start a new chat session"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
