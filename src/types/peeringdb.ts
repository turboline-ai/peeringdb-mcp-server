/**
 * Type definitions for PeeringDB API responses and objects
 */

export interface PeeringDBResponse {
  data: any[];
  meta?: {
    [key: string]: any;
  };
}

export interface PeeringDBError {
  message: string;
  status?: number;
  data?: any;
  url?: string;
}

export interface PeeringDBObject {
  id: number;
  status: string;
  created: string;
  updated: string;
  [key: string]: any;
}

export interface Organization extends PeeringDBObject {
  name: string;
  website?: string;
  notes?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  net_set?: number[] | Network[];
  fac_set?: number[] | Facility[];
  ix_set?: number[] | InternetExchange[];
}

export interface Facility extends PeeringDBObject {
  name: string;
  org_id: number;
  org?: Organization;
  website?: string;
  clli?: string;
  rencode?: string;
  npanxx?: string;
  notes?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  region_continent?: string;
  tech_email?: string;
  tech_phone?: string;
  sales_email?: string;
  sales_phone?: string;
  netfac_set?: number[] | NetworkFacility[];
}

export interface InternetExchange extends PeeringDBObject {
  name: string;
  name_long?: string;
  org_id: number;
  org?: Organization;
  city?: string;
  country?: string;
  region_continent?: string;
  media?: string;
  notes?: string;
  proto_unicast?: boolean;
  proto_multicast?: boolean;
  proto_ipv6?: boolean;
  website?: string;
  url_stats?: string;
  tech_email?: string;
  tech_phone?: string;
  policy_email?: string;
  policy_phone?: string;
  sales_email?: string;
  sales_phone?: string;
  ixlan_set?: number[] | IXLan[];
  netixlan_set?: number[] | NetworkIXLan[];
}

export interface Network extends PeeringDBObject {
  name: string;
  aka?: string;
  name_long?: string;
  org_id: number;
  org?: Organization;
  asn: number;
  website?: string;
  irr_as_set?: string;
  looking_glass?: string;
  route_server?: string;
  notes?: string;
  notes_private?: string;
  info_type?: string;
  info_prefixes4?: number;
  info_prefixes6?: number;
  info_traffic?: string;
  info_ratio?: string;
  info_scope?: string;
  info_unicast?: boolean;
  info_multicast?: boolean;
  info_ipv6?: boolean;
  policy_url?: string;
  policy_general?: string;
  policy_locations?: string;
  policy_ratio?: string;
  policy_contracts?: string;
  netfac_set?: number[] | NetworkFacility[];
  netixlan_set?: number[] | NetworkIXLan[];
  poc_set?: number[] | PointOfContact[];
}

export interface PointOfContact extends PeeringDBObject {
  net_id: number;
  net?: Network;
  role: string;
  name: string;
  email: string;
  phone?: string;
  url?: string;
  visible?: string;
}

export interface IXLan extends PeeringDBObject {
  name: string;
  ix_id: number;
  ix?: InternetExchange;
  descr?: string;
  mtu?: number;
  vlan?: number;
  dot1q_support?: boolean;
  rs_asn?: number;
  ixpfx_set?: number[] | IXPrefix[];
  netixlan_set?: number[] | NetworkIXLan[];
}

export interface IXPrefix extends PeeringDBObject {
  ixlan_id: number;
  ixlan?: IXLan;
  prefix: string;
  protocol?: string;
}

export interface NetworkIXLan extends PeeringDBObject {
  net_id: number;
  net?: Network;
  ixlan_id: number;
  ixlan?: IXLan;
  ix_id?: number;
  ix?: InternetExchange;
  ipaddr4?: string;
  ipaddr6?: string;
  is_rs_peer?: boolean;
  speed?: number;
  asn?: number;
  operational?: boolean;
}

export interface NetworkFacility extends PeeringDBObject {
  net_id: number;
  net?: Network;
  fac_id: number;
  fac?: Facility;
  local_asn?: number;
  avail_sonet?: boolean;
  avail_ethernet?: boolean;
  avail_atm?: boolean;
}

export type PeeringDBObjectType = 
  | Organization 
  | Facility 
  | InternetExchange 
  | Network 
  | PointOfContact 
  | IXLan 
  | IXPrefix 
  | NetworkIXLan 
  | NetworkFacility;
