/**
 * smoke tests — ProtectedRoute
 * يتحقق من أن الـ ProtectedRoute يوجّه المستخدم غير المسجّل إلى صفحة تسجيل الدخول
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../ui/store/authStore';

// ── Mock: start unauthenticated, tests can override ──────────────────────────
let mockUser = null;

vi.mock('../ui/store/authStore', () => ({
  useAuthStore: (selector) => selector({
    user: mockUser,
    login: vi.fn(),
    googleLogin: vi.fn(),
    token: null,
    checkAuth: vi.fn().mockResolvedValue(null),
  }),
}));

// ── Inline ProtectedRoute (mirrors App.jsx logic) ────────────────────────────
function ProtectedRoute({ children, role }) {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    mockUser = null;

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div data-testid="login-page">Login</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <div>Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
  });

  it('renders children when user has the correct role', () => {
    mockUser = { role: 'admin', id: '1', name: 'Admin' };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/login" element={<div>Login</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <div data-testid="admin-content">Admin Dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('redirects when role does not match', () => {
    mockUser = { role: 'student', id: '2', name: 'Student' };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/student" element={<div data-testid="student-page">Student</div>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <div>Admin Only</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('student-page')).toBeInTheDocument();
  });
});
