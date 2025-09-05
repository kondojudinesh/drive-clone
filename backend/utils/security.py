from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()

def hash_password(password: str) -> str:
    return bcrypt.generate_password_hash(password).decode("utf-8")

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.check_password_hash(hashed, password)
