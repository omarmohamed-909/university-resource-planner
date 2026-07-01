class LoginUseCase {
  constructor({ userRepository, authService: jwtAuthService }) {
    this.userRepository = userRepository;
    this.jwtAuthService = jwtAuthService;
  }

  async execute({ email, password }) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    const valid = await this.jwtAuthService.comparePassword(password, user.password);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    const token = this.jwtAuthService.generateToken(user);
    const refreshToken = this.jwtAuthService.generateRefreshToken(user);

    return {
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    };
  }
}

module.exports = LoginUseCase;
