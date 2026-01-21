export type Step = {
    id: string;
    title: string;
    name: string; // Original tool name
    type: "tool_call" | "reasoning" | "error" | "response" | "approval";
    content?: any;
    output?: string; // Tool output
    status: "pending" | "complete" | "error";
    timestamp: number;
};

export type Message = {
    role: "user" | "assistant";
    content: string;
    steps?: Step[];
    isThinking?: boolean;
};
