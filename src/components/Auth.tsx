import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { trackSignUp, trackLogin } from '../lib/analytics';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      setError(error.message);
    } else {
      if (isSignUp) {
        trackSignUp();
      } else {
        trackLogin();
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen galaxy-content flex flex-col items-center justify-center p-6">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-4 wave-text" style={{
            textShadow: '0 0 40px rgba(34, 211, 238, 0.5)',
            letterSpacing: '-0.05em'
          }}>
            {'NoCap'.split('').map((letter, index) => (
              <span key={index} className="wave-letter">{letter}</span>
            ))}
          </h1>
          <p className="text-cyan-300 text-base sm:text-lg md:text-xl font-bold px-4 drop-shadow-lg">Detect fake content instantly</p>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">
        {!isSignUp ? (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/30 p-6 space-y-4">
            <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-center mb-2">Welcome Back!</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border-2 border-red-400 rounded-2xl p-3 flex items-start gap-3 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 font-semibold">{error}</p>
                </div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-800/50 border border-cyan-500/30 rounded-2xl font-semibold text-white placeholder-cyan-300/50 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder="Email"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 bg-slate-800/50 border border-cyan-500/30 rounded-2xl font-semibold text-white placeholder-cyan-300/50 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder="Password"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-4 px-6 rounded-full text-lg shadow-lg shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Sign In'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="w-full text-center text-cyan-300 font-bold text-sm hover:text-cyan-200"
              >
                Don't have an account? Sign up
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/30 p-6 space-y-4">
            <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-center mb-2">Get Started!</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border-2 border-red-400 rounded-2xl p-3 flex items-start gap-3 backdrop-blur-sm">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300 font-semibold">{error}</p>
                </div>
              )}

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 bg-slate-800/50 border border-cyan-500/30 rounded-2xl font-semibold text-white placeholder-cyan-300/50 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder="Email"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-5 py-4 bg-slate-800/50 border border-cyan-500/30 rounded-2xl font-semibold text-white placeholder-cyan-300/50 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                placeholder="Password (6+ characters)"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-4 px-6 rounded-full text-lg shadow-lg shadow-cyan-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Sign Up'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="w-full text-center text-cyan-300 font-bold text-sm hover:text-cyan-200"
              >
                Already have an account? Sign in
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
