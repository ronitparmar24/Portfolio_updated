import os
from typing import Optional

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        class BaseSettings:  # type: ignore
            def __init__(self, **kwargs):
                for k, v in kwargs.items():
                    setattr(self, k, v)


class Settings(BaseSettings):
    mongodb_uri: Optional[str] = os.getenv("MONGODB_URI", "")
    mongodb_dbname: str = "portfolio"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
