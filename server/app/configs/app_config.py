from typing import Literal
from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class AppConfig(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    ENVIRONMENT: Literal["local", "staging", "production"] = "local"
    PROJECT_NAME: str = "SERVER"
    API_STR: str = "/api"

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: list[AnyUrl] | str = []

    LIVEKIT_KEY: str = "livekitkey"
    LIVEKIT_SECRET: str = "livekitsecret"

    TURN_SECRET: str = "turnsecret"
    TURN_TTL: int = 3600

    @property
    def all_cors_origins(self) -> list[str]:
        if isinstance(self.BACKEND_URL, str):
            return self.BACKEND_URL.split(",") + [self.FRONTEND_URL]
        return [str(origin) for origin in self.BACKEND_URL] + [self.FRONTEND_URL]


app_config = AppConfig()
