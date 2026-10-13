"""
Emaan System Tools
PC control: open/close apps, shutdown, restart, lock, sleep, volume, system info.
"""

import subprocess
import platform
import os
import ctypes
import logging

logger = logging.getLogger("emaan.tools.system")

# Common application paths on Windows
APP_REGISTRY = {
    "chrome": "chrome",
    "google chrome": "chrome",
    "firefox": "firefox",
    "edge": "msedge",
    "microsoft edge": "msedge",
    "notepad": "notepad",
    "calculator": "calc",
    "calc": "calc",
    "paint": "mspaint",
    "cmd": "cmd",
    "command prompt": "cmd",
    "terminal": "wt",
    "windows terminal": "wt",
    "powershell": "powershell",
    "file explorer": "explorer",
    "explorer": "explorer",
    "task manager": "taskmgr",
    "control panel": "control",
    "settings": "ms-settings:",
    "snipping tool": "snippingtool",
    "word": "winword",
    "excel": "excel",
    "powerpoint": "powerpnt",
    "outlook": "outlook",
    "teams": "msteams",
    "discord": "discord",
    "spotify": "spotify",
    "vlc": "vlc",
    "obs": "obs64",
    "steam": "steam",
    # VS Code — try common install locations
    "vscode": "code",
    "vs code": "code",
    "visual studio code": "code",
}


def open_application(name: str) -> str:
    """Open an application by name."""
    app_key = name.lower().strip()
    command = APP_REGISTRY.get(app_key, app_key)

    try:
        if command.startswith("ms-settings"):
            os.startfile(command)
        else:
            subprocess.Popen(
                f'start "" "{command}"',
                shell=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        logger.info(f"Opened application: {name} (command: {command})")
        return f"Successfully opened {name}."
    except Exception as e:
        logger.error(f"Failed to open {name}: {e}")
        return f"Failed to open {name}: {str(e)}"


def close_application(name: str) -> str:
    """Close an application by name."""
    app_key = name.lower().strip()
    process_name = APP_REGISTRY.get(app_key, app_key)

    try:
        result = subprocess.run(
            f'taskkill /IM "{process_name}.exe" /F',
            shell=True,
            capture_output=True,
            text=True,
        )
        if result.returncode == 0:
            return f"Successfully closed {name}."
        else:
            # Try with the raw name
            result2 = subprocess.run(
                f'taskkill /IM "{name}.exe" /F',
                shell=True,
                capture_output=True,
                text=True,
            )
            if result2.returncode == 0:
                return f"Successfully closed {name}."
            return f"Could not find {name} running."
    except Exception as e:
        return f"Failed to close {name}: {str(e)}"


def lock_pc() -> str:
    """Lock the workstation."""
    try:
        ctypes.windll.user32.LockWorkStation()
        return "PC has been locked."
    except Exception as e:
        return f"Failed to lock PC: {str(e)}"


def shutdown_pc() -> str:
    """Shut down the PC (requires confirmation)."""
    try:
        subprocess.run("shutdown /s /t 30 /c \"Emaan is shutting down the PC in 30 seconds.\"", shell=True)
        return "Shutdown initiated. PC will shut down in 30 seconds. Run 'shutdown /a' to cancel."
    except Exception as e:
        return f"Failed to initiate shutdown: {str(e)}"


def restart_pc() -> str:
    """Restart the PC (requires confirmation)."""
    try:
        subprocess.run("shutdown /r /t 30 /c \"Emaan is restarting the PC in 30 seconds.\"", shell=True)
        return "Restart initiated. PC will restart in 30 seconds. Run 'shutdown /a' to cancel."
    except Exception as e:
        return f"Failed to initiate restart: {str(e)}"


def sleep_pc() -> str:
    """Put the PC to sleep."""
    try:
        subprocess.run("rundll32.exe powrprof.dll,SetSuspendState 0,1,0", shell=True)
        return "PC is going to sleep."
    except Exception as e:
        return f"Failed to put PC to sleep: {str(e)}"


def set_volume(level: int) -> str:
    """Set system volume (0-100)."""
    try:
        # Use PowerShell to set volume via Windows Audio
        level = max(0, min(100, level))
        ps_cmd = f"""
        $obj = New-Object -ComObject WScript.Shell
        1..50 | ForEach-Object {{ $obj.SendKeys([char]174) }}
        1..{level // 2} | ForEach-Object {{ $obj.SendKeys([char]175) }}
        """
        subprocess.run(["powershell", "-Command", ps_cmd], capture_output=True)
        return f"Volume set to approximately {level}%."
    except Exception as e:
        return f"Failed to set volume: {str(e)}"


def get_system_info() -> dict:
    """Get basic system information."""
    import psutil

    try:
        cpu_percent = psutil.cpu_percent(interval=0.5)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        net = psutil.net_io_counters()
        battery = psutil.sensors_battery()

        info = {
            "platform": platform.system(),
            "platform_version": platform.version(),
            "processor": platform.processor(),
            "hostname": platform.node(),
            "cpu_percent": cpu_percent,
            "cpu_cores": psutil.cpu_count(),
            "memory_total_gb": round(memory.total / (1024 ** 3), 2),
            "memory_used_gb": round(memory.used / (1024 ** 3), 2),
            "memory_percent": memory.percent,
            "disk_total_gb": round(disk.total / (1024 ** 3), 2),
            "disk_used_gb": round(disk.used / (1024 ** 3), 2),
            "disk_percent": disk.percent,
            "network_sent_mb": round(net.bytes_sent / (1024 ** 2), 2),
            "network_recv_mb": round(net.bytes_recv / (1024 ** 2), 2),
        }

        if battery:
            info["battery_percent"] = battery.percent
            info["battery_plugged"] = battery.power_plugged

        return info
    except Exception as e:
        return {"error": str(e)}
