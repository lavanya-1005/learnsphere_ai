variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "project_name" {
  type    = string
  default = "learnsphere"
}

variable "github_repo_url" {
  type        = string
  description = "Your GitHub repository URL"
}

variable "jwt_secret_key" {
  type      = string
  sensitive = true
}

variable "groq_api_key" {
  type      = string
  sensitive = true
}