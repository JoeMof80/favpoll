import { Alert, AlertDescription } from "@/components/ui/alert"
import { CircleAlert } from "lucide-react"

export function EmptyPollAlert() {
  return (
    <Alert className="border-amber-500 text-sm text-amber-500">
      <CircleAlert />
      <AlertDescription className="text-amber-500">
        Add some items before sharing your favpoll link.
      </AlertDescription>
    </Alert>
  )
}
