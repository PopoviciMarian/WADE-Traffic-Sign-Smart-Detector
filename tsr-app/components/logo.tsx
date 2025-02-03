import { AlertTriangle } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
      <span className="font-bold text-lg text-yellow-800 dark:text-yellow-100 hidden sm:inline">
        Traffic Sign Recognition
      </span>
      <span className="font-bold text-lg text-yellow-800 dark:text-yellow-100 sm:hidden">TSR</span>
    </div>
  )
}
