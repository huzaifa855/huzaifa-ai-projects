"""
Emaan Tool Registry
Central registry for all tools with metadata, descriptions, and parameter schemas.
The LLM never gets raw shell access — everything goes through registered tools.
"""

from typing import Dict, Any, Callable, Optional, List
from dataclasses import dataclass, field
from app.core.security import RiskLevel, get_risk_level, requires_confirmation
import logging

logger = logging.getLogger("emaan.tools")


@dataclass
class ToolParam:
    """Describes a parameter for a tool."""
    name: str
    type: str  # "string", "integer", "boolean", "number"
    description: str
    required: bool = True
    default: Any = None
    enum: Optional[List[str]] = None


@dataclass
class Tool:
    """A registered tool that Emaan can use."""
    name: str
    description: str
    category: str
    handler: Callable
    parameters: List[ToolParam] = field(default_factory=list)
    risk_level: RiskLevel = RiskLevel.LOW

    def to_openai_function(self) -> dict:
        """Convert to OpenAI function calling format."""
        properties = {}
        required = []
        for param in self.parameters:
            prop = {"type": param.type, "description": param.description}
            if param.enum:
                prop["enum"] = param.enum
            properties[param.name] = prop
            if param.required:
                required.append(param.name)

        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": f"[{self.risk_level.value} risk] {self.description}",
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required,
                },
            },
        }


class ToolRegistry:
    """Central registry for all Emaan tools."""

    def __init__(self):
        self._tools: Dict[str, Tool] = {}

    def register(
        self,
        name: str,
        description: str,
        category: str,
        handler: Callable,
        parameters: Optional[List[ToolParam]] = None,
    ) -> Tool:
        """Register a new tool."""
        tool = Tool(
            name=name,
            description=description,
            category=category,
            handler=handler,
            parameters=parameters or [],
            risk_level=get_risk_level(name),
        )
        self._tools[name] = tool
        logger.info(f"Registered tool: {name} [{tool.risk_level.value}]")
        return tool

    def get(self, name: str) -> Optional[Tool]:
        """Get a tool by name."""
        return self._tools.get(name)

    def list_tools(self) -> List[Tool]:
        """List all registered tools."""
        return list(self._tools.values())

    def list_by_category(self, category: str) -> List[Tool]:
        """List tools by category."""
        return [t for t in self._tools.values() if t.category == category]

    def get_openai_tools(self) -> List[dict]:
        """Get all tools in OpenAI function calling format."""
        return [tool.to_openai_function() for tool in self._tools.values()]

    async def execute(self, name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a tool by name with given parameters."""
        tool = self._tools.get(name)
        if not tool:
            return {"success": False, "error": f"Unknown tool: {name}"}

        try:
            import asyncio
            if asyncio.iscoroutinefunction(tool.handler):
                result = await tool.handler(**params)
            else:
                result = tool.handler(**params)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Tool execution failed: {name} — {e}")
            return {"success": False, "error": str(e)}

    def to_summary(self) -> List[dict]:
        """Return a summary of all tools for the API."""
        return [
            {
                "name": t.name,
                "description": t.description,
                "category": t.category,
                "risk_level": t.risk_level.value,
                "requires_confirmation": requires_confirmation(t.name),
                "parameters": [
                    {"name": p.name, "type": p.type, "description": p.description, "required": p.required}
                    for p in t.parameters
                ],
            }
            for t in self._tools.values()
        ]


# Global tool registry instance
registry = ToolRegistry()
