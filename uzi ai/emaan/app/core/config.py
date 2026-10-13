"""
Emaan Core Configuration
Loads settings from environment variables / .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Emaan application settings."""

    # --- App ---
    app_name: str = "Emaan"
    app_version: str = "0.1.0"
    debug: bool = False

    # --- LLM ---
    openai_api_key: Optional[str] = None
    emaan_model: str = "gpt-4o"
    emaan_temperature: float = 0.7

    # --- Server ---
    emaan_host: str = "0.0.0.0"
    emaan_port: int = 8000
    log_level: str = "INFO"

    # --- Security ---
    emaan_require_confirmation: bool = True

    # --- Database ---
    emaan_db_path: str = "data/emaan.db"

    # --- Paths ---
    base_dir: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()
