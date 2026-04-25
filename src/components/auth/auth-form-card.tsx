import { GlitchHeading } from "@/components/ui/glitch-heading"

interface AuthFormCardProps {
  heading: string
  subhead?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthFormCard({ heading, subhead, children, footer }: AuthFormCardProps) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="font-mono uppercase tracking-[0.05em] text-[20px] leading-[1.2] font-semibold">
          <GlitchHeading text={heading}>{heading}</GlitchHeading>
        </h1>
        {subhead && (
          <p className="text-[16px] leading-[1.5] text-[var(--muted-foreground)] font-sans">
            {subhead}
          </p>
        )}
      </header>

      <div className="flex flex-col gap-4">{children}</div>

      {footer && (
        <footer className="flex flex-col gap-2 text-[16px] text-[var(--muted-foreground)]">
          {footer}
        </footer>
      )}
    </div>
  )
}
