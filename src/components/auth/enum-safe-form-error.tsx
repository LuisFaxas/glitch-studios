import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnumSafeFormErrorProps {
  message: string | null | undefined
}

export function EnumSafeFormError({ message }: EnumSafeFormErrorProps) {
  if (!message) return null
  return (
    <Alert variant="destructive">
      <AlertDescription className="text-[12px] leading-[1.5] font-sans">
        {message}
      </AlertDescription>
    </Alert>
  )
}
