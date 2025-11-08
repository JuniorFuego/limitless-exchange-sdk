#!/usr/bin/env node

import { Command } from 'commander';
import dotenv from 'dotenv';
import { configure } from './client.js';
import { listMarkets, getMarketDetails } from './markets.js';
import { submitBet } from './bets.js';
import { getUserStats } from './users.js';
import type { SDKConfig } from './types.js';

// Load environment variables from .env file
dotenv.config();

// Create Commander program
const program = new Command();

// Set program metadata
program
  .name('limitless-ex')
  .description('CLI tool for interacting with Limitless Exchange prediction markets')
  .version('1.0.0');

// Add global options
program
  .option('--api-url <url>', 'Override API base URL')
  .option('--json', 'Output results in JSON format');

// Load configuration from environment variables
function loadConfiguration(options: any): void {
  const config: SDKConfig = {
    baseURL: options.apiUrl || process.env.LIMITLESS_API_URL || '',
    apiKey: process.env.LIMITLESS_API_KEY,
  };

  if (!config.baseURL) {
    console.error('Error: API URL is required. Set LIMITLESS_API_URL environment variable or use --api-url flag.');
    process.exit(1);
  }

  try {
    configure(config);
  } catch (error) {
    console.error('Configuration error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Markets command - list all markets
program
  .command('markets')
  .description('List all available prediction markets')
  .action(async (_options, command) => {
    const globalOptions = command.parent?.opts();
    loadConfiguration(globalOptions);

    try {
      const markets = await listMarkets();
      
      if (globalOptions?.json) {
        console.log(JSON.stringify(markets, null, 2));
      } else {
        // Human-readable table format
        console.log('\n📊 Available Markets\n');
        console.log('─'.repeat(100));
        
        if (markets.length === 0) {
          console.log('No markets found.');
        } else {
          markets.forEach((market) => {
            const statusColor = market.status === 'active' ? '🟢' : market.status === 'closed' ? '🔴' : '⚪';
            console.log(`${statusColor} ${market.id}`);
            console.log(`   Title: ${market.title}`);
            console.log(`   Status: ${market.status}`);
            console.log(`   Volume: ${market.volumeFormatted}`);
            console.log(`   Expires: ${market.expirationDate}`);
            console.log('─'.repeat(100));
          });
        }
      }
      
      process.exit(0);
    } catch (error) {
      console.error('Error fetching markets:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

// Market command - get details for a specific market
program
  .command('market <id>')
  .description('Get detailed information about a specific market')
  .action(async (id, _options, command) => {
    const globalOptions = command.parent?.opts();
    loadConfiguration(globalOptions);

    try {
      const market = await getMarketDetails(id);
      
      if (globalOptions?.json) {
        console.log(JSON.stringify(market, null, 2));
      } else {
        // Human-readable format
        console.log('\n📈 Market Details\n');
        console.log('─'.repeat(100));
        console.log(`ID: ${market.id}`);
        console.log(`Title: ${market.title}`);
        console.log(`Description: ${market.description}`);
        console.log(`Status: ${market.status}`);
        console.log(`Total Volume: ${market.volumeFormatted}`);
        console.log(`Participants: ${market.participants || 'N/A'}`);
        console.log(`Created: ${market.createdAt}`);
        console.log(`Expires: ${market.expirationDate}`);
        
        if (market.outcomes && market.outcomes.length > 0) {
          console.log('\nOutcomes:');
          market.outcomes.forEach((outcome) => {
            console.log(`  - ${outcome.name}: ${(outcome.probability * 100).toFixed(2)}%`);
          });
        }
        
        if (market.currentOdds && Object.keys(market.currentOdds).length > 0) {
          console.log('\nCurrent Odds:');
          Object.entries(market.currentOdds).forEach(([key, value]) => {
            console.log(`  - ${key}: ${value}`);
          });
        }
        
        console.log('─'.repeat(100));
      }
      
      process.exit(0);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        console.error(`Error: Market not found with ID "${id}"`);
      } else {
        console.error('Error fetching market details:', error instanceof Error ? error.message : String(error));
      }
      process.exit(1);
    }
  });

// Bet command - place a bet on a market
program
  .command('bet')
  .description('Place a bet on a prediction market')
  .requiredOption('--market <id>', 'Market ID to bet on')
  .requiredOption('--outcome <outcome>', 'Outcome to bet on (YES or NO)')
  .requiredOption('--amount <amount>', 'Amount to bet')
  .action(async (options, command) => {
    const globalOptions = command.parent?.opts();
    loadConfiguration(globalOptions);

    // Validate required options
    if (!options.market || !options.outcome || !options.amount) {
      console.error('Error: All options (--market, --outcome, --amount) are required.');
      process.exit(1);
    }

    // Parse amount
    const amount = parseFloat(options.amount);
    if (isNaN(amount)) {
      console.error('Error: Amount must be a valid number.');
      process.exit(1);
    }

    try {
      const result = await submitBet({
        marketId: options.market,
        outcome: options.outcome.toUpperCase(),
        amount: amount,
      });
      
      if (globalOptions?.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log('\n✅ Bet placed successfully!\n');
        console.log('─'.repeat(100));
        console.log(`Bet ID: ${result.betId}`);
        if (result.transactionHash) {
          console.log(`Transaction Hash: ${result.transactionHash}`);
        }
        console.log(`Status: ${result.status}`);
        console.log('─'.repeat(100));
      }
      
      process.exit(0);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('outcome')) {
          console.error('Error: Outcome must be YES or NO.');
        } else if (error.message.includes('amount')) {
          console.error('Error: Amount must be a positive number.');
        } else {
          console.error('Error placing bet:', error.message);
        }
      } else {
        console.error('Error placing bet:', String(error));
      }
      process.exit(1);
    }
  });

// User command - get user statistics
program
  .command('user <address>')
  .description('Get statistics for a user by wallet address')
  .action(async (address, _options, command) => {
    const globalOptions = command.parent?.opts();
    loadConfiguration(globalOptions);

    try {
      const stats = await getUserStats(address);
      
      if (globalOptions?.json) {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        console.log('\n👤 User Statistics\n');
        console.log('─'.repeat(100));
        console.log(`Address: ${stats.address}`);
        console.log(`Total Bets: ${stats.totalBets}`);
        console.log(`Total Volume: ${stats.totalVolume}`);
        console.log(`Win Rate: ${(stats.winRate * 100).toFixed(2)}%`);
        if (stats.rank !== undefined) {
          console.log(`Rank: #${stats.rank}`);
        }
        console.log('─'.repeat(100));
      }
      
      process.exit(0);
    } catch (error) {
      if (error instanceof Error && error.message.toLowerCase().includes('address')) {
        console.error('Error: Invalid Ethereum address format. Address must start with 0x followed by 40 hexadecimal characters.');
      } else {
        console.error('Error fetching user stats:', error instanceof Error ? error.message : String(error));
      }
      process.exit(1);
    }
  });

// Parse the command line arguments
program.parse(process.argv);
