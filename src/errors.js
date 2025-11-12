export class SDKError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'SDKError';
        this.code = code;
        Object.setPrototypeOf(this, SDKError.prototype);
    }
}
export class ConfigurationError extends SDKError {
    constructor(message) {
        super(message, 'CONFIGURATION_ERROR');
        this.name = 'ConfigurationError';
        Object.setPrototypeOf(this, ConfigurationError.prototype);
    }
}
export class APIError extends SDKError {
    constructor(message, statusCode, response) {
        super(message, 'API_ERROR');
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.response = response;
        Object.setPrototypeOf(this, APIError.prototype);
    }
}
export class ValidationError extends SDKError {
    constructor(message, field) {
        super(message, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.field = field;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
export class TimeoutError extends SDKError {
    constructor(message) {
        super(message, 'TIMEOUT_ERROR');
        this.name = 'TimeoutError';
        Object.setPrototypeOf(this, TimeoutError.prototype);
    }
}
