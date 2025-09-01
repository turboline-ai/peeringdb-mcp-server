import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PeeringDBClient } from '../services/peeringdb-client.js';
import { PEERINGDB_OBJECTS, getObjectTypes, supportsOperation } from '../config/peeringdb-objects.js';
import { createObjectSchema, validateObjectData } from '../utils/validation.js';

/**
 * PeeringDB Tools Handler
 * 
 * Registers MCP tools for all PeeringDB write operations (POST, PUT, PATCH, DELETE).
 * Each supported operation gets a dedicated tool with proper validation.
 */
export class PeeringDBTools {
  constructor(private client: PeeringDBClient) {}

  registerTools(server: McpServer): void {
    // Check if API key is available for write operations
    if (!this.client.hasApiKey()) {
      console.warn('API key not configured. Write operations will fail.');
    }

    // Register tools for each object type and supported operation
    getObjectTypes().forEach(objectType => {
      this.registerObjectTools(server, objectType);
    });

    console.log('PeeringDB tools registered successfully');
  }

  private registerObjectTools(server: McpServer, objectType: string): void {
    const config = PEERINGDB_OBJECTS[objectType];
    if (!config) {
      throw new Error(`Unknown object type: ${objectType}`);
    }

    // Register CREATE tool (POST)
    if (supportsOperation(objectType, 'POST')) {
      server.registerTool(
        `peeringdb_create_${objectType}`,
        {
          title: `Create ${config.name}`,
          description: `Create a new ${config.name.toLowerCase()} in PeeringDB`,
          inputSchema: {} // Schema will be validated by validateObjectData
        },
        async (args) => {
          try {
            const validatedData = validateObjectData(objectType, args, 'create');
            const response = await this.client.post(config.endpoint, validatedData);
            
            return {
              content: [{
                type: 'text',
                text: `Successfully created ${config.name.toLowerCase()}: ${JSON.stringify(response, null, 2)}`
              }]
            };
          } catch (error: any) {
            return {
              content: [{
                type: 'text',
                text: `Failed to create ${objectType}: ${error.message}`
              }],
              isError: true
            };
          }
        }
      );
    }

    // Register UPDATE tool (PUT)
    if (supportsOperation(objectType, 'PUT')) {
      server.registerTool(
        `peeringdb_update_${objectType}`,
        {
          title: `Update ${config.name}`,
          description: `Update an existing ${config.name.toLowerCase()} in PeeringDB (complete replacement)`,
          inputSchema: {} // Schema will be validated by validateObjectData
        },
        async (args: any) => {
          try {
            const { id, ...data } = args;
            const validatedData = validateObjectData(objectType, data, 'update');
            const response = await this.client.put(config.endpoint, id, validatedData);
            
            return {
              content: [{
                type: 'text',
                text: `Successfully updated ${config.name.toLowerCase()} ${id}: ${JSON.stringify(response, null, 2)}`
              }]
            };
          } catch (error: any) {
            return {
              content: [{
                type: 'text',
                text: `Failed to update ${objectType} ${args.id}: ${error.message}`
              }],
              isError: true
            };
          }
        }
      );
    }

    // Register PATCH tool (PATCH)
    if (supportsOperation(objectType, 'PATCH')) {
      server.registerTool(
        `peeringdb_patch_${objectType}`,
        {
          title: `Patch ${config.name}`,
          description: `Partially update an existing ${config.name.toLowerCase()} in PeeringDB`,
          inputSchema: {} // Schema will be validated by validateObjectData
        },
        async (args: any) => {
          try {
            const { id, ...data } = args;
            const validatedData = validateObjectData(objectType, data, 'patch');
            const response = await this.client.patch(config.endpoint, id, validatedData);
            
            return {
              content: [{
                type: 'text',
                text: `Successfully patched ${config.name.toLowerCase()} ${id}: ${JSON.stringify(response, null, 2)}`
              }]
            };
          } catch (error: any) {
            return {
              content: [{
                type: 'text',
                text: `Failed to patch ${objectType} ${(args as any).id}: ${error.message}`
              }],
              isError: true
            };
          }
        }
      );
    }

    // Register DELETE tool (DELETE)
    if (supportsOperation(objectType, 'DELETE')) {
      server.registerTool(
        `peeringdb_delete_${objectType}`,
        {
          title: `Delete ${config.name}`,
          description: `Delete an existing ${config.name.toLowerCase()} from PeeringDB`,
          inputSchema: {} // ID will be validated at runtime
        },
        async (args: any) => {
          try {
            const response = await this.client.delete(config.endpoint, args.id);
            
            return {
              content: [{
                type: 'text',
                text: `Successfully deleted ${config.name.toLowerCase()} ${args.id}: ${JSON.stringify(response, null, 2)}`
              }]
            };
          } catch (error: any) {
            return {
              content: [{
                type: 'text',
                text: `Failed to delete ${objectType} ${args.id}: ${error.message}`
              }],
              isError: true
            };
          }
        }
      );
    }

    // Register bulk operations tool
    server.registerTool(
      `peeringdb_bulk_${objectType}`,
      {
        title: `Bulk Operations for ${config.name}`,
        description: `Perform bulk operations on ${config.description.toLowerCase()}`,
        inputSchema: {
          operation: z.enum(['create', 'update', 'delete']).describe('Bulk operation type'),
          items: z.array(z.record(z.any())).describe('Array of items to process'),
          batch_size: z.number().optional().default(10).describe('Number of items to process in each batch')
        }
      },
      async (args) => {
        try {
          const results = [];
          const { operation, items, batch_size = 10 } = args;

          // Process items in batches to avoid overwhelming the API
          for (let i = 0; i < items.length; i += batch_size) {
            const batch = items.slice(i, i + batch_size);
            
            for (const item of batch) {
              try {
                let response;
                
                switch (operation) {
                  case 'create':
                    const createData = validateObjectData(objectType, item, 'create');
                    response = await this.client.post(config.endpoint, createData);
                    break;
                    
                  case 'update':
                    const { id: updateId, ...updateData } = item;
                    const validatedUpdateData = validateObjectData(objectType, updateData, 'update');
                    response = await this.client.put(config.endpoint, updateId, validatedUpdateData);
                    break;
                    
                  case 'delete':
                    response = await this.client.delete(config.endpoint, item.id);
                    break;
                }
                
                results.push({
                  success: true,
                  item: item,
                  response: response
                });
              } catch (error: any) {
                results.push({
                  success: false,
                  item: item,
                  error: error.message
                });
              }
            }
            
            // Add small delay between batches
            if (i + batch_size < items.length) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          const successful = results.filter(r => r.success).length;
          const failed = results.filter(r => !r.success).length;

          return {
            content: [{
              type: 'text',
              text: `Bulk ${operation} completed for ${config.name.toLowerCase()}:\n` +
                    `Successful: ${successful}\n` +
                    `Failed: ${failed}\n\n` +
                    `Results:\n${JSON.stringify(results, null, 2)}`
            }]
          };
        } catch (error: any) {
          return {
            content: [{
              type: 'text',
              text: `Failed to execute bulk ${args.operation} for ${objectType}: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );
  }
}
