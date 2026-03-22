output "acr_login_server" {
  description = "Azure Container Registry login server URL"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_admin_username" {
  description = "ACR admin username"
  value       = azurerm_container_registry.acr.admin_username
  sensitive   = true
}

output "backend_url" {
  description = "Backend Container App URL"
  value       = "https://${azurerm_container_app.backend.latest_revision_fqdn}"
}

output "frontend_url" {
  description = "Frontend Static Web App URL"
  value       = "https://${azurerm_static_web_app.frontend.default_host_name}"
}

output "static_web_app_api_key" {
  description = "Static Web App deployment token (use in CI/CD)"
  value       = azurerm_static_web_app.frontend.api_key
  sensitive   = true
}

output "postgres_fqdn" {
  description = "PostgreSQL server fully-qualified domain name"
  value       = azurerm_postgresql_flexible_server.postgres.fqdn
}

output "database_url" {
  description = "Full PostgreSQL connection string (sensitive)"
  value       = "postgresql://${var.postgres_admin_login}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.postgres.fqdn}:5432/${var.app_name}?sslmode=require"
  sensitive   = true
}
