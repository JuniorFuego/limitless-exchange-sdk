import { EventHandler, EventData } from '../types.js';

/**
 * Base event emitter implementation for the SDK hook system
 * Provides async event handling with error isolation
 */
export class EventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  /**
   * Register an event handler
   * @param event - Event name or wildcard pattern
   * @param handler - Event handler function
   */
  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  /**
   * Unregister an event handler
   * @param event - Event name
   * @param handler - Event handler function to remove
   */
  off(event: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(event);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      if (eventHandlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  /**
   * Emit an event to all registered handlers
   * Handlers execute asynchronously without blocking
   * Errors in handlers are caught and logged but don't propagate
   * @param event - Event name
   * @param data - Event data
   */
  emit(event: string, data: any): void {
    const eventData: EventData = {
      timestamp: new Date(),
      event,
      context: data
    };

    // Execute handlers for exact event match
    this.executeHandlers(event, eventData);

    // Execute wildcard handlers
    this.executeHandlers('*', eventData);

    // Execute namespace wildcard handlers (e.g., 'request:*' matches 'request:start')
    const eventParts = event.split(':');
    if (eventParts.length > 1) {
      const namespace = eventParts[0] + ':*';
      this.executeHandlers(namespace, eventData);
    }
  }

  /**
   * Execute handlers for a specific event pattern
   * @param pattern - Event pattern to match
   * @param eventData - Event data to pass to handlers
   */
  private executeHandlers(pattern: string, eventData: EventData): void {
    const handlers = this.handlers.get(pattern);
    if (!handlers) return;

    // Execute all handlers asynchronously
    handlers.forEach(handler => {
      this.executeHandler(handler, eventData);
    });
  }

  /**
   * Execute a single handler with error isolation
   * @param handler - Handler function to execute
   * @param eventData - Event data to pass to handler
   */
  private async executeHandler(handler: EventHandler, eventData: EventData): Promise<void> {
    try {
      await handler(eventData);
    } catch (error) {
      // Log error but don't propagate to prevent handler errors from affecting SDK operations
      console.error(`Error in event handler for ${eventData.event}:`, error);
    }
  }

  /**
   * Get all registered event names
   * @returns Array of event names
   */
  getEventNames(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for an event
   * @param event - Event name
   * @returns Number of handlers registered for the event
   */
  getHandlerCount(event: string): number {
    const handlers = this.handlers.get(event);
    return handlers ? handlers.size : 0;
  }

  /**
   * Remove all handlers for an event or all events
   * @param event - Optional event name. If not provided, removes all handlers
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.handlers.delete(event);
    } else {
      this.handlers.clear();
    }
  }
}