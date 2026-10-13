from fastapi.testclient import TestClient
from app.main import app
from app.social.agents.content_agent import ContentAgent

client = TestClient(app)


def test_static_files_serve_correctly():
    css_res = client.get("/frontend/styles.css")
    assert css_res.status_code == 200
    assert "DM Mono" in css_res.text or "body" in css_res.text

    js_res = client.get("/frontend/app.js")
    assert js_res.status_code == 200


def test_content_agent_platform_drafts():
    agent = ContentAgent()
    
    # Instagram draft
    ig = agent.draft("AI automation", "instagram")
    assert ig["platform"] == "instagram"
    assert "visual_prompt" in ig
    assert len(ig["hashtags"]) > 0

    # TikTok draft
    tt = agent.draft("AI automation", "tiktok")
    assert tt["platform"] == "tiktok"
    assert "script" in tt
    assert len(tt["script"]) > 0

    # Facebook draft
    fb = agent.draft("AI automation", "facebook")
    assert fb["platform"] == "facebook"
    assert "discussion_question" in fb


def test_multi_platform_chat_and_approval():
    chat_res = client.post("/api/chat", json={
        "message": "Create a post for Instagram, TikTok, and Facebook about AI command center",
        "approval_mode": True
    })
    assert chat_res.status_code == 200
    data = chat_res.json()
    assert data["status"] == "approval_required"
    assert "instagram" in data["generated_content"]
    assert "tiktok" in data["generated_content"]
    assert "facebook" in data["generated_content"]

    run_id = data["run_id"]

    # Approve action
    appr_res = client.post("/api/approve", json={
        "run_id": run_id,
        "action": "publish_content",
        "platforms": ["instagram", "tiktok", "facebook"],
        "approved": True,
        "sandbox_mode": True
    })
    assert appr_res.status_code == 200
    appr_data = appr_res.json()
    assert appr_data["status"] == "completed"
    assert appr_data["results"]["instagram"]["status"] == "published_sandbox"

    # Verify audit log recorded
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    logs = audit_res.json()
    assert any(log["action"] == "approve_publish" for log in logs)
