import React from 'react';
import { SparklesIcon, ChevronRightIcon, LogOutIcon, UserIcon, MenuIcon, HomeIcon, ImageIcon } from './icons';
import { HomePageView } from '../pages/HomePage';

interface DashboardProps {
  username: string;
  onLaunch: () => void;
  onLogout: () => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  activeView: HomePageView;
  setActiveView: (view: HomePageView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLaunch, onLogout, isMenuOpen, setIsMenuOpen, activeView, setActiveView }) => {
    
    const NavLink: React.FC<{
        view: HomePageView,
        label: string,
        icon: React.ReactNode,
    }> = ({ view, label, icon }) => {
        const isActive = activeView === view;
        return (
            <button
                onClick={() => { setActiveView(view); setIsMenuOpen(false); }}
                className={`w-full flex items-center p-3 text-lg rounded-lg transition-colors ${
                    isActive
                        ? 'bg-gray-700 text-white font-semibold'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };
    
    const NavContent = () => (
        <div className="flex flex-col h-full p-4 bg-gray-900">
            <div className="flex items-center mb-10">
                <SparklesIcon className="w-8 h-8 text-cyan-400 mr-3" />
                <span className="text-2xl font-bold text-white">Drishyam</span>
            </div>
            
            <div className="flex-grow">
                <div className="flex items-center p-3 rounded-lg bg-gray-700/50 mb-8">
                    <UserIcon className="w-8 h-8 text-gray-400 border-2 border-gray-500 rounded-full p-1 mr-3"/>
                    <div>
                        <p className="text-sm text-gray-400">Welcome back,</p>
                        <p className="font-semibold text-white capitalize">{username}</p>
                    </div>
                </div>

                <div className='mb-8'>
                     <button
                        onClick={() => { onLaunch(); setIsMenuOpen(false); }}
                        className="w-full flex items-center justify-between p-3 text-lg font-semibold rounded-lg text-black bg-cyan-500 hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105"
                    >
                        <span>Launch Narrator</span>
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>

                <nav className="space-y-2">
                   <NavLink view="welcome" label="Home" icon={<HomeIcon className="w-6 h-6 mr-3" />} />
                   <NavLink view="uploader" label="Describe Image" icon={<ImageIcon className="w-6 h-6 mr-3" />} />
                </nav>
            </div>

            <div>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center p-3 text-lg rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                    <LogOutIcon className="w-6 h-6 mr-3" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button */}
            <div className="md:hidden absolute top-4 left-4 z-30">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-700/70">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Overlay for mobile */}
            {isMenuOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/60 z-30"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
            
            {/* Mobile Sidebar */}
            <aside className={`fixed top-0 left-0 h-full w-72 border-r border-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-40 md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <NavContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-72 flex-shrink-0 border-r border-gray-800">
                <NavContent />
            </aside>
        </>
    );
};

export default Dashboard;