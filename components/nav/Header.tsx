"use client";
import React from 'react';
import { Bell, Search, LogOut, ShieldCheck } from 'lucide-react';

interface HeaderProps {
    notificationCount?: number;
    userName?: string;
    userRole?: string;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    notificationCount = 0, 
    userName = "John Doe", 
    userRole = "Lead Agronomist",
    onLogout
}) => {
    return (
        <header className="flex justify-between items-center mb-10 pt-4 pb-4 sticky top-0 z-50 bg-[#F8FAFC]/90 backdrop-blur-xl -mx-4 px-4 sm:px-10 sm:-mx-10 transition-all duration-300">
            <div className="flex items-center space-x-4">
                 <div className="p-3 bg-indigo-600 rounded-[20px] shadow-lg text-white">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Kisaan Saathi</h1>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1">KVK Intelligence Framework</p>
                 </div>
            </div>
            
            <div className="flex items-center space-x-3 sm:space-x-6">
                <button className="hidden lg:flex items-center space-x-2 bg-white border border-slate-200 pl-4 pr-6 py-2.5 rounded-2xl shadow-sm text-slate-400 text-sm font-bold group hover:border-indigo-500 transition-colors">
                    <Search size={18} className="group-hover:text-indigo-600" />
                    <span>Search district records...</span>
                </button>

                <button className="p-3 rounded-2xl bg-white text-gray-600 shadow-sm border border-slate-100 hover:shadow-xl hover:scale-105 transition-all duration-200 relative group">
                    <Bell size={20} className="group-hover:text-indigo-600 transition-colors" />
                    {notificationCount > 0 && (
                        <span className="absolute top-3 right-3 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500 animate-pulse"></span>
                    )}
                </button>
                
                <div className="hidden sm:flex items-center space-x-4 pl-4 border-l border-slate-200">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-black text-slate-900 tracking-tight">{userName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{userRole}</p>
                    </div>
                    <img 
                        className="w-12 h-12 rounded-[20px] object-cover border-2 border-white shadow-xl" 
                        src={`https://ui-avatars.com/api/?name=${userName}&background=312e81&color=fff&bold=true`}
                        alt="User" 
                    />
                </div>

                {onLogout && (
                    <button 
                        onClick={onLogout}
                        className="p-3 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm hover:shadow-red-200"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
