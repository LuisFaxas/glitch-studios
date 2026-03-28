import postgres from "postgres"
import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"

/**
 * Comprehensive seed script for Glitch Studios.
 * Uses postgres-js driver (standalone, does NOT import from @/lib/db).
 *
 * Usage:
 *   npx tsx src/db/seed.ts
 *
 * Seeds ALL tables from Phases 1-4 with realistic demo data.
 */
async function seed() {
  const client = postgres(process.env.DATABASE_URL!)
  const db = drizzle(client, { schema })

  try {
    console.log("Seeding database...")

    // ===== CLEAR EXISTING DATA (reverse dependency order) =====
    console.log("  Clearing existing data...")

    // Phase 2: Orders & beats
    await db.delete(schema.orderItems)
    await db.delete(schema.orders)
    await db.delete(schema.bundleBeats)
    await db.delete(schema.bundles)
    await db.delete(schema.beatProducers)
    await db.delete(schema.beatPricing)
    await db.delete(schema.beats)

    // Phase 3: Bookings & rooms
    await db.delete(schema.bookings)
    await db.delete(schema.bookingSeries)
    await db.delete(schema.weeklyAvailability)
    await db.delete(schema.availabilityOverrides)
    await db.delete(schema.sessionPackages)
    await db.delete(schema.serviceBookingConfig)
    await db.delete(schema.rooms)

    // Phase 4: Blog tags, content, admin
    await db.delete(schema.blogPostTags)
    await db.delete(schema.blogPosts)
    await db.delete(schema.blogCategories)
    await db.delete(schema.blogTags)

    // Phase 4: Contact, newsletter
    await db.delete(schema.contactReplies)
    await db.delete(schema.contactSubmissions)
    await db.delete(schema.newsletterBroadcasts)
    await db.delete(schema.newsletterSubscribers)

    // Phase 4: Admin, homepage, settings, media
    await db.delete(schema.adminRolePermissions)
    await db.delete(schema.adminRoles)
    await db.delete(schema.homepageSections)
    await db.delete(schema.siteSettings)
    await db.delete(schema.mediaAssets)

    // Phase 1: Core tables
    await db.delete(schema.testimonials)
    await db.delete(schema.portfolioItems)
    await db.delete(schema.teamMembers)
    await db.delete(schema.services)
    await db.delete(schema.licenseTierDefs)

    console.log("  Existing data cleared")

    // ===== PHASE 1: CORE TABLES =====

    // --- Services ---
    const servicesData: (typeof schema.services.$inferInsert)[] = [
      {
        name: "Recording Session",
        slug: "recording-session",
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
    const insertedServices = await db
      .insert(schema.services)
      .values(servicesData)
      .returning()
    console.log("  Services seeded")

    // --- Team Members ---
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
    const insertedTeam = await db
      .insert(schema.teamMembers)
      .values(teamData)
      .returning()
    console.log("  Team members seeded")

    // --- Portfolio Items ---
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

    // --- Testimonials ---
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

    // ===== PHASE 2: BEAT STORE =====

    // --- License Tier Definitions ---
    const licenseTierData: (typeof schema.licenseTierDefs.$inferInsert)[] = [
      {
        tier: "mp3_lease",
        displayName: "MP3 Lease",
        description: "Standard MP3 lease for non-profit use and demos. Perfect for testing beats before committing.",
        usageRights: [
          "Non-exclusive license",
          "Up to 2,500 distributions",
          "Up to 50,000 streams",
          "Credit required: Prod. by Glitch Studios",
        ],
        deliverables: ["Tagged MP3 file"],
        sortOrder: 0,
      },
      {
        tier: "wav_lease",
        displayName: "WAV Lease",
        description: "High-quality WAV lease for commercial releases. Ideal for singles and mixtapes.",
        usageRights: [
          "Non-exclusive license",
          "Up to 10,000 distributions",
          "Up to 250,000 streams",
          "Credit required: Prod. by Glitch Studios",
        ],
        deliverables: ["Untagged WAV file", "Tagged MP3 file"],
        sortOrder: 1,
      },
      {
        tier: "stems",
        displayName: "Stems",
        description: "Full track stems for complete creative control. Mix and arrange the beat to fit your vision.",
        usageRights: [
          "Non-exclusive license",
          "Up to 25,000 distributions",
          "Up to 500,000 streams",
          "Credit required: Prod. by Glitch Studios",
        ],
        deliverables: ["Untagged WAV file", "Tagged MP3 file", "Stems (ZIP)"],
        sortOrder: 2,
      },
      {
        tier: "unlimited",
        displayName: "Unlimited",
        description: "Unlimited distribution and streaming rights. Best for artists with a growing audience.",
        usageRights: [
          "Non-exclusive license",
          "Unlimited distributions",
          "Unlimited streams",
          "Credit required: Prod. by Glitch Studios",
          "Radio and TV broadcast rights",
        ],
        deliverables: ["Untagged WAV file", "Tagged MP3 file", "Stems (ZIP)", "MIDI file"],
        sortOrder: 3,
      },
      {
        tier: "exclusive",
        displayName: "Exclusive",
        description: "Full ownership transfer. The beat is removed from the store after purchase. You own it.",
        usageRights: [
          "Exclusive license — full ownership",
          "Unlimited distributions",
          "Unlimited streams",
          "No credit required",
          "Full broadcast and sync rights",
        ],
        deliverables: ["Untagged WAV file", "Tagged MP3 file", "Stems (ZIP)", "MIDI file", "Project file"],
        sortOrder: 4,
      },
    ]
    await db.insert(schema.licenseTierDefs).values(licenseTierData)
    console.log("  License tier definitions seeded")

    // --- Beats ---
    const beatsData: (typeof schema.beats.$inferInsert)[] = [
      {
        title: "Midnight Circuit",
        slug: "midnight-circuit",
        bpm: 140,
        key: "F#min",
        genre: "trap",
        moods: ["dark", "aggressive", "energetic"],
        description: "Hard-hitting trap beat with glitchy synths and 808 slides. Built for late-night sessions.",
        previewAudioKey: "/placeholder/beat-1.mp3",
        coverArtKey: "/placeholder/beat-1.jpg",
        status: "published",
        sortOrder: 0,
      },
      {
        title: "Neon Drift",
        slug: "neon-drift",
        bpm: 85,
        key: "Cmaj",
        genre: "lo-fi hip-hop",
        moods: ["chill", "nostalgic", "mellow"],
        description: "Smooth lo-fi vibes with dusty vinyl crackle and jazzy piano chops. Perfect for laid-back flows.",
        previewAudioKey: "/placeholder/beat-2.mp3",
        coverArtKey: "/placeholder/beat-2.jpg",
        status: "published",
        sortOrder: 1,
      },
      {
        title: "404 Not Found",
        slug: "404-not-found",
        bpm: 128,
        key: "Amin",
        genre: "glitch-hop",
        moods: ["experimental", "bouncy", "futuristic"],
        description: "Experimental glitch-hop with chopped vocal samples and stuttered bass. For the creatively fearless.",
        previewAudioKey: "/placeholder/beat-3.mp3",
        coverArtKey: "/placeholder/beat-3.jpg",
        status: "published",
        sortOrder: 2,
      },
      {
        title: "Binary Sunset",
        slug: "binary-sunset",
        bpm: 75,
        key: "Dbmaj",
        genre: "cinematic trap",
        moods: ["cinematic", "emotional", "atmospheric"],
        description: "Cinematic trap with orchestral strings and heavy sub bass. Soundtrack energy meets hip-hop grit.",
        previewAudioKey: "/placeholder/beat-4.mp3",
        coverArtKey: "/placeholder/beat-4.jpg",
        status: "published",
        sortOrder: 3,
      },
      {
        title: "System Override",
        slug: "system-override",
        bpm: 145,
        key: "Gmin",
        genre: "drill",
        moods: ["aggressive", "dark", "intense"],
        description: "UK drill-inspired beat with sliding 808s and menacing melodies. Raw energy for hard bars.",
        previewAudioKey: "/placeholder/beat-5.mp3",
        coverArtKey: "/placeholder/beat-5.jpg",
        status: "published",
        sortOrder: 4,
      },
      {
        title: "Ghost Protocol",
        slug: "ghost-protocol",
        bpm: 132,
        key: "Emin",
        genre: "dark trap",
        moods: ["dark", "mysterious", "hypnotic"],
        description: "Dark trap with eerie pads and crisp hi-hat patterns. Haunting atmosphere meets hard-hitting drums.",
        previewAudioKey: "/placeholder/beat-6.mp3",
        coverArtKey: "/placeholder/beat-6.jpg",
        status: "published",
        sortOrder: 5,
      },
    ]
    const insertedBeats = await db
      .insert(schema.beats)
      .values(beatsData)
      .returning()
    console.log("  Beats seeded")

    // --- Beat Pricing (link each beat to license tiers) ---
    const pricingData: (typeof schema.beatPricing.$inferInsert)[] = []
    const tierPrices: Record<string, string[]> = {
      // [mp3, wav, stems, unlimited, exclusive]
      "0": ["29.99", "49.99", "99.99", "199.99", "499.99"],
      "1": ["29.99", "49.99", "99.99", "199.99", "499.99"],
      "2": ["29.99", "49.99", "99.99", "199.99", "499.99"],
      "3": ["34.99", "59.99", "119.99", "249.99", "599.99"],
      "4": ["29.99", "49.99", "99.99", "199.99", "499.99"],
      "5": ["29.99", "49.99", "99.99", "199.99", "499.99"],
    }
    const tierNames: (typeof schema.licenseTierEnum.enumValues)[number][] = [
      "mp3_lease", "wav_lease", "stems", "unlimited", "exclusive",
    ]

    for (let i = 0; i < insertedBeats.length; i++) {
      const prices = tierPrices[String(i)]
      for (let t = 0; t < tierNames.length; t++) {
        pricingData.push({
          beatId: insertedBeats[i].id,
          tier: tierNames[t],
          price: prices[t],
          isActive: true,
        })
      }
    }
    await db.insert(schema.beatPricing).values(pricingData)
    console.log("  Beat pricing seeded")

    // --- Beat Producers ---
    const trapSnyder = insertedTeam.find((t) => t.name === "Trap Snyder")!
    const milli = insertedTeam.find((t) => t.name === "Milli")!

    const producerData: (typeof schema.beatProducers.$inferInsert)[] = [
      // Beats 0-2: Trap Snyder solo (100%)
      { beatId: insertedBeats[0].id, name: trapSnyder.name, splitPercent: 100 },
      { beatId: insertedBeats[1].id, name: trapSnyder.name, splitPercent: 100 },
      { beatId: insertedBeats[2].id, name: trapSnyder.name, splitPercent: 100 },
      // Beats 3-4: Trap Snyder + Milli co-production (50/50)
      { beatId: insertedBeats[3].id, name: trapSnyder.name, splitPercent: 50 },
      { beatId: insertedBeats[3].id, name: milli.name, splitPercent: 50 },
      { beatId: insertedBeats[4].id, name: trapSnyder.name, splitPercent: 50 },
      { beatId: insertedBeats[4].id, name: milli.name, splitPercent: 50 },
      // Beat 5: Trap Snyder solo (100%)
      { beatId: insertedBeats[5].id, name: trapSnyder.name, splitPercent: 100 },
    ]
    await db.insert(schema.beatProducers).values(producerData)
    console.log("  Beat producers seeded")

    // --- Bundles ---
    const insertedBundles = await db
      .insert(schema.bundles)
      .values([
        {
          title: "Starter Pack",
          slug: "starter-pack",
          description: "Get three fire beats at 20% off. Perfect for artists starting a new project.",
          discountPercent: 20,
          isActive: true,
        },
      ])
      .returning()

    await db.insert(schema.bundleBeats).values([
      { bundleId: insertedBundles[0].id, beatId: insertedBeats[0].id },
      { bundleId: insertedBundles[0].id, beatId: insertedBeats[1].id },
      { bundleId: insertedBundles[0].id, beatId: insertedBeats[2].id },
    ])
    console.log("  Bundles seeded")

    // ===== PHASE 3: BOOKING SYSTEM =====

    // --- Rooms ---
    const insertedRooms = await db
      .insert(schema.rooms)
      .values([
        {
          name: "Studio A",
          slug: "studio-a",
          description: "Main recording and production room with full isolation booth, large live room, and control room. Designed for tracking vocals, instruments, and full band sessions.",
          features: [
            "Acoustically treated live room (400 sq ft)",
            "Isolation booth for vocals",
            "Neumann U87, AKG C414, SM7B mic collection",
            "Pro Tools HDX and FL Studio",
            "Neve preamp chain",
            "Comfortable artist lounge",
          ],
          hourlyRateOverride: "50.00",
          bufferMinutes: 15,
          isActive: true,
          sortOrder: 0,
        },
        {
          name: "Studio B",
          slug: "studio-b",
          description: "Mixing and editing suite optimized for post-production work. Acoustically calibrated monitoring and a focused environment for critical listening.",
          features: [
            "Acoustically calibrated control room (200 sq ft)",
            "Focal Twin6 Be monitoring",
            "Waves, FabFilter, Soundtoys plugin suite",
            "Pro Tools and Ableton Live",
            "Analog summing mixer",
          ],
          hourlyRateOverride: "35.00",
          bufferMinutes: 15,
          isActive: true,
          sortOrder: 1,
        },
      ])
      .returning()
    console.log("  Rooms seeded")

    // --- Service Booking Config ---
    const recordingService = insertedServices.find((s) => s.slug === "recording-session")!
    const mixingService = insertedServices.find((s) => s.slug === "mixing-mastering")!

    await db.insert(schema.serviceBookingConfig).values([
      {
        serviceId: recordingService.id,
        durationMinutes: 120,
        depositType: "flat",
        depositValue: "25.00",
        autoConfirm: true,
        cancellationWindowHours: 24,
        refundPolicy: "full",
        maxAdvanceBookingDays: 90,
        prepInstructions: "Bring your session files on a USB drive or share via Google Drive. Arrive 10 minutes early to set up.",
      },
      {
        serviceId: mixingService.id,
        durationMinutes: 60,
        depositType: "flat",
        depositValue: "37.50",
        autoConfirm: true,
        cancellationWindowHours: 48,
        refundPolicy: "full",
        maxAdvanceBookingDays: 90,
        prepInstructions: "Send stems labeled and organized before your session. Include a reference track if possible.",
      },
    ])
    console.log("  Service booking config seeded")

    // --- Weekly Availability ---
    const studioA = insertedRooms.find((r) => r.slug === "studio-a")!
    const studioB = insertedRooms.find((r) => r.slug === "studio-b")!

    const availabilityData: (typeof schema.weeklyAvailability.$inferInsert)[] = []

    // Studio A: Mon-Fri (1-5) 09:00-21:00, Sat (6) 10:00-18:00
    for (let day = 1; day <= 5; day++) {
      availabilityData.push({
        roomId: studioA.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "21:00",
        isActive: true,
      })
    }
    availabilityData.push({
      roomId: studioA.id,
      dayOfWeek: 6,
      startTime: "10:00",
      endTime: "18:00",
      isActive: true,
    })

    // Studio B: Mon-Fri (1-5) 10:00-20:00, Sat (6) 10:00-16:00
    for (let day = 1; day <= 5; day++) {
      availabilityData.push({
        roomId: studioB.id,
        dayOfWeek: day,
        startTime: "10:00",
        endTime: "20:00",
        isActive: true,
      })
    }
    availabilityData.push({
      roomId: studioB.id,
      dayOfWeek: 6,
      startTime: "10:00",
      endTime: "16:00",
      isActive: true,
    })

    await db.insert(schema.weeklyAvailability).values(availabilityData)
    console.log("  Weekly availability seeded")

    // ===== PHASE 4: ADMIN, CONTENT, SETTINGS =====

    // --- Blog Categories ---
    const insertedCategories = await db
      .insert(schema.blogCategories)
      .values([
        { name: "News", slug: "news" },
        { name: "Behind the Scenes", slug: "behind-the-scenes" },
        { name: "Production Tips", slug: "production-tips" },
      ])
      .returning()
    console.log("  Blog categories seeded")

    // --- Blog Tags ---
    const insertedTags = await db
      .insert(schema.blogTags)
      .values([
        { name: "Hip-Hop", slug: "hip-hop" },
        { name: "Production", slug: "production" },
        { name: "Mixing", slug: "mixing" },
        { name: "Studio Life", slug: "studio-life" },
        { name: "Tutorials", slug: "tutorials" },
      ])
      .returning()
    console.log("  Blog tags seeded")

    // --- Blog Posts ---
    const insertedPosts = await db
      .insert(schema.blogPosts)
      .values([
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
      ])
      .returning()
    console.log("  Blog posts seeded")

    // --- Blog Post Tags ---
    const hipHopTag = insertedTags.find((t) => t.slug === "hip-hop")!
    const productionTag = insertedTags.find((t) => t.slug === "production")!
    const mixingTag = insertedTags.find((t) => t.slug === "mixing")!
    const studioLifeTag = insertedTags.find((t) => t.slug === "studio-life")!
    const tutorialsTag = insertedTags.find((t) => t.slug === "tutorials")!

    await db.insert(schema.blogPostTags).values([
      { postId: insertedPosts[0].id, tagId: studioLifeTag.id },
      { postId: insertedPosts[1].id, tagId: hipHopTag.id },
      { postId: insertedPosts[1].id, tagId: mixingTag.id },
      { postId: insertedPosts[1].id, tagId: productionTag.id },
      { postId: insertedPosts[2].id, tagId: tutorialsTag.id },
      { postId: insertedPosts[2].id, tagId: productionTag.id },
    ])
    console.log("  Blog post tags seeded")

    // --- Homepage Sections ---
    await db.insert(schema.homepageSections).values([
      { sectionType: "hero", sortOrder: 0, isVisible: true },
      { sectionType: "featured_beats", sortOrder: 1, isVisible: true },
      { sectionType: "services", sortOrder: 2, isVisible: true },
      { sectionType: "portfolio", sortOrder: 3, isVisible: true },
      { sectionType: "testimonials", sortOrder: 4, isVisible: true },
    ])
    console.log("  Homepage sections seeded")

    // --- Site Settings ---
    await db.insert(schema.siteSettings).values([
      { key: "site_name", value: "Glitch Studios" },
      { key: "contact_email", value: "admin@glitchstudios.com" },
      { key: "phone", value: "(555) 123-4567" },
      { key: "address", value: "123 Studio Lane, Los Angeles, CA 90001" },
      { key: "about_text", value: "Full-service music and video production studio." },
    ])
    console.log("  Site settings seeded")

    // --- Newsletter Subscribers ---
    await db.insert(schema.newsletterSubscribers).values([
      { email: "testfan@example.com", isActive: true },
      { email: "beatbuyer@example.com", isActive: true },
    ])
    console.log("  Newsletter subscribers seeded")

    // --- Admin Roles ---
    const insertedRoles = await db
      .insert(schema.adminRoles)
      .values([
        { name: "editor", isDefault: false },
        { name: "manager", isDefault: false },
      ])
      .returning()

    const editorRole = insertedRoles.find((r) => r.name === "editor")!
    const managerRole = insertedRoles.find((r) => r.name === "manager")!

    await db.insert(schema.adminRolePermissions).values([
      { roleId: editorRole.id, permission: "manage_content" },
      { roleId: editorRole.id, permission: "manage_media" },
      { roleId: managerRole.id, permission: "manage_bookings" },
      { roleId: managerRole.id, permission: "view_clients" },
      { roleId: managerRole.id, permission: "reply_messages" },
    ])
    console.log("  Admin roles and permissions seeded")

    console.log("Seed complete!")
  } catch (error) {
    console.error("Seed error:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

seed()
