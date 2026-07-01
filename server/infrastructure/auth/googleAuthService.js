const { OAuth2Client } = require('google-auth-library');

class GoogleAuthService {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.client = this.clientId ? new OAuth2Client(this.clientId) : null;
  }

  verifyConfigured() {
    if (!this.client) {
      throw new Error('Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in .env');
    }
  }

  async verifyIdToken(idToken) {
    this.verifyConfigured();

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: this.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Invalid Google ID token');

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
    };
  }

  async verifyAccessToken(accessToken) {
    this.verifyConfigured();

    const info = await this.client.getTokenInfo(accessToken);
    if (!info) throw new Error('Invalid Google access token');

    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (!response.ok) throw new Error('Failed to fetch Google profile');

    const profile = await response.json();

    return {
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
      emailVerified: !!profile.email_verified,
    };
  }
}

module.exports = GoogleAuthService;
