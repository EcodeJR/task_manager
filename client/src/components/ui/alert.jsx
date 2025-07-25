import React from "react"
import { cn } from "../../lib/utils"

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border p-4",
      {
        // Default
        "bg-background text-foreground dark:bg-zinc-900 dark:text-zinc-100": variant === "default",
        // Destructive
        "bg-destructive/15 text-destructive border-destructive dark:bg-red-950 dark:text-red-200 dark:border-red-600": variant === "destructive",
        // Muted
        "bg-muted/50 text-foreground dark:bg-zinc-800/70 dark:text-zinc-200": variant === "muted",
        // Warning
        "border-amber-500/50 text-amber-700 bg-amber-50/50 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-400": variant === "warning",
      },
      className,
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }
