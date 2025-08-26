from typing import Optional, Dict, Any
from config.supabase_client import get_supabase, get_bucket_name

supabase = get_supabase()
BUCKET = get_bucket_name()

# ---------- Users ----------
def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    res = supabase.table("users").select("*").eq("email", email).execute()
    return res.data[0] if res.data else None

def get_user_by_id(user_id: str, fields: str = "id,email,name") -> Optional[Dict[str, Any]]:
    res = supabase.table("users").select(fields).eq("id", user_id).execute()
    return res.data[0] if res.data else None

def insert_user(email: str, password_hash: str) -> bool:
    try:
        supabase.table("users").insert({"email": email, "password": password_hash}).execute()
        return True
    except Exception:
        return False

# ---------- Files ----------
def get_file_by_id(file_id: str) -> Optional[Dict[str, Any]]:
    res = supabase.table("files").select("*").eq("id", file_id).execute()
    return res.data[0] if res.data else None

def get_file_owned_by_user(file_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    res = (
        supabase.table("files")
        .select("*")
        .eq("id", file_id)
        .eq("user_id", user_id)
        .execute()
    )
    return res.data[0] if res.data else None

# ---------- Storage ----------
def create_signed_url(path: str, expires_in_sec: int = 3600) -> Optional[str]:
    try:
        signed = supabase.storage.from_(BUCKET).create_signed_url(path, expires_in_sec)
        # supabase-py v2 may return 'signedURL' or 'signed_url'
        return signed.get("signedURL") or signed.get("signed_url")
    except Exception:
        return None
