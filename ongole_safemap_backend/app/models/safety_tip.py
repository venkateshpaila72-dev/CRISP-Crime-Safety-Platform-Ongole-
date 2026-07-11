from pydantic import BaseModel


class SafetyTip(BaseModel):
    category: str
    tip: str