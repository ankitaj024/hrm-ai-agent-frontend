"use client";

import { Bot, LogOut, LayoutDashboard, MessageSquare } from "lucide-react";

interface HeaderProps {
    onLogout: () => void;
    currentView: 'chat' | 'dashboard';
    onViewChange: (view: 'chat' | 'dashboard') => void;
    isAdmin: boolean;
}

export const Header = ({ onLogout, currentView, onViewChange, isAdmin }: HeaderProps) => {
    return (
        <header className="px-6 py-6 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 w-full rounded-t-3xl">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 ring-2 ring-white">
                    <Bot size={24} />
                </div>
                <div>
                    <h1 className="font-bold text-lg text-gray-800 tracking-tight">HR Assistant</h1>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">DeepMind Agentic</p>
                </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl">
                <button
                    onClick={() => onViewChange('chat')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'chat'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <MessageSquare size={16} />
                    Chat
                </button>
                {isAdmin && (
                    <button
                        onClick={() => onViewChange('dashboard')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'dashboard'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <LayoutDashboard size={16} />
                        Dashboard
                    </button>
                )}
            </div>

            <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
                title="Logout"
            >
                <LogOut size={20} />
            </button>
        </header>
    );
};
