import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Mic, 
  MicOff, 
  Loader2, 
  Volume2, 
  VolumeX, 
  Keyboard, 
  Send, 
  Trash2,
  Grid,
  FileText,
  PhoneCall,
  Activity,
  Settings as SettingsIcon,
  Power,
  Sparkles,
  Info,
  ExternalLink
} from "lucide-react";
import { getLuccyResponse, getLuccyAudio, resetLuccySession, getApiKey } from "./services/geminiService";
import { processCommand, CommandResult } from "./services/commandService";
import { LiveSessionManager } from "./services/liveService";
import { 
  shutdownPC, 
  restartPC, 
  lockPC, 
  sleepPC, 
  cancelShutdown, 
  openApp, 
  createNotepadNote, 
  makeCall, 
  adjustVolume,
  checkBridgeHealth
} from "./services/pcBridgeService";
import { WebSpeechRecognizer, speakTextWebSpeech } from "./services/speechService";
import Visualizer from "./components/Visualizer";
import PermissionModal from "./components/PermissionModal";
import ShutdownModal from "./components/ShutdownModal";
import AppLauncherModal from "./components/AppLauncherModal";
import NotepadModal from "./components/NotepadModal";
import CallModal from "./components/CallModal";
import SettingsModal from "./components/SettingsModal";
import SystemStatusDrawer from "./components/SystemStatusDrawer";
import { playPCM } from "./utils/audioUtils";
import { motion, AnimatePresence } from "motion/react";

type AppState = "idle" | "listening" | "processing" | "speaking";

interface ChatMessage {
  id: string;
  sender: "user" | "luccy" | "zoya";
  text: string;
  type?: "action" | "text";
}

export default function App() {
  const [appState, setAppState] = useState<AppState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("luccy_chat_history");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    localStorage.setItem("luccy_chat_history", JSON.stringify(messages));
  }, [messages]);

  const [isMuted, setIsMuted] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isBridgeOnline, setIsBridgeOnline] = useState(true);

  // Modals & Drawers state
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [shutdownMode, setShutdownMode] = useState<"shutdown" | "restart">("shutdown");
  const [showAppLauncher, setShowAppLauncher] = useState(false);
  const [showNotepadModal, setShowNotepadModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showStatusDrawer, setShowStatusDrawer] = useState(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const liveSessionRef = useRef<LiveSessionManager | null>(null);
  const webSpeechRef = useRef<WebSpeechRecognizer | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check PC Bridge Health on mount
  useEffect(() => {
    checkBridgeHealth().then(online => setIsBridgeOnline(online));
  }, []);

  const showNotification = (msg: string) => {
    setActionNotification(msg);
    setTimeout(() => {
      setActionNotification(null);
    }, 4000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, appState]);

  // Execute Core System / Browser / AI Action
  const executeAction = useCallback(async (cmdResult: CommandResult) => {
    let resultMessage = cmdResult.action;

    switch (cmdResult.type) {
      case "shutdown":
        setShutdownMode("shutdown");
        setShowShutdownModal(true);
        await shutdownPC(cmdResult.payload?.delay || 10);
        break;

      case "restart":
        setShutdownMode("restart");
        setShowShutdownModal(true);
        await restartPC(cmdResult.payload?.delay || 10);
        break;

      case "cancel_shutdown":
        setShowShutdownModal(false);
        await cancelShutdown();
        break;

      case "lock":
        await lockPC();
        break;

      case "sleep":
        await sleepPC();
        break;

      case "open_app":
        if (cmdResult.payload?.appName) {
          await openApp(cmdResult.payload.appName);
        }
        break;

      case "create_note":
        if (cmdResult.payload) {
          await createNotepadNote(
            cmdResult.payload.content,
            cmdResult.payload.title,
            cmdResult.payload.openInNotepad
          );
        }
        break;

      case "call":
        if (cmdResult.payload?.target) {
          await makeCall(
            cmdResult.payload.target,
            cmdResult.payload.type || "whatsapp",
            cmdResult.payload.message
          );
        }
        break;

      case "volume":
        if (cmdResult.payload?.action) {
          await adjustVolume(cmdResult.payload.action);
        }
        break;

      case "browser":
        if (cmdResult.payload?.url) {
          setTimeout(() => {
            window.open(cmdResult.payload.url, "_blank");
          }, 1000);
        }
        break;
    }

    if (resultMessage) {
      showNotification(resultMessage);
    }
  }, []);

  // Universal Command Handler (for text or recognized speech)
  const handleCommand = useCallback(async (transcript: string) => {
    const cleanText = transcript.trim();
    if (!cleanText) {
      setAppState("idle");
      return;
    }

    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "user", text: cleanText }]);

    // If Gemini Live session is connected, pass through live session
    if (isSessionActive && liveSessionRef.current) {
      liveSessionRef.current.sendText(cleanText);
      return;
    }

    setAppState("processing");

    // 1. Check local PC automation commands first
    const cmdResult = processCommand(cleanText);

    if (cmdResult.type !== "none") {
      await executeAction(cmdResult);
      const reply = cmdResult.spokenReply || cmdResult.action;

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-l", sender: "luccy", text: reply, type: "action" },
      ]);

      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getLuccyAudio(reply);
        if (audioBase64) {
          await playPCM(audioBase64);
        } else {
          await speakTextWebSpeech(reply);
        }
      }
      setAppState("idle");
    } else {
      // 2. Intelligent Multilingual Chat via Gemini
      const responseText = await getLuccyResponse(cleanText, messagesRef.current);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString() + "-l", sender: "luccy", text: responseText },
      ]);

      if (!isMuted) {
        setAppState("speaking");
        const audioBase64 = await getLuccyAudio(responseText);
        if (audioBase64) {
          await playPCM(audioBase64);
        } else {
          await speakTextWebSpeech(responseText);
        }
      }
      setAppState("idle");
    }
  }, [isMuted, isSessionActive, executeAction]);

  // Clean up sessions
  useEffect(() => {
    return () => {
      if (liveSessionRef.current) liveSessionRef.current.stop();
      if (webSpeechRef.current) webSpeechRef.current.stop();
    };
  }, []);

  // Toggle Voice Session (Dual Engine: Gemini Live or Web Speech)
  const toggleListening = async () => {
    if (isSessionActive) {
      setIsSessionActive(false);
      if (liveSessionRef.current) {
        liveSessionRef.current.stop();
        liveSessionRef.current = null;
      }
      if (webSpeechRef.current) {
        webSpeechRef.current.stop();
        webSpeechRef.current = null;
      }
      setAppState("idle");
      resetLuccySession();
    } else {
      const speechMode = localStorage.getItem("luccy_speech_mode") || "gemini";
      const apiKey = getApiKey();

      // If user selected WebSpeech or has no Gemini API key, use Web Speech Recognition
      if (speechMode === "webspeech" || !apiKey) {
        setIsSessionActive(true);
        setAppState("listening");

        const recognizer = new WebSpeechRecognizer({
          onStart: () => setAppState("listening"),
          onResult: (text, isFinal) => {
            if (isFinal && text) {
              handleCommand(text);
            }
          },
          onError: () => {
            setAppState("idle");
          },
          onEnd: () => {
            if (!isSessionActive) setAppState("idle");
          },
        });

        webSpeechRef.current = recognizer;
        recognizer.start(true);
      } else {
        // High Definition Gemini Live API
        try {
          setIsSessionActive(true);
          resetLuccySession();

          const session = new LiveSessionManager();
          session.isMuted = isMuted;
          liveSessionRef.current = session;

          session.onStateChange = (state) => {
            setAppState(state);
          };

          session.onMessage = (sender, text) => {
            setMessages((prev) => [
              ...prev,
              { id: Date.now().toString() + "-" + sender, sender, text },
            ]);
          };

          session.onActionExecuted = (actionName, detail) => {
            showNotification(detail);
          };

          await session.start();
        } catch (e) {
          console.warn("Falling back to Web Speech API:", e);
          // Fallback to Web Speech API
          const recognizer = new WebSpeechRecognizer({
            onStart: () => setAppState("listening"),
            onResult: (text, isFinal) => {
              if (isFinal && text) {
                handleCommand(text);
              }
            },
            onEnd: () => {
              if (!isSessionActive) setAppState("idle");
            },
          });
          webSpeechRef.current = recognizer;
          recognizer.start(true);
        }
      }
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#04070d] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0 select-none">
      {/* Modals & Dialogs */}
      {showPermissionModal && <PermissionModal onClose={() => setShowPermissionModal(false)} />}
      {showShutdownModal && (
        <ShutdownModal
          mode={shutdownMode}
          onCancelled={() => {
            setShowShutdownModal(false);
            showNotification("Shutdown sequence cancelled.");
          }}
          onFinished={() => setShowShutdownModal(false)}
        />
      )}
      {showAppLauncher && (
        <AppLauncherModal
          onClose={() => setShowAppLauncher(false)}
          onAppLaunched={(name) => showNotification(`Launched ${name}`)}
        />
      )}
      {showNotepadModal && (
        <NotepadModal
          onClose={() => setShowNotepadModal(false)}
          onNoteCreated={(msg) => showNotification(msg)}
        />
      )}
      {showCallModal && (
        <CallModal
          onClose={() => setShowCallModal(false)}
          onCallInitiated={(msg) => showNotification(msg)}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          onSaved={() => showNotification("Settings updated successfully")}
        />
      )}
      {showStatusDrawer && (
        <SystemStatusDrawer
          onClose={() => setShowStatusDrawer(false)}
          onTriggerPower={(act) => {
            if (act === "shutdown") {
              setShutdownMode("shutdown");
              setShowShutdownModal(true);
              shutdownPC(10);
            } else if (act === "restart") {
              setShutdownMode("restart");
              setShowShutdownModal(true);
              restartPC(10);
            } else if (act === "lock") {
              lockPC();
              showNotification("PC locked.");
            } else if (act === "sleep") {
              sleepPC();
              showNotification("Entering sleep mode.");
            }
          }}
        />
      )}

      {/* Cybernetic Ambient Glow Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-cyan-900/20 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[55%] h-[55%] bg-violet-900/20 blur-[130px] rounded-full" />
        <div className="absolute top-[40%] right-[35%] w-[30%] h-[30%] bg-pink-900/10 blur-[140px] rounded-full" />
      </div>

      {/* Action Notification Toast Banner */}
      <AnimatePresence>
        {actionNotification && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-20 z-40 px-5 py-2.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-lg text-cyan-200 text-xs font-mono tracking-wide shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center gap-2"
          >
            <Sparkles size={14} className="text-cyan-400 animate-spin" />
            <span>{actionNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center z-30 shrink-0 px-4 sm:px-8 py-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-pink-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-500/25 border border-white/20">
            L
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-violet-300 bg-clip-text text-transparent">
                Luccy AI
              </h1>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PC Assistant
              </span>
            </div>
          </div>
        </div>

        {/* Quick PC Quick-Action Dock */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* App Launcher Button */}
          <button
            onClick={() => setShowAppLauncher(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-cyan-500/40 text-white/80 hover:text-white transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
            title="Open PC Apps"
          >
            <Grid size={15} className="text-cyan-400" />
            <span className="hidden sm:inline">Apps</span>
          </button>

          {/* Notepad & Quotes Button */}
          <button
            onClick={() => setShowNotepadModal(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-indigo-500/40 text-white/80 hover:text-white transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
            title="Write in Notepad / Quotes"
          >
            <FileText size={15} className="text-indigo-400" />
            <span className="hidden sm:inline">Notepad</span>
          </button>

          {/* Dialer / WhatsApp Call Button */}
          <button
            onClick={() => setShowCallModal(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-500/40 text-white/80 hover:text-white transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
            title="Call / WhatsApp"
          >
            <PhoneCall size={15} className="text-emerald-400" />
            <span className="hidden sm:inline">Call</span>
          </button>

          {/* PC System Diagnostics */}
          <button
            onClick={() => setShowStatusDrawer(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-amber-500/40 text-white/80 hover:text-white transition-all flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
            title="PC System Status"
          >
            <Activity size={15} className="text-amber-400" />
            <span className="hidden sm:inline">Diagnostics</span>
          </button>

          {/* Clear History */}
          {messages.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear conversation history?")) {
                  setMessages([]);
                  resetLuccySession();
                }
              }}
              className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors border border-white/10"
              title="Clear History"
            >
              <Trash2 size={16} className="opacity-70" />
            </button>
          )}

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? (
              <VolumeX size={16} className="text-red-400" />
            ) : (
              <Volume2 size={16} className="opacity-80" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10 cursor-pointer"
            title="Assistant Settings"
          >
            <SettingsIcon size={16} className="opacity-80" />
          </button>
        </div>
      </header>

      {/* Main HUD - Visualizer & Reactive Status */}
      <main className="absolute inset-0 flex flex-row items-center justify-between w-full h-full z-10 overflow-hidden pt-16 pb-28 px-4 sm:px-12 pointer-events-none">
        
        {/* Left Column: Assistant Status */}
        <div className="flex w-[28%] lg:w-[22%] h-full flex-col justify-center gap-4 z-10">
          <div className="h-8">
            <AnimatePresence>
              {appState === "processing" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 text-cyan-300 text-xs sm:text-sm font-mono"
                >
                  <Loader2 size={16} className="animate-spin text-cyan-400" />
                  <span>Processing command...</span>
                </motion.div>
              )}
              {appState === "speaking" && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 text-pink-300 text-xs sm:text-sm font-mono"
                >
                  <Volume2 size={16} className="animate-pulse text-pink-400" />
                  <span>Speaking...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Center Visualizer */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <Visualizer state={appState} />
        </div>

        {/* Right Column: User Status & Language Pill */}
        <div className="flex w-[28%] lg:w-[22%] h-full flex-col justify-center gap-4 z-10">
          <div className="h-8 flex justify-end">
            <AnimatePresence>
              {appState === "listening" && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2 text-violet-300 text-xs sm:text-sm font-mono"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
                  <span>Listening for command...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Controls & Command Bar */}
      <footer className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-center pb-6 sm:pb-8 z-30 shrink-0 gap-3 px-4">
        <AnimatePresence>
          {showTextInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-lg flex flex-col gap-2 pointer-events-auto"
            >
              {/* Quick Sample Prompts */}
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {[
                  { label: "Notepad Quotes", text: "Write motivational quotes in Notepad" },
                  { label: "Shutdown PC", text: "Shutdown my PC" },
                  { label: "Open Chrome", text: "Chrome kholo" },
                  { label: "Call", text: "Call +923000000000" },
                  { label: "Urdu", text: "کیا حال ہے؟ کوئی لطیفہ سناؤ" },
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      handleCommand(sample.text);
                      setShowTextInput(false);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-white/10 hover:bg-cyan-500/20 border border-white/15 text-white/80 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    <span className="text-cyan-400 font-mono mr-1">[{sample.label}]</span>
                    {sample.text}
                  </button>
                ))}
              </div>

              {/* Text Input Form */}
              <form 
                onSubmit={handleTextSubmit}
                className="w-full flex items-center gap-2 bg-[#0d1420]/90 border border-cyan-500/30 rounded-full p-1 pl-4 backdrop-blur-xl shadow-2xl focus-within:border-cyan-400"
              >
                <input 
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask Luccy: 'Open Notepad', 'Quotes likh do', 'Shutdown PC', 'Call'..."
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 text-xs sm:text-sm"
                  autoFocus
                />
                <button 
                  type="submit"
                  disabled={!textInput.trim()}
                  className="p-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 disabled:opacity-40 transition-all cursor-pointer shadow-md"
                >
                  <Send size={15} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Microphone Action Trigger */}
        <div className="flex items-center gap-4 pointer-events-auto">
          <button
            onClick={toggleListening}
            className={`
              group relative flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-semibold tracking-wider text-sm transition-all duration-300 shadow-2xl cursor-pointer
              ${
                isSessionActive
                  ? "bg-red-500/25 text-red-300 border-2 border-red-500/70 hover:bg-red-500/35 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-gradient-to-r from-cyan-600/30 via-violet-600/30 to-pink-600/30 text-white border border-cyan-400/50 hover:border-cyan-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]"
              }
            `}
          >
            {isSessionActive ? (
              <>
                <MicOff size={20} />
                <span>END SESSION</span>
              </>
            ) : (
              <>
                <Mic size={20} className="text-cyan-400 group-hover:animate-bounce" />
                <span>START VOICE SESSION</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowTextInput(!showTextInput)}
            className={`p-3.5 sm:p-4 rounded-full border transition-all shadow-2xl cursor-pointer ${
              showTextInput 
                ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                : "bg-white/5 border-white/15 hover:bg-white/15 text-white/80"
            }`}
            title="Type a command"
          >
            <Keyboard size={18} />
          </button>
        </div>

        {/* Footer Language & Bridge Status Subtitle */}
        <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
          <span>Fluent in Urdu • Roman Urdu • English • Pashto</span>
          <span>•</span>
          <span className={isBridgeOnline ? "text-emerald-400/80" : "text-amber-400/80"}>
            ● PC Bridge {isBridgeOnline ? "Connected" : "Standby"}
          </span>
        </div>
      </footer>
    </div>
  );
}
