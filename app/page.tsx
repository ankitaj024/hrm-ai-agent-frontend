"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { Header } from "@/components/layout/Header";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default function Home() {
  const { messages, isLoading, sendMessage, handleLogout } = useChat();
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const [isAdmin, setIsAdmin] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, view]); // efficient scroll on view switch too

  useEffect(() => {
    const userStr = localStorage.getItem("hr_agent_user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Check for Super Admin role
        if (user.role === "super_admin") {
          setIsAdmin(true);
        }
      } catch (e) {
        console.error("Failed to parse user info", e);
      }
    }
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 font-sans overflow-hidden p-8">
      <div className="flex-1 flex flex-col relative w-full h-full max-w-6xl mx-auto shadow-2xl shadow-blue-900/5 bg-white overflow-hidden  lg:rounded-3xl border border-gray-100">

        <Header
          onLogout={handleLogout}
          currentView={view}
          onViewChange={setView}
          isAdmin={isAdmin}
        />

        {view === 'dashboard' && isAdmin ? (
          <div className="flex-1 overflow-hidden flex flex-col">
            <DashboardView />
          </div>
        ) : (
          <>
            {/* Message List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-gray-50/30">
              {messages.length === 0 && (
                <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 opacity-60">
                  <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
                    <Sparkles size={40} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">How can I help you?</h3>
                  <p className="text-sm">Ask about employees, leaves, or pending approvals.</p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <MessageBubble key={idx} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </>
        )}

      </div>
    </div>
  );
}
