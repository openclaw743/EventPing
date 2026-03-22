resource "azurerm_container_registry" "acr" {
  name                = "${replace(var.app_name, "-", "")}${var.environment}acr"
  resource_group_name = data.azurerm_resource_group.main.name
  location            = data.azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = true

  tags = {
    environment = var.environment
    app         = var.app_name
  }
}
