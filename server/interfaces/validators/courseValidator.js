const { z } = require('zod');

const createCourseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(2, 'Course name must be at least 2 characters'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  department: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
  creditHours: z.number().int().min(1, 'Credit hours must be at least 1')
});

const updateCourseSchema = createCourseSchema.partial();

const enrollSchema = z.object({
  studentIds: z.array(z.string()).min(1, 'studentIds must be a non-empty array')
});

module.exports = { createCourseSchema, updateCourseSchema, enrollSchema };
