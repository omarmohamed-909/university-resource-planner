import { useState, useCallback } from 'react'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'

export function useConfirm() {
  const [state, setState] = useState({ open: false, message: '', resolve: null })

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setState({ open: true, message, resolve })
    })
  }, [])

  const handleConfirm = () => {
    state.resolve(true)
    setState({ open: false, resolve: null })
  }

  const handleCancel = () => {
    state.resolve(false)
    setState({ open: false, resolve: null })
  }

  const ConfirmModal = () => (
    <Modal isOpen={state.open} onClose={handleCancel} title="تأكيد الإجراء" size="sm">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-full bg-danger-50 shrink-0">
          <AlertTriangle className="w-5 h-5 text-danger-500" />
        </div>
        <div>
          <p className="text-slate-600">{state.message}</p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <Button variant="destructive" onClick={handleConfirm}>تأكيد</Button>
        <Button variant="outline" onClick={handleCancel}>إلغاء</Button>
      </div>
    </Modal>
  )

  return { confirm, ConfirmModal }
}
