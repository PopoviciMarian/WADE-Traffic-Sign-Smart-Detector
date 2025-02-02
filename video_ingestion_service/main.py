from flask import Flask, request, jsonify
from google.cloud import storage
import os
import uuid
import cv2
import random
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

def extract_random_frame(video_path, output_image_path):
    """
    Extracts a random frame from the given video and saves it as an image.
    """
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return None
    
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if frame_count == 0:
        return None

    random_frame_number = random.randint(0, frame_count - 1)

    cap.set(cv2.CAP_PROP_POS_FRAMES, random_frame_number)
    success, frame = cap.read()

    if success:
        cv2.imwrite(output_image_path, frame)
    cap.release()

    return output_image_path if success else None

@app.route('/upload', methods=['POST'])
def upload_video():
    """
    Endpoint to handle video uploads and extract a thumbnail.
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
    local_video_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(local_video_path)

    # Upload file to GCP Storage
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        
        # Upload video
        video_blob = bucket.blob(unique_filename)
        video_blob.upload_from_filename(local_video_path)
        video_blob.make_public()

        # Extract and upload thumbnail
        thumbnail_filename = f"{uuid.uuid4().hex}.jpg"
        local_thumbnail_path = os.path.join(UPLOAD_FOLDER, thumbnail_filename)

        if extract_random_frame(local_video_path, local_thumbnail_path):
            thumbnail_blob = bucket.blob(thumbnail_filename)
            thumbnail_blob.upload_from_filename(local_thumbnail_path)
            thumbnail_blob.make_public()

            os.remove(local_thumbnail_path)  # Clean up local thumbnail file
        else:
            thumbnail_blob = None

        os.remove(local_video_path)  # Clean up local video file

        return jsonify({
            "message": "File uploaded successfully",
            "file_url": video_blob.public_url,
            "unique_filename": unique_filename,
            "thumbnail_url": thumbnail_blob.public_url if thumbnail_blob else None
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
