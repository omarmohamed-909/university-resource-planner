const { Router } = require('express');
const validateMiddleware = require('../middleware/validateMiddleware');
const { loginSchema, registerSchema, verifyOtpSchema, generateOtpSchema, refreshSchema, googleSchema } = require('../validators/authValidator');

function authRoutes(container) {
  const router = Router();
  const controller = container.resolve('authController');
  const auth = container.resolve('authMiddleware');

  router.post('/login',        validateMiddleware(loginSchema),       (req, res, next) => controller.login(req, res, next));
  router.post('/register',     validateMiddleware(registerSchema),    (req, res, next) => controller.register(req, res, next));
  router.post('/otp/generate', validateMiddleware(generateOtpSchema), (req, res, next) => controller.generateOtp(req, res, next));
  router.post('/otp/verify',   validateMiddleware(verifyOtpSchema),   (req, res, next) => controller.verifyOtp(req, res, next));
  router.post('/refresh',      validateMiddleware(refreshSchema),     (req, res, next) => controller.refresh(req, res, next));
  router.get( '/me',           auth,                                  (req, res, next) => controller.me(req, res, next));
  router.post('/google',       validateMiddleware(googleSchema),      (req, res, next) => controller.googleLogin(req, res, next));

  return router;
}

module.exports = authRoutes;
