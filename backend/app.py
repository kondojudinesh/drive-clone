import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from routes import register_routes


def create_app():
    app = Flask(__name__)

    # ======================
    # Config
    # ======================
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")

    # ======================
    # CORS FIX ✅
    # ======================
    CORS(
        app,
        resources={
            r"/*": {
                "origins": ["https://driveclonekd.netlify.app"],  # your Netlify frontend
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"],
                "expose_headers": ["Content-Type", "Authorization"],
            }
        },
        supports_credentials=True,
    )

    # ======================
    # JWT
    # ======================
    JWTManager(app)

    # ======================
    # Default Routes
    # ======================
    @app.get("/")
    def home():
        return jsonify({
            "status": "ok",
            "message": "Drive Clone Backend is running 🚀",
            "endpoints": [
                "/auth/signup",
                "/auth/login",
                "/auth/profile",
                "/files/upload",
                "/files",
                "/files/trash",
            ],
        })

    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # ======================
    # Register Blueprints
    # ======================
    register_routes(app)

    return app


# ======================
# Entry Point
# ======================
app = create_app()

if __name__ == "__main__":
    # Render uses PORT env var
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
