import { request } from './client.js';
/**
 * List markets with optional filters
 * @param filters - Optional filters for status, limit, and offset
 * @returns Promise with array of Market objects
 */
export async function listMarkets(filters) {
    const params = {};
    // Build query parameters from filters
    if (filters) {
        if (filters.status) {
            params.status = filters.status;
        }
        if (filters.limit !== undefined) {
            params.limit = filters.limit;
        }
        if (filters.offset !== undefined) {
            params.offset = filters.offset;
        }
    }
    // Call HTTP client request function with 'listMarkets' endpoint
    const response = await request('listMarkets', {
        method: 'GET',
        params
    });
    // Parse response and return typed Market array
    return response.data;
}
/**
 * Get detailed information about a specific market
 * @param marketId - The ID of the market to retrieve
 * @returns Promise with MarketDetails object
 */
export async function getMarketDetails(marketId) {
    // Substitute marketId into endpoint path parameter
    const response = await request('getMarketDetails', {
        method: 'GET',
        pathParams: {
            id: marketId
        }
    });
    // Parse response and return typed MarketDetails object
    return response;
}
