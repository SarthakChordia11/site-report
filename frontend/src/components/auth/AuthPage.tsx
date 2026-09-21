import React, { useState } from 'react';
import { Building2, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { authApi, authHelpers } from '../../services/api';

interface AuthPageProps {
  onAuthSuccess: (user: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await authApi.login(loginEmail, loginPassword);
      authHelpers.saveSession(res.access_token, res.user);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.register({ name: regName, email: regEmail, password: regPassword });
      authHelpers.saveSession(res.access_token, res.user);
      onAuthSuccess(res.user);
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Email might already be in use.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6A00]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FF6A00]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF6A00]/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#FF6A00] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-[#FF6A00]/30">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">SiteReport<span className="text-[#FF6A00]">AI</span></h1>
          <p className="text-[#737373] text-sm mt-1">AI-Powered Construction Site Management</p>
        </div>

        {/* Card */}
        <div className="bg-[#141414] border border-[#262626] rounded-2xl overflow-hidden shadow-2xl">
          {/* Tab bar */}
          <div className="flex border-b border-[#262626]">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer ${
                tab === 'login'
                  ? 'text-white border-b-2 border-[#FF6A00] bg-[#1A1A1A]'
                  : 'text-[#737373] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`flex-1 py-4 text-sm font-bold transition-colors cursor-pointer ${
                tab === 'register'
                  ? 'text-white border-b-2 border-[#FF6A00] bg-[#1A1A1A]'
                  : 'text-[#737373] hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-[#0E0E0E] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FF6A00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#0E0E0E] border border-[#333333] rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FF6A00] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF6A00] hover:bg-[#E65F00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6A00]/20 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                    <input
                      type="text"
                      value={regName}
                      onChange={e => setRegName(e.target.value)}
                      required
                      placeholder="Darshan Girase"
                      className="w-full bg-[#0E0E0E] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FF6A00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full bg-[#0E0E0E] border border-[#333333] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FF6A00] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A3A3A3] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder="At least 8 characters"
                      className="w-full bg-[#0E0E0E] border border-[#333333] rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#525252] focus:outline-none focus:border-[#FF6A00] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF6A00] hover:bg-[#E65F00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#FF6A00]/20 cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Features pills */}
            <div className="mt-6 pt-5 border-t border-[#262626] flex flex-wrap gap-2 justify-center">
              {['AI Voice Reports', 'Real-time Sync', 'Multi-site'].map(f => (
                <span key={f} className="flex items-center gap-1 px-2.5 py-1 bg-[#1A1A1A] border border-[#333333] rounded-full text-[10px] text-[#A3A3A3] font-medium">
                  <Sparkles className="w-2.5 h-2.5 text-[#FF6A00]" />
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
