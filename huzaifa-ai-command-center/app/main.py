from typing import Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.agents.orchestrator import orchestrator
from app.ai.schemas import ApprovalRequest, ApprovalResponse, ChatRequest, ChatResponse
from app.security.audit import audit_log

app = FastAPI(title="Huzaifa AI Command Center", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount frontend static directory so styles and scripts load
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "huzaifa-ai-command-center"}


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    run_id, plan, status, generated_content = orchestrator.plan(request.message, request.approval_mode)
    adapter_status = {
        "instagram": "Sandbox Ready (Meta Graph API)",
        "tiktok": "Sandbox Ready (TikTok Open API)",
        "facebook": "Sandbox Ready (Meta Page API)",
    }
    return ChatResponse(
        message="Plan created & content generated. Review drafts below. Publish requires approval." if status == "approval_required" else "Plan created and ready for review.",
        plan=plan,
        status=status,
        run_id=run_id,
        generated_content=generated_content,
        adapter_status=adapter_status,
    )


@app.post("/api/approve", response_model=ApprovalResponse)
def approve_action(request: ApprovalRequest) -> ApprovalResponse:
    result = orchestrator.approve(
        run_id=request.run_id,
        platforms=request.platforms,
        sandbox_mode=request.sandbox_mode
    )
    return ApprovalResponse(
        run_id=request.run_id,
        status=result["status"],
        message=result["message"],
        results=result["results"],
        audit_entry=result["audit_entry"]
    )


@app.get("/api/audit")
def get_audit_logs() -> list[dict[str, Any]]:
    return list(reversed(audit_log.entries))


@app.get("/api/social/platforms")
def get_platforms() -> dict[str, Any]:
    return {
        "platforms": [
            {
                "id": "instagram",
                "name": "Instagram",
                "icon": "📸",
                "type": "Reels, Carousels, Stories",
                "status": "Ready (Sandbox / Guarded)",
                "requires_approval": True,
                "api_provider": "Meta Graph API v20.0"
            },
            {
                "id": "tiktok",
                "name": "TikTok",
                "icon": "🎵",
                "type": "Vertical Short-Form Video (9:16)",
                "status": "Ready (Sandbox / Guarded)",
                "requires_approval": True,
                "api_provider": "TikTok for Developers Open API"
            },
            {
                "id": "facebook",
                "name": "Facebook",
                "icon": "👥",
                "type": "Page Posts, Group Discussion, Stories",
                "status": "Ready (Sandbox / Guarded)",
                "requires_approval": True,
                "api_provider": "Meta Pages & Graph API"
            }
        ]
    }


@app.get("/", include_in_schema=False)
def dashboard() -> FileResponse:
    return FileResponse("frontend/index.html")
