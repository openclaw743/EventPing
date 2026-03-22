resource "azurerm_static_web_app" "frontend" {
  name                = "${var.app_name}-${var.environment}-swa"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = var.frontend_location
  sku_tier            = "Free"
  sku_size            = "Free"

  tags = {
    environment = var.environment
    app         = var.app_name
  }
}
