import { SDKConfig, EndpointConfig } from './types.js';
import { ConfigurationError } from './errors.js';

// Real Limitless Exchange API endpoints based on official API documentation
export const DEFAULT_ENDPOINTS: EndpointConfig = {
  listMarkets: '/markets/active',
  getMarketDetails: '/markets/:id',
  submitBet: '/orders',
  getBetHistory: '/portfolio/history',
  getUserStats: '/portfolio/positions',
  getLeaderboard: '/portfolio/positions'
};

let currentConfig: SDKConfig | null = null;

export function validateConfig(config: SDKConfig): void {
  if (!config.baseURL) {
    throw new ConfigurationError('baseURL is required');
  }

  try {
    new URL(config.baseURL);
  } catch (error) {
    throw new ConfigurationError('baseURL must be a valid URL');
  }
}

export function setConfig(config: SDKConfig): void {
  validateConfig(config);
  currentConfig = {
    ...config,
    endpoints: {
      ...DEFAULT_ENDPOINTS,
      ...config.endpoints
    }
  };
}

export function getConfig(): SDKConfig {
  if (!currentConfig) {
    throw new ConfigurationError('SDK not configured. Call configure() first.');
  }
  return currentConfig;
}
