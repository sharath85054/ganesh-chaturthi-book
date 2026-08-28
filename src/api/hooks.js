import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './client'

export function useStats() {
  return useQuery({ queryKey: ['stats'], queryFn: api.getStats })
}

export function useMembers(params) {
  return useQuery({
    queryKey: ['members', params],
    queryFn: () => api.getMembers(params),
  })
}

export function useCreateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateMember(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteMember() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteMember,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useContributions(params) {
  return useQuery({
    queryKey: ['contributions', params],
    queryFn: () => api.getContributions(params),
  })
}

export function useCreateContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createContribution,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contributions'] })
      qc.invalidateQueries({ queryKey: ['members'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteContribution() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteContribution,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contributions'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useEvents(params) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => api.getEvents(params),
  })
}

export function useCreateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useUpdateEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateEvent(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useDeleteEvent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteEvent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['events'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useFestivalDays() {
  return useQuery({
    queryKey: ['festival-days'],
    queryFn: api.getFestivalDays,
  })
}

export function useCreateFestivalDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createFestivalDay,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['festival-days'] })
    },
  })
}

export function useUpdateFestivalDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => api.updateFestivalDay(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['festival-days'] })
    },
  })
}

export function useDeleteFestivalDay() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.deleteFestivalDay,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['festival-days'] })
    },
  })
}
