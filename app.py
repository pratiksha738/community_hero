from flask import send_from_directory
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import jwt
import datetime
import certifi
import os

app = Flask(__name__)
CORS(app)

app.config["SECRET_KEY"] = "secret_key"

# ---------------- MongoDB ----------------

client = MongoClient(
    "mongodb+srv://siddhartha522004_db_user:F8Npq!bBFLq8Gs7@cluster0.jezkzmt.mongodb.net/test?retryWrites=true&w=majority",
    tlsCAFile=certifi.where()
)

db = client["community_hero"]

users_collection = db["users"]
issues_collection = db["issues"]

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

print("✅ MongoDB Connected Successfully")

@app.route("/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory("uploads", filename)
# ---------------- Home ----------------

@app.route("/")
def home():
    return "Community Hero Backend Running"


# ---------------- Signup ----------------

@app.route("/api/signup", methods=["POST"])
def signup():

    data = request.get_json()

    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"message": "Email already exists"}), 400

    hashed_password = generate_password_hash(data["password"])

    users_collection.insert_one({
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password
    })

    return jsonify({"message": "Signup Successful"}), 201


# ---------------- Login ----------------

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    user = users_collection.find_one({"email": data["email"]})

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user["password"], data["password"]):
        return jsonify({"message": "Wrong password"}), 401

    token = jwt.encode(
        {
            "email": user["email"],
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({
        "message": "Login Successful",
        "token": token
    })


# ---------------- Verify Token ----------------

def verify_token(token):

    try:
        data = jwt.decode(
            token,
            app.config["SECRET_KEY"],
            algorithms=["HS256"]
        )
        return data["email"]

    except:
        return None
    # ---------------- Add Issue ----------------

@app.route("/api/issues", methods=["POST"])
def add_issue():

    token = request.headers.get("Authorization")

    if not token:
        return jsonify({"message": "Token missing"}), 401

    user_email = verify_token(token)

    if not user_email:
        return jsonify({"message": "Invalid Token"}), 401

    title = request.form.get("title")
    description = request.form.get("description")
    category = request.form.get("category")
    latitude = request.form.get("latitude")
    longitude = request.form.get("longitude")

    image = request.files.get("image")

    image_path = ""

    if image:

        filename = secure_filename(image.filename)

        image_path = os.path.join(UPLOAD_FOLDER, filename)

        image.save(image_path)

    issue = {
        "title": title,
        "description": description,
        "category": category,
        "latitude": latitude,
        "longitude": longitude,
        "image": image_path,
        "status": "Pending",
        "user_email": user_email,
        "created_at": datetime.datetime.utcnow()
    }

    issues_collection.insert_one(issue)

    return jsonify({
        "message": "Issue Submitted Successfully"
    }), 201


# ---------------- Get All Issues ----------------

@app.route("/api/issues", methods=["GET"])
def get_issues():

    issues = []

    for issue in issues_collection.find():

        issue["_id"] = str(issue["_id"])

        issues.append(issue)

    return jsonify(issues)


# ---------------- Run Flask ----------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=8000,
        debug=True
    )