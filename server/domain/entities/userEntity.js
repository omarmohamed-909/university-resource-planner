class User {
  constructor({ id, name, email, password, role, department, phone, isActive, googleId, picture }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.department = department;
    this.phone = phone;
    this.isActive = isActive !== undefined ? isActive : true;
    this.googleId = googleId || null;
    this.picture = picture || null;
  }

  isAdmin() {
    return this.role === 'admin';
  }

  isDoctor() {
    return this.role === 'doctor';
  }

  isStudent() {
    return this.role === 'student';
  }

  canManageHalls() {
    return this.isAdmin();
  }

  canManageSchedules() {
    return this.isAdmin() || this.isDoctor();
  }

  canViewAllSchedules() {
    return this.isAdmin();
  }
}

module.exports = User;
