import { useState, useEffect } from 'react'
import i18n from '../../lib/i18n'
import api from '../../../infrastructure/api/axios'

export function useHallAvailability(halls) {
  const [schedules, setSchedules] = useState([])

  useEffect(() => {
    if (!halls?.length) return

    const today = new Date()
    const dayMap = {
      sunday: 'sunday', monday: 'monday', tuesday: 'tuesday',
      wednesday: 'wednesday', thursday: 'thursday', friday: 'friday', saturday: 'saturday'
    }
    const dayName = dayMap[today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]

    const fetchSchedule = () => {
      api.get('/schedules')
        .then(r => {
          const all = r.data.data || []
          const todaySchedules = all.filter(s => s.day === dayName && s.hallId)
          setSchedules(todaySchedules)
        })
        .catch(() => {})
    }

    fetchSchedule()
    const interval = setInterval(fetchSchedule, 60000)

    return () => clearInterval(interval)
  }, [halls?.length])

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const availabilityMap = {}
  if (halls) {
    halls.forEach(hall => {
      const hallSchedules = schedules.filter(s => {
        const hallId = s.hallId?._id || s.hallId?.id || s.hallId
        return hallId === hall.id || hallId === hall._id
      })

      if (hallSchedules.length === 0) {
        availabilityMap[hall.id || hall._id] = { status: 'unknown', label: i18n.t('status.unknown') }
        return
      }

      let isCurrentlyOccupied = false
      let earliestUpcoming = null

      hallSchedules.forEach(s => {
        const [h, m] = (s.startTime || '00:00').split(':').map(Number)
        const [eh, em] = (s.endTime || '00:00').split(':').map(Number)
        const start = h * 60 + m
        const end = eh * 60 + em

        if (currentMinutes >= start && currentMinutes <= end) {
          isCurrentlyOccupied = true
        } else if (currentMinutes < start) {
          if (!earliestUpcoming || start < earliestUpcoming.start) {
            earliestUpcoming = { start, startTime: s.startTime, endTime: s.endTime, course: s.courseId }
          }
        }
      })

      if (isCurrentlyOccupied) {
        availabilityMap[hall.id || hall._id] = { status: 'occupied', label: i18n.t('status.occupied') }
      } else if (earliestUpcoming) {
        availabilityMap[hall.id || hall._id] = { status: 'available', label: i18n.t('status.availableUntil', { time: earliestUpcoming.startTime }), nextLecture: earliestUpcoming.startTime }
      } else {
        availabilityMap[hall.id || hall._id] = { status: 'available', label: i18n.t('status.availableToday'), nextLecture: null }
      }
    })
  }

  return availabilityMap
}