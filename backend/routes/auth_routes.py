from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from utils.security import hash_password, verify_password
from utils.helpers import get_user_by_email, get_user_by_id, insert_user

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/signup")
def signup():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if get_user_by_email(email):
        return jsonify({"error": "Email already registered"}), 400

    hashed = hash_password(password)
    if not insert_user(email=email, password_hash=hashed):
        return jsonify({"error": "Database error creating user"}), 500

    return jsonify({"message": "User registered successfully"}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = get_user_by_email(email)
    if not user or not verify_password(password, user.get("password")):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=user["id"])
    return jsonify({"access_token": token, "user": {"id": user["id"], "email": user["email"]}}), 200


@auth_bp.get("/profile")
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": {"id": user["id"], "email": user["email"], "name": user.get("name")}}), 200
