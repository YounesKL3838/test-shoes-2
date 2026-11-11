/**
 * ShoeStyle — ملف التشغيل لصفحة الهبوط المستقلة (Standalone Landing Page Entry)
 * مخصصة بالكامل للعروض التسويقية والإعلانات المباشرة مع استمارة الدفع عند الاستلام (COD)
 * ومزامنة فورية مع لوحة التحكم (admin.html) وقاعدة بيانات Supabase
 */
import { COLOR_SWATCHES, IMAGES, WILAYAS, formatDA, getProductColorHex } from './data.js';
import { fetchAllFromSupabase, syncOrderToSupabase, subscribeRealtimeSync } from './supabase.js';

const CMS_STORAGE_KEY = 'shoestyle_full_cms_v1';
const LANDING_STORAGE_KEY = 'shoestyle_landing_pages_v1';
const SHIPPING_STORAGE_KEY = 'shoestyle_shipping_v1';
const ORDERS_STORAGE_KEY = 'shoestyle_orders_v2';

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

// العروض الافتراضية
const DEFAULT_LANDING_PAGES = [
  {
    id: 'lp-101',
    title: 'حذاء كعب عالي كلاسيك روز · Escarpins Classiques Rose',
    slug: '/offer/pink-heels-vip',
    originalPrice: 6990,
    discountPrice: 4490,
    imageUrl: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero, IMAGES.sandales],
    description:
      'حذاء الكعب الوردي الأنيق المصنوع من الجلد المرن المريح للقدم طوال اليوم، متوفر بجميع المقاسات مع ضمان استبدال مجاني.',
    offerEnabled: true,
    offerMinQty: 2,
    offerFreeShipping: true,
    offerText: 'اشترِ 2 واحصل على شحن مجاني',
    quickFormEnabled: true,
    createdAt: '2026-11-08',
  },
  {
    id: 'lp-102',
    title: 'سنيكرز أبيض ووردي مريح · Sneakers Mode Blush',
    slug: '/offer/urban-sneakers-pack',
    originalPrice: 5400,
    discountPrice: 3790,
    imageUrl: IMAGES.sneakers,
    gallery: [IMAGES.sneakers, IMAGES.hero],
    description:
      'نعل خفيف مضاد للانزلاق وتصميم عصري ناعم يناسب الجامعة والعمل والنزهات اليومية مع راحة استثنائية.',
    offerEnabled: true,
    offerMinQty: 2,
    offerFreeShipping: true,
    offerText: 'اشترِ 2 واحصل على شحن مجاني',
    quickFormEnabled: true,
    createdAt: '2026-11-09',
  },
];

// حالة صفحة الهبوط المستقلة
const state = {
  lang: localStorage.getItem('shoestyle_lang') || 'ar',
  cms: loadJSON(CMS_STORAGE_KEY, {
    storeName: 'ShoeStyle',
    logoUrl: IMAGES.talons,
    footerFarewell: 'À bientôt sur ShoeStyle ♥ ♥',
  }),
  landingPages: loadJSON(LANDING_STORAGE_KEY, DEFAULT_LANDING_PAGES),
  shippingRates: loadJSON(SHIPPING_STORAGE_KEY, { rates: WILAYAS }).rates || WILAYAS,
  activeLanding: null,
  galleryIndex: 0,
  selectedColor: 'Rose',
  selectedSize: 37,
  quantity: 1,
  isOfferApplied: false,
  selectedWilaya: '16',
  deliveryType: 'home', // 'home' | 'desk'
  isSubmitted: false,
  submittedOrder: null,
};

// تحديد صفحة الهبوط المطلوبة من الرابط (URL parameters)
function resolveActiveLanding() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('id') || params.get('lp') || params.get('slug');

  if (targetId) {
    const cleanTarget = targetId.trim();
    const matched = state.landingPages.find(
      (lp) =>
        lp.id === cleanTarget ||
        lp.slug === cleanTarget ||
        lp.slug === `/offer/${cleanTarget}` ||
        lp.slug?.replace('/offer/', '') === cleanTarget
    );
    if (matched) {
      state.activeLanding = matched;
      return;
    }
  }

  // إذا لم يُحدد معرف أو لم يتطابق، استخدم الصفحة الأولى
  state.activeLanding = state.landingPages[0] || DEFAULT_LANDING_PAGES[0];
}

// حساب الأسعار والشحن والعرض الاختياري
function getPricing() {
  const lp = state.activeLanding;
  const unitPrice = Number(lp.discountPrice || lp.originalPrice || 4490);
  const origUnitPrice = Number(lp.originalPrice || unitPrice);
  const subtotal = unitPrice * state.quantity;

  const offerMinQty = Number(lp.offerMinQty || 2);
  const offerEnabled = lp.offerEnabled !== false;
  const isOfferApplied = offerEnabled && state.quantity >= offerMinQty;

  const currentWilaya =
    state.shippingRates.find((w) => String(w.code).padStart(2, '0') === String(state.selectedWilaya).padStart(2, '0')) ||
    WILAYAS.find((w) => w.code === '16') ||
    WILAYAS[0];

  const homeFee = Number(currentWilaya?.homeFee ?? currentWilaya?.fee ?? 500);
  const deskFee = Number(currentWilaya?.deskFee ?? Math.max(250, homeFee - 150));
  const normalFee = state.deliveryType === 'desk' ? deskFee : homeFee;

  const isFreeShipping = isOfferApplied && lp.offerFreeShipping !== false;
  const shippingFee = isFreeShipping ? 0 : normalFee;
  const total = subtotal + shippingFee;

  return {
    unitPrice,
    origUnitPrice,
    subtotal,
    offerEnabled,
    offerMinQty,
    isOfferApplied,
    isFreeShipping,
    shippingFee,
    homeFee,
    deskFee,
    total,
    currentWilaya,
  };
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const msgEl = document.getElementById('toast-message');
  if (!toast || !msgEl) return;
  msgEl.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
  }, 3200);
}

// تصميم شعار الكعب الوردي
function renderLogoSVG(sizeClass = 'w-8 h-8') {
  const customLogo = state.cms?.logoUrl;
  if (customLogo && customLogo !== IMAGES.talons) {
    return `<img src="${customLogo}" alt="${state.cms?.storeName || 'ShoeStyle'}" referrerpolicy="no-referrer" class="${sizeClass} rounded-full object-cover shrink-0 border border-[#DE1B61]/20" />`;
  }
  return `
    <svg class="${sizeClass} shrink-0" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lpHeelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF5C93" />
          <stop offset="55%" stop-color="#DE1B61" />
          <stop offset="100%" stop-color="#A30E44" />
        </linearGradient>
      </defs>
      <path
        d="M52 10C48 10 44 16 39 26C33 37 25 44 15 46C9 47 6 49 6 51C6 53 10 54 18 54C29 54 37 46 44 35C46 32 48 33 48 37V53C48 54.1 48.9 55 50 55C51.1 55 52 54.1 52 53V24C54 19 55 10 52 10Z"
        fill="url(#lpHeelGrad)"
      />
    </svg>
  `;
}

// تصيير شاشة إتمام الطلب بنجاح
function renderConfirmationScreen() {
  const isAr = state.lang === 'ar';
  const order = state.submittedOrder;
  if (!order) return '';

  return `
    <div class="min-h-screen bg-[#FAF8F9] py-8 sm:py-14 px-3 sm:px-6 animate-screen-enter flex items-center justify-center">
      <div class="max-w-xl w-full bg-white rounded-3xl border border-[#EAE6E8] p-5 sm:p-8 shadow-sm text-center">
        <!-- أيقونة النجاح مع تأثير نبضي وردي ناعم -->
        <div class="w-20 h-20 rounded-full bg-[#ECFDF5] border-4 border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto text-3xl font-black mb-4 animate-pop-spring">
          ✓
        </div>

        <span class="inline-block px-3 py-1 rounded-full bg-[#FCE8EE] text-[#DE1B61] text-xs font-bold mb-2">
          ${isAr ? 'تم تسجيل طلبيتكِ بنجاح' : 'Commande enregistrée avec succès'}
        </span>

        <h1 class="text-2xl sm:text-3xl font-black text-[#18181B] mb-2">
          ${isAr ? 'شكراً لثقتكِ بـ ShoeStyle!' : 'Merci pour votre confiance !'}
        </h1>

        <p class="text-xs sm:text-sm text-[#52525B] leading-relaxed max-w-md mx-auto mb-6">
          ${
            isAr
              ? 'سيتصل بكِ فريق خدمة الزبائن هاتفياً خلال ساعات قليلة لتأكيد مقاسكِ وعنوان التوصيل قبل شحن الطرد.'
              : 'Notre équipe vous contactera par téléphone dans les prochaines heures pour confirmer votre pointure et adresse.'
          }
        </p>

        <!-- بطاقة تفاصيل الطلب -->
        <div class="p-4 sm:p-5 rounded-2xl bg-[#FAF8F9] border border-[#ECE7EA] text-start space-y-2.5 text-xs sm:text-sm tabular-nums mb-6">
          <div class="flex items-center justify-between pb-2 border-b border-[#ECE7EA]">
            <span class="text-[#71717A]">${isAr ? 'رقم الطلب:' : 'N° Commande :'}</span>
            <strong class="font-mono text-[#18181B] font-bold">${order.id}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#71717A]">${isAr ? 'المنتج:' : 'Produit :'}</span>
            <strong class="text-[#18181B] truncate max-w-[220px]">${order.itemsSummary}</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#71717A]">${isAr ? 'الزبونة:' : 'Cliente :'}</span>
            <strong class="text-[#18181B]">${order.fullName} (${order.phone})</strong>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[#71717A]">${isAr ? 'الولاية والعنوان:' : 'Wilaya & Adresse :'}</span>
            <strong class="text-[#18181B]">${order.wilaya} — ${order.address}</strong>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-[#ECE7EA]">
            <span class="font-bold text-[#18181B]">${isAr ? 'المبلغ الإجمالي عند الاستلام:' : 'Total à payer à la livraison :'}</span>
            <strong class="text-base sm:text-lg font-black text-[#DE1B61]">${formatDA(order.total, state.lang)}</strong>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="./index.html"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#DE1B61] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
          >
            ${isAr ? 'تصفح تشكيلة المتجر الرئيسية ←' : 'Visiter la boutique ShoeStyle →'}
          </a>
          <button
            type="button"
            data-lp-action="new-order"
            class="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] text-xs sm:text-sm font-semibold transition-all"
          >
            ${isAr ? 'طلب قطعة أخرى' : 'Passer une autre commande'}
          </button>
        </div>

        <div class="mt-8 pt-4 border-t border-[#F1EEF0] text-center">
          <p class="font-['Dancing_Script',cursive] text-lg font-bold text-[#DE1B61]">
            ${state.cms.footerFarewell || 'À bientôt sur ShoeStyle ♥ ♥'}
          </p>
        </div>
      </div>
    </div>
  `;
}

// تصيير الصفحة الرئيسية للهبوط
function renderLandingUI() {
  const isAr = state.lang === 'ar';
  const lp = state.activeLanding;
  if (!lp) return '';

  const pricing = getPricing();
  const gallery =
    Array.isArray(lp.gallery) && lp.gallery.filter(Boolean).length > 0
      ? lp.gallery.filter(Boolean)
      : [lp.imageUrl].filter(Boolean);

  const availableColors = Array.isArray(lp.colors) && lp.colors.length > 0 ? lp.colors : ['Rose', 'Beige', 'Noir'];
  const availableSizes = Array.isArray(lp.sizes) ? lp.sizes : [36, 37, 38, 39, 40, 41];
  const selectedColorSwatch = COLOR_SWATCHES[state.selectedColor];
  const selectedColorLabel = selectedColorSwatch
    ? isAr
      ? selectedColorSwatch.label_ar
      : selectedColorSwatch.label_fr
    : state.selectedColor;

  return `
    <div class="min-h-screen bg-[#FAF8F9] pb-16 animate-screen-enter">
      <div class="max-w-6xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
        
        <!-- الشريط العلوي المستقل لصفحة الهبوط -->
        <header class="flex items-center justify-between mb-4 sm:mb-6">
          <a
            href="./index.html"
            class="px-3.5 py-1.5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#27272A] text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>${isAr ? '→ زيارة المتجر' : '← Boutique'}</span>
          </a>

          <div class="flex items-center gap-2">
            ${renderLogoSVG('w-7 h-7 sm:w-8 sm:h-8')}
            <span class="font-['Dancing_Script',cursive] text-2xl sm:text-3xl font-bold text-[#DE1B61]">
              ${state.cms?.storeName || 'ShoeStyle'}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              data-lp-action="toggle-lang"
              class="px-2.5 py-1 rounded-full bg-[#FCE8EE] hover:bg-[#DE1B61] text-[#DE1B61] hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span>🌐</span>
              <span>${isAr ? 'Français' : 'العربية'}</span>
            </button>

            <button
              type="button"
              data-lp-action="share-offer"
              class="px-3 py-1.5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#52525B] text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>${isAr ? 'مشاركة' : 'Partager'}</span>
            </button>
          </div>
        </header>

        <!-- الشبكة الرئيسية: المعرض المتجاوب على اليسار + تفاصيل المنتج واستمارة الزبون على اليمين -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          <!-- العمود الأيسر: معرض الصور المتجاوب بنفس تصميم صفحة المنتج PDP -->
          <div class="lg:col-span-7 bg-white rounded-3xl border border-[#EAE6E8] p-3 sm:p-5 shadow-2xs space-y-4">
            <div
              id="lp-gallery-box"
              class="ss-insta-gallery-box rounded-2xl bg-[#F7F5F6] overflow-hidden relative"
            >
              <div
                class="ss-insta-track"
                style="transform: translate3d(-${activeIdx * 100}%, 0, 0);"
              >
                ${gallery
                  .map(
                    (imgSrc, idx) => `
                  <div class="ss-insta-slide">
                    <img
                      src="${imgSrc}"
                      alt="${lp.title} - ${idx + 1}"
                      referrerpolicy="no-referrer"
                      decoding="async"
                      fetchpriority="${idx === activeIdx ? 'high' : 'low'}"
                      loading="${idx === activeIdx ? 'eager' : 'lazy'}"
                      draggable="false"
                      class="w-full h-full object-cover"
                    />
                  </div>
                `
                  )
                  .join('')}
              </div>

              ${
                gallery.length > 1
                  ? `
                <button
                  type="button"
                  data-lp-action="gallery-step"
                  data-dir="-1"
                  class="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#18181B] shadow-md items-center justify-center text-lg font-bold cursor-pointer transition-transform hover:scale-105"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  data-lp-action="gallery-step"
                  data-dir="1"
                  class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#18181B] shadow-md items-center justify-center text-lg font-bold cursor-pointer transition-transform hover:scale-105"
                  aria-label="Next photo"
                >
                  ›
                </button>
                <span
                  dir="ltr"
                  class="absolute bottom-3 end-3 z-10 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xs text-white text-xs font-semibold tabular-nums pointer-events-none"
                >
                  ${activeIdx + 1}/${gallery.length}
                </span>
              `
                  : ''
              }
            </div>

            <!-- الصور المصغرة المجمعة في المنتصف بحجم صغير أنيق -->
            ${
              gallery.length > 1
                ? `<div class="mt-3 flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
                    ${gallery
                      .map(
                        (imgUrl, idx) => `
                        <button
                          type="button"
                          data-lp-action="select-thumb"
                          data-index="${idx}"
                          class="relative w-10 h-10 sm:w-11 sm:h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            activeIdx === idx
                              ? 'border-[#DE1B61] scale-105 shadow-xs'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }"
                        >
                          <img src="${imgUrl}" alt="Thumb ${idx + 1}" referrerpolicy="no-referrer" class="w-full h-full object-cover" />
                        </button>
                      `
                      )
                      .join('')}
                  </div>`
                : ''
            }

            <!-- شارات الثقة والضمان تحت المعرض -->
            <div class="mt-4 pt-4 border-t border-[#F1EEF0] grid grid-cols-3 gap-2 text-center text-[11px] sm:text-xs text-[#52525B]">
              <div class="p-2.5 rounded-xl bg-[#FAF8F9] border border-[#F1EEF0]">
                <span class="block font-bold text-[#18181B] mb-0.5">${isAr ? 'توصيل لكافة الولايات' : 'Livraison express'}</span>
                <span>${isAr ? 'سريع ومضمون' : 'À domicile & Stop-Desk'}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-[#FAF8F9] border border-[#F1EEF0]">
                <span class="block font-bold text-[#18181B] mb-0.5">${isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</span>
                <span>${isAr ? 'بعد معاينة المنتج' : 'Après inspection'}</span>
              </div>
              <div class="p-2.5 rounded-xl bg-[#FAF8F9] border border-[#F1EEF0]">
                <span class="block font-bold text-[#18181B] mb-0.5">${isAr ? 'تبديل القياس' : 'Échange garanti'}</span>
                <span>${isAr ? 'خلال 48 ساعة' : 'Sous 48 heures'}</span>
              </div>
            </div>
          </div>

          <!-- العمود الأيمن: عنوان المنتج وسعره واستمارة الزبون المباشرة -->
          <div class="lg:col-span-5 bg-white rounded-3xl border border-[#EAE6E8] p-4 sm:p-6 shadow-2xs space-y-4">
            
            <!-- معلومات المنتج والسعر العريض -->
            <div>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-xs font-bold tracking-wider uppercase text-[#DE1B61]">
                  ShoeStyle Special Offer
                </span>
                <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  ${isAr ? 'عرض حصري متوفر' : 'Offre exclusive'}
                </span>
              </div>

              <h1 class="text-xl sm:text-2xl font-black text-[#18181B] leading-snug">
                ${lp.title}
              </h1>

              <div class="mt-2.5 flex items-baseline gap-3 tabular-nums">
                <span class="text-2xl sm:text-3xl font-black text-[#DE1B61]">
                  ${formatDA(pricing.unitPrice, state.lang)}
                </span>
                ${
                  pricing.origUnitPrice > pricing.unitPrice
                    ? `<span class="text-sm sm:text-base text-[#8E8E93] line-through">
                        ${formatDA(pricing.origUnitPrice, state.lang)}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-[#DE1B61] text-white text-xs font-bold">
                        -${Math.round((1 - pricing.unitPrice / pricing.origUnitPrice) * 100)}%
                      </span>`
                    : ''
                }
              </div>

              ${
                lp.description
                  ? `<p class="mt-2.5 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                      ${lp.description}
                    </p>`
                  : ''
              }
            </div>

            <hr class="border-[#F1EEF0]" />

            <!-- استمارة الزبون والطلب المباشر -->
            <form id="standalone-lp-form" class="space-y-4">
              
              <!-- 1. المقاس واللون -->
              <div class="space-y-3">
                ${
                  availableSizes.length > 0
                    ? `
                      <div>
                        <label class="block text-xs font-bold text-[#3F3F46] mb-1.5">
                          ${isAr ? 'المقاس:' : 'Pointure :'} <strong class="text-[#DE1B61] font-extrabold">${state.selectedSize || ''}</strong>
                        </label>
                        <div class="grid grid-cols-6 gap-1.5 tabular-nums">
                          ${availableSizes
                            .map((sz) => {
                              const active = String(state.selectedSize) === String(sz);
                              return `
                                <button
                                  type="button"
                                  data-lp-action="select-size"
                                  data-size="${sz}"
                                  class="py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                                    active
                                      ? 'border-2 border-[#DE1B61] bg-[#FDF2F6] text-[#DE1B61]'
                                      : 'border-[#E4E4E7] bg-white text-[#27272A] hover:border-[#D4D4D8]'
                                  }"
                                >
                                  ${sz}
                                </button>
                              `;
                            })
                            .join('')}
                        </div>
                      </div>
                    `
                    : ''
                }

                <div class="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <span class="text-xs font-bold text-[#3F3F46]">
                    ${isAr ? 'اللون:' : 'Couleur :'} <strong class="text-[#18181B]">${selectedColorLabel}</strong>
                  </span>
                  <div class="flex items-center gap-2">
                    ${availableColors
                      .map((cName) => {
                        const hex = getProductColorHex(lp, cName);
                        const active = state.selectedColor === cName;
                        return `
                          <button
                            type="button"
                            data-lp-action="select-color"
                            data-color="${cName}"
                            class="ss-color-swatch cursor-pointer ${active ? 'active' : 'border-black/15'}"
                            aria-label="${cName}"
                          >
                            <span class="block w-full h-full rounded-full border border-black/10" style="background-color:${hex};"></span>
                          </button>
                        `;
                      })
                      .join('')}
                  </div>
                </div>
              </div>

              <!-- 2. الكمية + العرض الاختياري (مثلاً: تاخذ 2 شحن مجاني) -->
              <div class="pt-3 border-t border-[#F1EEF0] space-y-2.5">
                <div class="flex items-center justify-between gap-3">
                  <label class="text-xs sm:text-sm font-bold text-[#27272A]">
                    ${isAr ? 'الكمية:' : 'Quantité :'}
                  </label>

                  <div class="inline-flex items-center rounded-xl border border-[#E4E4E7] bg-[#FAF8F9] p-1 tabular-nums">
                    <button
                      type="button"
                      data-lp-action="qty-step"
                      data-delta="-1"
                      class="w-9 h-8 rounded-lg bg-white border border-[#E4E4E7] text-[#18181B] font-bold text-base flex items-center justify-center hover:bg-[#F4F4F5] active:scale-95 transition-all cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span class="w-11 text-center text-sm font-extrabold text-[#18181B]">
                      ${state.quantity}
                    </span>
                    <button
                      type="button"
                      data-lp-action="qty-step"
                      data-delta="1"
                      class="w-9 h-8 rounded-lg bg-white border border-[#E4E4E7] text-[#18181B] font-bold text-base flex items-center justify-center hover:bg-[#F4F4F5] active:scale-95 transition-all cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                ${
                  pricing.offerEnabled
                    ? `
                  <button
                    type="button"
                    data-lp-action="toggle-offer"
                    class="w-full p-3 rounded-xl border text-start flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      pricing.isOfferApplied
                        ? 'border-2 border-[#10B981] bg-[#ECFDF5]/60 text-[#065F46]'
                        : 'border-[#E4E4E7] bg-[#FAF8F9] hover:border-[#DE1B61]/40 text-[#27272A]'
                    }"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span
                        class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
                          pricing.isOfferApplied
                            ? 'bg-[#10B981] text-white'
                            : 'border border-[#A1A1AA] bg-white text-transparent'
                        }"
                      >
                        ✓
                      </span>
                      <div class="min-w-0">
                        <span class="text-xs sm:text-[13px] font-bold block truncate">
                          ${isAr ? 'عرض اختياري:' : 'Offre optionnelle :'} ${lp.offerText || 'اشترِ 2 واحصل على شحن مجاني'}
                        </span>
                      </div>
                    </div>

                    <span
                      class="px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
                        pricing.isOfferApplied
                          ? 'bg-[#10B981] text-white'
                          : 'bg-white border border-[#E4E4E7] text-[#DE1B61]'
                      }"
                    >
                      ${
                        pricing.isOfferApplied
                          ? isAr
                            ? 'شحن مجاني مفعّل'
                            : 'Livraison 0 DA'
                          : isAr
                          ? `اختيار (${pricing.offerMinQty})`
                          : `Choisir (${pricing.offerMinQty})`
                      }
                    </span>
                  </button>
                `
                    : ''
                }
              </div>

              <!-- 3. معلومات الزبونة فقط -->
              <div class="pt-3 border-t border-[#F1EEF0] space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                    ${isAr ? 'الاسم واللقب' : 'Nom et Prénom'} <span class="text-[#DE1B61]">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    autocomplete="name"
                    placeholder="${isAr ? 'أدخلي اسمكِ الكامل' : 'Votre nom complet'}"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-medium text-[#18181B] focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                    ${isAr ? 'رقم الهاتف' : 'Numéro de téléphone'} <span class="text-[#DE1B61]">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    inputmode="tel"
                    required
                    autocomplete="tel"
                    dir="ltr"
                    placeholder="0550 00 00 00"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-semibold text-[#18181B] tabular-nums focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                      ${isAr ? 'الولاية' : 'Wilaya'} <span class="text-[#DE1B61]">*</span>
                    </label>
                    <select
                      id="standalone-lp-wilaya-select"
                      name="wilayaCode"
                      required
                      class="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-semibold text-[#18181B] focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
                    >
                      ${state.shippingRates
                        .map((w) => {
                          const wName = isAr ? w.name || w.name_ar : w.name_fr || w.name;
                          return `<option value="${w.code}" ${
                            w.code === state.selectedWilaya ? 'selected' : ''
                          }>${w.code} - ${wName}</option>`;
                        })
                        .join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                      ${isAr ? 'البلدية / العنوان' : 'Commune / Adresse'} <span class="text-[#DE1B61]">*</span>
                    </label>
                    <input
                      name="address"
                      type="text"
                      required
                      placeholder="${
                        state.deliveryType === 'desk'
                          ? isAr
                            ? 'اسم البلدية أو مكتب التوصيل'
                            : 'Commune ou bureau Stop-Desk'
                          : isAr
                          ? 'اسم البلدية أو الحي'
                          : 'Commune ou quartier'
                      }"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-medium text-[#18181B] focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <!-- خيار التوصيل: إلى المنزل أم المكتب -->
                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                    ${isAr ? 'مكان التوصيل' : 'Mode de livraison'}
                  </label>
                  <div class="grid grid-cols-2 gap-2 tabular-nums">
                    <button
                      type="button"
                      data-lp-action="select-delivery"
                      data-mode="home"
                      class="p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
                        state.deliveryType === 'home'
                          ? 'border-2 border-[#DE1B61] bg-[#FDF2F6]/60 text-[#18181B]'
                          : 'border-[#E4E4E7] bg-[#FAF8F9] text-[#52525B]'
                      }"
                    >
                      <span>${isAr ? 'التوصيل للمنزل' : 'À Domicile'}</span>
                      <strong class="text-[#DE1B61]">
                        ${pricing.isFreeShipping ? (isAr ? 'مجاني' : '0 DA') : formatDA(pricing.homeFee, state.lang)}
                      </strong>
                    </button>

                    <button
                      type="button"
                      data-lp-action="select-delivery"
                      data-mode="desk"
                      class="p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
                        state.deliveryType === 'desk'
                          ? 'border-2 border-[#DE1B61] bg-[#FDF2F6]/60 text-[#18181B]'
                          : 'border-[#E4E4E7] bg-[#FAF8F9] text-[#52525B]'
                      }"
                    >
                      <span>${isAr ? 'مكتب التوصيل' : 'Stop-Desk'}</span>
                      <strong class="text-[#DE1B61]">
                        ${pricing.isFreeShipping ? (isAr ? 'مجاني' : '0 DA') : formatDA(pricing.deskFee, state.lang)}
                      </strong>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 4. ملخص المبلغ الفرعي والإجمالي قبل التأكيد -->
              <div class="p-3.5 rounded-xl bg-[#FAF8F9] border border-[#EAE6E8] space-y-1.5 tabular-nums">
                <div class="flex items-center justify-between text-xs text-[#52525B]">
                  <span>${isAr ? 'المبلغ الفرعي:' : 'Sous-total :'}</span>
                  <strong class="text-[#18181B]">${formatDA(pricing.subtotal, state.lang)}</strong>
                </div>
                <div class="flex items-center justify-between text-xs text-[#52525B]">
                  <span>
                    ${
                      state.deliveryType === 'desk'
                        ? isAr
                          ? 'سعر التوصيل (للمكتب):'
                          : 'Livraison (Stop-Desk) :'
                        : isAr
                        ? 'سعر التوصيل (للمنزل):'
                        : 'Livraison (Domicile) :'
                    }
                  </span>
                  <strong class="text-[#18181B]">
                    ${
                      pricing.isFreeShipping
                        ? `<span class="text-[#059669] font-bold">${isAr ? 'مجاني (0 د.ج)' : 'Gratuite (0 DA)'}</span>`
                        : formatDA(pricing.shippingFee, state.lang)
                    }
                  </strong>
                </div>
                <div class="pt-2 border-t border-[#E4E4E7] flex items-center justify-between">
                  <span class="text-xs sm:text-sm font-bold text-[#18181B]">
                    ${isAr ? 'المبلغ الإجمالي:' : 'Total à payer :'}
                  </span>
                  <strong class="text-base sm:text-lg font-extrabold text-[#DE1B61]">
                    ${formatDA(pricing.total, state.lang)}
                  </strong>
                </div>
              </div>

              <!-- 5. زر تأكيد الطلب الفوري -->
              <button
                type="submit"
                class="w-full py-4 px-6 rounded-2xl bg-[#DE1B61] hover:bg-[#C2185B] text-white text-base font-bold flex items-center justify-center shadow-lg shadow-[#DE1B61]/25 hover:shadow-[#DE1B61]/35 active:scale-99 transition-all cursor-pointer"
              >
                <span>${
                  isAr
                    ? `تأكيد الطلب — ${formatDA(pricing.total, 'ar')}`
                    : `Confirmer la commande — ${formatDA(pricing.total, 'fr')}`
                }</span>
              </button>

              <p class="text-[11px] text-center text-[#71717A] pt-1">
                ${isAr ? '🔒 الدفع عند الاستلام بعد معاينة طلبيتك' : '🔒 Paiement à la livraison après vérification'}
              </p>
            </form>
          </div>
        </div>

        <!-- فوتر هادئ وبسيط لصفحة الهبوط -->
        <footer class="mt-12 pt-6 border-t border-[#F1EEF0] text-center">
          <p class="font-['Dancing_Script',cursive] text-lg font-bold text-[#DE1B61]">
            ${state.cms?.footerFarewell || 'À bientôt sur ShoeStyle ♥ ♥'}
          </p>
        </footer>
      </div>
    </div>
  `;
}

function render() {
  const root = document.getElementById('landing-app-root');
  if (!root) return;

  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

  if (state.isSubmitted) {
    root.innerHTML = renderConfirmationScreen();
  } else {
    root.innerHTML = renderLandingUI();
  }
}

function setupEventListeners() {
  const root = document.getElementById('landing-app-root');
  if (!root) return;

  root.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('[data-lp-action]') : null;
    if (!btn) return;

    const action = btn.getAttribute('data-lp-action');

    switch (action) {
      case 'toggle-lang': {
        state.lang = state.lang === 'ar' ? 'fr' : 'ar';
        localStorage.setItem('shoestyle_lang', state.lang);
        render();
        break;
      }

      case 'share-offer': {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href).catch(() => {});
        }
        showToast(state.lang === 'ar' ? 'تم نسخ رابط العرض بنجاح' : 'Lien de l’offre copié');
        break;
      }

      case 'select-thumb': {
        const idx = Number(btn.getAttribute('data-index') || 0);
        state.galleryIndex = idx;
        render();
        break;
      }

      case 'gallery-step': {
        const dir = Number(btn.getAttribute('data-dir') || 1);
        const gallery = state.activeLanding?.gallery || [state.activeLanding?.imageUrl];
        state.galleryIndex = (state.galleryIndex + dir + gallery.length) % gallery.length;
        render();
        break;
      }

      case 'select-size': {
        state.selectedSize = Number(btn.getAttribute('data-size') || 37);
        render();
        break;
      }

      case 'select-color': {
        state.selectedColor = btn.getAttribute('data-color') || 'Rose';
        render();
        break;
      }

      case 'qty-step': {
        const delta = Number(btn.getAttribute('data-delta') || 0);
        state.quantity = Math.max(1, state.quantity + delta);
        render();
        break;
      }

      case 'toggle-offer': {
        const minQty = Number(state.activeLanding?.offerMinQty || 2);
        if (state.quantity < minQty) {
          state.quantity = minQty;
        } else {
          state.quantity = 1;
        }
        render();
        break;
      }

      case 'select-delivery': {
        state.deliveryType = btn.getAttribute('data-mode') || 'home';
        render();
        break;
      }

      case 'new-order': {
        state.isSubmitted = false;
        state.submittedOrder = null;
        state.quantity = 1;
        render();
        break;
      }
    }
  });

  root.addEventListener('change', (e) => {
    if (e.target && e.target.id === 'standalone-lp-wilaya-select') {
      state.selectedWilaya = e.target.value;
      render();
    }
  });

  root.addEventListener('submit', async (e) => {
    const form = e.target instanceof HTMLFormElement ? e.target.closest('#standalone-lp-form') : null;
    if (!form) return;

    e.preventDefault();
    const fd = new FormData(form);

    const fullName = String(fd.get('fullName') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const address = String(fd.get('address') || '').trim();
    const wilayaCode = String(fd.get('wilayaCode') || state.selectedWilaya).trim();

    if (!fullName || !phone || !address) {
      showToast(state.lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs');
      return;
    }

    const pricing = getPricing();
    const currentWilaya = pricing.currentWilaya;
    const wilayaLabel =
      state.lang === 'ar'
        ? `${currentWilaya.code} - ${currentWilaya.name || currentWilaya.name_ar}`
        : `${currentWilaya.code} - ${currentWilaya.name_fr || currentWilaya.name}`;

    const orderId = `CMD-${Date.now().toString().slice(-6)}`;
    const itemsSummary = `${state.activeLanding.title} (${state.selectedColor} - ${state.selectedSize}) × ${state.quantity}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString().slice(0, 10),
      fullName,
      phone,
      wilaya: wilayaLabel,
      address,
      itemsSummary,
      items: [
        {
          id: state.activeLanding.id,
          name: state.activeLanding.title,
          color: state.selectedColor,
          size: state.selectedSize,
          quantity: state.quantity,
          price: pricing.unitPrice,
          image: state.activeLanding.imageUrl,
        },
      ],
      total: pricing.total,
      status: 'new',
    };

    // حفظ في localStorage
    const savedOrders = loadJSON(ORDERS_STORAGE_KEY, []);
    savedOrders.unshift(newOrder);
    saveJSON(ORDERS_STORAGE_KEY, savedOrders);

    // مزامنة فورية مع Supabase
    syncOrderToSupabase(newOrder);

    state.isSubmitted = true;
    state.submittedOrder = newOrder;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(state.lang === 'ar' ? 'تم تسجيل طلبكِ بنجاح' : 'Commande enregistrée avec succès');
  });
}

// مزامنة البيانات عن بعد من Supabase
async function initData() {
  resolveActiveLanding();
  render();
  setupEventListeners();

  try {
    const remote = await fetchAllFromSupabase();
    if (remote) {
      if (Array.isArray(remote.landingPages) && remote.landingPages.length > 0) {
        state.landingPages = remote.landingPages;
        saveJSON(LANDING_STORAGE_KEY, remote.landingPages);
      }
      if (remote.cms) {
        state.cms = { ...state.cms, ...remote.cms };
        saveJSON(CMS_STORAGE_KEY, state.cms);
      }
      if (Array.isArray(remote.shippingRates) && remote.shippingRates.length > 0) {
        state.shippingRates = remote.shippingRates;
      }
      resolveActiveLanding();
      render();
    }
  } catch {
    // fallback to local data
  }

  // التزامن الحي مع أي تغيير في قاعدة البيانات
  subscribeRealtimeSync((data) => {
    if (data?.table === 'landing_pages' || data?.table === 'cms_settings') {
      fetchAllFromSupabase().then((refreshed) => {
        if (refreshed?.landingPages) state.landingPages = refreshed.landingPages;
        if (refreshed?.cms) state.cms = { ...state.cms, ...refreshed.cms };
        resolveActiveLanding();
        render();
      });
    }
  });
}

initData();
