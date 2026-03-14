export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export interface ConfirmOptions {
  title: string
  message: string
  danger?: boolean
}
