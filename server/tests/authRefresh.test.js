const test = require('node:test');
const assert = require('node:assert/strict');
const JwtAuthService = require('../infrastructure/auth/jwtAuthService');
const RefreshTokenUseCase = require('../application/useCases/auth/refreshTokenUseCase');

test('refresh token use case issues a new token pair', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const authService = new JwtAuthService();
  const user = { id: 'user-1', name: 'Test User', email: 'test@example.com', role: 'student', isActive: true };
  const refreshToken = authService.generateRefreshToken(user);
  const useCase = new RefreshTokenUseCase({
    authService,
    userRepository: {
      findById: async () => user
    }
  });

  const result = await useCase.execute({ refreshToken });

  assert.ok(result.token);
  assert.ok(result.refreshToken);
  assert.equal(result.user.id, user.id);
});

test('refresh token use case rejects access tokens', async () => {
  process.env.JWT_SECRET = 'test-secret';
  const authService = new JwtAuthService();
  const token = authService.generateToken({ id: 'user-1', email: 'test@example.com', role: 'student' });
  const useCase = new RefreshTokenUseCase({
    authService,
    userRepository: {
      findById: async () => null
    }
  });

  await assert.rejects(
    () => useCase.execute({ refreshToken: token }),
    /Invalid or expired refresh token/
  );
});
