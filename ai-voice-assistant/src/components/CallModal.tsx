import React, { useState, useEffect } from "react";
import { 
  X, 
  Phone, 
  PhoneCall, 
  MessageSquare, 
  Video, 
  UserPlus, 
  Trash2, 
  Search, 
  User, 
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { motion } from "motion/react";
import { 
  makeCall, 
  getContactsList, 
  saveNewContact, 
  Contact 
} from "../services/pcBridgeService";

interface CallModalProps {
  onClose: () => void;
  onCallInitiated: (message: string) => void;
}

export default function CallModal({ onClose, onCallInitiated }: CallModalProps) {
  const [activeTab, setActiveTab] = useState<"dialer" | "contacts" | "add">("contacts");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  
  // Dialer state
  const [dialNumber, setDialNumber] = useState("");
  const [callType, setCallType] = useState<"whatsapp" | "phone" | "skype" | "meet">("whatsapp");
  const [customMsg, setCustomMsg] = useState("");

  // Add Contact state
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRelation, setNewRelation] = useState("Friend");

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const list = await getContactsList();
    setContacts(list);
  };

  const handleTriggerCall = async (
    target: string, 
    type: "whatsapp" | "phone" | "skype" | "meet" = callType, 
    msg?: string
  ) => {
    if (!target.trim()) return;
    const res = await makeCall(target, type, msg);
    onCallInitiated(res.message);
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    const updated = await saveNewContact({
      name: newName.trim(),
      phone: newPhone.trim(),
      relation: newRelation,
    });
    setContacts(updated);
    setNewName("");
    setNewPhone("");
    setActiveTab("contacts");
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.relation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-xl max-h-[85vh] rounded-2xl bg-[#0e1615]/95 border border-emerald-500/30 p-6 shadow-[0_0_50px_rgba(16,185,129,0.25)] flex flex-col overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <PhoneCall size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-wide">PC Voice & Phone Dialer</h2>
              <p className="text-xs text-white/50">Call via WhatsApp Web, Windows Phone Link, or Skype</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 my-3 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "contacts"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Contacts ({contacts.length})
          </button>
          <button
            onClick={() => setActiveTab("dialer")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              activeTab === "dialer"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            Keypad & Direct Dial
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
              activeTab === "add"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserPlus size={13} />
            Add Contact
          </button>
        </div>

        {/* TAB 1: CONTACTS */}
        {activeTab === "contacts" && (
          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <Search size={15} className="text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search contact by name or number..."
                className="w-full bg-transparent border-none outline-none text-xs text-white placeholder:text-white/30"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
              {filteredContacts.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full bg-gradient-to-tr ${c.avatarColor || "from-emerald-500 to-teal-600"} flex items-center justify-center text-white font-bold text-xs shrink-0`}
                    >
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-white truncate flex items-center gap-1.5">
                        <span>{c.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-white/60 font-mono">
                          {c.relation}
                        </span>
                      </div>
                      <div className="text-[11px] text-white/50 font-mono mt-0.5">
                        {c.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTriggerCall(c.phone, "whatsapp")}
                      className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors"
                      title="WhatsApp Call / Chat"
                    >
                      <MessageSquare size={14} />
                    </button>
                    <button
                      onClick={() => handleTriggerCall(c.phone, "phone")}
                      className="p-2 rounded-lg bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 transition-colors"
                      title="Direct Phone Call (Phone Link)"
                    >
                      <Phone size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT DIALER */}
        {activeTab === "dialer" && (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            {/* Phone Number Display */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <input
                type="text"
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                placeholder="Enter phone number or contact name..."
                className="w-full text-center bg-transparent border-none outline-none font-mono text-lg text-emerald-400 placeholder:text-white/20 font-bold"
              />
            </div>

            {/* Mode selection */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
                { id: "phone", label: "Phone Link", icon: Phone },
                { id: "skype", label: "Skype", icon: Video },
                { id: "meet", label: "Google Meet", icon: Video },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    onClick={() => setCallType(m.id as any)}
                    className={`p-2.5 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                      callType === m.id
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                        : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Keypad */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto w-full my-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "+", "0", "#"].map((digit) => (
                <button
                  key={digit}
                  onClick={() => setDialNumber((prev) => prev + digit)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-base font-mono font-bold text-white transition-colors active:scale-95"
                >
                  {digit}
                </button>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setDialNumber("")}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => handleTriggerCall(dialNumber, callType, customMsg)}
                disabled={!dialNumber.trim()}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-40"
              >
                <PhoneCall size={16} />
                <span>START CALL NOW</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: ADD CONTACT */}
        {activeTab === "add" && (
          <form onSubmit={handleAddContact} className="flex-1 flex flex-col gap-3">
            <div>
              <label className="text-[11px] text-white/50 uppercase font-mono block mb-1">
                Full Name:
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Ali Khan, Sarah, Boss"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-emerald-500/50 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-white/50 uppercase font-mono block mb-1">
                Phone Number (with Country Code):
              </label>
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="e.g. +923001234567 or 03001234567"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-emerald-500/50 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] text-white/50 uppercase font-mono block mb-1">
                Relationship / Tag:
              </label>
              <select
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value)}
                className="w-full bg-[#16201e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none"
              >
                <option value="Family">Family</option>
                <option value="Friend">Friend</option>
                <option value="Work">Work / Office</option>
                <option value="Emergency">Emergency</option>
                <option value="Doctor">Doctor</option>
              </select>
            </div>

            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("contacts")}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white/70"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
