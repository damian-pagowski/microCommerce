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

module.exports = {
    AppError,
    NotFoundError,
    DatabaseError,
};