from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Huzaifa AI Command Center"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "change-me"
    openai_api_key: str | None = None
    openai_model: str | None = None
    workspace_root: Path = Path(".")
    require_approval_for_publish: bool = True
    require_approval_for_delete: bool = True
    require_approval_for_git_push: bool = False

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
