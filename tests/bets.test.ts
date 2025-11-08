import MockAdapter from 'axios-mock-adapter';
import { configure, getAxiosInstance } from '../src/client.js';
import { submitBet, getBetHistory } from '../src/bets.js';
import { ValidationError, APIError } from '../src/errors.js';
import { BetResult, Bet } from '../src/types.js';

describe('Bets Module', () => {
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

  describe('submitBet', () => {
    it('should submit bet with valid inputs and return success response', async () => {
      const mockBetResult: BetResult = {
        betId: 'bet-123',
        transactionHash: '0xabc123def456',
        status: 'pending'
      };

      mock.onPost('/orders').reply(200, mockBetResult);

      const result = await submitBet({
        marketId: 'market-1',
        outcome: 'YES',
        amount: 100
      });

      expect(result).toEqual(mockBetResult);
      expect(result.betId).toBe('bet-123');
      expect(result.transactionHash).toBe('0xabc123def456');
      expect(mock.history.post.length).toBe(1);
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        marketId: 'market-1',
        outcome: 'YES',
        amount: 100
      });
    });

    it('should normalize outcome to uppercase', async () => {
      const mockBetResult: BetResult = {
        betId: 'bet-456',
        status: 'pending'
      };

      mock.onPost('/orders').reply(200, mockBetResult);

      await submitBet({
        marketId: 'market-2',
        outcome: 'NO',
        amount: 50
      });

      expect(mock.history.post.length).toBe(1);
      const requestData = JSON.parse(mock.history.post[0].data);
      expect(requestData.outcome).toBe('NO');
    });

    it('should throw ValidationError with invalid outcome', async () => {
      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'MAYBE' as any,
        amount: 100
      })).rejects.toThrow(ValidationError);

      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'MAYBE' as any,
        amount: 100
      })).rejects.toThrow("outcome must be 'YES' or 'NO' (case-insensitive)");

      try {
        await submitBet({
          marketId: 'market-1',
          outcome: 'INVALID' as any,
          amount: 100
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('outcome');
      }
    });

    it('should throw ValidationError with negative amount', async () => {
      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'YES',
        amount: -50
      })).rejects.toThrow(ValidationError);

      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'YES',
        amount: -50
      })).rejects.toThrow('amount must be a positive number');

      try {
        await submitBet({
          marketId: 'market-1',
          outcome: 'YES',
          amount: -100
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('amount');
      }
    });

    it('should throw ValidationError with zero amount', async () => {
      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'YES',
        amount: 0
      })).rejects.toThrow(ValidationError);

      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'YES',
        amount: 0
      })).rejects.toThrow('amount must be a positive number');
    });

    it('should throw ValidationError with empty marketId', async () => {
      await expect(submitBet({
        marketId: '',
        outcome: 'YES',
        amount: 100
      })).rejects.toThrow(ValidationError);

      try {
        await submitBet({
          marketId: '   ',
          outcome: 'YES',
          amount: 100
        });
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('marketId');
      }
    });

    it('should throw APIError on HTTP error', async () => {
      mock.onPost('/orders').reply(400, { message: 'Invalid bet parameters' });

      await expect(submitBet({
        marketId: 'market-1',
        outcome: 'YES',
        amount: 100
      })).rejects.toThrow(APIError);

      try {
        await submitBet({
          marketId: 'market-1',
          outcome: 'YES',
          amount: 100
        });
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(400);
      }
    });
  });

  describe('getBetHistory', () => {
    it('should return bet history with valid address', async () => {
      const mockBets: Bet[] = [
        {
          id: 'bet-1',
          marketId: 'market-1',
          outcome: 'YES',
          amount: 100,
          timestamp: '2024-01-01T12:00:00Z',
          status: 'settled'
        },
        {
          id: 'bet-2',
          marketId: 'market-2',
          outcome: 'NO',
          amount: 50,
          timestamp: '2024-01-02T14:30:00Z',
          status: 'pending'
        }
      ];

      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      mock.onGet(`/portfolio/history`).reply(200, mockBets);

      const result = await getBetHistory(validAddress);

      expect(result).toEqual(mockBets);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('bet-1');
      expect(result[1].status).toBe('pending');
    });

    it('should substitute address into path parameter', async () => {
      const validAddress = '0x1234567890123456789012345678901234567890';
      mock.onGet(`/portfolio/history`).reply(200, []);

      await getBetHistory(validAddress);

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe(`/portfolio/history`);
    });

    it('should throw ValidationError with invalid address format', async () => {
      await expect(getBetHistory('invalid-address')).rejects.toThrow(ValidationError);
      await expect(getBetHistory('invalid-address')).rejects.toThrow('address must be a valid Ethereum address');

      try {
        await getBetHistory('0x123');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).field).toBe('address');
      }
    });

    it('should throw ValidationError with address missing 0x prefix', async () => {
      await expect(getBetHistory('742d35Cc6634C0532925a3b844Bc9e7595f0bEb1')).rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError with address having wrong length', async () => {
      await expect(getBetHistory('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')).rejects.toThrow(ValidationError);
      await expect(getBetHistory('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb123')).rejects.toThrow(ValidationError);
    });

    it('should throw APIError on HTTP error', async () => {
      const validAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';
      mock.onGet(`/portfolio/history`).reply(500, { message: 'Internal server error' });

      await expect(getBetHistory(validAddress)).rejects.toThrow(APIError);

      try {
        await getBetHistory(validAddress);
      } catch (error) {
        expect(error).toBeInstanceOf(APIError);
        expect((error as APIError).statusCode).toBe(500);
      }
    });
  });
});
