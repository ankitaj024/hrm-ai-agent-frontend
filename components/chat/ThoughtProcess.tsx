"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, ChevronDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence } from "framer-motion";
import { Step } from "@/types/chat";

// --- Utility ---
function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

export const ThoughtProcess = ({ steps, isThinking }: { steps: Step[], isThinking?: boolean }) => {
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
