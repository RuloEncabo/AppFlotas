from pydantic.v1 import BaseSettings
from functools import lru_cache


class EnvSettings(BaseSettings):
    DB_URL:str
    ORIGINS:list[str]
    COOKIE_DOMAIN:str
    SECRET_KEY:str

    class Config:
        env_file = ".env.dev"
        env_file_encoding= "utf-8"

@lru_cache()
def get_env_settings():
    return EnvSettings()

enviro = get_env_settings()
