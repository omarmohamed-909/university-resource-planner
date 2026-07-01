import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  return socket
}

export function connectSocket() {
  // دائماً نقرأ التوكن الحالي من localStorage — يتجدد بعد كل login
  const token = localStorage.getItem('token')

  // إذا الـ socket موجود وشغال ومعه نفس التوكن، لا نعيد الإنشاء
  if (socket && socket.connected && socket.auth?.token === token) {
    return socket
  }

  // أوقف الـ socket القديم قبل إنشاء جديد
  if (socket) {
    socket.disconnect()
    socket = null
  }

  socket = io('/', {
    transports: ['websocket', 'polling'],
    autoConnect: false,
    auth: { token }
  })

  socket.connect()
  return socket
}

export function disconnectSocket() {
  if (socket && socket.connected) {
    socket.disconnect()
  }
  socket = null
}

export function joinHall(hallId) {
  const s = getSocket()
  if (s) s.emit('join:hall', hallId)
}

export function leaveHall(hallId) {
  const s = getSocket()
  if (s) s.emit('leave:hall', hallId)
}

export function joinUser(userId) {
  const s = getSocket()
  if (s) s.emit('join:user', userId)
}
