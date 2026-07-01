import { create } from 'zustand'
import api from '../../infrastructure/api/axios'

export const useHallStore = create((set) => ({
  halls: [],
  loading: false,

  fetchHalls: async (filter = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filter).toString()
      const { data } = await api.get(`/halls${params ? `?${params}` : ''}`)
      set({ halls: Array.isArray(data.data) ? data.data : (data.data || []), loading: false })
    } catch (error) {
      set({ loading: false })
      console.error('[hallStore] fetchHalls failed:', error?.response?.data?.message || error?.message)
    }
  },

  createHall: async (hallData) => {
    const { data } = await api.post('/halls', hallData)
    set(s => ({ halls: [...s.halls, data.data] }))
    return data.data
  },

  updateHall: async (id, hallData) => {
    const { data } = await api.put(`/halls/${id}`, hallData)
    set(s => ({ halls: s.halls.map(h => h.id === id ? data.data : h) }))
    return data.data
  },

  deleteHall: async (id) => {
    await api.delete(`/halls/${id}`)
    set(s => ({ halls: s.halls.filter(h => h.id !== id) }))
  }
}))
