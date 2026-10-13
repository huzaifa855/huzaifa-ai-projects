import React, { useState, useEffect } from "react";
import { 
  X, 
  FileText, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  FolderOpen,
  Quote,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { createNotepadNote, getNotesList, NoteItem } from "../services/pcBridgeService";
import { generateAIQuotes } from "../services/geminiService";

interface NotepadModalProps {
  onClose: () => void;
  onNoteCreated: (message: string) => void;
}

const TOPIC_PRESETS = [
  { id: "inspiration", label: "✨ Motivation & Hustle" },
  { id: "wisdom", label: "🧠 Life & Wisdom" },
  { id: "iqbal", label: "🦅 Allama Iqbal Quotes" },
  { id: "coding", label: "💻 Programmer Wisdom" },
  { id: "success", label: "🏆 Success & Leadership" },
  { id: "urdu", label: "📖 Urdu Quotes & Shayari" },
];

export default function NotepadModal({ onClose, onNoteCreated }: NotepadModalProps) {
  const [activeTab, setActiveTab] = useState<"generator" | "history">("generator");
  const [topic, setTopic] = useState("inspiration");
  const [noteTitle, setNoteTitle] = useState("Daily Quotes");
  const [noteContent, setNoteContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notesHistory, setNotesHistory] = useState<NoteItem[]>([]);

  useEffect(() => {
    // Generate initial quotes on open if empty
    loadInitialQuotes("inspiration");
    loadNotesHistory();
  }, []);

  const loadInitialQuotes = async (selectedTopic: string) => {
    setIsGenerating(true);
    const quotes = await generateAIQuotes(selectedTopic);
    setNoteContent(quotes);
    setIsGenerating(false);
  };

  const loadNotesHistory = async () => {
    const list = await getNotesList();
    setNotesHistory(list);
  };

  const handleGenerate = async (selectedTopic: string) => {
    setTopic(selectedTopic);
    setIsGenerating(true);
    const quotes = await generateAIQuotes(selectedTopic);
    setNoteContent(quotes);
    setIsGenerating(false);
  };

  const handleOpenInNotepad = async () => {
    if (!noteContent.trim()) return;
    setIsSaving(true);
    const res = await createNotepadNote(noteContent, noteTitle, true);
    setIsSaving(false);
    onNoteCreated(res.message || "Opened in Notepad!");
    loadNotesHistory();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[85vh] rounded-2xl bg-[#0c121e]/95 border border-indigo-500/30 p-6 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
              <Quote size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">Notepad & Quotes Generator</h2>
              <p className="text-xs text-white/50">Write quotes/notes and launch directly in PC Notepad</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 my-3 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("generator")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "generator"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Create & Generate Quotes
          </button>
          <button
            onClick={() => {
              setActiveTab("history");
              loadNotesHistory();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <FolderOpen size={13} />
            Saved Notes ({notesHistory.length})
          </button>
        </div>

        {activeTab === "generator" ? (
          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            {/* Topic Presets */}
            <div>
              <label className="text-[11px] text-white/50 uppercase font-mono tracking-wider mb-1.5 block">
                Select Theme / Category:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TOPIC_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleGenerate(p.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      topic === p.id
                        ? "bg-indigo-500/20 border-indigo-400 text-indigo-300"
                        : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note Title */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title (e.g. Daily Inspiration)..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-indigo-500/50 outline-none"
              />
              <button
                onClick={() => handleGenerate(topic)}
                disabled={isGenerating}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Regenerate with AI"
              >
                <RefreshCw size={13} className={isGenerating ? "animate-spin" : ""} />
                <span>Regenerate</span>
              </button>
            </div>

            {/* Content Textarea */}
            <div className="flex-1 relative min-h-[160px]">
              {isGenerating ? (
                <div className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 text-indigo-300">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-xs font-mono">Generating quotes via AI...</span>
                </div>
              ) : (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Type your notes or let AI write quotes here..."
                  className="w-full h-full min-h-[160px] bg-white/5 border border-white/10 rounded-xl p-3 text-xs font-mono text-white/90 placeholder:text-white/30 focus:border-indigo-500/50 outline-none resize-none"
                />
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Text"}</span>
              </button>

              <button
                onClick={handleOpenInNotepad}
                disabled={isSaving || !noteContent.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSaving ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <ExternalLink size={15} />
                )}
                <span>OPEN IN PC NOTEPAD</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {notesHistory.length === 0 ? (
              <div className="text-center py-10 text-white/40 text-xs font-mono">
                No saved notes found yet. Create a note to see it here!
              </div>
            ) : (
              notesHistory.map((note, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs text-white truncate">
                      {note.fileName}
                    </div>
                    <div className="text-[10px] text-white/50 truncate font-mono mt-0.5">
                      {note.snippet || "Empty note"}
                    </div>
                    <div className="text-[9px] text-indigo-400/80 font-mono mt-1">
                      {new Date(note.created).toLocaleString()}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await createNotepadNote(note.snippet, note.fileName, true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    <span>Open</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
