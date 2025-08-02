"""
Authentication routes for user registration and login.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db
from models import User
from auth import verify_password, get_password_hash, create_access_token, Token
from dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])


class UserRegister(BaseModel):
    """User registration request model."""
    email: EmailStr
    username: str
    password: str


class UserLogin(BaseModel):
    """User login request model."""
    username: str  # Can be username or email
    password: str


class UserResponse(BaseModel):
    """User response model."""
    id: str
    email: str
    username: str
    is_active: bool


@router.post("/register", response_model=Token)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new user.
    
    Args:
        user_data: Registration data (email, username, password)
        db: Database session
        
    Returns:
        Access token
        
    Raises:
        HTTPException: If username or email already exists
    """
    # Check if user already exists
    stmt = select(User).where(
        (User.email == user_data.email) | (User.username == user_data.username)
    )
    result = await db.execute(stmt)
    existing_user = result.scalar_one_or_none()
    
    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.post("/login", response_model=Token)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login a user.
    
    Args:
        user_data: Login credentials (username/email and password)
        db: Database session
        
    Returns:
        Access token
        
    Raises:
        HTTPException: If credentials are invalid
    """
    # Find user by username or email
    stmt = select(User).where(
        (User.username == user_data.username) | (User.email == user_data.username)
    )
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.id, "email": user.email}
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    user: User = Depends(get_current_user)
):
    """
    Get current user information.
    
    Args:
        user: Current authenticated user
        
    Returns:
        User information
    """
    return UserResponse(
        id=user.id,
        email=user.email,
        username=user.username,
        is_active=user.is_active
    )