"""
Authentication routes module
Handles user registration, login, and profile management
"""
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, timezone
import bcrypt
import jwt
import uuid
import os

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Import shared resources from main server
# These will be injected during router initialization
db = None
JWT_SECRET = os.environ.get("JWT_SECRET", "your-super-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"


def set_database(database):
    """Set the database connection for this router"""
    global db
    db = database


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    user_type: str = "client"  # client, enterprise, influencer


class UserLogin(BaseModel):
    email: EmailStr
    password: str


def create_token(user_id: str, user_type: str) -> str:
    payload = {
        "user_id": user_id,
        "user_type": user_type,
        "exp": datetime.now(timezone.utc).timestamp() + 86400 * 7  # 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token invalide")


async def get_current_user(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Non authentifié")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


@router.post("/register")
async def register(user_data: UserCreate):
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Cet email est déjà utilisé")
    
    # Hash password
    hashed_password = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt()).decode()
    
    user = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": hashed_password,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "user_type": user_data.user_type,
        "avatar": None,
        "is_premium": False,
        "premium_plan": "free",
        "is_online": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    del user["password"]
    user.pop("_id", None)
    
    token = create_token(user["id"], user["user_type"])
    return {"token": token, "user": user}


@router.post("/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not bcrypt.checkpw(credentials.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_token(user["id"], user["user_type"])
    user_data = {k: v for k, v in user.items() if k not in ["password", "_id"]}
    return {"token": token, "user": user_data}


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.put("/profile")
async def update_profile(
    profile_data: dict,
    current_user: dict = Depends(get_current_user)
):
    allowed_fields = ["first_name", "last_name", "phone", "bio", "avatar", "address", "city"]
    updates = {k: v for k, v in profile_data.items() if k in allowed_fields}
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one({"id": current_user["id"]}, {"$set": updates})
    
    updated_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password": 0})
    return updated_user
