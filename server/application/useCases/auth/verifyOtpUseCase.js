class VerifyOtpUseCase {
  constructor({ otpService, userRepository, authService: jwtAuthService }) {
    this.otpService = otpService;
    this.userRepository = userRepository;
    this.jwtAuthService = jwtAuthService;
  }

  async execute({ email, otp }) {
    const valid = await this.otpService.verify(email, otp);
    if (!valid) {
      throw new Error('Invalid or expired OTP');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    const token = this.jwtAuthService.generateToken(user);
    const refreshToken = this.jwtAuthService.generateRefreshToken(user);
    return { token, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}

module.exports = VerifyOtpUseCase;
