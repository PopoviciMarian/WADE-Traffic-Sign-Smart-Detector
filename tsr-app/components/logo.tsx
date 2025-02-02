import { AlertTriangle } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <AlertTriangle className="h-6 w-6 text-accent dark:text-primary-a30" />
      <span className="font-bold text-lg text-accent dark:text-primary-a30">Traffic Sign Recognition</span>
    </div>
  )
}

