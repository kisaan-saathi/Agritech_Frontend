"use client";
import React, { useState } from 'react';
import { Building2, ShieldCheck, ArrowRight, Sprout, Lock } from 'lucide-react';

interface LoginScreenProps {
    onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            onLogin();
            setIsLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            {/* Background Accents */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white rounded-3xl shadow-sm mb-6 border border-slate-100">
                        <Building2 size={40} className="text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                        KVK Command Center
                    </h1>
                    <p className="text-slate-500 font-medium">District Agricultural Surveillance Portal</p>
                </div>

                <div className="bg-white p-8 rounded-[40px] shadow-soft border border-slate-100">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Official ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <ShieldCheck size={18} />
                                </div>
                                <input 
                                    type="text" 
                                    defaultValue="KVK-VNS-7721"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="Enter your KVK ID"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Access Token</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input 
                                    type="password" 
                                    defaultValue="********"
                                    className="block w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                                    placeholder="Enter password"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Authenticate Access</span>
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center">
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                            Authorized personnel only. All access is logged and monitored by the Central Agricultural Extension Division.
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center space-x-2 text-slate-400">
                    <Sprout size={16} />
                    <span className="text-sm font-bold tracking-tight">Kisaan Saathi Framework v3.0</span>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;