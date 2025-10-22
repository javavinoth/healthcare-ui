import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white hover:bg-primary/80",
        secondary:
          "border-transparent bg-neutral-blue-gray/20 text-neutral-blue-gray hover:bg-neutral-blue-gray/30",
        success:
          "border-transparent bg-wellness text-white hover:bg-wellness/80",
        warning:
          "border-transparent bg-warning text-white hover:bg-warning/80",
        destructive:
          "border-transparent bg-error text-white hover:bg-error/80",
        info:
          "border-transparent bg-info text-white hover:bg-info/80",
        outline: "text-foreground",
      } as const,
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
