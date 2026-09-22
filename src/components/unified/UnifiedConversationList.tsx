import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Clock,
  Layers,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { UnifiedConversation } from '../../types/unified';
import { cn } from '../../lib/utils';

export interface UnifiedConversationListProps {
  conversations: UnifiedConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  className?: string;
}

export const UnifiedConversationList: React.FC<UnifiedConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  className,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      onDeleteConversation(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden',
        className
      )}
    >
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-xs text-slate-800 dark:text-slate-200">
          <MessageSquare className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          <span>Discussions ({conversations.length})</span>
        </div>

        <button
          type="button"
          onClick={onNewConversation}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-60 lg:max-h-80">
        {conversations.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <p>No saved discussions.</p>
            <p className="text-[11px] mt-0.5">Start by asking a question.</p>
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isConfirmingDelete = deleteConfirmId === conv.id;

            return (
              <div
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  setDeleteConfirmId(null);
                }}
                className={cn(
                  'group flex items-start justify-between gap-2 p-2.5 rounded-lg text-xs cursor-pointer select-none transition-colors border',
                  isActive
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-slate-900 dark:text-white'
                    : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-medium truncate" title={conv.title}>
                    {conv.title || 'Multi-Document Intelligence'}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <Layers className="h-2.5 w-2.5" />
                      {conv.selectedDocumentIds?.length || 0} docs
                    </span>
                    <span>•</span>
                    <span>{new Date(conv.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 pt-0.5">
                  {isConfirmingDelete ? (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white hover:bg-red-700"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-opacity rounded"
                      title="Delete discussion"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
