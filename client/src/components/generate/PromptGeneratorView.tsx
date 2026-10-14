import React, { useState } from 'react';
import {
  Sparkles,
  Code2,
  GraduationCap,
  PenTool,
  Briefcase,
  BarChart3,
  Search,
  FileText,
  Image,
  Zap,
  Sliders,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { GeneratedPromptResult } from '../../types';
import { generatePrompt } from '../../services/api';

interface PromptGeneratorViewProps {
  onTestInChat: (prompt: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES = [
  { id: 'Software Development', icon: Code2, desc: 'Architecture, APIs, refactoring, tests' },
  { id: 'Education and Learning', icon: GraduationCap, desc: 'Socratic tutoring, concept breakdowns' },
  { id: 'Content Writing', icon: PenTool, desc: 'Articles, copywriting, thought leadership' },
  { id: 'Business and Marketing', icon: Briefcase, desc: 'PRDs, competitive moats, outreach' },
  { id: 'Data Analysis', icon: BarChart3, desc: 'EDA, Pandas scripts, cohort retention' },
  { id: 'Research', icon: Search, desc: 'Literature review, strict grounding, synthesis' },
  { id: 'Resume and Interview Preparation', icon: FileText, desc: 'STAR technique, mock technical interviews' },
  { id: 'AI Image Generation', icon: Image, desc: 'Midjourney, DALL-E, cinematography params' },
  { id: 'Productivity', icon: Zap, desc: 'Time blocking, Eisenhower, meeting minutes' },
  { id: 'Custom Task', icon: Sliders, desc: 'Bespoke workflows and custom rules' }
];

export const PromptGeneratorView: React.FC<PromptGeneratorViewProps> = ({
  onTestInChat,
  onNotify
}) => {
  const [selectedCategory, setSelectedCategory] = useState('Software Development');
  const [objective, setObjective] = useState('');
  const [requirements, setRequirements] = useState('');
  const [audience, setAudience] = useState('');
  const [format, setFormat] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedPromptResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!objective.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await generatePrompt({
        category: selectedCategory,
        objective: objective.trim(),
        requirements: requirements.trim() || undefined,
        audience: audience.trim() || undefined,
        format: format.trim() || undefined
      });
      setResult(res);
      onNotify('Professional prompt generated!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to generate prompt.');
      onNotify(err.message || 'Failed to generate prompt.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.prompt) {
      navigator.clipboard.writeText(result.prompt);
      setCopied(true);
      onNotify('Generated prompt copied!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Guided Prompt Generator
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Generate tailored, production-grade prompts engineered specifically for your use case.
          </p>
        </div>

        {/* 1. Category Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            1. Select Task Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300 shadow-xs font-semibold ring-1 ring-blue-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate w-full">{cat.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Objective & Requirements Form */}
        <form onSubmit={handleGenerate} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Core Objective & Task <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={objective}
              onChange={e => setObjective(e.target.value)}
              placeholder={`Describe what you want the AI to achieve in ${selectedCategory}...`}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Key Constraints / Requirements
              </label>
              <input
                type="text"
                value={requirements}
                onChange={e => setRequirements(e.target.value)}
                placeholder="e.g. No 3rd party libs, under 300 words"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Audience
              </label>
              <input
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. Enterprise customers, Junior devs"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Output Format
              </label>
              <input
                type="text"
                value={format}
                onChange={e => setFormat(e.target.value)}
                placeholder="e.g. Markdown table, JSON schema"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!objective.trim() || isLoading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs ${
              objective.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Architecting Custom Prompt...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Professional Prompt</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase">Generation Error</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Output Card */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {selectedCategory}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {result.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Recommended Use Case: {result.useCase}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    title="Regenerate with same parameters"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 shadow-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Prompt</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onTestInChat(result.prompt)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open in Chat</span>
                  </button>
                </div>
              </div>

              {/* Prompt Body */}
              <div className="p-5 bg-slate-900 text-slate-100">
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-200 leading-relaxed overflow-x-auto">
                  {result.prompt}
                </pre>
              </div>

              {/* Suggestions & Assumptions Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    💡 Customization Suggestions:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {result.customizationSuggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    ⚙️ Key Assumptions Made:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {result.assumptions.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500 font-bold">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
