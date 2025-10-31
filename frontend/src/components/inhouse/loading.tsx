import { cn } from "@/lib/utils"

type FullScreenLoaderProps = {
  message?: string
  progress?: number
  className?: string
}

export default function FullScreenLoader({
  message = "Loading…", className,
}: FullScreenLoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-0 z-9999 grid place-items-center bg-background/70 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-sm">
        {/* Spinner */}
        <div className="relative">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
        </div>

        {/* Message */}
        <p className="text-sm text-muted-foreground">{message}</p>

      </div>
    </div>
  )
}
