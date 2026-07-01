const { z } = require('zod');

const createHallSchema = z.object({
  name: z.string().min(1, 'Hall name is required'),
  type: z.enum(['lecture', 'lab']),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  floor: z.number().int().optional(),
  building: z.string().optional(),
  equipment: z.array(z.object({
    name: z.string(),
    condition: z.enum(['working', 'needs_maintenance', 'broken']).optional()
  })).optional(),
  status: z.enum(['active', 'maintenance', 'inactive']).optional()
});

const updateHallSchema = createHallSchema.partial();

module.exports = { createHallSchema, updateHallSchema };
