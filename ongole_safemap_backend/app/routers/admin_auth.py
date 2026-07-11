from fastapi import APIRouter, HTTPException, status

from app.database import admin_users_collection
from app.auth.security import verify_password
from app.auth.dependencies import create_access_token
from app.schemas.common import LoginRequest, TokenResponse

router = APIRouter(prefix="/admin", tags=["admin-auth"])


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest):
    admin = await admin_users_collection.find_one({"email": credentials.email})
    if not admin or not verify_password(credentials.password, admin["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(email=admin["email"])
    return TokenResponse(access_token=token)