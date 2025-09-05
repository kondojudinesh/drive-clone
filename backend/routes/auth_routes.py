from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import requests, os

from utils.helpers import get_user_by_id, insert_user

auth_bp = Blueprint("auth", __name__)

SUPABASE_PROJECT_URL = os.getenv("SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("SUPABASE_KEY")

# ------------------------------
# Email/Password Signup
# ------------------------------
@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    # Call Supabase Auth API
    resp = requests.post(
        f"{SUPABASE_PROJECT_URL}/auth/v1/signup",
        headers={
            "apikey": SUPABASE_API_KEY,
            "Content-Type": "application/json",
        },
        json={"email": email, "password": password},
    )

    if resp.status_code != 200:
        return jsonify({"error": resp.json()}), resp.status_code

    # Parse response
    data = resp.json()
    supa_user = data.get("user") or data
    if not supa_user or not supa_user.get("id"):
        return jsonify({"error": "Invalid signup response", "raw": data}), 400

    user_id = supa_user["id"]

    # ✅ Ensure user exists in our `users` table
    existing = get_user_by_id(user_id)
    if not existing:
        insert_user({
            "id": user_id,
            "email": supa_user["email"],
            "name": None,
            "avatar_url": None
        })

    # Issue local JWT
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token, "user": supa_user}), 200


# ------------------------------
# Email/Password Login
# ------------------------------
@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    resp = requests.post(
        f"{SUPABASE_PROJECT_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_API_KEY,
            "Content-Type": "application/json",
        },
        json={"email": email, "password": password},
    )

    if resp.status_code != 200:
        return jsonify({"error": resp.json()}), resp.status_code

    auth_data = resp.json()
    supa_user = auth_data.get("user")
    if not supa_user or not supa_user.get("id"):
        return jsonify({"error": "Invalid login response", "raw": auth_data}), 400

    user_id = supa_user["id"]

    # ✅ Ensure user exists in our `users` table
    existing = get_user_by_id(user_id)
    if not existing:
        insert_user({
            "id": user_id,
            "email": supa_user["email"],
            "name": None,
            "avatar_url": None
        })

    # Issue local JWT
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token, "user": supa_user}), 200


# ------------------------------
# Google Login (frontend handles OAuth)
# ------------------------------
@auth_bp.get("/google")
def google_login():
    return jsonify({
        "message": "Use frontend Supabase client for Google Login",
        "docs": "https://supabase.com/docs/guides/auth/social-login/auth-google"
    }), 200


# ------------------------------
# Profile (JWT required)
# ------------------------------
@auth_bp.get("/profile")
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user.get("name"),
            "avatar_url": user.get("avatar_url")
        }
    }), 200
