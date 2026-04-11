import React from 'react';
import { Search, User as UserIcon, LogOut, MessageSquare, Compass, X } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Sidebar Component
 * Optimized for instant performance by removing all JS animation overhead.
 */
const Sidebar = React.memo(({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth();
  const {
    chats,
    selectedChat,
    onlineUsers,
    searchTerm,
    setSearchTerm,
    globalSearchResults,
    isSearchLoading,
    selectConversation,
    handleSelectUser
  } = useChat();

  const isSearching = searchTerm.trim().length > 0;

  const getChatPartner = (chat) => {
    if (!chat || !chat.participants) return null;
    return chat.participants.find(u => u._id !== user?._id);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div 
        className={cn(
          "fixed md:relative h-full flex flex-col z-50 md:z-40 overflow-hidden whitespace-nowrap border-r shadow-2xl transition-all duration-300 ease-in-out",
          "bg-[var(--bg-sidebar)] border-[var(--glass-border)] backdrop-blur-3xl",
          isSidebarOpen 
            ? "w-[280px] md:w-[320px] translate-x-0" 
            : "w-0 md:w-0 -translate-x-full md:translate-x-0"
        )}
      >
        {/* User Header */}
        <div className="p-6 border-b border-[var(--glass-border)] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center font-bold text-white shadow-lg">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <h3 className="font-bold text-[var(--text-main)] truncate text-lg tracking-tight">{user?.username}</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Online</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-[var(--text-muted)] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

      {/* Global Search Interface */}
      <div className="p-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search people..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-2xl py-3 pl-11 pr-4 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 outline-none"
          />
        </div>
      </div>

      {/* Dynamic List Section */}
      <div className="flex-1 overflow-y-auto px-3 space-y-4 py-2 custom-scrollbar">
        {!isSearching ? (
          <div className="space-y-1">
            <div className="px-3 py-1 flex items-center gap-2 mb-2">
              <MessageSquare size={14} className="text-[var(--text-muted)]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-black">History</span>
            </div>
            
            {chats.length === 0 ? (
              <div className="px-6 py-12 text-center text-xs text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-3xl border border-dashed border-[var(--glass-border)] mx-2">
                No conversations yet.
              </div>
            ) : (
              chats.map((chat) => {
                const partner = getChatPartner(chat);
                if (!partner) return null;
                const isActive = selectedChat?._id === chat._id;
                
                return (
                  <button
                    key={chat._id}
                    onClick={() => selectConversation(chat)}
                    className={cn(
                      "w-full flex items-center gap-3.5 p-3 rounded-2xl transition-all relative group",
                      isActive 
                        ? "bg-indigo-500/10 border border-indigo-500/20" 
                        : "hover:bg-[var(--glass-bg)] text-[var(--text-muted)] border border-transparent"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                    )}
                    
                    <div className="relative">
                      <div className={cn(
                        "w-11 h-11 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] flex items-center justify-center shadow-inner",
                        isActive && "bg-indigo-500/20 border-indigo-500/40"
                      )}>
                        <UserIcon size={20} className={isActive ? "text-indigo-400" : "text-[var(--text-muted)]"} />
                      </div>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px] border-[var(--bg-main)]",
                        onlineUsers.has(partner._id) ? "bg-green-500" : "bg-slate-500"
                      )} />
                    </div>
                    
                    <div className="flex-1 text-left overflow-hidden">
                      <p className={cn(
                        "font-bold text-[14px] leading-none mb-1",
                        isActive ? "text-[var(--text-main)]" : "text-[var(--text-main)] group-hover:text-indigo-500"
                      )}>
                        {partner.username}
                      </p>
                      <p className={cn(
                        "text-[11px] font-medium truncate",
                        onlineUsers.has(partner._id) ? "text-green-600" : "text-[var(--text-muted)]"
                      )}>
                        {onlineUsers.has(partner._id) ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="px-3 py-1 flex items-center gap-2 mb-1">
              <Compass size={14} className="text-indigo-500" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black">Search Results</span>
            </div>
            
            {globalSearchResults.map((u) => (
              <button
                key={u._id}
                onClick={() => handleSelectUser(u)}
                className="w-full flex items-center gap-4 p-4 rounded-3xl bg-[var(--glass-bg)] hover:bg-white/5 border border-[var(--glass-border)] transition-all group"
              >
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                  <UserIcon size={18} className="text-indigo-400" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-bold text-sm text-[var(--text-main)]">{u.username}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium truncate">{u.email}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-red-500/5 hover:bg-red-500/10 text-red-500 transition-all font-bold text-[12px] uppercase tracking-widest border border-red-500/10"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>
      </div>
    </>
  );
});

export default Sidebar;
