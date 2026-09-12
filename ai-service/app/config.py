import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "TourMatch AI & PyTorch Recommendation Service"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))

    class Config:
        env_file = ".env"

settings = Settings()
