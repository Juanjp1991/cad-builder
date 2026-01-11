/**
 * Font configuration using Next.js 16 font optimization.
 * Self-hosts Google Fonts at build time for performance.
 */

import { Nunito, Inter } from "next/font/google";
import localFont from "next/font/local";

/**
 * Nunito - Playful, rounded sans-serif for headings
 * Weights: 600 (SemiBold), 700 (Bold)
 */
export const nunito = Nunito({
    weight: ["600", "700"],
    subsets: ["latin"],
    display: "swap",
    variable: "--font-nunito",
});

/**
 * Inter - Clean, readable sans-serif for body text
 * Weight: 400 (Regular)
 */
export const inter = Inter({
    weight: "400",
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
});

/**
 * JetBrains Mono - Monospace for stats and numbers
 * Weight: 500 (Medium)
 * Note: Using system monospace as fallback until font file is downloaded
 */
export const jetbrainsMono = localFont({
    src: [
        {
            path: "../public/fonts/JetBrainsMono-Medium.woff2",
            weight: "500",
            style: "normal",
        },
    ],
    display: "swap",
    variable: "--font-jetbrains-mono",
    fallback: ["ui-monospace", "monospace"],
});
