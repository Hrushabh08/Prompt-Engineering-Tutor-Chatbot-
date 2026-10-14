import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Star,
  Copy,
  Check,
  MessageSquare,
  Plus,
  Trash2,
  Tag,
  Filter,
  Code,
  ArrowUpRight
} from 'lucide-react';
import { CURATED_PROMPTS } from '../../data/promptLibrary';
import { PromptTemplate } from '../../types';
import { Modal } from '../common/Modal';

interface PromptLibraryViewProps {
  favoriteIds: string[];
  customPrompts: PromptTemplate[];
  onToggleFavorite: (id: string) => void;
  onSaveCustomPrompt: (prompt: PromptTemplate) => void;
  onDeleteCustomPrompt: (id: string) => void;
  onUseInChat: (prompt: string) => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const CATEGORIES = [
  'All',
  'Favorites',
  'Custom',
  'Coding',
  'Learning',
  'Writing',
  'Business',
  'Data Analysis',
  'Research',
  'Productivity',
  'Image Generation'
];

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({
  favoriteIds,
  customPrompts,
  onToggleFavorite,
  onSaveCustomPrompt,
  onDeleteCustomPrompt,
  onUseInChat,
  onNotify
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Custom prompt modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Coding');
  const [newDescription, setNewDescription] = useState('');
  const [newPrompt, setNewPrompt] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [newTags, setNewTags] = useState('');

  // Full view prompt modal
  const [viewingPrompt, setViewingPrompt] = useState<PromptTemplate | null>(null);

  // Combine curated and custom prompts
  const allPrompts: PromptTemplate[] = [
    ...customPrompts.map(p => ({ ...p, isCustom: true })),
    ...CURATED_PROMPTS
  ];

  // Filtering logic
  const filteredPrompts = allPrompts.filter(p => {
    const isFav = favoriteIds.includes(p.id);

    // Category filter
    if (selectedCategory === 'Favorites' && !isFav) return false;
    if (selectedCategory === 'Custom' && !p.isCustom) return false;
    if (
      selectedCategory !== 'All' &&
      selectedCategory !== 'Favorites' &&
      selectedCategory !== 'Custom' &&
      p.category !== selectedCategory
    ) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchPrompt = p.prompt.toLowerCase().includes(q);
      const matchTags = p.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchPrompt || matchTags;
    }

    return true;
  });

  const handleCopy = (promptText: string, id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    onNotify('Prompt copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrompt.trim()) return;

    const tagsArray = newTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const customPrompt: PromptTemplate = {
      id: `custom-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      description: newDescription.trim() || 'Custom user prompt template',
      prompt: newPrompt.trim(),
      difficulty: newDifficulty,
      tags: tagsArray.length > 0 ? tagsArray : ['custom'],
      isCustom: true
    };

    onSaveCustomPrompt(customPrompt);
    setIsModalOpen(false);

    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewPrompt('');
    setNewTags('');
    onNotify('Custom prompt saved successfully!', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 dark:bg-slate-950/40">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Prompt Library
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Curated, high-performance prompt architectures across 8 domains, plus your custom saved templates.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Prompt</span>
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search prompts by title, keywords, or tags (e.g. 'code-review', 'feynman', 'sql')..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {CATEGORIES.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'Favorites' && <Star className="w-3 h-3 inline mr-1 fill-current" />}
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompts Grid */}
        {filteredPrompts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 space-y-2">
            <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              No matching prompts found
            </p>
            <p className="text-xs">
              Try adjusting your search query or switching categories.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(p => {
              const isFav = favoriteIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  onClick={() => setViewingPrompt(p)}
                  className="group flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {p.category}
                        </span>
                        {p.isCustom && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Custom
                          </span>
                        )}
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onToggleFavorite(p.id);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Tags */}
                    {p.tags && p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Action Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={e => handleCopy(p.prompt, p.id, e)}
                      className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600 font-medium"
                    >
                      {copiedId === p.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      {p.isCustom && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteCustomPrompt(p.id);
                            onNotify('Custom prompt deleted.', 'info');
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded"
                          title="Delete custom prompt"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onUseInChat(p.prompt);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100"
                      >
                        <span>Use</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Prompt Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Custom Prompt Template"
      >
        <form onSubmit={handleSaveCustom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Prompt Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="e.g. Production React Component Generator"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
              >
                {CATEGORIES.filter(c => c !== 'All' && c !== 'Favorites' && c !== 'Custom').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={newDifficulty}
                onChange={e => setNewDifficulty(e.target.value as any)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description
            </label>
            <input
              type="text"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="e.g. Enforces clean types and unit tests"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Prompt Template <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              value={newPrompt}
              onChange={e => setNewPrompt(e.target.value)}
              placeholder="Write your prompt with placeholders like [INSERT_CODE_HERE]..."
              className="w-full font-mono text-xs px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={newTags}
              onChange={e => setNewTags(e.target.value)}
              placeholder="react, typescript, frontend"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
            >
              Save to Library
            </button>
          </div>
        </form>
      </Modal>

      {/* View Full Prompt Modal */}
      {viewingPrompt && (
        <Modal
          isOpen={Boolean(viewingPrompt)}
          onClose={() => setViewingPrompt(null)}
          title={viewingPrompt.title}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded uppercase font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {viewingPrompt.category}
              </span>
              <span className="font-mono text-slate-400">
                Level: {viewingPrompt.difficulty}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              {viewingPrompt.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-900 text-slate-100 max-h-96 overflow-y-auto">
              <pre className="font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {viewingPrompt.prompt}
              </pre>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleCopy(viewingPrompt.prompt, viewingPrompt.id)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Prompt</span>
              </button>

              <button
                onClick={() => {
                  onUseInChat(viewingPrompt.prompt);
                  setViewingPrompt(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open in Chat</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
