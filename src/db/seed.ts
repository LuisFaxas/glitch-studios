import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

async function seed() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  console.log("Seeding database...")

  // Seed services
  const servicesData: (typeof schema.services.$inferInsert)[] = [
    {
      name: "Studio Session",
      slug: "studio-session",
      type: "studio_session",
      description:
        "Book time in our professionally treated recording studio. Includes access to our mic locker, outboard gear, and an engineer to capture your vision. Whether you are tracking vocals, live instruments, or full bands, we have the setup to deliver radio-ready recordings.",
      shortDescription:
        "Professional recording with top-tier gear and engineering.",
      priceLabel: "From $50/hr",
      features: [
        "Acoustically treated live room and control room",
        "Neumann, AKG, and Shure mic collection",
        "Pro Tools and FL Studio available",
        "Session engineer included",
        "Comfortable lounge area",
      ],
      ctaText: "Book a Session",
      sortOrder: 0,
    },
    {
      name: "Mixing & Mastering",
      slug: "mixing-mastering",
      type: "mixing",
      description:
        "Get your tracks polished to industry standards. Our mixing engineers balance every element of your song for clarity and impact, while mastering ensures your final product translates across all playback systems from earbuds to club speakers.",
      shortDescription:
        "Industry-standard mixing and mastering for any genre.",
      priceLabel: "From $75/track",
      features: [
        "Stem mixing with unlimited revisions",
        "Analog-modeled processing chain",
        "Reference track matching",
        "Mastered for streaming platforms",
        "48-hour turnaround available",
      ],
      ctaText: "Get a Quote",
      sortOrder: 1,
    },
    {
      name: "Video Production",
      slug: "video-production",
      type: "video_production",
      description:
        "From concept to final cut, we produce music videos, promotional content, and visual storytelling that captures attention. Our team handles scripting, filming, editing, color grading, and VFX to deliver a finished product that stands out.",
      shortDescription: "End-to-end video production from concept to delivery.",
      priceLabel: "From $500/project",
      features: [
        "4K cinema camera package",
        "Professional lighting and grip",
        "Color grading and VFX",
        "Multiple location shoots",
        "Social media cutdowns included",
      ],
      ctaText: "Start a Project",
      sortOrder: 2,
    },
    {
      name: "SFX Design",
      slug: "sfx-design",
      type: "sfx",
      description:
        "Custom sound effects and audio design for your projects. From cinematic impacts to UI sounds, we create original audio that enhances your visual content and gives your brand a unique sonic identity.",
      shortDescription:
        "Custom sound effects and audio design for any medium.",
      priceLabel: "From $200/project",
      features: [
        "Original Foley and synthesis",
        "Game audio and UI sounds",
        "Cinematic impacts and transitions",
        "Podcast intros and stingers",
        "Delivered in multiple formats",
      ],
      ctaText: "Request SFX",
      sortOrder: 3,
    },
    {
      name: "Graphic Design",
      slug: "graphic-design",
      type: "graphic_design",
      description:
        "Album artwork, promotional graphics, social media assets, and brand identity design. We create visuals that match your sound and resonate with your audience, delivered in all formats you need for digital and print.",
      shortDescription: "Album art, promo graphics, and brand design.",
      priceLabel: "From $150/project",
      features: [
        "Album and single artwork",
        "Social media templates and assets",
        "Flyer and poster design",
        "Brand identity packages",
        "Print-ready and web-optimized files",
      ],
      ctaText: "Get Design Help",
      sortOrder: 4,
    },
  ]
  await db.insert(schema.services).values(servicesData)
  console.log("  Services seeded")

  // Seed team members
  const teamData: (typeof schema.teamMembers.$inferInsert)[] = [
    {
      name: "Trap Snyder",
      slug: "trap-snyder",
      role: "Founder / Lead Producer",
      bio: "Multi-genre producer and creative director with over a decade of experience in music production, mixing, and content creation. Specializes in hip-hop, trap, and cinematic scoring. Built Glitch Studios from the ground up to be a one-stop creative powerhouse.",
      socialLinks: JSON.stringify({
        instagram: "https://instagram.com/trapsnyder",
        twitter: "https://twitter.com/trapsnyder",
        soundcloud: "https://soundcloud.com/trapsnyder",
        youtube: "https://youtube.com/@trapsnyder",
      }),
      credits: JSON.stringify([
        { title: "Midnight Run", artist: "Various", year: 2025, role: "Producer" },
        { title: "Digital Dreams EP", artist: "Trap Snyder", year: 2024, role: "Producer / Mix" },
        { title: "City Lights", artist: "KB4ds", year: 2024, role: "Producer" },
      ]),
      sortOrder: 0,
    },
    {
      name: "Milli",
      slug: "milli",
      role: "Recording Engineer / Mix Engineer",
      bio: "Detail-oriented audio engineer with a passion for clean mixes and creative sound design. Handles tracking sessions and delivers polished mixes that bring out the best in every artist.",
      socialLinks: JSON.stringify({
        instagram: "https://instagram.com/milli_engineer",
        soundcloud: "https://soundcloud.com/milli",
      }),
      credits: JSON.stringify([
        { title: "Loud Pack", artist: "Chally", year: 2025, role: "Mix Engineer" },
        { title: "No Cap", artist: "Nelson", year: 2024, role: "Recording / Mix" },
      ]),
      sortOrder: 1,
    },
    {
      name: "Wolfy",
      slug: "wolfy",
      role: "Video Director / Editor",
      bio: "Visual storyteller who directs and edits music videos, promo content, and short films. Known for bold color grading, cinematic compositions, and quick turnarounds without compromising quality.",
      socialLinks: JSON.stringify({
        instagram: "https://instagram.com/wolfy_visuals",
        youtube: "https://youtube.com/@wolfyvisuals",
      }),
      credits: JSON.stringify([
        { title: "Midnight Run (Music Video)", artist: "Various", year: 2025, role: "Director / Editor" },
        { title: "Studio Tour 2024", artist: "Glitch Studios", year: 2024, role: "Director" },
      ]),
      sortOrder: 2,
    },
  ]
  await db.insert(schema.teamMembers).values(teamData)
  console.log("  Team members seeded")

  // Seed portfolio items
  const portfolioData: (typeof schema.portfolioItems.$inferInsert)[] = [
    {
      title: "Midnight Run - Official Music Video",
      slug: "midnight-run-music-video",
      type: "video",
      category: "music_video",
      description:
        "High-energy music video shot across multiple downtown locations. Features dynamic camera work, neon lighting, and cinematic color grading.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isYouTubeEmbed: true,
      isFeatured: true,
      sortOrder: 0,
    },
    {
      title: "Studio Tour 2024",
      slug: "studio-tour-2024",
      type: "video",
      category: "documentary",
      description:
        "Behind-the-scenes tour of Glitch Studios showcasing our gear, workflow, and creative process.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isYouTubeEmbed: true,
      isFeatured: true,
      sortOrder: 1,
    },
    {
      title: "Digital Dreams EP - Visualizer",
      slug: "digital-dreams-visualizer",
      type: "video",
      category: "music_video",
      description:
        "Custom audio-reactive visualizer created for the Digital Dreams EP release. Abstract geometry synced to the beat.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isYouTubeEmbed: true,
      sortOrder: 2,
    },
    {
      title: "Brand Promo - Loud Pack",
      slug: "brand-promo-loud-pack",
      type: "video",
      category: "commercial",
      description:
        "30-second promotional spot for artist Chally's Loud Pack project. Fast cuts, bold typography, and hard-hitting audio.",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      isYouTubeEmbed: true,
      sortOrder: 3,
    },
    {
      title: "KB4ds - City Lights Production",
      slug: "kb4ds-city-lights",
      type: "case_study",
      category: "music_video",
      description:
        "Full production case study from beat creation to final music video delivery.",
      clientName: "KB4ds",
      challenge:
        "The artist needed a cohesive visual and audio package for their debut single on a tight timeline and budget.",
      approach:
        "We handled everything in-house: beat production, vocal recording, mixing, mastering, music video direction, and editing. Two-day turnaround from studio to screen.",
      result:
        "Over 50K streams in the first month. The music video became the artist's most-watched content and led to three follow-up bookings.",
      isFeatured: true,
      sortOrder: 4,
    },
    {
      title: "Glitch Studios Rebrand",
      slug: "glitch-studios-rebrand",
      type: "case_study",
      category: "branding",
      description:
        "Complete brand identity overhaul for Glitch Studios including logo, color system, and visual language.",
      clientName: "Glitch Studios (Internal)",
      challenge:
        "The original branding did not reflect the studio's evolution from a bedroom setup to a professional creative agency.",
      approach:
        "Developed a cyberpunk-inspired visual identity system: flat black-and-white palette, glitch effects as brand texture, JetBrains Mono typography, and a custom animated logo.",
      result:
        "Unified brand presence across web, social media, and physical studio space. Client inquiries increased 40% after the rebrand launch.",
      isFeatured: true,
      sortOrder: 5,
    },
  ]
  await db.insert(schema.portfolioItems).values(portfolioData)
  console.log("  Portfolio items seeded")

  // Seed blog categories
  const categoryData: (typeof schema.blogCategories.$inferInsert)[] = [
    { name: "News", slug: "news" },
    { name: "Behind the Scenes", slug: "behind-the-scenes" },
    { name: "Production Tips", slug: "production-tips" },
  ]
  const insertedCategories = await db
    .insert(schema.blogCategories)
    .values(categoryData)
    .returning()
  console.log("  Blog categories seeded")

  // Seed blog posts
  const blogData: (typeof schema.blogPosts.$inferInsert)[] = [
    {
      title: "Welcome to Glitch Studios",
      slug: "welcome-to-glitch-studios",
      excerpt:
        "We are officially live. Here is what Glitch Studios is all about and what we have planned.",
      content:
        "<p>After months of building, testing, and refining, Glitch Studios is officially open for business. We are a full-service music and video production studio built for artists, creators, and brands who want professional results without the corporate feel.</p><p>Our services span studio recording, mixing and mastering, video production, sound effects design, and graphic design. Whether you are an independent artist dropping your first single or a brand looking for custom audio-visual content, we have the tools and the team to make it happen.</p><p>Stay tuned for more updates, behind-the-scenes content, and production tips.</p>",
      categoryId: insertedCategories[0].id,
      status: "published",
      publishedAt: new Date("2026-01-15"),
    },
    {
      title: "How We Mixed the Midnight Run EP",
      slug: "how-we-mixed-midnight-run",
      excerpt:
        "A deep dive into the mixing process behind one of our biggest projects this year.",
      content:
        "<p>The Midnight Run EP was a challenging but rewarding project. With five tracks spanning trap, R&B, and experimental hip-hop, we needed a mixing approach that was both consistent and genre-aware.</p><p>We started every mix with a static balance in mono, getting the vocal sitting right before touching any plugins. From there, we built up the low end with parallel compression on the 808s, used saturation to bring out the midrange in the vocals, and automated delays and reverbs to create movement throughout each track.</p><p>The mastering chain was kept simple: a gentle EQ, a multiband compressor for consistency, and a limiter to hit streaming targets without squashing the dynamics.</p>",
      categoryId: insertedCategories[1].id,
      status: "published",
      publishedAt: new Date("2026-02-20"),
    },
    {
      title: "5 Vocal Recording Tips for Home Studios",
      slug: "vocal-recording-tips-home-studios",
      excerpt:
        "You do not need a million-dollar studio to get clean vocals. Here are five tips that work in any space.",
      content:
        "<p>Recording vocals at home can be frustrating if your space is not treated or your signal chain is not dialed in. Here are five tips we use at Glitch Studios that translate to any environment:</p><ol><li><strong>Treat your room first.</strong> Hang moving blankets, use a reflection filter, or record in a closet full of clothes. Killing reflections is more important than having an expensive mic.</li><li><strong>Get close to the mic.</strong> 6-8 inches is the sweet spot for most condensers. Too far and you pick up room noise. Too close and you get proximity effect muddiness.</li><li><strong>Use a pop filter.</strong> Always. No exceptions. Plosives are nearly impossible to fix in post without artifacts.</li><li><strong>Record at 24-bit, 48kHz.</strong> This gives you enough headroom and quality without bloating your file sizes.</li><li><strong>Do multiple takes.</strong> Even if the first take feels good, do three more. You will almost always find a better performance or be able to comp the best parts together.</li></ol>",
      categoryId: insertedCategories[2].id,
      status: "published",
      publishedAt: new Date("2026-03-10"),
    },
  ]
  await db.insert(schema.blogPosts).values(blogData)
  console.log("  Blog posts seeded")

  // Seed testimonials
  const testimonialData: (typeof schema.testimonials.$inferInsert)[] = [
    {
      clientName: "KB4ds",
      clientTitle: "Recording Artist",
      quote:
        "Glitch Studios made the whole process easy. From the beat to the video, everything was handled under one roof. My single blew up because the quality was on point.",
      rating: 5,
      sortOrder: 0,
    },
    {
      clientName: "Chally",
      clientTitle: "Hip-Hop Artist",
      quote:
        "The mixing on Loud Pack was exactly what I needed. They understood my sound and brought it to another level. Quick turnaround too.",
      rating: 5,
      sortOrder: 1,
    },
    {
      clientName: "Sarah Mitchell",
      clientTitle: "Brand Manager",
      quote:
        "We hired Glitch Studios for a product launch video and custom sound design. The team was professional, creative, and delivered ahead of schedule. Highly recommend.",
      rating: 5,
      sortOrder: 2,
    },
    {
      clientName: "Nelson",
      clientTitle: "Singer-Songwriter",
      quote:
        "The studio vibe is unmatched. You walk in and immediately feel creative. The engineers know their stuff and they actually listen to what you want.",
      rating: 4,
      sortOrder: 3,
    },
  ]
  await db.insert(schema.testimonials).values(testimonialData)
  console.log("  Testimonials seeded")

  console.log("Seeding complete!")
}

seed().catch((error) => {
  console.error("Seed error:", error)
  process.exit(1)
})
