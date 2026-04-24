import Link from "next/link"

interface RubricVersionBadgeProps {
  version: string
}

export function RubricVersionBadge({ version }: RubricVersionBadgeProps) {
  return (
    <Link
      href="/tech/methodology#rubric-changelog"
      aria-label={`Rubric version ${version}. See changelog.`}
      className="inline-flex items-center border border-[#f5f5f0] bg-transparent px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-[#f5f5f0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
    >
      RUBRIC v{version}
    </Link>
  )
}
