class Attendance {
  constructor({ id, scheduleId, studentId, date, status, qrCode, createdAt, updatedAt }) {
    this.id = id;
    this.scheduleId = scheduleId;
    this.studentId = studentId;
    this.date = date;
    this.status = status || 'absent';
    this.qrCode = qrCode;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  markPresent() {
    this.status = 'present';
  }

  markAbsent() {
    this.status = 'absent';
  }

  isPresent() {
    return this.status === 'present';
  }
}

module.exports = Attendance;
