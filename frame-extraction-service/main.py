from flask import Flask, request, jsonify
from google.cloud import storage
import os
import cv2
import uuid

app = Flask(__name__)

# Configuration
FRAME_FOLDER = "frames"
BUCKET_NAME = os.environ.get("BUCKET_NAME")

# Ensure the frame folder exists
os.makedirs(FRAME_FOLDER, exist_ok=True)

# Initialize GCP Storage client
storage_client = storage.Client()

def download_video_from_gcs(unique_filename):
    """Download video from Google Cloud Storage."""
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(unique_filename)
        local_video_path = os.path.join(FRAME_FOLDER, unique_filename)
        blob.download_to_filename(local_video_path)
        return local_video_path
    except Exception as e:
        return None

def extract_frames(video_path, frame_rate):
    """Extract frames from video at the specified frame rate."""
    frames_list = []
    
    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    if not cap.isOpened():
        return None

    frame_interval = max(1, fps // frame_rate)  # Ensure at least 1 frame is captured per second

    frame_count = 0
    while True:
        success, frame = cap.read()
        if not success:
            break
        if frame_count % frame_interval == 0:
            frame_filename = f"{uuid.uuid4().hex}.jpg"
            frame_path = os.path.join(FRAME_FOLDER, frame_filename)
            cv2.imwrite(frame_path, frame)
            frames_list.append(frame_filename)
        frame_count += 1

    cap.release()
    return frames_list

def upload_frames_to_gcs(frames_list):
    """Upload extracted frames to Google Cloud Storage."""
    uploaded_frames = []
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        for frame_filename in frames_list:
            frame_path = os.path.join(FRAME_FOLDER, frame_filename)
            blob = bucket.blob(frame_filename)
            blob.upload_from_filename(frame_path)
            blob.make_public()
            uploaded_frames.append(blob.public_url)
            os.remove(frame_path)  # Clean up local frame file
        return uploaded_frames
    except Exception as e:
        return None

@app.route('/extract-frames', methods=['POST'])
def extract_video_frames():
    """
    Endpoint to handle frame extraction from a video.
    """
    data = request.get_json()
    unique_filename = data.get("unique_filename")
    frame_rate = data.get("frame_rate", 1)  # Default to 1 frame per second

    if not unique_filename:
        return jsonify({"error": "Missing unique_filename"}), 400
    if not isinstance(frame_rate, int) or frame_rate <= 0:
        return jsonify({"error": "Invalid frame_rate, must be a positive integer"}), 400

    # Download the video
    video_path = download_video_from_gcs(unique_filename)
    if not video_path:
        return jsonify({"error": "Failed to download video from storage"}), 500

    # Extract frames
    frames_list = extract_frames(video_path, frame_rate)
    if not frames_list:
        return jsonify({"error": "Failed to extract frames"}), 500

    # Upload frames to cloud storage
    uploaded_frames = upload_frames_to_gcs(frames_list)
    if not uploaded_frames:
        return jsonify({"error": "Failed to upload frames"}), 500

    # Clean up local video file
    os.remove(video_path)

    return jsonify({
        "message": "Frames extracted successfully",
        "frames": uploaded_frames
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
s