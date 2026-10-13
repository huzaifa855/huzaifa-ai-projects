# 🚀 Luccy AI - Windows PC Voice Assistant

**Luccy AI** is a multilingual AI desktop voice assistant designed for Windows PC with direct operating system automation, Gemini Live audio stream intelligence, speech recognition, and instant action execution.

---

## 🌟 Key Features

1. **⚡ PC Power & System Controls**:
   - **Shutdown PC**: Voice command with a 10-second visual HUD countdown and instant cancel button.
   - **Restart PC**: Scheduled restart with abort option.
   - **Lock PC & Sleep Mode**: Instantly lock workstation or enter sleep state.
   - **Cancel Shutdown**: Voice or one-click cancel (`shutdown /a`).

2. **🚀 Universal PC Application Launcher**:
   - Launch any installed Windows software or tool by voice:
     - `Notepad`, `Google Chrome`, `VS Code`, `Calculator`, `File Explorer`, `Task Manager`, `Spotify`, `MS Paint`, `Settings`, `Camera`, `Word`, `Excel`, `PowerPoint`, `Command Prompt`, `PowerShell`, and custom executables.

3. **📝 Notepad & Quotes Writing Automation**:
   - Ask Luccy to generate inspirational, wisdom, coding, or Allama Iqbal quotes.
   - Automatically writes the text to a `.txt` note file and opens it in `notepad.exe` on Windows.
   - Dictate notes: *"Notepad bana do jisme likha ho..."* / *"Create note saying..."*.

4. **📞 Voice & Phone Calling Integration**:
   - **WhatsApp Calls / Messages**: One-click and voice integration with WhatsApp Web & Desktop.
   - **Windows Phone Link (`tel:` protocol)**: Make cellular phone calls directly through your linked phone.
   - **Skype & Google Meet**: Quick instant meeting creation and calling.
   - **Built-in Contact Book**: Save favorite contacts (Name, Phone, Relationship) for instant voice dialing.

5. **🌐 Polyglot Multilingual AI**:
   - Speaks and understands **Urdu, Roman Urdu, English, Pashto, Punjabi, Sindhi, and Hindi**.
   - Futuristic Iron Man / JARVIS holographic visualizer.

6. **🔊 Dual Speech Engine Architecture**:
   - **Gemini Live Multimodal AI** for ultra-high-definition interactive voice responses.
   - **Native Web Speech API** fallback for offline microphone recognition and synthesis.

---

## 💻 How to Run on Windows

### Method 1: One-Click Launcher (Recommended)
Simply double click:
```bash
start-assistant.bat
```
This will automatically verify dependencies, start the background PC bridge server, launch the frontend, and open your browser to `http://localhost:3000`.

### Method 2: Manual Terminal Run
```bash
# 1. Install dependencies
npm install

# 2. Start the OS Bridge Server (Port 3001)
npx tsx server.ts

# 3. In another terminal, start Vite (Port 3000)
npm run dev
```
Open **`http://localhost:3000`** in Chrome or Edge.

### Method 3: Native Windows App

Install Node.js 20 or newer, then run:

```bash
npm install
npm run desktop
```

This opens Luccy AI in its own Windows desktop window and starts the PC bridge automatically. To create a distributable Windows installer, run:

```bash
npm run desktop:dist
```

The installer is written to the `release` folder.

---

## 🎙️ Example Voice Commands

| Category | Example Commands (English / Roman Urdu) |
|---|---|
| **Power** | *"Shutdown PC"*, *"PC band kardo"*, *"Restart computer"*, *"Cancel shutdown"*, *"Lock screen"* |
| **Apps** | *"Open Notepad"*, *"Chrome kholo"*, *"Open VS Code"*, *"Calculator kholo"*, *"Open Spotify"* |
| **Quotes & Notes** | *"Write quotes in Notepad"*, *"Notepad mein motivational quotes likho"*, *"Create note: Buy groceries"* |
| **Calling** | *"Call +923001234567"*, *"Ali ko call lagao"*, *"Send WhatsApp message to +1234567 saying Hello"* |
| **Volume** | *"Volume up"*, *"Awaaz badhao"*, *"Volume down"*, *"Mute PC"* |
| **Conversation** | *"Who built you?"*, *"Kya haal hai?"*, *"Koi mazedaar latifa sunao"*, *"What's the weather today?"* |

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend Bridge**: Node.js, Express, Child Process (PowerShell / Windows API)
- **AI Models**: Google Gemini 2.5 Flash, Gemini Live Audio Preview, Web Speech API
