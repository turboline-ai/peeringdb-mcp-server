#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { PeeringDBResources } from './resources/peeringdb-resources.js';
import { PeeringDBTools } from './tools/peeringdb-tools.js';
import { PeeringDBClient } from './services/peeringdb-client.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * PeeringDB MCP Server
 * 
 * This server exposes the PeeringDB API through the Model Context Protocol:
 * - GET operations are exposed as MCP resources
 * - POST/PUT/PATCH/DELETE operations are exposed as MCP tools
 */
class PeeringDBMCPServer {
  private server: McpServer;
  private client: PeeringDBClient;
  private resources: PeeringDBResources;
  private tools: PeeringDBTools;

  constructor() {
    // Initialize MCP server
    this.server = new McpServer({
      name: 'peeringdb-mcp-server',
      version: '1.0.0',
      description: 'MCP server for PeeringDB API integration'
    });

    // Initialize PeeringDB client
    this.client = new PeeringDBClient();

    // Initialize resources and tools
    this.resources = new PeeringDBResources(this.client);
    this.tools = new PeeringDBTools(this.client);

    this.setupServer();
  }

  private setupServer(): void {
    // Register resources (GET operations)
    this.resources.registerResources(this.server);

    // Register tools (POST/PUT/PATCH/DELETE operations)
    this.tools.registerTools(this.server);

    // Error handling is handled by the SDK automatically

    console.log('PeeringDB MCP Server initialized successfully');
  }

  async start(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.log('PeeringDB MCP Server started and connected via stdio');
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\nShutting down PeeringDB MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down PeeringDB MCP Server...');
  process.exit(0);
});

// Start the server
async function main() {
  const server = new PeeringDBMCPServer();
  await server.start();
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Failed to start PeeringDB MCP Server:', error);
    process.exit(1);
  });
}

export { PeeringDBMCPServer };
