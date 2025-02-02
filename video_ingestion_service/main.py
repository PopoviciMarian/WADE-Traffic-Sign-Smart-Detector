from flask import Flask, request, jsonify
from google.cloud import storage
import os
import uuid
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# Configuration
UPLOAD_FOLDER = "uploads"
BUCKET_NAME = os.environ.get("BUCKET_NAME")

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize GCP Storage client
storage_client = storage.Client()

@app.route('/upload', methods=['POST'])
def upload_video():
    """
    Endpoint to handle video/image uploads.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected for uploading"}), 400

    # Generate a unique filename using UUID
    file_extension = os.path.splitext(file.filename)[1]  # Extract file extension
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"

    # Save file locally
    local_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(local_path)

    # Upload file to GCP Storage
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(unique_filename)
        blob.upload_from_filename(local_path)

        # Optional: Make the file publicly accessible
        blob.make_public()

        # Clean up local file
        os.remove(local_path)

        return jsonify({
            "message": "File uploaded successfully",
            "file_url": blob.public_url,
            "unique_filename": unique_filename
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)