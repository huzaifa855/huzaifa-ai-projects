from app.ai.schemas import PlanStep


class PermissionError(Exception):
    pass


def authorize(step: PlanStep, approval_mode: bool) -> str:
    if step.requires_approval and approval_mode:
        return "approval_required"
    if step.permission == "DELETE":
        raise PermissionError("Delete actions are blocked until an explicit approval flow is implemented.")
    return "authorized"
