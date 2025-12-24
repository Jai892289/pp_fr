"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ToggleLeft, ToggleRight, Loader2, AlertTriangle } from "lucide-react"

interface ToggleConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => Promise<void>
  isLoading?: boolean
  currentStatus: number
}

export function ToggleConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isLoading = false,
  currentStatus,
}: ToggleConfirmationDialogProps) {
  const [isToggling, setIsToggling] = useState(false)

  const handleConfirm = async () => {
    setIsToggling(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } catch (error) {
      // Error handling is done in the parent component
      console.error("Toggle operation failed:", error)
    } finally {
      setIsToggling(false)
    }
  }

  const handleClose = () => {
    if (!isToggling && !isLoading) {
      onOpenChange(false)
    }
  }

  const getStatusInfo = () => {
    if (currentStatus === 1) {
      return {
        icon: <ToggleRight className="h-8 w-8 text-green-600" />,
        bgColor: "bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200",
        action: "Deactivate",
        newStatus: "inactive",
        actionColor: "destructive" as const,
        iconBg: "bg-red-50 border-red-200",
        warningIcon: <AlertTriangle className="h-6 w-6 text-red-500" />,
      }
    } else {
      return {
        icon: <ToggleLeft className="h-8 w-8 text-gray-500" />,
        bgColor: "bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200",
        action: "Activate",
        newStatus: "active",
        actionColor: "success" as const,
        iconBg: "bg-green-50 border-green-200",
        warningIcon: <ToggleRight className="h-6 w-6 text-green-500" />,
      }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <DialogHeader className="text-left space-y-4 pb-2">
          <div className="flex flex-col items-start space-y-4">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full border-2 ${statusInfo.iconBg} shadow-sm`}
            >
              {statusInfo.warningIcon}
            </div>
          </div>

          <div className="space-y-1">
            <DialogTitle className="text-[20px] font-bold text-gray-900 text-left leading-tight">{title}</DialogTitle>
            <DialogDescription className="text-[16px] text-gray-600 text-left leading-relaxed">
              {description}
            </DialogDescription>
{/* 
            <div className="bg-gray-50 rounded-lg p-3 max-w-xs">
              <p className="text-[14px] text-gray-500 text-left mb-1">Status will change to:</p>
              <p className={`text-[16px] font-medium text-left ${currentStatus === 1 ? "text-red-600" : "text-green-600"}`}>
                {statusInfo.newStatus.toUpperCase()}
              </p>
            </div> */}
          </div>
        </DialogHeader>

        <DialogFooter className="flex-col space-y-3 pt-4">
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isToggling || isLoading}
              className="flex-1 h-11 rounded-sm border-2 hover:bg-gray-50 transition-all duration-200 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={statusInfo.actionColor}
              onClick={handleConfirm}
              disabled={isToggling || isLoading}
              className="flex-1 h-11 rounded-sm font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
            >
              {(isToggling || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {statusInfo.action}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
