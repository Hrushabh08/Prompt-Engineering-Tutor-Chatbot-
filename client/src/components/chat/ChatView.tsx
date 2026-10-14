import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Sparkles,
  Wand2,
  GraduationCap,
  Target,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  X,
  Bot,
  User,
  ArrowRight,
  Code
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, HealthStatus, NavigationTab } from '../../types';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
  onRegenerate?: () => void;
  onNavigate: (tab: NavigationTab) => void;
  health: HealthStatus | null;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onStopGeneration,
  onRegenerate,
  onNavigate,
  health,
  onNotify
}) => {
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const content = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(content);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const starterCards = [
    {
      title: 'Learn Prompt Engineering',
      desc: 'Teach me prompt engineering from the basics.',
      icon: GraduationCap,
      action: () => onNavigate('learn')
    },
    {
      title: 'Improve My Prompt',
      desc: 'Help me make my existing prompt clearer and more effective.',
      icon: Wand2,
      action: () => onNavigate('improve')
    },
    {
      title: 'Generate a Professional Prompt',
      desc: 'Create a detailed prompt for my specific task.',
      icon: Sparkles,
      action: () => onNavigate('generate')
    },
    {
      title: 'Test My Knowledge',
      desc: 'Give me an interactive prompt engineering challenge.',
      icon: Target,
      action: () => onNavigate('practice')
    }
  ];

  const quickPills = [
    'Explain the RCTCO framework',
    'How do I eliminate hallucination in research prompts?',
    'Show me a Few-Shot vs Zero-Shot example',
    'How to enforce strict JSON schemas?'
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50 dark:bg-slate-950/40">
      {/* Scrollable conversation container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Welcome Screen */
          <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
            {/* Hero Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mb-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Master the Art of Prompt Engineering
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
                Learn to write better prompts, understand AI behavior, and turn your ideas into precise, powerful instructions.
              </p>
            </div>

            {/* 4 Interactive Suggestion Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {starterCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <button
                    key={i}
                    onClick={card.action}
                    className="flex items-start text-left p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all duration-150 group"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors mr-3 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {card.title}
                        </h4>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {card.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Starter Prompts */}
            <div className="pt-4">
              <div className="text-center mb-3">
                <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Suggested Questions
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPills.map((pill, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(pill);
                      textareaRef.current?.focus();
                    }}
                    className="px-3 py-1.5 text-xs rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-all text-left"
                  >
                    "{pill}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map(msg => {
              const isUser = msg.role === 'user';
              const isError = msg.isError;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs'
                        : isError
                        ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 rounded-bl-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {isError && (
                          <div className="flex items-center gap-2 font-semibold text-rose-700 dark:text-rose-300 text-xs mb-1">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>AI Service Notice</span>
                          </div>
                        )}

                        <div className="prose-custom break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const codeText = String(children).replace(/\n$/, '');
                                const isCodeBlock = !inline;

                                if (isCodeBlock) {
                                  return (
                                    <div className="relative my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100">
                                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-[11px] font-mono text-slate-400 border-b border-slate-700">
                                        <div className="flex items-center gap-1.5">
                                          <Code className="w-3.5 h-3.5 text-blue-400" />
                                          <span>Code / Prompt</span>
                                        </div>
                                        <button
                                          onClick={() => copyToClipboard(codeText, `code-${codeText.slice(0, 10)}`)}
                                          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
                                          title="Copy Code"
                                        >
                                          {copiedId === `code-${codeText.slice(0, 10)}` ? (
                                            <>
                                              <Check className="w-3 h-3 text-emerald-400" />
                                              <span className="text-emerald-400">Copied</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy Prompt</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                      <pre className="p-3.5 overflow-x-auto text-xs font-mono leading-relaxed text-slate-200">
                                        <code>{children}</code>
                                      </pre>
                                    </div>
                                  );
                                }
                                return (
                                  <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[13px] text-blue-600 dark:text-blue-400" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {/* Action buttons under AI response */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(msg.content, msg.id)}
                              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-emerald-500 text-[11px]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="text-[11px]">Copy Response</span>
                                </>
                              )}
                            </button>

                            {onRegenerate && (
                              <button
                                onClick={onRegenerate}
                                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                title="Regenerate this response"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="text-[11px]">Regenerate</span>
                              </button>
                            )}
                          </div>

                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Subtle Typing Indicator during generation */}
            {isLoading && (
              <div className="flex gap-3.5 justify-start">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5 py-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-xs text-slate-400 ml-2">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Composer Area */}
      <div className="p-3 md:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-2">
          <div className="relative rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a prompt engineering question or paste a prompt to analyze... (Shift+Enter for newline)"
              className="w-full resize-none px-4 py-3 text-sm bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 max-h-48"
              disabled={isLoading}
            />

            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="flex items-center gap-2">
                {input.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInput('');
                      if (textareaRef.current) textareaRef.current.style.height = 'auto';
                    }}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs flex items-center gap-0.5"
                    title="Clear input"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
                <span className="text-[11px] font-mono text-slate-400">
                  {input.length} / 4000
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isLoading ? (
                  <button
                    type="button"
                    onClick={onStopGeneration}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      input.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Send</span>
                    <Send className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3" />
              <span>
                Engine: {health?.provider?.toUpperCase() || 'AI'} ({health?.model || 'gpt-4o-mini'})
              </span>
            </span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
        </form>
      </div>
    </div>
  );
};
