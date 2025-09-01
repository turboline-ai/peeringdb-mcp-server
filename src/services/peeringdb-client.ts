import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PeeringDBResponse, PeeringDBError } from '../types/peeringdb.js';

/**
 * PeeringDB API Client
 * 
 * Handles all HTTP communications with the PeeringDB API including
 * authentication, error handling, and response parsing.
 */
export class PeeringDBClient {
  private client: AxiosInstance;
  private apiKey: string | undefined;
  private baseURL = 'https://www.peeringdb.com/api';

  constructor() {
    this.apiKey = process.env.PEERINGDB_API_KEY;
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'PeeringDB-MCP-Server/1.0.0'
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.client.interceptors.request.use(
      (config) => {
        if (this.apiKey && this.requiresAuth(config.method?.toUpperCase() || '')) {
          config.headers['Authorization'] = `Api-Key ${this.apiKey}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const peeringDBError: PeeringDBError = {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        };
        
        if (error.response?.status === 401) {
          peeringDBError.message = 'Authentication failed. Please check your API key.';
        } else if (error.response?.status === 403) {
          peeringDBError.message = 'Access forbidden. Insufficient permissions.';
        } else if (error.response?.status === 404) {
          peeringDBError.message = 'Resource not found.';
        } else if (error.response?.status === 429) {
          peeringDBError.message = 'Rate limit exceeded. Please try again later.';
        }

        return Promise.reject(peeringDBError);
      }
    );
  }

  private requiresAuth(method: string): boolean {
    return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  }

  /**
   * GET request for retrieving objects
   */
  async get(endpoint: string, params?: Record<string, any>): Promise<PeeringDBResponse> {
    try {
      const response: AxiosResponse = await this.client.get(`/${endpoint}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * GET request for retrieving a single object by ID
   */
  async getById(endpoint: string, id: number | string, params?: Record<string, any>): Promise<PeeringDBResponse> {
    try {
      const response: AxiosResponse = await this.client.get(`/${endpoint}/${id}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request for creating new objects
   */
  async post(endpoint: string, data: Record<string, any>): Promise<PeeringDBResponse> {
    this.validateApiKey();
    try {
      const response: AxiosResponse = await this.client.post(`/${endpoint}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request for updating complete objects
   */
  async put(endpoint: string, id: number | string, data: Record<string, any>): Promise<PeeringDBResponse> {
    this.validateApiKey();
    try {
      const response: AxiosResponse = await this.client.put(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request for partial updates
   */
  async patch(endpoint: string, id: number | string, data: Record<string, any>): Promise<PeeringDBResponse> {
    this.validateApiKey();
    try {
      const response: AxiosResponse = await this.client.patch(`/${endpoint}/${id}`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request for removing objects
   */
  async delete(endpoint: string, id: number | string): Promise<PeeringDBResponse> {
    this.validateApiKey();
    try {
      const response: AxiosResponse = await this.client.delete(`/${endpoint}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private validateApiKey(): void {
    if (!this.apiKey) {
      throw new Error('API key is required for write operations. Please set PEERINGDB_API_KEY environment variable.');
    }
  }

  private handleError(error: any): PeeringDBError {
    if (error.message && error.status !== undefined) {
      // Already a PeeringDBError from interceptor
      return error;
    }

    // Generic error handling
    return {
      message: error.message || 'Unknown error occurred',
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    };
  }

  /**
   * Check if API key is configured
   */
  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get base URL for reference
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}
