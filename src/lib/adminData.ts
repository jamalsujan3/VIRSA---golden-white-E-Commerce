import { Order, Product } from '../types';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super-admin' | 'manager' | 'order-staff' | 'support';
  isActive: boolean;
  lastLoginAt: string;
}

export interface ActivityLog {
  id: string;
  adminName: string;
  adminRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  timestamp: string;
}

export interface ReturnRequest {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  reason: string;
  reasonDetail: string;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  createdAt: string;
  images: string[];
}

export interface CMSCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null; // null for top level
  coverImage?: string;
  displayOrder: number;
  isActive: boolean;
  showInNavigation: boolean;
  showInHomepageGrid: boolean;
}

export interface StoreSetting {
  id: string;
  group: string;
  key: string;
  value: any;
}

// 1. INITIAL ADMIN USERS
const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: 'adm-1', name: 'Jamal Admin', email: 'jamalsujan3@gmail.com', role: 'super-admin', isActive: true, lastLoginAt: '2026-07-10T09:00:00Z' },
  { id: 'adm-2', name: 'Rahim Khan', email: 'rahim@virsa.com', role: 'manager', isActive: true, lastLoginAt: '2026-07-10T10:15:00Z' },
  { id: 'adm-3', name: 'Delivery Lead', email: 'delivery@virsa.com', role: 'order-staff', isActive: true, lastLoginAt: '2026-07-09T14:22:00Z' },
  { id: 'adm-4', name: 'Mina Support', email: 'support@virsa.com', role: 'support', isActive: true, lastLoginAt: '2026-07-10T08:45:00Z' }
];

// 2. INITIAL RETURN REQUESTS
const INITIAL_RETURN_REQUESTS: ReturnRequest[] = [
  {
    id: 'RET-001',
    orderNumber: 'VRS-1002',
    customerName: 'Tanvir Hossain',
    customerPhone: '01711223344',
    productName: 'Midnight Onyx Premium Cotton Panjabi (M)',
    reason: 'Wrong Size',
    reasonDetail: 'The medium fit is slightly too tight across the shoulders. Customer prefers to return for a size L refund.',
    status: 'pending',
    amount: 4890,
    createdAt: '2026-07-08T14:32:00-07:00',
    images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=150&q=80&fit=crop']
  },
  {
    id: 'RET-002',
    orderNumber: 'VRS-1004',
    customerName: 'Sajid Islam',
    customerPhone: '01898765432',
    productName: 'Imperial Velvet Wedding Koti (L)',
    reason: 'Defective Fabric',
    reasonDetail: 'Subtle weaving flaw found near the left pocket seam.',
    status: 'approved',
    amount: 6890,
    createdAt: '2026-07-05T11:20:00-07:00',
    images: ['https://images.unsplash.com/photo-1607823012229-43c2247aa831?w=150&q=80&fit=crop']
  }
];

// 3. INITIAL ACTIVITY LOGS
const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    adminName: 'Jamal Admin',
    adminRole: 'super-admin',
    action: 'Logged In',
    resourceType: 'auth',
    resourceId: 'adm-1',
    details: 'Admin dashboard login successful from IP 103.45.12.98',
    timestamp: '2026-07-10T10:15:00-07:00'
  },
  {
    id: 'log-2',
    adminName: 'Rahim Khan',
    adminRole: 'manager',
    action: 'Updated Stock',
    resourceType: 'product',
    resourceId: 'prod-1',
    details: 'Increased stock of Midnight Onyx Premium Cotton Panjabi (XL) by +10 units',
    timestamp: '2026-07-10T09:30:00-07:00'
  },
  {
    id: 'log-3',
    adminName: 'Jamal Admin',
    adminRole: 'super-admin',
    action: 'Approved Refund',
    resourceType: 'return_request',
    resourceId: 'RET-002',
    details: 'Approved refund value of ৳6,890 for Sajid Islam (VRS-1004)',
    timestamp: '2026-07-10T08:12:00-07:00'
  },
  {
    id: 'log-4',
    adminName: 'Delivery Lead',
    adminRole: 'order-staff',
    action: 'Updated Order Status',
    resourceType: 'order',
    resourceId: 'VRS-1001',
    details: 'Marked order status of VRS-1001 as Shipped',
    timestamp: '2026-07-09T16:45:00-07:00'
  }
];

// 4. INITIAL HIERARCHICAL CATEGORIES
const INITIAL_CMS_CATEGORIES: CMSCategory[] = [
  { id: 'cat-1', name: 'Panjabi', slug: 'panjabi', parentId: null, displayOrder: 1, isActive: true, showInNavigation: true, showInHomepageGrid: true },
  { id: 'cat-2', name: 'Cotton Panjabi', slug: 'cotton-panjabi', parentId: 'cat-1', displayOrder: 1, isActive: true, showInNavigation: true, showInHomepageGrid: false },
  { id: 'cat-3', name: 'Mulberry Silk Panjabi', slug: 'mulberry-silk-panjabi', parentId: 'cat-1', displayOrder: 2, isActive: true, showInNavigation: true, showInHomepageGrid: false },
  { id: 'cat-4', name: 'Koti', slug: 'koti', parentId: null, displayOrder: 2, isActive: true, showInNavigation: true, showInHomepageGrid: true },
  { id: 'cat-5', name: 'Sherwani', slug: 'sherwani', parentId: null, displayOrder: 3, isActive: true, showInNavigation: true, showInHomepageGrid: true },
  { id: 'cat-6', name: 'Jubbah', slug: 'jubbah', parentId: null, displayOrder: 4, isActive: true, showInNavigation: true, showInHomepageGrid: true }
];

// 5. INITIAL SETTINGS
const INITIAL_STORE_SETTINGS: StoreSetting[] = [
  { id: 'set-1', group: 'store', key: 'storeName', value: 'VIRSA Atelier' },
  { id: 'set-2', group: 'store', key: 'supportEmail', value: 'support@virsa.com.bd' },
  { id: 'set-3', group: 'store', key: 'supportPhone', value: '+880 1712-345678' },
  { id: 'set-4', group: 'payments', key: 'codEnabled', value: true },
  { id: 'set-5', group: 'payments', key: 'bkashEnabled', value: true },
  { id: 'set-6', group: 'payments', key: 'bkashSandbox', value: true },
  { id: 'set-7', group: 'payments', key: 'nagadEnabled', value: false },
  { id: 'set-8', group: 'payments', key: 'sslEnabled', value: true },
  { id: 'set-9', group: 'shipping', key: 'dhakaCost', value: 60 },
  { id: 'set-10', group: 'shipping', key: 'outsideCost', value: 120 },
  { id: 'set-11', group: 'shipping', key: 'freeThreshold', value: 5000 },
  { id: 'set-12', group: 'tax', key: 'vatPercent', value: 5 },
  { id: 'set-13', group: 'tax', key: 'vatInclusive', value: true }
];

// 6. INITIAL BRAND ASSETS
export interface BrandAsset {
  type: string;
  url: string;
  altText: string;
}

const INITIAL_BRAND_ASSETS: BrandAsset[] = [
  { type: 'header_logo', url: '', altText: 'VIRSA - Tradition. Redefined.' },
  { type: 'footer_logo', url: '', altText: 'VIRSA Atelier' },
  { type: 'favicon', url: '', altText: 'VIRSA' }
];

export interface ShopAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours: string;
  mapEmbed: string;
  isActive: boolean;
  displayOrder: number;
}

const INITIAL_SHOPS: ShopAddress[] = [
  {
    id: 'shop-1',
    name: 'Dhanmondi Flagship Store',
    address: 'House 12, Road 27, Dhanmondi, Dhaka 1205',
    city: 'Dhaka',
    phone: '01712-345678',
    hours: 'Sat — Thu: 10:00 AM - 10:00 PM, Friday: Closed',
    mapEmbed: 'https://maps.google.com/maps?...',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'shop-2',
    name: 'Gulshan Atelier',
    address: 'Pink City, Level 2, Gulshan 2, Dhaka 1212',
    city: 'Dhaka',
    phone: '01898-765432',
    hours: 'Daily: 11:00 AM - 9:00 PM',
    mapEmbed: 'https://maps.google.com/maps?...',
    isActive: true,
    displayOrder: 2
  }
];

// HELPER PERSISTENCE ACTIONS
export function loadAdminUsers(): AdminUser[] {
  const saved = localStorage.getItem('virsa_admin_users');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_admin_users', JSON.stringify(INITIAL_ADMIN_USERS));
  return INITIAL_ADMIN_USERS;
}

export function saveAdminUsers(users: AdminUser[]) {
  localStorage.setItem('virsa_admin_users', JSON.stringify(users));
}

export function loadReturnRequests(): ReturnRequest[] {
  const saved = localStorage.getItem('virsa_return_requests');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_return_requests', JSON.stringify(INITIAL_RETURN_REQUESTS));
  return INITIAL_RETURN_REQUESTS;
}

export function saveReturnRequests(requests: ReturnRequest[]) {
  localStorage.setItem('virsa_return_requests', JSON.stringify(requests));
}

export function loadActivityLogs(): ActivityLog[] {
  const saved = localStorage.getItem('virsa_activity_logs');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_activity_logs', JSON.stringify(INITIAL_ACTIVITY_LOGS));
  return INITIAL_ACTIVITY_LOGS;
}

export function saveActivityLogs(logs: ActivityLog[]) {
  localStorage.setItem('virsa_activity_logs', JSON.stringify(logs));
}

export function addActivityLog(adminName: string, adminRole: string, action: string, type: string, id: string, details: string) {
  const logs = loadActivityLogs();
  const newLog: ActivityLog = {
    id: 'log-' + Date.now(),
    adminName,
    adminRole,
    action,
    resourceType: type,
    resourceId: id,
    details,
    timestamp: new Date().toISOString()
  };
  saveActivityLogs([newLog, ...logs]);
}

export function loadCMSCategories(): CMSCategory[] {
  const saved = localStorage.getItem('virsa_cms_categories');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_cms_categories', JSON.stringify(INITIAL_CMS_CATEGORIES));
  return INITIAL_CMS_CATEGORIES;
}

export function saveCMSCategories(cats: CMSCategory[]) {
  localStorage.setItem('virsa_cms_categories', JSON.stringify(cats));
}

export function loadStoreSettings(): StoreSetting[] {
  const saved = localStorage.getItem('virsa_store_settings');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_store_settings', JSON.stringify(INITIAL_STORE_SETTINGS));
  return INITIAL_STORE_SETTINGS;
}

export function saveStoreSettings(settings: StoreSetting[]) {
  localStorage.setItem('virsa_store_settings', JSON.stringify(settings));
}

export function loadBrandAssets(): BrandAsset[] {
  const saved = localStorage.getItem('virsa_brand_assets');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_brand_assets', JSON.stringify(INITIAL_BRAND_ASSETS));
  return INITIAL_BRAND_ASSETS;
}

export function saveBrandAssets(assets: BrandAsset[]) {
  localStorage.setItem('virsa_brand_assets', JSON.stringify(assets));
}

export function loadShops(): ShopAddress[] {
  const saved = localStorage.getItem('virsa_shops');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_shops', JSON.stringify(INITIAL_SHOPS));
  return INITIAL_SHOPS;
}

export function saveShops(shops: ShopAddress[]) {
  localStorage.setItem('virsa_shops', JSON.stringify(shops));
}

// 7. DYNAMIC FAQ INTERFACES AND CONSTANTS
export interface FAQItem {
  id: string;
  catId: string; // 'fabric' | 'tailoring' | 'shipping' | 'general'
  question: string;
  answer: string;
  displayOrder: number;
}

const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    catId: 'fabric',
    question: 'How do I care for my premium Jamdani and Muslin outfits?',
    answer: 'Jamdani and Muslin are highly delicate, hand-loomed fabrics that require special care. We strongly recommend professional dry cleaning only. For pressing, always use low steam heat and place a clean cotton cloth between the iron and the fabric to safeguard the handwoven gold and silver metallic threads (Zari). Store them wrapped in acid-free tissue paper or soft muslin fabric to preserve the colors and fibers.',
    displayOrder: 1
  },
  {
    id: 'faq-2',
    catId: 'fabric',
    question: 'Can I hand-wash Virsa pure silk and linen garments?',
    answer: 'Pure silks and structured linen jackets must be dry-cleaned to preserve their original texture, natural drape, and deep jewel-tone brilliance. Gentle hand-washing is acceptable only for our casual linen and soft cotton blends, using lukewarm water and extremely mild liquid detergent. Never wring or twist; lay flat or line dry in shade away from direct sunlight.',
    displayOrder: 2
  },
  {
    id: 'faq-3',
    catId: 'fabric',
    question: 'How should I store luxury Sherwanis and heavy Koti vests?',
    answer: 'Heavy wedding Sherwanis and embroidered Koti vests should be hung on wide, contoured wooden hangers to preserve the shoulder structure. Use the breathable garment cover provided with your purchase. Avoid damp environments, and store with cedar chips or silica gels to prevent humidity damage.',
    displayOrder: 3
  },
  {
    id: 'faq-4',
    catId: 'tailoring',
    question: 'How does your made-to-measure / custom fitting work?',
    answer: 'Virsa offers a premier bespoke service. On any applicable product page, select the "Custom Size" option and input your chest, shoulder, sleeve, and height coordinates. Alternatively, you can schedule a private virtual consultation via WhatsApp with our Master Tailor to guide you step-by-step through the fitting process.',
    displayOrder: 1
  },
  {
    id: 'faq-5',
    catId: 'tailoring',
    question: 'What is the "Atelier Perfect Fit Guarantee"?',
    answer: 'We guarantee a impeccable silhouette. If your custom-fit garment requires minor adjustments upon delivery, you can bring it to any of our physical flagship showrooms for complimentary tailoring. If you live outside Dhaka, we will reimburse local tailoring costs up to ৳1,500 upon submission of a standard receipt.',
    displayOrder: 2
  },
  {
    id: 'faq-6',
    catId: 'tailoring',
    question: 'Can I request design customizations (necklines, embroidery, color alterations)?',
    answer: 'Yes, we welcome aesthetic customizations for our bespoke collections. You can request alterations to sleeve lengths, collar heights, or embroidery density. Please leave specific instructions in the "Special Atelier Notes" field during checkout or reach out to our VIP concierge team directly after placing your order.',
    displayOrder: 3
  },
  {
    id: 'faq-7',
    catId: 'shipping',
    question: 'What are the delivery fees and timelines across Bangladesh?',
    answer: 'We provide expedited white-glove courier delivery across the nation. Inside Dhaka Division, delivery takes 2-3 business days at a flat rate of ৳80. Outside Dhaka Division, delivery takes 4-7 business days at a flat rate of ৳130. Express next-day delivery options are available for selected Dhaka areas.',
    displayOrder: 1
  },
  {
    id: 'faq-8',
    catId: 'shipping',
    question: 'Do you support Cash on Delivery (COD)?',
    answer: 'Yes, Cash on Delivery is fully supported across all 64 districts in Bangladesh. You are welcome to unpack the courier package and inspect the quality of the premium hanger-box packaging inside the presence of our delivery partner before completing the cash payment.',
    displayOrder: 2
  },
  {
    id: 'faq-9',
    catId: 'shipping',
    question: 'How are the luxury garments packaged for transit?',
    answer: 'To ensure your masterpiece arrives pristine, all Panjabis, Sherwanis, and Kotis are packaged inside our signature luxury presentation box. They are placed on custom hangers inside moisture-wicking protective liners, enclosed inside a secure weather-resistant shipping carton to avoid any wrinkling or weather damage.',
    displayOrder: 3
  }
];

export function loadFAQItems(): FAQItem[] {
  const saved = localStorage.getItem('virsa_faq_items');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_faq_items', JSON.stringify(INITIAL_FAQS));
  return INITIAL_FAQS;
}

export function saveFAQItems(items: FAQItem[]) {
  localStorage.setItem('virsa_faq_items', JSON.stringify(items));
}

// 8. DYNAMIC FAQ CATEGORIES
export interface FAQCategory {
  id: string;
  title: string;
  iconName?: string; // 'Droplets' | 'Scissors' | 'Truck' | 'HelpCircle' | 'Info' etc.
  color?: string; // tailwind classes
}

const INITIAL_FAQ_CATEGORIES: FAQCategory[] = [
  { id: 'fabric', title: 'Fabric Care & Materials', iconName: 'Droplets', color: 'text-blue-500 bg-blue-50' },
  { id: 'tailoring', title: 'Custom Tailoring & Fitting', iconName: 'Scissors', color: 'text-purple-500 bg-purple-50' },
  { id: 'shipping', title: 'Deliveries & Logistics', iconName: 'Truck', color: 'text-amber-500 bg-amber-50' },
  { id: 'general', title: 'General Inquiries', iconName: 'HelpCircle', color: 'text-gray-500 bg-gray-50' }
];

export function loadFAQCategories(): FAQCategory[] {
  const saved = localStorage.getItem('virsa_faq_categories');
  if (saved) return JSON.parse(saved);
  localStorage.setItem('virsa_faq_categories', JSON.stringify(INITIAL_FAQ_CATEGORIES));
  return INITIAL_FAQ_CATEGORIES;
}

export function saveFAQCategories(categories: FAQCategory[]) {
  localStorage.setItem('virsa_faq_categories', JSON.stringify(categories));
}


