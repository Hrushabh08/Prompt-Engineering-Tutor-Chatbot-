import React, { useState } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import confetti from 'canvas-confetti';
import { LESSON_MODULES } from '../../data/lessons';
import { LessonModule } from '../../types';

interface LearnViewProps {
  completedLessonIds: string[];
  onToggleComplete: (id: string) => void;
  onTestPromptInChat: (prompt: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  completedLessonIds,
  onToggleComplete,
  onTestPromptInChat,
  onNotify
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>(LESSON_MODULES[0].id);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<Record<string, number>>({});
  const [showQuizResult, setShowQuizResult] = useState<Record<string, boolean>>({});

  const currentModule = LESSON_MODULES.find(m => m.id === selectedModuleId) || LESSON_MODULES[0];
  const completedCount = completedLessonIds.length;
  const totalCount = LESSON_MODULES.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const handleQuizSelect = (moduleId: string, answerIdx: number) => {
    setSelectedQuizAnswer(prev => ({ ...prev, [moduleId]: answerIdx }));
    setShowQuizResult(prev => ({ ...prev, [moduleId]: true }));

    const isCorrect = answerIdx === currentModule.quiz.answerIndex;
    if (isCorrect) {
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
      onNotify('Correct! Knowledge check passed.', 'success');
      if (!completedLessonIds.includes(moduleId)) {
        onToggleComplete(moduleId);
      }
    } else {
      onNotify('Not quite right. Read the explanation below.', 'info');
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Overall Course Progress */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Prompt Engineering Academy
                </h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                10 comprehensive modules teaching foundational principles, production techniques, and evaluation.
              </p>
            </div>

            {/* Progress summary card */}
            <div className="sm:text-right shrink-0">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Course Progress
              </div>
              <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                {progressPercent}%
              </div>
              <div className="text-xs text-slate-400">
                {completedCount} of {totalCount} completed
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Course Layout: Module Sidebar + Content Viewer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Module Selector List */}
          <div className="lg:col-span-4 space-y-2">
            <div className="px-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Modules
            </div>

            <div className="space-y-1.5">
              {LESSON_MODULES.map(module => {
                const isSelected = module.id === selectedModuleId;
                const isCompleted = completedLessonIds.includes(module.id);

                return (
                  <button
                    key={module.id}
                    onClick={() => setSelectedModuleId(module.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-950 dark:text-blue-100 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-mono text-slate-400 block uppercase">
                          Module {module.moduleNumber} • {module.category}
                        </span>
                        <h4 className="text-xs font-semibold truncate leading-snug mt-0.5">
                          {module.title}
                        </h4>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {module.estimatedTime}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Module Detail Viewer */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
              {/* Module Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    Module {currentModule.moduleNumber}: {currentModule.category}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                    {currentModule.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated time: {currentModule.estimatedTime}</span>
                  </p>
                </div>

                <button
                  onClick={() => onToggleComplete(currentModule.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    completedLessonIds.includes(currentModule.id)
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {completedLessonIds.includes(currentModule.id) ? 'Completed' : 'Mark as Complete'}
                  </span>
                </button>
              </div>

              {/* Learning Objectives */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Learning Objectives
                </span>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {currentModule.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Lesson Narrative Content */}
              <div className="prose-custom text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentModule.content}
                </ReactMarkdown>
              </div>

              {/* Practical Weak vs Improved Exemplars */}
              {currentModule.examples.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    Practical Example: Weak vs. Improved
                  </h4>

                  {currentModule.examples.map((ex, i) => (
                    <div key={i} className="space-y-3">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {ex.title}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20">
                          <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                            ❌ Weak Prompt
                          </span>
                          <p className="font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                            {ex.weak}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              ✅ Improved Prompt
                            </span>
                            <button
                              onClick={() => onTestPromptInChat(ex.improved)}
                              className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Test in Chat</span>
                              <ArrowUpRight className="w-2.5 h-2.5" />
                            </button>
                          </div>
                          <p className="font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                            {ex.improved}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Analysis: </span>
                        {ex.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Knowledge Check Quiz */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Interactive Knowledge Check
                  </h4>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {currentModule.quiz.question}
                </p>

                <div className="space-y-2">
                  {currentModule.quiz.options.map((opt, idx) => {
                    const isSelected = selectedQuizAnswer[currentModule.id] === idx;
                    const isSubmitted = showQuizResult[currentModule.id];
                    const isCorrect = idx === currentModule.quiz.answerIndex;

                    let btnStyles = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-blue-400';
                    if (isSubmitted) {
                      if (isCorrect) {
                        btnStyles = 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                      } else if (isSelected) {
                        btnStyles = 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizSelect(currentModule.id, idx)}
                        className={`w-full flex items-start text-left p-3 rounded-xl border text-xs transition-all ${btnStyles}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center shrink-0 mr-2.5 text-[11px] font-mono">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1 mt-0.5">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {showQuizResult[currentModule.id] && (
                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in">
                    <span className="font-semibold block mb-0.5">
                      {selectedQuizAnswer[currentModule.id] === currentModule.quiz.answerIndex
                        ? '🎉 Correct!'
                        : '💡 Instructor Explanation:'}
                    </span>
                    <p className="leading-relaxed">{currentModule.quiz.explanation}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
