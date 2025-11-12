/**
 * Node in the doubly-linked list for LRU tracking
 */
class CacheNode {
    constructor(key, value, expiresAt) {
        this.prev = null;
        this.next = null;
        this.key = key;
        this.value = value;
        this.expiresAt = expiresAt;
    }
}
/**
 * Cache manager with LRU eviction and TTL support
 */
export class CacheManager {
    constructor(config) {
        this.cache = new Map();
        this.head = null;
        this.tail = null;
        // Statistics
        this.hits = 0;
        this.misses = 0;
        this.maxSize = config.maxSize;
        this.defaultTTL = config.defaultTTL;
        this.ttlByResource = config.ttlByResource || {};
    }
    /**
     * Get value from cache
     */
    get(key) {
        const node = this.cache.get(key);
        if (!node) {
            this.misses++;
            return null;
        }
        // Check if expired
        if (Date.now() > node.expiresAt) {
            this.remove(key);
            this.misses++;
            return null;
        }
        // Move to head (most recently used)
        this.moveToHead(node);
        this.hits++;
        return node.value;
    }
    /**
     * Set value in cache with optional TTL
     */
    set(key, value, ttl) {
        const existingNode = this.cache.get(key);
        if (existingNode) {
            // Update existing node
            existingNode.value = value;
            existingNode.expiresAt = Date.now() + (ttl || this.getTTLForKey(key));
            this.moveToHead(existingNode);
            return;
        }
        // Create new node
        const expiresAt = Date.now() + (ttl || this.getTTLForKey(key));
        const newNode = new CacheNode(key, value, expiresAt);
        this.cache.set(key, newNode);
        this.addToHead(newNode);
        // Check if we need to evict
        if (this.cache.size > this.maxSize) {
            this.evictLRU();
        }
    }
    /**
     * Invalidate a specific cache entry
     */
    invalidate(key) {
        this.remove(key);
    }
    /**
     * Invalidate cache entries matching a pattern
     */
    invalidatePattern(pattern) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        const keysToRemove = [];
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => this.remove(key));
    }
    /**
     * Clear all cache entries
     */
    clear() {
        this.cache.clear();
        this.head = null;
        this.tail = null;
        this.hits = 0;
        this.misses = 0;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        // Clean up expired entries before calculating stats
        this.cleanupExpired();
        const totalRequests = this.hits + this.misses;
        const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;
        return {
            hits: this.hits,
            misses: this.misses,
            hitRate,
            size: this.cache.size,
            maxSize: this.maxSize
        };
    }
    /**
     * Get TTL for a specific cache key based on resource type
     */
    getTTLForKey(key) {
        // Extract resource type from key (format: endpoint:params)
        const [endpoint] = key.split(':');
        // Map endpoints to resource types
        const resourceTypeMap = {
            '/markets/active': 'markets',
            '/markets': 'marketDetails',
            '/portfolio/positions': 'userStats',
            '/portfolio/history': 'userStats'
        };
        const resourceType = resourceTypeMap[endpoint];
        return resourceType && this.ttlByResource[resourceType]
            ? this.ttlByResource[resourceType]
            : this.defaultTTL;
    }
    /**
     * Remove a node from cache and linked list
     */
    remove(key) {
        const node = this.cache.get(key);
        if (!node)
            return;
        this.cache.delete(key);
        this.removeFromList(node);
    }
    /**
     * Add node to head of linked list
     */
    addToHead(node) {
        node.prev = null;
        node.next = this.head;
        if (this.head) {
            this.head.prev = node;
        }
        this.head = node;
        if (!this.tail) {
            this.tail = node;
        }
    }
    /**
     * Remove node from linked list
     */
    removeFromList(node) {
        if (node.prev) {
            node.prev.next = node.next;
        }
        else {
            this.head = node.next;
        }
        if (node.next) {
            node.next.prev = node.prev;
        }
        else {
            this.tail = node.prev;
        }
    }
    /**
     * Move node to head of linked list (mark as most recently used)
     */
    moveToHead(node) {
        this.removeFromList(node);
        this.addToHead(node);
    }
    /**
     * Evict least recently used item
     */
    evictLRU() {
        if (this.tail) {
            this.remove(this.tail.key);
        }
    }
    /**
     * Clean up expired entries
     */
    cleanupExpired() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, node] of this.cache.entries()) {
            if (now > node.expiresAt) {
                expiredKeys.push(key);
            }
        }
        expiredKeys.forEach(key => this.remove(key));
    }
}
