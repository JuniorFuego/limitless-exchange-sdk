import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SDKConfig, RequestOptions } from './types.js';
import { setConfig, getConfig as getStoredConfig } from './config.js';
import { APIError, TimeoutError, ConfigurationError } from './errors.js';

let axiosInstance: AxiosInstance | null = null;

/**
 * Configure the SDK with base URL, API key, and optional endpoint overrides
 */
export function configure(config: SDKConfig): void {
  // Validate and store configuration
  setConfig(config);
  
  const storedConfig = getStoredConfig();
  
  // Create Axios instance with configuration
  axiosInstance = axios.create({
    baseURL: storedConfig.baseURL,
    timeout: storedConfig.timeout || 30000, // Default 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  // Request interceptor to inject API key
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const apiKey = storedConfig.apiKey || process.env.LIMITLESS_API_KEY;
      
      if (apiKey && config.headers) {
        config.headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Response interceptor to transform errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new TimeoutError(`Request timed out after ${storedConfig.timeout || 30000}ms`);
      }
      
      // Handle API errors with status codes
      if (error.response) {
        const statusCode = error.response.status;
        const message = error.response.data 
          ? (typeof error.response.data === 'object' && 'message' in error.response.data 
              ? String(error.response.data.message) 
              : JSON.stringify(error.response.data))
          : error.message;
        
        throw new APIError(
          message || `API request failed with status ${statusCode}`,
          statusCode,
          error.response.data
        );
      }
      
      // Handle network errors
      if (error.request) {
        throw new APIError(
          'Network error: Unable to reach the API',
          0,
          null
        );
      }
      
      // Handle other errors
      throw new APIError(error.message, 0, null);
    }
  );
}

/**
 * Get current SDK configuration
 */
export function getConfig(): SDKConfig {
  return getStoredConfig();
}

/**
 * Get the configured Axios instance
 */
export function getAxiosInstance(): AxiosInstance {
  if (!axiosInstance) {
    throw new ConfigurationError('SDK not configured. Call configure() first.');
  }
  return axiosInstance;
}

/**
 * Make an HTTP request with path parameter substitution
 * @param endpointKey - Key from EndpointConfig (e.g., 'listMarkets', 'getMarketDetails')
 * @param options - Request options including method, params, data, and pathParams
 * @returns Promise with typed response data
 */
export async function request<T>(
  endpointKey: keyof import('./types.js').EndpointConfig,
  options: RequestOptions = {}
): Promise<T> {
  const instance = getAxiosInstance();
  const config = getStoredConfig();
  
  // Get endpoint path from configuration
  if (!config.endpoints || !config.endpoints[endpointKey]) {
    throw new ConfigurationError(`Endpoint '${endpointKey}' is not configured`);
  }
  
  let path = config.endpoints[endpointKey] as string;
  
  // Substitute path parameters (e.g., :id → actual value)
  if (options.pathParams) {
    for (const [key, value] of Object.entries(options.pathParams)) {
      path = path.replace(`:${key}`, encodeURIComponent(value));
    }
  }
  
  try {
    const response = await instance.request<T>({
      url: path,
      method: options.method || 'GET',
      params: options.params,
      data: options.data
    });
    
    return response.data;
  } catch (error) {
    // Errors are already transformed by the response interceptor
    throw error;
  }
}
