from pydantic import BaseModel


# =========================
# User Register
# =========================
class UserCreate(BaseModel):
    name: str
    email: str
    password: str


# =========================
# Login (kept for future use)
# =========================
class LoginRequest(BaseModel):
    email: str
    password: str


# =========================
# Create Job
# =========================
class JobCreate(BaseModel):
    title: str
    company: str
    status: str


# =========================
# Job Response
# =========================
class JobResponse(BaseModel):
    id: int
    title: str
    company: str
    status: str

    class Config:
        from_attributes = True
