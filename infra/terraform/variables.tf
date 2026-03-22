variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
  default     = "427d4176-864a-44c1-8470-468709ff9252"
}

variable "resource_group_name" {
  description = "Name of the existing resource group"
  type        = string
  default     = "rg-Sandbox"
}

variable "location" {
  description = "Primary Azure region for backend resources"
  type        = string
  default     = "swedencentral"
}

variable "frontend_location" {
  description = "Azure region for Static Web App (must support SWA)"
  type        = string
  default     = "westeurope"
}

variable "app_name" {
  description = "Short application name used as resource name prefix"
  type        = string
  default     = "eventping"
}

variable "environment" {
  description = "Deployment environment (dev, staging, production)"
  type        = string
  default     = "staging"
}

variable "acr_sku" {
  description = "Azure Container Registry SKU"
  type        = string
  default     = "Basic"
}

variable "postgres_sku_name" {
  description = "PostgreSQL Flexible Server SKU"
  type        = string
  default     = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB (32768 = 32 GB)"
  type        = number
  default     = 32768
}

variable "postgres_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "15"
}

variable "postgres_admin_login" {
  description = "PostgreSQL administrator username"
  type        = string
  default     = "eventpingadmin"
}

variable "postgres_admin_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "container_app_cpu" {
  description = "CPU allocation for backend Container App"
  type        = number
  default     = 0.5
}

variable "container_app_memory" {
  description = "Memory allocation for backend Container App"
  type        = string
  default     = "1Gi"
}

variable "backend_image_tag" {
  description = "Docker image tag for backend deployment"
  type        = string
  default     = "latest"
}

variable "jwt_secret" {
  description = "JWT signing secret (min 32 chars)"
  type        = string
  sensitive   = true
}

variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  sensitive   = true
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  sensitive   = true
}
