/**
 * PeeringDB Object Type Definitions
 * 
 * Configuration for all PeeringDB object types including their
 * endpoints, required fields, and validation schemas.
 */

export interface PeeringDBObjectConfig {
  endpoint: string;
  name: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  relationships: string[];
  writeOperations: ('POST' | 'PUT' | 'PATCH' | 'DELETE')[];
}

export const PEERINGDB_OBJECTS: Record<string, PeeringDBObjectConfig> = {
  org: {
    endpoint: 'org',
    name: 'Organization',
    description: 'Organizations in PeeringDB',
    requiredFields: ['name'],
    optionalFields: [
      'website', 'notes', 'address1', 'address2', 'city', 'state', 
      'zipcode', 'country', 'latitude', 'longitude', 'phone', 'email'
    ],
    relationships: ['net_set', 'fac_set', 'ix_set'],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  fac: {
    endpoint: 'fac',
    name: 'Facility',
    description: 'Colocation facilities and data centers',
    requiredFields: ['name', 'org_id'],
    optionalFields: [
      'website', 'clli', 'rencode', 'npanxx', 'notes', 'address1', 
      'address2', 'city', 'state', 'zipcode', 'country', 'latitude', 
      'longitude', 'region_continent', 'tech_email', 'tech_phone', 
      'sales_email', 'sales_phone'
    ],
    relationships: ['netfac_set', 'ixfac_set'],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  ix: {
    endpoint: 'ix',
    name: 'Internet Exchange',
    description: 'Internet Exchange Points',
    requiredFields: ['name', 'org_id'],
    optionalFields: [
      'name_long', 'city', 'country', 'region_continent', 'media', 
      'notes', 'proto_unicast', 'proto_multicast', 'proto_ipv6', 
      'website', 'url_stats', 'tech_email', 'tech_phone', 'policy_email', 
      'policy_phone', 'sales_email', 'sales_phone'
    ],
    relationships: ['ixlan_set', 'ixfac_set', 'netixlan_set'],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  net: {
    endpoint: 'net',
    name: 'Network',
    description: 'Autonomous Systems and Networks',
    requiredFields: ['name', 'org_id', 'asn'],
    optionalFields: [
      'aka', 'name_long', 'website', 'irr_as_set', 'looking_glass', 
      'route_server', 'notes', 'notes_private', 'info_type', 'info_prefixes4', 
      'info_prefixes6', 'info_traffic', 'info_ratio', 'info_scope', 
      'info_unicast', 'info_multicast', 'info_ipv6', 'policy_url', 
      'policy_general', 'policy_locations', 'policy_ratio', 'policy_contracts'
    ],
    relationships: ['netfac_set', 'netixlan_set', 'poc_set'],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  poc: {
    endpoint: 'poc',
    name: 'Point of Contact',
    description: 'Contact information for networks',
    requiredFields: ['net_id', 'role', 'name', 'email'],
    optionalFields: ['phone', 'url', 'visible'],
    relationships: [],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  ixlan: {
    endpoint: 'ixlan',
    name: 'IX LAN',
    description: 'Internet Exchange LAN details',
    requiredFields: ['ix_id', 'name'],
    optionalFields: ['descr', 'mtu', 'vlan', 'dot1q_support', 'rs_asn'],
    relationships: ['ixpfx_set', 'netixlan_set'],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  ixpfx: {
    endpoint: 'ixpfx',
    name: 'IX Prefix',
    description: 'IP prefixes announced at Internet Exchanges',
    requiredFields: ['ixlan_id', 'prefix'],
    optionalFields: ['protocol'],
    relationships: [],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  netixlan: {
    endpoint: 'netixlan',
    name: 'Network IX LAN',
    description: 'Network connections to Internet Exchange LANs',
    requiredFields: ['net_id', 'ixlan_id'],
    optionalFields: [
      'ipaddr4', 'ipaddr6', 'is_rs_peer', 'speed', 'asn', 'operational'
    ],
    relationships: [],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  },
  
  netfac: {
    endpoint: 'netfac',
    name: 'Network Facility',
    description: 'Network presence at facilities',
    requiredFields: ['net_id', 'fac_id'],
    optionalFields: ['local_asn', 'avail_sonet', 'avail_ethernet', 'avail_atm'],
    relationships: [],
    writeOperations: ['POST', 'PUT', 'PATCH', 'DELETE']
  }
};

export const VALID_QUERY_MODIFIERS = [
  'contains', 'startswith', 'lt', 'lte', 'gt', 'gte', 'in'
];

export const VALID_QUERY_PARAMS = [
  'limit', 'skip', 'depth', 'fields', 'since'
];

/**
 * Get all available object types
 */
export function getObjectTypes(): string[] {
  return Object.keys(PEERINGDB_OBJECTS);
}

/**
 * Get configuration for a specific object type
 */
export function getObjectConfig(objectType: string): PeeringDBObjectConfig | undefined {
  return PEERINGDB_OBJECTS[objectType.toLowerCase()];
}

/**
 * Check if an object type supports a specific write operation
 */
export function supportsOperation(objectType: string, operation: string): boolean {
  const config = getObjectConfig(objectType);
  return config?.writeOperations.includes(operation as any) ?? false;
}
