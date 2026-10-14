import React, { useState } from 'react';
import {
  MessageSquare,
  Wand2,
  Sparkles,
  GraduationCap,
  Target,
  BookOpen,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Bot,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { NavigationTab, Conversation } from '../../types';
import { Modal } from '../common/Modal';

interface SidebarProps {
  currentTab: NavigationTab;
  onNavigate: (tab: NavigationTab) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  completedLessonsCount: number;
  totalLessonsCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onNavigate,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  completedLessonsCount,
  totalLessonsCount,
  isOpen,
  onClose
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const requestDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      onDeleteConversation(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const navItems = [
    {
      id: 'chat' as NavigationTab,
      label: 'AI Tutor Chat',
      icon: MessageSquare
    },
    {
      id: 'improve' as NavigationTab,
      label: 'Improve My Prompt',
      icon: Wand2
    },
    {
      id: 'generate' as NavigationTab,
      label: 'Prompt Generator',
      icon: Sparkles
    },
    {
      id: 'learn' as NavigationTab,
      label: 'Learn Prompting',
      icon: GraduationCap,
      badge: `${completedLessonsCount}/${totalLessonsCount}`
    },
    {
      id: 'practice' as NavigationTab,
      label: 'Practice & Challenges',
      icon: Target
    },
    {
      id: 'library' as NavigationTab,
      label: 'Prompt Library',
      icon: BookOpen
    },
    {
      id: 'settings' as NavigationTab,
      label: 'Settings & Status',
      icon: Settings
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 md:z-20 h-screen w-72 flex flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                PromptCraft AI
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Prompt Engineering Tutor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary New Chat CTA */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Core Navigation */}
        <div className="px-3 py-1 space-y-0.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100/70 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col min-h-0 px-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60 mt-3">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Recent Chats ({conversations.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <p>No chat history yet.</p>
                <p className="mt-1 text-[11px]">Conversations will be saved automatically.</p>
              </div>
            ) : (
              conversations.map(conv => {
                const isActive = activeConversationId === conv.id && currentTab === 'chat';
                const isEditing = editingId === conv.id;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectConversation(conv.id);
                        onClose();
                      }
                    }}
                    className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-800 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={e => setEditTitle(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') saveRename(conv.id, e);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="w-full px-1 py-0.5 text-xs bg-white dark:bg-slate-800 border border-blue-400 rounded outline-none"
                          autoFocus
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="truncate">{conv.title}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-1">
                      {isEditing ? (
                        <>
                          <button
                            onClick={e => saveRename(conv.id, e)}
                            className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelRename}
                            className="p-1 hover:text-rose-600 dark:hover:text-rose-400"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                          <button
                            onClick={e => startRename(conv, e)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                            title="Rename"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={e => requestDelete(conv.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" /> Local Persistence
          </span>
          <span>v1.0</span>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        title="Delete Conversation"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this conversation? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};
