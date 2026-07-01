const { z } = require('zod');

const listUsersSchema = z.object({
  role: z.enum(['admin', 'doctor', 'student']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional()
});

const userIdSchema = z.object({
  id: z.string().min(1, 'User ID is required')
});

module.exports = { listUsersSchema, userIdSchema };
