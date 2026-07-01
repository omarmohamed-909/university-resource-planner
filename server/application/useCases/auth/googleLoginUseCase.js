const bcrypt = require('bcryptjs');

class GoogleLoginUseCase {
  constructor({ userRepository, authService: jwtAuthService, googleAuthService }) {
    this.userRepository = userRepository;
    this.jwtAuthService = jwtAuthService;
    this.googleAuthService = googleAuthService;
  }

  async execute({ idToken, credential }) {
    // الـ GoogleLogin component يُرسل الـ token في حقل `credential`
    const idTokenValue = credential || idToken;
    if (!idTokenValue) throw new Error('Google ID token is required');

    // verifyIdToken وليس verifyAccessToken — credential هو ID Token (JWT)
    const googleUser = await this.googleAuthService.verifyIdToken(idTokenValue);

    if (!googleUser.emailVerified) {
      throw new Error('بريدك الإلكتروني على Google غير موثق');
    }

    let user = await this.userRepository.findByEmail(googleUser.email);

    if (!user) {
      const randomPassword = await bcrypt.hash(`google_${googleUser.googleId}_${Date.now()}`, 10);
      const UserEntity = require('../../../domain/entities/userEntity');
      const newUser = new UserEntity({
        name: googleUser.name,
        email: googleUser.email,
        password: randomPassword,
        role: 'student',
        isActive: true,
        googleId: googleUser.googleId,
        picture: googleUser.picture,
      });
      user = await this.userRepository.save(newUser);
    }

    if (!user.isActive) {
      throw new Error('حسابك غير نشط. تواصل مع مدير النظام');
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
        picture: googleUser.picture,
      },
    };
  }
}

module.exports = GoogleLoginUseCase;
