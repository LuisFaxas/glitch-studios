// Plain template — framer-motion's `motion.div` + `key={pathname}` was kept
// here for the cross-brand flicker on navigation, but framer-motion's projection
// system runs on every render and accumulates internal state across rapid URL
// changes (filter chip clicks). On Webkit/Firefox this manifests as a cycle-2
// CPU runaway (WPEWebProcess pegged at 106% sustained). Page transition
// flicker is nice-to-have, not load-bearing.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="relative w-full">{children}</div>
}
