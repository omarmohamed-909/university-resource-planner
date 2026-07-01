import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

let refreshRequest = null

function clearStoredAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('refreshToken')
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const isAuthRefresh = originalRequest?.url === '/auth/refresh'

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRefresh) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        originalRequest._retry = true
        try {
          refreshRequest = refreshRequest || api.post('/auth/refresh', { refreshToken })
          const { data } = await refreshRequest
          refreshRequest = null

          localStorage.setItem('token', data.token)
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
          if (data.user) localStorage.setItem('user', JSON.stringify({ ...data.user, role: data.user.role?.toLowerCase() }))
          originalRequest.headers.Authorization = `Bearer ${data.token}`
          return api(originalRequest)
        } catch {
          refreshRequest = null
          clearStoredAuth()
          // تأخير بسيط عشان الـ toast يظهر قبل الـ redirect
          setTimeout(() => window.location.replace('/login'), 100)
          return Promise.reject(error)
        }
      }

      clearStoredAuth()
      setTimeout(() => window.location.replace('/login'), 100)
    }
    return Promise.reject(error)
  }
)

export default api
