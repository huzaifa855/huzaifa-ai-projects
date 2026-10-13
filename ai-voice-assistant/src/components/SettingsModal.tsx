import React, { useState } from "react";
import { X, Key, Cpu, Volume2, ShieldCheck, Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { getApiKey, setApiKey } from "../services/geminiService";

interface SettingsModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function SettingsModal({ onClose, onSaved }: SettingsModalProps) {
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey());
  const [speechMode, setSpeechMode] = useState<"gemini" | "webspeech">(() => {
    return (localStorage.getItem("luccy_speech_mode") as any) || "gemini";
  });
  const [languageMode, setLanguageMode] = useState(() => {
    return localStorage.getItem("luccy_lang_pref") || "auto";
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setApiKey(apiKeyInput.trim());
    localStorage.setItem("luccy_speech_mode", speechMode);
    localStorage.setItem("luccy_lang_pref", languageMode);
    setSavedSuccess(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg rounded-2xl bg-[#0f141c]/95 border border-violet-500/30 p-6 shadow-[0_0_50px_rgba(139,92,246,0.25)] flex flex-col gap-4 text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-violet-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">Assistant Settings</h2>
              <p className="text-xs text-white/50">Configure Gemini API Key & Audio Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Gemini API Key */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
              <Key size={14} />
              Gemini API Key:
            </label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Get Free Key →
            </a>
          </div>
          <input
            type="password"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="AIzaSy..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-violet-500/50 outline-none font-mono"
          />
          <p className="text-[10px] text-white/40">
            Stored locally in your browser. Enables high-definition AI voice responses.
          </p>
        </div>

        {/* Speech Engine Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
            <Cpu size={14} />
            Speech Recognition Engine:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSpeechMode("gemini")}
              className={`p-3 rounded-xl border text-left transition-all ${
                speechMode === "gemini"
                  ? "bg-violet-500/20 border-violet-400 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              <div className="font-semibold text-xs text-violet-300">Gemini Live AI (HD)</div>
              <div className="text-[10px] text-white/50 mt-0.5">Ultra-low latency audio stream</div>
            </button>

            <button
              type="button"
              onClick={() => setSpeechMode("webspeech")}
              className={`p-3 rounded-xl border text-left transition-all ${
                speechMode === "webspeech"
                  ? "bg-violet-500/20 border-violet-400 text-white"
                  : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
              }`}
            >
              <div className="font-semibold text-xs text-emerald-300">Web Speech (Native)</div>
              <div className="text-[10px] text-white/50 mt-0.5">Works offline & on any browser</div>
            </button>
          </div>
        </div>

        {/* Language Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-violet-300 flex items-center gap-1.5">
            <Volume2 size={14} />
            Language Mode:
          </label>
          <select
            value={languageMode}
            onChange={(e) => setLanguageMode(e.target.value)}
            className="w-full bg-[#171f2c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="auto">🌐 Multilingual Auto-Detect (Urdu, Pashto, English, Punjabi)</option>
            <option value="ur">🇵🇰 Urdu / Roman Urdu Priority</option>
            <option value="en">🇬🇧 English Priority</option>
            <option value="ps">🇦🇫 Pashto Priority</option>
          </select>
        </div>

        {/* Save Button */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide flex items-center gap-1.5 shadow-lg shadow-violet-600/30 cursor-pointer"
          >
            {savedSuccess ? <Check size={14} className="text-emerald-400" /> : <ShieldCheck size={14} />}
            <span>{savedSuccess ? "Saved!" : "Save Settings"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
