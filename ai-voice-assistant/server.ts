import express from "express";
import { exec, spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

// Storage Directory Setup for Assistant Notes and Contacts
const userHome = os.homedir();
const notesDir = path.join(userHome, "Documents", "LuccyNotes");
if (!fs.existsSync(notesDir)) {
  try {
    fs.mkdirSync(notesDir, { recursive: true });
  } catch (e) {
    console.error("Failed to create notes dir:", e);
  }
}

const contactsFilePath = path.join(notesDir, "contacts.json");
const defaultContacts = [
  { id: "1", name: "Emergency Services", phone: "112", relation: "Emergency", avatarColor: "from-red-500 to-rose-600" },
  { id: "2", name: "Huzaifa (Creator)", phone: "+923000000000", relation: "Developer", avatarColor: "from-violet-500 to-indigo-600" },
  { id: "3", name: "Home / Family", phone: "+923123456789", relation: "Family", avatarColor: "from-emerald-500 to-teal-600" },
  { id: "4", name: "Work / Office", phone: "+923219876543", relation: "Work", avatarColor: "from-amber-500 to-orange-600" }
];

function getContacts() {
  if (fs.existsSync(contactsFilePath)) {
    try {
      const data = fs.readFileSync(contactsFilePath, "utf-8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse contacts:", e);
    }
  }
  return defaultContacts;
}

function saveContacts(contacts: any[]) {
  try {
    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save contacts:", e);
  }
}

// -------------------------------------------------------------
// SYSTEM STATUS & HEALTH
// -------------------------------------------------------------
app.get("/api/pc/health", (req, res) => {
  res.json({
    status: "online",
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    hostname: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

app.get("/api/pc/system-info", (req, res) => {
  const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024) * 10) / 10;
  const freeMem = Math.round(os.freemem() / (1024 * 1024 * 1024) * 10) / 10;
  const usedMem = Math.round((totalMem - freeMem) * 10) / 10;
  const memUsagePercent = Math.round((usedMem / totalMem) * 100);

  res.json({
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.round(os.uptime() / 60), // minutes
    cpuCores: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || "Unknown CPU",
    totalMemoryGB: totalMem,
    freeMemoryGB: freeMem,
    usedMemoryGB: usedMem,
    memoryUsagePercent: memUsagePercent
  });
});

// -------------------------------------------------------------
// PC POWER CONTROLS (SHUTDOWN / RESTART / LOCK / SLEEP / CANCEL)
// -------------------------------------------------------------
app.post("/api/pc/shutdown", (req, res) => {
  const delay = typeof req.body.delay === "number" ? req.body.delay : 10;
  const command = process.platform === "win32" 
    ? `shutdown.exe /s /t ${delay} /c "Shutdown initiated by Luccy AI Voice Assistant"`
    : `sudo shutdown -h +${Math.max(1, Math.round(delay / 60))}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Shutdown error:", err, stderr);
      return res.status(500).json({ success: false, error: stderr || err.message });
    }
    res.json({ 
      success: true, 
      message: `System will shut down in ${delay} seconds. Say 'Cancel shutdown' to abort.`,
      delay 
    });
  });
});

app.post("/api/pc/restart", (req, res) => {
  const delay = typeof req.body.delay === "number" ? req.body.delay : 10;
  const command = process.platform === "win32"
    ? `shutdown.exe /r /t ${delay} /c "Restart initiated by Luccy AI Voice Assistant"`
    : `sudo shutdown -r +${Math.max(1, Math.round(delay / 60))}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Restart error:", err, stderr);
      return res.status(500).json({ success: false, error: stderr || err.message });
    }
    res.json({ 
      success: true, 
      message: `System will restart in ${delay} seconds.`,
      delay 
    });
  });
});

app.post("/api/pc/cancel-shutdown", (req, res) => {
  const command = process.platform === "win32" ? "shutdown.exe /a" : "sudo shutdown -c";

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Cancel shutdown error:", err, stderr);
      return res.json({ success: false, message: "No active shutdown was pending or already cancelled." });
    }
    res.json({ success: true, message: "Shutdown or restart has been cancelled successfully!" });
  });
});

app.post("/api/pc/lock", (req, res) => {
  const command = process.platform === "win32"
    ? "rundll32.exe user32.dll,LockWorkStation"
    : "gnome-screensaver-command -l";

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Lock error:", err, stderr);
      return res.status(500).json({ success: false, error: stderr || err.message });
    }
    res.json({ success: true, message: "PC locked successfully." });
  });
});

app.post("/api/pc/sleep", (req, res) => {
  const command = process.platform === "win32"
    ? `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"`
    : "systemctl suspend";

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("Sleep error:", err, stderr);
      return res.status(500).json({ success: false, error: stderr || err.message });
    }
    res.json({ success: true, message: "Putting PC to sleep mode." });
  });
});

// -------------------------------------------------------------
// APP LAUNCHER (OPEN ANY INSTALLED APP / TOOL)
// -------------------------------------------------------------
const APP_MAP: Record<string, string> = {
  // Common Utilities
  notepad: "notepad.exe",
  calculator: "calc.exe",
  calc: "calc.exe",
  chrome: "start chrome",
  "google chrome": "start chrome",
  edge: "start msedge",
  "microsoft edge": "start msedge",
  firefox: "start firefox",
  "vs code": "code",
  vscode: "code",
  code: "code",
  "task manager": "start taskmgr",
  taskmgr: "start taskmgr",
  "file explorer": "explorer.exe",
  explorer: "explorer.exe",
  files: "explorer.exe",
  cmd: "start cmd",
  "command prompt": "start cmd",
  powershell: "start powershell",
  terminal: "start wt",
  "windows terminal": "start wt",
  settings: "start ms-settings:",
  camera: "start microsoft.windows.camera:",
  paint: "mspaint.exe",
  mspaint: "mspaint.exe",
  snippingtool: "snippingtool.exe",
  "snipping tool": "snippingtool.exe",
  
  // Media & Social
  spotify: "start spotify:",
  youtube: "start https://www.youtube.com",
  whatsapp: "start whatsapp:",
  discord: "start discord:",
  telegram: "start telegram:",
  
  // Productivity
  word: "start winword",
  "ms word": "start winword",
  excel: "start excel",
  "ms excel": "start excel",
  powerpoint: "start powerpnt",
  "ms powerpoint": "start powerpnt",
  outlook: "start outlook",
};

app.post("/api/pc/open-app", (req, res) => {
  const { appName } = req.body;
  if (!appName) {
    return res.status(400).json({ success: false, error: "App name is required" });
  }

  const cleanName = appName.toLowerCase().trim();
  let commandToRun = APP_MAP[cleanName];

  if (!commandToRun) {
    // Check if partial match in APP_MAP
    for (const [key, cmd] of Object.entries(APP_MAP)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        commandToRun = cmd;
        break;
      }
    }
  }

  if (!commandToRun) {
    // Fallback to PowerShell Start-Process
    const sanitizedApp = cleanName.replace(/["';`$]/g, "");
    commandToRun = `powershell -Command "Start-Process '${sanitizedApp}' -ErrorAction SilentlyContinue; if (!$?) { Start-Process 'https://www.google.com/search?q=${encodeURIComponent(sanitizedApp)}' }"`;
  }

  console.log(`[App Launcher] Opening: "${cleanName}" via command: ${commandToRun}`);

  exec(commandToRun, (err, stdout, stderr) => {
    if (err) {
      console.warn("App launch warning:", err.message);
    }
    res.json({
      success: true,
      appName: cleanName,
      message: `Launched ${cleanName} on your PC.`
    });
  });
});

// -------------------------------------------------------------
// NOTEPAD & QUOTES AUTOMATION
// -------------------------------------------------------------
app.post("/api/pc/create-note", (req, res) => {
  const { title = "Note", content = "", openInNotepad = true, fileName } = req.body;
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const safeName = fileName || `Note_${timestamp}.txt`;
  const filePath = path.join(notesDir, safeName);

  const formattedContent = 
`==================================================
 LUCCY AI VOICE ASSISTANT - NOTE / QUOTE
 Created: ${new Date().toLocaleString()}
 Title:   ${title}
==================================================

${content}

==================================================
 Generated via Luccy AI for PC
==================================================
`;

  try {
    fs.writeFileSync(filePath, formattedContent, "utf-8");
    console.log(`[Notepad] Created note at: ${filePath}`);

    if (openInNotepad && process.platform === "win32") {
      exec(`notepad.exe "${filePath}"`, (err) => {
        if (err) console.error("Error opening notepad:", err);
      });
    }

    res.json({
      success: true,
      filePath,
      fileName: safeName,
      message: `Successfully wrote note and opened Notepad!`
    });
  } catch (error: any) {
    console.error("Error writing note:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/pc/notes", (req, res) => {
  try {
    if (!fs.existsSync(notesDir)) {
      return res.json({ notes: [] });
    }
    const files = fs.readdirSync(notesDir).filter(f => f.endsWith(".txt"));
    const notes = files.map(file => {
      const fullPath = path.join(notesDir, file);
      const stat = fs.statSync(fullPath);
      let snippet = "";
      try {
        const text = fs.readFileSync(fullPath, "utf-8");
        snippet = text.slice(0, 200);
      } catch (e) {}
      return {
        fileName: file,
        filePath: fullPath,
        created: stat.birthtime,
        size: stat.size,
        snippet
      };
    }).sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

    res.json({ notes });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// -------------------------------------------------------------
// CALLING & DIALER (WHATSAPP, PHONE LINK, SKYPE, MEET)
// -------------------------------------------------------------
app.post("/api/pc/call", (req, res) => {
  const { type = "whatsapp", target = "", message = "" } = req.body;

  if (!target) {
    return res.status(400).json({ success: false, error: "Target contact or phone number required." });
  }

  const cleanNumber = target.replace(/[^\d+]/g, "");
  let actionUrl = "";
  let launchCmd = "";

  switch (type.toLowerCase()) {
    case "whatsapp":
      actionUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(cleanNumber)}${message ? `&text=${encodeURIComponent(message)}` : ""}`;
      launchCmd = process.platform === "win32" ? `start "" "${actionUrl}"` : `open "${actionUrl}"`;
      break;

    case "phone":
    case "cellular":
      // Triggers Windows Phone Link / default dialer
      actionUrl = `tel:${cleanNumber}`;
      launchCmd = process.platform === "win32" ? `start "" "tel:${cleanNumber}"` : `open "tel:${cleanNumber}"`;
      break;

    case "skype":
      actionUrl = `skype:${cleanNumber || target}?call`;
      launchCmd = process.platform === "win32" ? `start "" "skype:${cleanNumber || target}?call"` : `open "skype:${cleanNumber || target}?call"`;
      break;

    case "meet":
      actionUrl = "https://meet.google.com/new";
      launchCmd = process.platform === "win32" ? `start "" "${actionUrl}"` : `open "${actionUrl}"`;
      break;

    default:
      actionUrl = `https://web.whatsapp.com/send?phone=${encodeURIComponent(cleanNumber)}`;
      launchCmd = process.platform === "win32" ? `start "" "${actionUrl}"` : `open "${actionUrl}"`;
  }

  console.log(`[Call Manager] Launching ${type} call to: ${target}`);

  exec(launchCmd, (err) => {
    if (err) console.warn("Call launch notice:", err.message);
  });

  res.json({
    success: true,
    type,
    target,
    actionUrl,
    message: `Initiating ${type} call to ${target}...`
  });
});

// -------------------------------------------------------------
// CONTACTS MANAGEMENT
// -------------------------------------------------------------
app.get("/api/pc/contacts", (req, res) => {
  res.json({ contacts: getContacts() });
});

app.post("/api/pc/contacts", (req, res) => {
  const { name, phone, relation, avatarColor } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const contacts = getContacts();
  const newContact = {
    id: Date.now().toString(),
    name,
    phone,
    relation: relation || "Contact",
    avatarColor: avatarColor || "from-violet-500 to-fuchsia-600"
  };

  contacts.unshift(newContact);
  saveContacts(contacts);
  res.json({ success: true, contact: newContact, contacts });
});

app.delete("/api/pc/contacts/:id", (req, res) => {
  const { id } = req.params;
  let contacts = getContacts();
  contacts = contacts.filter(c => c.id !== id);
  saveContacts(contacts);
  res.json({ success: true, contacts });
});

// -------------------------------------------------------------
// SYSTEM VOLUME CONTROL
// -------------------------------------------------------------
app.post("/api/pc/volume", (req, res) => {
  const { action = "up" } = req.body;
  
  if (process.platform === "win32") {
    let psKey = "";
    if (action === "up") psKey = "[char]175";       // VK_VOLUME_UP
    else if (action === "down") psKey = "[char]174"; // VK_VOLUME_DOWN
    else if (action === "mute") psKey = "[char]173"; // VK_VOLUME_MUTE

    const psCommand = `powershell -Command "$wscript = New-Object -ComObject Wscript.Shell; $wscript.SendKeys(${psKey}); $wscript.SendKeys(${psKey})"`;
    exec(psCommand, (err) => {
      if (err) console.error("Volume adjustment error:", err);
    });
  }

  res.json({ success: true, action, message: `Volume ${action} executed.` });
});

// Serve frontend if dist exists (for standalone production build)
const distPath = path.join(__dirname, "dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  🚀 LUCCY AI PC SYSTEM BRIDGE RUNNING`);
  console.log(`  🔗 Server Port: http://localhost:${PORT}`);
  console.log(`  📁 Notes Directory: ${notesDir}`);
  console.log(`====================================================`);
});
