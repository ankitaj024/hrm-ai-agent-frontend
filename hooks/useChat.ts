"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Message, Step } from "@/types/chat";

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

export function useChat() {
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Single current thread ID for this session
    const [currentThreadId] = useState<string>(() => Date.now().toString());

    // Auth Check
    useEffect(() => {
        const token = localStorage.getItem("hr_agent_token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

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

    const sendMessage = async (userMsg: string) => {
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
                                    if (msg.content.length > 5) msg.isThinking = false;
                                }

                                else if (data.type === "tool_start") {
                                    msg.isThinking = true;
                                    // Check duplicate
                                    if (!steps.find(s => s.id === data.run_id)) {
                                        steps.push({
                                            id: data.run_id || Math.random().toString(),
                                            title: getFriendlyName(data.name),
                                            name: data.name,
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
                                            output: data.output
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
                                            name: "approval",
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
                                        name: "error",
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

    return {
        messages,
        isLoading,
        sendMessage,
        handleLogout
    };
}
