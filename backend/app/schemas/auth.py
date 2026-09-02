from pydantic import BaseModel, EmailStr
from app.models.user import UserRole


class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole
    phone: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
