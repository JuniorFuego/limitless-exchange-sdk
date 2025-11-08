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
}
