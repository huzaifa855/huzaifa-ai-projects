import React, { useState } from "react";
import { 
  X, 
  Terminal, 
  Globe, 
  Code, 
  Calculator, 
  Folder, 
  Activity, 
  Music, 
  FileText, 
  Settings, 
  Camera, 
  Palette, 
  Search,
  Sparkles,
  Play
} from "lucide-react";
import { motion } from "motion/react";
import { openApp } from "../services/pcBridgeService";

interface AppLauncherModalProps {
  onClose: () => void;
  onAppLaunched: (appName: string) => void;
}

const APPS_LIST = [
  { id: "notepad", name: "Notepad", icon: FileText, color: "from-blue-500 to-indigo-600", voice: "Open Notepad / Notepad kholo" },
  { id: "chrome", name: "Google Chrome", icon: Globe, color: "from-amber-500 to-red-500", voice: "Open Chrome / Chrome kholo" },
  { id: "vscode", name: "VS Code", icon: Code, color: "from-sky-500 to-blue-600", voice: "Open VS Code / Code kholo" },
  { id: "calc", name: "Calculator", icon: Calculator, color: "from-emerald-500 to-teal-600", voice: "Open Calculator / Calc kholo" },
  { id: "explorer", name: "File Explorer", icon: Folder, color: "from-yellow-500 to-amber-600", voice: "Open Explorer / Files kholo" },
  { id: "taskmgr", name: "Task Manager", icon: Activity, color: "from-purple-500 to-indigo-600", voice: "Open Task Manager" },
  { id: "spotify", name: "Spotify", icon: Music, color: "from-green-500 to-emerald-600", voice: "Open Spotify / Play music" },
  { id: "word", name: "Microsoft Word", icon: FileText, color: "from-blue-600 to-blue-800", voice: "Open Word" },
  { id: "excel", name: "Microsoft Excel", icon: FileText, color: "from-emerald-600 to-green-700", voice: "Open Excel" },
  { id: "paint", name: "MS Paint", icon: Palette, color: "from-pink-500 to-rose-600", voice: "Open Paint / Paint kholo" },
  { id: "camera", name: "Camera", icon: Camera, color: "from-cyan-500 to-blue-500", voice: "Open Camera" },
  { id: "settings", name: "PC Settings", icon: Settings, color: "from-slate-500 to-zinc-700", voice: "Open Settings" },
  { id: "cmd", name: "Command Prompt", icon: Terminal, color: "from-zinc-600 to-zinc-900", voice: "Open CMD / Terminal" },
];

export default function AppLauncherModal({ onClose, onAppLaunched }: AppLauncherModalProps) {
  const [search, setSearch] = useState("");
  const [customApp, setCustomApp] = useState("");
  const [launchingApp, setLaunchingApp] = useState<string | null>(null);

  const filteredApps = APPS_LIST.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.voice.toLowerCase().includes(search.toLowerCase())
  );

  const handleLaunch = async (appName: string) => {
    setLaunchingApp(appName);
    await openApp(appName);
    onAppLaunched(appName);
    setTimeout(() => {
      setLaunchingApp(null);
      onClose();
    }, 600);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customApp.trim()) return;
    handleLaunch(customApp.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0d1117]/95 border border-cyan-500/30 p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">PC Application Launcher</h2>
              <p className="text-xs text-white/50">Launch any PC tool with one click or your voice</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-4 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 focus-within:border-cyan-500/50 transition-colors">
          <Search size={16} className="text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search installed applications or voice triggers..."
            className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30"
          />
        </div>

        {/* App Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2 scrollbar-hide">
          {filteredApps.map((app) => {
            const Icon = app.icon;
            const isLaunching = launchingApp === app.id;
            return (
              <button
                key={app.id}
                onClick={() => handleLaunch(app.id)}
                disabled={isLaunching}
                className="group relative flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/40 transition-all text-left cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${app.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:shadow-cyan-500/20`}
                >
                  <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-white truncate flex items-center justify-between">
                    <span>{app.name}</span>
                    <Play size={12} className="opacity-0 group-hover:opacity-100 text-cyan-400 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-white/50 font-mono truncate mt-0.5">
                    "{app.voice}"
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom App Run Form */}
        <form
          onSubmit={handleCustomSubmit}
          className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2"
        >
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Terminal size={15} className="text-cyan-400" />
            <input
              type="text"
              value={customApp}
              onChange={(e) => setCustomApp(e.target.value)}
              placeholder="Or type any app/exe name (e.g. steam, vlc, git-bash)..."
              className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-white/30"
            />
          </div>
          <button
            type="submit"
            disabled={!customApp.trim()}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs tracking-wide transition-colors cursor-pointer"
          >
            Launch
          </button>
        </form>
      </motion.div>
    </div>
  );
}
