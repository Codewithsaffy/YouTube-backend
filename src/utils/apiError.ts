class ApiError extends Error {
  constructor(
    statusCode: string,
    message = "Something went wrong",
    errors = [],
    stack = "",
  ) {
    super(message);
    this.code = statusCode;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
