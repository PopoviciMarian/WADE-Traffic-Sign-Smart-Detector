variable "credentials_file" {
  description = "Path to the Google Cloud credentials file"
}

variable "project_id" {
  description = "The Google Cloud project ID"
}

variable "region" {
  description = "The Google Cloud region"
}

variable "MONGODB_URI" {
  description = "MongoDB URI"
  sensitive = true
}

variable "NEXTAUTH_SECRET" {
  description = "NextAuth secret"
  sensitive = true
}

variable "AUTH_GITHUB_ID" {
  description = "GitHub OAuth client ID"
  sensitive = true
}

variable "AUTH_GITHUB_SECRET" {
  description = "GitHub OAuth client secret"
  sensitive = true
}

variable "NEXT_PUBLIC_VIDEO_INGESTION_SERVICE_URL" {
  description = "URL of the video ingestion service"
}

variable "NEXT_PUBLIC_FRAME_EXTRACTOR_SERVICE_URL" {
  description = "URL of the frame extraction service"
}

variable "NEXT_PUBLIC_VIDEO_SIGN_DETECTION_SERVICE_URL" {
  description = "URL of the video sign detection service"
}

variable "NEXTAUTH_URL" {
  description = "URL of the NextAuth service"
}


