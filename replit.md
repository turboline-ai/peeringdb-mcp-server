# PeeringDB MCP Server

## Overview

This project is a Model Context Protocol (MCP) server that provides a standardized interface to the PeeringDB API for seamless Large Language Model integration. The server acts as a bridge between LLMs and the PeeringDB database, mapping GET operations to MCP Resources for data retrieval and POST/PUT/PATCH/DELETE operations to MCP Tools for data manipulation. It supports all PeeringDB object types including organizations, facilities, internet exchanges, networks, points of contact, and their relationships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture Pattern
The application follows a modular, service-oriented architecture with clear separation of concerns:

- **MCP Server Layer**: Built on the Model Context Protocol SDK to expose PeeringDB functionality to LLMs
- **Service Layer**: Centralized HTTP client for PeeringDB API communication with authentication and error handling
- **Resource/Tool Handlers**: Separate modules for read operations (resources) and write operations (tools)
- **Configuration Layer**: Centralized object type definitions and validation schemas
- **Type Safety**: Full TypeScript implementation with Zod validation throughout

### Authentication Strategy
The system uses API key-based authentication for write operations, with environment variable configuration for security. Read operations are available without authentication, while write operations require a valid PeeringDB API key.

### Data Validation Approach
Implements a two-tier validation system:
- **Input Validation**: Zod schemas validate incoming requests based on object type and operation
- **Query Parameter Validation**: Custom validation for PeeringDB query modifiers and filters

### Resource Management
Resources are dynamically generated for each PeeringDB object type, providing both collection endpoints (for listing multiple objects) and individual object endpoints. The system supports comprehensive query parameters including field filters, modifiers, and relationship expansion.

### Tool Registration
Tools are conditionally registered based on supported operations for each object type, with proper schema validation and error handling for CRUD operations.

### Error Handling
Centralized error handling through axios interceptors with custom PeeringDB error types, providing detailed error information including status codes and response data.

## External Dependencies

### Core Framework
- **@modelcontextprotocol/sdk**: Primary framework for MCP server implementation and protocol compliance

### HTTP Client
- **axios**: HTTP client library for PeeringDB API communication with interceptor support for authentication and error handling

### Validation and Type Safety
- **zod**: Runtime type validation and schema generation for request/response validation
- **typescript**: Static type checking and development tooling

### Configuration Management
- **dotenv**: Environment variable management for API key configuration

### PeeringDB API
- **External API**: REST API at https://www.peeringdb.com/api providing access to internet infrastructure data
- **Authentication**: API key-based authentication for write operations
- **Rate Limiting**: Handled by PeeringDB service with appropriate timeout configurations