output "backend_public_ip" {
  value = aws_instance.backend.public_ip
}

output "backend_api_url" {
  value = "http://${aws_instance.backend.public_ip}:8000"
}

output "backend_swagger_url" {
  value = "http://${aws_instance.backend.public_ip}:8000/docs"
}

output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.bucket
}

output "cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.frontend_cdn.domain_name}"
}

output "backend_api_cloudfront_url" {
  value = "https://${aws_cloudfront_distribution.backend_api_cdn.domain_name}"
}
