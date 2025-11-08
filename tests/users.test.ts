import MockAdapter from 'axios-mock-adapter';
import { configure, getAxiosInstance } from '../src/client.js';
import { getUserStats, getLeaderboard } from '../src/users.js';
import { ValidationError, APIError } from '../src/errors.js';
import { UserStats, LeaderboardEntry } from '../src/types.js';

describe('Users Module', () => {
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

  describe('getUserStats', () => {
    it('should return user stats with valid address and verify returned data structure', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      const mockUserStats: UserStats = {
        address: validAddress,
        totalBets: 25,
        totalVolume: 5000,
        winRate: 0.68,
        rank: 15
      };

      mock.onGet(`/portfolio/positions`).reply(200, mockUserStats);

      const result = await getUserStats(validAddress);

      expect(result).toEqual(mockUserStats);
      expect(result.address).toBe(validAddress);
      expect(result.totalBets).toBe(25);
      expect(result.totalVolume).toBe(5000);
      expect(result.winRate).toBe(0.68);
      expect(result.rank).toBe(15);
    });

    it('should substitute address into path parameter', async () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      const mockUserStats: UserStats = {
        address: validAddress,
        totalBets: 10,
        totalVolume: 1000,
        winRate: 0.5
      };

      mock.onGet(`/portfolio/positions`).reply(200, mockUserStats);

      await getUserStats(validAddress);

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe(`/portfolio/positions`);
    });

    it('should throw ValidationError with invalid address', async () => {
      await expect(getUserStats('invalid-address')).rejects.toThrow(ValidationError);
      await expect(getUserStats('invalid-address')).rejects.toThrow('address must be a valid Ethereum address');

      try {
        await getUserStats('0x123');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('address');
      }
    });

    it('should throw ValidationError with address missing 0x prefix', async () => {
      await expect(getUserStats('742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError with address having wrong length', async () => {
      await expect(getUserStats('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).rejects.toThrow(ValidationError);
      await expect(getUserStats('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb123')).rejects.toThrow(ValidationError);
    });

    it('should throw APIError on HTTP error', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      mock.onGet(`/portfolio/positions`).reply(500, { message: 'Internal server error' });

      await expect(getUserStats(validAddress)).rejects.toThrow(APIError);

      try {
        await getUserStats(validAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(500);
      }
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard with custom limit and verify query parameters', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          totalVolume: 100000,
          winRate: 0.85,
          profit: 25000
        },
        {
          rank: 2,
          address: '0x1234567890123456789012345678901234567890',
          totalVolume: 75000,
          winRate: 0.78,
          profit: 18000
        },
        {
          rank: 3,
          address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
          totalVolume: 50000,
          winRate: 0.72,
          profit: 12000
        }
      ];

      mock.onGet('/portfolio/positions').reply(200, mockLeaderboard);

      const result = await getLeaderboard(3);

      expect(result).toEqual(mockLeaderboard);
      expect(result).toHaveLength(3);
      expect(result[0].rank).toBe(1);
      expect(result[0].totalVolume).toBe(100000);
      expect(mock.history.get.length).toBe(1);
    });

    it('should use default limit of 10 when not provided', async () => {
      const mockLeaderboard: LeaderboardEntry[] = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        address: `0x${(i + 1).toString().padStart(40, '0')}`,
        totalVolume: 10000 - i * 1000,
        winRate: 0.8 - i * 0.05,
        profit: 5000 - i * 500
      }));

      mock.onGet('/portfolio/positions').reply(200, mockLeaderboard);

      const result = await getLeaderboard();

      expect(result).toEqual(mockLeaderboard);
      expect(result).toHaveLength(10);
      expect(mock.history.get.length).toBe(1);
    });

    it('should handle different limit values', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [
        {
          rank: 1,
          address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
          totalVolume: 100000,
          winRate: 0.85,
          profit: 25000
        }
      ];

      mock.onGet('/portfolio/positions').reply(200, mockLeaderboard);

      const result = await getLeaderboard(1);

      expect(result).toHaveLength(1);
    });

    it('should throw APIError on HTTP error', async () => {
      mock.onGet('/portfolio/positions').reply(503, { message: 'Service unavailable' });

      await expect(getLeaderboard()).rejects.toThrow(APIError);

      try {
        await getLeaderboard(10);
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(503);
      }
    });

    it('should handle large limit values', async () => {
      const mockLeaderboard: LeaderboardEntry[] = [];
      
      mock.onGet('/portfolio/positions').reply(200, mockLeaderboard);

      const result = await getLeaderboard(100);

      expect(result).toEqual(mockLeaderboard);
    });
  });
});
