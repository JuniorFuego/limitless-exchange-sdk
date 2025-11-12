import { validateAddress } from './bets.js';
import { request } from './client.js';
/**
 * Get user statistics for a specific wallet address
 * @param address - Ethereum wallet address
 * @returns Promise with user statistics including total bets, volume, win rate, and rank
 */
export async function getUserStats(address) {
    // Validate address format
    validateAddress(address, 'address');
    // Make API request with address as path parameter
    const stats = await request('getUserStats', {
        method: 'GET',
        pathParams: {
            address: address
        }
    });
    return stats;
}
/**
 * Get leaderboard with top users ranked by performance
 * @param limit - Optional number of entries to return (default: 10)
 * @returns Promise with array of leaderboard entries
 */
export async function getLeaderboard(limit = 10) {
    // Make API request with limit as query parameter
    const leaderboard = await request('getLeaderboard', {
        method: 'GET',
        params: {
            limit: limit
        }
    });
    return leaderboard;
}
