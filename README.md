# Limitless Exchange SDK

A TypeScript SDK and CLI tool for interacting with Limitless Exchange prediction markets on the Base blockchain.

## ⚠️ Important Notice

**This SDK is built using the Limitless Exchange API which is currently in development.** While the API is publicly available at `https://api.limitless.exchange`, some endpoints and features may change as the platform evolves. Use this SDK at your own risk and be prepared to adapt to API changes.

## API Information

- **API Base URL**: `https://api.limitless.exchange`
- **API Documentation**: `https://api.limitless.exchange` (Scalar API Reference)
- **Blockchain**: Base (Ethereum L2)
- **Conditional Tokens Contract**: `0xc9c98965297bc527861c898329ee280632b76e18`

## API Documentation

The Limitless Exchange API provides interactive documentation via Scalar API Reference at:
**https://api.limitless.exchange**

Open this URL in your browser to explore:
- All available endpoints with request/response examples
- Authentication requirements
- Request/response schemas
- Try out API calls directly from the documentation

## Known Unknowns

The following aspects of the Limitless Exchange API require verification or may change:

- **Authentication**: The correct method for API key authentication (header name, format) - if required
- **Request/Response Formats**: Some endpoint structures may vary from what's documented here
- **Rate Limiting**: Any rate limits or throttling mechanisms
- **Error Codes**: The complete set of error codes and their meanings
- **Pagination**: Exact pagination parameters for list endpoints
- **Blockchain Integration**: Complete flow for bet submission and transaction confirmation

**Important**: The default endpoints in this SDK (`/markets/active`, `/markets/:id`, etc.) are placeholders based on the API documentation. You may need to override them based on your specific use case. Refer to the Scalar API documentation for the most up-to-date endpoint paths.

If you discover updated API specifications or encounter issues, please open an issue or pull request to help improve this SDK.

## Features

- 🎯 Type-safe TypeScript SDK with full IntelliSense support
- 🔧 Configurable endpoints - easily adapt to API changes
- 💻 Command-line interface for quick interactions
- ✅ Comprehensive error handling with custom error types
- 📦 ESM module format for modern JavaScript projects
- 🧪 Fully tested with mocked API responses

## Installation

Install the package using npm:

```bash
npm install limitless-exchange-sdk
```

Or using yarn:

```bash
yarn add limitless-exchange-sdk
```

For CLI usage, you can install globally:

```bash
npm install -g limitless-exchange-sdk
```

## Environment Variables

The SDK and CLI support the following environment variables:

- `LIMITLESS_API_URL`: Base URL for the Limitless Exchange API (required)
- `LIMITLESS_API_KEY`: API key for authentication (optional, depending on API requirements)

You can set these in your shell:

```bash
export LIMITLESS_API_URL="https://api.limitless.exchange"
export LIMITLESS_API_KEY="your-api-key-here"
```

Or create a `.env` file in your project root:

```env
LIMITLESS_API_URL=https://api.limitless.exchange
LIMITLESS_API_KEY=your-api-key-here
```

## SDK Usage

### Basic Initialization

Before using any SDK functions, you must configure the SDK with your API base URL:

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: 'your-api-key-here', // Optional
  timeout: 30000 // Optional, defaults to 30 seconds
});
```

### Listing Markets

Retrieve a list of available prediction markets:

```typescript
import { listMarkets } from 'limitless-exchange-sdk';

// List all markets
const markets = await listMarkets();

// List markets with filters
const activeMarkets = await listMarkets({
  status: 'active',
  limit: 20,
  offset: 0
});

console.log(markets);
// Output: Array of Market objects
```

### Getting Market Details

Get detailed information about a specific market:

```typescript
import { getMarketDetails } from 'limitless-exchange-sdk';

const marketId = 'market-123';
const details = await getMarketDetails(marketId);

console.log(details);
// Output: MarketDetails object with outcomes, odds, and participants
```

### Submitting a Bet

Place a bet on a prediction market:

```typescript
import { submitBet } from 'limitless-exchange-sdk';

const result = await submitBet({
  marketId: 'market-123',
  outcome: 'YES',
  amount: 10.5
});

console.log(result);
// Output: { betId: '...', transactionHash: '...', status: '...' }
```

### Getting Bet History

Retrieve bet history for a wallet address:

```typescript
import { getBetHistory } from 'limitless-exchange-sdk';

const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const bets = await getBetHistory(address);

console.log(bets);
// Output: Array of Bet objects
```

### Getting User Statistics

Get statistics for a specific user:

```typescript
import { getUserStats } from 'limitless-exchange-sdk';

const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
const stats = await getUserStats(address);

console.log(stats);
// Output: { address, totalBets, totalVolume, winRate, rank }
```

### Getting Leaderboard

Retrieve the leaderboard of top users:

```typescript
import { getLeaderboard } from 'limitless-exchange-sdk';

// Get top 10 users (default)
const leaderboard = await getLeaderboard();

// Get top 50 users
const topFifty = await getLeaderboard(50);

console.log(leaderboard);
// Output: Array of LeaderboardEntry objects
```

### Overriding Specific Endpoints

If the API endpoints change, you can override specific endpoints without modifying the SDK code:

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: 'your-api-key-here',
  endpoints: {
    // Override only the endpoints that changed
    listMarkets: '/v2/markets/list',
    getMarketDetails: '/v2/markets/:id/details',
    // Other endpoints will use defaults
  }
});
```

## CLI Usage

The CLI provides a convenient way to interact with Limitless Exchange from the command line.

### Setting Up Environment Variables

Before using the CLI, set the required environment variables in your shell:

**Linux/macOS:**

```bash
export LIMITLESS_API_URL="https://api.limitless.exchange"
export LIMITLESS_API_KEY="your-api-key-here"
```

**Windows (Command Prompt):**

```cmd
set LIMITLESS_API_URL=https://api.limitless.exchange
set LIMITLESS_API_KEY=your-api-key-here
```

**Windows (PowerShell):**

```powershell
$env:LIMITLESS_API_URL="https://api.limitless.exchange"
$env:LIMITLESS_API_KEY="your-api-key-here"
```

### Using a .env File

For persistent configuration, create a `.env` file in your project directory:

```env
LIMITLESS_API_URL=https://api.limitless.exchange
LIMITLESS_API_KEY=your-api-key-here
```

The CLI will automatically load environment variables from the `.env` file when you run commands from that directory.

**Example .env file:**

```env
# Limitless Exchange API Configuration
LIMITLESS_API_URL=https://api.limitless.exchange

# Optional: API key for authentication
LIMITLESS_API_KEY=your-api-key-here
```

### CLI Commands

#### List Markets

Display all available prediction markets:

```bash
limitless-ex markets
```

**Example output:**

```
ID              Title                           Status    Volume
market-123      Will BTC reach $100k by 2024?   active    $45,230
market-456      US Election 2024                active    $128,450
market-789      ETH above $5k in Q1             closed    $23,100
```

**With JSON output:**

```bash
limitless-ex markets --json
```

**Example JSON output:**

```json
[
  {
    "id": "market-123",
    "title": "Will BTC reach $100k by 2024?",
    "description": "...",
    "status": "active",
    "totalVolume": 45230,
    "createdAt": "2024-01-15T10:00:00Z",
    "expiresAt": "2024-12-31T23:59:59Z"
  }
]
```

#### Get Market Details

Get detailed information about a specific market:

```bash
limitless-ex market <market-id>
```

**Example:**

```bash
limitless-ex market market-123
```

**Example output:**

```
Market: Will BTC reach $100k by 2024?
ID: market-123
Status: active
Created: 2024-01-15
Expires: 2024-12-31
Total Volume: $45,230
Participants: 342

Outcomes:
  YES: 65% probability
  NO: 35% probability
```

**With JSON output:**

```bash
limitless-ex market market-123 --json
```

#### Place a Bet

Submit a bet on a prediction market:

```bash
limitless-ex bet --market <market-id> --outcome <YES|NO> --amount <amount>
```

**Example:**

```bash
limitless-ex bet --market market-123 --outcome YES --amount 10.5
```

**Example output:**

```
✓ Bet placed successfully!
Bet ID: bet-789xyz
Transaction Hash: 0xabc123...
Status: pending
Amount: 10.5
Outcome: YES
```

**With JSON output:**

```bash
limitless-ex bet --market market-123 --outcome YES --amount 10.5 --json
```

**Example JSON output:**

```json
{
  "betId": "bet-789xyz",
  "transactionHash": "0xabc123...",
  "status": "pending"
}
```

**Note:** The outcome parameter is case-insensitive (`YES`, `yes`, `Yes` all work).

#### Get User Statistics

Retrieve statistics for a wallet address:

```bash
limitless-ex user <wallet-address>
```

**Example:**

```bash
limitless-ex user 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

**Example output:**

```
User Statistics
Address: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Total Bets: 47
Total Volume: $2,340
Win Rate: 68.5%
Rank: #23
```

**With JSON output:**

```bash
limitless-ex user 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --json
```

### Global Flags

All commands support the following global flags:

#### --json Flag

Output results in JSON format for scripting and automation:

```bash
limitless-ex markets --json
limitless-ex market market-123 --json
limitless-ex user 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --json
```

**Use case:** Parse output in scripts

```bash
# Get market count
MARKET_COUNT=$(limitless-ex markets --json | jq 'length')
echo "Total markets: $MARKET_COUNT"

# Get specific market status
STATUS=$(limitless-ex market market-123 --json | jq -r '.status')
echo "Market status: $STATUS"
```

#### --api-url Flag

Override the API URL for a single command:

```bash
limitless-ex markets --api-url https://api.limitless.exchange
```

This is useful for:
- Testing against different environments
- Overriding the environment variable temporarily
- Using a custom API endpoint

**Example:**

```bash
# Use staging environment for this command only
limitless-ex markets --api-url https://staging-api.limitless.exchange

# Environment variable remains unchanged for other commands
limitless-ex user 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Exit Codes and Error Handling

The CLI uses standard Unix exit codes for scripting and automation:

#### Exit Codes

- **0**: Command completed successfully
- **1**: Command failed (any error occurred)

#### Using Exit Codes in Scripts

**Bash/Shell scripts:**

```bash
# Check if command succeeded
if limitless-ex markets; then
  echo "✓ Markets retrieved successfully"
else
  echo "✗ Failed to retrieve markets"
  exit 1
fi

# Store exit code
limitless-ex market market-123
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "Success"
else
  echo "Failed with exit code: $EXIT_CODE"
fi

# Use in conditional chains
limitless-ex markets && echo "Success" || echo "Failed"
```

**PowerShell scripts:**

```powershell
# Check exit code
limitless-ex markets
if ($LASTEXITCODE -eq 0) {
    Write-Host "Success"
} else {
    Write-Host "Failed with exit code: $LASTEXITCODE"
    exit 1
}
```

#### Error Messages

The CLI provides user-friendly error messages for common issues:

**Configuration Error:**

```bash
$ limitless-ex markets
Error: API URL is required. Set LIMITLESS_API_URL environment variable or use --api-url flag.
```

**Validation Error:**

```bash
$ limitless-ex bet --market market-123 --outcome MAYBE --amount 10
Error: Invalid outcome. Must be YES or NO.
```

```bash
$ limitless-ex bet --market market-123 --outcome YES --amount -5
Error: Amount must be a positive number.
```

```bash
$ limitless-ex user invalid-address
Error: Invalid Ethereum address format. Address must start with 0x followed by 40 hexadecimal characters.
```

**API Error:**

```bash
$ limitless-ex market nonexistent-market
Error: Market not found (404)
```

```bash
$ limitless-ex markets
Error: API request failed (500): Internal server error
```

**Timeout Error:**

```bash
$ limitless-ex markets
Error: Request timed out after 30 seconds. Check your network connection or try again later.
```

**Network Error:**

```bash
$ limitless-ex markets
Error: Network error: Unable to connect to https://api.limitless.exchange
Check your internet connection and verify the API URL is correct.
```

### Complete CLI Examples

#### Example 1: Check Active Markets and Place a Bet

```bash
# Set up environment
export LIMITLESS_API_URL="https://api.limitless.exchange"
export LIMITLESS_API_KEY="your-api-key"

# List active markets
limitless-ex markets

# Get details for a specific market
limitless-ex market market-123

# Place a bet
limitless-ex bet --market market-123 --outcome YES --amount 25
```

#### Example 2: Automated Script with Error Handling

```bash
#!/bin/bash

# Configuration
export LIMITLESS_API_URL="https://api.limitless.exchange"

# Get markets and check for errors
if ! MARKETS=$(limitless-ex markets --json); then
    echo "Failed to fetch markets"
    exit 1
fi

# Count active markets
ACTIVE_COUNT=$(echo "$MARKETS" | jq '[.[] | select(.status=="active")] | length')
echo "Active markets: $ACTIVE_COUNT"

# Get details for first market
FIRST_MARKET_ID=$(echo "$MARKETS" | jq -r '.[0].id')
limitless-ex market "$FIRST_MARKET_ID"
```

#### Example 3: Using .env File

Create `.env` file:

```env
LIMITLESS_API_URL=https://api.limitless.exchange
LIMITLESS_API_KEY=your-api-key-here
```

Run commands (automatically loads .env):

```bash
# No need to export variables - .env is loaded automatically
limitless-ex markets
limitless-ex market market-123
limitless-ex user 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

#### Example 4: JSON Output for Data Processing

```bash
# Get all markets and filter by status
limitless-ex markets --json | jq '.[] | select(.status=="active")'

# Get market details and extract specific fields
limitless-ex market market-123 --json | jq '{id, title, status, totalVolume}'

# Get user stats and calculate metrics
limitless-ex user 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb --json | \
  jq '{address, winRate, totalBets, avgBetSize: (.totalVolume / .totalBets)}'
```

#### Example 5: Testing Different Environments

```bash
# Production
limitless-ex markets --api-url https://api.limitless.exchange

# Staging
limitless-ex markets --api-url https://staging-api.limitless.exchange

# Local development
limitless-ex markets --api-url http://localhost:3000
```

### Getting Help

Display help information for any command:

```bash
# General help
limitless-ex --help

# Command-specific help
limitless-ex markets --help
limitless-ex bet --help
limitless-ex user --help
```

## Examples

The `examples/` directory contains complete, runnable example scripts demonstrating SDK usage:

### Available Examples

1. **Basic Usage** (`examples/basic-usage.js`)
   - SDK initialization and configuration
   - Listing markets
   - Getting market details
   - Retrieving user statistics

2. **Endpoint Override** (`examples/endpoint-override.js`)
   - Customizing API endpoints
   - Adapting to API changes
   - Timeout configuration

### Running the Examples

```bash
# Install dependencies first
npm install

# Run basic usage example
node examples/basic-usage.js

# Run endpoint override example
node examples/endpoint-override.js
```

For detailed instructions and more information, see the [examples/README.md](examples/README.md) file.

## Advanced Configuration

### Timeout Configuration

Configure request timeout (in milliseconds) to handle slow network conditions or long-running API requests:

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  timeout: 60000 // 60 seconds (default is 30 seconds)
});
```

**When to adjust timeout:**
- Increase for slow network connections or high-latency environments
- Decrease for faster failure detection in production systems
- Typical values: 10000-60000ms (10-60 seconds)

**Example with different timeouts:**

```typescript
// Development: longer timeout for debugging
configure({
  baseURL: 'https://api.limitless.exchange',
  timeout: 120000 // 2 minutes
});

// Production: faster failure detection
configure({
  baseURL: 'https://api.limitless.exchange',
  timeout: 15000 // 15 seconds
});
```

### Overriding Specific Endpoints

When the Limitless Exchange API evolves, you may need to update specific endpoints without waiting for an SDK update. The SDK allows you to override individual endpoints while keeping others at their defaults.

**Example: Single endpoint override**

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  endpoints: {
    // Only override the endpoint that changed
    listMarkets: '/v2/markets/active',
    // All other endpoints use their default values
  }
});
```

**Example: Multiple endpoint overrides**

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: 'your-api-key',
  endpoints: {
    listMarkets: '/api/v2/markets',
    getMarketDetails: '/api/v2/markets/:id/full',
    submitBet: '/api/v2/transactions/bet',
    // getBetHistory, getUserStats, getLeaderboard use defaults
  }
});
```

### Complete Endpoint Override

If the API structure changes significantly (e.g., major version upgrade), you can override all endpoints at once:

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  endpoints: {
    listMarkets: '/api/v2/markets',
    getMarketDetails: '/api/v2/markets/:id',
    submitBet: '/api/v2/bets/create',
    getBetHistory: '/api/v2/users/:address/bets',
    getUserStats: '/api/v2/users/:address/stats',
    getLeaderboard: '/api/v2/leaderboard'
  }
});
```

### Adapting to API Changes

When the Limitless Exchange API changes, follow these steps to adapt the SDK:

#### Step 1: Identify the Changed Endpoint

Check the error message or API documentation to identify which endpoint changed:

```typescript
// If you get an error like: "404 Not Found: /v1/markets"
// The listMarkets endpoint may have changed
```

#### Step 2: Find the New Endpoint Path

Consult the Limitless Exchange API documentation at `https://api.limitless.exchange` to find the updated endpoint path.

#### Step 3: Override the Endpoint

Update your configuration to use the new endpoint:

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  endpoints: {
    listMarkets: '/v2/markets/list', // New endpoint path
  }
});
```

#### Step 4: Test the Change

Verify the endpoint works correctly:

```typescript
import { listMarkets } from 'limitless-exchange-sdk';

try {
  const markets = await listMarkets();
  console.log('✓ Endpoint working:', markets.length, 'markets found');
} catch (error) {
  console.error('✗ Endpoint still failing:', error.message);
}
```

#### Step 5: Report the Change

Help the community by reporting the API change:
1. Open an issue in the SDK repository
2. Include the old and new endpoint paths
3. Mention the date you discovered the change

### Path Parameters

Endpoints support path parameters using the `:param` syntax. The SDK automatically substitutes these with actual values:

```typescript
// Endpoint: '/v1/markets/:id'
// Actual request: '/v1/markets/market-123'
await getMarketDetails('market-123');

// Endpoint: '/v1/users/:address/stats'
// Actual request: '/v1/users/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb/stats'
await getUserStats('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
```

**Custom endpoints with path parameters:**

```typescript
configure({
  baseURL: 'https://api.limitless.exchange',
  endpoints: {
    // Use :id for market ID parameter
    getMarketDetails: '/v2/markets/:id/details',
    
    // Use :address for wallet address parameter
    getBetHistory: '/v2/wallets/:address/history',
    getUserStats: '/v2/users/:address',
  }
});
```

### Retrieving Current Configuration

You can retrieve the current SDK configuration to verify settings or debug issues:

```typescript
import { getConfig } from 'limitless-exchange-sdk';

const config = getConfig();
console.log('Base URL:', config.baseURL);
console.log('Timeout:', config.timeout);
console.log('Endpoints:', config.endpoints);
console.log('API Key configured:', !!config.apiKey);
```

**Use cases:**
- Debugging configuration issues
- Logging configuration in application startup
- Verifying endpoint overrides are applied correctly

### Environment-Specific Configuration

Configure the SDK differently for development, staging, and production environments:

```typescript
import { configure } from 'limitless-exchange-sdk';

const environment = process.env.NODE_ENV || 'development';

const configs = {
  development: {
    baseURL: 'http://localhost:3000',
    timeout: 120000, // Longer timeout for debugging
    apiKey: 'dev-api-key'
  },
  staging: {
    baseURL: 'https://staging-api.limitless.exchange',
    timeout: 30000,
    apiKey: process.env.STAGING_API_KEY
  },
  production: {
    baseURL: 'https://api.limitless.exchange',
    timeout: 15000, // Faster failure detection
    apiKey: process.env.LIMITLESS_API_KEY
  }
};

configure(configs[environment]);
```

### Dynamic Configuration Updates

You can reconfigure the SDK at runtime if needed:

```typescript
import { configure } from 'limitless-exchange-sdk';

// Initial configuration
configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: 'initial-key'
});

// Later, update configuration (e.g., after user login)
configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: 'user-specific-key',
  timeout: 45000
});
```

**Note:** Reconfiguring affects all subsequent API calls. Existing in-flight requests use their original configuration.

## Error Handling

The SDK provides custom error classes for different failure scenarios:

```typescript
import {
  APIError,
  ValidationError,
  ConfigurationError,
  TimeoutError
} from 'limitless-exchange-sdk';

try {
  const result = await submitBet({
    marketId: 'market-123',
    outcome: 'MAYBE', // Invalid outcome
    amount: 10
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.error(`Validation error in field "${error.field}": ${error.message}`);
  } else if (error instanceof APIError) {
    console.error(`API error (${error.statusCode}): ${error.message}`);
    console.error('Response:', error.response);
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out:', error.message);
  } else if (error instanceof ConfigurationError) {
    console.error('Configuration error:', error.message);
  }
}
```

## TypeScript Types

The SDK exports all TypeScript interfaces for type-safe development:

```typescript
import type {
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
  EndpointConfig
} from 'limitless-exchange-sdk';
```

## Troubleshooting

### Common Issues and Solutions

#### "API URL is required" Error

**Problem:** SDK throws `ConfigurationError: API URL is required`

**Solution:** Configure the SDK before making any API calls:

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange'
});
```

**For CLI users:** Ensure the `LIMITLESS_API_URL` environment variable is set:

```bash
export LIMITLESS_API_URL="https://api.limitless.exchange"
```

Or create a `.env` file:

```env
LIMITLESS_API_URL=https://api.limitless.exchange
```

#### "Invalid Ethereum address" Error

**Problem:** `ValidationError: Invalid Ethereum address format`

**Solution:** Ethereum addresses must follow the correct format:
- Start with `0x`
- Be followed by exactly 40 hexadecimal characters (0-9, a-f, A-F)
- Total length: 42 characters

**Valid examples:**
```typescript
'0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'  // ✓ Valid
'0xABCDEF1234567890ABCDEF1234567890ABCDEF12'  // ✓ Valid
```

**Invalid examples:**
```typescript
'742d35Cc6634C0532925a3b844Bc9e7595f0bEb'    // ✗ Missing 0x prefix
'0x742d35Cc6634C0532925a3b844Bc9e7595f0b'    // ✗ Too short (40 chars needed)
'0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbZ' // ✗ Invalid character 'Z'
```

#### API Errors (404, 500, etc.)

**Problem:** `APIError: 404 Not Found` or other HTTP errors

**Possible causes:**
1. API endpoint has changed
2. Resource doesn't exist (e.g., invalid market ID)
3. API is temporarily unavailable

**Solutions:**

**1. Check if the endpoint has changed:**

Visit the API documentation at `https://api.limitless.exchange` to verify the current endpoint structure.

**2. Override the failing endpoint:**

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  endpoints: {
    listMarkets: '/v2/markets', // Updated endpoint
  }
});
```

**3. Verify the resource exists:**

```typescript
// Check if market ID is correct
try {
  const details = await getMarketDetails('market-123');
} catch (error) {
  if (error instanceof APIError && error.statusCode === 404) {
    console.error('Market not found. Check the market ID.');
  }
}
```

**4. Handle API errors gracefully:**

```typescript
import { APIError } from 'limitless-exchange-sdk';

try {
  const markets = await listMarkets();
} catch (error) {
  if (error instanceof APIError) {
    switch (error.statusCode) {
      case 404:
        console.error('Endpoint not found. API may have changed.');
        break;
      case 429:
        console.error('Rate limit exceeded. Wait before retrying.');
        break;
      case 500:
      case 502:
      case 503:
        console.error('API server error. Try again later.');
        break;
      default:
        console.error(`API error (${error.statusCode}): ${error.message}`);
    }
  }
}
```

**5. Report the issue:**

If the endpoint has changed, open an issue in the SDK repository with:
- The endpoint that's failing
- The error message
- The date you encountered the issue

#### Timeout Errors

**Problem:** `TimeoutError: Request timed out after 30 seconds`

**Possible causes:**
1. Slow network connection
2. API is experiencing high load
3. Timeout setting is too low

**Solutions:**

**1. Increase the timeout:**

```typescript
import { configure } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange',
  timeout: 60000 // 60 seconds (default is 30 seconds)
});
```

**2. Check your network connection:**

```bash
# Test API connectivity
curl https://api.limitless.exchange

# Check DNS resolution
nslookup api.limitless.exchange

# Test with ping
ping api.limitless.exchange
```

**3. Verify the API is accessible:**

Visit `https://api.limitless.exchange` in your browser to check if the API is online.

**4. Implement retry logic:**

```typescript
async function fetchMarketsWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await listMarkets();
    } catch (error) {
      if (error instanceof TimeoutError && i < maxRetries - 1) {
        console.log(`Timeout, retrying... (${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        continue;
      }
      throw error;
    }
  }
}
```

#### Module Resolution Errors

**Problem:** `Cannot find module` or `ERR_MODULE_NOT_FOUND`

**Solution 1: Configure your project for ESM**

Ensure your `package.json` includes:

```json
{
  "type": "module"
}
```

**Solution 2: Use .mjs file extensions**

Rename your JavaScript files from `.js` to `.mjs`:

```bash
mv index.js index.mjs
```

**Solution 3: Use TypeScript with proper configuration**

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "module": "ES2020",
    "moduleResolution": "node",
    "esModuleInterop": true
  }
}
```

**Solution 4: Check your import statements**

Use ESM import syntax:

```typescript
// ✓ Correct
import { configure, listMarkets } from 'limitless-exchange-sdk';

// ✗ Incorrect (CommonJS)
const { configure, listMarkets } = require('limitless-exchange-sdk');
```

#### Validation Errors

**Problem:** `ValidationError: Invalid outcome` or `ValidationError: Amount must be positive`

**Solutions:**

**1. Outcome validation:**

```typescript
// ✓ Valid outcomes (case-insensitive)
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: 10 });
await submitBet({ marketId: 'market-123', outcome: 'yes', amount: 10 });
await submitBet({ marketId: 'market-123', outcome: 'NO', amount: 10 });

// ✗ Invalid outcomes
await submitBet({ marketId: 'market-123', outcome: 'MAYBE', amount: 10 }); // Error
await submitBet({ marketId: 'market-123', outcome: 'TRUE', amount: 10 });  // Error
```

**2. Amount validation:**

```typescript
// ✓ Valid amounts
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: 10 });
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: 0.5 });
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: 1000.99 });

// ✗ Invalid amounts
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: 0 });     // Error
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: -10 });   // Error
await submitBet({ marketId: 'market-123', outcome: 'YES', amount: 'ten' }); // Error
```

#### TypeScript Type Errors

**Problem:** TypeScript compilation errors or type mismatches

**Solution 1: Ensure TypeScript declaration files are installed**

```bash
npm install --save-dev @types/node
```

**Solution 2: Import types explicitly**

```typescript
import type { Market, BetParams, UserStats } from 'limitless-exchange-sdk';

const bet: BetParams = {
  marketId: 'market-123',
  outcome: 'YES',
  amount: 10
};
```

**Solution 3: Check your tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "node"
  }
}
```

#### CLI Not Found Error

**Problem:** `command not found: limitless-ex` after installation

**Solution 1: Install globally**

```bash
npm install -g limitless-exchange-sdk
```

**Solution 2: Use npx**

```bash
npx limitless-exchange-sdk markets
```

**Solution 3: Check npm global bin path**

```bash
# Check where npm installs global packages
npm config get prefix

# Add to PATH if needed (Linux/macOS)
export PATH="$PATH:$(npm config get prefix)/bin"

# Add to PATH if needed (Windows)
set PATH=%PATH%;%APPDATA%\npm
```

**Solution 4: Use package.json scripts**

```json
{
  "scripts": {
    "markets": "limitless-ex markets",
    "bet": "limitless-ex bet"
  }
}
```

Then run:

```bash
npm run markets
```

#### Network Errors

**Problem:** `Network error: Unable to connect` or `ECONNREFUSED`

**Solutions:**

**1. Check internet connection:**

```bash
# Test connectivity
ping 8.8.8.8

# Test DNS
nslookup api.limitless.exchange
```

**2. Check firewall settings:**

Ensure your firewall allows outbound HTTPS connections to `api.limitless.exchange`.

**3. Check proxy settings:**

If behind a corporate proxy, configure it:

```bash
# Set proxy environment variables
export HTTP_PROXY=http://proxy.company.com:8080
export HTTPS_PROXY=http://proxy.company.com:8080
```

**4. Verify API URL:**

```typescript
import { configure, getConfig } from 'limitless-exchange-sdk';

configure({
  baseURL: 'https://api.limitless.exchange'
});

// Verify configuration
const config = getConfig();
console.log('Configured URL:', config.baseURL);
```

#### Rate Limiting Issues

**Problem:** `APIError: 429 Too Many Requests`

**Solutions:**

**1. Implement exponential backoff:**

```typescript
async function fetchWithBackoff(fn, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof APIError && error.statusCode === 429) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Rate limited. Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

// Usage
const markets = await fetchWithBackoff(() => listMarkets());
```

**2. Add delays between requests:**

```typescript
async function fetchMarketsSequentially(marketIds) {
  const results = [];
  for (const id of marketIds) {
    results.push(await getMarketDetails(id));
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
  }
  return results;
}
```

**3. Batch requests when possible:**

```typescript
// Instead of multiple individual requests
const markets = await listMarkets({ limit: 100 }); // Get many at once
```

### Getting Help

If you're still experiencing issues:

1. **Check the API documentation:** Visit `https://api.limitless.exchange` for the latest API information
2. **Search existing issues:** Check the SDK repository for similar problems
3. **Enable debug logging:** Add console logs to see request/response details
4. **Create a minimal reproduction:** Isolate the problem in a small test case
5. **Open an issue:** Include error messages, code samples, and SDK version

**When opening an issue, include:**
- SDK version (`npm list limitless-exchange-sdk`)
- Node.js version (`node --version`)
- Operating system
- Complete error message
- Minimal code to reproduce the issue
- What you've already tried

## Contributing

Contributions are welcome! This SDK is community-driven, and your help in keeping it up-to-date with the Limitless Exchange API is invaluable.

### How to Contribute

#### Reporting Bugs

If you find a bug in the SDK:

1. **Search existing issues** to avoid duplicates
2. **Open a new issue** with a descriptive title
3. **Include the following information:**
   - SDK version (`npm list limitless-exchange-sdk`)
   - Node.js version (`node --version`)
   - Operating system
   - Complete error message and stack trace
   - Minimal code to reproduce the issue
   - Expected vs. actual behavior

**Example bug report:**

```markdown
**SDK Version:** 1.0.0
**Node.js Version:** 18.17.0
**OS:** macOS 13.4

**Description:**
The `listMarkets` function throws a 404 error when called.

**Code to reproduce:**
```typescript
import { configure, listMarkets } from 'limitless-exchange-sdk';

configure({ baseURL: 'https://api.limitless.exchange' });
const markets = await listMarkets();
```

**Error:**
```
APIError: 404 Not Found
```

**Expected:** Should return an array of markets
**Actual:** Throws 404 error
```

#### Reporting API Changes

The Limitless Exchange API is evolving, and endpoints may change. If you discover that an endpoint has changed, please report it immediately to help the community.

**Steps to report an API change:**

1. **Open an issue** with the title format: `API Change: [endpoint name]`
2. **Include the following details:**
   - **Endpoint that changed:** e.g., `listMarkets`
   - **Old endpoint path:** e.g., `/v1/markets`
   - **New endpoint path:** e.g., `/v2/markets/active`
   - **Date discovered:** When you first noticed the change
   - **Error message:** Any error you received
   - **API documentation link:** Link to the updated API docs if available
   - **Workaround:** How you fixed it (if applicable)

**Example API change report:**

```markdown
**Title:** API Change: listMarkets endpoint

**Endpoint:** listMarkets
**Old Path:** `/v1/markets`
**New Path:** `/v2/markets/active`
**Date Discovered:** 2024-01-15
**Error Message:** `APIError: 404 Not Found - /v1/markets`

**API Documentation:** https://api.limitless.exchange (shows new v2 endpoints)

**Workaround:**
```typescript
configure({
  baseURL: 'https://api.limitless.exchange',
  endpoints: {
    listMarkets: '/v2/markets/active'
  }
});
```

**Additional Notes:**
The API now requires a status filter in the path instead of query parameters.
```

#### Submitting Pull Requests

If you want to contribute code:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Make your changes:**
   - Write clean, readable code
   - Follow existing code style and conventions
   - Add TypeScript types for all new code
   - Update documentation if needed
4. **Add tests:**
   - Write unit tests for new functionality
   - Ensure all existing tests still pass
   - Aim for high test coverage
5. **Update the README:**
   - Document new features or changes
   - Add usage examples
   - Update the "Known Unknowns" section if applicable
6. **Commit your changes:**
   - Use clear, descriptive commit messages
   - Follow conventional commit format: `feat:`, `fix:`, `docs:`, etc.
7. **Push to your fork:** `git push origin feature/your-feature-name`
8. **Open a pull request:**
   - Describe what your PR does
   - Reference any related issues
   - Explain why the change is needed

**Pull request checklist:**
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented if unavoidable)
- [ ] Commit messages are clear and descriptive

#### Updating Endpoint Configurations

If you discover new or updated endpoints:

1. **Update `src/config.ts`:**
   ```typescript
   export const DEFAULT_ENDPOINTS: EndpointConfig = {
     listMarkets: '/v2/markets/active', // Updated
     getMarketDetails: '/v2/markets/:id',
     // ... other endpoints
   };
   ```

2. **Update TypeScript types in `src/types.ts`** if the response structure changed

3. **Update tests** to reflect the new endpoint paths

4. **Update README.md:**
   - Update usage examples
   - Update the "Known Unknowns" section
   - Add migration notes if it's a breaking change

5. **Submit a pull request** with a clear description of the changes

#### Adding New Features

If you want to add new functionality:

1. **Open an issue first** to discuss the feature
2. **Wait for feedback** from maintainers
3. **Implement the feature** following the project structure:
   - Add new functions to appropriate modules (`markets.ts`, `bets.ts`, etc.)
   - Add TypeScript interfaces to `types.ts`
   - Add custom errors to `errors.ts` if needed
   - Export new functions from `index.ts`
4. **Write comprehensive tests**
5. **Document the feature** in the README with examples
6. **Submit a pull request**

#### Improving Documentation

Documentation improvements are always welcome:

- Fix typos or unclear explanations
- Add more examples
- Improve troubleshooting guides
- Add diagrams or visual aids
- Translate documentation (if applicable)

**To improve documentation:**
1. Edit the relevant `.md` files
2. Ensure examples are accurate and tested
3. Submit a pull request with your changes

### Development Setup

To set up the project for development:

```bash
# Clone the repository
git clone https://github.com/your-username/limitless-exchange-sdk.git
cd limitless-exchange-sdk

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Build the project
npm run build

# Run the CLI locally
npm link
limitless-ex markets
```

### Code Style Guidelines

- Use TypeScript for all code
- Follow ESM module syntax
- Use async/await for asynchronous operations
- Add JSDoc comments for public functions
- Use descriptive variable and function names
- Keep functions small and focused
- Handle errors appropriately
- Write tests for all new code

### Testing Guidelines

- Use Jest for testing
- Mock HTTP requests with `axios-mock-adapter`
- Test both success and error scenarios
- Aim for high test coverage
- Write clear test descriptions
- Keep tests isolated and independent

**Example test:**

```typescript
describe('listMarkets', () => {
  it('should return array of markets on success', async () => {
    // Arrange
    mock.onGet('/v1/markets').reply(200, [
      { id: 'market-1', title: 'Test Market', status: 'active' }
    ]);

    // Act
    const markets = await listMarkets();

    // Assert
    expect(markets).toHaveLength(1);
    expect(markets[0].id).toBe('market-1');
  });
});
```

### Community Guidelines

- Be respectful and constructive
- Help others in issues and discussions
- Share your knowledge and experience
- Report issues you encounter
- Suggest improvements
- Review pull requests

### Staying Updated

To stay informed about SDK updates and API changes:

1. **Watch the repository** for notifications
2. **Check the API documentation** regularly at `https://api.limitless.exchange`
3. **Join community discussions** in issues and pull requests
4. **Subscribe to release notifications**

### Recognition

Contributors will be recognized in:
- The project README
- Release notes
- GitHub contributors page

Thank you for helping improve the Limitless Exchange SDK!

## License

MIT

## Disclaimer

This SDK is not officially affiliated with or endorsed by Limitless Exchange. It is a community-built tool based on reverse-engineered API endpoints. The authors are not responsible for any issues arising from the use of this SDK, including but not limited to financial losses, API changes, or service disruptions.

