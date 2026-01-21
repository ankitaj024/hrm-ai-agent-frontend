"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
    const [input, setInput] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput("");
    };

    return (
        <div className="p-6 bg-white border-t border-gray-100 relative">
            <form onSubmit={handleSubmit} className="relative flex items-center shadow-2xl shadow-gray-200/50 rounded-2xl">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message HR Assistant..."
                    className="w-full bg-white text-gray-800 rounded-2xl pl-6 pr-16 py-5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 border border-gray-100 transition-all font-medium placeholder:text-gray-300"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 hover:scale-105 active:scale-95"
                >
                    {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
                </button>
            </form>
            <div className="text-center mt-3 text-[10px] text-gray-300 font-medium tracking-wide">
                POWERED BY LANGGRAPH & GEMINI
            </div>
        </div>
    );
};
