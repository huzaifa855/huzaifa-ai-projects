from typing import Any, Literal

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    approval_mode: bool = True


class PlanStep(BaseModel):
    id: str
    action: str
    description: str
    permission: Literal["READ", "WRITE", "EXECUTE", "PUBLISH", "DELETE", "ADMIN"] = "READ"
    requires_approval: bool = False
    status: str = "pending"


class AgentPlan(BaseModel):
    goal: str
    steps: list[PlanStep]
    notes: list[str] = []


class ChatResponse(BaseModel):
    message: str
    plan: AgentPlan
    status: str
    run_id: str
    generated_content: dict[str, Any] | None = None
    adapter_status: dict[str, str] | None = None


class ApprovalRequest(BaseModel):
    run_id: str
    action: str = "publish_content"
    platforms: list[str] = Field(default_factory=lambda: ["instagram", "tiktok", "facebook"])
    approved: bool = True
    sandbox_mode: bool = True


class ApprovalResponse(BaseModel):
    run_id: str
    status: str
    message: str
    results: dict[str, Any]
    audit_entry: dict[str, Any]
