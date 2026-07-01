import { create } from 'zustand'
import api from '../../infrastructure/api/axios'

export const useScheduleStore = create((set) => ({
  schedules: [],
  loading: false,

  fetchSchedules: async (params = {}) => {
    set({ loading: true })
    try {
      const query = new URLSearchParams(params).toString()
      const { data } = await api.get(`/schedules${query ? `?${query}` : ''}`)
      set({ schedules: Array.isArray(data.data) ? data.data : (data.data || []), loading: false })
    } catch (error) {
      set({ loading: false })
      // لا نعيد throw هنا — الصفحة تستمر بـ schedules: []
      console.error('[scheduleStore] fetchSchedules failed:', error?.response?.data?.message || error?.message)
    }
  },

  createSchedule: async (scheduleData) => {
    const { data } = await api.post('/schedules', scheduleData)
    set(s => ({ schedules: [...s.schedules, data.data] }))
    return data.data
  },

  updateSchedule: async (id, scheduleData) => {
    const { data } = await api.put(`/schedules/${id}`, scheduleData)
    set(s => ({ schedules: s.schedules.map(sch => sch.id === id ? data.data : sch) }))
    return data.data
  },

  deleteSchedule: async (id) => {
    await api.delete(`/schedules/${id}`)
    set(s => ({ schedules: s.schedules.filter(sch => sch.id !== id) }))
  },

  /** dryRun=true → preview without saving */
  autoGenerate: async (semester, dryRun = false, gaParams = {}) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/schedules/auto-generate', { semester, dryRun, ...gaParams })
      const schedules = !dryRun && Array.isArray(data.data?.schedules) ? data.data.schedules : []
      if (!dryRun) set({ schedules, loading: false })
      else set({ loading: false })
      return data.data
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
}))
