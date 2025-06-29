class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

// Middleware
export const ErrorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    // Handle CastError
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, 400);
    }

    // Handle JWT error
    if (err.name === "JsonWebTokenError") {
        const message = "Invalid JSON Web Token, try again!";
        err = new ErrorHandler(message, 400);
    }

    // Handle JWT expired
    if (err.name === "TokenExpiredError") {
        const message = "JSON Web Token has expired, try again!";
        err = new ErrorHandler(message, 400);
    }

    return res.status(err.statusCode).json({
        success: false,
        message: err.message
    });
};
export default ErrorHandler;

/*  errror middleware What it is: A single Express error-handling middleware (with signature (err, req, res, next)) that catches all errors passed via next(err) or thrown in asyncHandler.

Why: To centralize error formatting and HTTP status logic, rather than peppering controllers with custom res.status(...).json(...) on every catch. */