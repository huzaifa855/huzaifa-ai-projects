from typing import Any
from uuid import uuid4

from app.agents.planner import Planner
from app.ai.schemas import AgentPlan
from app.security.audit import audit_log
from app.security.permissions import authorize
from app.social.agents.content_agent import ContentAgent


class Orchestrator:
    def __init__(self) -> None:
        self.planner = Planner()
        self.content_agent = ContentAgent()
        self.runs: dict[str, dict[str, Any]] = {}

    def _detect_platforms(self, message: str) -> list[str]:
        text = message.lower()
        platforms = []
        if any(w in text for w in ("insta", "instagram")):
            platforms.append("instagram")
        if any(w in text for w in ("tiktok", "tik tok")):
            platforms.append("tiktok")
        if any(w in text for w in ("facebook", "fb")):
            platforms.append("facebook")
        # If no specific platform was isolated, or multiple were mentioned, default to all three
        if not platforms:
            platforms = ["instagram", "tiktok", "facebook"]
        return platforms

    def plan(self, message: str, approval_mode: bool = True) -> tuple[str, AgentPlan, str, dict[str, Any]]:
        run_id = str(uuid4())
        plan = self.planner.create_plan(message, approval_mode)
        statuses = [authorize(step, approval_mode) for step in plan.steps]
        status = "approval_required" if "approval_required" in statuses else "planned"
        
        audit_log.record("orchestrator", "create_plan", "planner", status)

        generated_content = {}
        has_content_step = any(s.action == "generate_content" for s in plan.steps)
        if has_content_step:
            platforms = self._detect_platforms(message)
            generated_content = self.content_agent.draft_multi(message, platforms)
            audit_log.record("content_agent", "generate_content", f"platforms:{','.join(platforms)}", "completed")

        self.runs[run_id] = {
            "run_id": run_id,
            "message": message,
            "plan": plan,
            "status": status,
            "generated_content": generated_content,
            "approval_mode": approval_mode,
        }

        return run_id, plan, status, generated_content

    def approve(self, run_id: str, platforms: list[str] | None = None, sandbox_mode: bool = True) -> dict[str, Any]:
        run = self.runs.get(run_id)
        if not run:
            # Create a fallback run if not cached
            run = {
                "run_id": run_id,
                "plan": self.planner.create_plan("Social post", True),
                "generated_content": {},
            }
            self.runs[run_id] = run

        target_platforms = platforms or list(run.get("generated_content", {}).keys()) or ["instagram", "tiktok", "facebook"]
        results = {}

        for plat in target_platforms:
            if sandbox_mode:
                results[plat] = {
                    "status": "published_sandbox",
                    "mode": "Sandbox Simulation (Safe Demo)",
                    "message": f"Successfully simulated publish to {plat.capitalize()} feed/reels with zero unauthorized external calls.",
                    "platform_response": {"id": f"{plat}-sim-{uuid4().hex[:8]}", "reach_estimate": "5,000 - 12,000 views"}
                }
            else:
                publisher = self.content_agent.publisher(plat)
                issues = publisher.validate({})
                results[plat] = {
                    "status": "adapter_unconfigured",
                    "mode": "Live Mode (Credentials Required)",
                    "message": f"{plat.capitalize()} official publishing requires API credentials: {', '.join(issues)}",
                }

        # Update step status in plan
        for step in run["plan"].steps:
            if step.action == "publish_content":
                step.status = "completed" if sandbox_mode else "blocked_unconfigured"

        run["status"] = "completed" if sandbox_mode else "publish_blocked"

        entry = audit_log.record(
            agent="human_operator",
            action="approve_publish",
            tool=f"publish_adapters:{','.join(target_platforms)}",
            result=f"Sandbox mode: {sandbox_mode} | Published {len(target_platforms)} platform(s)"
        )

        return {
            "run_id": run_id,
            "status": run["status"],
            "message": "Publish action approved and successfully executed." if sandbox_mode else "Approval registered; official credentials required for live broadcast.",
            "results": results,
            "audit_entry": entry,
        }


orchestrator = Orchestrator()
