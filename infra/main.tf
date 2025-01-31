
resource "google_storage_bucket" "video_bucket" {
  name     = "video-bucket-wade-1"
  location = "US"
  # allow deleting the bucket even if it is not empty
  force_destroy = true
}

resource "google_artifact_registry_repository" "docker_repo" {
  repository_id = "docker-repo-wade-1"
  location     = "us-central1"
  format       = "DOCKER"
  description  = "Docker repository for video ingestion service"
}


resource "google_cloud_run_service" "video_ingestion_service" {
  name     = "video-ingestion-service"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/docker-repo-wade-1/video-ingestion-service:latest"
        ports {
          container_port = 8080
        }
        env {
          name  = "BUCKET_NAME"
          value = google_storage_bucket.video_bucket.name
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service" "frame-extraction-service" {
  name     = "frame-extraction-service"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/docker-repo-wade-1/frame-extraction-service:latest"
        ports {
          container_port = 8080
        }
        env {
          name  = "BUCKET_NAME"
          value = google_storage_bucket.video_bucket.name
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

resource "google_cloud_run_service_iam_policy" "noauth2" {
  location = google_cloud_run_service.video_ingestion_service.location
  service  = google_cloud_run_service.video_ingestion_service.name
  

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth2" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}



resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.video_ingestion_service.location
  service  = google_cloud_run_service.video_ingestion_service.name
  

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}
