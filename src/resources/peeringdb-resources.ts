import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { PeeringDBClient } from '../services/peeringdb-client.js';
import { PEERINGDB_OBJECTS, getObjectTypes, VALID_QUERY_PARAMS } from '../config/peeringdb-objects.js';
import { validateQueryParams } from '../utils/validation.js';

/**
 * PeeringDB Resources Handler
 * 
 * Registers MCP resources for all PeeringDB GET operations.
 * Each object type gets both collection and individual resource endpoints.
 */
export class PeeringDBResources {
  constructor(private client: PeeringDBClient) {}

  registerResources(server: McpServer): void {
    // Register resources for each object type
    getObjectTypes().forEach(objectType => {
      this.registerObjectResources(server, objectType);
    });

    console.log('PeeringDB resources registered successfully');
  }

  private registerObjectResources(server: McpServer, objectType: string): void {
    const config = PEERINGDB_OBJECTS[objectType];
    if (!config) {
      throw new Error(`Unknown object type: ${objectType}`);
    }
    
    // Register collection resource (list all objects)
    server.registerResource(
      `peeringdb_${objectType}_collection`,
      new ResourceTemplate(`peeringdb://${objectType}`, {
        list: undefined
      }),
      {
        title: `${config.name} Collection`,
        description: `Retrieve multiple ${config.description.toLowerCase()}`,
        mimeType: 'application/json'
      },
      async (uri) => {
        try {
          const params = this.parseResourceParams(uri);
          const validatedParams = validateQueryParams(params);
          
          const response = await this.client.get(config.endpoint, validatedParams);
          
          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify(response, null, 2),
              mimeType: 'application/json'
            }]
          };
        } catch (error: any) {
          throw new Error(`Failed to retrieve ${objectType} collection: ${error.message}`);
        }
      }
    );

    // Register individual resource (get specific object by ID)
    server.registerResource(
      `peeringdb_${objectType}_individual`,
      new ResourceTemplate(`peeringdb://${objectType}/{id}`, { list: undefined }),
      {
        title: `Individual ${config.name}`,
        description: `Retrieve a specific ${config.name.toLowerCase()} by ID`,
        mimeType: 'application/json'
      },
      async (uri, args) => {
        const id = (args as any)?.id || uri.pathname.split('/').pop();
        try {
          const params = this.parseResourceParams(uri);
          const validatedParams = validateQueryParams(params);
          
          const response = await this.client.getById(config.endpoint, id, validatedParams);
          
          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify(response, null, 2),
              mimeType: 'application/json'
            }]
          };
        } catch (error: any) {
          throw new Error(`Failed to retrieve ${objectType} with ID ${id}: ${error.message}`);
        }
      }
    );

    // Register search resource with query parameters
    server.registerResource(
      `peeringdb_${objectType}_search`,
      new ResourceTemplate(`peeringdb://${objectType}/search`, {
        list: undefined
      }),
      {
        title: `${config.name} Search`,
        description: `Search ${config.description.toLowerCase()} with advanced filters`,
        mimeType: 'application/json'
      },
      async (uri) => {
        try {
          const params = this.parseResourceParams(uri);
          const validatedParams = validateQueryParams(params);
          
          const response = await this.client.get(config.endpoint, validatedParams);
          
          return {
            contents: [{
              uri: uri.href,
              text: JSON.stringify(response, null, 2),
              mimeType: 'application/json'
            }]
          };
        } catch (error: any) {
          throw new Error(`Failed to search ${objectType}: ${error.message}`);
        }
      }
    );
  }

  private parseResourceParams(uri: URL): Record<string, any> {
    const params: Record<string, any> = {};
    
    // Parse query parameters from URI
    uri.searchParams.forEach((value, key) => {
      // Handle numeric parameters
      if (['limit', 'skip', 'depth', 'since'].includes(key)) {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue)) {
          params[key] = numValue;
        }
      }
      // Handle comma-separated lists for 'in' queries
      else if (key.endsWith('__in')) {
        params[key] = value.split(',').map(v => v.trim());
      }
      // Handle string parameters
      else {
        params[key] = value;
      }
    });

    return params;
  }
}
