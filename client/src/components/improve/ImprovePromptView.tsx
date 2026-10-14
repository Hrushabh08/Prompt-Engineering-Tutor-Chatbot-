import React, { useState } from 'react';
import {
  Wand2,
  Copy,
  Check,
  ArrowRight,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Layers,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { PromptImprovementResult } from '../../types';
import { improvePrompt } from '../../services/api';

interface ImprovePromptViewProps {
  onTestInChat: (prompt: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ImprovePromptView: React.FC<ImprovePromptViewProps> = ({
  onTestInChat,
  onNotify
}) => {
  const [prompt, setPrompt] = useState('');
  const [intendedOutcome, setIntendedOutcome] = useState('');
  const [audience, setAudience] = useState('');
  const [tone, setTone] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PromptImprovementResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'improved' | 'comparison'>('improved');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await improvePrompt({
        prompt: prompt.trim(),
        intendedOutcome: intendedOutcome.trim() || undefined,
        audience: audience || undefined,
        tone: tone || undefined,
        outputFormat: outputFormat || undefined,
        difficulty
      });
      setResult(res);
      onNotify('Prompt improved successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to improve prompt.');
      onNotify(err.message || 'Failed to improve prompt.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.improvedPrompt) {
      navigator.clipboard.writeText(result.improvedPrompt);
      setCopied(true);
      onNotify('Improved prompt copied to clipboard!', 'success');
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
              <Wand2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Improve My Prompt
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Turn unclear instructions into precise, effective prompts.
          </p>
        </div>

        {/* Form and Configuration */}
        <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Original Prompt <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g., Write an email to my team about meeting our quarterly goals..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Intended Outcome (Optional)
              </label>
              <input
                type="text"
                value={intendedOutcome}
                onChange={e => setIntendedOutcome(e.target.value)}
                placeholder="e.g., Motivate action and establish specific deadlines"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Audience (Optional)
              </label>
              <select
                value={audience}
                onChange={e => setAudience(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="">Default / General</option>
                <option value="Software Engineers">Software Engineers / Developers</option>
                <option value="Senior Executives">Senior Executives / C-Suite</option>
                <option value="General Public">General Public</option>
                <option value="Students / Beginners">Students / Beginners</option>
                <option value="Data Scientists">Data Scientists & Analysts</option>
                <option value="Customer Support">Customer Support Teams</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Tone (Optional)
              </label>
              <select
                value={tone}
                onChange={e => setTone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="">Default / Balanced</option>
                <option value="Professional & Direct">Professional & Direct</option>
                <option value="Socratic & Instructive">Socratic & Instructive</option>
                <option value="Academic & Rigorous">Academic & Rigorous</option>
                <option value="Friendly & Conversational">Friendly & Conversational</option>
                <option value="Persuasive & High Energy">Persuasive & High Energy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Output Format (Optional)
              </label>
              <select
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              >
                <option value="">Default / Structured Markdown</option>
                <option value="Strict JSON Schema">Strict JSON Schema</option>
                <option value="Markdown Table">Markdown Table</option>
                <option value="Bulleted Action Items">Bulleted Action Items</option>
                <option value="Step-by-Step Guide">Step-by-Step Guide</option>
                <option value="Code Only with Comments">Code Only with Comments</option>
              </select>
            </div>
          </div>

          {/* Difficulty / Rigor Tier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Refinement Rigor
            </label>
            <div className="flex gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    difficulty === level
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs ${
              prompt.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyzing and Refining Prompt...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Improve Prompt</span>
              </>
            )}
          </button>
        </form>

        {/* Error notification */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide">Optimization Error</p>
              <p className="mt-0.5 text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Results Presentation */}
        {result && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* View Switcher Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('improved')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'improved'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Enhanced Prompt
                </button>
                <button
                  onClick={() => setActiveTab('comparison')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    activeTab === 'comparison'
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  Side-by-Side Comparison
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Improved</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onTestInChat(result.improvedPrompt)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Test in Chat</span>
                </button>
              </div>
            </div>

            {/* Display Body */}
            {activeTab === 'improved' ? (
              <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs font-mono text-slate-400">
                  <span>PRODUCTION_PROMPT</span>
                  <span>READY_TO_COPY</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs sm:text-sm text-slate-200 leading-relaxed overflow-x-auto">
                  {result.improvedPrompt}
                </pre>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Original Prompt
                  </span>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                    {result.originalPrompt || prompt}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/40 dark:bg-blue-950/20">
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-2">
                    Improved Prompt
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono">
                    {result.improvedPrompt}
                  </p>
                </div>
              </div>
            )}

            {/* Diagnostic Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Key Improvements */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>Key Improvements</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {result.keyImprovements.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explanation of Changes */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Why It Works Better</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {result.explanation}
                </p>
              </div>

              {/* Limitations / Context Needs */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Context & Caveats</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {result.potentialLimitations.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
