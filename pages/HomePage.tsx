import React, { useState } from 'react';
import { SparklesIcon, ChevronRightIcon } from '../components/icons';
import Dashboard from '../components/Dashboard';
import ImageUploader from '../components/ImageUploader';

interface HomePageProps {
  username: string;
  apiKey: string;
  onLaunch: () => void;
  onLogout: () => void;
}

export type HomePageView = 'welcome' | 'uploader';

const WelcomeView: React.FC<{ onLaunch: () => void }> = ({ onLaunch }) => (
  <div className="max-w-3xl">
    <SparklesIcon className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
      Drishyam
    </h1>
    <p className="text-lg md:text-xl text-gray-300 mb-10">
      Your camera becomes your eyes. Get instant, real-time descriptions of your surroundings.
    </p>
    <button
      onClick={onLaunch}
      className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 px-10 rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-cyan-500/20 inline-flex items-center space-x-3"
    >
      <span>Start Narrating</span>
      <ChevronRightIcon className="w-6 h-6" />
    </button>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ username, apiKey, onLaunch, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<HomePageView>('welcome');

  return (
    <div className="w-screen h-screen flex bg-gray-800">
      <Dashboard
        username={username}
        onLaunch={onLaunch}
        onLogout={onLogout}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center text-white relative overflow-y-auto">
        {activeView === 'welcome' && <WelcomeView onLaunch={onLaunch} />}
        {activeView === 'uploader' && <ImageUploader apiKey={apiKey} />}
      </main>
    </div>
  );
};

export default HomePage;