import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_current_dir = Path(__file__).resolve().parent # core
_service_app_dir = _current_dir.parent.parent.parent # backend/service_app
_candidates = [
    _service_app_dir / ".env",
    Path(".env").resolve(),
    _service_app_dir.parent / ".env",
]
_env_path = next((str(p) for p in _candidates if p.is_file()), ".env")

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./service_app.db"
    SECRET_KEY: str = "mysecretkey12345"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200 # 30 days (1 month)

    model_config = SettingsConfigDict(env_file=_env_path, env_file_encoding="utf-8", extra="ignore")

settings = Settings()