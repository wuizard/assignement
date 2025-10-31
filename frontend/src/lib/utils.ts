import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function statusBadgeColor(status?: string, selected?: boolean) {
  switch ((status ?? "").toLowerCase()) {
    case "done":
      return `border-emerald-300 text-[10px] select-none ${selected ? "bg-emerald-500 text-white" : "text-emerald-700"}`
    case "doing":
    case "in_progress":
      return `border-blue-300 text-[10px] select-none ${selected ? "bg-blue-500 text-white" : "text-blue-700"}`
    case "archived":
      return `border-amber-300 text-[10px] select-none ${selected ? "bg-amber-500 text-white" : "text-amber-700"}`
    default:
      return `border-primary-300 text-[10px] select-none ${selected ? "bg-primary text-white" : "text-primary-700"}`
  }
}

export function prettyStatus(status?: string) {
  if (!status) return "Todo"
  const s = status.toLowerCase()
  if (s === "in_progress") return "DOING"
  return s.toUpperCase()
}