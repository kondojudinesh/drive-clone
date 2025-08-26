
from .auth_routes import auth_bp
from .file_routes import file_bp

def register_routes(app):
    app.register_blueprint(auth_bp, url_prefix="")
    app.register_blueprint(file_bp,  url_prefix="")
