import { ValidationError } from './errors.js';
import { request } from './client.js';
/**
 * Validate outcome is 'YES' or 'NO' (case-insensitive)
 */
export function validateOutcome(outcome, field = 'outcome') {
    const normalizedOutcome = outcome.toUpperCase();
    if (normalizedOutcome !== 'YES' && normalizedOutcome !== 'NO') {
        throw new ValidationError(`${field} must be 'YES' or 'NO' (case-insensitive)`, field);
    }
}
/**
 * Validate amount is a positive number
 */
export function validateAmount(amount, field = 'amount') {
    if (typeof amount !== 'number' || isNaN(amount)) {
        throw new ValidationError(`${field} must be a valid number`, field);
    }
    if (amount <= 0) {
        throw new ValidationError(`${field} must be a positive number`, field);
    }
}
/**
 * Validate Ethereum address format (0x followed by 40 hex characters)
 */
export function validateAddress(address, field = 'address') {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethereumAddressRegex.test(address)) {
        throw new ValidationError(`${field} must be a valid Ethereum address (0x followed by 40 hexadecimal characters)`, field);
    }
}
/**
 * Submit a bet on a prediction market
 * @param params - Bet parameters including marketId, outcome, and amount
 * @returns Promise with bet result including betId and transaction hash
 */
export async function submitBet(params) {
    // Validate inputs
    if (!params.marketId || typeof params.marketId !== 'string' || params.marketId.trim() === '') {
        throw new ValidationError('marketId is required and must be a non-empty string', 'marketId');
    }
    validateOutcome(params.outcome, 'outcome');
    validateAmount(params.amount, 'amount');
    // Make API request
    const result = await request('submitBet', {
        method: 'POST',
        data: {
            marketId: params.marketId,
            outcome: params.outcome.toUpperCase(),
            amount: params.amount
        }
    });
    return result;
}
/**
 * Get bet history for a specific wallet address
 * @param address - Ethereum wallet address
 * @returns Promise with array of bet records
 */
export async function getBetHistory(address) {
    // Validate address format
    validateAddress(address, 'address');
    // Make API request with address as path parameter
    const bets = await request('getBetHistory', {
        method: 'GET',
        pathParams: {
            address: address
        }
    });
    return bets;
}
