class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode || 500;
        this.isOperational = true;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(resource = 'Resource', identifier = '') {
        const message = identifier
            ? `${resource} with identifier "${identifier}" not found`
            : `${resource} not found`;
        super(message, 404);
        this.resource = resource;
        this.identifier = identifier;
        this.type = 'not_found';
    }
}

class DatabaseError extends AppError {
    constructor(message, originalError = null) {
        super(message, 500);
        this.type = 'database_error';
        this.originalError = originalError;
    }
}

class InventoryNotFoundError extends Error {
    constructor(productId) {
        super(`Inventory for product ${productId} not found`);
        this.name = 'InventoryNotFoundError';
        this.statusCode = 404;
    }
}

class InventoryProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InventoryProcessingError';
        this.statusCode = 500;
    }
}

class InventoryQuantityError extends Error {
    constructor(productId, available, requested) {
        super(`Insufficient stock for product ${productId}. Available: ${available}, Requested: ${requested}`);
        this.name = 'InventoryQuantityError';
        this.statusCode = 400;
    }
}

class ValidationError extends Error {
    constructor(message, fields = []) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400;
        this.fields = fields;
    }
}

class PaymentError extends Error {
    constructor(message, reason = '') {
        super(message);
        this.name = 'PaymentError';
        this.statusCode = 402;
        this.reason = reason;
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
        this.type = 'unauthorized_error';
    }
}

module.exports = {
    UnauthorizedError,
    ValidationError, 
    PaymentError,
    InventoryNotFoundError,
    InventoryProcessingError,
    InventoryQuantityError,
    AppError,
    NotFoundError,
    DatabaseError,
};