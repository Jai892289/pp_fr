"use client"

import { useEffect, useRef, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SuccessMessageProps {
  message: string
  show: boolean
  onClose: () => void
  duration?: number
  className?: string
  title?: string
  closeOnOverlay?: boolean
}

export function SuccessMessage({
  message,
  show,
  onClose,
  duration = 3000,
  className = "",
  title = "Success",
  closeOnOverlay = true,
}: SuccessMessageProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Auto-close after duration
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [show, duration, onClose])

  // Focus for accessibility
  useEffect(() => {
    if (show) requestAnimationFrame(() => panelRef.current?.focus())
  }, [show])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
            onClick={() => closeOnOverlay && onClose()}
          />

          {/* Dialog Container */}
          <motion.div
            key="success-dialog"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              key="panel"
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="success-title"
              aria-describedby="success-desc"
              tabIndex={-1}
              onKeyDown={onKeyDown}
              initial={{ y: 16, scale: 0.98, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 8, scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className={[
                // Layout similar to your dialog component
                "relative w-full sm:max-w-md md:max-w-lg rounded-2xl shadow-2xl border-0",
                "bg-background backdrop-blur-sm",
                "flex flex-col items-center p-6 sm:p-8 space-y-4",
                className,
              ].join(" ")}
            >
              {/* Floating Success Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-lg ring-4 ring-white">
                <Check className="h-7 w-7 text-white" strokeWidth={3} />
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-2 mt-2">
                <h3
                  id="success-title"
                  className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight"
                >
                  {title}
                </h3>
                <p
                  id="success-desc"
                  className="text-sm sm:text-base text-gray-600 leading-relaxed"
                >
                  {message}
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                <Button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 rounded-md font-medium bg-green-600 hover:bg-green-700 text-white shadow-md transition-all"
                >
                  OK
                </Button>
              </div>

              {/* Close Button (top-right) */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-white/50 focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
