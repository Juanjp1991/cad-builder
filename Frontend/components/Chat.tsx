"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { sendMessage, pollTask, getFileUrl, TaskState } from "@/lib/api";
import ChatMessage, { Message } from "./chat/ChatMessage";
import ChatInput from "./chat/ChatInput";

/**
 * Main Chat component for interacting with the Forma AI agent.
 * Handles message history, user input, and displaying generated models.
 *
 * @returns The rendered Chat component.
 */
export default function Chat(): React.JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (): void => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (userMessage: string): Promise<void> => {
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            // 1. Send message to start task
            const task = await sendMessage(userMessage);

            // 2. Poll for completion
            const completedTask = await pollTask(task.id);

            if (completedTask.status.state !== TaskState.COMPLETED) {
                throw new Error(`Task failed with state: ${completedTask.status.state}`);
            }

            // 3. Extract artifacts
            // We expect the agent to return a message with file parts or artifacts
            // For now, let's look for file parts in the last message from the agent
            const lastMessage = completedTask.history.findLast(m => m.role === "ROLE_AGENT");

            let stlUrl = "";
            let stepUrl = "";
            let responseText = "Task completed.";

            if (lastMessage) {
                // Extract text
                const textPart = lastMessage.parts.find(p => p.text);
                if (textPart?.text) {
                    responseText = textPart.text;
                }

                // Extract files
                lastMessage.parts.forEach(part => {
                    if (part.file) {
                        const url = getFileUrl(part.file.fileWithUri);
                        if (url) {
                            if (part.file.mediaType === "model/stl" || part.file.name?.endsWith(".stl")) {
                                stlUrl = url;
                            } else if (part.file.mediaType === "model/step" || part.file.name?.endsWith(".step")) {
                                stepUrl = url;
                            }
                        }
                    }
                });
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: responseText,
                    modelData: (stlUrl && stepUrl) ? {
                        stl_url: stlUrl,
                        step_url: stepUrl
                    } : undefined
                },
            ]);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to generate model";
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `Error: ${message}`, isError: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="flex min-h-screen w-full flex-col bg-[#0e0e0e] text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Header / Greeting Area - Only visible when no messages */}
            {!hasMessages && (
                <div className="flex flex-1 flex-col items-center justify-center px-4 transition-all duration-500 ease-in-out">
                    <h1 className="mb-12 text-5xl font-medium tracking-tight sm:text-6xl">
                        <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                            Welcome to Lego Builder!
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl text-center mb-8">
                        Transform your ideas into buildable 3D Lego models using AI
                    </p>
                </div>
            )}

            {/* Chat History Area */}
            {hasMessages && (
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 custom-scroll">
                    <div className="mx-auto max-w-3xl space-y-8">
                        {messages.map((msg, idx) => (
                            <ChatMessage key={idx} message={msg} />
                        ))}
                        {loading && (
                            <div className="flex items-center gap-4 pl-12 animate-pulse">
                                <div className="h-4 w-4 rounded-full bg-blue-500/50"></div>
                                <span className="text-sm bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">Thinking...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            )}

            {/* Input Area - Fixed at bottom or centered */}
            <div className={cn(
                "w-full px-4 pb-8 transition-all duration-500 ease-in-out",
                !hasMessages ? "flex-none" : "sticky bottom-0 bg-[#0e0e0e]/80 backdrop-blur-xl pt-4"
            )}>
                <div className="mx-auto max-w-3xl">
                    <ChatInput onSubmit={handleSendMessage} loading={loading} />
                </div>
            </div >
        </div >
    );
}
