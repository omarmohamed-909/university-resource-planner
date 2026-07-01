const User = require('../../../domain/entities/userEntity');

class RegisterUseCase {
  constructor({ userRepository, authService: jwtAuthService }) {
    this.userRepository = userRepository;
    this.jwtAuthService = jwtAuthService;
  }

  async execute({ name, email, password, role, department, phone }) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.jwtAuthService.hashPassword(password);

    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'student',
      department,
      phone,
      isActive: true
    });

    const saved = await this.userRepository.save(user);
    const token = this.jwtAuthService.generateToken(saved);
    const refreshToken = this.jwtAuthService.generateRefreshToken(saved);

    return {
      token,
      refreshToken,
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
        department: saved.department
      }
    };
  }
}

module.exports = RegisterUseCase;
