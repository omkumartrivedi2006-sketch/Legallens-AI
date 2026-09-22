import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  X,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { ChatConversation } from '../../types/chat';
import { Button } from '../ui/Button';

interface ConversationSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  isLoading: boolean;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => Promise<void>;
}

export const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  conversations,
  activeConversationId,
  isLoading,
  isOpenMobile,
  onCloseMobile,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
}) => {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await onDeleteConversation(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays}d ago`;
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-50/70 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 w-72 shrink-0">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Conversations
        </h3>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close conversations menu"
          className="lg:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            onNewConversation();
            onCloseMobile();
          }}
          className="w-full justify-center bg-white dark:bg-slate-800 shadow-sm text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-blue-600" />
            Loading chats...
          </div>
        ) : conversations.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 px-4">
            <MessageSquare className="h-6 w-6 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="font-medium text-slate-600 dark:text-slate-300">No conversations yet</p>
            <p className="mt-1 text-[11px]">Ask a question to start your first session with this document.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                className={`group relative flex items-center justify-between gap-2 p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 font-medium border border-blue-200/80 dark:border-blue-900/60 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onCloseMobile();
                }}
              >
                <div className="min-w-0 flex-1 pr-1">
                  <p className="truncate text-xs font-medium leading-snug">{conv.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {formatTime(conv.updatedAt)}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Delete conversation"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteId(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 max-w-xs w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Delete Conversation?
              </h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              This will permanently remove this chat history and its source references.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={confirmDelete}
                isLoading={isDeleting}
                className="text-xs bg-rose-600 text-white hover:bg-rose-700 hover:text-white border-transparent"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-full">{content}</aside>

      {/* Mobile Slide-Over Overlay */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full z-50 shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
