import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Activity, LogIn } from 'lucide-react';

export const SignIn: React.FC = () => {
  const { signIn } = useAuth();

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

        <button
          onClick={signIn}
          className="w-full bg-white hover:bg-gray-100 text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
        
        <p className="mt-6 text-xs text-gray-500">
          Your portfolio and progress will be securely saved.
        </p>
      </div>
    </div>
  );
};
