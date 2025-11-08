/**
 * Basic SDK Usage Example
 * 
 * This example demonstrates the basic usage of the Limitless Exchange SDK
 * including configuration, listing markets, getting market details, and
 * retrieving user statistics.
 */

import { configure, listMarkets, getMarketDetails, getUserStats } from 'limitless-exchange-sdk';

// Configure the SDK with your API URL
configure({
  baseURL: 'https://api.limitless.exchange',
  apiKey: process.env.LIMITLESS_API_KEY // Optional: API key from environment variable
});

async function main() {
  try {
    console.log('=== Limitless Exchange SDK - Basic Usage Example ===\n');

    // 1. List all active markets
    console.log('1. Fetching active markets...');
    const markets = await listMarkets();
    console.log(`Found ${markets.length} markets`);
    
    if (markets.length > 0) {
      const firstMarket = markets[0];
      console.log(`\nFirst market: ${firstMarket.title}`);
      console.log(`  ID: ${firstMarket.id}`);
      console.log(`  Status: ${firstMarket.status}`);
      console.log(`  Volume: ${firstMarket.volumeFormatted}`);
      console.log(`  Expires: ${firstMarket.expirationDate}`);
    }

    // 2. Get details for a specific market
    if (markets.length > 0) {
      console.log('\n2. Fetching market details...');
      const marketId = markets[0].id.toString();
      const marketDetails = await getMarketDetails(marketId);
      console.log(`Market: ${marketDetails.title}`);
      console.log(`Description: ${marketDetails.description}`);
      
      if (marketDetails.outcomes && marketDetails.outcomes.length > 0) {
        console.log('Outcomes:');
        marketDetails.outcomes.forEach(outcome => {
          console.log(`  - ${outcome.name}: ${(outcome.probability * 100).toFixed(2)}%`);
        });
      }
    }

    // 3. Get user statistics (example with a placeholder address)
    // Note: Replace with a real Ethereum address to get actual data
    console.log('\n3. Getting user statistics...');
    console.log('(Skipped - requires a valid Ethereum address)');
    
    // Uncomment and replace with a real address to test:
    // const userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
    // const userStats = await getUserStats(userAddress);
    // console.log(`User: ${userStats.address}`);
    // console.log(`Total Bets: ${userStats.totalBets}`);
    // console.log(`Win Rate: ${(userStats.winRate * 100).toFixed(2)}%`);

    console.log('\n=== Example completed successfully! ===');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
