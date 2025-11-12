import { ConfigurationError } from './errors.js';
// Real Limitless Exchange API endpoints based on official API documentation
export const DEFAULT_ENDPOINTS = {
    listMarkets: '/markets/active',
    getMarketDetails: '/markets/:id',
    submitBet: '/orders',
    getBetHistory: '/portfolio/history',
    getUserStats: '/portfolio/positions',
    getLeaderboard: '/portfolio/positions'
};
let currentConfig = null;
export function validateConfig(config) {
    if (!config.baseURL) {
        throw new ConfigurationError('baseURL is required');
    }
    try {
        new URL(config.baseURL);
    }
    catch (error) {
        throw new ConfigurationError('baseURL must be a valid URL');
    }
    // Validate advanced configuration options if present
    const advancedConfig = config;
    if (advancedConfig.websocket) {
        if (advancedConfig.websocket.url) {
            try {
                new URL(advancedConfig.websocket.url);
            }
            catch (error) {
                throw new ConfigurationError('websocket.url must be a valid URL');
            }
        }
        if (advancedConfig.websocket.reconnectDelay && advancedConfig.websocket.reconnectDelay < 0) {
            throw new ConfigurationError('websocket.reconnectDelay must be non-negative');
        }
        if (advancedConfig.websocket.maxReconnectDelay && advancedConfig.websocket.maxReconnectDelay < 0) {
            throw new ConfigurationError('websocket.maxReconnectDelay must be non-negative');
        }
    }
    if (advancedConfig.cache) {
        if (advancedConfig.cache.maxSize && advancedConfig.cache.maxSize <= 0) {
            throw new ConfigurationError('cache.maxSize must be positive');
        }
        if (advancedConfig.cache.defaultTTL && advancedConfig.cache.defaultTTL <= 0) {
            throw new ConfigurationError('cache.defaultTTL must be positive');
        }
    }
    if (advancedConfig.rateLimit) {
        if (advancedConfig.rateLimit.requestsPerSecond && advancedConfig.rateLimit.requestsPerSecond <= 0) {
            throw new ConfigurationError('rateLimit.requestsPerSecond must be positive');
        }
        if (advancedConfig.rateLimit.requestsPerMinute && advancedConfig.rateLimit.requestsPerMinute <= 0) {
            throw new ConfigurationError('rateLimit.requestsPerMinute must be positive');
        }
    }
    if (advancedConfig.retry) {
        if (advancedConfig.retry.maxAttempts && advancedConfig.retry.maxAttempts <= 0) {
            throw new ConfigurationError('retry.maxAttempts must be positive');
        }
        if (advancedConfig.retry.initialDelay && advancedConfig.retry.initialDelay < 0) {
            throw new ConfigurationError('retry.initialDelay must be non-negative');
        }
        if (advancedConfig.retry.maxDelay && advancedConfig.retry.maxDelay < 0) {
            throw new ConfigurationError('retry.maxDelay must be non-negative');
        }
    }
    if (advancedConfig.circuitBreaker) {
        if (advancedConfig.circuitBreaker.failureThreshold && advancedConfig.circuitBreaker.failureThreshold <= 0) {
            throw new ConfigurationError('circuitBreaker.failureThreshold must be positive');
        }
        if (advancedConfig.circuitBreaker.timeout && advancedConfig.circuitBreaker.timeout < 0) {
            throw new ConfigurationError('circuitBreaker.timeout must be non-negative');
        }
    }
    if (advancedConfig.batch) {
        if (advancedConfig.batch.concurrency && advancedConfig.batch.concurrency <= 0) {
            throw new ConfigurationError('batch.concurrency must be positive');
        }
    }
    if (advancedConfig.pagination) {
        if (advancedConfig.pagination.defaultPageSize && advancedConfig.pagination.defaultPageSize <= 0) {
            throw new ConfigurationError('pagination.defaultPageSize must be positive');
        }
        if (advancedConfig.pagination.maxPageSize && advancedConfig.pagination.maxPageSize <= 0) {
            throw new ConfigurationError('pagination.maxPageSize must be positive');
        }
    }
}
export function setConfig(config) {
    validateConfig(config);
    // Provide sensible defaults for advanced features
    const advancedConfig = config;
    currentConfig = {
        ...advancedConfig,
        endpoints: {
            ...DEFAULT_ENDPOINTS,
            ...config.endpoints
        },
        // WebSocket defaults
        websocket: {
            enabled: false,
            reconnect: true,
            reconnectDelay: 1000,
            maxReconnectDelay: 30000,
            ...advancedConfig.websocket
        },
        // Cache defaults
        cache: {
            enabled: false,
            maxSize: 1000,
            defaultTTL: 300000, // 5 minutes
            ttlByResource: {
                markets: 60000, // 1 minute
                marketDetails: 30000, // 30 seconds
                userStats: 300000, // 5 minutes
                leaderboard: 120000 // 2 minutes
            },
            ...advancedConfig.cache
        },
        // Rate limit defaults
        rateLimit: {
            enabled: false,
            requestsPerSecond: 10,
            requestsPerMinute: 600,
            ...advancedConfig.rateLimit
        },
        // Retry defaults
        retry: {
            enabled: false,
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 30000,
            ...advancedConfig.retry
        },
        // Circuit breaker defaults
        circuitBreaker: {
            enabled: false,
            failureThreshold: 5,
            successThreshold: 2,
            timeout: 60000,
            monitoringPeriod: 10000,
            ...advancedConfig.circuitBreaker
        },
        // Batch defaults
        batch: {
            concurrency: 5,
            continueOnError: true,
            ...advancedConfig.batch
        },
        // Pagination defaults
        pagination: {
            defaultPageSize: 50,
            maxPageSize: 1000,
            ...advancedConfig.pagination
        },
        // Telemetry defaults
        telemetry: {
            enabled: false,
            ...advancedConfig.telemetry
        },
        // Deduplication defaults
        deduplication: {
            enabled: false,
            ...advancedConfig.deduplication
        }
    };
}
export function getConfig() {
    if (!currentConfig) {
        throw new ConfigurationError('SDK not configured. Call configure() first.');
    }
    return currentConfig;
}
/**
 * Validate configuration without applying it
 * @param config - Configuration to validate
 * @returns True if valid, throws ConfigurationError if invalid
 */
export function validateConfigOnly(config) {
    validateConfig(config);
    return true;
}
