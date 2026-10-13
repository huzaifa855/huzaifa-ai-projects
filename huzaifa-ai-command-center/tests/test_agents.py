from app.agents.planner import Planner


def test_content_plan_requires_publish_approval():
    plan = Planner().create_plan("Create an Instagram post about AI automation")
    publish_step = next(step for step in plan.steps if step.action == "publish_content")
    assert publish_step.requires_approval is True
    assert publish_step.permission == "PUBLISH"


def test_code_plan_includes_validation():
    plan = Planner().create_plan("Create a Python project and run tests")
    assert any(step.action == "run_validation" for step in plan.steps)
