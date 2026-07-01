const { z } = require('zod');

const swapRequestSchema = z.object({
  originalScheduleId: z.string().min(1, 'يرجى اختيار المحاضرة الأصلية'),
  proposedHallId:     z.string().optional(),
  proposedDay:        z.string().optional(),
  proposedStartTime:  z.string().optional(),
  proposedEndTime:    z.string().optional(),
  reason:             z.string().max(500).optional(),
});

const swapRespondSchema = z.object({
  status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'القرار يجب أن يكون approved أو rejected' })
  }),
  note: z.string().max(300).optional(),
});

module.exports = { swapRequestSchema, swapRespondSchema };
