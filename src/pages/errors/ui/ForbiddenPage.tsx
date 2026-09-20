import { Button } from '@mantine/core'
import { useNavigate } from 'react-router'
import { useSessionStore } from '@/entities/session'
import { ErrorShell } from './ErrorShell'

export function ForbiddenPage() {
  const navigate = useNavigate()
  const user = useSessionStore((state) => state.user)

  return (
    <ErrorShell
      code="403"
      title="Not Your Clearance"
      body={`This area needs a higher role than ${user?.role ?? 'yours'}. Ask a superadmin if you think that's wrong.`}
      action={
        <Button onClick={() => navigate('/dashboard', { replace: true })}>
          Back to Dashboard
        </Button>
      }
    />
  )
}
