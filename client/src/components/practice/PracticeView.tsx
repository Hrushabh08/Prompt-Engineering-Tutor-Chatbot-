import React, { useState } from 'react';
import {
  Target,
  Trophy,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRACTICE_CHALLENGES } from '../../data/challenges';
import { Challenge, ChallengeEvaluation, ChallengeProgress } from '../../types';
import { evaluateAnswer } from '../../services/api';

interface PracticeViewProps {
  progress: Record<string, ChallengeProgress>;
  onRecordScore: (progress: ChallengeProgress) => void;
  onTestPromptInChat: (prompt: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  progress,
  onRecordScore,
  onTestPromptInChat,
  onNotify
}) => {
  const [selectedTier, setSelectedTier] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [activeChallengeId, setActiveChallengeId] = useState<string>(
    PRACTICE_CHALLENGES.find(c => c.tier === 'Beginner')?.id || PRACTICE_CHALLENGES[0].id
  );
  const [userSubmission, setUserSubmission] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<ChallengeEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredChallenges = PRACTICE_CHALLENGES.filter(c => c.tier === selectedTier);
  const currentChallenge = PRACTICE_CHALLENGES.find(c => c.id === activeChallengeId) || filteredChallenges[0];

  const handleSelectChallenge = (c: Challenge) => {
    setActiveChallengeId(c.id);
    setUserSubmission(c.initialPrompt || '');
    setShowHint(false);
    setEvaluation(null);
    setError(null);
  };

  const handleTierChange = (tier: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setSelectedTier(tier);
    const firstOfTier = PRACTICE_CHALLENGES.find(c => c.tier === tier);
    if (firstOfTier) {
      handleSelectChallenge(firstOfTier);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSubmission.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setError(null);
    setEvaluation(null);

    try {
      const res = await evaluateAnswer({
        challengeId: currentChallenge.id,
        challengeTitle: currentChallenge.title,
        question: `${currentChallenge.scenario}\nTask: ${currentChallenge.task}`,
        criteria: currentChallenge.criteria,
        userSubmission: userSubmission.trim()
      });

      setEvaluation(res);

      // Record score locally
      onRecordScore({
        challengeId: currentChallenge.id,
        completed: res.passed,
        bestScore: res.score,
        lastAttemptDate: Date.now()
      });

      if (res.passed) {
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
        onNotify(`Challenge passed with ${res.score}/100!`, 'success');
      } else {
        onNotify(`Score: ${res.score}/100. Review the areas for improvement.`, 'info');
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed.');
      onNotify(err.message || 'Evaluation failed.', 'error');
    } finally {
      setIsEvaluating(false);
    }
  };

  // Completed challenges count
  const totalCompleted = Object.values(progress).filter(p => p.completed).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Practice & Challenges
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Apply prompt engineering techniques to real-world scenarios and receive automated evaluation.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Trophy className="w-5 h-5 text-amber-500" />
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Challenges Mastered</div>
              <div className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {totalCompleted} / {PRACTICE_CHALLENGES.length}
              </div>
            </div>
          </div>
        </div>

        {/* Tier Tabs */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {(['Beginner', 'Intermediate', 'Advanced'] as const).map(tier => {
            const countInTier = PRACTICE_CHALLENGES.filter(c => c.tier === tier).length;
            const completedInTier = PRACTICE_CHALLENGES.filter(
              c => c.tier === tier && progress[c.id]?.completed
            ).length;

            return (
              <button
                key={tier}
                onClick={() => handleTierChange(tier)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedTier === tier
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>{tier}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    selectedTier === tier
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {completedInTier}/{countInTier}
                </span>
              </button>
            );
          })}
        </div>

        {/* Challenge Selector Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {filteredChallenges.map(c => {
            const isSelected = c.id === currentChallenge.id;
            const userProg = progress[c.id];
            const isCompleted = userProg?.completed;

            return (
              <button
                key={c.id}
                onClick={() => handleSelectChallenge(c)}
                className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/60 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      Tier: {c.tier}
                    </span>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{userProg.bestScore} pts</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Unattempted</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {c.scenario}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Challenge Interactive Workspace */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-xs space-y-6">
          {/* Challenge Brief */}
          <div className="space-y-3 border-b border-slate-100 dark:border-slate-800 pb-5">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {currentChallenge.tier} Challenge
              </span>
              {progress[currentChallenge.id]?.completed && (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>High Score: {progress[currentChallenge.id].bestScore}/100</span>
                </span>
              )}
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentChallenge.title}
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div>
                <span className="font-semibold text-slate-900 dark:text-slate-100">Scenario: </span>
                {currentChallenge.scenario}
              </div>
              <div>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Your Objective: </span>
                {currentChallenge.task}
              </div>
            </div>

            {/* Rubric Criteria & Hint Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="text-slate-500">
                <span className="font-semibold">Evaluation Criteria: </span>
                <span className="whitespace-pre-line">{currentChallenge.criteria.replace(/\n/g, ' ')}</span>
              </div>

              <button
                type="button"
                onClick={() => setShowHint(!showHint)}
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
              </button>
            </div>

            {showHint && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 animate-in fade-in">
                💡 <span className="font-semibold">Hint: </span> {currentChallenge.hint}
              </div>
            )}
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Your Engineered Prompt
                </label>
                <button
                  type="button"
                  onClick={() => setUserSubmission(currentChallenge.initialPrompt || '')}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Reset to Baseline
                </button>
              </div>

              <textarea
                rows={6}
                value={userSubmission}
                onChange={e => setUserSubmission(e.target.value)}
                placeholder="Draft your refined prompt here..."
                className="w-full font-mono text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!userSubmission.trim() || isEvaluating}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-xs ${
                userSubmission.trim() && !isEvaluating
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isEvaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>AI Tutor is Evaluating Submission...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit for AI Evaluation</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <p className="font-semibold text-xs uppercase">Evaluation Notice</p>
                <p className="mt-0.5 text-xs">{error}</p>
              </div>
            </div>
          )}

          {/* Evaluation Results Card */}
          {evaluation && (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 space-y-5 animate-in fade-in duration-200">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                      evaluation.passed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {evaluation.score}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {evaluation.passed ? 'Challenge Passed!' : 'Needs Improvement'}
                      </h4>
                      <span
                        className={`px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase ${
                          evaluation.passed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {evaluation.passed ? 'PASSED' : 'TRY AGAIN'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Score: {evaluation.score} / {evaluation.maxScore} (Passing grade: 70)
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onTestPromptInChat(userSubmission)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Test in Chat</span>
                </button>
              </div>

              {/* Constructive Feedback */}
              <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold block mb-1 text-slate-900 dark:text-slate-100">
                  Tutor Assessment:
                </span>
                <p>{evaluation.feedback}</p>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300 block mb-1">
                    ✓ Key Strengths
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-500">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <span className="font-semibold text-amber-700 dark:text-amber-300 block mb-1">
                    ⚡ Areas for Improvement
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                    {evaluation.areasForImprovement.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-amber-500">•</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Exemplar Benchmark Prompt */}
              {evaluation.suggestedAnswer && (
                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Benchmark Exemplar Prompt:
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {evaluation.suggestedAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
