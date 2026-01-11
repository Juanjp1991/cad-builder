"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Image, Blocks, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-[#0e0e0e] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 transition-all duration-500 ease-in-out">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
          >
            <Sparkles className="size-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">AI-Powered LEGO Generation</span>
          </motion.div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
              Welcome to Lego Builder!
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into buildable 3D LEGO models using AI.
            Just describe what you want, and watch it come to life.
          </p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="pt-4"
          >
            <Link href="/generate">
              <Button
                size="lg"
                className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
              >
                Start Building
                <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-5xl mx-auto"
          >
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Sparkles className="size-6 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Text-to-LEGO</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Describe any object and our AI generates a buildable LEGO model in seconds
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
              <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                <Image className="size-6 text-purple-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Image-to-LEGO</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Upload images and transform them into accurate LEGO recreations
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-red-500/50 transition-all duration-300 hover:scale-105">
              <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                <Blocks className="size-6 text-red-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">3D Visualization</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                View and interact with your model in 3D before building
              </p>
            </div>
          </motion.div>

          {/* Tech Badge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="pt-12 flex items-center justify-center gap-2 text-sm text-slate-500"
          >
            <Zap className="size-4" />
            <span>Powered by Google Gemini AI & build123d CAD engine</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
