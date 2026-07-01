const { z } = require('zod');

const scheduleBaseSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  hallId: z.string().min(1, 'Hall ID is required'),
  day: z.enum(['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  weekPattern: z.enum(['weekly', 'odd', 'even']).optional(),
  semester: z.string().min(1, 'Semester is required')
});

const createScheduleSchema = scheduleBaseSchema.refine(data => data.startTime < data.endTime, {
  message: 'Start time must be before end time',
  path: ['startTime']
});

const updateScheduleSchema = scheduleBaseSchema.partial();

module.exports = { createScheduleSchema, updateScheduleSchema };
