import os
from pydantic import BaseModel

class Settings(BaseModel):
    app_name: str = "Telegram MiniApp Durak"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list = ["*"]

    class Config:
        env_file = ".env"

settings = Settings()
