// Market Types
export interface Market {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  expirationDate: string;
  expirationTimestamp: number;
  status: string;
  volume: string;
  volumeFormatted: string;
  slug: string;
  conditionId: string;
  collateralToken: {
    address: string;
    decimals: number;
    symbol: string;
  };
  creator: {
    name: string;
    imageURI: string;
    link: string;
  };
  prices: number[];
  tokens: {
    yes: string;
    no: string;
  };
  categories: string[];
  tags: string[];
  tradeType: string;
  marketType: string;
  expired: boolean;
  // Nullable fields (can be null)
  proxyTitle: string | null;
  logo: string | null;
  winningOutcomeIndex: number | null;
  negRiskRequestId: string | null;
  address?: string;
  positionIds?: string[];
}

export interface Outcome {
  id: string;
  name: string;
  probability: number;
}

export interface MarketDetails extends Market {
  outcomes?: Outcome[];
  currentOdds?: Record<string, number>;
  participants?: number;
}

export interface MarketFilters {
  status?: 'active' | 'closed' | 'resolved';
  limit?: number;
  offset?: number;
}

// Bet Types
export interface BetParams {
  marketId: string;
  outcome: 'YES' | 'NO';
  amount: number;
}

export interface Bet {
  id: string;
  marketId: string;
  outcome: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'settled' | 'cancelled';
}

export interface BetResult {
  betId: string;
  transactionHash?: string;
  status: string;
}

// User Types
export interface UserStats {
  address: string;
  totalBets: number;
  totalVolume: number;
  winRate: number;
  rank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  totalVolume: number;
  winRate: number;
  profit: number;
}

// Configuration Types
export interface EndpointConfig {
  listMarkets: string;
  getMarketDetails: string;
  submitBet: string;
  getBetHistory: string;
  getUserStats: string;
  getLeaderboard: string;
}

export interface SDKConfig {
  baseURL: string;
  apiKey?: string;
  endpoints?: Partial<EndpointConfig>;
  timeout?: number;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  params?: Record<string, any>;
  data?: any;
  pathParams?: Record<string, string>;
  bypassCache?: boolean;
}

// Advanced SDK Types

// WebSocket Types
export interface MarketUpdate {
  marketId: string;
  timestamp: string;
  data: MarketDetails;
  changeType: 'price' | 'volume' | 'status';
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting'
}

export interface WebSocketConfig {
  enabled: boolean;
  url?: string;
  reconnect: boolean;
  reconnectDelay: number;
  maxReconnectDelay: number;
}

// Cache Types
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  maxSize: number;
}

export interface CacheConfig {
  enabled: boolean;
  maxSize: number;
  defaultTTL: number;
  ttlByResource?: Record<string, number>;
}

// Rate Limiting Types
export interface RateLimitStatus {
  requestsInWindow: number;
  windowSize: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitConfig {
  enabled: boolean;
  requestsPerSecond?: number;
  requestsPerMinute?: number;
}

// Retry Types
export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors: number[];
}

export interface RetryConfig {
  enabled: boolean;
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
}

export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  delay: number;
  error: Error;
}

// Circuit Breaker Types
export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

// Event System Types
export type EventHandler = (data: EventData) => void | Promise<void>;

export interface EventData {
  timestamp: Date;
  event: string;
  context: Record<string, any>;
}

export type SDKEvent =
  | 'request:start'
  | 'request:success'
  | 'request:error'
  | 'cache:hit'
  | 'cache:miss'
  | 'rate:throttled'
  | 'circuit:opened'
  | 'circuit:closed'
  | 'retry:attempt'
  | 'websocket:connected'
  | 'websocket:disconnected'
  | 'transaction:status';

// Plugin System Types
export interface PluginContext {
  sdk: {
    config: AdvancedSDKConfig;
    cache: any; // Will be properly typed when cache manager is implemented
    events: any; // Will be properly typed when event emitter is implemented
    registerEndpoint(name: string, handler: Function): void;
    registerMiddleware(middleware: any): void; // Will be properly typed when middleware is implemented
  };
}

export interface Plugin {
  name: string;
  version: string;
  initialize(context: PluginContext): void | Promise<void>;
  cleanup?(): void | Promise<void>;
}

// Middleware Types
export interface MiddlewareContext {
  request: {
    endpoint: string;
    method: string;
    params: any;
    data: any;
  };
  response?: {
    data: any;
    status: number;
    headers: Record<string, string>;
  };
  metadata: Record<string, any>;
}

export type Middleware = (context: MiddlewareContext, next: () => Promise<any>) => Promise<any>;

// Analytics Types
export interface TrendData {
  marketId: string;
  period: number;
  priceChange: number;
  volumeChange: number;
  momentum: number;
  volatility: number;
}

export interface MarketComparison {
  markets: Market[];
  bestValue: string;
  expectedReturns: Record<string, number>;
}

export interface ArbitrageOpportunity {
  markets: string[];
  profit: number;
  bets: Array<{ marketId: string; outcome: string; amount: number }>;
}

// Transaction Tracking Types
export type TransactionEvent = 'pending' | 'submitted' | 'confirming' | 'confirmed' | 'failed';

export interface TransactionStatus {
  transactionId: string;
  status: TransactionEvent;
  confirmations: number;
  blockNumber?: number;
  timestamp: Date;
  error?: string;
}

// Gas Estimation Types
export interface GasPrices {
  slow: number;
  standard: number;
  fast: number;
  timestamp: Date;
}

export interface GasEstimate {
  gasLimit: number;
  gasPrices: GasPrices;
  estimatedCost: {
    slow: string;
    standard: string;
    fast: string;
  };
}

// Batch Operations Types
export interface BatchResult<T> {
  results: Array<{ success: true; data: T } | { success: false; error: Error }>;
  successCount: number;
  failureCount: number;
}

export interface BatchConfig {
  concurrency: number;
  continueOnError: boolean;
  onProgress?: (completed: number, total: number) => void;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  cursor: string | null;
  hasNextPage: boolean;
  pageSize: number;
}

export interface PaginationOptions {
  pageSize?: number;
  cursor?: string;
}

export interface PaginationConfig {
  defaultPageSize: number;
  maxPageSize: number;
}

// Streaming Types
export interface StreamOptions {
  pageSize?: number;
  signal?: AbortSignal;
}

// Metrics Types
export interface EndpointMetrics {
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
}

export interface SDKMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  endpoints: Record<string, EndpointMetrics>;
}

// Error Tracking Types
export interface ErrorContext {
  endpoint: string;
  method: string;
  params: any;
  timestamp: Date;
}

export interface ErrorRecord {
  id: string;
  error: Error;
  context: ErrorContext;
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface ErrorFilters {
  type?: string;
  endpoint?: string;
  startDate?: Date;
  endDate?: Date;
}

export type ErrorReporter = (error: ErrorRecord) => void | Promise<void>;

// Health Monitoring Types
export interface ComponentStatus {
  name: string;
  healthy: boolean;
  message?: string;
}

export interface HealthCheckResult {
  healthy: boolean;
  timestamp: Date;
  api: {
    reachable: boolean;
    responseTime: number;
  };
  components: ComponentStatus[];
}

export interface SDKStatus {
  cache: { enabled: boolean; size: number; hitRate: number };
  websocket: { connected: boolean; subscriptions: number };
  circuitBreakers: Record<string, CircuitState>;
  rateLimit: RateLimitStatus;
}

// Deduplication Types
export interface DeduplicationStats {
  totalRequests: number;
  deduplicatedRequests: number;
  deduplicationRate: number;
}

export interface DeduplicationConfig {
  enabled: boolean;
}

// Telemetry Types
export interface TelemetryConfig {
  enabled: boolean;
  errorReporting?: ErrorReporter;
}

// Advanced SDK Configuration
export interface AdvancedSDKConfig extends SDKConfig {
  websocket?: WebSocketConfig;
  cache?: CacheConfig;
  rateLimit?: RateLimitConfig;
  retry?: RetryConfig;
  circuitBreaker?: CircuitBreakerConfig;
  batch?: BatchConfig;
  pagination?: PaginationConfig;
  telemetry?: TelemetryConfig;
  deduplication?: DeduplicationConfig;
}
