"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, User, Bot, Loader2, CheckCircle2, ChevronRight, AlertCircle, Sparkles, LogOut, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Types ---
type Step = {
  id: string;
  title: string;
  type: "tool_call" | "reasoning" | "error" | "response" | "approval";
  content?: any;
  status: "pending" | "complete" | "error";
  timestamp: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
  steps?: Step[];
  isThinking?: boolean;
};

// --- Utility ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

function getFriendlyName(toolName: string): string {
  if (toolName.includes("get_employee")) return "Retrieving employee details...";
  if (toolName.includes("list_employees")) return "Listing employees...";
  if (toolName.includes("create_employee")) return "Creating employee record...";
  if (toolName.includes("update_employee")) return "Updating employee details...";
  if (toolName.includes("delete_employee")) return "Deleting employee record...";
  if (toolName.includes("apply_leave")) return "Processing leave application...";
  if (toolName.includes("approve_leave")) return "Approving leave request...";
  if (toolName.includes("reject_leave")) return "Rejecting leave request...";
  if (toolName.includes("list_leaves")) return "Retrieving leave requests...";
  if (toolName.includes("get_leave")) return "Checking leave status...";
  return "Processing request...";
}

// --- Components ---

const ThoughtProcess = ({ steps, isThinking }: { steps: Step[], isThinking?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const hasSteps = steps && steps.length > 0;

  // Auto-expand if thinking/running
  useEffect(() => {
    if (isThinking) {
      setExpanded(true);
    }
  }, [isThinking]);

  if (!hasSteps && !isThinking) return null;

  return (
    <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50/50 overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 p-3 text-blue-800 hover:bg-blue-50 transition-colors text-left"
      >
        {isThinking ? (
          <Loader2 size={16} className="animate-spin text-blue-600" />
        ) : (
          <Sparkles size={16} className="text-blue-600" />
        )}
        <span className="font-semibold text-xs uppercase tracking-wider opacity-80 flex-1">
          {isThinking ? "Thinking Process..." : "Analysis Complete"}
        </span>
        <ChevronDown size={16} className={cn("transition-transform duration-200 text-blue-400", expanded ? "rotate-180" : "")} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="p-3 pt-0 space-y-2">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col gap-1 pl-2 border-l-2 border-blue-200">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
                    {step.status === "pending" ? (
                      <Loader2 size={12} className="animate-spin text-blue-500" />
                    ) : step.status === "error" ? (
                      <AlertCircle size={12} className="text-red-500" />
                    ) : (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    )}
                    <span>{step.title}</span>
                  </div>
                  {/* Content hidden as per user request */}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

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
          "max-w-[85%] rounded-2xl p-5 shadow-sm transition-all",
          isUser
            ? "bg-blue-600 text-white rounded-br-none shadow-blue-100"
            : "bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-gray-100"
        )}
      >
        <div className="flex items-center gap-2 mb-3 opacity-60 text-[10px] uppercase tracking-widest font-bold">
          {isUser ? <User size={12} /> : <Bot size={12} />}
          <span>{isUser ? "You" : "HR Agent"}</span>
        </div>

        {!isUser && (
          <ThoughtProcess steps={message.steps || []} isThinking={message.isThinking} />
        )}

        <div className={cn("prose prose-sm max-w-none leading-relaxed", isUser ? "prose-invert" : "text-gray-700")}>
          {(message.content === "" && !message.isThinking && (!message.steps || message.steps.length === 0)) ? (
            // Pure loading state if strictly nothing is happening yet
            <div className="flex items-center gap-1 h-6 opacity-50">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
            </div>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => <div className="overflow-x-auto my-4 border rounded-lg"><table className="min-w-full divide-y divide-gray-200" {...props} /></div>,
                thead: ({ node, ...props }) => <thead className="bg-gray-50 text-gray-600" {...props} />,
                th: ({ node, ...props }) => <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" {...props} />,
                td: ({ node, ...props }) => <td className="px-4 py-3 whitespace-nowrap text-sm border-t border-gray-100" {...props} />,
                p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                ul: ({ node, ...props }) => <ul className="mb-4 list-disc pl-5 space-y-1" {...props} />,
                ol: ({ node, ...props }) => <ol className="mb-4 list-decimal pl-5 space-y-1" {...props} />,
                li: ({ node, ...props }) => <li className="" {...props} />,
                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-blue-200 pl-4 py-1 italic bg-blue-50/30 rounded-r my-4 text-gray-600" {...props} />,
                code: ({ node, inline, className, children, ...props }: any) => {
                  const content = String(children).replace(/\n$/, '');
                  const isMultiLine = content.includes('\n');

                  if (inline) {
                    return <code className="bg-gray-100 rounded px-1 py-0.5 text-xs font-mono text-pink-600" {...props}>{children}</code>;
                  }

                  // If it's a block but short and single line, don't use the heavy terminal frame
                  if (!isMultiLine && content.length < 80) {
                    return (
                      <div className="my-2 bg-gray-100/50 border border-gray-200 rounded-md px-3 py-2 font-mono text-xs text-gray-800 overflow-x-auto">
                        <code {...props}>{children}</code>
                      </div>
                    );
                  }

                  // Heavy terminal style for actual code blocks
                  return (
                    <div className="relative my-4 rounded-lg overflow-hidden bg-gray-900 shadow-md">
                      <div className="flex items-center px-4 py-2 bg-gray-800/50 text-[10px] text-gray-400 font-mono uppercase border-b border-gray-700">Code</div>
                      <pre className="p-4 overflow-x-auto bg-gray-900 text-gray-100 text-sm font-mono scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent" {...props}>
                        <code>{children}</code>
                      </pre>
                    </div>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// --- Main Page ---

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Single current thread ID for this session
  const [currentThreadId] = useState<string>(() => Date.now().toString());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    // Add User Message
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    // Create Assistant Placeholder with thinking state
    setMessages((prev) => [...prev, { role: "assistant", content: "", steps: [], isThinking: true }]);

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

              setMessages(prev => {
                const newMsgs = [...prev];
                const lastIdx = newMsgs.length - 1;
                // Ensure we are working on assistant message
                if (lastIdx < 0 || newMsgs[lastIdx].role !== 'assistant') return prev;

                const msg = { ...newMsgs[lastIdx] };
                const steps = msg.steps ? [...msg.steps] : [];

                // --- Handle Event Types ---

                if (data.type === "token") {
                  msg.content += data.content;
                  // If we are getting tokens, we might be done "thinking" about tools, 
                  // BUT LangGraph might interleave. 
                  // Usually receiving text means we are generating the answer.
                  // We can keep isThinking true until done, or toggle it. 
                  // Let's keep it true until very end or explicit stop? 
                  // Actually, let's turn off "Thinking" if we are streaming the final answer to reduce noise,
                  // unless a tool runs again.
                  if (msg.content.length > 5) msg.isThinking = false;
                }

                else if (data.type === "tool_start") {
                  msg.isThinking = true;
                  // Check duplicate
                  if (!steps.find(s => s.id === data.run_id)) {
                    steps.push({
                      id: data.run_id || Math.random().toString(),
                      title: getFriendlyName(data.name),
                      type: "tool_call",
                      content: data.input,
                      status: "pending",
                      timestamp: Date.now()
                    });
                  }
                  msg.steps = steps;
                }

                else if (data.type === "tool_end") {
                  const stepIdx = steps.findIndex(s => s.id === data.run_id);
                  if (stepIdx !== -1) {
                    steps[stepIdx] = {
                      ...steps[stepIdx],
                      status: "complete",
                      // content: data.output // Output hidden
                    };
                  }
                  msg.steps = steps;
                }

                else if (data.type === "response") { // Explicit final response or interrupt
                  msg.content = data.content; // Often replaces content or appends
                  if (data.content.includes("APPROVAL REQUIRED")) {
                    steps.push({
                      id: "approval-" + Date.now(),
                      title: "Approval Required",
                      type: "approval",
                      status: "pending",
                      timestamp: Date.now()
                    });
                    msg.steps = steps;
                    msg.isThinking = false; // Stop spinner
                  }
                }

                else if (data.type === "error") {
                  steps.push({
                    id: "err-" + Date.now(),
                    title: "Error Occurred",
                    type: "error",
                    content: data.content,
                    status: "error",
                    timestamp: Date.now()
                  });
                  msg.steps = steps;
                  msg.isThinking = false;
                }

                newMsgs[lastIdx] = msg;
                return newMsgs;
              });

            } catch (e) {
              console.error("Failed to parse SSE data", e);
            }
          }
        }
      }

    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered network error.", steps: [], isThinking: false }]);
    } finally {
      setIsLoading(false);
      // Ensure thinking is off at end
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIdx = newMsgs.length - 1;
        if (lastIdx >= 0 && newMsgs[lastIdx].role === 'assistant') {
          newMsgs[lastIdx] = { ...newMsgs[lastIdx], isThinking: false };
        }
        return newMsgs;
      });
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900 font-sans overflow-hidden">

      <div className="flex-1 flex flex-col relative w-full h-full max-w-5xl mx-auto shadow-2xl shadow-blue-900/5 bg-white overflow-hidden my-0 lg:my-6 lg:rounded-3xl border border-gray-100">

        {/* Header */}
        <header className="px-6 py-4 bg-white/90 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between sticky top-0 z-10 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 ring-2 ring-white">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 tracking-tight">HR Assistant</h1>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">DeepMind Agentic</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-emerald-700">Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

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

        {/* Input Area */}
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

      </div>
    </div>
  );
}
