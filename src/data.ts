/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon, Order } from './types';

// The 14 signature handcrafted products
const ORIGINAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Midnight Onyx Premium Cotton Panjabi',
    slug: 'midnight-onyx-premium-cotton-panjabi',
    sku: 'VRS-PNJ-001',
    category: 'panjabi',
    description: 'A masterpiece of understated luxury. Crafted from premium long-staple Egyptian cotton, this deep onyx Panjabi features delicate tonal embroidery along the placket and collar. The fine weave offers an exquisite drape and subtle natural luster, making it the perfect choice for prestigious occasions and evening celebrations.',
    fabricDetails: {
      material: '100% Giza Egyptian Cotton (200s Double Thread)',
      care: [
        'Dry clean recommended for first wash',
        'Hand wash cold separately with mild detergent',
        'Do not bleach',
        'Line dry in shade',
        'Warm iron inside out'
      ]
    },
    price: 4890,
    compareAtPrice: 5990,
    variants: [
      { size: '36', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 12, sku: 'VRS-PNJ-001-36-BLK' },
      { size: '38', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 15, sku: 'VRS-PNJ-001-38-BLK' },
      { size: '40', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 8, sku: 'VRS-PNJ-001-40-BLK' },
      { size: '42', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 6, sku: 'VRS-PNJ-001-42-BLK' },
      { size: '44', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 3, sku: 'VRS-PNJ-001-44-BLK' },
      { size: '36', color: { name: 'Midnight Navy', hex: '#111827' }, stock: 8, sku: 'VRS-PNJ-001-36-NVY' },
      { size: '38', color: { name: 'Midnight Navy', hex: '#111827' }, stock: 10, sku: 'VRS-PNJ-001-38-NVY' },
      { size: '40', color: { name: 'Midnight Navy', hex: '#111827' }, stock: 12, sku: 'VRS-PNJ-001-40-NVY' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop', alt: 'Midnight Onyx Panjabi - Front View', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop', alt: 'Midnight Onyx Panjabi - Side Detail', isPrimary: false }
    ],
    tags: ['best-seller', 'eid-collection', 'signature'],
    ratings: { average: 4.8, count: 42 },
    reviews: [
      { id: 'rev-1-1', author: 'Adnan Chowdhury', rating: 5, date: '2026-06-15', comment: 'The fabric quality is outstanding. It feels incredibly smooth and the onyx black color is deep and rich. Worth every Taka!', verified: true },
      { id: 'rev-1-2', author: 'Naimul Hasan', rating: 4, date: '2026-06-20', comment: 'Perfect fit and elegant look. The embroidery is very subtle which I love. Delivery took 2 days in Dhaka.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-07-01T15:30:00Z'
  },
  {
    id: 'prod-2',
    name: 'Ivory Heritage Mulberry Silk Panjabi',
    slug: 'ivory-heritage-mulberry-silk-panjabi',
    sku: 'VRS-PNJ-002',
    category: 'panjabi',
    description: 'Woven with the finest hand-spun Mulberry silk from the heritage looms of Rajshahi, this Ivory Heritage Panjabi is the epitome of pure luxury. Featuring hand-carved mother-of-pearl buttons and custom delicate needlework details on the collar, this piece offers an unmatched light sheen and a majestic drape.',
    fabricDetails: {
      material: '100% Rajshahi Mulberry Silk (Premium Handloom)',
      care: [
        'Dry clean only',
        'Store in a cotton bag away from direct sunlight',
        'Do not wring or twist',
        'Iron at low heat with a press cloth'
      ]
    },
    price: 6890,
    compareAtPrice: 7990,
    variants: [
      { size: '36', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 5, sku: 'VRS-PNJ-002-36-IVY' },
      { size: '38', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 8, sku: 'VRS-PNJ-002-38-IVY' },
      { size: '40', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 6, sku: 'VRS-PNJ-002-40-IVY' },
      { size: '42', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 4, sku: 'VRS-PNJ-002-42-IVY' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop', alt: 'Ivory Heritage Silk Panjabi - Front Display', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1611590027211-b954fd027b51?w=800&q=80&fit=crop', alt: 'Ivory Heritage Silk Panjabi - Fabric Texture', isPrimary: false }
    ],
    tags: ['new-arrival', 'premium-silk', 'heritage'],
    ratings: { average: 4.9, count: 18 },
    reviews: [
      { id: 'rev-2-1', author: 'Zubayer Rahman', rating: 5, date: '2026-06-25', comment: 'Speechless. The Rajshahi silk has such a beautiful texture. Perfect wedding wear.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-10T11:00:00Z',
    updatedAt: '2026-07-03T12:00:00Z'
  },
  {
    id: 'prod-3',
    name: 'Imperial Velvet Wedding Koti',
    slug: 'imperial-velvet-wedding-koti',
    sku: 'VRS-KOT-001',
    category: 'koti',
    description: 'Designed to elevate your traditional silhouette, this Koti is tailored from luxurious, high-density Italian cotton velvet. Featuring a classic Nehru collar, satin-lined interiors, and antique gold-finished metallic buttons, it adds an instant layer of regal elegance when worn over our Signature Panjabis.',
    fabricDetails: {
      material: 'Premium Italian Velvet (100% Cotton Base) with Imperial Satin Lining',
      care: [
        'Dry clean only',
        'Steam iron only (do not press direct heat)',
        'Brush with soft bristle brush to maintain pile'
      ]
    },
    price: 5490,
    compareAtPrice: 6500,
    variants: [
      { size: '36', color: { name: 'Royal Navy', hex: '#1E293B' }, stock: 6, sku: 'VRS-KOT-001-36-NVY' },
      { size: '38', color: { name: 'Royal Navy', hex: '#1E293B' }, stock: 10, sku: 'VRS-KOT-001-38-NVY' },
      { size: '40', color: { name: 'Royal Navy', hex: '#1E293B' }, stock: 8, sku: 'VRS-KOT-001-40-NVY' },
      { size: '42', color: { name: 'Royal Navy', hex: '#1E293B' }, stock: 4, sku: 'VRS-KOT-001-42-NVY' },
      { size: '36', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 4, sku: 'VRS-KOT-001-36-EMR' },
      { size: '38', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 6, sku: 'VRS-KOT-001-38-EMR' },
      { size: '40', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 5, sku: 'VRS-KOT-001-40-EMR' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop', alt: 'Imperial Velvet Koti - Front Angle', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&fit=crop', alt: 'Imperial Velvet Koti - Model Fit', isPrimary: false }
    ],
    tags: ['royal-collection', 'best-seller', 'wedding-edit'],
    ratings: { average: 4.7, count: 29 },
    reviews: [
      { id: 'rev-3-1', author: 'Mahtab Uddin', rating: 5, date: '2026-06-18', comment: 'Excellent cut and fitting. The deep navy velvet shines beautifully under wedding lights.', verified: true },
      { id: 'rev-3-2', author: 'Tahmid Khan', rating: 4, date: '2026-06-22', comment: 'Very high premium velvet. Fits extremely well over the panjabi. Recommended.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-05T09:00:00Z',
    updatedAt: '2026-07-05T14:20:00Z'
  },
  {
    id: 'prod-4',
    name: 'Brocade Gold Artisan Koti',
    slug: 'brocade-gold-artisan-koti',
    sku: 'VRS-KOT-002',
    category: 'koti',
    description: 'Indulge in pure craftsmanship. This Koti features exquisite gold Zari weaving in intricate floral motifs across a rich silk-blend brocade canvas. Outfitted with premium champagne-gold buttons and double-piped welt pockets, it is a statement piece of heritage design reimagined for the modern gentleman.',
    fabricDetails: {
      material: 'Premium Banarasi Brocade Silk Blend (60% Silk, 40% Zari Cotton)',
      care: [
        'Dry clean only',
        'Do not iron directly on Zari threads',
        'Store wrapped in soft muslin cloth'
      ]
    },
    price: 5890,
    variants: [
      { size: '36', color: { name: 'Champagne Gold', hex: '#D4AF37' }, stock: 4, sku: 'VRS-KOT-002-36-GLD' },
      { size: '38', color: { name: 'Champagne Gold', hex: '#D4AF37' }, stock: 6, sku: 'VRS-KOT-002-38-GLD' },
      { size: '40', color: { name: 'Champagne Gold', hex: '#D4AF37' }, stock: 6, sku: 'VRS-KOT-002-40-GLD' },
      { size: '42', color: { name: 'Champagne Gold', hex: '#D4AF37' }, stock: 3, sku: 'VRS-KOT-002-42-GLD' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop', alt: 'Brocade Gold Koti - Front View', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=80&fit=crop', alt: 'Brocade Gold Koti - Artisan Details', isPrimary: false }
    ],
    tags: ['artisan', 'new-arrival', 'royal-collection'],
    ratings: { average: 5.0, count: 12 },
    reviews: [
      { id: 'rev-4-1', author: 'Sajid Ahmed', rating: 5, date: '2026-06-29', comment: 'The Zari embroidery is extremely precise. Feels and looks like royalty.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-12T14:00:00Z',
    updatedAt: '2026-07-06T10:00:00Z'
  },
  {
    id: 'prod-5',
    name: 'Imperial Ivory Hand-Embroidered Sherwani',
    slug: 'imperial-ivory-hand-embroidered-sherwani',
    sku: 'VRS-SHR-001',
    category: 'sherwani',
    description: 'Designed for the groom of the season, our Imperial Ivory Sherwani is tailored from ultra-premium raw silk. It features majestic hand-embroidered Zardozi, resham threadwork, and dabka details meticulously crafted by master artisans over 120 hours. Complete with a padded shoulder structure, custom inner lining, and brass-gilt royal buttons.',
    fabricDetails: {
      material: '100% Pure Raw Silk with Hand-Sewn Zardozi and Metallic Zari Thread',
      care: [
        'Professional dry clean only by heritage specialists',
        'Keep stored flat in specialized suit bags',
        'Avoid contact with water or liquid perfume'
      ]
    },
    price: 14500,
    compareAtPrice: 17500,
    variants: [
      { size: '36', color: { name: 'Imperial Ivory', hex: '#FFFFF0' }, stock: 3, sku: 'VRS-SHR-001-36-IVY' },
      { size: '38', color: { name: 'Imperial Ivory', hex: '#FFFFF0' }, stock: 4, sku: 'VRS-SHR-001-38-IVY' },
      { size: '40', color: { name: 'Imperial Ivory', hex: '#FFFFF0' }, stock: 2, sku: 'VRS-SHR-001-40-IVY' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80&fit=crop', alt: 'Imperial Ivory Sherwani - Groom Presentation', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=800&q=80&fit=crop', alt: 'Imperial Ivory Sherwani - Detail Collar Close-up', isPrimary: false }
    ],
    tags: ['groom-collection', 'signature', 'royal-collection'],
    ratings: { average: 4.9, count: 15 },
    reviews: [
      { id: 'rev-5-1', author: 'Ishraq Al-Hussain', rating: 5, date: '2026-06-10', comment: 'Bought this for my wedding. The fitting was flawless, and the craftsmanship left everyone in awe. True masterpiece.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-05-28T08:00:00Z',
    updatedAt: '2026-07-02T16:00:00Z'
  },
  {
    id: 'prod-6',
    name: 'Majestic Royal Maroon Sherwani',
    slug: 'majestic-royal-maroon-sherwani',
    sku: 'VRS-SHR-002',
    category: 'sherwani',
    description: 'A striking statement of deep heritage. This Sherwani is tailored from high-density, structured maroon Jamdani silk brocade, presenting a subtle raised weave. Trimmed with velvet borders on the collar and cuffs, and accentuated with brilliant ruby-accented custom buttons, it is perfect for premier wedding affairs and grand receptions.',
    fabricDetails: {
      material: 'Royal Jamdani Silk Brocade (80% Raw Silk, 20% Cotton Blend)',
      care: [
        'Dry clean only by certified luxury specialists',
        'Do not steam-press cuffs or velvet trim directly',
        'Store in cool, dark wardrobe with moth protection'
      ]
    },
    price: 12900,
    variants: [
      { size: '36', color: { name: 'Royal Maroon', hex: '#58111A' }, stock: 2, sku: 'VRS-SHR-002-36-MRN' },
      { size: '38', color: { name: 'Royal Maroon', hex: '#58111A' }, stock: 3, sku: 'VRS-SHR-002-38-MRN' },
      { size: '40', color: { name: 'Royal Maroon', hex: '#58111A' }, stock: 5, sku: 'VRS-SHR-002-40-MRN' },
      { size: '42', color: { name: 'Royal Maroon', hex: '#58111A' }, stock: 2, sku: 'VRS-SHR-002-42-MRN' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1597983073492-7b448ee055a4?w=800&q=80&fit=crop', alt: 'Majestic Maroon Sherwani - Front Elegance', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fit=crop', alt: 'Majestic Maroon Sherwani - Shoulder Stitching', isPrimary: false }
    ],
    tags: ['groom-collection', 'new-arrival'],
    ratings: { average: 4.6, count: 9 },
    reviews: [
      { id: 'rev-6-1', author: 'Faizul Islam', rating: 5, date: '2026-06-28', comment: 'The crimson maroon shade is breathtaking. Outstanding shoulder padding and drape.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-15T15:00:00Z',
    updatedAt: '2026-07-04T09:30:00Z'
  },
  {
    id: 'prod-7',
    name: 'Desert Sand Premium Linen Jubbah',
    slug: 'desert-sand-premium-linen-jubbah',
    sku: 'VRS-JUB-001',
    category: 'jubbah',
    description: 'Designed for sacred prayers and serene afternoon gatherings, our Desert Sand Jubbah combines ultimate comfort with a majestic form. Tailored from premium eco-certified flax linen, it offers exceptional breathability, a relaxed fluid fit, clean concealed buttons, and dynamic side pockets designed with absolute minimalism.',
    fabricDetails: {
      material: '100% Premium Belgian Flax Linen (Organic Softened)',
      care: [
        'Machine wash cold on delicate cycle',
        'Dry flat in shade (do not tumble dry)',
        'Medium steam iron to relax natural crinkles'
      ]
    },
    price: 3990,
    compareAtPrice: 4800,
    variants: [
      { size: '36', color: { name: 'Desert Sand', hex: '#D2B48C' }, stock: 15, sku: 'VRS-JUB-001-36-SND' },
      { size: '38', color: { name: 'Desert Sand', hex: '#D2B48C' }, stock: 20, sku: 'VRS-JUB-001-38-SND' },
      { size: '40', color: { name: 'Desert Sand', hex: '#D2B48C' }, stock: 12, sku: 'VRS-JUB-001-40-SND' },
      { size: '42', color: { name: 'Desert Sand', hex: '#D2B48C' }, stock: 8, sku: 'VRS-JUB-001-42-SND' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop', alt: 'Desert Sand Jubbah - Minimal Profile', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&fit=crop', alt: 'Desert Sand Jubbah - Texture Angle', isPrimary: false }
    ],
    tags: ['serene-lifestyle', 'eco-linen', 'best-seller'],
    ratings: { average: 4.8, count: 35 },
    reviews: [
      { id: 'rev-7-1', author: 'Kazi Shakir', rating: 5, date: '2026-06-12', comment: 'Extremely soft linen, it feels very cool even in Dhaka’s humid heat. Styling is simple and sophisticated.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-05-20T12:00:00Z',
    updatedAt: '2026-07-01T11:00:00Z'
  },
  {
    id: 'prod-8',
    name: 'Obsidian Premium Viscose Jubbah',
    slug: 'obsidian-premium-viscose-jubbah',
    sku: 'VRS-JUB-002',
    category: 'jubbah',
    description: 'Carve a serene path. Tailored in an elegant fluid silhouette from our proprietary liquid viscose blend, this obsidian black Jubbah provides a beautiful cool-touch texture and supreme silk-like drape. Styled with minimalist piping accents on the cuffs and an elegant hidden-placket zip closure.',
    fabricDetails: {
      material: 'Proprietary Liquid Viscose & Soft Rayon Blend (Ultra-Drape Quality)',
      care: [
        'Gentle hand wash cold',
        'Do not wring, hang dry directly',
        'Cool iron if necessary (or steam only)'
      ]
    },
    price: 4290,
    variants: [
      { size: '36', color: { name: 'Obsidian Black', hex: '#111827' }, stock: 10, sku: 'VRS-JUB-002-36-OBS' },
      { size: '38', color: { name: 'Obsidian Black', hex: '#111827' }, stock: 15, sku: 'VRS-JUB-002-38-OBS' },
      { size: '40', color: { name: 'Obsidian Black', hex: '#111827' }, stock: 12, sku: 'VRS-JUB-002-40-OBS' },
      { size: '42', color: { name: 'Obsidian Black', hex: '#111827' }, stock: 8, sku: 'VRS-JUB-002-42-OBS' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80&fit=crop', alt: 'Obsidian Viscose Jubbah - Front Profile', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop', alt: 'Obsidian Viscose Jubbah - Comfort Display', isPrimary: false }
    ],
    tags: ['serene-lifestyle', 'new-arrival'],
    ratings: { average: 4.7, count: 22 },
    reviews: [
      { id: 'rev-8-1', author: 'Sanzid Rahman', rating: 5, date: '2026-06-24', comment: 'The fabric flows beautifully. Incredible deep black look.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-07-07T14:00:00Z'
  },
  {
    id: 'prod-9',
    name: 'Royal Heritage Emerald Kabli Set',
    slug: 'royal-heritage-emerald-kabli-set',
    sku: 'VRS-KAB-001',
    category: 'kabli',
    description: 'A traditional masterpiece redefined for modern elegance. This Kabli set features a rich emerald shade, crafted from premium cotton blend with a subtle sheen. Detailed with custom metallic buttons, a semi-structured collar, and matching tailored pajamas, it is the ultimate expression of sophisticated celebratory wear.',
    fabricDetails: {
      material: 'Premium Cotton-Silk Blend (80% Cotton, 20% Silk)',
      care: [
        'Dry clean recommended for the first wash',
        'Hand wash separately in cold water',
        'Line dry in shade',
        'Iron with warm heat'
      ]
    },
    price: 5990,
    variants: [
      { size: '36', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 8, sku: 'VRS-KAB-001-36-EMR' },
      { size: '38', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 12, sku: 'VRS-KAB-001-38-EMR' },
      { size: '40', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 10, sku: 'VRS-KAB-001-40-EMR' },
      { size: '42', color: { name: 'Deep Emerald', hex: '#064E3B' }, stock: 6, sku: 'VRS-KAB-001-42-EMR' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop', alt: 'Royal Heritage Emerald Kabli - Front View', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=80&fit=crop', alt: 'Royal Heritage Emerald Kabli - Detail View', isPrimary: false }
    ],
    tags: ['new-arrival', 'royal-collection', 'signature'],
    ratings: { average: 4.9, count: 14 },
    reviews: [
      { id: 'rev-9-1', author: 'Sajid Ahmed', rating: 5, date: '2026-06-30', comment: 'The fit is absolutely brilliant, and the deep emerald color is extremely royal. Best Kabli set I have owned!', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-25T09:00:00Z',
    updatedAt: '2026-07-05T11:00:00Z'
  },
  {
    id: 'prod-10',
    name: 'Midnight Slate Linen Kabli Set',
    slug: 'midnight-slate-linen-kabli-set',
    sku: 'VRS-KAB-002',
    category: 'kabli',
    description: 'Breathe comfort into premium styling. Handcrafted from top-grade Belgian linen, this Slate Gray Kabli Set features breathable soft fabric with functional utility pockets, a classic folded cuff sleeve design, and matching trousers. Ideal for warm summer occasions and religious festivals.',
    fabricDetails: {
      material: '100% Organic Belgian Flax Linen',
      care: [
        'Wash inside out with mild liquid detergent',
        'Do not tumble dry',
        'Warm steam iron to release natural flax crinkles'
      ]
    },
    price: 5290,
    compareAtPrice: 5990,
    variants: [
      { size: '36', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 10, sku: 'VRS-KAB-002-36-SLT' },
      { size: '38', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 14, sku: 'VRS-KAB-002-38-SLT' },
      { size: '40', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 12, sku: 'VRS-KAB-002-40-SLT' },
      { size: '42', color: { name: 'Onyx Black', hex: '#0D0D0D' }, stock: 8, sku: 'VRS-KAB-002-42-SLT' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop', alt: 'Midnight Slate Linen Kabli - Front View', isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop', alt: 'Midnight Slate Linen Kabli - Back View', isPrimary: false }
    ],
    tags: ['best-seller', 'eid-collection'],
    ratings: { average: 4.7, count: 26 },
    reviews: [
      { id: 'rev-10-1', author: 'Niaz Morshed', rating: 5, date: '2026-07-02', comment: 'Super comfortable linen, has premium vibes. Fits true to size.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-20T11:00:00Z',
    updatedAt: '2026-07-06T15:00:00Z'
  },
  {
    id: 'prod-11',
    name: 'Classic White Aligarhi Pajama',
    slug: 'classic-white-aligarhi-pajama',
    sku: 'VRS-PAJ-001',
    category: 'pajama',
    description: 'The definitive companion to any premium Panjabi or Kabli. Woven from high-count pure cotton fabric, these Aligarhi-style pajamas feature a tailored straight-leg cut, adjustable drawstring waist, and double-stitched durability for daily or occasion comfort.',
    fabricDetails: {
      material: '100% Fine Long-Staple Cotton',
      care: [
        'Machine wash warm with white clothing',
        'Use color-safe detergent',
        'Warm iron while damp'
      ]
    },
    price: 1290,
    variants: [
      { size: '36', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 30, sku: 'VRS-PAJ-001-36-WHT' },
      { size: '38', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 45, sku: 'VRS-PAJ-001-38-WHT' },
      { size: '40', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 40, sku: 'VRS-PAJ-001-40-WHT' },
      { size: '42', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 25, sku: 'VRS-PAJ-001-42-WHT' },
      { size: '44', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 15, sku: 'VRS-PAJ-001-44-WHT' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop', alt: 'Classic White Aligarhi Pajama - Flat Display', isPrimary: true }
    ],
    tags: ['essential', 'best-seller'],
    ratings: { average: 4.8, count: 52 },
    reviews: [
      { id: 'rev-11-1', author: 'Masud Rana', rating: 5, date: '2026-06-18', comment: 'Perfect straight fit. Very comfortable fabric. I bought 3 of them.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-05-15T08:00:00Z',
    updatedAt: '2026-07-01T10:00:00Z'
  },
  {
    id: 'prod-12',
    name: 'Premium Silk Blend Pajama',
    slug: 'premium-silk-blend-pajama',
    sku: 'VRS-PAJ-002',
    category: 'pajama',
    description: 'Add an extra touch of luxury to your celebratory silhouette. Crafted from a soft silk-blend fabric that yields an elegant soft sheen and beautiful fluid drape, these pajamas offer maximum luxury with side pockets and a customized waist fitting.',
    fabricDetails: {
      material: 'Premium Silk-Cotton Blend (50% Silk, 50% Cotton)',
      care: [
        'Dry clean or gentle hand wash only',
        'Do not twist or wring',
        'Iron at lowest heat setting with cloth protection'
      ]
    },
    price: 1890,
    compareAtPrice: 2200,
    variants: [
      { size: '36', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 15, sku: 'VRS-PAJ-002-36-SLK' },
      { size: '38', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 20, sku: 'VRS-PAJ-002-38-SLK' },
      { size: '40', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 18, sku: 'VRS-PAJ-002-40-SLK' },
      { size: '42', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 12, sku: 'VRS-PAJ-002-42-SLK' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop', alt: 'Premium Silk Blend Pajama - Texture View', isPrimary: true }
    ],
    tags: ['essential', 'new-arrival'],
    ratings: { average: 4.6, count: 18 },
    reviews: [
      { id: 'rev-12-1', author: 'Kamrul Hassan', rating: 5, date: '2026-06-22', comment: 'Extremely soft, goes perfectly with my Rajshahi silk Panjabi.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-06-05T12:00:00Z',
    updatedAt: '2026-07-04T11:00:00Z'
  },
  {
    id: 'prod-13',
    name: 'Little Prince Royal Blue Kabli Set',
    slug: 'little-prince-royal-blue-kabli-set',
    sku: 'VRS-KID-001',
    category: 'kids',
    description: 'A miniature masterpiece for your little prince. Tailored from highly breathable premium soft cotton blend, this royal blue Kabli set is embellished with subtle contrast embroidery along the collar and features comfortable pajama pants with elastic waist tailored specifically for active kids.',
    fabricDetails: {
      material: '90% Soft Cotton, 10% Linen Blend',
      care: [
        'Gentle machine wash cold with like colors',
        'Do not tumble dry',
        'Warm iron if needed'
      ]
    },
    price: 2490,
    compareAtPrice: 2990,
    variants: [
      { size: '18', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 10, sku: 'VRS-KID-001-18-BLU' },
      { size: '20', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 12, sku: 'VRS-KID-001-20-BLU' },
      { size: '22', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 15, sku: 'VRS-KID-001-22-BLU' },
      { size: '24', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 8, sku: 'VRS-KID-001-24-BLU' },
      { size: '26', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 6, sku: 'VRS-KID-001-26-BLU' },
      { size: '28', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 10, sku: 'VRS-KID-001-28-BLU' },
      { size: '30', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 12, sku: 'VRS-KID-001-30-BLU' },
      { size: '32', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 15, sku: 'VRS-KID-001-32-BLU' },
      { size: '34', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 8, sku: 'VRS-KID-001-34-BLU' },
      { size: '36', color: { name: 'Royal Blue', hex: '#1E40AF' }, stock: 6, sku: 'VRS-KID-001-36-BLU' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop', alt: 'Little Prince Royal Blue Kabli Set - Front View', isPrimary: true }
    ],
    tags: ['kids-collection', 'new-arrival', 'comfortable'],
    ratings: { average: 4.8, count: 8 },
    reviews: [
      { id: 'rev-13-1', author: 'Mariam Begum', rating: 5, date: '2026-07-01', comment: 'Extremely soft fabric, ideal for my son. He wore it all day without complaining. Sizing fits perfectly.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-08T12:00:00Z'
  },
  {
    id: 'prod-14',
    name: 'Junior Heritage Cotton Panjabi',
    slug: 'junior-heritage-cotton-panjabi',
    sku: 'VRS-KID-002',
    category: 'kids',
    description: 'Designed for ultimate comfort during festive celebrations. Made from soft long-staple cotton with clean seams to prevent skin irritation, this traditional ivory Panjabi is complete with elegant wooden buttons and decorative stitching.',
    fabricDetails: {
      material: '100% Pure Premium Cotton',
      care: [
        'Machine wash cold gentle cycle',
        'Line dry in shade',
        'Warm iron'
      ]
    },
    price: 1990,
    compareAtPrice: 2490,
    variants: [
      { size: '18', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 12, sku: 'VRS-KID-002-18-IVY' },
      { size: '20', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 15, sku: 'VRS-KID-002-20-IVY' },
      { size: '22', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 10, sku: 'VRS-KID-002-22-IVY' },
      { size: '24', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 14, sku: 'VRS-KID-002-24-IVY' },
      { size: '26', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 8, sku: 'VRS-KID-002-26-IVY' },
      { size: '28', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 12, sku: 'VRS-KID-002-28-IVY' },
      { size: '30', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 15, sku: 'VRS-KID-002-30-IVY' },
      { size: '32', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 10, sku: 'VRS-KID-002-32-IVY' },
      { size: '34', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 14, sku: 'VRS-KID-002-34-IVY' },
      { size: '36', color: { name: 'Ivory Cream', hex: '#F9F6F0' }, stock: 8, sku: 'VRS-KID-002-36-IVY' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&fit=crop', alt: 'Junior Heritage Cotton Panjabi - Front View', isPrimary: true }
    ],
    tags: ['kids-collection', 'eid-collection', 'cotton'],
    ratings: { average: 4.7, count: 12 },
    reviews: [
      { id: 'rev-14-1', author: 'Farhana Yeasmin', rating: 5, date: '2026-07-03', comment: 'Loved it! Very clean finish and excellent cotton fabric. Highly recommended for kids.', verified: true }
    ],
    isActive: true,
    createdAt: '2026-07-02T09:00:00Z',
    updatedAt: '2026-07-09T14:00:00Z'
  }
];

// Compact specification array for 56 extra premium products (8 per category)
const EXTRA_PRODUCTS_META: {
  name: string;
  category: 'panjabi' | 'koti' | 'sherwani' | 'jubbah' | 'kabli' | 'pajama' | 'kids';
  price: number;
  material: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  tags: string[];
}[] = [
  // === PANJABI ===
  {
    name: 'Crimson Monarch Premium Jacquard Panjabi',
    category: 'panjabi',
    price: 5490,
    material: 'Premium Cotton Jacquard',
    colorName: 'Royal Crimson',
    colorHex: '#7C0A02',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop',
    tags: ['new-arrival', 'eid-collection', 'premium']
  },
  {
    name: 'Emerald Sovereign Handloom Cotton Panjabi',
    category: 'panjabi',
    price: 4590,
    material: '100% Handloom Cotton',
    colorName: 'Emerald Green',
    colorHex: '#0F5257',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop',
    tags: ['handloom', 'casual-chic', 'summer']
  },
  {
    name: 'Sapphire Aristocrat Fine Linen Panjabi',
    category: 'panjabi',
    price: 4990,
    material: 'Pure Organic Flax Linen',
    colorName: 'Sapphire Blue',
    colorHex: '#0F4C81',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['classic', 'linen', 'breathable']
  },
  {
    name: 'Golden Amber Premium Georgette Panjabi',
    category: 'panjabi',
    price: 5990,
    material: 'Textured Georgette Blend',
    colorName: 'Amber Gold',
    colorHex: '#D4AF37',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop',
    tags: ['wedding-edit', 'limited-edition']
  },
  {
    name: 'Royal Plum Hand-Embroidered Silk Panjabi',
    category: 'panjabi',
    price: 7290,
    material: 'Bespoke Mulberry Silk',
    colorName: 'Royal Plum',
    colorHex: '#4B0082',
    imageUrl: 'https://images.unsplash.com/photo-1611590027211-b954fd027b51?w=800&q=80&fit=crop',
    tags: ['royal-collection', 'silk', 'embroidery']
  },
  {
    name: 'Platinum Dusk Premium Viscose Panjabi',
    category: 'panjabi',
    price: 5190,
    material: 'High-Density Liquid Viscose',
    colorName: 'Platinum Gray',
    colorHex: '#E5E4E2',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop',
    tags: ['new-arrival', 'sleek', 'viscose']
  },
  {
    name: 'Shadow Charcoal Textured Cotton Panjabi',
    category: 'panjabi',
    price: 4390,
    material: 'Premium Textured Cotton',
    colorName: 'Charcoal Black',
    colorHex: '#36454F',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop',
    tags: ['minimalist', 'daily-luxury']
  },
  {
    name: 'Pearl White Classic Ceremonial Panjabi',
    category: 'panjabi',
    price: 4790,
    material: 'Egyptian Fine Giza Cotton',
    colorName: 'Pearl White',
    colorHex: '#FDFDFD',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['ceremonial', 'essential', 'signature']
  },
  {
    name: 'Rosewood Dynasty Premium Raw Silk Panjabi',
    category: 'panjabi',
    price: 5990,
    material: 'Premium Raw Silk',
    colorName: 'Rosewood Brown',
    colorHex: '#653B3C',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop',
    tags: ['silk', 'royal-collection']
  },
  {
    name: 'Midnight Blue Elite Cotton Satin Panjabi',
    category: 'panjabi',
    price: 4790,
    material: 'Premium Cotton Satin',
    colorName: 'Midnight Blue',
    colorHex: '#1B2E3C',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop',
    tags: ['new-arrival', 'cotton-satin']
  },

  // === KOTI ===
  {
    name: 'Royal Emerald Embroidered Jamawar Koti',
    category: 'koti',
    price: 6290,
    material: 'Authentic Jamawar Silk',
    colorName: 'Emerald Green',
    colorHex: '#0B6623',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop',
    tags: ['jamawar', 'royal-collection', 'festive']
  },
  {
    name: 'Midnight Sapphire Premium Suede Koti',
    category: 'koti',
    price: 5990,
    material: 'Luxury Double-Face Suede',
    colorName: 'Sapphire Navy',
    colorHex: '#1D2A44',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&fit=crop',
    tags: ['suede', 'modern-silhouette', 'premium']
  },
  {
    name: 'Obsidian Black Handcrafted Tussar Silk Koti',
    category: 'koti',
    price: 5590,
    material: 'Raw Handloom Tussar Silk',
    colorName: 'Obsidian Black',
    colorHex: '#0B0B0C',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop',
    tags: ['tussar-silk', 'handcrafted', 'signature']
  },
  {
    name: 'Platinum Gray Textured Silk Koti',
    category: 'koti',
    price: 4990,
    material: 'Textured Spun Silk Blend',
    colorName: 'Platinum Gray',
    colorHex: '#D3D3D3',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=80&fit=crop',
    tags: ['minimalist', 'contemporary']
  },
  {
    name: 'Crimson Heritage Floral Brocade Koti',
    category: 'koti',
    price: 6490,
    material: 'Premium Banarasi Brocade Silk',
    colorName: 'Crimson Gold',
    colorHex: '#990000',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop',
    tags: ['brocade', 'wedding-edit', 'classic']
  },
  {
    name: 'Antique Copper Hand-Woven Jute-Cotton Koti',
    category: 'koti',
    price: 4290,
    material: 'Handloom Jute & Cotton Weave',
    colorName: 'Antique Copper',
    colorHex: '#B87333',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&fit=crop',
    tags: ['eco-friendly', 'rustic', 'heritage']
  },
  {
    name: 'Champagne Cream Luxury Silk Koti',
    category: 'koti',
    price: 5790,
    material: '100% Dupioni Silk',
    colorName: 'Champagne Cream',
    colorHex: '#F0E6D2',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop',
    tags: ['silk', 'luxury', 'essential']
  },
  {
    name: 'Forest Moss Premium Linen Koti',
    category: 'koti',
    price: 4590,
    material: 'Organic Belgian Flax Linen',
    colorName: 'Forest Moss',
    colorHex: '#2E8B57',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=80&fit=crop',
    tags: ['linen', 'breathable', 'casual']
  },
  {
    name: 'Monarch Gold Textured Silk Koti',
    category: 'koti',
    price: 5190,
    material: 'Fine Silk Cotton Blend',
    colorName: 'Monarch Gold',
    colorHex: '#C5A059',
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop',
    tags: ['new-arrival', 'silk']
  },
  {
    name: 'Deep Ruby Velvet Heritage Koti',
    category: 'koti',
    price: 5690,
    material: 'Italian Cotton Velvet',
    colorName: 'Deep Ruby',
    colorHex: '#800020',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80&fit=crop',
    tags: ['velvet', 'heritage']
  },

  // === SHERWANI ===
  {
    name: 'Midnight Sapphire Maharaja Zardozi Sherwani',
    category: 'sherwani',
    price: 16500,
    material: 'Premium Silk Velvet & Raw Silk',
    colorName: 'Midnight Sapphire',
    colorHex: '#0F2042',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80&fit=crop',
    tags: ['groom-collection', 'zardozi', 'maharaja']
  },
  {
    name: 'Regal Emerald Mughal Brocade Sherwani',
    category: 'sherwani',
    price: 15500,
    material: 'Banarasi Silk Brocade with Zari',
    colorName: 'Regal Emerald',
    colorHex: '#043927',
    imageUrl: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=800&q=80&fit=crop',
    tags: ['groom-collection', 'brocade', 'heritage']
  },
  {
    name: 'Sovereign Golden Silk Heritage Sherwani',
    category: 'sherwani',
    price: 17500,
    material: 'Pure Handspun Mulberry Silk',
    colorName: 'Sovereign Gold',
    colorHex: '#D4AF37',
    imageUrl: 'https://images.unsplash.com/photo-1597983073492-7b448ee055a4?w=800&q=80&fit=crop',
    tags: ['royal-collection', 'signature', 'pure-silk']
  },
  {
    name: 'Antique Champagne Pearl Embellished Sherwani',
    category: 'sherwani',
    price: 18500,
    material: 'Dupioni Raw Silk',
    colorName: 'Antique Champagne',
    colorHex: '#ECE5CE',
    imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fit=crop',
    tags: ['groom-collection', 'pearl-work', 'limited']
  },
  {
    name: 'Crimson Dynasty Premium Silk Sherwani',
    category: 'sherwani',
    price: 13900,
    material: 'High-Density Bengal Raw Silk',
    colorName: 'Imperial Crimson',
    colorHex: '#800020',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80&fit=crop',
    tags: ['royal-collection', 'festive']
  },
  {
    name: 'Shadow Obsidian Hand-Detailed Sherwani',
    category: 'sherwani',
    price: 19500,
    material: 'Italian Cotton Velvet & Silk',
    colorName: 'Shadow Obsidian',
    colorHex: '#1A1A1A',
    imageUrl: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=800&q=80&fit=crop',
    tags: ['groom-collection', 'handcrafted', 'premium']
  },
  {
    name: 'Royal Velvet Ruby Classic Sherwani',
    category: 'sherwani',
    price: 15900,
    material: 'Premium High-Density Cotton Velvet',
    colorName: 'Ruby Red',
    colorHex: '#A30000',
    imageUrl: 'https://images.unsplash.com/photo-1597983073492-7b448ee055a4?w=800&q=80&fit=crop',
    tags: ['royal-collection', 'velvet', 'classic']
  },
  {
    name: 'Platinum Sand Geometric Jacquard Sherwani',
    category: 'sherwani',
    price: 11900,
    material: 'Bespoke Micro-Jacquard Silk Blend',
    colorName: 'Platinum Sand',
    colorHex: '#D8D3C9',
    imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80&fit=crop',
    tags: ['contemporary', 'minimalist', 'jacquard']
  },
  {
    name: 'Imperial Ivory Royal Brocade Sherwani',
    category: 'sherwani',
    price: 16900,
    material: 'Mulberry Silk Brocade',
    colorName: 'Imperial Ivory',
    colorHex: '#FFFFF0',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80&fit=crop',
    tags: ['groom-collection', 'brocade']
  },
  {
    name: 'Sovereign Gold Artisan Embroidered Sherwani',
    category: 'sherwani',
    price: 18900,
    material: 'Premium Raw Silk',
    colorName: 'Sovereign Gold',
    colorHex: '#D4AF37',
    imageUrl: 'https://images.unsplash.com/photo-1618886614638-80e3c103d31a?w=800&q=80&fit=crop',
    tags: ['signature', 'royal-collection']
  },

  // === JUBBAH ===
  {
    name: 'Pure White Premium Cotton Qatari Jubbah',
    category: 'jubbah',
    price: 3590,
    material: 'Egyptian Fine Cotton',
    colorName: 'Pure White',
    colorHex: '#FFFFFF',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop',
    tags: ['serene-lifestyle', 'qatari-style', 'essential']
  },
  {
    name: 'Royal Navy Silk Blend Emirati Jubbah',
    category: 'jubbah',
    price: 4890,
    material: 'Lustrous Silk-Viscose Blend',
    colorName: 'Royal Navy',
    colorHex: '#1B2E3C',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80&fit=crop',
    tags: ['emirati-style', 'luxurious', 'premium']
  },
  {
    name: 'Slate Gray Textured Crepe Saudi Jubbah',
    category: 'jubbah',
    price: 4190,
    material: 'Premium Textured Crepe Fabric',
    colorName: 'Slate Gray',
    colorHex: '#708090',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop',
    tags: ['saudi-style', 'crepe', 'new-arrival']
  },
  {
    name: 'Emerald Oasis Breathable Linen Jubbah',
    category: 'jubbah',
    price: 3890,
    material: '100% Breathable Irish Linen',
    colorName: 'Emerald Oasis',
    colorHex: '#145A32',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop',
    tags: ['serene-lifestyle', 'linen', 'cool']
  },
  {
    name: 'Midnight Indigo Premium Kashibo Jubbah',
    category: 'jubbah',
    price: 4590,
    material: 'Ultra-Soft Kashibo Silk Fabric',
    colorName: 'Midnight Indigo',
    colorHex: '#2E4053',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80&fit=crop',
    tags: ['kashibo', 'premium', 'winter-wear']
  },
  {
    name: 'Toffee Brown Textured Silk Jubbah',
    category: 'jubbah',
    price: 4990,
    material: 'Textured Mulberry Silk Blend',
    colorName: 'Toffee Brown',
    colorHex: '#784212',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop',
    tags: ['luxury-silk', 'earthy', 'signature']
  },
  {
    name: 'Burgundy Splendor Classic Fit Jubbah',
    category: 'jubbah',
    price: 4390,
    material: 'Matte Viscose-Polyester Crepe',
    colorName: 'Burgundy Red',
    colorHex: '#641E16',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop',
    tags: ['classic-fit', 'rich-color']
  },
  {
    name: 'Platinum Ash Lightweight Summer Jubbah',
    category: 'jubbah',
    price: 3790,
    material: 'Linen-Viscose Lightweight Blend',
    colorName: 'Platinum Ash',
    colorHex: '#BDC3C7',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80&fit=crop',
    tags: ['summer-edit', 'lightweight', 'minimalist']
  },
  {
    name: 'Crimson Splendor Saudi Crepe Jubbah',
    category: 'jubbah',
    price: 4290,
    material: 'Premium Saudi Crepe',
    colorName: 'Crimson Red',
    colorHex: '#7B1113',
    imageUrl: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&q=80&fit=crop',
    tags: ['saudi-style', 'new-arrival']
  },
  {
    name: 'Onyx Black Royal Emirati Jubbah',
    category: 'jubbah',
    price: 4990,
    material: 'Lustrous Silk Viscose Blend',
    colorName: 'Onyx Black',
    colorHex: '#121212',
    imageUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&q=80&fit=crop',
    tags: ['emirati-style', 'premium']
  },

  // === KABLI ===
  {
    name: 'Obsidian Classic Textured Cotton Kabli Set',
    category: 'kabli',
    price: 5490,
    material: 'Textured Giza Cotton',
    colorName: 'Obsidian Black',
    colorHex: '#1C1C1C',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop',
    tags: ['classic', 'essential', 'signature']
  },
  {
    name: 'Crimson Regent Premium Viscose Kabli Set',
    category: 'kabli',
    price: 5890,
    material: 'High-Count Soft Liquid Viscose',
    colorName: 'Regent Crimson',
    colorHex: '#7B1113',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop',
    tags: ['new-arrival', 'regal', 'bold']
  },
  {
    name: 'Pearl White Serene Silk-Blend Kabli Set',
    category: 'kabli',
    price: 6490,
    material: 'Handspun Mulberry Silk-Cotton',
    colorName: 'Pearl White',
    colorHex: '#FDFBF7',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['pure-luxury', 'eid-collection', 'essential']
  },
  {
    name: 'Sapphire Aristocrat Fine Handloom Kabli Set',
    category: 'kabli',
    price: 5790,
    material: 'Premium Fine Handloom Cotton',
    colorName: 'Sapphire Blue',
    colorHex: '#1A365D',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80&fit=crop',
    tags: ['handloom', 'aristocrat', 'classic']
  },
  {
    name: 'Sand Dune Soft Linen-Cotton Kabli Set',
    category: 'kabli',
    price: 4990,
    material: 'French Flax Linen & Soft Cotton',
    colorName: 'Sand Dune',
    colorHex: '#E6C280',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=80&fit=crop',
    tags: ['linen-blend', 'breathable', 'relaxed']
  },
  {
    name: 'Steel Gray Contemporary Jacquard Kabli Set',
    category: 'kabli',
    price: 5590,
    material: 'Self-Design Fine Jacquard Cotton',
    colorName: 'Steel Gray',
    colorHex: '#7F8C8D',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop',
    tags: ['contemporary', 'minimalist', 'jacquard']
  },
  {
    name: 'Forest Pine Traditional Festive Kabli Set',
    category: 'kabli',
    price: 5190,
    material: 'Premium Blended Suiting Cotton',
    colorName: 'Forest Pine',
    colorHex: '#1E4620',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=800&q=80&fit=crop',
    tags: ['festive', 'traditional', 'durable']
  },
  {
    name: 'Royal Indigo Heritage Embroidered Kabli Set',
    category: 'kabli',
    price: 6290,
    material: 'Premium Semi-Silk Cotton',
    colorName: 'Royal Indigo',
    colorHex: '#2E40A6',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['royal-collection', 'embroidery', 'signature']
  },
  {
    name: 'Midnight Charcoal Premium Viscose Kabli Set',
    category: 'kabli',
    price: 5990,
    material: 'Soft Liquid Viscose',
    colorName: 'Midnight Charcoal',
    colorHex: '#2C3E50',
    imageUrl: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop',
    tags: ['new-arrival', 'viscose']
  },
  {
    name: 'Autumn Clay Soft Linen-Cotton Kabli Set',
    category: 'kabli',
    price: 5190,
    material: 'French Flax Linen Blend',
    colorName: 'Autumn Clay',
    colorHex: '#B87333',
    imageUrl: 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?w=800&q=80&fit=crop',
    tags: ['linen-blend', 'earthy']
  },

  // === PAJAMA ===
  {
    name: 'Ivory White Tailored Churidar Pajama',
    category: 'pajama',
    price: 1190,
    material: '100% Stretch Cotton Lycra',
    colorName: 'Ivory White',
    colorHex: '#FFFFFA',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['essential', 'churidar', 'elastic']
  },
  {
    name: 'Midnight Black Premium Cotton Pajama',
    category: 'pajama',
    price: 1390,
    material: 'Fine Poplin Cotton',
    colorName: 'Midnight Black',
    colorHex: '#050505',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['essential', 'aligarhi', 'versatile']
  },
  {
    name: 'Royal Cream Silk Aligarhi Pajama',
    category: 'pajama',
    price: 1990,
    material: 'Premium Silk-Cotton Satin Weave',
    colorName: 'Royal Cream',
    colorHex: '#FFFDD0',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['silk-blend', 'premium', 'wedding-wear']
  },
  {
    name: 'Charcoal Gray Textured Cotton Pajama',
    category: 'pajama',
    price: 1250,
    material: 'Soft Slub Textured Cotton',
    colorName: 'Charcoal Gray',
    colorHex: '#404040',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['essential', 'comfort-wear']
  },
  {
    name: 'Champagne Gold Premium Silk Pajama',
    category: 'pajama',
    price: 2190,
    material: 'Rajshahi Mulberry Silk Blend',
    colorName: 'Champagne Gold',
    colorHex: '#E6C229',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['premium-silk', 'luxury', 'wedding-edit']
  },
  {
    name: 'Pure White Loose Fit Traditional Pajama',
    category: 'pajama',
    price: 990,
    material: '100% Breathable Soft Cotton',
    colorName: 'Pure White',
    colorHex: '#FFFFFF',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['essential', 'loose-fit', 'daily']
  },
  {
    name: 'Soft Linen Sand Adjustable Pajama',
    category: 'pajama',
    price: 1590,
    material: 'Softened Organic Flax Linen',
    colorName: 'Sand Beige',
    colorHex: '#C2B280',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['linen', 'premium', 'drawstring']
  },
  {
    name: 'Deep Navy Premium Lounge Pajama',
    category: 'pajama',
    price: 1490,
    material: 'Premium Soft Mercerized Cotton',
    colorName: 'Deep Navy',
    colorHex: '#000080',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['essential', 'soft-cotton', 'lounge']
  },
  {
    name: 'Silver Ash Soft Cotton Churidar',
    category: 'pajama',
    price: 1290,
    material: '100% Cotton Stretch',
    colorName: 'Silver Ash',
    colorHex: '#C0C0C0',
    imageUrl: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=800&q=80&fit=crop',
    tags: ['essential', 'churidar']
  },
  {
    name: 'Imperial Gold Premium Satin Pajama',
    category: 'pajama',
    price: 1890,
    material: 'Silk Satin Weave',
    colorName: 'Imperial Gold',
    colorHex: '#D4AF37',
    imageUrl: 'https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=800&q=80&fit=crop',
    tags: ['premium', 'wedding-wear']
  },

  // === KIDS ===
  {
    name: 'Tiny Monarch Crimson Velvet Koti Set',
    category: 'kids',
    price: 2990,
    material: 'Soft Italian Velvet & Cotton',
    colorName: 'Crimson Red',
    colorHex: '#990000',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'velvet', 'royal']
  },
  {
    name: 'Junior Maharaja Ivory Zardozi Sherwani Set',
    category: 'kids',
    price: 4500,
    material: 'Bespoke Soft Raw Silk Blend',
    colorName: 'Ivory Cream',
    colorHex: '#FFFFF0',
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'groom-mini', 'premium']
  },
  {
    name: 'Little Aristocrat Emerald Silk Panjabi',
    category: 'kids',
    price: 2290,
    material: 'Rajshahi Silk Cotton Blend',
    colorName: 'Emerald Green',
    colorHex: '#0B6623',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'silk-blend', 'comfortable']
  },
  {
    name: 'Tiny Prince Sky Blue Cotton Kabli Set',
    category: 'kids',
    price: 2190,
    material: '100% Breathable Soft Cotton',
    colorName: 'Sky Blue',
    colorHex: '#87CEEB',
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'kabli', 'daily-comfort']
  },
  {
    name: 'Junior Explorer Desert Sand Linen Jubbah',
    category: 'kids',
    price: 2390,
    material: 'Soft Lightweight Organic Flax Linen',
    colorName: 'Desert Sand',
    colorHex: '#EDC9AF',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'jubbah', 'linen']
  },
  {
    name: 'Little Nawab Gold Brocade Koti Set',
    category: 'kids',
    price: 3190,
    material: 'Soft Brocade Silk & Cotton lining',
    colorName: 'Royal Gold',
    colorHex: '#FFD700',
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'brocade', 'festive']
  },
  {
    name: 'Tiny Sovereign Onyx Black Cotton Panjabi',
    category: 'kids',
    price: 1890,
    material: '100% Breathable Giza Cotton',
    colorName: 'Onyx Black',
    colorHex: '#0F0F0F',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'essential', 'cotton']
  },
  {
    name: 'Junior Pearl White Silk Ceremonial Set',
    category: 'kids',
    price: 2790,
    material: 'Art Silk Cotton Blend',
    colorName: 'Pearl White',
    colorHex: '#FFFFFA',
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'ceremonial', 'classic']
  },
  {
    name: 'Tiny Maharaja Royal Blue Velvet Koti Set',
    category: 'kids',
    price: 3290,
    material: 'Soft Velvet & Silk Cotton',
    colorName: 'Royal Blue',
    colorHex: '#1E40AF',
    imageUrl: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'velvet']
  },
  {
    name: 'Little Explorer Olive Green Cotton Kabli Set',
    category: 'kids',
    price: 2290,
    material: '100% Breathable Cotton',
    colorName: 'Olive Green',
    colorHex: '#556B2F',
    imageUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&q=80&fit=crop',
    tags: ['kids-collection', 'comfortable']
  }
];

// Helper to project compact specifications into full-featured Product records
const EXTRA_PRODUCTS: Product[] = EXTRA_PRODUCTS_META.map((item, index) => {
  const numId = 15 + index;
  const id = `prod-${numId}`;
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sku = `VRS-${item.category.toUpperCase().slice(0, 3)}-${numId.toString().padStart(3, '0')}`;
  
  // Kids has child sizing, other categories use standard sizing
  const sizes = item.category === 'kids' 
    ? ['20', '22', '24', '26', '28', '30', '32'] 
    : ['38', '40', '42', '44', '46'];

  const variants = sizes.map((size) => ({
    size,
    color: { name: item.colorName, hex: item.colorHex },
    stock: 12 + (numId % 7),
    sku: `${sku}-${size}-${item.colorName.slice(0, 3).toUpperCase()}`
  }));

  const caretakers = [
    'Dry clean recommended for first wash to preserve colors',
    'Hand wash cold separately using extremely mild detergent',
    'Do not machine dry, do not twist or wring',
    'Line dry in shade away from direct tropical sunlight',
    'Warm steam iron inside-out at lowest recommended heat'
  ];

  return {
    id,
    name: item.name,
    slug,
    sku,
    category: item.category,
    description: `Indulge in sheer traditional luxury with our ${item.name}. Meticulously crafted from premium ${item.material.toLowerCase()}, this design offers an exquisite drape, timeless structural form, and a supreme handfeel. Styled with hand-picked details and custom hardware, it stands as a testament to bespoke subcontinental craftsmanship.`,
    fabricDetails: {
      material: item.material,
      care: caretakers
    },
    price: item.price,
    compareAtPrice: Math.round((item.price * 1.25) / 100) * 100 - 10,
    variants,
    images: [
      { url: item.imageUrl, alt: `${item.name} - Front Angle View`, isPrimary: true }
    ],
    tags: item.tags,
    ratings: {
      average: 4.6 + parseFloat(((numId % 4) * 0.1).toFixed(1)),
      count: 10 + (numId * 3) % 45
    },
    reviews: [
      {
        id: `rev-${id}-1`,
        author: numId % 2 === 0 ? 'Fahim Chowdhury' : 'Sajid Al-Masood',
        rating: 5,
        date: '2026-07-06',
        comment: `Absolutely brilliant purchase! The texture of the ${item.material.toLowerCase()} is outstanding. The fitting is immaculate, and it looks exceptionally regal for any formal gathering.`,
        verified: true
      }
    ],
    isActive: true,
    createdAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-08T15:30:00Z'
  };
});

// Complete compiled products list combining original and programmatic expansions
export const INITIAL_PRODUCTS: Product[] = [
  ...ORIGINAL_PRODUCTS,
  ...EXTRA_PRODUCTS
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    code: 'EID2026',
    type: 'percentage',
    value: 10,
    minOrderValue: 3000,
    maxDiscount: 1000,
    usageLimit: 100,
    usedCount: 42,
    expiresAt: '2026-08-31T23:59:59Z',
    isActive: true
  },
  {
    id: 'cp-2',
    code: 'VIRSA1000',
    type: 'flat',
    value: 1000,
    minOrderValue: 10000,
    usageLimit: 50,
    usedCount: 15,
    expiresAt: '2026-09-30T23:59:59Z',
    isActive: true
  },
  {
    id: 'cp-3',
    code: 'FIRSTWELCOME',
    type: 'percentage',
    value: 5,
    minOrderValue: 1000,
    maxDiscount: 300,
    usageLimit: 500,
    usedCount: 122,
    expiresAt: '2026-12-31T23:59:59Z',
    isActive: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1042',
    orderNumber: 'VRS-20260708-1042',
    customer: {
      name: 'Rafiq Ahmed',
      phone: '01712345678',
      email: 'rafiq@email.com'
    },
    shippingAddress: {
      address: 'House 12, Road 5, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      postalCode: '1205'
    },
    items: [
      {
        productId: 'prod-1',
        name: 'Midnight Onyx Premium Cotton Panjabi',
        size: 'M',
        color: 'Onyx Black',
        quantity: 1,
        price: 4890,
        image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80&fit=crop'
      }
    ],
    pricing: {
      subtotal: 4890,
      shippingCost: 60,
      discount: 489,
      couponCode: 'EID2026',
      total: 4461
    },
    shippingMethod: 'regular_dhaka',
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    statusHistory: [
      { status: 'pending', timestamp: '2026-07-08T08:15:00-07:00', note: 'Order placed via Cash on Delivery' }
    ],
    notes: 'Please call 1 hour before delivery.',
    createdAt: '2026-07-08T08:15:00-07:00'
  },
  {
    id: 'ord-1039',
    orderNumber: 'VRS-20260707-1039',
    customer: {
      name: 'Asifur Rahman',
      phone: '01911442233',
      email: 'asif@gmail.com'
    },
    shippingAddress: {
      address: 'Plot 42, Sector 3, Uttara',
      area: 'Uttara',
      city: 'Dhaka',
      postalCode: '1230'
    },
    items: [
      {
        productId: 'prod-3',
        name: 'Imperial Velvet Wedding Koti',
        size: 'L',
        color: 'Royal Navy',
        quantity: 1,
        price: 5490,
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&fit=crop'
      }
    ],
    pricing: {
      subtotal: 5490,
      shippingCost: 0, // Free delivery > 5000
      discount: 0,
      couponCode: null,
      total: 5490
    },
    shippingMethod: 'express_dhaka',
    paymentMethod: 'bkash',
    paymentStatus: 'completed',
    orderStatus: 'processing',
    statusHistory: [
      { status: 'pending', timestamp: '2026-07-07T14:30:00-07:00', note: 'Order initiated' },
      { status: 'processing', timestamp: '2026-07-07T15:00:00-07:00', note: 'Payment verified via bKash. Preparing for packing.' }
    ],
    notes: 'Deliver at office reception.',
    createdAt: '2026-07-07T14:30:00-07:00'
  },
  {
    id: 'ord-1025',
    orderNumber: 'VRS-20260705-1025',
    customer: {
      name: 'Mahbubul Alam',
      phone: '01819998877',
      email: 'mahbub@yahoo.com'
    },
    shippingAddress: {
      address: 'Holding 14/B, East Nasirabad',
      area: 'Nasirabad',
      city: 'Outside Dhaka',
      postalCode: '4000'
    },
    items: [
      {
        productId: 'prod-5',
        name: 'Imperial Ivory Hand-Embroidered Sherwani',
        size: 'M',
        color: 'Imperial Ivory',
        quantity: 1,
        price: 14500,
        image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80&fit=crop'
      }
    ],
    pricing: {
      subtotal: 14500,
      shippingCost: 120,
      discount: 1000,
      couponCode: 'VIRSA1000',
      total: 13620
    },
    shippingMethod: 'regular_outside',
    paymentMethod: 'sslcommerz',
    paymentStatus: 'completed',
    orderStatus: 'shipped',
    statusHistory: [
      { status: 'pending', timestamp: '2026-07-05T10:15:00-07:00', note: 'Order placed' },
      { status: 'processing', timestamp: '2026-07-05T11:45:00-07:00', note: 'Quality check passed. Packaged for national transport.' },
      { status: 'shipped', timestamp: '2026-07-06T16:00:00-07:00', note: 'Dispatched via Paperfly Courier Service. Tracking ID: PPF-903429.' }
    ],
    createdAt: '2026-07-05T10:15:00-07:00'
  }
];

export const BANGLADESH_AREAS = {
  Dhaka: [
    'Dhanmondi',
    'Gulshan',
    'Banani',
    'Uttara',
    'Mirpur',
    'Mohammadpur',
    'Badda',
    'Tejgaon',
    'Motijheel',
    'Wari',
    'Lalbagh',
    'Malibagh',
    'Khilgaon',
    'Rampura',
    'Paltan',
    'Mogbazar'
  ],
  'Outside Dhaka': [
    'Chittagong (Chattogram)',
    'Sylhet',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Rangpur',
    'Mymensingh',
    'Comilla',
    'Gazipur',
    'Narayanganj',
    'Bogura',
    'Jashore',
    'Cox\'s Bazar'
  ]
};

export const SHOWROOMS = [
  {
    id: 'sr-1',
    name: 'Dhanmondi Flagship Showroom',
    address: 'VRS Tower, Level 3, Road 27 (Old), Dhanmondi, Dhaka',
    phone: '+880 1711-234567',
    hours: '11:00 AM - 09:30 PM (Closed on Wednesday)'
  },
  {
    id: 'sr-2',
    name: 'Gulshan Avenue Boutique',
    address: 'Elite Plaza, Plot 14, Road 113, Gulshan-2, Dhaka',
    phone: '+880 1711-890123',
    hours: '11:00 AM - 09:30 PM (Closed on Sunday)'
  },
  {
    id: 'sr-3',
    name: 'Uttara Royal Arcade',
    address: 'Imperial Mansion, Sector 4, Jashimuddin Road, Uttara, Dhaka',
    phone: '+880 1711-456789',
    hours: '11:00 AM - 09:30 PM (Closed on Wednesday)'
  },
  {
    id: 'sr-4',
    name: 'Chittagong Elite Lounge',
    address: 'Sanmar Ocean City, Level 4, GEC Circle, Chittagong',
    phone: '+880 1711-122334',
    hours: '11:00 AM - 09:00 PM (Closed on Thursday)'
  }
];
