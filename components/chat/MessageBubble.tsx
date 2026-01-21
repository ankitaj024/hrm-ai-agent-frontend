"use client";

import { User, Bot } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Message } from "@/types/chat";
import { ThoughtProcess } from "./ThoughtProcess";
import { EmployeeCard } from "../cards/EmployeeCard";
import { LeaveBalanceCard } from "../cards/LeaveBalanceCard";

// --- Utility ---
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const MessageBubble = ({ message }: { message: Message }) => {
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

                {/* Render Cards from Tool Outputs */}
                {!isUser && message.steps?.map((step) => {
                    if (step.status !== "complete" || !step.output) return null;

                    try {
                        // Only attempt parsing if it looks like JSON
                        if (!step.output.trim().startsWith("{") && !step.output.trim().startsWith("[")) return null;

                        const data = JSON.parse(step.output);

                        if (step.name === "get_employee_tool" || step.name === "create_employee_tool" || step.name === "update_employee_tool") {
                            // Determine if output is an Employee object or a success message containing ID (create/update might return string)
                            // create/update returns a string message "Successfully created...".
                            // get_employee_tool returns JSON object.
                            // Let's only render card for `get_employee_tool` for now, or check structure.
                            if (data.email && data.role && data.department) {
                                return <EmployeeCard key={step.id} data={data} />;
                            }
                        }

                        if (step.name === "get_leave_status_tool") {
                            if (data.leave_balance !== undefined) {
                                return <LeaveBalanceCard key={step.id} data={data} />;
                            }
                        }

                        // List employees returns array
                        if (step.name === "list_employees_tool" && Array.isArray(data)) {
                            return (
                                <div key={step.id} className="flex flex-wrap gap-4 my-4">
                                    {data.map((emp: any, i: number) => (
                                        <EmployeeCard key={i} data={emp} />
                                    ))}
                                </div>
                            )
                        }

                    } catch (e) {
                        // Ignore parsing errors (fallback to standard text)
                    }
                    return null;
                })}

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
                            rehypePlugins={[rehypeRaw]}
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
