from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


@dataclass
class AuditLog:
    entries: list[dict[str, Any]] = field(default_factory=list)

    def record(self, agent: str, action: str, tool: str, result: str) -> dict[str, Any]:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": agent,
            "action": action,
            "tool": tool,
            "result": result,
        }
        self.entries.append(entry)
        return entry


# In-memory for the MVP; persist this behind a database repository in the next phase.
audit_log = AuditLog()
