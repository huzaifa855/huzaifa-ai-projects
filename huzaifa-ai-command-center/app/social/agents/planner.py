from app.ai.schemas import AgentPlan, PlanStep


class Planner:
    """Deterministic MVP planner; replace its decision layer with an LLM later."""

    def create_plan(self, message: str, approval_mode: bool = True) -> AgentPlan:
        text = message.lower()
        steps = [
            PlanStep(
                id="understand",
                action="analyze_request",
                description="Understand the objective and required outputs.",
                permission="READ",
            )
        ]
        if any(word in text for word in ("project", "code", "file", "debug", "python", "website")):
            steps.extend([
                PlanStep(id="inspect", action="inspect_workspace", description="Inspect the relevant workspace before changing files.", permission="READ"),
                PlanStep(id="implement", action="prepare_code_changes", description="Prepare focused code changes and explain the intended edits.", permission="WRITE", requires_approval=approval_mode),
                PlanStep(id="validate", action="run_validation", description="Run the narrowest available tests or checks.", permission="EXECUTE"),
            ])
        if any(word in text for word in ("post", "content", "caption", "instagram", "insta", "tiktok", "tik tok", "facebook", "fb", "linkedin", "reel", "reels", "threads", "social")):
            steps.extend([
                PlanStep(id="content", action="generate_content", description="Draft platform-aware content, visual hooks, and hashtags.", permission="WRITE", status="completed"),
                PlanStep(id="review", action="quality_check", description="Check content for clarity, platform fit, and unsupported claims.", permission="READ", status="completed"),
                PlanStep(id="publish", action="publish_content", description="Publish only through configured official adapters.", permission="PUBLISH", requires_approval=True, status="waiting_approval" if approval_mode else "pending"),
            ])
        if len(steps) == 1:
            steps.append(PlanStep(id="answer", action="draft_response", description="Draft a concise answer or next action.", permission="READ"))
        return AgentPlan(
            goal=message,
            steps=steps,
            notes=["External publishing and destructive actions remain approval-gated."]
        )
