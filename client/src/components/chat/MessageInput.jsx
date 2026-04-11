import React, { useState, memo } from 'react';
import { Send, Smile, Paperclip } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * MessageInput Component
 * Instant performance version - no animations.
 */
const MessageInput = memo(() => {
  const [text, setText] = useState('');
  const { handleSendMessage, handleTyping } = useChat();

  const onSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    handleSendMessage(text);
    setText('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="p-3 md:p-6 bg-[var(--bg-main)]">
      <form onSubmit={onSubmit} className="w-full max-w-4xl mx-auto flex items-end gap-2 md:gap-3 relative z-10">
        
        {/* Attachment & Tools */}
        <div className="flex shrink-0 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl p-1 mb-0.5 shadow-sm">
           <button 
             type="button" 
             className="p-2.5 text-[var(--text-muted)] hover:text-indigo-500 transition-colors rounded-xl outline-none"
           >
             <Paperclip size={20} />
           </button>
        </div>

        {/* Input Bar */}
        <div className={cn(
          "flex-1 min-w-0 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[24px] p-2 flex items-end gap-1 md:gap-2 transition-colors duration-200 shadow-sm",
          "focus-within:border-indigo-500/30 focus-within:ring-2 focus-within:ring-indigo-500/10"
        )}>
          <button 
             type="button" 
             className="p-2.5 text-[var(--text-muted)] hover:text-yellow-500 transition-colors outline-none"
          >
            <Smile size={20} />
          </button>
          
          <textarea
            rows={1}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            onKeyDown={onKeyDown}
            placeholder="Write a message..."
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-[var(--text-main)] py-3 px-1 resize-none max-h-32 text-[14.5px] font-medium placeholder:text-[var(--text-muted)]"
          />
        </div>
        
        <button
          type="submit"
          disabled={!text.trim()}
          className={cn(
            "h-[48px] w-[48px] md:h-[56px] md:w-[56px] flex items-center justify-center rounded-[20px] md:rounded-[24px] transition-all flex-shrink-0 relative overflow-hidden group shadow-lg outline-none",
            text.trim() 
              ? "bg-gradient-to-tr from-indigo-600 to-blue-600 text-white" 
              : "bg-[var(--glass-bg)] text-[var(--text-muted)] border border-[var(--glass-border)] opacity-40"
          )}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
});

export default MessageInput;
