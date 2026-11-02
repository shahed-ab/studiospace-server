// scripts/seed.js  — clears and re-inserts 12 sample studios
import "dotenv/config";
import mongoose from "mongoose";
import Studio from "../models/Studio.js";

const DEMO_HOST = {
  ownerName:   "Demo Host",
  ownerEmail:  "host@studiospace.demo",
  ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
};

const studios = [
  // ── 1 ── first 4 owned by Demo Host so a real account can manage them ──────
  {
    title:           "The Cyc Wall by Lumen",
    category:        "Photo Studio",
    originalLabel:   "Daylight Photo",
    hourlyRate:      85,
    securityDeposit: 150,
    maxCapacity:     25,
    location:        "Greenpoint, Brooklyn, NY",
    images: [
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "2-Wall Corner Cyclorama",
      "18ft Overhead Lighting Grid",
      "Hair & Makeup Vanity Station",
      "High-speed 1Gbps Fiber WiFi",
      "Ground Floor Drive-in Access",
      "Client Mezzanine Lounge",
      "Commercial Steamer & Wardrobe Racks",
      "Restroom with Shower",
    ],
    overview:
      "A pristine 2,400 sq ft photo production stage situated along the Greenpoint waterfront. Features a double-corner infinity cyclorama wall, soaring 18-foot ceilings with motorized pre-rigged grid piping, and expansive north-facing factory sash windows for soft all-day daylight. Designed for commercial campaigns, lookbooks, and high-end editorial shoots.",
    ...DEMO_HOST,
    rating:      4.98,
    reviewCount: 142,
    reviews: [
      {
        userName:   "Marcus Thorne",
        userEmail:  "marcus.thorne@example.com",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "The corner cyclorama was impeccably freshly painted white when we arrived. Daylight was gorgeous throughout our 10-hour campaign shoot.",
        createdAt:  new Date("2024-10-18T14:20:00.000Z"),
      },
      {
        userName:   "Chloe St. Claire",
        userEmail:  "chloe.stclaire@example.com",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Alex is a super responsive host. The private mezzanine made our agency clients feel right at home while we operated on set.",
        createdAt:  new Date("2024-10-04T10:15:00.000Z"),
      },
    ],
    createdAt: new Date("2024-01-15T08:00:00.000Z"),
  },

  // ── 2 ──────────────────────────────────────────────────────────────────────
  {
    title:           "Prism Stage A Soundstage",
    category:        "Film Stage",
    originalLabel:   "Sound Stage",
    hourlyRate:      140,
    securityDeposit: 300,
    maxCapacity:     60,
    location:        "Arts District, Los Angeles, CA",
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Certified NC-20 Sound Isolation",
      "3-Phase 400A Camlock Disconnect",
      "Drive-in Elephant Bay Door",
      "Silent HVAC System",
      "Grip & Electric Package Included",
      "Green Room & VIP Dressing Rooms",
      "Craft Services Prep Kitchen",
      "Dedicated Production Office",
    ],
    overview:
      "A 4,500 sq ft professional soundstage built to union motion picture specifications. Features soundproofed NC-20 certified acoustic walls, complete light-trap entry airlocks, and full drive-in access for 5-ton grip trucks. Perfect for narrative feature films, music videos, and commercial shoots.",
    ...DEMO_HOST,
    rating:      4.99,
    reviewCount: 210,
    reviews: [
      {
        userName:   "Devon Hayes",
        userEmail:  "devon.hayes@example.com",
        userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Acoustic isolation was pristine — zero bleed from the neighboring downtown freight traffic. Power distribution was seamless.",
        createdAt:  new Date("2024-09-29T16:00:00.000Z"),
      },
    ],
    createdAt: new Date("2024-02-10T10:30:00.000Z"),
  },

  // ── 3 ──────────────────────────────────────────────────────────────────────
  {
    title:           "Northlight Photo Loft",
    category:        "Photo Studio",
    originalLabel:   "Daylight Loft",
    hourlyRate:      110,
    securityDeposit: 200,
    maxCapacity:     20,
    location:        "SoHo, Manhattan, NY",
    images: [
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Pure Northern Exposure Daylight",
      "Original 14ft Tin Ceilings",
      "Restored Oak Hardwood Floors",
      "Heavy Freight Elevator Direct-to-Stage",
      "Dual Hair & Makeup Stations",
      "Full Equipment Prop Library",
      "B&O Sound System",
      "Espresso Bar",
    ],
    overview:
      "A classic 1,800 sq ft cast-iron loft in historical SoHo with unobstructed northern daylight through oversized arched windows. Boasts original pressed-tin 14-foot ceilings, honey-toned hardwood floors, and mid-century editorial props. Ideal for fashion campaigns, editorial portraiture, and lookbooks.",
    ...DEMO_HOST,
    rating:      4.95,
    reviewCount: 98,
    reviews: [
      {
        userName:   "Sienna Miller",
        userEmail:  "sienna.miller@example.com",
        userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "The light in this loft is magical. You don't even need strobes until sundown. The freight elevator makes load-in painless.",
        createdAt:  new Date("2024-10-12T18:45:00.000Z"),
      },
    ],
    createdAt: new Date("2024-03-01T12:00:00.000Z"),
  },

  // ── 4 ──────────────────────────────────────────────────────────────────────
  {
    title:           "Velvet Room Recording",
    category:        "Music Suite",
    originalLabel:   "Recording Room",
    hourlyRate:      65,
    securityDeposit: 100,
    maxCapacity:     12,
    location:        "Music Row, Nashville, TN",
    images: [
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Solid State Logic AWS 948 Console",
      "Isolated Vocal & Drum Booths",
      "Yamaha C7 Concert Grand Piano",
      "Vintage Neumann U87 & Telefunken Mics",
      "Pro Tools Ultimate HDX System",
      "Floating Acoustic Slab Floor",
      "Private Artist Lounge",
      "Tape Machine Studer A800",
    ],
    overview:
      "A warm, analog-infused recording suite located in the heart of Nashville's legendary Music Row. Built around an SSL AWS 948 hybrid console and world-class outboard gear (Neve 1073s, Tube-Tech CL1B, 1176s). Complete with a Yamaha C7 grand piano and two isolated live performance booths.",
    ...DEMO_HOST,
    rating:      4.97,
    reviewCount: 84,
    reviews: [
      {
        userName:   "Tariq Edwards",
        userEmail:  "tariq.edwards@example.com",
        userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "One of the warmest vocal chains I've tracked through. Outboard compressors are perfectly calibrated.",
        createdAt:  new Date("2024-10-09T11:00:00.000Z"),
      },
    ],
    createdAt: new Date("2024-03-20T09:00:00.000Z"),
  },

  // ── 5–12: other fictional hosts ────────────────────────────────────────────
  {
    title:           "Echo Chamber Podcast Lounge",
    category:        "Podcast Lounge",
    originalLabel:   "Podcast Suite",
    hourlyRate:      50,
    securityDeposit: 75,
    maxCapacity:     8,
    location:        "South Congress, Austin, TX",
    images: [
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Turnkey 4-Person Broadcast Table",
      "Shure SM7B Microphones with Cloudlifters",
      "3x Blackmagic Cinema Camera 4K (Tricam)",
      "ATEM Mini Extreme ISO Video Switcher",
      "Rodecaster Pro II Audio Hub",
      "Acoustic Diffuser Wall Panels",
      "RGB Customizable Studio Lighting",
      "Dedicated High-Speed Fiber Streaming Line",
    ],
    overview:
      "A broadcast-grade video podcast studio designed for creators, interviews, and live streaming. Walk in with a thumb drive or SSD and record 4K multi-cam synced video and studio audio in minutes. Fully acoustically treated with mood lighting presets and custom branded monitor backdrops.",
    ownerName:   "Rachel Sterling",
    ownerEmail:  "rachel@echochamberaustin.com",
    ownerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    rating:      4.92,
    reviewCount: 67,
    reviews: [
      {
        userName:   "Samira Patel",
        userEmail:  "samira.patel@example.com",
        userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Zero headache setup. Walked in, plugged in our drive, and recorded 3 podcast episodes back-to-back with flawless video sync.",
        createdAt:  new Date("2024-10-22T19:30:00.000Z"),
      },
    ],
    createdAt: new Date("2024-04-05T14:15:00.000Z"),
  },

  {
    title:           "The Foundry Ceramic Loft",
    category:        "Workshop",
    originalLabel:   "Art Workshop",
    hourlyRate:      45,
    securityDeposit: 80,
    maxCapacity:     16,
    location:        "West Loop, Chicago, IL",
    images: [
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "6 Shimpo Potter's Wheels",
      "Heavy Clay Slab Roller",
      "Deep Slop Sinks with Clay Traps",
      "Skutt Electric Cone 10 Kiln",
      "Solid Maple Butcher Block Workbenches",
      "Exposed Brick & South Natural Daylight",
      "Glaze Application Spray Booth",
      "Drying Storage Shelving Racks",
    ],
    overview:
      "A rustic, light-flooded artisan loft in Chicago's vibrant West Loop. Outfitted with precision Shimpo pottery wheels, slab rollers, clay preparation tables, and glaze facilities. Perfect for ceramic artists, craft masterclasses, printmakers, and hands-on tactile workshops.",
    ownerName:   "Hannah Lindqvist",
    ownerEmail:  "hannah@foundryceramics.org",
    ownerAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    rating:      4.89,
    reviewCount: 52,
    reviews: [
      {
        userName:   "Oliver Gray",
        userEmail:  "oliver.gray@example.com",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Held a weekend pottery workshop here. The light is so inspiring and the clay cleanup facilities are top notch.",
        createdAt:  new Date("2024-10-15T15:10:00.000Z"),
      },
    ],
    createdAt: new Date("2024-04-18T11:00:00.000Z"),
  },

  {
    title:           "Aperture Daylight Warehouse",
    category:        "Photo Studio",
    originalLabel:   "Warehouse Stage",
    hourlyRate:      125,
    securityDeposit: 250,
    maxCapacity:     40,
    location:        "Long Island City, Queens, NY",
    images: [
      "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "3,800 sq ft Clear Span Space",
      "Full Drive-in Garage Bay Door",
      "22ft High Steel Truss Ceilings",
      "Polished Industrial Concrete Flooring",
      "3-Phase 200A Camlock Box",
      "Dedicated Grip & Lighting Package",
      "Client Dining Lounge Area",
      "Central HVAC & Heating",
    ],
    overview:
      "A massive industrial production warehouse with 22-foot steel trusses and floor-to-ceiling skylights. Features vehicle drive-in access directly into the shooting volume, heavy three-phase camlock power, and polished concrete floors. Ideal for automotive photography, large set construction, and music video shoots.",
    ownerName:   "Alex Vance",
    ownerEmail:  "alex@aperturestudios.com",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    rating:      4.96,
    reviewCount: 178,
    reviews: [
      {
        userName:   "Derrick Vance",
        userEmail:  "derrick.vance@example.com",
        userAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Drove two vintage cars right into the shoot volume. The skylights gave us even, diffused daylight all afternoon.",
        createdAt:  new Date("2024-10-01T17:15:00.000Z"),
      },
    ],
    createdAt: new Date("2024-05-02T08:30:00.000Z"),
  },

  {
    title:           "Black Box Stage 4",
    category:        "Film Stage",
    originalLabel:   "Film Production",
    hourlyRate:      180,
    securityDeposit: 400,
    maxCapacity:     75,
    location:        "Burbank Media District, CA",
    images: [
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "5,200 sq ft Soundproof Void",
      "Pre-rigged Chroma Green Screen Cyc",
      "Motorized Telescoping Lighting Truss",
      "Silent Whisper-Air HVAC",
      "Full Chapman Dolly & Track Package",
      "Commercial Hair & Makeup Room (4 stations)",
      "Production Offices with High-Speed LAN",
      "On-site Grip Equipment Rental Depo",
    ],
    overview:
      "An elite studio facility located in the epicenter of Hollywood production. Features a pre-hung motorized lighting grid, NC-15 silent acoustics, and an integrated chroma green cyc stage. Catered to high-concept commercials, visual effects plates, and feature film dialogue sequences.",
    ownerName:   "Victor Chen",
    ownerEmail:  "victor@blackboxburbank.com",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    rating:      5.0,
    reviewCount: 114,
    reviews: [
      {
        userName:   "Elena Rostova",
        userEmail:  "elena.rostova@example.com",
        userAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "World-class production infrastructure. The motorized grid saved our crew at least two hours during pre-light.",
        createdAt:  new Date("2024-10-11T13:40:00.000Z"),
      },
    ],
    createdAt: new Date("2024-05-15T10:00:00.000Z"),
  },

  {
    title:           "Solarium Greenhouse Studio",
    category:        "Photo Studio",
    originalLabel:   "Solarium & Atelier",
    hourlyRate:      95,
    securityDeposit: 150,
    maxCapacity:     18,
    location:        "Silver Lake, Los Angeles, CA",
    images: [
      "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Glass Atrium Skylight Ceiling",
      "Curated Botanical Collection (150+ rare plants)",
      "Terracotta Tiled Flooring",
      "Vintage Wabi-Sabi Styling Furniture",
      "Dedicated Dressing Room & Vanity",
      "Sonos Ambient Sound System",
      "Outdoor Garden Patio for Catering",
      "High-speed WiFi",
    ],
    overview:
      "A serene glass-roofed sunroom and artist atelier tucked away in the Silver Lake hills. Features hundreds of lush tropical plants, natural terracotta tile, and breathtaking sunset illumination. Designed for beauty and wellness branding, lookbooks, intimate acoustic sets, and lifestyle photography.",
    ownerName:   "Amara Thorne",
    ownerEmail:  "amara@solariumla.com",
    ownerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    rating:      4.94,
    reviewCount: 89,
    reviews: [
      {
        userName:   "Leo Rivera",
        userEmail:  "leo.rivera@example.com",
        userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Golden hour here produces photographs that look straight out of an editorial dream. The plants are healthy and vibrant.",
        createdAt:  new Date("2024-10-25T17:00:00.000Z"),
      },
    ],
    createdAt: new Date("2024-06-01T14:00:00.000Z"),
  },

  {
    title:           "Neon Pulse Synth & Mix Lab",
    category:        "Music Suite",
    originalLabel:   "Modular Suite",
    hourlyRate:      75,
    securityDeposit: 120,
    maxCapacity:     10,
    location:        "Central Eastside, Portland, OR",
    images: [
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1598653222000-6b7b7a552625?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Dolby Atmos 7.1.4 Monitoring Environment",
      "Full Eurorack Modular Synth Wall",
      "Genelec SAM Studio Monitors",
      "Moog One, Prophet-6, Juno-106 Synths",
      "Acoustically Certified Room Decoupling",
      "Custom Mood LED Lighting Matrix",
      "Modular Patchbay Router",
      "Lounge with Espresso Machine",
    ],
    overview:
      "A futuristic electronic music production haven equipped with an immense modular Eurorack system, classic vintage poly synths, and a reference-grade Dolby Atmos 7.1.4 immersive mixing environment. Tuned specifically for film scoring, spatial audio mastering, and electronic sound design.",
    ownerName:   "Devin Kaelen",
    ownerEmail:  "devin@neonpulseaudio.com",
    ownerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    rating:      4.93,
    reviewCount: 63,
    reviews: [
      {
        userName:   "Maya Lin",
        userEmail:  "maya.lin@example.com",
        userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "The spatial mix translated with pinpoint accuracy. The vintage Moog and Prophet synths are in mint functional condition.",
        createdAt:  new Date("2024-10-14T20:10:00.000Z"),
      },
    ],
    createdAt: new Date("2024-06-20T16:30:00.000Z"),
  },

  {
    title:           "Industrial Foundry & Metal Workshop",
    category:        "Workshop",
    originalLabel:   "Craft Studio",
    hourlyRate:      60,
    securityDeposit: 150,
    maxCapacity:     15,
    location:        "South Lake Union, Seattle, WA",
    images: [
      "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Heavy Power 220V Outlets",
      "Industrial Fume & Dust Extraction Hoods",
      "TIG / MIG Welding Bays",
      "Precision Metal Lathe & Bridgeport Mill",
      "Cast Iron Clamping Benches",
      "Full PPE & Safety Equipment Station",
      "Loading Dock with Overhead Hoist",
      "Shop Compressor Line",
    ],
    overview:
      "A fully permitted industrial metal fabrication and maker laboratory built for set builders, sculptors, and creative fabricators. Outfitted with heavy ventilation, welding bays, lathes, and high-amperage 220V electrical circuits to support complex production prototypes.",
    ownerName:   "Gareth Cole",
    ownerEmail:  "gareth@seattlefoundry.org",
    ownerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    rating:      4.88,
    reviewCount: 44,
    reviews: [
      {
        userName:   "Brett Snyder",
        userEmail:  "brett.snyder@example.com",
        userAvatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "Essential space for custom prop fabrication. Hoist and heavy power made handling steel frames easy.",
        createdAt:  new Date("2024-09-18T12:00:00.000Z"),
      },
    ],
    createdAt: new Date("2024-07-08T09:15:00.000Z"),
  },

  {
    title:           "Gotham Broadcast & Stream Lounge",
    category:        "Podcast Lounge",
    originalLabel:   "Broadcast Studio",
    hourlyRate:      90,
    securityDeposit: 100,
    maxCapacity:     12,
    location:        "Flatiron District, New York, NY",
    images: [
      "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1589903308904-1010c2294adc?auto=format&fit=crop&w=1200&q=80",
    ],
    amenities: [
      "Symmetrical 1Gbps Dedicated Fiber Stream Line",
      "4x Shure SM7B Microphones with Grace Design Preamps",
      "Sony FX6 & FX3 4K Cinema Camera Rig",
      "Aputure Soft Lighting Grid",
      "Acoustically Isolated Broadcast Booth",
      "Teleprompter Rig with Live Feeds",
      "Green Room Hospitality Suite",
      "Live Producer Monitoring Control Desk",
    ],
    overview:
      "A flagship podcast and live stream studio in Manhattan's Flatiron district. Equipped with cinema cameras, precision broadcast microphones, and redundant fiber internet lines. Ideal for remote CEO interviews, live webinars, roundtable podcasts, and branded broadcast streams.",
    ownerName:   "Miranda Sterling",
    ownerEmail:  "miranda@gothambroadcast.com",
    ownerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    rating:      4.95,
    reviewCount: 102,
    reviews: [
      {
        userName:   "Chloe St. Claire",
        userEmail:  "chloe.stclaire@example.com",
        userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
        rating:     5,
        comment:    "The Sony FX6 cameras and broadcast lighting made our client stream look identical to a television network production.",
        createdAt:  new Date("2024-10-20T16:20:00.000Z"),
      },
    ],
    createdAt: new Date("2024-07-25T11:45:00.000Z"),
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await Studio.deleteMany({});
  console.log("Cleared existing studios");

  const inserted = await Studio.insertMany(studios);
  console.log(`Inserted ${inserted.length} studios`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});

