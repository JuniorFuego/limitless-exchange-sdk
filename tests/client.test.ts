import MockAdapter from 'axios-mock-adapter';
import { configure, getConfig, getAxiosInstance } from '../src/client.js';
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
});
