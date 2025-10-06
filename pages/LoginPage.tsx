import React, { useState } from 'react';
import { UserIcon, KeyIcon, SparklesIcon } from '../components/icons';

interface LoginPageProps {
  onLogin: (username: string, apiKey: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); // This will hold the API key
  const [authAction, setAuthAction] = useState<'initial' | 'signin' | 'signup'>('initial');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username.trim(), password.trim());
    }
  };

  const isFormValid = username.trim() !== '' && password.trim() !== '';

  const renderInitialView = () => (
    <div className="text-center">
        <SparklesIcon className="w-14 h-14 text-cyan-400 mx-auto mb-5" />
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Drishyam</h1>
        <p className="text-gray-400 mt-2 mb-10">Your AI-powered visual assistant.</p>
        <div className="space-y-4">
            <button
                onClick={() => setAuthAction('signin')}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
                Sign In
            </button>
            <button
                onClick={() => setAuthAction('signup')}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
                Sign Up
            </button>
        </div>
    </div>
  );

  const renderAuthForm = () => {
    const isSigningUp = authAction === 'signup';
    return (
        <>
            <div className="text-center mb-10">
                <SparklesIcon className="w-14 h-14 text-cyan-400 mx-auto mb-5" />
                <h1 className="text-4xl font-bold tracking-tight">{isSigningUp ? 'Create Your Account' : 'Welcome Back'}</h1>
                <p className="text-gray-400 mt-2">{isSigningUp ? 'Get started with Drishyam.' : 'Sign in to continue to Drishyam.'}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="Username"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password-key" className="sr-only">
                  Gemini API Key
                </label>
                <div className="relative">
                  <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password-key"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                    placeholder="Gemini API Key"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                disabled={!isFormValid}
              >
                {isSigningUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
             <p className="text-xs text-gray-500 mt-4 text-center">
                You can get your Gemini API Key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google AI Studio</a>.
            </p>
             <button type="button" onClick={() => setAuthAction('initial')} className="text-sm text-cyan-400 hover:underline mt-6 text-center w-full bg-transparent border-none p-2 cursor-pointer">
                &larr; Back to selection
            </button>
        </>
    );
  };

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 font-sans">
      <div className="w-full max-w-sm">
        {authAction === 'initial' ? renderInitialView() : renderAuthForm()}
      </div>
    </main>
  );
};

export default LoginPage;