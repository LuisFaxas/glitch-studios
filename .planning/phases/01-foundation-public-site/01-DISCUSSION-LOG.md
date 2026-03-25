# Phase 1: Foundation + Public Site - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 1-Foundation + Public Site
**Areas discussed:** Homepage layout, Visual identity, Navigation + pages, Content approach

---

## Homepage Layout

### Hero Section
| Option | Description | Selected |
|--------|-------------|----------|
| Video showreel | Auto-playing muted video with glitch text overlay + CTA buttons | |
| Animated text | Big GLITCH logo with glitch/distortion animation, no video | |
| Split layout | Video on one side, text/CTAs on the other | |
| Other | Hybrid of video showreel + split layout | ✓ |

**User's choice:** "both 1 and 3 hybrid tastefully" — video showreel background with split text overlay
**Notes:** Dual CTAs (Book a Session + Browse Beats) both equally prominent

### Sections Below Hero
| Option | Description | Selected |
|--------|-------------|----------|
| Services overview | Cards or grid showing services with CTAs | ✓ |
| Featured beats | Embla carousel of latest/featured beats | ✓ |
| Video portfolio | Grid or carousel of recent video work | ✓ |
| Testimonials | Client quotes in carousel or grid | ✓ |

**User's choice:** All four sections, in order: Services → Beats → Portfolio → Testimonials

### Hero Viewport Height
| Option | Description | Selected |
|--------|-------------|----------|
| Full viewport | 100vh immersive | |
| 80% height | Hints at content below | |
| You decide | Claude picks | ✓ |

### Section Style
| Option | Description | Selected |
|--------|-------------|----------|
| Full-width blocks | Each section spans full width | |
| Contained cards | Max-width container with card panels | ✓ |
| Mix | Some full-width, some contained | |

### Scroll Feel
| Option | Description | Selected |
|--------|-------------|----------|
| Smooth scroll-in | Framer Motion intersection observer | |
| Parallax layers | Background elements at different speeds | |
| Both + glitch | Scroll animations + glitch effects on transitions | ✓ |

---

## Visual Identity

### GLITCH Logo
| Option | Description | Selected |
|--------|-------------|----------|
| Animated on load | Glitches on load then settles | |
| Always glitching | Subtle continuous animation | |
| Hover only | Clean logo, glitches on hover | |
| Other | Recreate in CSS/SVG, animate on load + subtle continuous | ✓ |

**User's choice:** "recreate the logo as good as you can, dont use the png, is bad quality, so do your best until i have the real vector logo. animate on load, with always glitching conservatively."

### Color Accent
| Option | Description | Selected |
|--------|-------------|----------|
| Pure B&W | No accent, monochrome only | |
| Matrix green | Dark green accent like flyer | |
| White glow | White elements with soft glow | |
| Other | "black and white, white glow, and OFF WHITE!" | ✓ |

**User's choice:** B&W + off-white + white glow. No color accents.

### Glass Panels
| Option | Description | Selected |
|--------|-------------|----------|
| Yes, key element | Frosted glass throughout | |
| Subtle use | Glass for featured content only | |
| Skip glass | Pure flat design | ✓ |

### Typography
| Option | Description | Selected |
|--------|-------------|----------|
| Bold display | Heavy weight display font | |
| Monospace tech | Code-style mono for headings | ✓ |
| Clean modern | Inter/DM Sans throughout | |

---

## Navigation + Pages

### Nav Style
| Option | Description | Selected |
|--------|-------------|----------|
| Fixed top bar | Sticky nav at top | |
| Hide on scroll | Hides down, shows up | |
| Side nav | Vertical navigation on left | ✓ |

### Nav Items
| Option | Description | Selected |
|--------|-------------|----------|
| Beats | Beat catalog/store | ✓ |
| Services | Studio services with booking | ✓ |
| Portfolio | Video/audio showcase | ✓ |
| About | Team profiles, studio info, blog | ✓ |

### Mobile Nav
| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger + slide | Full-screen or slide-in menu | |
| Bottom tab bar | Fixed bottom navigation like mobile app | ✓ |

### Side Nav Style
| Option | Description | Selected |
|--------|-------------|----------|
| Slim icons | Icons only, expands on hover | |
| Full labels | Always showing icon + text | |
| Collapsible | Toggle between icon-only and full | ✓ |

### Service Pages
| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated pages | Each service gets own full page | |
| Single page tabs | One page with tabs switching services | ✓ |
| Cards + modal | Cards expanding into modals | |

### Portfolio View
| Option | Description | Selected |
|--------|-------------|----------|
| Masonry grid | Pinterest-style staggered grid | |
| Full-width rows | Each project full-width with video + text | |
| Carousel focus | Embla carousel as main navigation | ✓ |

### Artist Profiles
| Option | Description | Selected |
|--------|-------------|----------|
| Bio + photo | Name, role, bio, photo | ✓ |
| Credits/work | Projects, beats, productions | ✓ |
| Social links | Instagram, Twitter, SoundCloud, etc. | ✓ |
| Embedded audio | Featured tracks playable on profile | ✓ |

---

## Content Approach

### Blog Management
| Option | Description | Selected |
|--------|-------------|----------|
| Database-driven | Posts in DB, edited from admin dashboard | ✓ |
| MDX files | Markdown files in repo | |

### Media Hosting
| Option | Description | Selected |
|--------|-------------|----------|
| Vercel Blob | Built-in, simple, pay-as-you-go | |
| Cloudflare R2 | Cheap, no egress fees | ✓ |

### Video Hosting
| Option | Description | Selected |
|--------|-------------|----------|
| YouTube embeds | Free, SEO benefits | |
| Self-hosted | Full control, custom player | |
| YouTube + self | YouTube for public, self-hosted for premium | ✓ |

---

## Claude's Discretion

- Hero viewport height
- Exact monospace font selection
- Scroll animation timing/intensity
- Side nav widths
- Footer design

## Deferred Ideas

None — discussion stayed within phase scope
