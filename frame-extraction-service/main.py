from flask import Flask, request, jsonify
from google.cloud import storage
import os
import cv2
import uuid
from concurrent.futures import ThreadPoolExecutor
import tempfile

app = Flask(__name__)

# Configuration
FRAME_FOLDER = "frames"
BUCKET_NAME = os.environ.get("BUCKET_NAME")

# Ensure the frame folder exists
os.makedirs(FRAME_FOLDER, exist_ok=True)

# Initialize GCP Storage client
storage_client = storage.Client()

def download_video_from_gcs(unique_filename):
    """Download video from Google Cloud Storage and save to a temp file."""
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(unique_filename)
        
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        blob.download_to_filename(temp_file.name)
        
        return temp_file.name
    except Exception as e:
        return None

from concurrent.futures import ThreadPoolExecutor

def save_frame(frame, frame_path):
    """Save a single frame to disk."""
    cv2.imwrite(frame_path, frame)

def extract_frames(video_path, frame_rate):
    """Extract frames from video while maintaining order."""
    frames_list = []
    frame_data = []

    cap = cv2.VideoCapture(video_path)
    fps = int(cap.get(cv2.CAP_PROP_FPS))

    if not cap.isOpened():
        return None

    frame_interval = max(1, fps // frame_rate)
    frame_count = 0
    frame_index = 0

    with ThreadPoolExecutor() as executor:
        future_to_frame = {}

        while True:
            success, frame = cap.read()
            if not success:
                break
            if frame_count % frame_interval == 0:
                frame_filename = f"{frame_index:06d}_{uuid.uuid4().hex}.jpg"  # Use zero-padded index
                frame_path = os.path.join(FRAME_FOLDER, frame_filename)
                
                # Save frame number to maintain order
                future = executor.submit(save_frame, frame, frame_path)
                future_to_frame[future] = (frame_index, frame_filename)

                frame_data.append((frame_index, frame_filename))
                frame_index += 1

            frame_count += 1

        # Ensure all threads complete
        for future in future_to_frame:
            future.result()

    cap.release()

    # Sort by frame index to ensure order
    frames_list = [frame_filename for _, frame_filename in sorted(frame_data, key=lambda x: x[0])]
    
    return frames_list


def upload_frame_to_gcs(frame_filename):
    """Upload a single frame to GCS and return the public URL."""
    try:
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(frame_filename)
        frame_path = os.path.join(FRAME_FOLDER, frame_filename)
        blob.upload_from_filename(frame_path)
        blob.make_public()
        os.remove(frame_path)  # Clean up
        return blob.public_url
    except Exception as e:
        return None

def upload_frames_to_gcs(frames_list):
    """Upload frames using multi-threading."""
    uploaded_frames = []
    with ThreadPoolExecutor() as executor:
        results = executor.map(upload_frame_to_gcs, frames_list)
        uploaded_frames = [url for url in results if url]

    return uploaded_frames if uploaded_frames else None

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
    app.run(host='0.0.0.0', port=8080, threaded=True)
