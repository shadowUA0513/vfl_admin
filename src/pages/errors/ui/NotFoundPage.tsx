import { Button } from '@mantine/core'
import { useNavigate } from 'react-router'
import { ErrorShell } from './ErrorShell'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <ErrorShell
      code="404"
      title="No Such Page"
      body="The route you followed doesn't exist in the admin."
      action={
        <Button onClick={() => navigate('/dashboard', { replace: true })}>
          Back to Dashboard
        </Button>
      }
    />
  )
}
