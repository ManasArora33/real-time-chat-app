import React from 'react';
import { 
  User as UserIcon, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Menu,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * MessageHeader Component
 * Instant performance version - all animations removed.
 */
const MessageHeader = React.memo(({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const {
    selectedChat,
    onlineUsers,
    typingUser,
    isSearchOpen,
    setIsSearchOpen,
    localSearchQuery,
    setLocalSearchQuery,
    searchResults,
    setSearchResults,
    currentSearchIndex,
    setCurrentSearchIndex,
    handleMessageSearch,
    nextMatch,
    prevMatch
  } = useChat();

  const getChatPartner = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(u => u._id !== user?._id);
  };

  const partner = getChatPartner(selectedChat);
  const isOnline = onlineUsers.has(partner?._id);

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchResults([]);
      setLocalSearchQuery('');
      setCurrentSearchIndex(-1);
    }
  };

  return (
    <div className="relative z-30">
      {/* Primary Header */}
      <div className="h-20 border-b border-[var(--glass-border)] flex items-center justify-between px-6 bg-[var(--glass-bg)] backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-xl border border-indigo-500/20 transition-colors outline-none"
          >
            <Menu size={20} className="text-indigo-500" />
          </button>

          {/* Identity Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 flex items-center justify-center">
                <UserIcon size={20} className="text-indigo-500" />
              </div>
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-main)]",
                isOnline ? "bg-green-500" : "bg-slate-500"
              )} />
            </div>
            
            <div>
              <h2 className="font-bold text-[var(--text-main)] text-[15px] leading-tight flex items-center gap-2">
                {partner?.username}
                <Info size={14} className="opacity-20 hover:opacity-100 cursor-pointer transition-opacity text-[var(--text-main)]" />
              </h2>
              <div className="flex items-center h-4 mt-0.5">
                {typingUser ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest animate-pulse">
                      Typing...
                    </span>
                  </div>
                ) : (
                  <span className={cn(
                    "text-[11px] font-medium transition-colors",
                    isOnline ? "text-green-500" : "text-[var(--text-muted)]"
                  )}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] rounded-xl border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button
            onClick={toggleSearch}
            className={cn(
              "p-2.5 rounded-xl border transition-colors outline-none",
              isSearchOpen 
                ? "bg-indigo-600 border-indigo-500 text-white" 
                : "bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] border-[var(--glass-border)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            )}
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Secondary Search Bar */}
      {isSearchOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[var(--glass-bg)] backdrop-blur-2xl border-b border-[var(--glass-border)] shadow-2xl">
          <div className="max-w-4xl mx-auto p-4 px-6 flex items-center justify-between">
            <form onSubmit={handleMessageSearch} className="flex-1 flex items-center gap-4 bg-[var(--bg-main)]/10 rounded-2xl px-5 py-2.5 border border-[var(--glass-border)] focus-within:border-indigo-500/50 transition-colors outline-none">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                autoFocus
                type="text"
                placeholder="Search in conversation..."
                className="bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-sm w-full text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
              />
              
              {searchResults.length > 0 && (
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--glass-border)]">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest whitespace-nowrap">
                    {currentSearchIndex + 1} / {searchResults.length}
                  </span>
                  <div className="flex-center gap-1">
                    <button type="button" onClick={nextMatch} className="p-1.5 hover:bg-[var(--glass-border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                      <ChevronUp size={18} />
                    </button>
                    <button type="button" onClick={prevMatch} className="p-1.5 hover:bg-[var(--glass-border)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                      <ChevronDown size={18} />
                    </button>
                  </div>
                </div>
              )}
              
              <button type="button" onClick={toggleSearch} className="ml-2 p-1 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                <X size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default MessageHeader;
