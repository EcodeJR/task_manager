"use client"

import React from "react"
import { cn } from "../../lib/utils"

const Tabs = ({ defaultValue, value, onValueChange, children, ...props }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue || value)

  const handleValueChange = (newValue) => {
    setActiveTab(newValue)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div {...props}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { activeTab, onValueChange: handleValueChange }),
      )}
    </div>
  )
}

const TabsList = ({ className, children, activeTab, onValueChange, ...props }) => {
  // Remove onValueChange from props to prevent leaking to DOM
  const { onValueChange: _ignored, ...restProps } = props;
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className,
      )}
      {...restProps}
    >
      {React.Children.map(children, (child) => React.cloneElement(child, { activeTab, onValueChange }))}
    </div>
  );
};

const TabsTrigger = ({ className, children, value, activeTab, onValueChange, ...props }) => {
  // Remove onValueChange from props to prevent leaking to DOM
  const { onValueChange: _ignored, ...restProps } = props;
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        activeTab === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
      onClick={() => onValueChange(value)}
      {...restProps}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ className, children, value, activeTab, ...props }) => {
  if (activeTab !== value) return null;
  // Remove onValueChange from props to prevent leaking to DOM
  const { onValueChange: _ignored, ...restProps } = props;
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
      {...restProps}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent }
