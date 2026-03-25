import Link from "next/link"
import type { TeamMember } from "@/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function ArtistCard({ member }: { member: TeamMember }) {
  return (
    <Link
      href={`/artists/${member.slug}`}
      className="block bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-600 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all"
    >
      {/* Photo area */}
      <div className="relative aspect-square bg-gray-800">
        {member.photoUrl ? (
          <img
            src={member.photoUrl}
            alt={member.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <span className="font-mono font-bold text-4xl text-gray-600">
              {getInitials(member.name)}
            </span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className="p-4 space-y-1">
        <h3 className="font-mono font-bold text-lg text-white">
          {member.name}
        </h3>
        <p className="text-gray-400 text-sm">{member.role}</p>
        {member.bio && (
          <p className="text-gray-400 text-sm line-clamp-2">{member.bio}</p>
        )}
      </div>
    </Link>
  )
}
