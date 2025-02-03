# Use a smaller base image for reduced size
FROM python:3.9-slim

# Set environment variables for better performance
ENV PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    BUCKET_NAME=video-bucket-wade-1

# Set the working directory
WORKDIR /app

# Install system dependencies required for OpenCV and FFmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Copy only requirements first for better caching
COPY requirements.txt .

# Install dependencies efficiently
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Expose Flask port
EXPOSE 8080

# Run the application using gunicorn for better performance
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "main:app"]
