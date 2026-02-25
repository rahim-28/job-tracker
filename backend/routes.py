from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas
from security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()


# =========================
# Register
# =========================
@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):

    existing_user = (
        db.query(models.User).filter(models.User.email == user.email).first()
    )

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created"}


# =========================
# Login
# =========================
@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    db_user = (
        db.query(models.User).filter(models.User.email == form_data.username).first()
    )

    if not db_user:
        raise HTTPException(status_code=400, detail="User not found")

    if not verify_password(form_data.password, db_user.password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    token = create_access_token(data={"user_id": db_user.id, "name": db_user.name})

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# =========================
# Profile (Protected)
# =========================
@router.get("/profile")
def profile(user_id: int = Depends(get_current_user)):
    return {
        "message": "You are logged in",
        "user_id": user_id,
    }


# =========================
# Create Job
# =========================
@router.post("/jobs")
def create_job(
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):

    new_job = models.Job(
        title=job.title,
        company=job.company,
        status=job.status,
        user_id=user_id,
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


# =========================
# Get My Jobs
# =========================
@router.get("/jobs")
def get_jobs(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):

    jobs = db.query(models.Job).filter(models.Job.user_id == user_id).all()

    return jobs


# =========================
# Delete Job
# =========================
@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):

    job = (
        db.query(models.Job)
        .filter(models.Job.id == job_id, models.Job.user_id == user_id)
        .first()
    )

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    db.delete(job)
    db.commit()

    return {"message": "Job deleted"}


# =========================
# Update Job
# =========================
@router.put("/jobs/{job_id}")
def update_job(
    job_id: int,
    job: schemas.JobCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user),
):

    existing_job = (
        db.query(models.Job)
        .filter(models.Job.id == job_id, models.Job.user_id == user_id)
        .first()
    )

    if not existing_job:
        raise HTTPException(status_code=404, detail="Job not found")

    existing_job.title = job.title
    existing_job.company = job.company
    existing_job.status = job.status

    db.commit()

    return {"message": "Job updated"}


# =========================
# Me (Protected)
# =========================
@router.get("/me")
def get_me(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
    }
