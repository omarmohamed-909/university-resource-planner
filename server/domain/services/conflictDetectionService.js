const Schedule = require('../entities/scheduleEntity');
const getId = require('../utils/getId');

class ConflictDetectionService {
  async check(newSchedule, existingSchedules) {
    const conflicts = [];
    const newScheduleId = getId(newSchedule.id || newSchedule._id);
    for (const existing of existingSchedules) {
      const existingId = getId(existing.id || existing._id);
      if (newScheduleId && existingId && existingId === newScheduleId) continue;
      const existingEntity = new Schedule({
        id: existingId,
        courseId: existing.courseId,
        hallId: existing.hallId,
        day: existing.day,
        startTime: existing.startTime,
        endTime: existing.endTime,
        weekPattern: existing.weekPattern,
        semester: existing.semester
      });
      if (newSchedule.overlapsWith(existingEntity)) {
        conflicts.push(existingEntity);
      }
    }
    return conflicts;
  }

  checkDoctorOverlap(newSchedule, doctorSchedules) {
    const conflicts = [];
    const newScheduleId = getId(newSchedule.id || newSchedule._id);
    for (const existing of doctorSchedules) {
      const existingId = getId(existing.id || existing._id);
      if (newScheduleId && existingId && existingId === newScheduleId) continue;
      const existingEntity = new Schedule({
        id: existingId,
        courseId: existing.courseId,
        hallId: existing.hallId,
        day: existing.day,
        startTime: existing.startTime,
        endTime: existing.endTime,
        weekPattern: existing.weekPattern,
        semester: existing.semester
      });
      if (newSchedule.day === existingEntity.day &&
          newSchedule.startTime < existingEntity.endTime &&
          newSchedule.endTime > existingEntity.startTime) {
        const weekOk = newSchedule.weekPattern === 'weekly' ||
                       existingEntity.weekPattern === 'weekly' ||
                       newSchedule.weekPattern === existingEntity.weekPattern;
        if (weekOk) {
          conflicts.push(existingEntity);
        }
      }
    }
    return conflicts;
  }
}

module.exports = ConflictDetectionService;
