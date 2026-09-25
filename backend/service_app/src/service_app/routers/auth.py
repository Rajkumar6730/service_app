from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.security import get_password_hash, verify_password, create_access_token
from ..core.dependencies import get_current_user
from ..models.user import User
from ..models.technician import Technician
from ..schemas.user import UserCreate, UserResponse
from ..schemas.auth import Token, ForgotPasswordRequest, ResetPasswordRequest, MessageResponse
from ..core.config import settings
from ..core.security import ALGORITHM
from jose import jwt, JWTError
from datetime import datetime, timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Basic validation
    if user_data.role not in ["CUSTOMER", "TECHNICIAN", "MANAGER"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user_data.role == "MANAGER":
        existing_manager = db.query(User).filter(User.role == "MANAGER").first()
        if existing_manager:
            raise HTTPException(status_code=400, detail="⚠️ There is a one Existing Manager")
    
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        phone=user_data.phone,
        role=user_data.role,
        password_hash=hashed_pwd
    )
    db.add(new_user)
    
    from sqlalchemy.exc import IntegrityError
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e).lower()
        if user_data.role == "MANAGER" and "unique" in error_msg and ("role" in error_msg or "manager" in error_msg):
            raise HTTPException(status_code=400, detail="⚠️ There is a one Existing Manager")
        raise HTTPException(status_code=400, detail="Registration failed (possibly email already registered)")
        
    db.refresh(new_user)
    
    if new_user.role == "TECHNICIAN":
        tech_profile = Technician(user_id=new_user.id, specialization="General")
        db.add(tech_profile)
        db.commit()
        
    return new_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if user.role == "MANAGER":
        unique_manager = db.query(User).filter(User.role == "MANAGER").order_by(User.id).first()
        if unique_manager and user.id != unique_manager.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="⚠️ There is a one Existing Manager")
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode = {"sub": user.email, "type": "reset", "exp": expire}
        reset_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
        # Development fallback
        print(f"DEVELOPMENT: Password reset link for {user.email}: http://localhost:5173/reset-password?token={reset_token}")
    
    return {"message": "If the account exists, password reset instructions have been generated."}

@router.post("/reset-password", response_model=MessageResponse)
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if email is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    user.password_hash = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "Password updated successfully."}
