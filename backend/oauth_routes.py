"""
OAuth Authentication Routes
Handles Google and GitHub OAuth login/signup
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import os
import requests
from dotenv import load_dotenv
from pydantic import BaseModel

from database import get_db, User
from auth import create_access_token, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES

load_dotenv()

router = APIRouter(prefix="/auth/oauth", tags=["OAuth"])


# Request models
class GoogleOAuthRequest(BaseModel):
    token: str


class GitHubOAuthRequest(BaseModel):
    code: str

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


@router.post("/google")
async def google_oauth(
    request: GoogleOAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with Google OAuth token
    """
    try:
        # Verify Google token
        response = requests.get(
            f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={request.token}"
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )

        google_data = response.json()

        # Extract user info
        email = google_data.get("email")
        given_name = google_data.get("given_name", "")
        family_name = google_data.get("family_name", "")
        picture = google_data.get("picture")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by Google"
            )

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user
            user = User(
                email=email,
                username=email.split("@")[0],
                first_name=given_name or "User",
                last_name=family_name or "",
                country="Unknown",
                hashed_password=get_password_hash(os.urandom(32).hex()),  # Random password for OAuth users
                avatar_url=picture,
                is_active=True,
                plan_selected=False  # New users need to select a plan
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create access token
        access_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "country": user.country,
                "role": user.role,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "is_active": user.is_active,
                "ai_tier": user.ai_tier,
                "plan_selected": user.plan_selected
            }
        }

    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to verify Google token: {str(e)}"
        )


@router.post("/github")
async def github_oauth(
    request: GitHubOAuthRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user with GitHub OAuth code
    """
    try:
        # Exchange code for access token
        token_response = requests.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": request.code,
            }
        )

        if token_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get GitHub access token"
            )

        token_data = token_response.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No access token received from GitHub"
            )

        # Get user info from GitHub
        user_response = requests.get(
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
        )

        if user_response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to get GitHub user info"
            )

        github_user = user_response.json()

        # Get user email (might be private)
        email_response = requests.get(
            "https://api.github.com/user/emails",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json"
            }
        )

        email = github_user.get("email")
        if not email and email_response.status_code == 200:
            emails = email_response.json()
            primary_email = next((e for e in emails if e.get("primary")), None)
            email = primary_email.get("email") if primary_email else None

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email not provided by GitHub. Please make your email public."
            )

        # Extract user info
        name = github_user.get("name", "")
        name_parts = name.split(" ", 1) if name else ["", ""]
        first_name = name_parts[0] or github_user.get("login", "User")
        last_name = name_parts[1] if len(name_parts) > 1 else ""
        avatar_url = github_user.get("avatar_url")
        bio = github_user.get("bio")

        # Check if user exists
        user = db.query(User).filter(User.email == email).first()

        if not user:
            # Create new user
            user = User(
                email=email,
                username=github_user.get("login", email.split("@")[0]),
                first_name=first_name,
                last_name=last_name,
                country="Unknown",
                hashed_password=get_password_hash(os.urandom(32).hex()),  # Random password for OAuth users
                avatar_url=avatar_url,
                bio=bio,
                is_active=True,
                plan_selected=False  # New users need to select a plan
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Create access token
        jwt_token = create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {
            "access_token": jwt_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "country": user.country,
                "role": user.role,
                "avatar_url": user.avatar_url,
                "bio": user.bio,
                "is_active": user.is_active,
                "ai_tier": user.ai_tier,
                "plan_selected": user.plan_selected
            }
        }

    except requests.RequestException as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to authenticate with GitHub: {str(e)}"
        )


@router.get("/github/callback")
async def github_callback(code: str, db: Session = Depends(get_db)):
    """
    GitHub OAuth callback endpoint
    """
    return await github_oauth(GitHubOAuthRequest(code=code), db)
