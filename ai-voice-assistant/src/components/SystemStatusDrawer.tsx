import React, { useEffect, useState } from "react";
import { 
  X, 
  Cpu, 
  HardDrive, 
  Clock, 
  Monitor, 
  Activity, 
  Volume2, 
  VolumeX, 
  Volume1, 
  RefreshCw,
  Power
} from "lucide-react";
import { motion } from "motion/react";
import { getSystemInfo, SystemInfo, adjustVolume } from "../services/pcBridgeService";

interface SystemStatusDrawerProps {
  onClose: () => void;
  onTriggerPower: (action: "shutdown" | "restart" | "lock" | "sleep") => void;
}

export default function SystemStatusDrawer({ onClose, onTriggerPower }: SystemStatusDrawerProps) {
  const [sysInfo, setSysInfo] = useState<SystemInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInfo();
    const interval = setInterval(fetchInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchInfo = async () => {
    const data = await getSystemInfo();
    setSysInfo(data);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <motion.div
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 250 }}
        className="relative w-full max-w-md h-full sm:h-[90vh] rounded-none sm:rounded-2xl bg-[#090d14]/95 border-l sm:border border-cyan-500/30 p-6 shadow-[0_0_60px_rgba(6,182,212,0.2)] flex flex-col gap-4 text-white overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">PC Diagnostics & Control</h2>
              <p className="text-xs text-white/50">Live system performance & power station</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* CPU Cores */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>Processor</span>
              <Cpu size={15} className="text-cyan-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold font-mono text-cyan-300">
                {sysInfo?.cpuCores ? `${sysInfo.cpuCores} Cores` : "Active"}
              </div>
              <div className="text-[10px] text-white/40 truncate font-mono mt-0.5">
                {sysInfo?.cpuModel || "Windows x64"}
              </div>
            </div>
          </div>

          {/* RAM Usage */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>RAM Memory</span>
              <HardDrive size={15} className="text-violet-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold font-mono text-violet-300">
                {sysInfo?.memoryUsagePercent ? `${sysInfo.memoryUsagePercent}%` : "Normal"}
              </div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">
                {sysInfo?.usedMemoryGB ? `${sysInfo.usedMemoryGB} / ${sysInfo.totalMemoryGB} GB` : "Monitoring"}
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>System Uptime</span>
              <Clock size={15} className="text-emerald-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold font-mono text-emerald-300">
                {sysInfo?.uptime ? `${Math.floor(sysInfo.uptime / 60)}h ${sysInfo.uptime % 60}m` : "Active"}
              </div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">
                Smooth Operation
              </div>
            </div>
          </div>

          {/* Host PC */}
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 text-xs">
              <span>Device Host</span>
              <Monitor size={15} className="text-amber-400" />
            </div>
            <div className="mt-2">
              <div className="text-xl font-bold font-mono text-amber-300 truncate">
                {sysInfo?.hostname || "Windows PC"}
              </div>
              <div className="text-[10px] text-white/40 font-mono mt-0.5">
                {sysInfo?.platform || "win32"}
              </div>
            </div>
          </div>
        </div>

        {/* Quick PC Volume Controls */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="text-xs font-semibold text-white/80 mb-3 flex items-center justify-between">
            <span>PC Audio Level Control</span>
            <Volume2 size={15} className="text-cyan-400" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => adjustVolume("down")}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume1 size={14} />
              <span>Volume -</span>
            </button>
            <button
              onClick={() => adjustVolume("mute")}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-amber-300"
            >
              <VolumeX size={14} />
              <span>Mute / Unmute</span>
            </button>
            <button
              onClick={() => adjustVolume("up")}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Volume2 size={14} />
              <span>Volume +</span>
            </button>
          </div>
        </div>

        {/* Power Controls */}
        <div className="mt-auto p-4 rounded-xl bg-red-950/20 border border-red-500/30">
          <div className="text-xs font-semibold text-red-300 mb-3 flex items-center gap-1.5">
            <Power size={15} />
            <span>Power & System Actions</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onTriggerPower("shutdown")}
              className="py-2.5 px-3 rounded-lg bg-red-600/30 hover:bg-red-600 border border-red-500/40 text-red-200 hover:text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Power size={14} />
              <span>Shutdown PC</span>
            </button>
            <button
              onClick={() => onTriggerPower("restart")}
              className="py-2.5 px-3 rounded-lg bg-amber-600/30 hover:bg-amber-600 border border-amber-500/40 text-amber-200 hover:text-white text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Restart PC</span>
            </button>
            <button
              onClick={() => onTriggerPower("lock")}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs transition-colors cursor-pointer"
            >
              Lock Screen
            </button>
            <button
              onClick={() => onTriggerPower("sleep")}
              className="py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-xs transition-colors cursor-pointer"
            >
              Sleep Mode
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
