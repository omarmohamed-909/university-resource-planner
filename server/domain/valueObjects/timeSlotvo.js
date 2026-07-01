class TimeSlot {
  constructor({ startTime, endTime }) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  overlapsWith(other) {
    return this.startTime < other.endTime && this.endTime > other.startTime;
  }

  contains(time) {
    return time >= this.startTime && time <= this.endTime;
  }

  toMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  durationInMinutes() {
    return this.toMinutes(this.endTime) - this.toMinutes(this.startTime);
  }
}

module.exports = TimeSlot;
