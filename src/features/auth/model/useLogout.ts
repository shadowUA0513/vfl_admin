import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { logout, useSessionStore } from '@/entities/session'

export function useLogout() {
  const signOut = useSessionStore((state) => state.signOut)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useCallback(async () => {
    await logout()
    signOut()
    /* Drop every cached query, not just the session: the next person to sign
       in on this machine must not see the previous user's data flash on
       screen before their own requests resolve. */
    queryClient.clear()
    navigate('/login', { replace: true })
  }, [signOut, queryClient, navigate])
}
