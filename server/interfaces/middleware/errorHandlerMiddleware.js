function errorHandlerMiddleware(err, req, res, next) {
  console.error('Error:', err.message);

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ success: false, message: `${field} already exists` });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  const statusCode = err.statusCode || (err.name === 'Error' ? 400 : 500);
  const isServerError = statusCode >= 500;
  res.status(statusCode).json({
    success: false,
    message: isServerError && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error'
  });
}

module.exports = errorHandlerMiddleware;
