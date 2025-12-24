"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive" | "success"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function Toast({ 
  title, 
  description, 
  variant = "default", 
  open = true, 
  onOpenChange 
}: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(open)

  React.useEffect(() => {
    setIsVisible(open)
  }, [open])

  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onOpenChange?.(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onOpenChange])

  const handleClose = () => {
    setIsVisible(false)
    onOpenChange?.(false)
  }

  if (!isVisible) return null

  const getIcon = () => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800"
      case "destructive":
        return "border-red-200 bg-red-50 text-red-800"
      default:
        return "border-gray-200 bg-white text-gray-900"
    }
  }

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-md border p-4 shadow-lg transition-all duration-300 ease-in-out",
        getVariantClasses(),
        isVisible ? "animate-in slide-in-from-top-2" : "animate-out slide-out-to-top-2"
      )}
    >
      {getIcon()}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-semibold">{title}</div>
        )}
        {description && (
          <div className="mt-1 text-sm opacity-90">{description}</div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="inline-flex rounded-md p-1.5 transition-colors hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}
