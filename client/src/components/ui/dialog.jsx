import React, { useEffect, useRef } from "react"
// import { cn } from "../lib/utils"

export function Dialog({ open, onOpenChange, children }) {
  const overlayRef = useRef()

  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative z-10 w-full max-w-md rounded-lg bg-background p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>
}

export function DialogTitle({ children }) {
  return <h2 className="text-xl font-bold mb-2">{children}</h2>
}

export function DialogContent({ children }) {
  return <div>{children}</div>
}
