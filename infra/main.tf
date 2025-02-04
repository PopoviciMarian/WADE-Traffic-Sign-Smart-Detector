
resource "google_storage_bucket" "video_bucket" {
  name     = "video-bucket-wade-1"
  location = "US"
  force_destroy = true
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
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

  // max file size is 500MB
  metadata {
    annotations = {
      # Increase request size to 500MB
      "run.googleapis.com/client-max-bodysize" = "500Mi"
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
        resources {
          limits = {
            memory = "4Gi"
            cpu    = "2"
          }
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
  location = google_cloud_run_service.frame-extraction-service.location
  service  = google_cloud_run_service.frame-extraction-service.name
  

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


resource "google_cloud_run_service" "sign-detection-service" {
  name     = "sign-detection-service"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/docker-repo-wade-1/sign-detection-service:latest"
        ports {
          container_port = 8080
        }
        env {
          name  = "BUCKET_NAME"
          value = google_storage_bucket.video_bucket.name
        }
        resources {
          limits = {
            memory = "4Gi"
            cpu    = "2"
          }
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"     # Keep 1 instance always running (optional)
        "autoscaling.knative.dev/maxScale" = "3"  
        "autoscaling.knative.dev/concurrency" = "80" # Each instance can handle 80 requests
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}


resource "google_cloud_run_service_iam_policy" "noauth3" {
  location = google_cloud_run_service.sign-detection-service.location
  service  = google_cloud_run_service.sign-detection-service.name
  

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth3" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}



resource "google_cloud_run_service" "tsr-app" {
  name     = "tsr-app"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/docker-repo-wade-1/tsr-app:latest"
        ports {
          container_port = 3000
        }
      
         env {
          name  = "MONGODB_URI"
          value = var.MONGODB_URI
        }
        env {
          name  = "NEXTAUTH_SECRET"
          value = var.NEXTAUTH_SECRET
        }
        env {
          name  = "AUTH_GITHUB_ID"
          value = var.AUTH_GITHUB_ID
        }
        env {
          name  = "AUTH_GITHUB_SECRET"
          value = var.AUTH_GITHUB_SECRET
        }
        env {
          name  = "NEXTAUTH_URL"
          value = var.NEXTAUTH_URL
        }

       
          resources {
    limits = {
      memory = "4Gi"
      cpu    = "2"  
      }
  }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
  
}

resource "google_cloud_run_service_iam_policy" "noauth5" {
  location = google_cloud_run_service.tsr-app.location
  service  = google_cloud_run_service.tsr-app.name
  

  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth5" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}
 


resource "google_cloud_run_service" "ontology-service" {
  name     = "ontology-service"
  location = "us-central1"

  template {
    spec {
      containers {
        image = "us-central1-docker.pkg.dev/${var.project_id}/docker-repo-wade-1/ontology-service:latest"
        ports {
          container_port = 8080
        }
        env {
          name  = "BUCKET_NAME"
          value = google_storage_bucket.video_bucket.name
        }
          resources {
    limits = {
      memory = "1Gi"
      cpu    = "1"  # Optional: Adjust CPU allocation if needed
      }
  }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }




}

resource "google_cloud_run_service_iam_policy" "noauth7" {
  location = google_cloud_run_service.ontology-service.location
  service  = google_cloud_run_service.ontology-service.name


  policy_data = data.google_iam_policy.noauth.policy_data
}

data "google_iam_policy" "noauth7" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}


