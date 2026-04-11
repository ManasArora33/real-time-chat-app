import { useEffect, useRef, memo } from 'react';
import { MessageCircle, Check, CheckCheck } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * StatusTick: Renders the read receipt indicator for sent messages.
 *  - sent      → single grey check
 *  - delivered → double grey checks
 *  - read      → double blue checks
 */
const StatusTick = ({ status }) => {
  if (status === 'read') {
    return <CheckCheck size={14} className="text-blue-400" />;
  }
  if (status === 'delivered') {
    return <CheckCheck size={14} className="text-[var(--text-muted)] opacity-60" />;
  }
  // 'sent' or undefined
  return <Check size={14} className="text-[var(--text-muted)] opacity-40" />;
};

/**
 * MessageList Component
 */
const MessageList = memo(() => {
  const { user } = useAuth();
  const { messages, searchResults, currentSearchIndex } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] space-y-6 relative overflow-hidden bg-[var(--bg-main)]">
        <div className="w-20 h-20 rounded-3xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center shadow-xl">
          <MessageCircle size={40} className="text-indigo-500/40" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.2em] text-[10px]">Start a conversation</p>
          <p className="text-[var(--text-muted)] opacity-60 text-xs">Your messages are private and secure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 md:space-y-8 relative custom-scrollbar bg-[var(--bg-main)]">
      <div className="space-y-8">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === user?._id || msg.senderId?._id === user?._id;
          const isCurrentMatch = currentSearchIndex >= 0 && searchResults[currentSearchIndex]?._id === msg._id;
          
          return (
            <div
              key={msg._id || i}
              id={`msg-${msg._id}`}
              className={cn("flex", isMine ? 'justify-end' : 'justify-start')}
            >
              <div className={cn(
                "relative max-w-[85%] md:max-w-[60%] flex flex-col",
                isMine ? 'items-end' : 'items-start'
              )}>
                <div 
                  className={cn(
                    "p-4 px-5 rounded-[24px] shadow-sm relative transition-shadow duration-200",
                    isCurrentMatch && "ring-4 ring-indigo-500/50 scale-105 z-20",
                    isMine
                      ? "bg-gradient-to-tr from-indigo-600 to-blue-600 text-white rounded-tr-none"
                      : "bg-[var(--glass-bg)] text-[var(--text-main)] border border-[var(--glass-border)] rounded-tl-none"
                  )}
                >
                  <p className="text-[14.5px] leading-relaxed font-medium select-text">
                    {msg.content}
                  </p>
                </div>

                <div className={cn(
                   "flex items-center gap-1.5 mt-2 px-1",
                   isMine ? "flex-row-reverse" : "flex-row"
                )}>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-tighter opacity-60">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {/* Only show ticks on messages sent by the current user */}
                  {isMine && <StatusTick status={msg.status} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
});

export default MessageList;
