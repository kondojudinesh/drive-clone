def register_routes(app):
    from .auth_routes import auth_bp
    from .file_routes import file_bp

    # All backend routes are prefixed with /api
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(file_bp, url_prefix="/files")
