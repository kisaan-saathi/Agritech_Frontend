"use client";
import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import KVKDashboard from './components/KVKDashboard';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => setIsLoggedIn(false);

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px]"></div>
                <div className="absolute top-[20%] right-[0%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[100px]"></div>
            </div>
            
            <div className="relative z-10">
                <KVKDashboard onLogout={handleLogout} />
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default App;