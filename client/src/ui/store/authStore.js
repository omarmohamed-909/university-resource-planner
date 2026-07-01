import { create } from 'zustand'
import api from '../../infrastructure/api/axios'
import { connectSocket, joinUser, disconnectSocket } from '../../infrastructure/socket/socketClient'
import { setToken, setUser, setRefreshToken, clearAuth, getUser, getToken } from '../../infrastructure/storage/authStorage'

export const useAuthStore = create((set, get) => ({
  user: getUser(),
  token: getToken(),
  loading: false,

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const user = { ...data.user, role: data.user.role?.toLowerCase() }
      setToken(data.token)
      if (data.refreshToken) setRefreshToken(data.refreshToken)
      setUser(user)
      set({ user, token: data.token, loading: false })
      connectSocket()
      joinUser(user.id)
      return user
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  googleLogin: async (credential) => {
    set({ loading: true })
    try {
      // credential هو ID Token (JWT) القادم من GoogleLogin component
      const { data } = await api.post('/auth/google', { credential })
      const user = { ...data.user, role: data.user.role?.toLowerCase() }
      setToken(data.token)
      if (data.refreshToken) setRefreshToken(data.refreshToken)
      setUser(user)
      set({ user, token: data.token, loading: false })
      connectSocket()
      joinUser(user.id)
      return user
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  register: async (userData) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/auth/register', userData)
      const user = { ...data.user, role: data.user.role?.toLowerCase() }
      setToken(data.token)
      if (data.refreshToken) setRefreshToken(data.refreshToken)
      setUser(user)
      set({ user, token: data.token, loading: false })
      connectSocket()
      joinUser(user.id)
      return user
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },

  logout: () => {
    disconnectSocket()
    clearAuth()
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = getToken()
    if (!token) return
    try {
      const { data } = await api.get('/auth/me')
      const user = { ...data.data, role: data.data.role?.toLowerCase() }
      setUser(user)
      set({ user })
      connectSocket()
      joinUser(user.id)
    } catch {
      clearAuth()
      set({ user: null, token: null })
    }
  }
}))
