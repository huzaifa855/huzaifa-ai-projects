"""
Emaan Security & Permission System
Controls which tools require confirmation before execution.
"""

from enum import Enum
from typing import Dict


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


# Permission definitions for each risk level
RISK_DESCRIPTIONS = {
    RiskLevel.LOW: "Safe operations — no confirmation needed",
    RiskLevel.MEDIUM: "Moderate risk — confirmation recommended",
    RiskLevel.HIGH: "Dangerous operation — confirmation REQUIRED",
}

# Tools and their risk levels
TOOL_PERMISSIONS: Dict[str, RiskLevel] = {
    # System tools
    "open_application": RiskLevel.LOW,
    "close_application": RiskLevel.LOW,
    "list_running_apps": RiskLevel.LOW,
    "focus_window": RiskLevel.LOW,
    "minimize_window": RiskLevel.LOW,
    "maximize_window": RiskLevel.LOW,
    "get_system_info": RiskLevel.LOW,
    "get_system_stats": RiskLevel.LOW,
    "set_volume": RiskLevel.LOW,
    "take_screenshot": RiskLevel.LOW,

    "lock_pc": RiskLevel.MEDIUM,
    "sleep_pc": RiskLevel.MEDIUM,

    "shutdown_pc": RiskLevel.HIGH,
    "restart_pc": RiskLevel.HIGH,

    # Browser tools
    "open_browser": RiskLevel.LOW,
    "search_web": RiskLevel.LOW,

    # File tools
    "list_directory": RiskLevel.LOW,
    "read_file": RiskLevel.LOW,
    "create_file": RiskLevel.MEDIUM,
    "move_file": RiskLevel.MEDIUM,
    "delete_file": RiskLevel.HIGH,
}


def get_risk_level(tool_name: str) -> RiskLevel:
    """Get the risk level for a tool. Defaults to MEDIUM for unknown tools."""
    return TOOL_PERMISSIONS.get(tool_name, RiskLevel.MEDIUM)


def requires_confirmation(tool_name: str) -> bool:
    """Check if a tool requires user confirmation before execution."""
    risk = get_risk_level(tool_name)
    return risk == RiskLevel.HIGH


def is_allowed(tool_name: str) -> bool:
    """Check if a tool is in the allowed registry."""
    return tool_name in TOOL_PERMISSIONS
