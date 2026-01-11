import React from "react";
import { User, Sparkles, Download } from "lucide-react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Dynamic import for ModelViewer to avoid SSR issues with Three.js
const ModelViewer = dynamic(() => import("../ModelViewer"), {
    ssr: false,
    loading: () => (
        <div className="flex h-[220px] items-center justify-center rounded-2xl border border-white/5 bg-neutral-900/40 text-xs text-neutral-400">
            Preparing 3D viewport…
        </div>
    ),
});

export interface ModelData {
    stl_url: string;
    step_url: string;
}

export interface Message {
    role: "user" | "assistant";
    content: string;
    isError?: boolean;
    modelData?: ModelData;
}

interface ChatMessageProps {
    message: Message;
}

/**
 * Renders a single chat message.
 *
 * @param props - Component props.
 * @param props.message - The message object to display.
 * @returns The rendered message component.
 */
export default function ChatMessage({ message }: ChatMessageProps): React.JSX.Element {
    return (
        <article className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div
                className={cn(
                    "mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full",
                    message.role === "user"
                        ? "bg-neutral-800 text-white"
                        : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                )}
            >
                {message.role === "user" ? (
                    <User className="h-5 w-5" />
                ) : (
                    <Sparkles className="h-5 w-5" />
                )}
            </div>
            <div className="flex-1 min-w-0 space-y-4">
                <div className="text-base leading-relaxed text-neutral-200">
                    {message.content}
                </div>

                {message.modelData && (
                    <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4 sm:p-6">
                        <div className="h-[400px] w-full rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden">
                            <ModelViewer stlUrl={message.modelData.stl_url || null} />
                        </div>
                        <div className="flex gap-3">
                            <a
                                href={message.modelData.step_url}
                                download
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-neutral-200 transition hover:bg-neutral-700"
                            >
                                <Download className="h-4 w-4" />
                                STEP
                            </a>
                            <a
                                href={message.modelData.stl_url}
                                download
                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-100 px-4 py-2.5 text-sm font-medium text-neutral-950 transition hover:bg-white"
                            >
                                <Download className="h-4 w-4" />
                                STL
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}
