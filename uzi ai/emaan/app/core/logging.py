"""
Emaan Logging System
Structured logging with action audit trail.
"""

import logging
import os
import json
from datetime import datetime
from app.core.config import settings


def setup_logging():
    """Configure structured logging for Emaan."""
    log_dir = os.path.join(settings.base_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)

    # Main logger
    logger = logging.getLogger("emaan")
    logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    # Console handler
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console_fmt = logging.Formatter(
        "%(asctime)s │ %(levelname)-7s │ %(name)-12s │ %(message)s",
        datefmt="%H:%M:%S"
    )
    console.setFormatter(console_fmt)
    logger.addHandler(console)

    # File handler
    log_file = os.path.join(log_dir, f"emaan_{datetime.now().strftime('%Y%m%d')}.log")
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.DEBUG)
    file_fmt = logging.Formatter(
        "%(asctime)s │ %(levelname)-7s │ %(name)-12s │ %(message)s"
    )
    file_handler.setFormatter(file_fmt)
    logger.addHandler(file_handler)

    return logger


def log_action(action: str, details: dict, risk_level: str = "LOW"):
    """Log a tool/action execution for the audit trail."""
    logger = logging.getLogger("emaan.audit")
    log_dir = os.path.join(settings.base_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)

    entry = {
        "timestamp": datetime.now().isoformat(),
        "action": action,
        "risk_level": risk_level,
        "details": details,
    }

    audit_file = os.path.join(log_dir, "audit.jsonl")
    with open(audit_file, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry) + "\n")

    logger.info(f"[{risk_level}] {action}: {json.dumps(details)}")
