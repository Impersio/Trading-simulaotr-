import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, LogIn, Mail } from 'lucide-react';

export const SignIn: React.FC = () => {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-500/20 p-4 rounded-full">
            <Activity className="w-12 h-12 text-blue-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">TradeSim</h1>
        <p className="text-gray-400 mb-8">
          Start with $1,000. Trade US stocks. Reach $1,000,000.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Mail className="w-5 h-5" />
            {loading ? 'Processing...' : isSignUp ? 'Sign Up with Email' : 'Sign In with Email'}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">Or continue with</span>
          </div>
        </div>

        <button
          onClick={signIn}
          type="button"
          className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors mb-4"
        >
          <LogIn className="w-5 h-5" />
          Google
        </button>

        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        
        <p className="mt-6 text-xs text-gray-500">
          Your portfolio and progress will be securely saved.
        </p>
      </div>
    </div>
  );
};
