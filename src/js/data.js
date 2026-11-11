/**
 * ShoeStyle — Step in Style
 * Catalogue & Données Bilingues (Français / العربية)
 */

export const IMAGES = {
  hero: './src/assets/images/hero_luxury_heels_1794235632221.jpg',
  sneakers: './src/assets/images/shoe_sneakers_blush_1794235633502.jpg',
  talons: './src/assets/images/shoe_talons_silk_1794235633825.jpg',
  sandales: './src/assets/images/shoe_sandales_strappy_1794235634994.jpg',
  boots: './src/assets/images/shoe_bottes_clean.jpg',
  ballerines: './src/assets/images/shoe_ballerines_clean.jpg',
  ballerinesBoots: './src/assets/images/shoe_ballerines_boots_1794235635360.jpg',
};

export const CATEGORIES = [
  {
    id: 'Sneakers',
    name_fr: 'Sneakers',
    name_ar: 'سنيكرز',
    subtitle_fr: 'Confort & Allure Urbaine',
    subtitle_ar: 'راحة وأناقة عصرية',
    count: 14,
    image: IMAGES.sneakers,
  },
  {
    id: 'Talons',
    name_fr: 'Talons',
    name_ar: 'كعب عالي',
    subtitle_fr: 'Féminité & Élégance',
    subtitle_ar: 'أنوثة وأناقة راقية',
    count: 18,
    image: IMAGES.talons,
  },
  {
    id: 'Sandales',
    name_fr: 'Sandales',
    name_ar: 'صنادل',
    subtitle_fr: 'Finesse & Légèreté',
    subtitle_ar: 'خفة ورقة الصيف',
    count: 16,
    image: IMAGES.sandales,
  },
  {
    id: 'Bottes',
    name_fr: 'Bottes',
    name_ar: 'بوتين',
    subtitle_fr: 'Silhouette Automne–Hiver',
    subtitle_ar: 'إطلالة دافئة للموسم',
    count: 11,
    image: IMAGES.boots,
  },
  {
    id: 'Ballerines',
    name_fr: 'Ballerines',
    name_ar: 'باليرين',
    subtitle_fr: 'Douceur au Quotidien',
    subtitle_ar: 'نعومة وراحة يومية',
    count: 12,
    image: IMAGES.ballerines,
  },
];

export const COLOR_SWATCHES = {
  Rose: { hex: '#F38BA8', label_fr: 'Rose', label_ar: 'وردي' },
  Noir: { hex: '#1A1A1E', label_fr: 'Noir', label_ar: 'أسود' },
  Beige: { hex: '#C8A27E', label_fr: 'Beige', label_ar: 'بيج' },
  Blanc: { hex: '#F8F6F4', label_fr: 'Blanc', label_ar: 'أبيض' },
  Rouge: { hex: '#B91C2E', label_fr: 'Rouge', label_ar: 'أحمر' },
  'وردي': { hex: '#F38BA8', label_fr: 'Rose', label_ar: 'وردي' },
  'أسود': { hex: '#1A1A1E', label_fr: 'Noir', label_ar: 'أسود' },
  'بيج': { hex: '#C8A27E', label_fr: 'Beige', label_ar: 'بيج' },
  'أبيض': { hex: '#F8F6F4', label_fr: 'Blanc', label_ar: 'أبيض' },
  'أحمر': { hex: '#B91C2E', label_fr: 'Rouge', label_ar: 'أحمر' },
  'رمادي': { hex: '#808080', label_fr: 'Gris', label_ar: 'رمادي' },
  'ذهبي': { hex: '#D4AF37', label_fr: 'Doré', label_ar: 'ذهبي' },
  'بني': { hex: '#8B4513', label_fr: 'Marron', label_ar: 'بني' },
  'عنابي': { hex: '#800020', label_fr: 'Bordeaux', label_ar: 'عنابي' },
  'كحلي': { hex: '#000080', label_fr: 'Bleu Nuit', label_ar: 'كحلي' },
};

export function getProductColorHex(product, colorName) {
  if (!colorName) return '#D2B48C';
  const cNorm = String(colorName).trim().toLowerCase();

  // 1. If product has variants, check matching variant colorHex
  if (product && Array.isArray(product.variants)) {
    const match = product.variants.find(
      (v) => v && v.colorName && String(v.colorName).trim().toLowerCase() === cNorm && v.colorHex
    );
    if (match && match.colorHex) return match.colorHex;
  }

  // 2. Check if product has colorHexes map
  if (product && product.colorHexes && product.colorHexes[colorName]) {
    return product.colorHexes[colorName];
  }

  // 3. If product has colorHex property
  if (
    product &&
    product.colorHex &&
    (
      (product.colorName && String(product.colorName).trim().toLowerCase() === cNorm) ||
      (product.color && String(product.color).trim().toLowerCase() === cNorm) ||
      (!product.colors || product.colors.length <= 1)
    )
  ) {
    return product.colorHex;
  }

  // 4. If colorName itself is a valid hex string
  if (typeof colorName === 'string' && colorName.startsWith('#')) {
    return colorName;
  }

  // 5. Check global COLOR_SWATCHES
  if (COLOR_SWATCHES[colorName] && COLOR_SWATCHES[colorName].hex) {
    return COLOR_SWATCHES[colorName].hex;
  }

  // 6. Check common Arabic color names
  const arabicColors = {
    'وردي': '#F38BA8',
    'أسود': '#1A1A1E',
    'بيج': '#C8A27E',
    'أبيض': '#F8F6F4',
    'أحمر': '#B91C2E',
    'رمادي': '#808080',
    'ذهبي': '#D4AF37',
    'بني': '#8B4513',
    'أزرق': '#2563EB',
    'أخضر': '#16A34A',
    'عنابي': '#800020',
    'كحلي': '#000080',
    'فضائي': '#C0C0C0',
    'مارون': '#800000',
    'برتقالي': '#F97316',
  };
  if (arabicColors[colorName]) {
    return arabicColors[colorName];
  }

  return '#D2B48C';
}

const INVENTORY_STORAGE_KEY = 'shoestyle_inventory_v1';

export const DEFAULT_PRODUCTS = [
  {
    id: 'ss-01',
    slug: 'escarpins-elegants',
    name_fr: 'Escarpins Élégants',
    name_ar: 'حذاء كعب أنيق',
    category: 'Talons',
    price: 4990,
    originalPrice: 6690,
    discountPercent: 25,
    isNew: true,
    isBestSeller: true,
    isSpecialOffer: true,
    image: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero, IMAGES.sandales],
    colors: ['Rose', 'Noir', 'Beige'],
    sizes: [36, 37, 38, 39, 40],
    description_fr: 'Un style raffiné pour toutes vos occasions. Finition vernie rose poudré et semelle intérieure coussinée ultra-confortable.',
    description_ar: 'تصميم راقٍ ومثالي لجميع مناسباتك. لمسة نهائية باللون الوردي اللامع مع نعل داخلي مبطن فائق الراحة.',
  },
  {
    id: 'ss-02',
    slug: 'baskets-mode',
    name_fr: 'Baskets Mode',
    name_ar: 'سنيكرز عصري',
    category: 'Sneakers',
    price: 3990,
    originalPrice: 4990,
    discountPercent: 20,
    isNew: true,
    isBestSeller: true,
    isSpecialOffer: false,
    image: IMAGES.sneakers,
    gallery: [IMAGES.sneakers, IMAGES.ballerines, IMAGES.hero],
    colors: ['Blanc', 'Rose', 'Beige'],
    sizes: [36, 37, 38, 39, 40, 41],
    description_fr: 'Baskets basses au design chic avec détails rose poudré et semelle souple idéale pour vos journées actives.',
    description_ar: 'حذاء رياضي أنيق بتفاصيل بلون وردي ناعم ونعل مرن مريح جداً لنشاطك اليومي.',
  },
  {
    id: 'ss-03',
    slug: 'escarpins-chic',
    name_fr: 'Escarpins Chic',
    name_ar: 'إسكربين شيك',
    category: 'Talons',
    price: 4990,
    originalPrice: 6690,
    discountPercent: 25,
    isNew: false,
    isBestSeller: true,
    isSpecialOffer: true,
    image: IMAGES.hero,
    gallery: [IMAGES.hero, IMAGES.talons, IMAGES.sandales],
    colors: ['Noir', 'Rose', 'Beige'],
    sizes: [36, 37, 38, 39, 40],
    description_fr: 'L’escarpin intemporel à bout pointu qui élance la silhouette avec grâce et stabilité.',
    description_ar: 'حذاء كلاسيكي بمقدمة مدببة يمنح قوامك رشاقة وأناقة مع ثبات ممتاز في المشي.',
  },
  {
    id: 'ss-04',
    slug: 'talons-classiques',
    name_fr: 'Talons Classiques',
    name_ar: 'كعب كلاسيكي نود',
    category: 'Talons',
    price: 4790,
    originalPrice: 5990,
    discountPercent: 20,
    isNew: true,
    isBestSeller: true,
    isSpecialOffer: true,
    image: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero],
    colors: ['Beige', 'Rose', 'Noir'],
    sizes: [36, 37, 38, 39, 40],
    description_fr: 'Teinte nude beige lumineuse et cambrure équilibrée pour accompagner aussi bien un tailleur qu’une tenue de soirée.',
    description_ar: 'لون بيج نود مضيء وتصميم متوازن يتناسق بشكل رائع مع الإطلالات الرسمية والفساتين.',
  },
  {
    id: 'ss-05',
    slug: 'sandales-fines-dorees',
    name_fr: 'Sandales Fines Dorées',
    name_ar: 'صندل ناعم بشرائط',
    category: 'Sandales',
    price: 4290,
    originalPrice: 5490,
    discountPercent: 22,
    isNew: true,
    isBestSeller: false,
    isSpecialOffer: true,
    image: IMAGES.sandales,
    gallery: [IMAGES.sandales, IMAGES.hero, IMAGES.talons],
    colors: ['Beige', 'Rose'],
    sizes: [36, 37, 38, 39, 40],
    description_fr: 'Brides délicates entrelacées et talon bloc stable pour une démarche tout en légèreté.',
    description_ar: 'شرائط ناعمة متداخلة مع كعب عريض ومستقر لمشية خفيفة وجذابة.',
  },
  {
    id: 'ss-06',
    slug: 'escarpins-passion',
    name_fr: 'Escarpins Passion',
    name_ar: 'إسكربين أحمر براق',
    category: 'Talons',
    price: 4590,
    originalPrice: 6550,
    discountPercent: 30,
    isNew: false,
    isBestSeller: false,
    isSpecialOffer: true,
    image: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero],
    colors: ['Rouge', 'Noir', 'Rose'],
    sizes: [36, 37, 38, 39, 40],
    description_fr: 'Une ligne glamour à finition brillante, pensée pour sublimer vos grandes occasions.',
    description_ar: 'تصميم ساحر بلمعان فخم يبرز جاذبيتك في الحفلات وأرقى المناسبات.',
  },
  {
    id: 'ss-07',
    slug: 'bottines-elegance',
    name_fr: 'Bottines Élégance',
    name_ar: 'بوتين جلد أنيق',
    category: 'Bottes',
    price: 5890,
    originalPrice: 7390,
    discountPercent: 20,
    isNew: true,
    isBestSeller: true,
    isSpecialOffer: false,
    image: IMAGES.boots,
    gallery: [IMAGES.boots, IMAGES.ballerinesBoots],
    colors: ['Beige', 'Noir'],
    sizes: [36, 37, 38, 39, 40, 41],
    description_fr: 'Bottines cheville en cuir souple à fermeture zippée et talon confortable pour la mi-saison et l’hiver.',
    description_ar: 'بوتين يصل للكاحل من جلد مرن مع سحاب وكعب مريح جداً للإطلالات الشتوية.',
  },
  {
    id: 'ss-08',
    slug: 'ballerines-douceur-rose',
    name_fr: 'Ballerines Douceur Rose',
    name_ar: 'باليرين ماري جين وردي',
    category: 'Ballerines',
    price: 3690,
    originalPrice: 4590,
    discountPercent: 20,
    isNew: true,
    isBestSeller: false,
    isSpecialOffer: true,
    image: IMAGES.ballerines,
    gallery: [IMAGES.ballerines, IMAGES.sandales],
    colors: ['Rose', 'Beige', 'Noir'],
    sizes: [35, 36, 37, 38, 39, 40],
    description_fr: 'Ballerines souples avec fine bride Mary Jane pour un style féminin et sans effort.',
    description_ar: 'باليرين ناعم ومريح مع شريط ماري جين الرقيق لأسلوب أنثوي أنيق طوال اليوم.',
  },
];

function getInitialProducts() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .map((invItem) => {
            const effectivePrice =
              invItem.discountPrice !== null &&
              invItem.discountPrice !== undefined &&
              invItem.discountPrice !== '' &&
              Number(invItem.discountPrice) > 0
                ? Number(invItem.discountPrice)
                : Number(invItem.originalPrice || invItem.price || 0);

            const origPrice = Number(invItem.originalPrice || effectivePrice);
            const discPercent =
              origPrice > effectivePrice && origPrice > 0
                ? Math.round(((origPrice - effectivePrice) / origPrice) * 100)
                : 0;

            const sizesList = Array.isArray(invItem.sizes) ? invItem.sizes : [];
            const colorsList =
              Array.isArray(invItem.colors) && invItem.colors.length > 0
                ? invItem.colors
                : [invItem.colorName || 'Beige'];

            const cleanGallery =
              Array.isArray(invItem.gallery) && invItem.gallery.filter(Boolean).length > 0
                ? [...invItem.gallery.filter(Boolean)]
                : [invItem.image].filter(Boolean);

            return {
              id: invItem.id,
              slug: invItem.slug,
              name_fr: invItem.name_fr || invItem.name,
              name_ar: invItem.name || invItem.name_fr,
              category: invItem.category,
              price: effectivePrice,
              originalPrice: origPrice > effectivePrice ? origPrice : null,
              discountPercent: discPercent,
              stock: Number(invItem.stock ?? 10),
              sizeStock: invItem.sizeStock || {},
              rating: 4.9,
              reviewsCount: 45,
              isVisible: invItem.isVisible !== false,
              isNew: Boolean(invItem.isNew ?? true),
              isBestSeller: Boolean(invItem.isBestSeller ?? false),
              isSpecialOffer: Boolean(invItem.isSpecialOffer ?? false),
              offerEnabled: invItem.offerEnabled !== false,
              offerMinQty: Math.max(2, Number(invItem.offerMinQty || 2)),
              offerFreeShipping: invItem.offerFreeShipping !== false,
              offerText: invItem.offerText || '',
              colorName: invItem.colorName || colorsList[0] || 'Beige',
              colorHex: invItem.colorHex || '#D2B48C',
              colorHexes: invItem.colorHexes || {},
              colors: colorsList,
              sizes: sizesList,
              variants: Array.isArray(invItem.variants) ? invItem.variants : [],
              image: cleanGallery[0] || invItem.image,
              gallery: cleanGallery,
              description_fr: invItem.description_fr || invItem.name_fr || invItem.name,
              description_ar: invItem.description_ar || `${invItem.name || invItem.name_fr}`,
            };
          })
          .filter((p) => p.isVisible !== false);
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_PRODUCTS.map((p) => ({ ...p }));
}

export const PRODUCTS = getInitialProducts();

export const TESTIMONIALS = [];

export const WILAYAS = [
  { code: '01', name_fr: '01 - Adrar', name_ar: '01 - أدرار', fee: 900 },
  { code: '02', name_fr: '02 - Chlef', name_ar: '02 - الشلف', fee: 500 },
  { code: '03', name_fr: '03 - Laghouat', name_ar: '03 - الأغواط', fee: 700 },
  { code: '04', name_fr: '04 - Oum El Bouaghi', name_ar: '04 - أم البواقي', fee: 550 },
  { code: '05', name_fr: '05 - Batna', name_ar: '05 - باتنة', fee: 550 },
  { code: '06', name_fr: '06 - Béjaïa', name_ar: '06 - بجاية', fee: 500 },
  { code: '07', name_fr: '07 - Biskra', name_ar: '07 - بسكرة', fee: 600 },
  { code: '08', name_fr: '08 - Béchar', name_ar: '08 - بشار', fee: 850 },
  { code: '09', name_fr: '09 - Blida', name_ar: '09 - البليدة', fee: 450 },
  { code: '10', name_fr: '10 - Bouira', name_ar: '10 - البويرة', fee: 500 },
  { code: '11', name_fr: '11 - Tamanrasset', name_ar: '11 - تمنراست', fee: 1100 },
  { code: '12', name_fr: '12 - Tébessa', name_ar: '12 - تبسة', fee: 600 },
  { code: '13', name_fr: '13 - Tlemcen', name_ar: '13 - تلمسان', fee: 550 },
  { code: '14', name_fr: '14 - Tiaret', name_ar: '14 - تيارت', fee: 550 },
  { code: '15', name_fr: '15 - Tizi Ouzou', name_ar: '15 - تيزي وزو', fee: 500 },
  { code: '16', name_fr: '16 - Alger', name_ar: '16 - الجزائر العاصمة', fee: 400 },
  { code: '17', name_fr: '17 - Djelfa', name_ar: '17 - الجلفة', fee: 600 },
  { code: '18', name_fr: '18 - Jijel', name_ar: '18 - جيجل', fee: 550 },
  { code: '19', name_fr: '19 - Sétif', name_ar: '19 - سطيف', fee: 500 },
  { code: '20', name_fr: '20 - Saïda', name_ar: '20 - سعيدة', fee: 600 },
  { code: '21', name_fr: '21 - Skikda', name_ar: '21 - سكيكدة', fee: 550 },
  { code: '22', name_fr: '22 - Sidi Bel Abbès', name_ar: '22 - سيدي بلعباس', fee: 550 },
  { code: '23', name_fr: '23 - Annaba', name_ar: '23 - عنابة', fee: 500 },
  { code: '24', name_fr: '24 - Guelma', name_ar: '24 - قالمة', fee: 550 },
  { code: '25', name_fr: '25 - Constantine', name_ar: '25 - قسنطينة', fee: 500 },
  { code: '26', name_fr: '26 - Médéa', name_ar: '26 - المدية', fee: 500 },
  { code: '27', name_fr: '27 - Mostaganem', name_ar: '27 - مستغانم', fee: 550 },
  { code: '28', name_fr: '28 - M’Sila', name_ar: '28 - المسيلة', fee: 550 },
  { code: '29', name_fr: '29 - Mascara', name_ar: '29 - معسكر', fee: 550 },
  { code: '30', name_fr: '30 - Ouargla', name_ar: '30 - ورقلة', fee: 750 },
  { code: '31', name_fr: '31 - Oran', name_ar: '31 - وهران', fee: 500 },
  { code: '32', name_fr: '32 - El Bayadh', name_ar: '32 - البيض', fee: 750 },
  { code: '33', name_fr: '33 - Illizi', name_ar: '33 - إليزي', fee: 1100 },
  { code: '34', name_fr: '34 - Bordj Bou Arréridj', name_ar: '34 - برج بوعريريج', fee: 500 },
  { code: '35', name_fr: '35 - Boumerdès', name_ar: '35 - بومرداس', fee: 450 },
  { code: '36', name_fr: '36 - El Tarf', name_ar: '36 - الطارف', fee: 600 },
  { code: '37', name_fr: '37 - Tindouf', name_ar: '37 - تندوف', fee: 1100 },
  { code: '38', name_fr: '38 - Tissemsilt', name_ar: '38 - تيسمسيلت', fee: 550 },
  { code: '39', name_fr: '39 - El Oued', name_ar: '39 - الوادي', fee: 700 },
  { code: '40', name_fr: '40 - Khenchela', name_ar: '40 - خنشلة', fee: 600 },
  { code: '41', name_fr: '41 - Souk Ahras', name_ar: '41 - سوق أهراس', fee: 600 },
  { code: '42', name_fr: '42 - Tipaza', name_ar: '42 - تيبازة', fee: 450 },
  { code: '43', name_fr: '43 - Mila', name_ar: '43 - ميلة', fee: 550 },
  { code: '44', name_fr: '44 - Aïn Defla', name_ar: '44 - عين الدفلى', fee: 500 },
  { code: '45', name_fr: '45 - Naâma', name_ar: '45 - النعامة', fee: 750 },
  { code: '46', name_fr: '46 - Aïn Témouchent', name_ar: '46 - عين تموشنت', fee: 550 },
  { code: '47', name_fr: '47 - Ghardaïa', name_ar: '47 - غرداية', fee: 700 },
  { code: '48', name_fr: '48 - Relizane', name_ar: '48 - غليزان', fee: 550 },
  { code: '49', name_fr: '49 - Timimoun', name_ar: '49 - تيميمون', fee: 950 },
  { code: '50', name_fr: '50 - Bordj Badji Mokhtar', name_ar: '50 - برج باجي مختار', fee: 1200 },
  { code: '51', name_fr: '51 - Ouled Djellal', name_ar: '51 - أولاد جلال', fee: 650 },
  { code: '52', name_fr: '52 - Béni Abbès', name_ar: '52 - بني عباس', fee: 900 },
  { code: '53', name_fr: '53 - In Salah', name_ar: '53 - عين صالح', fee: 1000 },
  { code: '54', name_fr: '54 - In Guezzam', name_ar: '54 - عين قزام', fee: 1200 },
  { code: '55', name_fr: '55 - Touggourt', name_ar: '55 - تقرت', fee: 700 },
  { code: '56', name_fr: '56 - Djanet', name_ar: '56 - جانت', fee: 1150 },
  { code: '57', name_fr: '57 - El M’Ghair', name_ar: '57 - المغير', fee: 700 },
  { code: '58', name_fr: '58 - El Meniaa', name_ar: '58 - المنيعة', fee: 800 },
  { code: '59', name_fr: '59 - Aflou', name_ar: '59 - أفلو', fee: 700 },
  { code: '60', name_fr: '60 - Barika', name_ar: '60 - بريكة', fee: 550 },
  { code: '61', name_fr: '61 - Ksar Chellala', name_ar: '61 - قصر الشلالة', fee: 600 },
  { code: '62', name_fr: '62 - Messaad', name_ar: '62 - مسعد', fee: 650 },
  { code: '63', name_fr: '63 - Aïn Oussera', name_ar: '63 - عين وسارة', fee: 550 },
  { code: '64', name_fr: '64 - Bou Saâda', name_ar: '64 - بوسعادة', fee: 550 },
  { code: '65', name_fr: '65 - El Abiodh Sidi Cheikh', name_ar: '65 - الأبيض سيدي الشيخ', fee: 750 },
  { code: '66', name_fr: '66 - El Kantara', name_ar: '66 - القنطرة', fee: 600 },
  { code: '67', name_fr: '67 - Bir El Ater', name_ar: '67 - بئر العاتر', fee: 650 },
  { code: '68', name_fr: '68 - Ksar El Boukhari', name_ar: '68 - قصر البخاري', fee: 550 },
  { code: '69', name_fr: '69 - El Aricha', name_ar: '69 - العريشة', fee: 650 },
];

export const I18N = {
  fr: {
    langBtn: 'العربية',
    switchTitle: 'Changer la langue',
    screenSwitcherTitle: 'ShoeStyle · 6 Écrans :',
    screens: {
      home: '1. Accueil',
      category: '2. Talons',
      pdp: '3. Fiche Escarpins',
      cart: '4. Mon Panier',
      checkout: '5. Commande',
      confirmation: '6. Confirmée !',
    },
    nav: {
      home: 'Accueil',
      categories: 'Catégories',
      wishlist: 'Favoris',
      cart: 'Panier',
      account: 'Compte',
      all: 'Tout',
      seeAll: 'Voir tout',
    },
    hero: {
      tag: 'Nouvelle Collection',
      title: 'Élégance<br />à chaque pas',
      subtitle: 'Découvrez nos sneakers tendances, escarpins vernis rose poudré, sandales fines et bottines élégantes.',
      discover: 'Découvrir',
    },
    sections: {
      newArrivals: 'Nouveautés',
      bestSellers: 'Meilleures Ventes',
      bestSellersSub: 'Les modèles préférés de nos clientes en Algérie',
      specialOffers: 'Offres Spéciales',
      specialOffersSub: 'Jusqu’à -30% sur une sélection chic',
      reviews: 'Avis de nos Clientes',
      enjoy: 'Profiter',
    },
    filters: {
      filterBtn: 'Filtrer',
      price: 'Prix ▾',
      priceUnder4500: 'Moins de 4 500 DA',
      price4500Plus: '4 500 DA et plus',
      size: 'Taille ▾',
      sizePrefix: 'Pointure',
      color: 'Couleur ▾',
      allCategories: 'Tout voir',
      reset: 'Filtres réinitialisés',
    },
    pdp: {
      reviewsLabel: 'avis',
      colorLabel: 'Couleur :',
      sizeLabel: 'Taille :',
      addToCart: 'Ajouter au panier',
      shareCopied: 'Lien du produit copié !',
      back: 'Retour',
      share: 'Partager',
    },
    cart: {
      title: 'Mon Panier',
      emptyTitle: 'Votre panier est vide',
      emptySub: 'Explorez nos escarpins, baskets et sandales pour garnir votre panier.',
      exploreBtn: 'Découvrir la collection',
      sizePrefix: 'Taille',
      subtotal: 'Sous-total',
      shipping: 'Livraison',
      total: 'Total',
      checkoutBtn: 'Passer la commande',
      clearCart: 'Vider le panier',
      clearedToast: 'Panier vidé',
      addedToast: 'ajouté au panier',
    },
    checkout: {
      title: 'Commande',
      stepCart: 'Panier',
      stepDelivery: 'Livraison',
      stepPayment: 'Paiement',
      sectionTitle: 'Informations de livraison',
      fullName: 'Nom et prénom',
      fullNamePlaceholder: 'Votre nom complet',
      phone: 'Téléphone',
      phonePlaceholder: '06 12 34 56 78',
      wilaya: 'Wilaya',
      wilayaPlaceholder: 'Sélectionner une wilaya',
      address: 'Adresse',
      addressPlaceholder: 'Votre adresse complète (commune, rue)',
      continueBtn: 'Continuer',
      requiredAsterisk: '*',
    },
    confirmation: {
      title: 'Commande confirmée !',
      thankYou: 'Merci pour votre achat',
      refPrefix: 'Référence',
      amountDue: 'Montant à la livraison :',
      trackOrderBtn: 'Suivre ma commande',
      backHomeBtn: 'Retour à l’accueil',
      byeCatch: 'À bientôt sur ShoeStyle',
    },
    wishlist: {
      title: 'Mes Favoris',
      emptyTitle: 'Aucun favori pour le moment',
      emptySub: 'Touchez le cœur sur vos articles coup de cœur.',
      added: 'Ajouté aux favoris ♥',
      removed: 'Retiré des favoris',
    },
    account: {
      title: 'Mon Compte',
      headerTitle: 'Espace Cliente ShoeStyle',
      headerSub: 'Livraison rapide 69 Wilayas · Paiement à la livraison',
      ordersTitle: 'Suivi de mes commandes',
      noOrders: 'Aucune commande enregistrée. Validez votre panier pour suivre votre colis ici.',
      orderPrefix: 'Commande',
      orderStatus: 'En cours de préparation',
    },
    footer: {
      bye: 'À bientôt sur ShoeStyle ♥',
      legal: 'Livraison 69 Wilayas · Paiement à la livraison · Service Client Algérie',
    },
    search: {
      placeholder: 'Rechercher Escarpins, Sneakers, Sandales...',
    },
    currency: 'DA',
  },
  ar: {
    langBtn: 'Français',
    switchTitle: 'تغيير اللغة',
    screenSwitcherTitle: 'ShoeStyle · الشاشات الـ 6:',
    screens: {
      home: '1. الرئيسية',
      category: '2. الكعب',
      pdp: '3. تفاصيل الحذاء',
      cart: '4. سلتي',
      checkout: '5. الطلب',
      confirmation: '6. تم التأكيد!',
    },
    nav: {
      home: 'الرئيسية',
      categories: 'الأقسام',
      wishlist: 'المفضلة',
      cart: 'السلة',
      account: 'حسابي',
      all: 'الكل',
      seeAll: 'عرض الكل',
    },
    hero: {
      tag: 'تشكيلة جديدة وحصرية',
      title: 'أناقة<br />في كل خطوة',
      subtitle: 'اكتشفي تشكيلة السنيكرز العصرية، أحذية الكعب الوردي اللامع، الصنادل الرقيقة والبوتينات الفخمة.',
      discover: 'اكتشفي الآن',
    },
    sections: {
      newArrivals: 'وصل حديثاً',
      bestSellers: 'الأكثر طلباً',
      bestSellersSub: 'الموديلات الأكثر طلباً من زبوناتنا في الجزائر',
      specialOffers: 'عروض حصرية',
      specialOffersSub: 'خصم حتى 30% على تشكيلة راقية',
      reviews: 'آراء زبوناتنا',
      enjoy: 'تسوقي العروض',
    },
    filters: {
      filterBtn: 'تصفية',
      price: 'السعر ▾',
      priceUnder4500: 'أقل من 4,500 د.ج',
      price4500Plus: '4,500 د.ج فما فوق',
      size: 'المقاس ▾',
      sizePrefix: 'مقاس',
      color: 'اللون ▾',
      allCategories: 'عرض الكل',
      reset: 'تمت إعادة ضبط الفلاتر',
    },
    pdp: {
      reviewsLabel: 'تقييم',
      colorLabel: 'اللون :',
      sizeLabel: 'المقاس :',
      addToCart: 'إضافة إلى السلة',
      shareCopied: 'تم نسخ رابط الحذاء!',
      back: 'رجوع',
      share: 'مشاركة',
    },
    cart: {
      title: 'سلة المشتريات',
      emptyTitle: 'سلتك فارغة حالياً',
      emptySub: 'تصفحي تشكيلة الكعب والسنيكرز والصنادل لإضافتها لسلتك.',
      exploreBtn: 'استكشاف التشكيلة',
      sizePrefix: 'المقاس',
      subtotal: 'المجموع الفرعي',
      shipping: 'التوصيل',
      total: 'الإجمالي',
      checkoutBtn: 'إتمام الطلب',
      clearCart: 'إفراغ السلة',
      clearedToast: 'تم إفراغ السلة',
      addedToast: 'أضيف إلى السلة',
    },
    checkout: {
      title: 'إتمام الطلب',
      stepCart: 'السلة',
      stepDelivery: 'التوصيل',
      stepPayment: 'الدفع',
      sectionTitle: 'معلومات التوصيل',
      fullName: 'الاسم واللقب',
      fullNamePlaceholder: 'اسمك الكامل',
      phone: 'رقم الهاتف',
      phonePlaceholder: '06 12 34 56 78',
      wilaya: 'الولاية',
      wilayaPlaceholder: 'اختاري ولاية التوصيل',
      address: 'العنوان',
      addressPlaceholder: 'عنوان التوصيل بالتفصيل (البلدية، الحي، الشارع)',
      continueBtn: 'تأكيد الطلب',
      requiredAsterisk: '*',
    },
    confirmation: {
      title: 'تم تأكيد طلبك بنجاح !',
      thankYou: 'شكراً لثقتك بنا وتسوقك معنا',
      refPrefix: 'رقم الطلب',
      amountDue: 'المبلغ المستحق عند الاستلام :',
      trackOrderBtn: 'تتبع طلبي',
      backHomeBtn: 'العودة للرئيسية',
      byeCatch: 'نراكِ قريباً على ShoeStyle',
    },
    wishlist: {
      title: 'قائمة المفضلة',
      emptyTitle: 'لا توجد عناصر في المفضلة',
      emptySub: 'اضغطي على علامة القلب لحفظ أحذيتك المفضلة هنا.',
      added: 'أضيف إلى المفضلة ♥',
      removed: 'تمت الإزالة من المفضلة',
    },
    account: {
      title: 'حسابي',
      headerTitle: 'فضاء زبونة ShoeStyle',
      headerSub: 'توصيل سريع لـ 69 ولاية · الدفع نقداً عند الاستلام',
      ordersTitle: 'سجل ومتابعة الطلبات',
      noOrders: 'لا توجد طلبات سابقة. أكملي طلبك لتتبعه خطوة بخطوة هنا.',
      orderPrefix: 'طلب رقم',
      orderStatus: 'قيد التجهيز للشحن',
    },
    footer: {
      bye: 'نراكِ قريباً على ShoeStyle ♥',
      legal: 'توصيل 69 ولاية · الدفع عند الاستلام · خدمة الزبائن في الجزائر',
    },
    search: {
      placeholder: 'ابحثي عن كعب، سنيكرز، صنادل، بوتين...',
    },
    currency: 'د.ج',
  },
};

export function formatDA(amount, lang = 'fr') {
  if (lang === 'ar') {
    return `${new Intl.NumberFormat('fr-DZ').format(amount)} د.ج`;
  }
  return `${new Intl.NumberFormat('fr-DZ').format(amount)} DA`;
}
