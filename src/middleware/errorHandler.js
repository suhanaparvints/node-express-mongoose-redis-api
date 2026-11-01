export const errorHandler = (error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  console.error(error);

  let statusCode = error.statusCode || error.status || 500;
  let message = error.message;

  if (error.code === 11000) {
    statusCode = 409;
    message = error.keyPattern?.email
      ? "An account with this email already exists"
      : "A record with a duplicate value already exists";
  } else if (error.name === "ValidationError" || error.name === "CastError") {
    statusCode = 400;
  } else if (statusCode >= 500) {
    message = "Internal server error";
  }

  return res.status(statusCode).json({
    status: "error",
    message,
  });
};
