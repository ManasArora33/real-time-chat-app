import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, Loader2, MessageCircle, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/chat'); 
    } catch (err) {
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center p-4 transition-colors duration-200">
      {/* Dynamic Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative">
        {/* Back to Home */}
        <div className="mb-8 flex justify-center">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-[var(--text-main)] transition-colors text-xs font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>

        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-4">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tight uppercase italic">NexChat</h1>
          <p className="text-[var(--text-muted)] mt-1 font-medium">Welcome back to the workspace.</p>
        </div>

        {/* Login Card */}
        <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-[32px] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-xs font-bold uppercase tracking-wide">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--bg-main)]/30 border border-[var(--glass-border)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--bg-main)]/30 border border-[var(--glass-border)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-tr from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span className="uppercase tracking-widest text-sm">Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-[var(--glass-border)] text-center">
            <p className="text-[var(--text-muted)] text-sm font-medium">
              New to NexChat?{' '}
              <Link to="/register" className="text-indigo-500 hover:text-indigo-400 font-bold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
