/**
 * smoke tests — LoginPage
 * يتحقق من أن صفحة تسجيل الدخول ترندر بدون أخطاء
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock heavy dependencies ───────────────────────────────────────────────────
vi.mock('../ui/store/authStore', () => ({
  useAuthStore: (selector) => selector({
    login: vi.fn(),
    googleLogin: vi.fn(),
    user: null,
    token: null,
  }),
}));

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => null,
  GoogleOAuthProvider: ({ children }) => children,
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

vi.mock('../ui/components/ui/QnuLogo', () => ({
  default: () => <div data-testid="qnu-logo" />,
}));

vi.mock('../ui/components/LanguageSwitcher', () => ({
  default: () => null,
}));

vi.mock('../ui/components/DarkModeToggle', () => ({
  default: () => null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'ar', changeLanguage: vi.fn() },
  }),
}));

// ── Import component under test ───────────────────────────────────────────────
import LoginPage from '../ui/pages/auth/LoginPage';

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(document.body).toBeTruthy();
  });

  it('renders email and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByPlaceholderText('auth.login.emailPlaceholder')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('auth.login.passwordPlaceholder')).toBeInTheDocument();
  });

  it('renders the sign-in button', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    // The submit button contains the i18n key text
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders a link to the register page', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /auth.login.createAccount/i })).toBeInTheDocument();
  });
});
