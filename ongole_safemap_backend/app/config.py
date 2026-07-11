from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # MongoDB
    mongodb_uri: str
    mongodb_db_name: str = "ongole_safemap"

    # JWT Auth
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 120

    # First admin account (used by scripts/seed_db.py)
    admin_email: str = "admin@ongolesafemap.local"
    admin_password: str = "changeme"

    # CORS — comma-separated list of allowed origins. Both local dev
    # servers (public frontend + admin) need to be listed since Vite
    # picks the next free port (5173, 5174, ...) if one's already taken.
    cors_origins: str = "http://localhost:5173,http://localhost:5174"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    # Groq (used by the tourist safety chat assistant)
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()