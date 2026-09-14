class Course {
  constructor({ id, code, name, doctorId, department, studentIds, studentCount, creditHours }) {
    this.id = id;
    this.code = code;
    this.name = name;
    this.doctorId = doctorId;
    this.department = department;
    this.studentIds = studentIds || [];
    this.studentCount = Number.isFinite(studentCount) ? studentCount : this.studentIds.length;
    this.creditHours = creditHours;
  }

  getStudentCount() {
    return this.studentCount;
  }
}

module.exports = Course;
