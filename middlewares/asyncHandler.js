const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch(next);
    };
};
export { asyncHandler };

/* What it is: A higher-order function that wraps async route handlers and automatically forwards any thrown errors to Express’s next() function.

Why: Without it, you’d need a try/catch in every async controller to catch rejections and call next(err). */