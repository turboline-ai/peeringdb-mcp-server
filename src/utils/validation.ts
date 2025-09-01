import { z } from 'zod';
import { PEERINGDB_OBJECTS, VALID_QUERY_PARAMS, VALID_QUERY_MODIFIERS } from '../config/peeringdb-objects.js';

/**
 * Validation utilities for PeeringDB API requests
 */

/**
 * Validate query parameters for GET requests
 */
export function validateQueryParams(params: Record<string, any>): Record<string, any> {
  const validated: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    // Check if it's a standard query parameter
    if (VALID_QUERY_PARAMS.includes(key)) {
      validated[key] = value;
      continue;
    }

    // Check if it's a field query with modifier
    const modifierMatch = key.match(/^(.+)__(.+)$/);
    if (modifierMatch && modifierMatch.length >= 3) {
      const fieldName = modifierMatch[1];
      const modifier = modifierMatch[2];
      if (modifier && VALID_QUERY_MODIFIERS.includes(modifier)) {
        validated[key] = value;
        continue;
      }
    }

    // Allow direct field queries (exact match)
    validated[key] = value;
  }

  return validated;
}

/**
 * Create Zod schema for object validation based on operation type
 */
export function createObjectSchema(objectType: string, operation: 'create' | 'update' | 'patch'): z.ZodSchema {
  const config = PEERINGDB_OBJECTS[objectType];
  if (!config) {
    throw new Error(`Unknown object type: ${objectType}`);
  }

  const schemaFields: Record<string, z.ZodTypeAny> = {};

  // Add ID field for update and patch operations
  if (operation === 'update' || operation === 'patch') {
    schemaFields.id = z.union([z.string(), z.number()]).describe(`${config.name} ID`);
  }

  // Add required fields for create and update operations
  if (operation === 'create' || operation === 'update') {
    config.requiredFields.forEach(field => {
      schemaFields[field] = createFieldSchema(field, true);
    });
  }

  // Add optional fields
  config.optionalFields.forEach(field => {
    const isRequired = operation === 'create' && config.requiredFields.includes(field);
    schemaFields[field] = createFieldSchema(field, isRequired).optional();
  });

  // For patch operations, make all fields optional except ID
  if (operation === 'patch') {
    Object.keys(schemaFields).forEach(key => {
      if (key !== 'id' && schemaFields[key]) {
        schemaFields[key] = schemaFields[key].optional();
      }
    });
  }

  return z.object(schemaFields);
}

/**
 * Create field-specific Zod schema
 */
function createFieldSchema(fieldName: string, isRequired: boolean): z.ZodTypeAny {
  // Common ID fields
  if (fieldName.endsWith('_id') || fieldName === 'id') {
    return z.union([z.string(), z.number()]).describe(`${fieldName.replace('_id', '')} ID`);
  }

  // ASN field
  if (fieldName === 'asn') {
    return z.number().positive().int().describe('Autonomous System Number');
  }

  // Email fields
  if (fieldName.includes('email')) {
    return z.string().email().describe('Email address');
  }

  // Phone fields
  if (fieldName.includes('phone')) {
    return z.string().describe('Phone number');
  }

  // URL/Website fields
  if (fieldName.includes('url') || fieldName === 'website' || fieldName === 'looking_glass') {
    return z.string().url().describe('URL');
  }

  // Geographic coordinates
  if (fieldName === 'latitude') {
    return z.number().min(-90).max(90).describe('Latitude coordinate');
  }
  if (fieldName === 'longitude') {
    return z.number().min(-180).max(180).describe('Longitude coordinate');
  }

  // Boolean fields
  if (fieldName.startsWith('proto_') || fieldName.startsWith('info_') || fieldName.startsWith('avail_') || 
      fieldName === 'is_rs_peer' || fieldName === 'dot1q_support' || fieldName === 'operational') {
    return z.boolean().describe(`${fieldName} flag`);
  }

  // Numeric fields
  if (fieldName === 'speed' || fieldName === 'mtu' || fieldName === 'vlan' || fieldName === 'rs_asn' || 
      fieldName === 'local_asn' || fieldName.startsWith('info_prefixes')) {
    return z.number().nonnegative().int().describe(fieldName);
  }

  // IP address fields
  if (fieldName.includes('ipaddr') || fieldName === 'prefix') {
    return z.string().describe('IP address or prefix');
  }

  // Enum-like fields
  if (fieldName === 'role') {
    return z.enum(['Abuse', 'Administrative', 'Maintenance', 'NOC', 'Policy', 'Public Relations', 'Sales', 'Technical'])
      .describe('Contact role');
  }

  if (fieldName === 'visible') {
    return z.enum(['Users', 'Public', 'Private']).describe('Visibility level');
  }

  if (fieldName === 'status') {
    return z.enum(['ok', 'pending', 'deleted']).describe('Object status');
  }

  if (fieldName === 'info_type') {
    return z.enum(['Content', 'Cable/DSL/ISP', 'Enterprise', 'Educational/Research', 'Government', 'Non-Profit', 'Route Server', 'Network Services', 'Online Gaming'])
      .describe('Network type');
  }

  if (fieldName === 'info_scope') {
    return z.enum(['Global', 'Regional', 'National', 'Local']).describe('Network scope');
  }

  if (fieldName === 'policy_general') {
    return z.enum(['Open', 'Selective', 'Restrictive', 'No']).describe('General peering policy');
  }

  // Default to string for other fields
  return z.string().describe(fieldName);
}

/**
 * Validate object data against schema
 */
export function validateObjectData(objectType: string, data: Record<string, any>, operation: 'create' | 'update' | 'patch'): Record<string, any> {
  const schema = createObjectSchema(objectType, operation);
  
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      throw new Error(`Validation failed for ${objectType}: ${issues}`);
    }
    throw error;
  }
}

/**
 * Validate object type exists
 */
export function validateObjectType(objectType: string): boolean {
  return Object.prototype.hasOwnProperty.call(PEERINGDB_OBJECTS, objectType.toLowerCase());
}

/**
 * Sanitize and validate resource URI parameters
 */
export function validateResourceUri(uri: string): { objectType: string; id?: string; params: Record<string, any> } {
  const url = new URL(uri);
  const pathParts = url.pathname.split('/').filter(part => part.length > 0);
  
  if (pathParts.length < 1 || pathParts[0] !== 'peeringdb:') {
    throw new Error('Invalid PeeringDB resource URI format');
  }

  const objectType = pathParts[1];
  if (!objectType) {
    throw new Error('Missing object type in URI');
  }
  if (!validateObjectType(objectType)) {
    throw new Error(`Invalid object type: ${objectType}`);
  }

  const id = pathParts[2];
  const params: Record<string, any> = {};
  
  url.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return { 
    objectType, 
    ...(id ? { id } : {}), 
    params: validateQueryParams(params) 
  };
}
