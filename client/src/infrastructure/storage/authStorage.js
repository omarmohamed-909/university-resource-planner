export function getToken() {
  return localStorage.getItem('token')
}

export function setToken(token) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

export function getUser() {
  try {
    const data = localStorage.getItem('user')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
}

export function removeUser() {
  localStorage.removeItem('user')
}

export function getRefreshToken() {
  return localStorage.getItem('refreshToken')
}

export function setRefreshToken(token) {
  localStorage.setItem('refreshToken', token)
}

export function clearAuth() {
  removeToken()
  removeUser()
  localStorage.removeItem('refreshToken')
}
