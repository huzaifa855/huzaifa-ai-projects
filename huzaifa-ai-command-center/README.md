# Huzaifa AI Command Center

A permissioned AI operations workspace for coding tasks, content generation, media workflows, and future social publishing adapters.

## MVP

- FastAPI backend with a chat endpoint
- Planner and orchestrator with structured plans
- Safe filesystem and terminal tools with allowlists
- Approval-aware action model
- Audit log for agent actions
- Lightweight browser dashboard

## Run

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Open127 http://.0.0.1:8000 in a browser.

Set `OPENAI_API_KEY` only when connecting a real model. The default planner is deterministic so the project runs without external credentials.
