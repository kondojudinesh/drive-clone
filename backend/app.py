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
    CORS(
        app,
        resources={r"/*": {"origins": "*"}},
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"]
    )

    # JWT
    JWTManager(app)

    # Home
    @app.get("/")
    def home():
        return jsonify({
            "status": "ok",
            "message": "Drive Clone Backend is running 🚀",
            "endpoints": [
                "/auth/signup", "/auth/login", "/auth/profile",
                "/files/upload", "/files", "/files/trash"
            ]
        })

    # Health check
    @app.get("/health")
    def health():
        return jsonify({"status": "ok"}), 200

    # Register routes
    register_routes(app)
    return app

app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
