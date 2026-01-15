"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, User, Bot, Loader2, CheckCircle2, ChevronRight, AlertCircle, PlayCircle, XCircle, LogOut } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Types ---
type Message = {
  role: "user" | "assistant";
  content: string;
};

type Step = {
  id: string;
  title: string;
  type: "tool_call" | "reasoning" | "error" | "response" | "approval";
  content?: any;
  status: "pending" | "complete" | "error";
  timestamp: number;
};

// --- Utility ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const MessageBubble = ({ role, content }: Message) => {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex w-full mb-6",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl p-4 shadow-sm",
          isUser
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none"
        )}
      >
        <div className="flex items-center gap-2 mb-1 opacity-70 text-xs uppercase tracking-wider font-semibold">
          {isUser ? <User size={12} /> : <Bot size={12} />}
          <span>{isUser ? "You" : "HR Agent"}</span>
        </div>
        <div className={cn("prose prose-sm max-w-none", isUser ? "prose-invert" : "text-gray-800")}>
          {!content && !isUser ? (
            <div className="flex items-center gap-1 h-6">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="ml-2 text-gray-400 text-xs font-medium animate-pulse">Thinking...</span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => <div className="overflow-x-auto my-4"><table className="min-w-full divide-y divide-gray-300 border border-gray-200 rounded-lg" {...props} /></div>,
                thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                th: ({ node, ...props }) => <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" {...props} />,
                td: ({ node, ...props }) => <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 border-t border-gray-100" {...props} />,
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
              }}
            >
              {content || ""}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const StepItem = ({ step }: { step: Step }) => {
  const [expanded, setExpanded] = useState(false);
  const isError = step.status === "error";
  const isPending = step.status === "pending";
  const isApproval = step.type === "approval";

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "mb-3 rounded-lg border p-3 transition-colors text-sm",
        isError ? "border-red-200 bg-red-50" :
          isApproval ? "border-amber-200 bg-amber-50" :
            "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="shrink-0 text-gray-400">
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          ) : isError ? (
            <XCircle size={16} className="text-red-500" />
          ) : isApproval ? (
            <AlertCircle size={16} className="text-amber-500" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-500" />
          )}
        </div>
        <div className="flex-1 font-medium truncate text-gray-700">
          {step.title}
        </div>
        <ChevronRight
          size={16}
          className={cn("text-gray-400 transition-transform", expanded && "rotate-90")}
        />
      </div>

      <AnimatePresence>
        {expanded && step.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 pt-2 border-t border-dashed border-gray-200 font-mono text-xs text-gray-600 bg-gray-50 rounded p-2 overflow-x-auto">
              <pre>{JSON.stringify(step.content, null, 2)}</pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- Main Page ---

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [steps, setSteps] = useState<Step[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Single current thread ID for this session
  const [currentThreadId] = useState<string>(() => Date.now().toString());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, steps]);

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem("hr_agent_token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("hr_agent_token");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  };

  const handleLogout = () => {
    localStorage.removeItem("hr_agent_token");
    localStorage.removeItem("hr_agent_user");
    router.push("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    // Initial placeholder for assistant
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    // Mark previous approval steps as complete when user replies
    setSteps(prev => prev.map(s => s.type === "approval" && s.status === "pending" ? { ...s, status: "complete" } : s));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/chat`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          message: userMsg,
          thread_id: currentThreadId
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      let firstTokenReceived = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6);
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              // Handle Token Stream
              if (data.type === "token") {
                if (!firstTokenReceived) {
                  firstTokenReceived = true;
                  // Replace placeholder (which might be empty or thinking) with first token
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastIndex = newMsgs.length - 1;
                    if (newMsgs[lastIndex]) {
                      newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: data.content };
                    }
                    return newMsgs;
                  });
                } else {
                  // Append subsequent tokens
                  setMessages(prev => {
                    const newMsgs = [...prev];
                    const lastIndex = newMsgs.length - 1;
                    if (newMsgs[lastIndex]) {
                      const updatedContent = newMsgs[lastIndex].content + data.content;
                      newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: updatedContent };
                    }
                    return newMsgs;
                  });
                }
              }

              // Handle Tool Start
              else if (data.type === "tool_start") {
                const stepId = data.run_id || Date.now().toString() + Math.random();
                const toolName = data.name;

                setSteps(prev => {
                  if (prev.some(s => s.id === stepId)) return prev;
                  return [...prev, {
                    id: stepId,
                    title: `Executing: ${toolName}`,
                    type: "tool_call",
                    content: data.input,
                    status: "pending",
                    timestamp: Date.now()
                  }];
                });
              }

              // Handle Tool End
              else if (data.type === "tool_end") {
                const stepId = data.run_id;
                if (stepId) {
                  setSteps(prev => prev.map(s => s.id === stepId ? { ...s, status: "complete", content: data.output } : s));
                }
              }

              // Handle Explicit Response
              else if (data.type === "response") {
                const content = data.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const last = newMsgs[newMsgs.length - 1];
                  if (last.role === "assistant") {
                    last.content = content;
                  }
                  return newMsgs;
                });
                firstTokenReceived = true;

                if (content.includes("APPROVAL REQUIRED")) {
                  const stepId = "approval-" + Date.now().toString();
                  setSteps(prev => [...prev, {
                    id: stepId,
                    title: "Approval Required",
                    type: "approval",
                    status: "pending",
                    timestamp: Date.now()
                  }]);
                }
              }

              else if (data.type === "error") {
                setSteps(prev => [...prev, {
                  id: Date.now().toString(),
                  title: "Error",
                  type: "error",
                  content: data.content,
                  status: "error",
                  timestamp: Date.now()
                }]);
              }

            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered network error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">

      {/* Main Chat Area - Expanded to take full width minus right sidebar */}
      <div className="flex-1 flex flex-col relative w-full h-full">

        {/* Header */}
        <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-blue-200 shadow-lg">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800">HR AI Agent</h1>
              <p className="text-xs text-gray-500 font-medium">Powered by LangGraph</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-semibold text-gray-400">Online</span>
            <button
              onClick={handleLogout}
              className="ml-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 && (
              <div className="h-[60vh] flex flex-col items-center justify-center text-gray-400 opacity-60">
                <Bot size={64} className="mb-4 text-gray-200" />
                <p>Start a conversation with your HR Assistant</p>
              </div>
            )}

            {messages.map((msg, idx) => (
              <MessageBubble key={idx} role={msg.role} content={msg.content} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about employees, leaves, or company policies..."
                className="w-full bg-gray-100 text-gray-800 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner font-medium placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
              >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </form>
            <div className="text-center mt-2 text-[10px] text-gray-400 font-medium">
              AI can make mistakes. Please verify important information.
            </div>
          </div>
        </div>

      </div>

      {/* Right Sidebar: Agent Brain / Steps */}
      <div className="w-80 bg-white border-l border-gray-100 p-4 flex flex-col hidden lg:flex">
        <div className="mb-4 flex items-center gap-2 text-gray-400 uppercase tracking-widest text-xs font-bold">
          <PlayCircle size={14} />
          <span>Agent Process</span>
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          {steps.length === 0 ? (
            <p className="text-sm text-gray-300 italic text-center mt-10">
              Steps regarding the agent's thought process will appear here.
            </p>
          ) : (
            steps.map(step => (
              <StepItem key={step.id} step={step} />
            ))
          )}
        </div>
      </div>

    </div>
  );
}
