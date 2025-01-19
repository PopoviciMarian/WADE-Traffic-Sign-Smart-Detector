from flask import Flask, request, jsonify
from google.cloud import storage
import os

app = Flask(__name__)

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

    # Save file locally
    local_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(local_path)

    # Upload file to GCP Storage
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(file.filename)
        blob.upload_from_filename(local_path)

        # Optional: Make the file publicly accessible
        blob.make_public()

        # Clean up local file
        os.remove(local_path)

        return jsonify({
            "message": "File uploaded successfully",
            "file_url": blob.public_url
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#health check
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)