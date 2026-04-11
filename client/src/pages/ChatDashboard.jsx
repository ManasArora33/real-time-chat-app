import { useState } from 'react';
import { MessageCircle, Menu } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useEffect } from 'react';
// Import our modular components
import Sidebar from '../components/chat/Sidebar';
import MessageHeader from '../components/chat/MessageHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

/**
 * ChatDashboard Component
 * Instant version - all animation overhead removed for maximum responsiveness.
 */
const ChatDashboard = () => {
  const { selectedChat } = useChat();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  // Auto-close sidebar on mobile when a chat is selected
  useEffect(() => {
    if (selectedChat && window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }, [selectedChat]);

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-hidden font-inter transition-colors duration-200">
      
      {/* SIDEBAR */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden w-full">
        {selectedChat ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <MessageHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <MessageList />
            <MessageInput />
          </div>
        ) : (
          /* Professional Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 relative overflow-hidden bg-[var(--bg-main)]">
            {/* Mobile Header for Empty State */}
            <div className="md:hidden absolute top-0 left-0 right-0 h-20 border-b border-[var(--glass-border)] flex items-center px-6 bg-[var(--glass-bg)] backdrop-blur-xl">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2.5 bg-[var(--glass-bg)] hover:bg-[var(--glass-border)] rounded-xl border border-[var(--glass-border)] transition-colors"
              >
                <Menu size={20} className="text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-[24px] md:rounded-[28px] flex items-center justify-center shadow-2xl mb-8 md:mb-10 relative z-10">
              <MessageCircle className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>

            <div className="max-w-md z-10 px-4">
              <h1 className="text-2xl md:text-3xl font-black mb-3 text-[var(--text-main)]">Welcome to NexChat</h1>
              <p className="text-[var(--text-muted)] text-sm md:text-base font-medium leading-relaxed">
                Select a contact from the menu to begin collaborating in real-time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;
