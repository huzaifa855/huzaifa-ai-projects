import shlex
import subprocess


ALLOWED_COMMANDS = {"python", "python3", "pip", "pytest", "node", "npm", "git", "uvicorn"}


def run_command(command: str, cwd: str = ".") -> str:
    parts = shlex.split(command, posix=False)
    if not parts or parts[0].lower() not in ALLOWED_COMMANDS:
        raise PermissionError("Command is not on the terminal allowlist")
    completed = subprocess.run(parts, cwd=cwd, capture_output=True, text=True, timeout=60, check=False)
    output = (completed.stdout + completed.stderr).strip()
    if completed.returncode:
        raise RuntimeError(output or f"Command failed with exit code {completed.returncode}")
    return output
