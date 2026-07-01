class AuthController {
  constructor({ loginUseCase, registerUseCase, verifyOtpUseCase, refreshTokenUseCase, otpService, userRepository, googleLoginUseCase }) {
    this.loginUseCase = loginUseCase;
    this.registerUseCase = registerUseCase;
    this.verifyOtpUseCase = verifyOtpUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.otpService = otpService;
    this.userRepository = userRepository;
    this.googleLoginUseCase = googleLoginUseCase;
  }

  async login(req, res, next) {
    try {
      const result = await this.loginUseCase.execute(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async register(req, res, next) {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async generateOtp(req, res, next) {
    try {
      const { email } = req.body;
      await this.otpService.generate(email);
      res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const result = await this.verifyOtpUseCase.execute(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const result = await this.refreshTokenUseCase.execute(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const user = await this.userRepository.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.json({
        success: true,
        data: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
      });
    } catch (error) {
      next(error);
    }
  }

  async googleLogin(req, res, next) {
    try {
      const result = await this.googleLoginUseCase.execute(req.body);
      res.json({ success: true, ...result });
    } catch (error) {
      console.error('[Google Login Error]', error.message, error.stack?.split('\n')[1]);
      next(error);
    }
  }
}

module.exports = AuthController;
