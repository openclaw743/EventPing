resource "azurerm_log_analytics_workspace" "law" {
  name                = "${var.app_name}-${var.environment}-law"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30

  tags = {
    environment = var.environment
    app         = var.app_name
  }
}

resource "azurerm_container_app_environment" "env" {
  name                       = "${var.app_name}-${var.environment}-cae"
  resource_group_name        = data.azurerm_resource_group.main.name
  location                   = data.azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.law.id

  tags = {
    environment = var.environment
    app         = var.app_name
  }
}

resource "azurerm_container_app" "backend" {
  name                         = "${var.app_name}-${var.environment}-backend"
  container_app_environment_id = azurerm_container_app_environment.env.id
  resource_group_name          = data.azurerm_resource_group.main.name
  revision_mode                = "Single"

  registry {
    server               = azurerm_container_registry.acr.login_server
    username             = azurerm_container_registry.acr.admin_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = azurerm_container_registry.acr.admin_password
  }

  secret {
    name  = "database-url"
    value = "postgresql://${var.postgres_admin_login}:${var.postgres_admin_password}@${azurerm_postgresql_flexible_server.postgres.fqdn}:5432/${var.app_name}?sslmode=require"
  }

  secret {
    name  = "jwt-secret"
    value = var.jwt_secret
  }

  secret {
    name  = "google-client-secret"
    value = var.google_client_secret
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "backend"
      image  = "${azurerm_container_registry.acr.login_server}/${var.app_name}-backend:${var.backend_image_tag}"
      cpu    = var.container_app_cpu
      memory = var.container_app_memory

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }

      env {
        name        = "JWT_SECRET"
        secret_name = "jwt-secret"
      }

      env {
        name  = "GOOGLE_CLIENT_ID"
        value = var.google_client_id
      }

      env {
        name        = "GOOGLE_CLIENT_SECRET"
        secret_name = "google-client-secret"
      }

      env {
        name  = "GOOGLE_CALLBACK_URL"
        value = "https://${var.app_name}-${var.environment}-backend.${azurerm_container_app_environment.env.default_domain}/api/auth/callback"
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://${azurerm_static_web_app.frontend.default_host_name}"
      }

      env {
        name  = "PORT"
        value = "3000"
      }
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000

    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }

  tags = {
    environment = var.environment
    app         = var.app_name
  }
}
