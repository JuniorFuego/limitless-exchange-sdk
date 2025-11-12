// Client module exports
export { 
  configure, 
  getConfig, 
  getCacheStats, 
  getRateLimitStatus, 
  clearCache, 
  invalidateCache 
} from './client.js';

// Markets module exports
export { listMarkets, getMarketDetails } from './markets.js';

// Bets module exports
export { submitBet, getBetHistory } from './bets.js';

// Users module exports
export { getUserStats, getLeaderboard } from './users.js';

// Type exports
export type {
  Market,
  MarketDetails,
  Outcome,
  MarketFilters,
  BetParams,
  Bet,
  BetResult,
  UserStats,
  LeaderboardEntry,
  SDKConfig,
  EndpointConfig,
  RequestOptions
} from './types.js';

// Error class exports
export {
  SDKError,
  ConfigurationError,
  APIError,
  ValidationError,
  TimeoutError
} from './errors.js';
