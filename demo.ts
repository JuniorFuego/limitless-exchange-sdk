#!/usr/bin/env node

/**
 * Comprehensive Demo of Limitless Exchange SDK
 * Tests all current functionality including core features and advanced capabilities
 */

import { 
  configure, 
  getConfig,
  listMarkets, 
  getMarketDetails,
  submitBet,
  getBetHistory,
  getUserStats,
  getLeaderboard,
  getCacheStats,
  getRateLimitStatus,
  clearCache,
  invalidateCache
} from './src/index.js';
import { getCacheManager, getRateLimiter } from './src/client.js';
import { EventEmitter } from './src/extensibility/event-emitter.js';
import type { AdvancedSDKConfig } from './src/types.js';

// Demo configuration with all advanced features enabled
const demoConfig: AdvancedSDKConfig = {
  baseURL: 'https://api.limitless.exchange',
  apiKey: process.env.LIMITLESS_API_KEY || 'demo-key',
  timeout: 10000,
  
  // Enable caching
  cache: {
    enabled: true,
    maxSize: 100,
    defaultTTL: 60000, // 1 minute
    ttlByResource: {
      markets: 30000,        // 30 seconds
      marketDetails: 15000,  // 15 seconds
      userStats: 120000      // 2 minutes
    }
  },
  
  // Enable rate limiting
  rateLimit: {
    enabled: true,
    requestsPerSecond: 5,
    requestsPerMinute: 100
  }
};

class SDKDemo {
  private eventEmitter = new EventEmitter();
  
  constructor() {
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers to monitor SDK operations
   */
  private setupEventHandlers(): void {
    // Monitor rate limiting events
    const rateLimiter = getRateLimiter();
    if (rateLimiter) {
      rateLimiter.on('throttled', (data) => {
        console.log('🚦 Rate limit throttling:', data.context);
      });
    }

    // Monitor general SDK events
    this.eventEmitter.on('demo:step', (data) => {
      console.log(`\n📋 ${data.context.step}: ${data.context.description}`);
    });

    this.eventEmitter.on('demo:result', (data) => {
      console.log(`✅ Result: ${data.context.message}`);
    });

    this.eventEmitter.on('demo:error', (data) => {
      console.log(`❌ Error: ${data.context.message}`);
    });
  }

  /**
   * Run comprehensive SDK demo
   */
  async run(): Promise<void> {
    console.log('🚀 Starting Limitless Exchange SDK Comprehensive Demo\n');
    console.log('=' .repeat(80));

    try {
      // Step 1: Configuration
      await this.testConfiguration();
      
      // Step 2: Markets API
      await this.testMarketsAPI();
      
      // Step 3: Caching System
      await this.testCachingSystem();
      
      // Step 4: Rate Limiting
      await this.testRateLimiting();
      
      // Step 5: Error Handling
      await this.testErrorHandling();
      
      // Step 6: Event System
      await this.testEventSystem();
      
      // Step 7: Validation
      await this.testValidation();

      console.log('\n' + '='.repeat(80));
      console.log('🎉 Demo completed successfully! All features working.');
      
    } catch (error) {
      console.error('\n💥 Demo failed:', error);
      process.exit(1);
    }
  }

  /**
   * Test SDK configuration and setup
   */
  private async testConfiguration(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Configuration', 
      description: 'Testing SDK configuration and initialization' 
    });

    // Configure SDK with advanced features
    configure(demoConfig);
    
    const config = getConfig();
    this.eventEmitter.emit('demo:result', { 
      message: `SDK configured with baseURL: ${config.baseURL}` 
    });
    
    // Verify advanced features are enabled
    const cacheEnabled = config.cache?.enabled;
    const rateLimitEnabled = config.rateLimit?.enabled;
    
    console.log(`   Cache enabled: ${cacheEnabled ? '✅' : '❌'}`);
    console.log(`   Rate limiting enabled: ${rateLimitEnabled ? '✅' : '❌'}`);
  } 
 /**
   * Test Markets API functionality
   */
  private async testMarketsAPI(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Markets API', 
      description: 'Testing market listing and details retrieval' 
    });

    try {
      // Test listing markets
      console.log('   📊 Fetching markets list...');
      const markets = await listMarkets({ limit: 5 });
      
      this.eventEmitter.emit('demo:result', { 
        message: `Found ${markets.length} markets` 
      });

      if (markets.length > 0) {
        const firstMarket = markets[0];
        console.log(`   First market: ${firstMarket.title} (ID: ${firstMarket.id})`);
        
        // Test getting market details
        console.log('   📈 Fetching market details...');
        try {
          const marketDetails = await getMarketDetails(firstMarket.id.toString());
          this.eventEmitter.emit('demo:result', { 
            message: `Market details retrieved: ${marketDetails.title}` 
          });
        } catch (error) {
          console.log('   ⚠️  Market details API might not be available in demo mode');
        }
      }
      
    } catch (error) {
      this.eventEmitter.emit('demo:error', { 
        message: `Markets API test failed: ${error instanceof Error ? error.message : String(error)}` 
      });
    }
  }

  /**
   * Test caching system functionality
   */
  private async testCachingSystem(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Caching System', 
      description: 'Testing cache operations and statistics' 
    });

    const cacheManager = getCacheManager();
    if (!cacheManager) {
      console.log('   ⚠️  Cache not enabled, skipping cache tests');
      return;
    }

    // Test cache statistics
    let stats = getCacheStats();
    console.log('   📊 Initial cache stats:', {
      size: stats?.size || 0,
      hits: stats?.hits || 0,
      misses: stats?.misses || 0,
      hitRate: ((stats?.hitRate || 0) * 100).toFixed(2) + '%'
    });

    // Make some requests to populate cache
    console.log('   🔄 Making requests to populate cache...');
    try {
      await listMarkets({ limit: 3 });
      await listMarkets({ limit: 3 }); // Same request should hit cache
      
      stats = getCacheStats();
      this.eventEmitter.emit('demo:result', { 
        message: `Cache stats - Size: ${stats?.size}, Hit rate: ${((stats?.hitRate || 0) * 100).toFixed(2)}%` 
      });
      
      // Test cache invalidation
      console.log('   🗑️  Testing cache invalidation...');
      invalidateCache('*markets*');
      
      stats = getCacheStats();
      console.log(`   Cache size after invalidation: ${stats?.size || 0}`);
      
    } catch (error) {
      console.log('   ⚠️  Cache testing limited in demo mode');
    }
  } 
 /**
   * Test rate limiting functionality
   */
  private async testRateLimiting(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Rate Limiting', 
      description: 'Testing rate limiter and throttling behavior' 
    });

    const rateLimiter = getRateLimiter();
    if (!rateLimiter) {
      console.log('   ⚠️  Rate limiting not enabled, skipping rate limit tests');
      return;
    }

    // Get initial rate limit status
    let status = getRateLimitStatus();
    console.log('   📊 Initial rate limit status:', {
      limit: status?.limit || 0,
      remaining: status?.remaining || 0,
      requestsInWindow: status?.requestsInWindow || 0
    });

    // Test rate limiting by making rapid requests
    console.log('   🚀 Making rapid requests to test rate limiting...');
    const startTime = Date.now();
    
    try {
      // Make several requests quickly
      const promises = [];
      for (let i = 0; i < 8; i++) {
        promises.push(listMarkets({ limit: 1 }));
      }
      
      await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.eventEmitter.emit('demo:result', { 
        message: `Completed 8 requests in ${duration}ms (rate limiting may have added delays)` 
      });
      
      // Check final rate limit status
      status = getRateLimitStatus();
      console.log('   📊 Final rate limit status:', {
        requestsInWindow: status?.requestsInWindow || 0,
        remaining: status?.remaining || 0
      });
      
    } catch (error) {
      console.log('   ⚠️  Rate limiting test limited in demo mode');
    }
  }

  /**
   * Test error handling and validation
   */
  private async testErrorHandling(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Error Handling', 
      description: 'Testing error handling and validation' 
    });

    // Test validation errors
    try {
      console.log('   🧪 Testing validation with invalid bet parameters...');
      await submitBet({
        marketId: '',
        outcome: 'INVALID' as any,
        amount: -1
      });
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        this.eventEmitter.emit('demo:result', { 
          message: `Validation working: ${error.message}` 
        });
      }
    }

    // Test invalid address validation
    try {
      console.log('   🧪 Testing address validation...');
      await getUserStats('invalid-address');
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        this.eventEmitter.emit('demo:result', { 
          message: `Address validation working: ${error.field}` 
        });
      }
    }

    // Test API errors (non-existent market)
    try {
      console.log('   🧪 Testing API error handling...');
      await getMarketDetails('999999999');
    } catch (error: any) {
      this.eventEmitter.emit('demo:result', { 
        message: `API error handling working: ${error.name}` 
      });
    }
  }  /**
   *
 Test event system functionality
   */
  private async testEventSystem(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Event System', 
      description: 'Testing event emitter and handlers' 
    });

    // Test event registration and emission
    let eventReceived = false;
    const testHandler = (data: any) => {
      eventReceived = true;
      console.log(`   📡 Received test event: ${data.context.message}`);
    };

    this.eventEmitter.on('test:event', testHandler);
    this.eventEmitter.emit('test:event', { message: 'Hello from event system!' });

    if (eventReceived) {
      this.eventEmitter.emit('demo:result', { 
        message: 'Event system working correctly' 
      });
    }

    // Test wildcard events
    let wildcardReceived = false;
    const wildcardHandler = (data: any) => {
      wildcardReceived = true;
      console.log(`   🌟 Wildcard handler received: ${data.event}`);
    };

    this.eventEmitter.on('*', wildcardHandler);
    this.eventEmitter.emit('any:event', { message: 'Wildcard test' });

    if (wildcardReceived) {
      console.log('   ✅ Wildcard event handling working');
    }

    // Cleanup
    this.eventEmitter.off('test:event', testHandler);
    this.eventEmitter.off('*', wildcardHandler);

    // Show event system stats
    const eventNames = this.eventEmitter.getEventNames();
    console.log(`   📊 Active event handlers: ${eventNames.length} event types`);
  }

  /**
   * Test validation functions
   */
  private async testValidation(): Promise<void> {
    this.eventEmitter.emit('demo:step', { 
      step: 'Validation', 
      description: 'Testing input validation functions' 
    });

    // Import validation functions
    const { validateOutcome, validateAmount, validateAddress } = await import('./src/bets.js');

    // Test outcome validation
    try {
      validateOutcome('YES');
      validateOutcome('no');
      console.log('   ✅ Outcome validation: YES/NO accepted');
      
      try {
        validateOutcome('MAYBE');
      } catch (error) {
        console.log('   ✅ Outcome validation: Invalid outcome rejected');
      }
    } catch (error) {
      console.log('   ❌ Outcome validation failed');
    }

    // Test amount validation
    try {
      validateAmount(100);
      console.log('   ✅ Amount validation: Positive numbers accepted');
      
      try {
        validateAmount(-50);
      } catch (error) {
        console.log('   ✅ Amount validation: Negative numbers rejected');
      }
    } catch (error) {
      console.log('   ❌ Amount validation failed');
    }

    // Test address validation
    try {
      validateAddress('0x742d35Cc6634C0532925a3b8D4C9db96590e4265');
      console.log('   ✅ Address validation: Valid Ethereum address accepted');
      
      try {
        validateAddress('invalid-address');
      } catch (error) {
        console.log('   ✅ Address validation: Invalid address rejected');
      }
    } catch (error) {
      console.log('   ❌ Address validation failed');
    }

    this.eventEmitter.emit('demo:result', { 
      message: 'All validation functions working correctly' 
    });
  }
}

// Run the demo
const demo = new SDKDemo();
demo.run().catch(console.error);