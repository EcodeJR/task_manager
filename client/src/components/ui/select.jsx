import React, { useState, useRef, useEffect } from "react"
import { cn } from "../../lib/utils"
import { ChevronDown } from "lucide-react"

const Select = ({ value, onValueChange, children, ...props }) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const contentRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (
        triggerRef.current && triggerRef.current.contains(e.target)
      ) {
        return
      }
      if (
        contentRef.current && contentRef.current.contains(e.target)
      ) {
        return
      }
      setOpen(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  // Provide context to children
  const context = {
    value,
    onValueChange: (val) => {
      onValueChange(val)
      setOpen(false)
    },
    open,
    setOpen,
    triggerRef,
    contentRef,
  }
  // Clone children and inject context
  const enhancedChildren = React.Children.map(children, (child) =>
    React.cloneElement(child, { selectContext: context })
  )
  return (
    <div className="relative" {...props}>
      {enhancedChildren}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, selectContext, ...props }, ref) => {
  return (
    <button
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={(node) => {
        if (ref) ref.current = node
        if (selectContext) selectContext.triggerRef.current = node
      }}
      type="button"
      tabIndex={0}
      aria-haspopup="listbox"
      aria-expanded={selectContext?.open}
      onClick={() => selectContext?.setOpen((o) => !o)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, selectContext, children }) => {
  // Show the selected item's label if provided
  if (children) return <span>{children}</span>
  // Otherwise, show the department name if selected
  if (selectContext?.value) {
    // Try to find the label from SelectContent's children
    const items = selectContext?.contentRef?.current?.querySelectorAll('[role="option"]')
    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].getAttribute('data-value') === selectContext.value) {
          return <span>{items[i].textContent}</span>
        }
      }
    }
    // Fallback to showing the value
    return <span>{selectContext.value}</span>
  }
  return <span className="text-muted-foreground">{placeholder}</span>
}

const SelectContent = ({ children, selectContext, ...props }) => {
  if (!selectContext?.open) return null
  return (
    <div
      className="absolute left-0 right-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md"
      ref={selectContext?.contentRef}
      {...props}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { selectContext })
      )}
    </div>
  )
}

const SelectItem = ({ children, value, selectContext, ...props }) => {
  const selected = selectContext?.value === value
  return (
    <div
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        selected && "bg-accent text-accent-foreground font-semibold"
      )}
      role="option"
      aria-selected={selected}
      tabIndex={0}
      data-value={value}
      onClick={() => selectContext?.onValueChange(value)}
      {...props}
    >
      {children}
      {selected && <span className="absolute left-2">✓</span>}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
