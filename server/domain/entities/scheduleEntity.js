const getId = require('../utils/getId');

class Schedule {
  constructor({ id, courseId, hallId, day, startTime, endTime, weekPattern, semester }) {
    this.id = id;
    this.courseId = courseId;
    this.hallId = hallId;
    this.day = day;
    this.startTime = startTime;
    this.endTime = endTime;
    this.weekPattern = weekPattern || 'weekly';
    this.semester = semester;
  }

  overlapsWith(other) {
    if (getId(this.hallId) !== getId(other.hallId)) return false;
    if (this.day !== other.day) return false;
    if (this.weekPattern !== 'weekly' && other.weekPattern !== 'weekly' && this.weekPattern !== other.weekPattern) return false;
    return this.startTime < other.endTime && this.endTime > other.startTime;
  }

  durationInMinutes() {
    const [sh, sm] = this.startTime.split(':').map(Number);
    const [eh, em] = this.endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }
}

module.exports = Schedule;
