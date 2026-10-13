/**
 * PC Bridge Service for interacting with local Windows OS APIs
 */

export interface SystemInfo {
  hostname: string;
  platform: string;
  arch: string;
  uptime: number;
  cpuCores: number;
  cpuModel: string;
  totalMemoryGB: number;
  freeMemoryGB: number;
  usedMemoryGB: number;
  memoryUsagePercent: number;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  avatarColor: string;
}

export interface NoteItem {
  fileName: string;
  filePath: string;
  created: string;
  size: number;
  snippet: string;
}

const API_BASE = "/api/pc";

export async function checkBridgeHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getSystemInfo(): Promise<SystemInfo | null> {
  try {
    const res = await fetch(`${API_BASE}/system-info`);
    if (!res.ok) throw new Error("Failed to fetch system info");
    return await res.json();
  } catch (e) {
    console.error("System info error:", e);
    return null;
  }
}

export async function shutdownPC(delay: number = 10): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/shutdown`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delay }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to trigger shutdown" };
  }
}

export async function restartPC(delay: number = 10): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/restart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delay }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to trigger restart" };
  }
}

export async function cancelShutdown(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/cancel-shutdown`, { method: "POST" });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to cancel shutdown" };
  }
}

export async function lockPC(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/lock`, { method: "POST" });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to lock PC" };
  }
}

export async function sleepPC(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/sleep`, { method: "POST" });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to sleep PC" };
  }
}

export async function openApp(appName: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/open-app`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appName }),
    });
    return await res.json();
  } catch (e: any) {
    // Fallback: if browser only, try to open web version
    window.open(`https://www.google.com/search?q=${encodeURIComponent(appName)}`, "_blank");
    return { success: true, message: `Opened search for ${appName}` };
  }
}

export async function createNotepadNote(
  content: string,
  title: string = "Quote",
  openInNotepad: boolean = true
): Promise<{ success: boolean; filePath?: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/create-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, openInNotepad }),
    });
    return await res.json();
  } catch (e: any) {
    // Web fallback: download as .txt file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Note_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a);
    return { success: true, message: "Saved note file to your downloads." };
  }
}

export async function getNotesList(): Promise<NoteItem[]> {
  try {
    const res = await fetch(`${API_BASE}/notes`);
    const data = await res.json();
    return data.notes || [];
  } catch {
    return [];
  }
}

export async function makeCall(
  target: string,
  type: "whatsapp" | "phone" | "skype" | "meet" = "whatsapp",
  message?: string
): Promise<{ success: boolean; message: string; actionUrl?: string }> {
  try {
    const res = await fetch(`${API_BASE}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, type, message }),
    });
    const data = await res.json();
    if (data.actionUrl) {
      window.open(data.actionUrl, "_blank");
    }
    return data;
  } catch (e: any) {
    const cleanNumber = target.replace(/[^\d+]/g, "");
    let fallbackUrl = "";
    if (type === "whatsapp") {
      fallbackUrl = `https://web.whatsapp.com/send?phone=${cleanNumber}${message ? `&text=${encodeURIComponent(message)}` : ""}`;
    } else if (type === "phone") {
      fallbackUrl = `tel:${cleanNumber}`;
    } else if (type === "skype") {
      fallbackUrl = `skype:${cleanNumber}?call`;
    } else {
      fallbackUrl = "https://meet.google.com/new";
    }
    window.open(fallbackUrl, "_blank");
    return { success: true, message: `Calling ${target}...`, actionUrl: fallbackUrl };
  }
}

export async function getContactsList(): Promise<Contact[]> {
  try {
    const res = await fetch(`${API_BASE}/contacts`);
    const data = await res.json();
    return data.contacts || [];
  } catch {
    const local = localStorage.getItem("luccy_contacts");
    if (local) {
      try { return JSON.parse(local); } catch {}
    }
    return [
      { id: "1", name: "Emergency Services", phone: "112", relation: "Emergency", avatarColor: "from-red-500 to-rose-600" },
      { id: "2", name: "Huzaifa (Creator)", phone: "+923000000000", relation: "Developer", avatarColor: "from-violet-500 to-indigo-600" },
    ];
  }
}

export async function saveNewContact(contact: { name: string; phone: string; relation?: string }): Promise<Contact[]> {
  try {
    const res = await fetch(`${API_BASE}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contact),
    });
    const data = await res.json();
    return data.contacts;
  } catch {
    return [];
  }
}

export async function adjustVolume(action: "up" | "down" | "mute" | "unmute"): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/volume`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    return await res.json();
  } catch (e: any) {
    return { success: false, message: e.message || "Failed to adjust volume" };
  }
}
