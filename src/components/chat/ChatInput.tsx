import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  isLoading = false,
  placeholder = 'Ask something about this document (e.g., notice period, key obligations)...',
}) => {
  const [text, setText] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled || isLoading) return;
    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 sm:p-4 bg-white/75 dark:bg-[#080808]/80 backdrop-blur-md border-t border-slate-200/80 dark:border-white/10">
      <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-50/70 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/40 backdrop-blur-xs transition-all shadow-xs">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-none max-h-36 leading-relaxed"
        />

        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!text.trim() || disabled || isLoading}
          className="h-9 w-9 rounded-xl p-0 shrink-0 flex items-center justify-center shadow-xs"
          aria-label="Send question"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <Send className="h-4 w-4 text-white" />
          )}
        </Button>
      </div>
      <p className="text-[11px] text-slate-400 text-center mt-2 hidden sm:block">
        Press <kbd className="font-mono bg-slate-200/60 dark:bg-white/10 px-1 py-0.5 rounded text-[10px] border border-slate-200/60 dark:border-white/5">Enter</kbd> to send, <kbd className="font-mono bg-slate-200/60 dark:bg-white/10 px-1 py-0.5 rounded text-[10px] border border-slate-200/60 dark:border-white/5">Shift + Enter</kbd> for a new line
      </p>
    </div>
  );
};
