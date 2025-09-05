from typing import Optional, Dict, Any
from config.supabase_client import get_supabase, get_bucket_name

supabase = get_supabase()
BUCKET = get_bucket_name()

# ----------------- USER HELPERS -----------------
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    res = supabase.table("users").select("*").eq("email", email).execute()
    return res.data[0] if res.data else None

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    res = supabase.table("users").select("*").eq("id", user_id).execute()
    return res.data[0] if res.data else None

def insert_user(user: Dict[str, Any]):
    """Insert new user into users table"""
    res = supabase.table("users").insert(user).execute()
    return res.data

# ----------------- FILE HELPERS -----------------
def get_file_owned_by_user(file_id: str, user_id: str):
    res = supabase.table("files").select("*").eq("id", file_id).eq("user_id", user_id).execute()
    return res.data[0] if res.data else None

def get_file_by_id(file_id: str):
    res = supabase.table("files").select("*").eq("id", file_id).execute()
    return res.data[0] if res.data else None

def create_signed_url(path: str, expires_in: int = 3600):
    try:
        signed = supabase.storage.from_(BUCKET).create_signed_url(path, expires_in)
        return signed.get("signedURL") or signed.get("signed_url")
    except Exception:
        return None

