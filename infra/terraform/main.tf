terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  # Using local backend for initial provisioning
  # TODO: migrate to azurerm backend after storage account is created
}

provider "azurerm" {
  subscription_id = var.subscription_id
  features {}
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}
