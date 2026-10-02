import { notifications } from '@mantine/notifications'

/* One look for every toast in the admin. `id` lets a repeated failure
   replace its earlier toast instead of stacking a column of identical ones. */

export function notifySuccess(message: string, id?: string): void {
  notifications.show({ id, message, color: 'green', autoClose: 3000 })
}

export function notifyError(message: string, title = 'Error', id?: string): void {
  notifications.show({ id, title, message, color: 'vflRed', autoClose: 6000 })
}
