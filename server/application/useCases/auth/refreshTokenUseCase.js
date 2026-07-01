class RefreshTokenUseCase {
  constructor({ userRepository, authService: jwtAuthService }) {
    this.userRepository = userRepository;
    this.jwtAuthService = jwtAuthService;
  }

  async execute({ refreshToken }) {
    if (!refreshToken) throw new Error('Refresh token is required');

    const decoded = this.jwtAuthService.verifyRefreshToken(refreshToken);
    if (!decoded) throw new Error('Invalid or expired refresh token');

    const user = await this.userRepository.findById(decoded.id);
    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('Account is deactivated');

    const token = this.jwtAuthService.generateToken(user);
    const nextRefreshToken = this.jwtAuthService.generateRefreshToken(user);

    return {
      token,
      refreshToken: nextRefreshToken,
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

module.exports = RefreshTokenUseCase;
