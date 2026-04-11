import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Shield, 
  Zap, 
  ArrowRight, 
  MessageSquare, 
  Lock,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * NEXCHAT PROFESSIONAL MINIMALIST REDESIGN
 * Focused on Clarity, Space, and Real-time messaging utility.
 */

const ChatPreview = () => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'partner', content: 'Did you see the new NexChat design?', time: '2:14 PM' },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout1, timeout2, timeout3, timeout4;
    
    const runSequence = () => {
      // Message 2
      timeout1 = setTimeout(() => {
        setIsTyping(true);
        timeout2 = setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => {
            if (prev.length >= 2) return prev;
            return [...prev, { id: 2, role: 'me', content: "It's surgical. Zero latency.", time: '2:15 PM' }];
          });
          
          // Message 3
          timeout3 = setTimeout(() => {
            setIsTyping(true);
            timeout4 = setTimeout(() => {
              setIsTyping(false);
              setMessages(prev => {
                if (prev.length >= 3) return prev;
                return [...prev, { id: 3, role: 'partner', content: "Exactly. This is how chat should feel.", time: '2:16 PM' }];
              });
            }, 1500);
          }, 2000);
        }, 1200);
      }, 2000);
    };

    runSequence();
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
      clearTimeout(timeout4);
    };
  }, []);

  return (
    <div className="w-full max-w-[440px] glass-card rounded-[32px] overflow-hidden shadow-2xl relative border border-white/5">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">S</div>
          <div>
            <p className="text-sm font-bold text-white">Sarah W.</p>
            <p className="text-[10px] uppercase tracking-widest text-blue-400 font-black">Online</p>
          </div>
        </div>
        <Lock size={14} className="text-white/20" />
      </div>

      <div className="h-[340px] p-6 space-y-4 overflow-y-auto custom-scrollbar flex flex-col bg-[#080a0f]">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col ${msg.role === 'me' ? 'items-end' : 'items-start'}`}
          >
            <div className={`p-4 rounded-2xl text-[13px] max-w-[85%] font-medium ${
              msg.role === 'me' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
            <span className="mt-1.5 text-[9px] font-bold text-slate-600 uppercase tracking-tighter">{msg.time}</span>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex gap-1.5 p-3 px-4 rounded-2xl bg-white/5 w-fit">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0s]" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        )}
      </div>
      
      <div className="p-4 bg-black/20 border-t border-white/5 flex gap-3">
        <div className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-xs text-slate-500">Message...</div>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white"><ArrowRight size={18} /></div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] overflow-x-hidden selection:bg-blue-500/30">
      
      {/* PROFESSIONAL LAYER: CLEAN AMBIANCE */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/5 rounded-full blur-[140px]" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[140px]" />

      {/* CLEAN NAVIGATION: PURGED FLUFF */}
      <nav className="relative z-50 flex items-center justify-between px-10 py-6 max-w-[1280px] mx-auto">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight font-manrope">NexChat</span>
        </div>
        
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/login" className="hidden sm:block text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest">Sign In</Link>
          <Link to="/register" className="bg-white text-black px-5 md:px-6 py-2 md:py-2.5 rounded-xl font-bold text-[10px] md:text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl">
            Join
          </Link>
        </div>
      </nav>

      {/* HERO SECTION: NO OVERLAPS, PURE BREATHING ROOM */}
      <main className="relative z-10 pt-12 md:pt-16 pb-24 md:pb-32 px-6 md:px-10 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] font-manrope mb-6 md:mb-8">
                Real-time <br className="hidden md:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">messaging.</span> <br />
                Redefined.
              </h1>
              <p className="text-lg md:text-xl text-slate-400 max-w-xl mx-auto lg:mx-0 mb-8 md:mb-12 font-medium leading-[1.6]">
                Experience high-fidelity one-to-one communication built on speed, precision, and privacy. No-distraction messaging for the modern professional.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
                <Link to="/register" className="w-full sm:w-auto bg-blue-600 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-bold text-xs md:text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 group shadow-2xl shadow-blue-500/20">
                  Try NexChat Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <div className="flex items-center gap-3 text-slate-600 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live Status Stable
                </div>
              </div>
            </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-center w-full max-w-[480px] mx-auto lg:max-w-none"
          >
            <ChatPreview />
          </motion.div>
        </div>

        {/* FEATURE GRID: RELEVANT & CLEAN */}
        <section className="mt-32 md:mt-40 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          
          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(59, 130, 246, 0.3)" }}
            className="p-10 rounded-[40px] bg-white/[0.01] border border-white/[0.05] transition-colors relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Zap className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold font-manrope relative z-10">Instant Delivery</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium relative z-10">Socket-powered messaging with zero latency. No delay, no overhead, just speed.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(99, 102, 241, 0.3)" }}
            className="p-10 rounded-[40px] bg-white/[0.01] border border-white/[0.05] transition-colors relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <Shield className="w-7 h-7 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold font-manrope relative z-10">Private Sync</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium relative z-10">Focused one-to-one architecture that respects your privacy and connection status.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, borderColor: "rgba(6, 182, 212, 0.3)" }}
            className="p-8 md:p-10 rounded-[32px] md:rounded-[40px] bg-white/[0.01] border border-white/[0.05] transition-colors relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <MessageSquare className="w-7 h-7 text-cyan-500" />
            </div>
            <h3 className="text-2xl font-bold font-manrope relative z-10">Modern Core</h3>
            <p className="text-slate-500 text-sm leading-relaxed font-medium relative z-10">Clean, lightweight UI built with React and Tailwind for a snappy, responsive experience.</p>
          </motion.div>

        </section>
      </main>

      <footer className="relative z-10 py-24 px-10 border-t border-white/5 bg-[#030508]">
        <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center gap-12">
          
          <div className="flex items-center gap-3 opacity-80">
            <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <MessageCircle className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xl font-bold tracking-tighter uppercase font-manrope">NexChat</span>
          </div>

          <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">
             <Link to="/login" className="hover:text-blue-500 transition-colors">Privacy Policy</Link>
             <Link to="/register" className="hover:text-blue-500 transition-colors">Terms of Service</Link>
             <a href="#" className="hover:text-blue-400 transition-colors">Documentation</a>
          </div>

          <div className="space-y-4">
            <p className="text-slate-800 text-[10px] font-black uppercase tracking-[0.6em] opacity-60">
              &copy; 2026 NEXCHAT &bull; BUILT BY MANAS ARORA
            </p>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default Home;
