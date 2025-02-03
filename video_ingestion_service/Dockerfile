# Use the official Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app
RUN apt-get update && apt-get install ffmpeg libsm6 libxext6  -y
# Copy requirements and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application files
COPY . .

# Expose the port Flask runs on
EXPOSE 8080

ENV BUCKET_NAME=video-bucket-wade-1

# Set the default command to run the application
CMD ["python", "main.py"]
