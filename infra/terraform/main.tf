terraform {
  required_version = ">= 1.8.0"
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

# Placeholder module boundary for production infrastructure.
# Add cloud-specific modules for network, Postgres, Redis, object storage, CDN, KMS,
# secret manager, observability, and Kubernetes only after the target platform is selected.
resource "random_id" "deployment_suffix" {
  byte_length = 4
}

output "cinenova_environment_name" {
  value = "cinenova-${random_id.deployment_suffix.hex}"
}
