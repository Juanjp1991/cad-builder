import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
    onSubmit: (message: string) => void;
    loading: boolean;
}

/**
 * Renders the chat input form.
 *
 * @param props - Component props.
 * @param props.onSubmit - Callback function when the form is submitted.
 * @param props.loading - Whether the chat is currently loading a response.
 * @returns The rendered input component.
 */
export default function ChatInput({ onSubmit, loading }: ChatInputProps): React.JSX.Element {
    const [input, setInput] = useState<string>("");

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        if (!input.trim() || loading) return;
        onSubmit(input);
        setInput("");
    };

    return (
        <form onSubmit={handleSubmit} className="relative group">
            <div className="relative flex flex-col gap-2 rounded-[28px] bg-[#1e1e1e] p-2 transition-colors focus-within:bg-[#2a2a2a]">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe what you want to build... (e.g., 'a small red dragon')"
                    className="w-full bg-transparent px-4 py-3 text-lg text-white placeholder:text-neutral-500 focus:outline-none"
                    disabled={loading}
                />

                <div className="flex items-center justify-end px-2 pb-1">
                    {input.trim() && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:bg-neutral-200 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
