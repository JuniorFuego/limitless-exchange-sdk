import MockAdapter from 'axios-mock-adapter';
import { configure, getConfig, getAxiosInstance, getCacheManager, getCacheStats, clearCache, request } from '../src/client.js';
import { ConfigurationError, TimeoutError, APIError } from '../src/errors.js';

describe('Client Module', () => {
  let mock: MockAdapter;

  afterEach(() => {
    if (mock) {
      mock.reset();
    }
    // Clear environment variable after each test
    delete process.env.LIMITLESS_API_KEY;
  });

  describe('configure', () => {
    it('should configure SDK with valid configuration', () => {
      const config = {
        baseURL: 'https://api.limitless.exchange/api-v1',
        apiKey: 'test-api-key',
        timeout: 5000
      };

      configure(config);

      const storedConfig = getConfig();
      expect(storedConfig.baseURL).toBe('https://api.limitless.exchange/api-v1');
      expect(storedConfig.apiKey).toBe('test-api-key');
      expect(storedConfig.timeout).toBe(5000);
      expect(storedConfig.endpoints).toBeDefined();
    });

    it('should throw ConfigurationError with invalid baseURL', () => {
      const config = {
        baseURL: 'not-a-valid-url',
        apiKey: 'test-api-key'
      };

      expect(() => configure(config)).toThrow(ConfigurationError);
      expect(() => configure(config)).toThrow('baseURL must be a valid URL');
    });

    it('should throw ConfigurationError with missing baseURL', () => {
      const config = {
        baseURL: '',
        apiKey: 'test-api-key'
      };

      expect(() => configure(config)).toThrow(ConfigurationError);
      expect(() => configure(config)).toThrow('baseURL is required');
    });

    it('should merge custom endpoints with defaults', () => {
      const config = {
        baseURL: 'https://api.limitless.exchange/api-v1',
        endpoints: {
          listMarkets: '/v2/markets/list'
        }
      };

      configure(config);

      const storedConfig = getConfig();
      expect(storedConfig.endpoints?.listMarkets).toBe('/v2/markets/list');
      expect(storedConfig.endpoints?.getMarketDetails).toBe('/markets/:id');
    });
  });

  describe('API key injection', () => {
    it('should inject API key from configuration object', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        apiKey: 'config-api-key'
      });

      mock = new MockAdapter(getAxiosInstance());
      mock.onGet('/markets/active').reply(200, []);

      await getAxiosInstance().get('/markets/active');

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].headers?.['Authorization']).toBe('Bearer config-api-key');
    });

    it('should inject API key from environment variable', async () => {
      process.env.LIMITLESS_API_KEY = 'env-api-key';

      configure({
        baseURL: 'https://api.limitless.exchange/api-v1'
      });

      mock = new MockAdapter(getAxiosInstance());
      mock.onGet('/markets/active').reply(200, []);

      await getAxiosInstance().get('/markets/active');

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].headers?.['Authorization']).toBe('Bearer env-api-key');
    });

    it('should prioritize configuration API key over environment variable', async () => {
      process.env.LIMITLESS_API_KEY = 'env-api-key';

      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        apiKey: 'config-api-key'
      });

      mock = new MockAdapter(getAxiosInstance());
      mock.onGet('/v1/markets').reply(200, []);

      await getAxiosInstance().get('/v1/markets');

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].headers?.['Authorization']).toBe('Bearer config-api-key');
    });
  });

  describe('request timeout handling', () => {
    it('should throw TimeoutError on request timeout', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        timeout: 100
      });

      mock = new MockAdapter(getAxiosInstance());
      mock.onGet('/markets/active').timeout();

      await expect(getAxiosInstance().get('/markets/active')).rejects.toThrow(TimeoutError);
      
      try {
        await getAxiosInstance().get('/markets/active');
      } catch (error) {
        expect(error).toBeInstanceOf(TimeoutError);
        expect((error as TimeoutError).code).toBe('TIMEOUT_ERROR');
      }
    });

    it('should use default timeout of 30 seconds when not specified', () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1'
      });

      const storedConfig = getConfig();
      expect(storedConfig.timeout).toBeUndefined();
      
      // The axios instance should have 30000ms timeout
      const instance = getAxiosInstance();
      expect(instance.defaults.timeout).toBe(30000);
    });
  });

  describe('error transformation', () => {
    it('should transform HTTP errors to APIError', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1'
      });

      mock = new MockAdapter(getAxiosInstance());
      mock.onGet('/markets/active').reply(500, { message: 'Internal server error' });

      await expect(getAxiosInstance().get('/markets/active')).rejects.toThrow(APIError);
      
      try {
        await getAxiosInstance().get('/markets/active');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(500);
        expect((error as APIError).code).toBe('API_ERROR');
      }
    });

    it('should handle network errors', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1'
      });

      mock = new MockAdapter(getAxiosInstance());
      mock.onGet('/markets/active').networkError();

      await expect(getAxiosInstance().get('/markets/active')).rejects.toThrow(APIError);
      
      try {
        await getAxiosInstance().get('/markets/active');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).message).toContain('Network Error');
      }
    });
  });

  describe('getConfig', () => {
    it('should return current configuration after configure', () => {
      const config = {
        baseURL: 'https://api.limitless.exchange/api-v1',
        apiKey: 'test-key'
      };

      configure(config);
      const retrieved = getConfig();

      expect(retrieved.baseURL).toBe(config.baseURL);
      expect(retrieved.apiKey).toBe(config.apiKey);
    });
  });

  describe('cache functionality', () => {
    beforeEach(() => {
      clearCache();
    });

    it('should not initialize cache manager when caching is disabled', () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        cache: { enabled: false, maxSize: 100, defaultTTL: 60000 }
      });

      expect(getCacheManager()).toBeNull();
      expect(getCacheStats()).toBeNull();
    });

    it('should initialize cache manager when caching is enabled', () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        cache: { enabled: true, maxSize: 100, defaultTTL: 60000 }
      });

      expect(getCacheManager()).not.toBeNull();
      expect(getCacheStats()).not.toBeNull();
    });

    it('should cache GET requests and return cached data on subsequent calls', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        cache: { enabled: true, maxSize: 100, defaultTTL: 60000 }
      });

      mock = new MockAdapter(getAxiosInstance());
      const mockData = [{ id: 1, title: 'Test Market' }];
      mock.onGet('/markets/active').reply(200, mockData);

      // First request should hit the API
      const result1 = await request('listMarkets');
      expect(result1).toEqual(mockData);
      expect(mock.history.get.length).toBe(1);

      // Second request should return cached data
      const result2 = await request('listMarkets');
      expect(result2).toEqual(mockData);
      expect(mock.history.get.length).toBe(1); // Still only 1 API call

      // Verify cache stats
      const stats = getCacheStats();
      expect(stats?.hits).toBe(1);
      expect(stats?.misses).toBe(1);
      expect(stats?.hitRate).toBe(0.5);
    });

    it('should bypass cache when bypassCache option is true', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        cache: { enabled: true, maxSize: 100, defaultTTL: 60000 }
      });

      mock = new MockAdapter(getAxiosInstance());
      const mockData = [{ id: 1, title: 'Test Market' }];
      mock.onGet('/markets/active').reply(200, mockData);

      // First request
      await request('listMarkets');
      expect(mock.history.get.length).toBe(1);

      // Second request with bypassCache should hit API again
      await request('listMarkets', { bypassCache: true });
      expect(mock.history.get.length).toBe(2);
    });

    it('should not cache non-GET requests', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        cache: { enabled: true, maxSize: 100, defaultTTL: 60000 }
      });

      mock = new MockAdapter(getAxiosInstance());
      const mockData = { betId: '123', status: 'pending' };
      mock.onPost('/orders').reply(200, mockData);

      // POST requests should not be cached
      await request('submitBet', { method: 'POST', data: { marketId: '1', outcome: 'YES', amount: 100 } });
      await request('submitBet', { method: 'POST', data: { marketId: '1', outcome: 'YES', amount: 100 } });

      expect(mock.history.post.length).toBe(2); // Both requests hit the API

      const stats = getCacheStats();
      expect(stats?.hits).toBe(0);
      expect(stats?.misses).toBe(0);
    });

    it('should clear cache when clearCache is called', async () => {
      configure({
        baseURL: 'https://api.limitless.exchange/api-v1',
        cache: { enabled: true, maxSize: 100, defaultTTL: 60000 }
      });

      mock = new MockAdapter(getAxiosInstance());
      const mockData = [{ id: 1, title: 'Test Market' }];
      mock.onGet('/markets/active').reply(200, mockData);

      // Cache a request
      await request('listMarkets');
      let stats = getCacheStats();
      expect(stats?.size).toBe(1);

      // Clear cache
      clearCache();
      stats = getCacheStats();
      expect(stats?.size).toBe(0);
      expect(stats?.hits).toBe(0);
      expect(stats?.misses).toBe(0);
    });
  });
});
