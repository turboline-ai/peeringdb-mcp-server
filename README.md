# PeeringDB MCP Server

A Model Context Protocol (MCP) server that exposes the PeeringDB API as resources and tools for seamless Large Language Model (LLM) integration.

## Overview

This MCP server provides a standardized interface to the PeeringDB API, mapping:
- **GET operations** → MCP Resources (for data retrieval)
- **POST/PUT/PATCH/DELETE operations** → MCP Tools (for data manipulation)

## Features

- **Complete PeeringDB API Coverage**: Support for all object types (org, fac, ix, net, poc, ixlan, ixpfx, netixlan, netfac)
- **Dynamic Resource Templates**: Auto-generated resources for collection and individual object access
- **Comprehensive Tools**: CRUD operations with proper validation and error handling
- **Query Parameter Support**: Full support for PeeringDB query modifiers and filters
- **Nested Data Expansion**: Configurable depth control for related objects
- **Authentication Handling**: Secure API key management for write operations
- **Bulk Operations**: Efficient batch processing capabilities
- **Type Safety**: Full TypeScript implementation with Zod validation

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd peeringdb-mcp-server
