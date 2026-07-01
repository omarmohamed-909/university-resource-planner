const { z } = require('zod');

function validateMiddleware(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const data = source === 'query' ? req.query : req.body;
      const parsed = schema.parse(data);
      if (source === 'query') {
        req.query = parsed;
      } else {
        req.body = parsed;
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        return res.status(422).json({ success: false, message: messages });
      }
      next(error);
    }
  };
}

module.exports = validateMiddleware;
