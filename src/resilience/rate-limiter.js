/**
 * Rate limiter using sliding window algorithm to track and throttle API requests
 */
export class RateLimiter {
    constructor(config) {
        this.requestTimestamps = [];
        this.eventHandlers = new Map();
        this.config = {
            enabled: config.enabled ?? true,
            requestsPerSecond: config.requestsPerSecond ?? 10,
            requestsPerMinute: config.requestsPerMinute ?? 600
        };
    }
    /**
     * Check if a request can be made without exceeding rate limits
     * Delays the request if approaching limits
     */
    async checkLimit() {
        if (!this.config.enabled) {
            return;
        }
        const now = Date.now();
        this.cleanupOldRequests(now);
        // Check per-second limit
        const secondWindow = now - 1000;
        const requestsInLastSecond = this.requestTimestamps.filter(ts => ts > secondWindow).length;
        if (requestsInLastSecond >= this.config.requestsPerSecond) {
            const delay = 1000 - (now - this.requestTimestamps[this.requestTimestamps.length - this.config.requestsPerSecond]);
            await this.throttle(delay);
            return;
        }
        // Check per-minute limit
        const minuteWindow = now - 60000;
        const requestsInLastMinute = this.requestTimestamps.filter(ts => ts > minuteWindow).length;
        if (requestsInLastMinute >= this.config.requestsPerMinute) {
            const oldestRelevantRequest = this.requestTimestamps.find(ts => ts > minuteWindow);
            const delay = oldestRelevantRequest ? 60000 - (now - oldestRelevantRequest) : 1000;
            await this.throttle(delay);
            return;
        }
        // Check if we're approaching limits (90% threshold) and need to throttle
        const secondThreshold = Math.floor(this.config.requestsPerSecond * 0.9);
        const minuteThreshold = Math.floor(this.config.requestsPerMinute * 0.9);
        if (requestsInLastSecond >= secondThreshold) {
            // Small delay to spread requests more evenly
            const delay = Math.max(100, 1000 / this.config.requestsPerSecond);
            await this.throttle(delay);
        }
        else if (requestsInLastMinute >= minuteThreshold) {
            // Small delay to spread requests more evenly
            const delay = Math.max(100, 60000 / this.config.requestsPerMinute);
            await this.throttle(delay);
        }
    }
    /**
     * Record a request in the sliding window
     */
    recordRequest() {
        if (!this.config.enabled) {
            return;
        }
        const now = Date.now();
        this.requestTimestamps.push(now);
        this.cleanupOldRequests(now);
    }
    /**
     * Get current rate limit status
     */
    getStatus() {
        const now = Date.now();
        this.cleanupOldRequests(now);
        const minuteWindow = now - 60000;
        const requestsInWindow = this.requestTimestamps.filter(ts => ts > minuteWindow).length;
        const remaining = Math.max(0, this.config.requestsPerMinute - requestsInWindow);
        // Calculate when the window resets (when the oldest request in the window expires)
        const oldestInWindow = this.requestTimestamps.find(ts => ts > minuteWindow);
        const resetAt = oldestInWindow ? new Date(oldestInWindow + 60000) : new Date(now + 60000);
        return {
            requestsInWindow,
            windowSize: 60000, // 1 minute window
            limit: this.config.requestsPerMinute,
            remaining,
            resetAt
        };
    }
    /**
     * Register event handler for rate limiting events
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    /**
     * Remove event handler
     */
    off(event, handler) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }
    /**
     * Clean up old request timestamps outside the tracking window
     */
    cleanupOldRequests(now) {
        const cutoff = now - 60000; // Keep 1 minute of history
        this.requestTimestamps = this.requestTimestamps.filter(ts => ts > cutoff);
    }
    /**
     * Throttle request by delaying for specified duration
     */
    async throttle(delay) {
        // Emit throttling event
        this.emit('throttled', {
            timestamp: new Date(),
            event: 'rate:throttled',
            context: {
                delay,
                status: this.getStatus()
            }
        });
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, Math.max(0, delay)));
    }
    /**
     * Emit event to registered handlers
     */
    emit(event, data) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            // Execute handlers asynchronously without blocking
            handlers.forEach(handler => {
                try {
                    const result = handler(data);
                    if (result instanceof Promise) {
                        result.catch(error => {
                            console.error(`Error in rate limiter event handler for ${event}:`, error);
                        });
                    }
                }
                catch (error) {
                    console.error(`Error in rate limiter event handler for ${event}:`, error);
                }
            });
        }
    }
    /**
     * Get configuration for debugging
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Reset rate limiter state (useful for testing)
     */
    reset() {
        this.requestTimestamps = [];
    }
}
