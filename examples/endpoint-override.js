/**
 * Endpoint Override Example
 * 
 * This example demonstrates how to override specific API endpoints
 * when the API structure changes or when you need to use custom endpoints.
 * This is particularly useful for adapting to API changes without modifying
 * the SDK source code.
 */

import { configure, listMarkets, getMarketDetails } from 'limitless-exchange-sdk';

// Configure the SDK with custom endpoint overrides
configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: process.env.LIMITLESS_API_KEY,
  
  // Override specific endpoints while keeping others at their defaults
  endpoints: {
    // Example: If the markets endpoint changes from /markets/active to /v2/markets
    // listMarkets: '/v2/markets',
    
    // Example: If the market details endpoint changes structure
    // getMarketDetails: '/v2/markets/:id/details',
    
    // You can override any endpoint defined in the SDK:
    // - listMarkets
    // - getMarketDetails
    // - submitBet
    // - getBetHistory
    // - getUserStats
    // - getLeaderboard
  },
  
  // Optional: Adjust timeout (in milliseconds)
  timeout: 30000 // 30 seconds
});

async function main() {
  try {
    console.log('=== Limitless Exchange SDK - Endpoint Override Example ===\n');

    console.log('Configuration:');
    console.log('  Base URL: https://api.limitless.exchange');
    console.log('  Custom endpoints: Using defaults (no overrides in this example)');
    console.log('  Timeout: 30000ms\n');

    // Test the configuration by fetching markets
    console.log('Testing configuration by fetching markets...');
    const markets = await listMarkets();
    console.log(`✓ Successfully fetched ${markets.length} markets`);

    if (markets.length > 0) {
      console.log('\nTesting market details endpoint...');
      const marketId = markets[0].id.toString();
      const details = await getMarketDetails(marketId);
      console.log(`✓ Successfully fetched details for: ${details.title}`);
    }

    console.log('\n=== Endpoint override example completed! ===');
    console.log('\nTo override endpoints, uncomment the endpoint configurations above');
    console.log('and adjust them according to your API requirements.');
  } catch (error) {
    console.error('Error:', error.message);
    console.error('\nIf you see configuration errors, check that:');
    console.error('1. The base URL is correct');
    console.error('2. Custom endpoint paths are valid');
    console.error('3. The API is accessible from your network');
    process.exit(1);
  }
}

main();
