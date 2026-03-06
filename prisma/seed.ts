import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Category keywords for loremflickr — returns real CC-licensed photos matching the term
const CATEGORY_KEYWORDS: Record<string, string> = {
  SOFA:         'sofa,couch',
  ARMCHAIR:     'armchair,chair',
  COFFEE_TABLE: 'coffee-table,furniture',
  SIDE_TABLE:   'side-table,furniture',
  BED_FRAME:    'bed,bedroom',
  DRESSER:      'dresser,drawer',
  DINING_TABLE: 'dining-table,furniture',
  DINING_CHAIR: 'dining-chair,furniture',
  DESK:         'desk,office',
  DESK_CHAIR:   'office-chair,chair',
  BOOKSHELF:    'bookshelf,bookcase',
  FLOOR_LAMP:   'floor-lamp,lighting',
  TABLE_LAMP:   'table-lamp,lamp',
  RUG:          'rug,carpet',
  ARTWORK:      'wall-art,painting',
  MIRROR:       'mirror,wall-decor',
  STORAGE:      'cabinet,storage',
  ACCENT_PIECE: 'home-decor,interior',
}

// Stable numeric seed from SKU so each product always gets the same image
function skuSeed(sku: string): number {
  return sku.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 100
}

function img(sku: string, _name: string, category?: string): string {
  const kw = (category && CATEGORY_KEYWORDS[category]) ?? 'furniture,interior'
  return `https://loremflickr.com/800/600/${kw}?lock=${skuSeed(sku)}`
}
function thumb(sku: string, _name: string, category?: string): string {
  const kw = (category && CATEGORY_KEYWORDS[category]) ?? 'furniture,interior'
  return `https://loremflickr.com/400/300/${kw}?lock=${skuSeed(sku)}`
}

async function main() {
  console.log('Seeding retailer...')

  const retailer = await prisma.retailer.upsert({
    where: { slug: 'demo-furniture' },
    update: {},
    create: {
      slug: 'demo-furniture',
      name: 'Roomly',
      primaryColor: '#1a1a2e',
      accentColor: '#e94560',
      contactEmail: 'hello@roomly.com',
    },
  })

  console.log(`Retailer: ${retailer.name} (${retailer.id})`)
  console.log('\nSeeding products...')

  // Clear dependent rows first (FK constraints), then products
  const existingProductIds = await prisma.product.findMany({
    where: { retailerId: retailer.id },
    select: { id: true },
  })
  const ids = existingProductIds.map((p) => p.id)
  if (ids.length > 0) {
    await prisma.swipe.deleteMany({ where: { productId: { in: ids } } })
    await prisma.planItem.deleteMany({ where: { productId: { in: ids } } })
  }
  await prisma.product.deleteMany({ where: { retailerId: retailer.id } })

  const products = [
    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — SOFAS (8) — CB2-inspired
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-SOFA-001', name: 'Decker 100" Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 199900, description: 'Sleek track-arm sofa in warm sand fabric with solid walnut legs. CB2\'s most-loved modern silhouette — slim, architectural, and endlessly versatile.',
      styleIds: ['modern', 'scandinavian'], colorFamily: ['neutral', 'warm-white'], materialTags: ['linen', 'walnut'],
      dimensions: { w: 100, h: 31, d: 37 },
    },
    {
      sku: 'LR-SOFA-002', name: 'Avec 103" Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 229900, description: 'Deep-seated performance fabric sofa with brushed brass legs. Wide enough for sprawling, refined enough to anchor any living room.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['charcoal', 'neutral'], materialTags: ['performance-fabric', 'metal'],
      dimensions: { w: 103, h: 33, d: 40 },
    },
    {
      sku: 'LR-SOFA-003', name: 'Gwyneth 83" Velvet Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 179900, description: 'Rich blush velvet with a low profile and solid wood frame. Glamorous without trying too hard — the sofa that stops the room.',
      styleIds: ['mid-century', 'eclectic'], colorFamily: ['blush', 'sage'], materialTags: ['velvet', 'solid-wood'],
      dimensions: { w: 83, h: 29, d: 36 },
    },
    {
      sku: 'LR-SOFA-004', name: 'Piazza 118" Sectional', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 349900, description: 'Oversized L-sectional in performance heathered grey. Made for living in — generous cushions, durable fabric, hairpin brass feet.',
      styleIds: ['modern', 'industrial'], colorFamily: ['charcoal', 'neutral'], materialTags: ['performance-fabric', 'metal'],
      dimensions: { w: 118, h: 33, d: 66 },
    },
    {
      sku: 'LR-SOFA-005', name: 'Borg 102" Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 159900, description: 'Heathered oatmeal wool blend with a tailored silhouette and mango wood legs. Cozy and considered — perfect for Scandinavian and bohemian interiors.',
      styleIds: ['bohemian', 'scandinavian'], colorFamily: ['warm-white', 'neutral'], materialTags: ['wool', 'solid-wood'],
      dimensions: { w: 102, h: 32, d: 38 },
    },
    {
      sku: 'LR-SOFA-006', name: 'Flex 91" Modular Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 249900, description: 'Three-piece modular system in sage performance fabric. Reconfigure from sofa to sectional to chaise — it grows with your space.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['sage', 'neutral'], materialTags: ['performance-fabric', 'walnut'],
      dimensions: { w: 91, h: 30, d: 40 },
    },
    {
      sku: 'LR-SOFA-007', name: 'Splinter Navy Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 139900, description: 'Deep navy velvet with a tight tufted back and solid wood legs. Bold enough to anchor a room, refined enough for any interior.',
      styleIds: ['traditional', 'eclectic'], colorFamily: ['navy', 'warm-white'], materialTags: ['velvet', 'solid-wood'],
      dimensions: { w: 80, h: 36, d: 34 },
    },
    {
      sku: 'LR-SOFA-008', name: 'Campio Leather Sofa', category: 'SOFA', room: ['LIVING_ROOM'],
      priceUsd: 299900, description: 'Full-grain aniline leather with bench cushion seating and solid oak legs. Designed to patina beautifully — ages into the best sofa you\'ve ever had.',
      styleIds: ['industrial', 'mid-century'], colorFamily: ['charcoal', 'walnut-brown'], materialTags: ['leather', 'oak'],
      dimensions: { w: 94, h: 32, d: 38 },
    },

    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — ARMCHAIRS (6) — CB2-inspired
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-CHAIR-001', name: 'Pebble Swivel Chair', category: 'ARMCHAIR', room: ['LIVING_ROOM'],
      priceUsd: 89900, description: 'Egg-shaped swivel chair upholstered in warm caramel boucle with a polished chrome base. Every room needs one.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['terracotta', 'warm-white'], materialTags: ['boucle', 'metal'],
      dimensions: { w: 32, h: 34, d: 33 },
    },
    {
      sku: 'LR-CHAIR-002', name: 'Julius Accent Chair', category: 'ARMCHAIR', room: ['LIVING_ROOM'],
      priceUsd: 109900, description: 'Statement barrel chair in sand-tone performance fabric with brushed brass legs. Designed for the corner that deserves attention.',
      styleIds: ['modern', 'scandinavian'], colorFamily: ['neutral', 'warm-white'], materialTags: ['performance-fabric', 'metal'],
      dimensions: { w: 30, h: 36, d: 32 },
    },
    {
      sku: 'LR-CHAIR-003', name: 'Bucci Lounge Chair', category: 'ARMCHAIR', room: ['LIVING_ROOM'],
      priceUsd: 79900, description: 'Low-profile lounge chair in blush linen on a whitewashed oak frame. Casual yet considered — ideal for bohemian and coastal rooms.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['blush', 'warm-white'], materialTags: ['linen', 'oak'],
      dimensions: { w: 28, h: 30, d: 33 },
    },
    {
      sku: 'LR-CHAIR-004', name: 'Rouka Leather Chair', category: 'ARMCHAIR', room: ['LIVING_ROOM'],
      priceUsd: 74900, description: 'Saddle leather sling chair on a matte black powder-coated frame. Industrial minimalism at its most comfortable.',
      styleIds: ['industrial', 'modern'], colorFamily: ['charcoal', 'black'], materialTags: ['leather', 'metal'],
      dimensions: { w: 26, h: 33, d: 28 },
    },
    {
      sku: 'LR-CHAIR-005', name: 'Gwyneth Wingback Chair', category: 'ARMCHAIR', room: ['LIVING_ROOM'],
      priceUsd: 69900, description: 'Deep navy velvet wingback with hand-carved solid wood legs. Commanding presence, traditional proportions, thoroughly modern attitude.',
      styleIds: ['traditional', 'eclectic'], colorFamily: ['navy', 'neutral'], materialTags: ['velvet', 'solid-wood'],
      dimensions: { w: 30, h: 44, d: 32 },
    },
    {
      sku: 'LR-CHAIR-006', name: 'Avec Swivel Chair', category: 'ARMCHAIR', room: ['LIVING_ROOM'],
      priceUsd: 59900, description: 'Sage-green boucle swivel chair on a walnut veneer base. Generous, cozy, and the first place every guest gravitates to.',
      styleIds: ['mid-century', 'scandinavian'], colorFamily: ['sage', 'walnut-brown'], materialTags: ['boucle', 'walnut'],
      dimensions: { w: 30, h: 33, d: 32 },
    },

    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — COFFEE TABLES (6)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-CT-001', name: 'Slab Marble Coffee Table', category: 'COFFEE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 69900, description: 'Live-edge marble slab on brushed gold legs. Luxurious presence without overpowering the room.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['neutral', 'warm-white'], materialTags: ['marble', 'metal'],
      dimensions: { w: 48, h: 17, d: 26 },
    },
    {
      sku: 'LR-CT-002', name: 'Hairpin Coffee Table', category: 'COFFEE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 39900, description: 'Solid walnut top on hairpin metal legs. A mid-century classic that suits nearly every living room.',
      styleIds: ['mid-century', 'industrial'], colorFamily: ['walnut-brown', 'black'], materialTags: ['solid-wood', 'metal'],
      dimensions: { w: 48, h: 18, d: 24 },
    },
    {
      sku: 'LR-CT-003', name: 'Woven Rattan Coffee Table', category: 'COFFEE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 34900, description: 'Hand-woven rattan frame with glass top. Light and airy — lets the rug shine through.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan', 'glass'],
      dimensions: { w: 44, h: 16, d: 24 },
    },
    {
      sku: 'LR-CT-004', name: 'Drift Oak Coffee Table', category: 'COFFEE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 44900, description: 'Bleached oak with a thick slab profile and subtle curves. Quietly beautiful in a Scandinavian or Japandi space.',
      styleIds: ['scandinavian', 'japandi'], colorFamily: ['neutral', 'warm-white'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 50, h: 16, d: 26 },
    },
    {
      sku: 'LR-CT-005', name: 'Atlas Round Coffee Table', category: 'COFFEE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 54900, description: 'Black marble round top on a powder-coated metal base. Bold, graphic, and surprisingly versatile.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['charcoal', 'black'], materialTags: ['marble', 'metal'],
      dimensions: { w: 42, h: 16, d: 42 },
    },
    {
      sku: 'LR-CT-006', name: 'Nest Nesting Tables', category: 'COFFEE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 29900, description: 'Set of 2 walnut and metal nesting tables. Flexible, practical, and timeless.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['walnut-brown', 'neutral'], materialTags: ['walnut', 'metal'],
      dimensions: { w: 24, h: 20, d: 20 },
    },

    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — SIDE TABLES (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-ST-001', name: 'Brass Arc Side Table', category: 'SIDE_TABLE', room: ['LIVING_ROOM', 'BEDROOM'],
      priceUsd: 19900, description: 'Arched brass frame with a small marble tray top. Elegant, minimal, and easy to move.',
      styleIds: ['modern', 'mid-century'], colorFamily: ['warm-white', 'neutral'], materialTags: ['marble', 'metal'],
      dimensions: { w: 16, h: 24, d: 16 },
    },
    {
      sku: 'LR-ST-002', name: 'Mushroom Side Table', category: 'SIDE_TABLE', room: ['LIVING_ROOM', 'BEDROOM'],
      priceUsd: 14900, description: 'Organic sculpted ash wood with a mushroom silhouette. Works as a side table, plant stand, or stool.',
      styleIds: ['scandinavian', 'modern'], colorFamily: ['neutral', 'warm-white'], materialTags: ['solid-wood'],
      dimensions: { w: 14, h: 22, d: 14 },
    },
    {
      sku: 'LR-ST-003', name: 'Rattan Drum Table', category: 'SIDE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 12900, description: 'Woven rattan drum in a natural finish. A casual, boho accent that softens structured living rooms.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan'],
      dimensions: { w: 16, h: 18, d: 16 },
    },
    {
      sku: 'LR-ST-004', name: 'Pebble Side Table', category: 'SIDE_TABLE', room: ['LIVING_ROOM'],
      priceUsd: 17900, description: 'Stone-finished side table on a matte black steel base. Clean geometry for minimalist and Japandi spaces.',
      styleIds: ['minimalist', 'japandi'], colorFamily: ['charcoal', 'neutral'], materialTags: ['solid-wood', 'metal'],
      dimensions: { w: 15, h: 22, d: 15 },
    },

    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — FLOOR LAMPS (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-FL-001', name: 'Arc Floor Lamp', category: 'FLOOR_LAMP', room: ['LIVING_ROOM'],
      priceUsd: 24900, description: 'Long arching matte black steel lamp with a linen drum shade. Perfect over a sofa or reading chair.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['warm-white', 'black'], materialTags: ['metal'],
      dimensions: { w: 18, h: 72, d: 18 },
    },
    {
      sku: 'LR-FL-002', name: 'Rattan Orb Lamp', category: 'FLOOR_LAMP', room: ['LIVING_ROOM'],
      priceUsd: 18900, description: 'Woven rattan globe shade on a bamboo pole. Casts warm, dappled light for a relaxed bohemian atmosphere.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan'],
      dimensions: { w: 20, h: 60, d: 20 },
    },
    {
      sku: 'LR-FL-003', name: 'Tripod Floor Lamp', category: 'FLOOR_LAMP', room: ['LIVING_ROOM', 'HOME_OFFICE'],
      priceUsd: 21900, description: 'Solid walnut tripod base with a matte black cone shade. Handsome mid-century form with an industrial twist.',
      styleIds: ['mid-century', 'industrial'], colorFamily: ['walnut-brown', 'black'], materialTags: ['solid-wood', 'metal'],
      dimensions: { w: 18, h: 60, d: 18 },
    },
    {
      sku: 'LR-FL-004', name: 'Cone Floor Lamp', category: 'FLOOR_LAMP', room: ['LIVING_ROOM', 'HOME_OFFICE'],
      priceUsd: 17900, description: 'Slender steel stem with a geometric cone shade in warm white. Simple and refined.',
      styleIds: ['scandinavian', 'modern'], colorFamily: ['warm-white', 'neutral'], materialTags: ['metal'],
      dimensions: { w: 12, h: 58, d: 12 },
    },

    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — RUGS (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-RUG-001', name: 'Berber Wool Rug', category: 'RUG', room: ['LIVING_ROOM', 'BEDROOM'],
      priceUsd: 39900, description: 'Hand-knotted Moroccan-style rug in natural undyed wool with a diamond pattern. Adds texture and warmth.',
      styleIds: ['bohemian', 'traditional'], colorFamily: ['warm-white', 'neutral'], materialTags: ['wool'],
      dimensions: { w: 96, h: 1, d: 120 },
    },
    {
      sku: 'LR-RUG-002', name: 'Geometric Flatweave Rug', category: 'RUG', room: ['LIVING_ROOM'],
      priceUsd: 34900, description: 'Flat-woven wool rug with a bold charcoal-and-cream geometric pattern. Modern, graphic, and easy to clean.',
      styleIds: ['scandinavian', 'modern'], colorFamily: ['charcoal', 'neutral'], materialTags: ['wool'],
      dimensions: { w: 96, h: 1, d: 120 },
    },
    {
      sku: 'LR-RUG-003', name: 'Jute Natural Rug', category: 'RUG', room: ['LIVING_ROOM', 'DINING_ROOM'],
      priceUsd: 24900, description: 'Braided jute rug in a natural finish. Durable, sustainable, and a natural fit for coastal or bohemian rooms.',
      styleIds: ['bohemian', 'coastal', 'scandinavian'], colorFamily: ['neutral', 'warm-white'], materialTags: ['jute'],
      dimensions: { w: 96, h: 1, d: 120 },
    },
    {
      sku: 'LR-RUG-004', name: 'Terracotta Kilim Rug', category: 'RUG', room: ['LIVING_ROOM'],
      priceUsd: 44900, description: 'Flat-woven kilim in warm terracotta and rust tones with tribal motifs. Rich color that anchors bold interiors.',
      styleIds: ['bohemian', 'eclectic'], colorFamily: ['terracotta', 'neutral'], materialTags: ['wool'],
      dimensions: { w: 96, h: 1, d: 120 },
    },

    // ─────────────────────────────────────────────────────────────
    // LIVING ROOM — ARTWORK (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'LR-ART-001', name: 'Abstract Arch Print', category: 'ARTWORK', room: ['LIVING_ROOM', 'BEDROOM'],
      priceUsd: 14900, description: 'Minimalist abstract arch in muted warm tones, framed in thin aluminum. An easy complement to any neutral room.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['neutral', 'warm-white'], materialTags: ['metal'],
      dimensions: { w: 24, h: 36, d: 1 },
    },
    {
      sku: 'LR-ART-002', name: 'Botanical Gallery Set', category: 'ARTWORK', room: ['LIVING_ROOM', 'BEDROOM'],
      priceUsd: 12900, description: 'Set of 3 botanical prints in white oak frames. Serene and organic — at home in Scandinavian or coastal spaces.',
      styleIds: ['scandinavian', 'coastal'], colorFamily: ['sage', 'warm-white'], materialTags: ['solid-wood'],
      dimensions: { w: 12, h: 16, d: 1 },
    },
    {
      sku: 'LR-ART-003', name: 'Wabi-Sabi Brush Ink', category: 'ARTWORK', room: ['LIVING_ROOM', 'BEDROOM'],
      priceUsd: 17900, description: 'Large-format ink brush painting on rice paper, black float frame. Imperfect, meditative, distinctly Japandi.',
      styleIds: ['japandi', 'minimalist'], colorFamily: ['charcoal', 'warm-white'], materialTags: ['metal'],
      dimensions: { w: 30, h: 40, d: 1 },
    },
    {
      sku: 'LR-ART-004', name: 'Retro Geometric Print', category: 'ARTWORK', room: ['LIVING_ROOM'],
      priceUsd: 11900, description: 'Bold 70s-inspired geometric shapes in terracotta, blush, and cream. A playful nod to mid-century graphic design.',
      styleIds: ['mid-century', 'eclectic'], colorFamily: ['terracotta', 'blush'], materialTags: ['solid-wood'],
      dimensions: { w: 20, h: 28, d: 1 },
    },

    // ─────────────────────────────────────────────────────────────
    // BEDROOM — BED FRAMES (6)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'BR-BED-001', name: 'Linen Platform Bed', category: 'BED_FRAME', room: ['BEDROOM'],
      priceUsd: 119900, description: 'Low-profile platform bed in oatmeal linen with solid oak slats. Quiet, grounded, and impeccably Scandinavian.',
      styleIds: ['minimalist', 'scandinavian'], colorFamily: ['neutral', 'warm-white'], materialTags: ['linen', 'oak'],
      dimensions: { w: 64, h: 38, d: 86 },
    },
    {
      sku: 'BR-BED-002', name: 'Rattan Headboard Bed', category: 'BED_FRAME', room: ['BEDROOM'],
      priceUsd: 99900, description: 'Arched rattan headboard on a solid wood base. Brings warmth and texture to any bedroom.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan', 'solid-wood'],
      dimensions: { w: 64, h: 58, d: 86 },
    },
    {
      sku: 'BR-BED-003', name: 'Walnut Slat Bed', category: 'BED_FRAME', room: ['BEDROOM'],
      priceUsd: 139900, description: 'American walnut with an exposed slatted headboard. Rich grain, clean lines, classic mid-century execution.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['walnut-brown', 'neutral'], materialTags: ['walnut'],
      dimensions: { w: 64, h: 46, d: 86 },
    },
    {
      sku: 'BR-BED-004', name: 'Upholstered Wingback Bed', category: 'BED_FRAME', room: ['BEDROOM'],
      priceUsd: 159900, description: 'Tall wingback headboard in deep navy velvet. Dramatic and cozy — a traditional bedroom staple.',
      styleIds: ['traditional', 'glam'], colorFamily: ['navy', 'charcoal'], materialTags: ['velvet', 'solid-wood'],
      dimensions: { w: 64, h: 64, d: 86 },
    },
    {
      sku: 'BR-BED-005', name: 'Japandi Low Bed', category: 'BED_FRAME', room: ['BEDROOM'],
      priceUsd: 89900, description: 'Ultra-low Japandi bed in charcoal oak with a minimal floating headboard. Peaceful, grounded, effortlessly calm.',
      styleIds: ['japandi', 'minimalist'], colorFamily: ['charcoal', 'neutral'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 64, h: 16, d: 86 },
    },
    {
      sku: 'BR-BED-006', name: 'Iron Canopy Bed', category: 'BED_FRAME', room: ['BEDROOM'],
      priceUsd: 129900, description: 'Matte black iron canopy frame — minimal, architectural, and surprisingly romantic when dressed with linen.',
      styleIds: ['industrial', 'eclectic'], colorFamily: ['black', 'warm-white'], materialTags: ['metal'],
      dimensions: { w: 64, h: 80, d: 86 },
    },

    // ─────────────────────────────────────────────────────────────
    // BEDROOM — DRESSERS (5)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'BR-DR-001', name: '6-Drawer Oak Dresser', category: 'DRESSER', room: ['BEDROOM'],
      priceUsd: 79900, description: 'Six-drawer dresser in white oak with brushed brass pulls. Generous storage with refined Scandinavian simplicity.',
      styleIds: ['scandinavian', 'modern'], colorFamily: ['warm-white', 'oak'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 60, h: 34, d: 18 },
    },
    {
      sku: 'BR-DR-002', name: 'Rattan Front Dresser', category: 'DRESSER', room: ['BEDROOM'],
      priceUsd: 69900, description: 'Woven rattan drawer fronts on a solid wood frame. Texture-forward and naturally beautiful.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan', 'solid-wood'],
      dimensions: { w: 56, h: 36, d: 18 },
    },
    {
      sku: 'BR-DR-003', name: 'Walnut Mid-Century Dresser', category: 'DRESSER', room: ['BEDROOM'],
      priceUsd: 89900, description: 'Eight-drawer walnut dresser on angled legs. A mid-century icon updated with soft-close hardware.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['walnut-brown'], materialTags: ['walnut'],
      dimensions: { w: 62, h: 32, d: 18 },
    },
    {
      sku: 'BR-DR-004', name: 'Fluted White Dresser', category: 'DRESSER', room: ['BEDROOM'],
      priceUsd: 74900, description: 'Fluted solid wood drawer fronts in a bright white finish. Elegant and airy — works in modern and traditional bedrooms.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['warm-white', 'neutral'], materialTags: ['solid-wood'],
      dimensions: { w: 56, h: 34, d: 18 },
    },
    {
      sku: 'BR-DR-005', name: 'Dark Lacquer Dresser', category: 'DRESSER', room: ['BEDROOM'],
      priceUsd: 84900, description: 'Glossy charcoal lacquer with brushed black hardware. Sleek, bold, and a natural fit for modern industrial spaces.',
      styleIds: ['modern', 'industrial'], colorFamily: ['charcoal', 'black'], materialTags: ['lacquer', 'metal'],
      dimensions: { w: 58, h: 36, d: 18 },
    },

    // ─────────────────────────────────────────────────────────────
    // BEDROOM — NIGHTSTANDS (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'BR-NS-001', name: 'Floating Oak Nightstand', category: 'SIDE_TABLE', room: ['BEDROOM'],
      priceUsd: 19900, description: 'Wall-mounted floating shelf in white oak with a single drawer. Space-saving and cleanly Scandinavian.',
      styleIds: ['scandinavian', 'minimalist'], colorFamily: ['warm-white', 'oak'], materialTags: ['oak'],
      dimensions: { w: 18, h: 6, d: 12 },
    },
    {
      sku: 'BR-NS-002', name: 'Wicker Drum Nightstand', category: 'SIDE_TABLE', room: ['BEDROOM'],
      priceUsd: 14900, description: 'Cylindrical rattan nightstand with open shelf. Light and organic — perfect beside a bohemian or coastal bed.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan'],
      dimensions: { w: 16, h: 22, d: 16 },
    },
    {
      sku: 'BR-NS-003', name: 'Marble Top Nightstand', category: 'SIDE_TABLE', room: ['BEDROOM'],
      priceUsd: 24900, description: 'White marble tray top with a slim brass frame and one shelf. A luxe detail in a calm bedroom.',
      styleIds: ['modern', 'glam'], colorFamily: ['warm-white', 'neutral'], materialTags: ['marble', 'metal'],
      dimensions: { w: 18, h: 24, d: 14 },
    },
    {
      sku: 'BR-NS-004', name: 'Walnut Nightstand', category: 'SIDE_TABLE', room: ['BEDROOM'],
      priceUsd: 19900, description: 'Compact walnut nightstand with a tapered leg and single drawer. A timeless mid-century companion.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['walnut-brown'], materialTags: ['walnut'],
      dimensions: { w: 18, h: 24, d: 16 },
    },

    // ─────────────────────────────────────────────────────────────
    // BEDROOM — TABLE LAMPS (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'BR-TL-001', name: 'Ceramic Base Lamp', category: 'TABLE_LAMP', room: ['BEDROOM'],
      priceUsd: 11900, description: 'Sage green ceramic base with a white linen shade. Soft, organic, and a natural fit for coastal and Scandinavian bedrooms.',
      styleIds: ['scandinavian', 'coastal'], colorFamily: ['sage', 'warm-white'], materialTags: ['ceramic'],
      dimensions: { w: 8, h: 20, d: 8 },
    },
    {
      sku: 'BR-TL-002', name: 'Rattan Pendant Lamp', category: 'TABLE_LAMP', room: ['BEDROOM'],
      priceUsd: 8900, description: 'Small woven rattan lampshade on a brass cord. Plug-in style — no electrician needed. Bohemian and charming.',
      styleIds: ['bohemian'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan'],
      dimensions: { w: 10, h: 14, d: 10 },
    },
    {
      sku: 'BR-TL-003', name: 'Brass Gooseneck Lamp', category: 'TABLE_LAMP', room: ['BEDROOM', 'HOME_OFFICE'],
      priceUsd: 14900, description: 'Articulating brass gooseneck with a matte black base. Practical, characterful, and endlessly adjustable.',
      styleIds: ['mid-century', 'industrial'], colorFamily: ['warm-white', 'black'], materialTags: ['metal'],
      dimensions: { w: 6, h: 18, d: 6 },
    },
    {
      sku: 'BR-TL-004', name: 'Mushroom Table Lamp', category: 'TABLE_LAMP', room: ['BEDROOM'],
      priceUsd: 12900, description: 'Frosted glass mushroom form with a warm LED globe. Soft diffused glow perfect for bedside reading.',
      styleIds: ['modern', 'japandi'], colorFamily: ['neutral', 'warm-white'], materialTags: ['glass', 'metal'],
      dimensions: { w: 9, h: 16, d: 9 },
    },

    // ─────────────────────────────────────────────────────────────
    // BEDROOM — MIRRORS (3)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'BR-MR-001', name: 'Arched Antique Mirror', category: 'MIRROR', room: ['BEDROOM'],
      priceUsd: 29900, description: 'Arched full-length mirror in an antiqued gold wood frame. Warm and elegant — a timeless bedroom focal point.',
      styleIds: ['traditional', 'eclectic'], colorFamily: ['warm-white'], materialTags: ['solid-wood'],
      dimensions: { w: 24, h: 60, d: 1 },
    },
    {
      sku: 'BR-MR-002', name: 'Round Rattan Mirror', category: 'MIRROR', room: ['BEDROOM'],
      priceUsd: 17900, description: 'Round mirror with a woven rattan frame. A boho-coastal accent that brings texture to a bedroom wall.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan'],
      dimensions: { w: 28, h: 28, d: 2 },
    },
    {
      sku: 'BR-MR-003', name: 'Minimal Rectangle Mirror', category: 'MIRROR', room: ['BEDROOM'],
      priceUsd: 14900, description: 'Lean, frameless-look mirror with a thin matte black metal edge. Clean and graphic for modern and industrial bedrooms.',
      styleIds: ['modern', 'scandinavian'], colorFamily: ['charcoal', 'black'], materialTags: ['metal'],
      dimensions: { w: 24, h: 48, d: 1 },
    },

    // ─────────────────────────────────────────────────────────────
    // DINING ROOM — DINING TABLES (5)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'DR-TBL-001', name: 'Farmhouse Oak Table', category: 'DINING_TABLE', room: ['DINING_ROOM'],
      priceUsd: 119900, description: 'Solid white oak with a trestle base and live-edge detail. Seats 6 comfortably. Warm, relaxed, and built to last.',
      styleIds: ['traditional', 'scandinavian'], colorFamily: ['warm-white', 'oak'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 36, h: 30, d: 72 },
    },
    {
      sku: 'DR-TBL-002', name: 'Tulip Round Table', category: 'DINING_TABLE', room: ['DINING_ROOM'],
      priceUsd: 99900, description: 'Pedestal base in white with a round Carrara marble top. A mid-century icon that opens up small dining rooms.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['warm-white', 'neutral'], materialTags: ['marble', 'metal'],
      dimensions: { w: 48, h: 29, d: 48 },
    },
    {
      sku: 'DR-TBL-003', name: 'Industrial Trestle Table', category: 'DINING_TABLE', room: ['DINING_ROOM'],
      priceUsd: 139900, description: 'Reclaimed wood plank top on a matte black steel trestle base. Seats 8. Raw, strong, and full of character.',
      styleIds: ['industrial', 'modern'], colorFamily: ['walnut-brown', 'black'], materialTags: ['solid-wood', 'metal'],
      dimensions: { w: 36, h: 30, d: 84 },
    },
    {
      sku: 'DR-TBL-004', name: 'Japandi Slab Table', category: 'DINING_TABLE', room: ['DINING_ROOM'],
      priceUsd: 109900, description: 'Thick solid oak slab in a charcoal finish with simple block legs. Calm, weighty, and quietly stunning.',
      styleIds: ['japandi', 'minimalist'], colorFamily: ['charcoal', 'neutral'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 36, h: 30, d: 72 },
    },
    {
      sku: 'DR-TBL-005', name: 'Glass Brass Dining Table', category: 'DINING_TABLE', room: ['DINING_ROOM'],
      priceUsd: 159900, description: 'Tempered glass top on a brushed brass frame. Seats 6. Airy and glamorous — makes any dining room feel larger.',
      styleIds: ['modern', 'glam'], colorFamily: ['warm-white', 'neutral'], materialTags: ['glass', 'metal'],
      dimensions: { w: 36, h: 30, d: 72 },
    },

    // ─────────────────────────────────────────────────────────────
    // DINING ROOM — DINING CHAIRS (6, sold as sets of 2)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'DR-CHR-001', name: 'Wishbone Chair Set', category: 'DINING_CHAIR', room: ['DINING_ROOM'],
      priceUsd: 39900, description: 'Set of 2 wishbone chairs in white oak with a paper cord seat. A Scandinavian classic that fits every table.',
      styleIds: ['scandinavian', 'mid-century'], colorFamily: ['warm-white', 'oak'], materialTags: ['solid-wood'],
      dimensions: { w: 20, h: 30, d: 20 },
    },
    {
      sku: 'DR-CHR-002', name: 'Velvet Dining Chair Set', category: 'DINING_CHAIR', room: ['DINING_ROOM'],
      priceUsd: 34900, description: 'Set of 2 upholstered dining chairs in blush velvet on a gold metal base. Glamorous and surprisingly comfortable.',
      styleIds: ['eclectic', 'glam'], colorFamily: ['blush', 'navy'], materialTags: ['velvet', 'metal'],
      dimensions: { w: 18, h: 33, d: 20 },
    },
    {
      sku: 'DR-CHR-003', name: 'Rattan Back Chair Set', category: 'DINING_CHAIR', room: ['DINING_ROOM'],
      priceUsd: 29900, description: 'Set of 2 chairs with rattan backing and a solid wood frame. Relaxed coastal energy for any dining room.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan', 'solid-wood'],
      dimensions: { w: 18, h: 34, d: 20 },
    },
    {
      sku: 'DR-CHR-004', name: 'Leather Saddle Chair Set', category: 'DINING_CHAIR', room: ['DINING_ROOM'],
      priceUsd: 44900, description: 'Set of 2 saddle-seat chairs in full-grain leather on a matte black base. Rugged and refined.',
      styleIds: ['industrial', 'modern'], colorFamily: ['charcoal', 'black'], materialTags: ['leather', 'metal'],
      dimensions: { w: 19, h: 33, d: 21 },
    },
    {
      sku: 'DR-CHR-005', name: 'Ghost Chair Set', category: 'DINING_CHAIR', room: ['DINING_ROOM'],
      priceUsd: 24900, description: 'Set of 2 clear polycarbonate chairs. Invisible by design — lets your table, rug, and space do the talking.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['neutral', 'warm-white'], materialTags: ['polycarbonate'],
      dimensions: { w: 17, h: 35, d: 19 },
    },
    {
      sku: 'DR-CHR-006', name: 'Parsons Chair Set', category: 'DINING_CHAIR', room: ['DINING_ROOM'],
      priceUsd: 37900, description: 'Set of 2 fully upholstered parsons chairs in navy velvet. Classic, comfortable, and endlessly dressy.',
      styleIds: ['traditional', 'glam'], colorFamily: ['navy', 'warm-white'], materialTags: ['velvet', 'solid-wood'],
      dimensions: { w: 19, h: 36, d: 22 },
    },

    // ─────────────────────────────────────────────────────────────
    // DINING ROOM — SIDEBOARDS (3)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'DR-SB-001', name: 'Cane Front Sideboard', category: 'STORAGE', room: ['DINING_ROOM'],
      priceUsd: 89900, description: 'White oak frame with cane door fronts and brass handles. Storage that doubles as a statement.',
      styleIds: ['scandinavian', 'bohemian'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan', 'solid-wood'],
      dimensions: { w: 60, h: 32, d: 16 },
    },
    {
      sku: 'DR-SB-002', name: 'Mid-Century Sideboard', category: 'STORAGE', room: ['DINING_ROOM'],
      priceUsd: 109900, description: 'Classic 4-door walnut sideboard on hairpin legs. Generous storage with authentic mid-century proportions.',
      styleIds: ['mid-century', 'modern'], colorFamily: ['walnut-brown'], materialTags: ['walnut'],
      dimensions: { w: 66, h: 30, d: 16 },
    },
    {
      sku: 'DR-SB-003', name: 'Industrial Steel Sideboard', category: 'STORAGE', room: ['DINING_ROOM'],
      priceUsd: 79900, description: 'Brushed steel with a reclaimed wood shelf. Raw, functional, and perfect for industrial dining rooms.',
      styleIds: ['industrial', 'modern'], colorFamily: ['charcoal', 'black'], materialTags: ['metal', 'solid-wood'],
      dimensions: { w: 60, h: 30, d: 15 },
    },

    // ─────────────────────────────────────────────────────────────
    // HOME OFFICE — DESKS (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'HO-DSK-001', name: 'Solid Oak Writing Desk', category: 'DESK', room: ['HOME_OFFICE'],
      priceUsd: 59900, description: 'Solid oak writing desk with a single pencil drawer. Quiet beauty for a focused workspace.',
      styleIds: ['scandinavian', 'minimalist'], colorFamily: ['warm-white', 'oak'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 55, h: 30, d: 24 },
    },
    {
      sku: 'HO-DSK-002', name: 'Hairpin Writing Desk', category: 'DESK', room: ['HOME_OFFICE'],
      priceUsd: 44900, description: 'Solid walnut desktop on hairpin legs. Compact and characterful — perfect for small home offices.',
      styleIds: ['mid-century', 'industrial'], colorFamily: ['walnut-brown', 'black'], materialTags: ['solid-wood', 'metal'],
      dimensions: { w: 48, h: 30, d: 22 },
    },
    {
      sku: 'HO-DSK-003', name: 'Height-Adjustable Desk', category: 'DESK', room: ['HOME_OFFICE'],
      priceUsd: 79900, description: 'Electric standing desk with a bamboo top and black steel frame. Work your way — sitting or standing.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['charcoal', 'black'], materialTags: ['metal', 'solid-wood'],
      dimensions: { w: 60, h: 30, d: 24 },
    },
    {
      sku: 'HO-DSK-004', name: 'Corner L-Desk', category: 'DESK', room: ['HOME_OFFICE'],
      priceUsd: 54900, description: 'L-shaped corner desk in light oak. Maximizes workspace in tight corners with Japandi simplicity.',
      styleIds: ['japandi', 'modern'], colorFamily: ['neutral', 'warm-white'], materialTags: ['oak'],
      dimensions: { w: 55, h: 30, d: 55 },
    },

    // ─────────────────────────────────────────────────────────────
    // HOME OFFICE — DESK CHAIRS (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'HO-DC-001', name: 'Ergonomic Mesh Chair', category: 'DESK_CHAIR', room: ['HOME_OFFICE'],
      priceUsd: 49900, description: 'Fully adjustable ergonomic chair with breathable mesh back. Where comfort meets function.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['charcoal', 'black'], materialTags: ['mesh', 'metal'],
      dimensions: { w: 26, h: 46, d: 26 },
    },
    {
      sku: 'HO-DC-002', name: 'Leather Executive Chair', category: 'DESK_CHAIR', room: ['HOME_OFFICE'],
      priceUsd: 69900, description: 'Full-grain leather executive chair with lumbar support and chrome base. A home office that means business.',
      styleIds: ['traditional', 'industrial'], colorFamily: ['charcoal', 'black'], materialTags: ['leather', 'metal'],
      dimensions: { w: 27, h: 48, d: 28 },
    },
    {
      sku: 'HO-DC-003', name: 'Velvet Desk Chair', category: 'DESK_CHAIR', room: ['HOME_OFFICE'],
      priceUsd: 39900, description: 'Sage velvet desk chair on a walnut base. Stylish enough to keep out even when guests arrive.',
      styleIds: ['mid-century', 'eclectic'], colorFamily: ['sage', 'blush'], materialTags: ['velvet', 'walnut'],
      dimensions: { w: 24, h: 40, d: 24 },
    },
    {
      sku: 'HO-DC-004', name: 'Wooden Saddle Stool', category: 'DESK_CHAIR', room: ['HOME_OFFICE'],
      priceUsd: 29900, description: 'Contoured saddle seat in solid beech wood with an adjustable height spindle. Active sitting at its most elegant.',
      styleIds: ['modern', 'scandinavian'], colorFamily: ['warm-white', 'neutral'], materialTags: ['solid-wood'],
      dimensions: { w: 16, h: 28, d: 16 },
    },

    // ─────────────────────────────────────────────────────────────
    // HOME OFFICE — BOOKSHELVES (4)
    // ─────────────────────────────────────────────────────────────
    {
      sku: 'HO-BS-001', name: 'Ladder Bookshelf', category: 'BOOKSHELF', room: ['HOME_OFFICE', 'LIVING_ROOM'],
      priceUsd: 39900, description: 'Leaning ladder shelf in white oak with 5 tiers. Open storage that feels light and unimposing.',
      styleIds: ['scandinavian', 'modern'], colorFamily: ['warm-white', 'oak'], materialTags: ['oak', 'solid-wood'],
      dimensions: { w: 24, h: 72, d: 14 },
    },
    {
      sku: 'HO-BS-002', name: 'Industrial Pipe Shelving', category: 'BOOKSHELF', room: ['HOME_OFFICE', 'LIVING_ROOM'],
      priceUsd: 34900, description: 'Wall-mounted reclaimed wood shelves on black pipe brackets. Raw, practical, and full of character.',
      styleIds: ['industrial', 'modern'], colorFamily: ['charcoal', 'black'], materialTags: ['metal', 'solid-wood'],
      dimensions: { w: 36, h: 48, d: 10 },
    },
    {
      sku: 'HO-BS-003', name: 'Cube Bookcase', category: 'BOOKSHELF', room: ['HOME_OFFICE'],
      priceUsd: 29900, description: '9-cube modular bookcase in white. Totally flexible — add baskets, books, and display pieces as you like.',
      styleIds: ['modern', 'minimalist'], colorFamily: ['warm-white', 'neutral'], materialTags: ['solid-wood'],
      dimensions: { w: 43, h: 43, d: 15 },
    },
    {
      sku: 'HO-BS-004', name: 'Rattan Bookshelf', category: 'BOOKSHELF', room: ['HOME_OFFICE'],
      priceUsd: 44900, description: 'Open-back bookshelf with rattan-front shelves and a solid wood frame. Natural texture meets orderly storage.',
      styleIds: ['bohemian', 'coastal'], colorFamily: ['warm-white', 'neutral'], materialTags: ['rattan', 'solid-wood'],
      dimensions: { w: 30, h: 60, d: 12 },
    },
  ]

  let created = 0
  for (const p of products) {
    await prisma.product.create({
      data: {
        retailerId: retailer.id,
        sku: p.sku,
        name: p.name,
        description: p.description,
        category: p.category as never,
        room: p.room as never,
        priceUsd: p.priceUsd,
        imageUrl: img(p.sku, p.name, p.category),
        thumbnailUrl: thumb(p.sku, p.name, p.category),
        styleIds: p.styleIds,
        colorFamily: p.colorFamily,
        materialTags: p.materialTags,
        dimensions: p.dimensions ?? null,
        inStock: true,
      },
    })
    created++
  }

  console.log(`\n✅ Seeded ${created} products`)
  console.log(`\nRETAILER_ID=${retailer.id}`)
  console.log('\nAdd RETAILER_ID to your .env.local file.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
