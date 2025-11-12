import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { SDKConfig, RequestOptions, AdvancedSDKConfig, RateLimitStatus } from './types.js';
import { setConfig, getConfig as getStoredConfig } from './config.js';
import { APIError, TimeoutError, ConfigurationError } from './errors.js';
import { CacheManager } from './resilience/cache-manager.js';
import { RateLimiter } from './resilience/rate-limiter.js';

let axiosInstance: AxiosInstance | null = null;
let cacheManager: CacheManager | null = null;
let rateLimiter: RateLimiter | null = null;

/**
 * Configure the SDK with base URL, API key, and optional endpoint overrides
 */
export function configure(config: SDKConfig | AdvancedSDKConfig): void {
  // Validate and store configuration
  setConfig(config);
  
  const storedConfig = getStoredConfig();
  
  // Initialize cache manager if caching is enabled
  if (storedConfig.cache?.enabled) {
    cacheManager = new CacheManager(storedConfig.cache);
  } else {
    cacheManager = null;
  }
  
  // Initialize rate limiter if rate limiting is enabled
  if (storedConfig.rateLimit?.enabled) {
    rateLimiter = new RateLimiter(storedConfig.rateLimit);
  } else {
    rateLimiter = null;
  }
  
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
export function getConfig(): AdvancedSDKConfig {
  return getStoredConfig();
}

/**
 * Get the cache manager instance
 */
export function getCacheManager(): CacheManager | null {
  return cacheManager;
}

/**
 * Invalidate cache entries for a specific endpoint
 */
export function invalidateCache(pattern: string): void {
  if (cacheManager) {
    cacheManager.invalidatePattern(pattern);
  }
}

/**
 * Clear all cache entries
 */
export function clearCache(): void {
  if (cacheManager) {
    cacheManager.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return cacheManager ? cacheManager.getStats() : null;
}

/**
 * Get the rate limiter instance
 */
export function getRateLimiter(): RateLimiter | null {
  return rateLimiter;
}

/**
 * Get rate limit status
 */
export function getRateLimitStatus(): RateLimitStatus | null {
  return rateLimiter ? rateLimiter.getStatus() : null;
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
 * Generate cache key from endpoint and parameters
 */
function generateCacheKey(path: string, method: string, params?: any, data?: any): string {
  const keyParts = [method, path];
  
  if (params && Object.keys(params).length > 0) {
    keyParts.push(JSON.stringify(params));
  }
  
  if (data && Object.keys(data).length > 0) {
    keyParts.push(JSON.stringify(data));
  }
  
  return keyParts.join(':');
}

/**
 * Check if request should be cached (only cache GET requests)
 */
function shouldCache(method: string, options: RequestOptions & { bypassCache?: boolean }): boolean {
  return method === 'GET' && !options.bypassCache;
}

/**
 * Make an HTTP request with path parameter substitution, caching support, and rate limiting
 * @param endpointKey - Key from EndpointConfig (e.g., 'listMarkets', 'getMarketDetails')
 * @param options - Request options including method, params, data, pathParams, and bypassCache
 * @returns Promise with typed response data
 */
export async function request<T>(
  endpointKey: keyof import('./types.js').EndpointConfig,
  options: RequestOptions & { bypassCache?: boolean } = {}
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
  
  const method = options.method || 'GET';
  
  // Check cache if caching is enabled and this is a cacheable request
  if (cacheManager && shouldCache(method, options)) {
    const cacheKey = generateCacheKey(path, method, options.params, options.data);
    const cachedResult = cacheManager.get<T>(cacheKey);
    
    if (cachedResult !== null) {
      return cachedResult;
    }
  }
  
  // Check rate limits before making the request
  if (rateLimiter) {
    await rateLimiter.checkLimit();
  }
  
  try {
    const response = await instance.request<T>({
      url: path,
      method,
      params: options.params,
      data: options.data
    });
    
    // Record successful request for rate limiting
    if (rateLimiter) {
      rateLimiter.recordRequest();
    }
    
    // Cache successful GET responses
    if (cacheManager && shouldCache(method, options)) {
      const cacheKey = generateCacheKey(path, method, options.params, options.data);
      cacheManager.set(cacheKey, response.data);
    }
    
    return response.data;
  } catch (error) {
    // Handle rate limit errors (429) with automatic retry
    if (error instanceof APIError && error.statusCode === 429) {
      const retryAfter = extractRetryAfterHeader(error);
      if (retryAfter > 0) {
        // Wait for the retry-after period and then retry
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return request<T>(endpointKey, options);
      }
    }
    
    // Record failed request for rate limiting (still counts towards rate limit)
    if (rateLimiter) {
      rateLimiter.recordRequest();
    }
    
    // Errors are already transformed by the response interceptor
    throw error;
  }
}

/**
 * Extract Retry-After header value from 429 response
 */
function extractRetryAfterHeader(error: APIError): number {
  if (error.response && typeof error.response === 'object' && error.response !== null) {
    const response = error.response as any;
    if (response.headers && response.headers['retry-after']) {
      const retryAfter = response.headers['retry-after'];
      // Retry-After can be in seconds (number) or HTTP date
      if (typeof retryAfter === 'string') {
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          return seconds;
        }
        // Try parsing as HTTP date
        const date = new Date(retryAfter);
        if (!isNaN(date.getTime())) {
          return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 1000));
        }
      } else if (typeof retryAfter === 'number') {
        return retryAfter;
      }
    }
  }
  return 0;
}
