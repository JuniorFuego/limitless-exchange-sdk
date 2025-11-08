import MockAdapter from 'axios-mock-adapter';
import { configure, getAxiosInstance } from '../src/client.js';
import { listMarkets, getMarketDetails } from '../src/markets.js';
import { APIError } from '../src/errors.js';

describe('Markets Module', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    // Configure SDK before each test
    configure({
      baseURL: 'https://api.limitless.exchange/api-v1',
      apiKey: 'test-api-key'
    });
    
    // Create mock adapter
    mock = new MockAdapter(getAxiosInstance());
  });

  afterEach(() => {
    // Reset mock after each test
    mock.reset();
  });

  describe('listMarkets', () => {
    it('should return array of markets on success', async () => {
      const mockMarkets: any[] = [
        {
          id: 1,
          title: 'Will Bitcoin reach $100k in 2024?',
          description: 'Prediction market for Bitcoin price',
          createdAt: '2024-01-01T00:00:00Z',
          expirationDate: '2024-12-31T23:59:59Z',
          expirationTimestamp: 1735689599,
          status: 'active',
          volume: '50000',
          volumeFormatted: '$50,000',
          slug: 'bitcoin-100k-2024',
          conditionId: 'cond-1',
          collateralToken: {
            address: '0x123',
            decimals: 18,
            symbol: 'USDC'
          },
          creator: {
            name: 'Test Creator',
            imageURI: 'https://example.com/image.png',
            link: 'https://example.com'
          },
          prices: [0.65, 0.35],
          tokens: {
            yes: '0xyes',
            no: '0xno'
          },
          categories: ['crypto'],
          tags: ['bitcoin'],
          tradeType: 'binary',
          marketType: 'prediction',
          expired: false,
          proxyTitle: null,
          logo: null,
          winningOutcomeIndex: null,
          negRiskRequestId: null
        },
        {
          id: 2,
          title: 'Will Ethereum merge succeed?',
          description: 'Prediction market for Ethereum merge',
          createdAt: '2024-01-15T00:00:00Z',
          expirationDate: '2024-06-30T23:59:59Z',
          expirationTimestamp: 1719792000,
          status: 'closed',
          volume: '30000',
          volumeFormatted: '$30,000',
          slug: 'ethereum-merge',
          conditionId: 'cond-2',
          collateralToken: {
            address: '0x456',
            decimals: 18,
            symbol: 'USDC'
          },
          creator: {
            name: 'Test Creator',
            imageURI: 'https://example.com/image.png',
            link: 'https://example.com'
          },
          prices: [0.80, 0.20],
          tokens: {
            yes: '0xyes2',
            no: '0xno2'
          },
          categories: ['crypto'],
          tags: ['ethereum'],
          tradeType: 'binary',
          marketType: 'prediction',
          expired: true,
          proxyTitle: null,
          logo: null,
          winningOutcomeIndex: 0,
          negRiskRequestId: null
        }
      ];

      mock.onGet('/markets/active').reply(200, { data: mockMarkets, totalMarketsCount: 2 });

      const result = await listMarkets();

      expect(result).toEqual(mockMarkets);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].status).toBe('active');
    });

    it('should pass filters as query parameters', async () => {
      const mockMarkets: any[] = [];
      
      mock.onGet('/markets/active').reply(200, mockMarkets);

      await listMarkets({ status: 'active', limit: 10, offset: 0 });

      expect(mock.history.get.length).toBe(1);
    });

    it('should throw APIError on HTTP error', async () => {
      mock.onGet('/markets/active').reply(500, { message: 'Internal server error' });

      await expect(listMarkets()).rejects.toThrow(APIError);
      await expect(listMarkets()).rejects.toThrow('Internal server error');
    });
  });

  describe('getMarketDetails', () => {
    it('should return market details on success', async () => {
      const mockMarketDetails: any = {
        id: 1,
        title: 'Will Bitcoin reach $100k in 2024?',
        description: 'Prediction market for Bitcoin price',
        createdAt: '2024-01-01T00:00:00Z',
        expirationDate: '2024-12-31T23:59:59Z',
        expirationTimestamp: 1735689599,
        status: 'active',
        volume: '50000',
        volumeFormatted: '$50,000',
        slug: 'bitcoin-100k-2024',
        conditionId: 'cond-1',
        collateralToken: {
          address: '0x123',
          decimals: 18,
          symbol: 'USDC'
        },
        creator: {
          name: 'Test Creator',
          imageURI: 'https://example.com/image.png',
          link: 'https://example.com'
        },
        prices: [0.65, 0.35],
        tokens: {
          yes: '0xyes',
          no: '0xno'
        },
        categories: ['crypto'],
        tags: ['bitcoin'],
        tradeType: 'binary',
        marketType: 'prediction',
        expired: false,
        proxyTitle: null,
        logo: null,
        winningOutcomeIndex: null,
        negRiskRequestId: null,
        outcomes: [
          { id: 'outcome-1', name: 'YES', probability: 0.65 },
          { id: 'outcome-2', name: 'NO', probability: 0.35 }
        ],
        currentOdds: { YES: 1.54, NO: 2.86 },
        participants: 150
      };

      mock.onGet('/markets/1').reply(200, mockMarketDetails);

      const result = await getMarketDetails('1');

      expect(result).toEqual(mockMarketDetails);
      expect(result.id).toBe(1);
      expect(result.outcomes).toHaveLength(2);
      expect(result.participants).toBe(150);
    });

    it('should substitute marketId into path parameter', async () => {
      const mockMarketDetails: any = {
        id: 123,
        title: 'Test Market',
        description: 'Test description',
        createdAt: '2024-01-01T00:00:00Z',
        expirationDate: '2024-12-31T23:59:59Z',
        expirationTimestamp: 1735689599,
        status: 'active',
        volume: '1000',
        volumeFormatted: '$1,000',
        slug: 'test-market',
        conditionId: 'cond-123',
        collateralToken: {
          address: '0x789',
          decimals: 18,
          symbol: 'USDC'
        },
        creator: {
          name: 'Test Creator',
          imageURI: 'https://example.com/image.png',
          link: 'https://example.com'
        },
        prices: [0.5, 0.5],
        tokens: {
          yes: '0xyes123',
          no: '0xno123'
        },
        categories: ['test'],
        tags: ['test'],
        tradeType: 'binary',
        marketType: 'prediction',
        expired: false,
        proxyTitle: null,
        logo: null,
        winningOutcomeIndex: null,
        negRiskRequestId: null,
        outcomes: [],
        currentOdds: {},
        participants: 10
      };

      mock.onGet('/markets/123').reply(200, mockMarketDetails);

      await getMarketDetails('123');

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe('/markets/123');
    });

    it('should throw APIError on 404 error', async () => {
      mock.onGet('/markets/nonexistent').reply(404, { message: 'Market not found' });

      await expect(getMarketDetails('nonexistent')).rejects.toThrow(APIError);
      
      try {
        await getMarketDetails('nonexistent');
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(404);
      }
    });
  });
});
