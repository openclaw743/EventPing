terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }

  backend "azurerm" {
    # Configure via CLI flags or environment variables:
    # TF_VAR_resource_group_name, ARM_* env vars
    # Or provide a backend config file: terraform init -backend-config=backend.hcl
  }
}

provider "azurerm" {
  subscription_id = var.subscription_id
  features {}
}

data "azurerm_resource_group" "main" {
  name = var.resource_group_name
}
