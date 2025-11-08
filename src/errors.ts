export class SDKError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = 'SDKError';
    this.code = code;
    Object.setPrototypeOf(this, SDKError.prototype);
  }
}

export class ConfigurationError extends SDKError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR');
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}

export class APIError extends SDKError {
  public statusCode: number;
  public response?: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message, 'API_ERROR');
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

export class ValidationError extends SDKError {
  public field: string;

  constructor(message: string, field: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    this.field = field;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class TimeoutError extends SDKError {
  constructor(message: string) {
    super(message, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
