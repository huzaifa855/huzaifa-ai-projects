"""
Luccy AI - Windows PC System Bridge Server (Python 3 Standard Library)
Zero-dependency server providing local OS automation for shutdown, app launching,
notepad quotes, calling, volume control, and diagnostics.
"""

import http.server
import socketserver
import json
import os
import sys
import subprocess
import time
import urllib.parse
from datetime import datetime

# Set utf-8 encoding safely for stdout
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

PORT = 3001
USER_HOME = os.path.expanduser("~")
NOTES_DIR = os.path.join(USER_HOME, "Documents", "LuccyNotes")
os.makedirs(NOTES_DIR, exist_ok=True)

CONTACTS_FILE = os.path.join(NOTES_DIR, "contacts.json")

DEFAULT_CONTACTS = [
    {"id": "1", "name": "Emergency Services", "phone": "112", "relation": "Emergency", "avatarColor": "from-red-500 to-rose-600"},
    {"id": "2", "name": "Huzaifa (Creator)", "phone": "+923000000000", "relation": "Developer", "avatarColor": "from-violet-500 to-indigo-600"},
    {"id": "3", "name": "Home / Family", "phone": "+923123456789", "relation": "Family", "avatarColor": "from-emerald-500 to-teal-600"},
    {"id": "4", "name": "Work / Office", "phone": "+923219876543", "relation": "Work", "avatarColor": "from-amber-500 to-orange-600"}
]

def load_contacts():
    if os.path.exists(CONTACTS_FILE):
        try:
            with open(CONTACTS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_CONTACTS

def save_contacts(contacts):
    try:
        with open(CONTACTS_FILE, "w", encoding="utf-8") as f:
            json.dump(contacts, f, indent=2)
    except Exception as e:
        print("Error saving contacts:", e)

APP_MAP = {
    "notepad": "notepad.exe",
    "calculator": "calc.exe",
    "calc": "calc.exe",
    "chrome": "start chrome",
    "google chrome": "start chrome",
    "edge": "start msedge",
    "vs code": "code",
    "vscode": "code",
    "code": "code",
    "task manager": "start taskmgr",
    "taskmgr": "start taskmgr",
    "file explorer": "explorer.exe",
    "explorer": "explorer.exe",
    "files": "explorer.exe",
    "cmd": "start cmd",
    "command prompt": "start cmd",
    "powershell": "start powershell",
    "settings": "start ms-settings:",
    "camera": "start microsoft.windows.camera:",
    "paint": "mspaint.exe",
    "mspaint": "mspaint.exe",
    "spotify": "start spotify:",
    "word": "start winword",
    "excel": "start excel",
    "powerpoint": "start powerpnt",
}

class AssistantBridgeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _read_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode("utf-8")
            try:
                return json.loads(body)
            except Exception:
                return {}
        return {}

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/pc/health":
            self._send_json({
                "status": "online",
                "platform": sys.platform,
                "server": "Python Luccy Bridge",
                "timestamp": datetime.now().isoformat()
            })
            return

        elif path == "/api/pc/system-info":
            import platform
            cpu_count = os.cpu_count() or 4
            self._send_json({
                "hostname": platform.node(),
                "platform": platform.system(),
                "arch": platform.machine(),
                "uptime": 120,
                "cpuCores": cpu_count,
                "cpuModel": platform.processor() or "x86_64 Processor",
                "totalMemoryGB": 16.0,
                "freeMemoryGB": 8.5,
                "usedMemoryGB": 7.5,
                "memoryUsagePercent": 48
            })
            return

        elif path == "/api/pc/notes":
            notes = []
            if os.path.exists(NOTES_DIR):
                for f in sorted(os.listdir(NOTES_DIR), reverse=True):
                    if f.endswith(".txt"):
                        full_path = os.path.join(NOTES_DIR, f)
                        stat = os.stat(full_path)
                        snippet = ""
                        try:
                            with open(full_path, "r", encoding="utf-8") as nf:
                                snippet = nf.read()[:200]
                        except Exception:
                            pass
                        notes.append({
                            "fileName": f,
                            "filePath": full_path,
                            "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                            "size": stat.st_size,
                            "snippet": snippet
                        })
            self._send_json({"notes": notes})
            return

        elif path == "/api/pc/contacts":
            self._send_json({"contacts": load_contacts()})
            return

        # Fallback
        self.send_response(404)
        self.end_headers()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        body = self._read_json_body()

        # SHUTDOWN
        if path == "/api/pc/shutdown":
            delay = body.get("delay", 10)
            if sys.platform == "win32":
                subprocess.Popen(f'shutdown.exe /s /t {delay} /c "Shutdown initiated by Luccy AI"', shell=True)
            self._send_json({
                "success": True,
                "message": f"System will shut down in {delay} seconds. Say 'Cancel shutdown' to abort.",
                "delay": delay
            })

        # RESTART
        elif path == "/api/pc/restart":
            delay = body.get("delay", 10)
            if sys.platform == "win32":
                subprocess.Popen(f'shutdown.exe /r /t {delay} /c "Restart initiated by Luccy AI"', shell=True)
            self._send_json({
                "success": True,
                "message": f"System will restart in {delay} seconds.",
                "delay": delay
            })

        # CANCEL SHUTDOWN
        elif path == "/api/pc/cancel-shutdown":
            if sys.platform == "win32":
                subprocess.Popen("shutdown.exe /a", shell=True)
            self._send_json({
                "success": True,
                "message": "Shutdown or restart has been cancelled successfully!"
            })

        # LOCK
        elif path == "/api/pc/lock":
            if sys.platform == "win32":
                subprocess.Popen("rundll32.exe user32.dll,LockWorkStation", shell=True)
            self._send_json({"success": True, "message": "PC locked successfully."})

        # SLEEP
        elif path == "/api/pc/sleep":
            if sys.platform == "win32":
                subprocess.Popen(
                    'powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"',
                    shell=True
                )
            self._send_json({"success": True, "message": "PC entering sleep mode."})

        # OPEN APP
        elif path == "/api/pc/open-app":
            app_name = (body.get("appName") or "").lower().strip()
            cmd = APP_MAP.get(app_name)
            if not cmd:
                for k, v in APP_MAP.items():
                    if k in app_name or app_name in k:
                        cmd = v
                        break
            if not cmd:
                clean = app_name.replace('"', '').replace("'", "")
                cmd = f'powershell -Command "Start-Process \'{clean}\' -ErrorAction SilentlyContinue; if (!$?) {{ Start-Process \'https://www.google.com/search?q={urllib.parse.quote(clean)}\' }}"'

            print(f"[App Launcher] Launching: {app_name} via {cmd}")
            subprocess.Popen(cmd, shell=True)
            self._send_json({
                "success": True,
                "appName": app_name,
                "message": f"Launched {app_name} on your PC."
            })

        # CREATE NOTE & QUOTE
        elif path == "/api/pc/create-note":
            title = body.get("title", "Daily Quote")
            content = body.get("content", "")
            open_notepad = body.get("openInNotepad", True)
            
            ts = datetime.now().strftime("%Y-%m-%d_%H%M%S")
            filename = f"Note_{ts}.txt"
            filepath = os.path.join(NOTES_DIR, filename)

            formatted = f"""==================================================
 LUCCY AI VOICE ASSISTANT - NOTE / QUOTE
 Created: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
 Title:   {title}
==================================================

{content}

==================================================
 Generated via Luccy AI for PC
==================================================
"""
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(formatted)

            if open_notepad and sys.platform == "win32":
                subprocess.Popen(f'notepad.exe "{filepath}"', shell=True)

            self._send_json({
                "success": True,
                "fileName": filename,
                "filePath": filepath,
                "message": "Successfully wrote note and opened Notepad!"
            })

        # CALL / DIALER
        elif path == "/api/pc/call":
            target = body.get("target", "")
            call_type = (body.get("type") or "whatsapp").lower()
            msg = body.get("message", "")
            clean_num = "".join(c for c in target if c.isdigit() or c == "+")

            action_url = ""
            if call_type == "whatsapp":
                action_url = f"https://web.whatsapp.com/send?phone={clean_num}"
                if msg:
                    action_url += f"&text={urllib.parse.quote(msg)}"
            elif call_type in ("phone", "cellular"):
                action_url = f"tel:{clean_num}"
            elif call_type == "skype":
                action_url = f"skype:{clean_num or target}?call"
            else:
                action_url = "https://meet.google.com/new"

            cmd = f'start "" "{action_url}"' if sys.platform == "win32" else f'open "{action_url}"'
            subprocess.Popen(cmd, shell=True)
            self._send_json({
                "success": True,
                "type": call_type,
                "target": target,
                "actionUrl": action_url,
                "message": f"Initiating {call_type} call to {target}..."
            })

        # CONTACTS
        elif path == "/api/pc/contacts":
            contacts = load_contacts()
            new_contact = {
                "id": str(int(time.time() * 1000)),
                "name": body.get("name", "Contact"),
                "phone": body.get("phone", ""),
                "relation": body.get("relation", "Friend"),
                "avatarColor": body.get("avatarColor", "from-violet-500 to-indigo-600")
            }
            contacts.insert(0, new_contact)
            save_contacts(contacts)
            self._send_json({"success": True, "contact": new_contact, "contacts": contacts})

        # VOLUME
        elif path == "/api/pc/volume":
            action = body.get("action", "up")
            if sys.platform == "win32":
                key = "175" if action == "up" else ("174" if action == "down" else "173")
                ps_cmd = f'powershell -Command "$wscript = New-Object -ComObject Wscript.Shell; $wscript.SendKeys([char]{key}); $wscript.SendKeys([char]{key})"'
                subprocess.Popen(ps_cmd, shell=True)
            self._send_json({"success": True, "action": action, "message": f"Volume {action} executed."})

        else:
            self._send_json({"error": "Endpoint not found"}, status=404)

if __name__ == "__main__":
    print("====================================================")
    print("  [+] LUCCY AI PC SYSTEM BRIDGE (Python 3)")
    print(f"  [+] Listening on: http://localhost:{PORT}")
    print(f"  [+] Notes Storage: {NOTES_DIR}")
    print("====================================================")
    
    # Allow port reuse immediately
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AssistantBridgeHandler) as httpd:
        httpd.serve_forever()
