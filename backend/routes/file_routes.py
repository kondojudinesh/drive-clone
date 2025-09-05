import uuid
import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from config.supabase_client import get_supabase, get_bucket_name
from utils.helpers import (
    get_user_by_id,
    get_file_owned_by_user,
    get_file_by_id,
    create_signed_url,
)

file_bp = Blueprint("files", __name__)
supabase = get_supabase()
BUCKET = get_bucket_name()


# ---------- Upload ----------
@file_bp.route("/upload", methods=["POST", "OPTIONS"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded (form field 'file' required)"}), 400

    up = request.files["file"]
    raw = up.read()
    size = len(raw)
    unique_name = f"{uuid.uuid4()}_{up.filename}"

    try:
        supabase.storage.from_(BUCKET).upload(unique_name, raw)
    except Exception as e:
        return jsonify({"error": f"Storage upload failed: {str(e)}"}), 500

    meta = {
        "user_id": user_id,
        "filename": up.filename,
        "size": size,
        "type": up.content_type,
        "path": unique_name,
        "is_deleted": False,
        "trashed_at": None,
        "is_public": False,
        "share_token": None,
        "permissions": {"viewer": [], "editor": []},
    }
    supabase.table("files").insert(meta).execute()
    return jsonify({"message": "File uploaded successfully"}), 201


# ---------- List Files ----------
@file_bp.route("", methods=["GET", "OPTIONS"])
@file_bp.route("/", methods=["GET", "OPTIONS"])
@jwt_required()
def list_files():
    user_id = get_jwt_identity()
    trashed = (request.args.get("trashed", "false").lower() == "true")

    q = (
        supabase.table("files")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_deleted", trashed)
        .order("created_at", desc=True)
        .execute()
    )
    return jsonify({"files": q.data or []}), 200


# ---------- Signed URL ----------
@file_bp.route("/file/<file_id>/signed-url", methods=["GET", "OPTIONS"])
@jwt_required()
def file_signed_url(file_id):
    user_id = get_jwt_identity()
    me = get_user_by_id(user_id)
    if not me:
        return jsonify({"error": "User not found"}), 404

    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row:
        cand = get_file_by_id(file_id)
        if not cand:
            return jsonify({"error": "File not found"}), 404
        perms = cand.get("permissions") or {}
        allowed = me["email"] in set(perms.get("viewer", [])) | set(perms.get("editor", []))
        if not allowed:
            return jsonify({"error": "Access denied"}), 403
        file_row = cand

    if file_row.get("is_deleted"):
        return jsonify({"error": "File is in Trash"}), 400

    signed = create_signed_url(file_row["path"], 3600)
    if not signed:
        return jsonify({"error": "Could not create signed URL"}), 500

    return jsonify({
        "signed_url": signed,
        "file": {"id": file_row["id"], "filename": file_row["filename"]}
    }), 200


# ---------- Rename ----------
@file_bp.route("/file/<file_id>/rename", methods=["POST", "OPTIONS"])
@jwt_required()
def rename_file(file_id):
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    new_name = (data.get("name") or "").strip()
    if not new_name:
        return jsonify({"error": "New name required"}), 400

    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row:
        return jsonify({"error": "File not found or access denied"}), 404

    supabase.table("files").update({"filename": new_name}).eq("id", file_id).execute()
    return jsonify({"message": "Renamed"}), 200


# ---------- Trash ----------
@file_bp.route("/trash", methods=["GET", "OPTIONS"])
@file_bp.route("/trash/", methods=["GET", "OPTIONS"])
@jwt_required()
def list_trash():
    user_id = get_jwt_identity()
    resp = (
        supabase.table("files")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_deleted", True)
        .order("trashed_at", desc=True)
        .execute()
    )
    return jsonify({"files": resp.data or []}), 200


@file_bp.route("/trash/<file_id>", methods=["POST", "OPTIONS"])
@jwt_required()
def move_to_trash(file_id):
    user_id = get_jwt_identity()
    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row:
        return jsonify({"error": "File not found"}), 404

    supabase.table("files").update(
        {"is_deleted": True, "trashed_at": datetime.utcnow().isoformat()}
    ).eq("id", file_id).execute()

    return jsonify({"message": "Moved to Trash"}), 200


@file_bp.route("/trash/<file_id>/restore", methods=["POST", "OPTIONS"])
@jwt_required()
def restore_from_trash(file_id):
    user_id = get_jwt_identity()
    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row or not file_row.get("is_deleted"):
        return jsonify({"error": "File not found in Trash"}), 404

    supabase.table("files").update(
        {"is_deleted": False, "trashed_at": None}
    ).eq("id", file_id).execute()
    return jsonify({"message": "File restored"}), 200


@file_bp.route("/trash/<file_id>/purge", methods=["DELETE", "OPTIONS"])
@jwt_required()
def purge_file(file_id):
    user_id = get_jwt_identity()
    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row:
        return jsonify({"error": "File not found"}), 404

    path = file_row.get("path")
    try:
        supabase.storage.from_(BUCKET).remove([path])
    except Exception as e:
        return jsonify({"error": f"Storage delete failed: {str(e)}"}), 500

    supabase.table("files").delete().eq("id", file_id).execute()
    return jsonify({"message": "File permanently deleted"}), 200


@file_bp.route("/trash/purge_older_than_30d", methods=["POST", "OPTIONS"])
@jwt_required()
def purge_older_than_30d():
    user_id = get_jwt_identity()
    cutoff = datetime.utcnow() - timedelta(days=30)

    resp = (
        supabase.table("files")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_deleted", True)
        .lt("trashed_at", cutoff.isoformat())
        .execute()
    )
    files = resp.data or []

    paths = [f["path"] for f in files if f.get("path")]
    if paths:
        supabase.storage.from_(BUCKET).remove(paths)

    for f in files:
        supabase.table("files").delete().eq("id", f["id"]).execute()

    return jsonify({"purged": len(files)}), 200


# ---------- Sharing ----------
@file_bp.route("/share/<file_id>", methods=["POST", "OPTIONS"])
@jwt_required()
def share_file(file_id):
    user_id = get_jwt_identity()
    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row:
        return jsonify({"error": "File not found or access denied"}), 404

    data = request.get_json() or {}
    is_public = bool(data.get("is_public", True))

    token = secrets.token_urlsafe(16)
    supabase.table("files").update({
        "is_public": is_public,
        "share_token": token
    }).eq("id", file_id).execute()

    share_link = f"{request.host_url.rstrip('/')}/files/public/{token}"
    return jsonify({"message": "Share link generated", "share_link": share_link}), 200


@file_bp.route("/public/<share_token>", methods=["GET", "OPTIONS"])
def access_shared_file(share_token):
    res = supabase.table("files").select("*").eq("share_token", share_token).execute()
    if not res.data:
        return jsonify({"error": "Invalid link"}), 404

    file_row = res.data[0]
    if not file_row.get("is_public"):
        return jsonify({"error": "This file is private"}), 403

    expires_in = int(request.args.get("expires_in", "3600"))
    signed = create_signed_url(file_row["path"], expires_in)
    if not signed:
        return jsonify({"error": "Could not create signed URL"}), 500

    return jsonify({
        "file": {
            "id": file_row["id"],
            "filename": file_row["filename"],
            "type": file_row.get("type")
        },
        "signed_url": signed,
        "expires_in": expires_in
    }), 200


@file_bp.route("/permissions/<file_id>", methods=["POST", "OPTIONS"])
@jwt_required()
def update_permissions(file_id):
    user_id = get_jwt_identity()
    file_row = get_file_owned_by_user(file_id, user_id)
    if not file_row:
        return jsonify({"error": "File not found or access denied"}), 404

    data = request.get_json() or {}
    viewers = sorted(list(set(data.get("viewer", []))))
    editors = sorted(list(set(data.get("editor", []))))

    supabase.table("files").update({
        "permissions": {"viewer": viewers, "editor": editors}
    }).eq("id", file_id).execute()

    return jsonify({"message": "Permissions updated"}), 200


