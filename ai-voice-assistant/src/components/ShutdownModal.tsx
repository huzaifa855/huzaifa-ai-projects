import React, { useEffect, useState } from "react";
import { AlertTriangle, XCircle, Power } from "lucide-react";
import { motion } from "motion/react";
import { cancelShutdown } from "../services/pcBridgeService";

interface ShutdownModalProps {
  initialSeconds?: number;
  mode?: "shutdown" | "restart";
  onCancelled: () => void;
  onFinished: () => void;
}

export default function ShutdownModal({
  initialSeconds = 10,
  mode = "shutdown",
  onCancelled,
  onFinished,
}: ShutdownModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isAborted, setIsAborted] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onFinished();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onFinished]);

  const handleCancel = async () => {
    setIsAborted(true);
    await cancelShutdown();
    setTimeout(() => {
      onCancelled();
    }, 800);
  };

  const progressPercent = ((initialSeconds - secondsLeft) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md rounded-2xl bg-gradient-to-b from-[#180a0a] via-[#100505] to-[#0a0202] border-2 border-red-500/50 p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(239,68,68,0.4)] overflow-hidden"
      >
        {/* Glowing pulse ring in background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="flex items-center justify-center gap-2 mb-4 text-red-400 font-mono tracking-widest text-xs uppercase">
          <AlertTriangle className="animate-bounce" size={18} />
          <span>System Power Warning</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-wide font-sans">
          {mode === "restart" ? "PC RESTART PENDING" : "PC SHUTDOWN PENDING"}
        </h2>
        <p className="text-white/70 text-sm mb-6">
          Luccy Voice Assistant has triggered a system {mode}. Say{" "}
          <span className="text-red-400 font-semibold">"Cancel shutdown"</span> or click below to abort.
        </p>

        {/* Countdown Ring */}
        <div className="relative w-36 h-36 mx-auto my-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-red-950/60"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-red-500 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeDasharray={276}
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black font-mono text-red-400 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
              {secondsLeft}
            </span>
            <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">
              Seconds
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={handleCancel}
            disabled={isAborted}
            className="w-full py-4 px-6 rounded-xl font-bold text-base tracking-wider uppercase bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/40 hover:shadow-red-500/60 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-red-400/40 cursor-pointer"
          >
            <XCircle size={22} />
            <span>{isAborted ? "Aborted!" : "ABORT / CANCEL NOW"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
