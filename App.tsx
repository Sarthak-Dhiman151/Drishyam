import React, { useState, useCallback } from 'react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NarratorPage from './pages/NarratorPage';

export type Page = 'home' | 'login' | 'narrator';

interface Session {
  apiKey: string;
  username: string;
}

const App: React.FC = () => {
    const [session, setSession] = useState<Session | null>(() => {
        const storedSession = sessionStorage.getItem('drishyam_session');
        try {
            if (storedSession) {
                return JSON.parse(storedSession);
            }
        } catch (e) {
            console.error("Failed to parse session data", e);
            return null;
        }
        return null;
    });

    const [page, setPage] = useState<Page>(() => session ? 'home' : 'login');

    const handleLaunch = () => {
        if (session) {
            setPage('narrator');
        } else {
            setPage('login');
        }
    };

    const handleLogin = (username: string, apiKey: string) => {
        const newSession = { username, apiKey };
        sessionStorage.setItem('drishyam_session', JSON.stringify(newSession));
        setSession(newSession);
        setPage('home');
    };
    
    const handleNavigate = useCallback((newPage: Page) => {
        setPage(newPage);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('drishyam_session');
        setSession(null);
        setPage('login');
    };

    const renderPage = () => {
        switch (page) {
            case 'login':
                return <LoginPage onLogin={handleLogin} />;
            case 'narrator':
                if (session) {
                    return <NarratorPage apiKey={session.apiKey} onNavigate={handleNavigate} />;
                }
                setPage('login');
                return <LoginPage onLogin={handleLogin} />;
            case 'home':
            default:
                if (!session) {
                    setPage('login');
                    return <LoginPage onLogin={handleLogin} />;
                }
                return <HomePage username={session.username} apiKey={session.apiKey} onLaunch={handleLaunch} onLogout={handleLogout} />;
        }
    };

    return <>{renderPage()}</>;
};

export default App;