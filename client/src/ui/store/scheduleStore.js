import { create } from 'zustand'
import api from '../../infrastructure/api/axios'

export const useScheduleStore = create((set) => ({
  schedules: [],
  pagination: { page: 1, pages: 1, total: 0, limit: 20 },
  loading: false,

  fetchSchedules: async (params = {}) => {
    set({ loading: true })
    try {
      const query = new URLSearchParams(params).toString()
      const { data } = await api.get(`/schedules${query ? `?${query}` : ''}`)
      set({
        schedules: Array.isArray(data.data) ? data.data : (data.data || []),
        pagination: data.pagination || { page: 1, pages: 1, total: data.data?.length || 0, limit: 20 },
        loading: false,
      })
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
      let result = data.data
      if (result?.jobId) {
        const deadline = Date.now() + 10 * 60 * 1000
        while (Date.now() < deadline) {
          await new Promise(resolve => setTimeout(resolve, 1500))
          const response = await api.get(`/schedules/auto-generate/jobs/${result.jobId}`)
          const job = response.data.data
          if (job.status === 'completed') {
            result = job.result
            break
          }
          if (job.status === 'failed') throw new Error(job.error || 'Schedule generation failed')
        }
        if (result?.jobId) throw new Error('Schedule generation timed out')
      }
      const schedules = !dryRun && Array.isArray(result?.schedules) ? result.schedules : []
      if (!dryRun) set({ schedules, loading: false })
      else set({ loading: false })
      return result
    } catch (error) {
      set({ loading: false })
      throw error
    }
  },
}))
