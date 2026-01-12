import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/80 active:scale-95",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:shadow-md hover:bg-secondary/80 active:scale-95",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:shadow-md hover:bg-destructive/80 active:scale-95",
        outline:
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground active:scale-95",
        success:
          "border-transparent bg-success text-success-foreground shadow-sm hover:shadow-md hover:bg-success/80 active:scale-95",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow-sm hover:shadow-md hover:bg-warning/80 active:scale-95",
        glass:
          "bg-background/50 backdrop-blur-md border-border/50 text-foreground shadow-sm hover:shadow-md hover:bg-accent/50 active:scale-95",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
