import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from routes import register_routes

def create_app():
    app = Flask(__name__)

    # Config
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "super-secret-key")

    # CORS
    # For local dev: FRONTEND_ORIGIN may be http://localhost:5173
    # For prod: set to your Netlify origin
    frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")
    CORS(
        app,
        resources={r"/*": {"origins": [frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"]}},
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"]
    )

    # JWT
    JWTManager(app)

    # Health check
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # Register blueprints
    register_routes(app)
    return app


app = create_app()

if __name__ == "__main__":
    # Local dev
    app.run(host="0.0.0.0", port=5000, debug=True)
