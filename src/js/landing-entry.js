/**
 * ShoeStyle — ملف التشغيل لصفحة الهبوط المستقلة (Standalone Landing Page Entry)
 * تصميم احترافي سريع التصفح وعالي التحويل مخصص للإعلانات مع الدفع عند الاستلام (COD)
 * ومزامنة فورية مع لوحة التحكم وقاعدة بيانات Supabase
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
    // ignore storage quota error
  }
}

const DEFAULT_LANDING_PAGES = [
  {
    id: 'lp-101',
    title: 'موديل كلاسيكي أنيق · Édition Classique',
    slug: '/offer/classic-vip',
    originalPrice: 6900,
    discountPrice: 4490,
    imageUrl: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero, IMAGES.sandales],
    description:
      'تصميم عصري مريح مصنوع من خامات عالية الجودة ومبطن لراحة القدم طوال اليوم، مع خدمة الدفع عند الاستلام.',
    badgeText: 'عرض حصري لفترة محدودة',
    highlights: [
      'خامة مريحة وجودة عالية مختارة بعناية',
      'توصيل سريع لباب المنزل أو المكتب (69 ولاية)',
      'الدفع عند الاستلام بعد المعاينة التامة',
    ],
    colors: ['Rose', 'Beige', 'Noir'],
    colorHexes: { Rose: '#F38BA8', Beige: '#D2B48C', Noir: '#1A1A1E' },
    sizes: [36, 37, 38, 39, 40, 41],
    offerEnabled: true,
    offerMinQty: 2,
    offerFreeShipping: true,
    offerText: 'اشترِ 2 واحصل على شحن مجاني',
    whatsappOrderEnabled: true,
    quickFormEnabled: true,
    createdAt: '2026-11-08',
  },
];

const state = {
  lang: localStorage.getItem('shoestyle_lang') || 'ar',
  cms: loadJSON(CMS_STORAGE_KEY, {
    storeName: 'ShoeStyle',
    logoUrl: IMAGES.talons,
    footerFarewell: 'À bientôt sur ShoeStyle ♥ ♥',
    whatsappNumber: '',
    phone: '',
  }),
  landingPages: loadJSON(LANDING_STORAGE_KEY, DEFAULT_LANDING_PAGES),
  shippingRates: loadJSON(SHIPPING_STORAGE_KEY, { rates: WILAYAS }).rates || WILAYAS,
  activeLanding: null,
  galleryIndex: 0,
  selectedColor: 'Rose',
  selectedSize: 37,
  quantity: 1,
  selectedWilaya: '16',
  deliveryType: 'home', // 'home' | 'desk'
  isSubmitting: false,
  isSubmitted: false,
  submittedOrder: null,
  pixelsInitialized: false,
};

let formObserver = null;

function initAdPixelsIfNeeded() {
  if (state.pixelsInitialized || typeof window === 'undefined') return;
  const cms = state.cms || {};
  const fbId = String(cms.fbPixelId || '').trim();
  const ttId = String(cms.tiktokPixelId || '').trim();
  const snapId = String(cms.snapPixelId || '').trim();
  const gaId = String(cms.googleTagId || '').trim();

  if (!fbId && !ttId && !snapId && !gaId) return;
  state.pixelsInitialized = true;

  if (fbId && !window.fbq) {
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', fbId);
    window.fbq('track', 'PageView');
  }

  if (ttId && !window.ttq) {
    (function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      const ttq = (w[t] = w[t] || []);
      ttq.methods = ['page', 'track', 'identify'];
      ttq.setAndDefer = function (tObj, e) {
        tObj[e] = function () {
          tObj.push([e].concat(Array.prototype.slice.call(arguments, 0)));
        };
      };
      for (let i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.load = function (e) {
        const s = d.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + e + '&lib=' + t;
        const n = d.getElementsByTagName('script')[0];
        n.parentNode.insertBefore(s, n);
      };
      ttq.load(ttId);
      ttq.page();
    })(window, document, 'ttq');
  }

  if (snapId && !window.snaptr) {
    (function (e, t, n) {
      if (e.snaptr) return;
      const a = (e.snaptr = function () {
        a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
      });
      a.queue = [];
      const s = 'script';
      const r = t.createElement(s);
      r.async = !0;
      r.src = n;
      const u = t.getElementsByTagName(s)[0];
      u.parentNode.insertBefore(r, u);
    })(window, document, 'https://sc-static.net/scevent.min.js');
    window.snaptr('init', snapId);
    window.snaptr('track', 'PAGE_VIEW');
  }

  if (gaId && !window.gtag) {
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', gaId);
  }
}

function trackPixelPurchase(order, lp) {
  try {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Purchase', {
        value: order.total,
        currency: 'DZD',
        content_name: lp?.title || '',
        content_ids: [lp?.id || order.id],
      });
    }
    if (window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track('CompletePayment', {
        value: order.total,
        currency: 'DZD',
        content_id: lp?.id || order.id,
      });
    }
    if (typeof window.snaptr === 'function') {
      window.snaptr('track', 'PURCHASE', {
        price: order.total,
        currency: 'DZD',
        transaction_id: order.id,
      });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        value: order.total,
        currency: 'DZD',
      });
    }
  } catch {
    // ignore pixel errors
  }
}

function resolveActiveLanding() {
  const params = new URLSearchParams(window.location.search);
  const targetId = params.get('id') || params.get('lp') || params.get('slug');
  const pool =
    Array.isArray(state.landingPages) && state.landingPages.length > 0
      ? state.landingPages
      : DEFAULT_LANDING_PAGES;

  let chosen = pool[0];
  if (targetId) {
    const cleanTarget = targetId.trim();
    const matched = pool.find(
      (lp) =>
        lp.id === cleanTarget ||
        lp.slug === cleanTarget ||
        lp.slug === `/offer/${cleanTarget}` ||
        lp.slug?.replace('/offer/', '') === cleanTarget
    );
    if (matched) chosen = matched;
  }

  state.activeLanding = chosen;

  const availColors =
    Array.isArray(chosen?.colors) && chosen.colors.length > 0
      ? chosen.colors
      : ['Rose', 'Beige', 'Noir'];
  if (!availColors.includes(state.selectedColor)) {
    state.selectedColor = availColors[0];
  }

  const availSizes = Array.isArray(chosen?.sizes) ? chosen.sizes : [36, 37, 38, 39, 40, 41];
  if (availSizes.length === 0) {
    state.selectedSize = '';
  } else if (!availSizes.map(String).includes(String(state.selectedSize))) {
    state.selectedSize = availSizes[0];
  }

  if (chosen?.title) {
    document.title = `${chosen.title} — ${state.cms?.storeName || 'ShoeStyle'}`;
  }
}

function getPricing() {
  const lp = state.activeLanding || DEFAULT_LANDING_PAGES[0];
  const unitPrice = Number(lp.discountPrice || lp.originalPrice || 4490);
  const origUnitPrice = Number(lp.originalPrice || unitPrice);
  const subtotal = unitPrice * state.quantity;
  const savingsPerUnit = Math.max(0, origUnitPrice - unitPrice);

  const offerMinQty = Math.max(2, Number(lp.offerMinQty || 2));
  const offerEnabled = lp.offerEnabled !== false;
  const isOfferApplied = offerEnabled && state.quantity >= offerMinQty;

  const currentWilaya =
    state.shippingRates.find(
      (w) => String(w.code).padStart(2, '0') === String(state.selectedWilaya).padStart(2, '0')
    ) ||
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
    savingsPerUnit,
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

function renderLogoSVG(sizeClass = 'w-7 h-7') {
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

function renderConfirmationScreen() {
  const isAr = state.lang === 'ar';
  const order = state.submittedOrder;
  if (!order) return '';

  return `
    <div class="min-h-screen bg-[#FAF8F9] py-8 sm:py-14 px-3.5 sm:px-6 animate-screen-enter flex items-center justify-center">
      <div class="max-w-xl w-full bg-white rounded-3xl border border-[#EAE6E8] p-5 sm:p-8 shadow-sm text-center">
        <div class="w-20 h-20 rounded-full bg-[#ECFDF5] border-4 border-[#A7F3D0] text-[#059669] flex items-center justify-center mx-auto text-3xl font-black mb-4 animate-pop-spring">
          ✓
        </div>

        <p class="text-xs font-bold text-[#DE1B61] mb-1">
          ${isAr ? 'تم تسجيل طلبيتكِ بنجاح' : 'Commande enregistrée avec succès'}
        </p>

        <h1 class="text-2xl sm:text-3xl font-black text-[#18181B] mb-2">
          ${isAr ? `شكراً لثقتكِ بـ ${state.cms?.storeName || 'ShoeStyle'}!` : 'Merci pour votre confiance !'}
        </h1>

        <p class="text-xs sm:text-sm text-[#52525B] leading-relaxed max-w-md mx-auto mb-6">
          ${
            isAr
              ? 'سيتصل بكِ فريقنا هاتفياً قريباً لتأكيد طلبيتكِ وعنوان التوصيل قبل الشحن.'
              : 'Notre équipe vous contactera par téléphone dans les plus brefs délais pour confirmer votre livraison.'
          }
        </p>

        <div class="p-4 sm:p-5 rounded-2xl bg-[#FAF8F9] border border-[#ECE7EA] text-start space-y-2.5 text-xs sm:text-sm tabular-nums mb-6">
          <div class="flex items-center justify-between pb-2 border-b border-[#ECE7EA]">
            <span class="text-[#71717A]">${isAr ? 'رقم الطلب:' : 'N° Commande :'}</span>
            <strong class="font-mono text-[#18181B] font-bold">${order.id}</strong>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[#71717A] shrink-0">${isAr ? 'الطلب:' : 'Produit :'}</span>
            <strong class="text-[#18181B] truncate">${order.itemsSummary}</strong>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[#71717A] shrink-0">${isAr ? 'الاسم والهاتف:' : 'Client(e) :'}</span>
            <strong class="text-[#18181B]">${order.fullName} · ${order.phone}</strong>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[#71717A] shrink-0">${isAr ? 'العنوان:' : 'Adresse :'}</span>
            <strong class="text-[#18181B] text-end">${order.wilaya} — ${order.address}</strong>
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-[#ECE7EA]">
            <span class="font-bold text-[#18181B]">${isAr ? 'المبلغ الإجمالي عند الاستلام:' : 'Total à payer à la livraison :'}</span>
            <strong class="text-base sm:text-lg font-black text-[#DE1B61]">${formatDA(order.total, state.lang)}</strong>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="./index.html"
            class="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#DE1B61] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold transition-all shadow-sm whitespace-nowrap"
          >
            ${isAr ? 'زيارة المتجر الرئيسي' : 'Visiter la boutique'}
          </a>
          <button
            type="button"
            data-lp-action="new-order"
            class="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-[#E4E4E7] text-[#3F3F46] hover:bg-[#F4F4F5] text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap"
          >
            ${isAr ? 'طلب قطعة أخرى' : 'Passer une autre commande'}
          </button>
        </div>

        <div class="mt-8 pt-4 border-t border-[#F1EEF0] text-center">
          <p class="font-['Dancing_Script',cursive] text-lg font-bold text-[#DE1B61]">
            ${state.cms?.footerFarewell || 'À bientôt sur ShoeStyle ♥ ♥'}
          </p>
        </div>
      </div>
    </div>
  `;
}

function getDefaultReviews(isAr) {
  if (isAr) {
    return [
      {
        author: 'أمينة ب.',
        city: 'الجزائر العاصمة',
        comment: 'وصلتني الطلبية في 24 ساعة، الخامة ممتازة والمقاس مضبوط جداً مقارنة بالصور.',
      },
      {
        author: 'سارة م.',
        city: 'وهران',
        comment: 'أفضل ما عجبني أني عاينت القطعة قبل ما نخلص للموزع. جودة مريحة وأنيقة فعلاً.',
      },
      {
        author: 'ياسمين ك.',
        city: 'قسنطينة',
        comment: 'تغليف راقي وتعامل سريع في الهاتف لتأكيد الولاية، أنصح بها وبشدة.',
      },
    ];
  }
  return [
    {
      author: 'Amina B.',
      city: 'Alger',
      comment: 'Reçue en 24h, finition impeccable et encore plus belle en vrai que sur les photos.',
    },
    {
      author: 'Sara M.',
      city: 'Oran',
      comment: 'Très pratique de pouvoir vérifier la commande avant de payer à la livraison.',
    },
    {
      author: 'Yasmine K.',
      city: 'Constantine',
      comment: 'Service rapide au téléphone et emballage soigné. Je recommande vivement !',
    },
  ];
}

function buildWhatsAppOrderHref(pricing) {
  const rawWa = String(state.cms?.whatsappNumber || '').replace(/[^\d]/g, '');
  if (!rawWa || state.activeLanding?.whatsappOrderEnabled === false) return '';

  const lp = state.activeLanding;
  const isAr = state.lang === 'ar';
  const sizePart = state.selectedSize ? (isAr ? `، المقاس: ${state.selectedSize}` : `, Pointure: ${state.selectedSize}`) : '';
  const wName = isAr
    ? `${pricing.currentWilaya.code} - ${pricing.currentWilaya.name || pricing.currentWilaya.name_ar}`
    : `${pricing.currentWilaya.code} - ${pricing.currentWilaya.name_fr || pricing.currentWilaya.name}`;

  const msg = isAr
    ? `مرحباً، أريد طلب العرض:\nالمنتج: ${lp.title}\nاللون: ${state.selectedColor}${sizePart}\nالكمية: ${state.quantity}\nالولاية: ${wName}\nالإجمالي التقريبي: ${pricing.total} د.ج`
    : `Bonjour, je souhaite commander :\nProduit : ${lp.title}\nCouleur : ${state.selectedColor}${sizePart}\nQuantité : ${state.quantity}\nWilaya : ${wName}\nTotal estimé : ${pricing.total} DA`;

  return `https://wa.me/${rawWa}?text=${encodeURIComponent(msg)}`;
}

function renderLandingUI() {
  const isAr = state.lang === 'ar';
  const lp = state.activeLanding;
  if (!lp) return '';

  const pricing = getPricing();
  const gallery =
    Array.isArray(lp.gallery) && lp.gallery.filter(Boolean).length > 0
      ? lp.gallery.filter(Boolean)
      : [lp.imageUrl || IMAGES.talons].filter(Boolean);
  const activeIdx = Math.max(0, Math.min(state.galleryIndex, gallery.length - 1));

  const availableColors =
    Array.isArray(lp.colors) && lp.colors.length > 0 ? lp.colors : ['Rose', 'Beige', 'Noir'];
  const availableSizes = Array.isArray(lp.sizes) ? lp.sizes : [];

  const selectedColorSwatch = COLOR_SWATCHES[state.selectedColor];
  const selectedColorLabel = selectedColorSwatch
    ? isAr
      ? selectedColorSwatch.label_ar
      : selectedColorSwatch.label_fr
    : state.selectedColor;

  const discountPct =
    pricing.origUnitPrice > pricing.unitPrice && pricing.origUnitPrice > 0
      ? Math.round((1 - pricing.unitPrice / pricing.origUnitPrice) * 100)
      : 0;

  const highlights =
    Array.isArray(lp.highlights) && lp.highlights.filter(Boolean).length > 0
      ? lp.highlights.filter(Boolean)
      : isAr
      ? [
          'خامة مريحة وجودة عالية مختارة بعناية',
          'توصيل سريع لباب المنزل أو المكتب (69 ولاية)',
          'الدفع عند الاستلام بعد المعاينة التامة',
        ]
      : [
          'Finition soignée et confort optimal toute la journée',
          'Livraison rapide à domicile ou Stop-Desk (69 wilayas)',
          'Paiement à la livraison après vérification du colis',
        ];

  const reviews =
    Array.isArray(lp.reviews) && lp.reviews.length > 0 ? lp.reviews : getDefaultReviews(isAr);

  const waHref = buildWhatsAppOrderHref(pricing);
  const storeName = state.cms?.storeName || 'ShoeStyle';

  return `
    <div class="min-h-screen bg-[#FAF8F9] pb-20 lg:pb-12 animate-screen-enter">
      <!-- Top Bar (Clean 3-Zone Contract) -->
      <header class="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#EAE6E8]">
        <div class="max-w-6xl mx-auto px-3.5 sm:px-6 h-14 flex items-center justify-between gap-4">
          <a href="./index.html" class="flex items-center gap-2 shrink-0 whitespace-nowrap">
            ${renderLogoSVG('w-7 h-7')}
            <span class="font-['Dancing_Script',cursive] text-2xl font-bold text-[#18181B]">
              ${storeName}
            </span>
          </a>

          <nav class="hidden md:flex items-center gap-6 text-xs font-semibold text-[#52525B]">
            <a href="./index.html" class="hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0">
              ${isAr ? 'المتجر الرئيسي' : 'Boutique'}
            </a>
            <a href="#lp-guarantees" class="hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0">
              ${isAr ? 'الضمانات والتوصيل' : 'Livraison & Garanties'}
            </a>
            <a href="#lp-reviews" class="hover:text-[#18181B] transition-colors whitespace-nowrap shrink-0">
              ${isAr ? 'آراء الزبونات' : 'Avis Clients'}
            </a>
          </nav>

          <div class="flex items-center gap-2 shrink-0">
            <button
              type="button"
              data-lp-action="toggle-lang"
              class="px-3 py-1.5 rounded-lg border border-[#E4E4E7] hover:border-[#DE1B61]/40 bg-[#FAF8F9] text-[#18181B] text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              ${isAr ? 'FR' : 'AR'}
            </button>
            <button
              type="button"
              data-lp-action="scroll-to-form"
              class="hidden sm:inline-flex px-4 py-1.5 rounded-lg bg-[#DE1B61] hover:bg-[#C2185B] text-white text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              ${isAr ? 'اطلبي الآن' : 'Commander'}
            </button>
          </div>
        </div>
      </header>

      <main class="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-8 space-y-10 sm:space-y-14">
        <!-- Hero Conversion Split -->
        <section class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          <!-- Gallery Column -->
          <div class="lg:col-span-6 lg:sticky lg:top-20 space-y-3">
            <div class="bg-white rounded-3xl border border-[#EAE6E8] p-2.5 sm:p-4">
              <div
                id="lp-gallery-box"
                class="ss-insta-gallery-box rounded-2xl bg-[#F5F3F4] overflow-hidden relative aspect-[4/5]"
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
                  discountPct > 0
                    ? `<span dir="ltr" class="absolute top-3 start-3 z-10 px-2.5 py-1 rounded-lg bg-[#DE1B61] text-white text-xs font-extrabold tabular-nums">
                        -${discountPct}%
                      </span>`
                    : ''
                }

                ${
                  gallery.length > 1
                    ? `
                  <button
                    type="button"
                    data-lp-action="gallery-step"
                    data-dir="-1"
                    class="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#18181B] shadow-md items-center justify-center text-lg font-bold cursor-pointer transition-transform hover:scale-105"
                    aria-label="Previous photo"
                  >‹</button>
                  <button
                    type="button"
                    data-lp-action="gallery-step"
                    data-dir="1"
                    class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-[#18181B] shadow-md items-center justify-center text-lg font-bold cursor-pointer transition-transform hover:scale-105"
                    aria-label="Next photo"
                  >›</button>
                  <span
                    dir="ltr"
                    class="absolute bottom-3 end-3 z-10 px-2.5 py-1 rounded-lg bg-black/60 text-white text-xs font-semibold tabular-nums pointer-events-none"
                  >
                    ${activeIdx + 1}/${gallery.length}
                  </span>
                `
                    : ''
                }
              </div>

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
                            class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                              activeIdx === idx
                                ? 'border-[#DE1B61] scale-105'
                                : 'border-transparent opacity-65 hover:opacity-100'
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
            </div>

            <!-- Quiet unboxed guarantees metadata row -->
            <div class="flex items-center justify-center flex-wrap gap-x-3 gap-y-1 text-xs font-medium text-[#52525B] px-2">
              <span>${isAr ? 'توصيل سريع 69 ولاية' : 'Livraison 69 Wilayas'}</span>
              <span aria-hidden="true">·</span>
              <span>${isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</span>
              <span aria-hidden="true">·</span>
              <span>${isAr ? 'استبدال مضمون' : 'Échange garanti'}</span>
            </div>
          </div>

          <!-- Conversion & Form Column -->
          <div class="lg:col-span-6 bg-white rounded-3xl border border-[#EAE6E8] p-4 sm:p-6 space-y-5">
            <div>
              <div class="flex items-center gap-2 text-xs font-bold text-[#DE1B61] mb-1.5">
                <span>${storeName}</span>
                <span aria-hidden="true">·</span>
                <span>${lp.badgeText || (isAr ? 'عرض حصري لفترة محدودة' : 'Offre Spéciale')}</span>
              </div>

              <h1 class="text-xl sm:text-3xl font-black text-[#18181B] leading-snug" style="text-wrap:balance;">
                ${lp.title}
              </h1>

              <div class="mt-3 flex items-baseline gap-3 flex-wrap tabular-nums">
                <span class="text-3xl font-black text-[#DE1B61]">
                  ${formatDA(pricing.unitPrice, state.lang)}
                </span>
                ${
                  pricing.origUnitPrice > pricing.unitPrice
                    ? `<span class="text-base text-[#8E8E93] line-through">
                        ${formatDA(pricing.origUnitPrice, state.lang)}
                      </span>
                      <span class="text-xs font-bold text-[#059669]">
                        · ${isAr ? `توفير ${formatDA(pricing.savingsPerUnit, 'ar')}` : `Économie ${formatDA(pricing.savingsPerUnit, 'fr')}`}
                      </span>`
                    : ''
                }
              </div>

              ${
                lp.description
                  ? `<p class="mt-3 text-sm text-[#52525B] leading-relaxed">
                      ${lp.description}
                    </p>`
                  : ''
              }

              <!-- Key Product Highlights -->
              <ul class="mt-4 space-y-2 border-t border-[#F1EEF0] pt-4">
                ${highlights
                  .map(
                    (item) => `
                    <li class="flex items-start gap-2 text-xs sm:text-sm font-medium text-[#27272A]">
                      <span class="text-[#059669] font-black shrink-0 mt-0.5">✓</span>
                      <span>${item}</span>
                    </li>
                  `
                  )
                  .join('')}
              </ul>
            </div>

            <hr class="border-[#F1EEF0]" />

            <!-- Direct COD Form -->
            <form id="standalone-lp-form" class="space-y-4">
              
              <!-- Variant Selection -->
              <div class="space-y-3.5">
                ${
                  availableColors.length > 0
                    ? `<div class="flex items-center justify-between flex-wrap gap-2">
                        <span class="text-xs sm:text-sm font-bold text-[#3F3F46]">
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
                      </div>`
                    : ''
                }

                ${
                  availableSizes.length > 0
                    ? `<div>
                        <label class="block text-xs sm:text-sm font-bold text-[#3F3F46] mb-2">
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
                                  class="min-h-[44px] rounded-xl text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
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
                      </div>`
                    : ''
                }
              </div>

              <!-- Quantity & Bundle Offer -->
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
                      class="w-10 h-9 rounded-lg bg-white border border-[#E4E4E7] text-[#18181B] font-bold text-base flex items-center justify-center hover:bg-[#F4F4F5] active:scale-95 transition-transform cursor-pointer"
                      aria-label="Decrease quantity"
                    >−</button>
                    <span class="w-12 text-center text-sm font-extrabold text-[#18181B]">
                      ${state.quantity}
                    </span>
                    <button
                      type="button"
                      data-lp-action="qty-step"
                      data-delta="1"
                      class="w-10 h-9 rounded-lg bg-white border border-[#E4E4E7] text-[#18181B] font-bold text-base flex items-center justify-center hover:bg-[#F4F4F5] active:scale-95 transition-transform cursor-pointer"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>

                ${
                  pricing.offerEnabled
                    ? `<button
                        type="button"
                        data-lp-action="toggle-offer"
                        class="w-full min-h-[48px] p-3 rounded-xl border text-start flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                          pricing.isOfferApplied
                            ? 'border-2 border-[#10B981] bg-[#ECFDF5]/60 text-[#065F46]'
                            : 'border-[#E4E4E7] bg-[#FAF8F9] hover:border-[#DE1B61]/40 text-[#27272A]'
                        }"
                      >
                        <div class="flex items-center gap-2.5 min-w-0">
                          <span
                            class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                              pricing.isOfferApplied
                                ? 'bg-[#10B981] text-white'
                                : 'border border-[#A1A1AA] bg-white text-transparent'
                            }"
                          >✓</span>
                          <span class="text-xs sm:text-[13px] font-bold truncate">
                            ${lp.offerText || 'اشترِ 2 واحصل على شحن مجاني'}
                          </span>
                        </div>
                        <span class="text-[11px] font-bold shrink-0 text-[#DE1B61]">
                          ${
                            pricing.isOfferApplied
                              ? isAr
                                ? 'مفعّل'
                                : 'Activé'
                              : isAr
                              ? `اختيار (${pricing.offerMinQty})`
                              : `Choisir (${pricing.offerMinQty})`
                          }
                        </span>
                      </button>`
                    : ''
                }
              </div>

              <!-- Customer Delivery Fields -->
              <div class="pt-3 border-t border-[#F1EEF0] space-y-3">
                <h2 class="text-sm font-extrabold text-[#18181B]">
                  ${isAr ? 'معلومات التوصيل السريع' : 'Informations de livraison'}
                </h2>

                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                    ${isAr ? 'الاسم الكامل' : 'Nom complet'} <span class="text-[#DE1B61]">*</span>
                  </label>
                  <input
                    id="lp-fullname-input"
                    name="fullName"
                    type="text"
                    required
                    autocomplete="name"
                    placeholder="${isAr ? 'أدخلي اسمكِ الكامل' : 'Votre nom complet'}"
                    class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-base sm:text-sm font-medium text-[#18181B] focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
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
                    class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-base sm:text-sm font-semibold text-[#18181B] tabular-nums focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
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
                      class="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-base sm:text-sm font-semibold text-[#18181B] focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
                    >
                      ${state.shippingRates
                        .map((w) => {
                          const wName = isAr ? w.name || w.name_ar : w.name_fr || w.name;
                          return `<option value="${w.code}" ${
                            String(w.code).padStart(2, '0') === String(state.selectedWilaya).padStart(2, '0')
                              ? 'selected'
                              : ''
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
                            ? 'اسم البلدية أو المكتب'
                            : 'Commune ou bureau'
                          : isAr
                          ? 'البلدية والحي'
                          : 'Commune et quartier'
                      }"
                      class="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-base sm:text-sm font-medium text-[#18181B] focus:border-[#DE1B61] focus:bg-white focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1.5">
                    ${isAr ? 'طريقة التوصيل' : 'Mode de livraison'}
                  </label>
                  <div class="grid grid-cols-2 gap-2 tabular-nums">
                    <button
                      type="button"
                      data-lp-action="select-delivery"
                      data-mode="home"
                      class="min-h-[44px] p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-colors cursor-pointer ${
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
                      class="min-h-[44px] p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-colors cursor-pointer ${
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

              <!-- Price Breakdown -->
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
                  <strong class="text-lg font-extrabold text-[#DE1B61]">
                    ${formatDA(pricing.total, state.lang)}
                  </strong>
                </div>
              </div>

              <!-- Primary Submit CTA -->
              <button
                id="lp-submit-btn"
                type="submit"
                ${state.isSubmitting ? 'disabled' : ''}
                class="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-[#DE1B61] hover:bg-[#C2185B] disabled:opacity-60 text-white text-base font-bold flex items-center justify-center shadow-lg shadow-[#DE1B61]/20 transition-all cursor-pointer tabular-nums"
              >
                <span>${
                  isAr
                    ? `تأكيد الطلب الآن — ${formatDA(pricing.total, 'ar')}`
                    : `Confirmer la commande — ${formatDA(pricing.total, 'fr')}`
                }</span>
              </button>

              ${
                waHref
                  ? `<a
                      href="${waHref}"
                      target="_blank"
                      rel="noopener"
                      class="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-[#10B981]/35 bg-[#ECFDF5]/60 hover:bg-[#ECFDF5] text-[#065F46] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>${isAr ? 'أو اطلبي مباشرة عبر واتساب' : 'Ou commander via WhatsApp'}</span>
                    </a>`
                  : ''
              }

              <p class="text-[11px] text-center text-[#71717A] pt-1">
                ${isAr ? 'الدفع عند الاستلام بعد معاينة طلبيتكِ بالكامل' : 'Paiement à la livraison après inspection du colis'}
              </p>
            </form>
          </div>
        </section>

        <!-- 3-Step Ordering Mechanism -->
        <section id="lp-guarantees" class="bg-white rounded-3xl border border-[#EAE6E8] p-5 sm:p-8">
          <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B] mb-5">
            ${isAr ? 'كيف يصلكِ طلبكِ بكل أمان؟' : 'Comment recevoir votre commande en toute confiance'}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <span class="text-xs font-bold text-[#DE1B61] tabular-nums">01</span>
              <h3 class="text-sm font-bold text-[#18181B] mt-1">
                ${isAr ? 'أرسلي طلبكِ في ثوانٍ' : 'Commandez en 30 secondes'}
              </h3>
              <p class="text-xs text-[#52525B] mt-1 leading-relaxed">
                ${isAr ? 'املئي الاسم والرقم والولاية دون أي بطاقة بنكية أو دفع مسبق.' : 'Remplissez simplement votre nom, téléphone et wilaya sans paiement anticipé.'}
              </p>
            </div>
            <div>
              <span class="text-xs font-bold text-[#DE1B61] tabular-nums">02</span>
              <h3 class="text-sm font-bold text-[#18181B] mt-1">
                ${isAr ? 'تأكيد هاتفي سريع' : 'Confirmation téléphonique'}
              </h3>
              <p class="text-xs text-[#52525B] mt-1 leading-relaxed">
                ${isAr ? 'يتواصل معكِ فريقنا لتأكيد العنوان وتجهيز الطرد للشحن الفوري.' : 'Notre équipe vous appelle pour valider votre adresse avant l’expédition.'}
              </p>
            </div>
            <div>
              <span class="text-xs font-bold text-[#DE1B61] tabular-nums">03</span>
              <h3 class="text-sm font-bold text-[#18181B] mt-1">
                ${isAr ? 'معاينة ثم دفع عند الاستلام' : 'Vérification à la livraison'}
              </h3>
              <p class="text-xs text-[#52525B] mt-1 leading-relaxed">
                ${isAr ? 'تأكدي من اللون والجودة والمقاس أولاً ثم ادفعي للموزع بكل راحة.' : 'Vérifiez la qualité et la pointure avant de régler votre commande au livreur.'}
              </p>
            </div>
          </div>
        </section>

        <!-- Customer Reviews -->
        <section id="lp-reviews" class="space-y-4">
          <div class="flex items-baseline justify-between flex-wrap gap-2">
            <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B]">
              ${isAr ? 'تجارب وآراء زبوناتنا' : 'Avis de nos clientes'}
            </h2>
            <span class="text-xs font-semibold text-[#52525B] tabular-nums">
              ★★★★★ 4.9/5
            </span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${reviews
              .map(
                (rev) => `
                <article class="bg-white rounded-2xl border border-[#EAE6E8] p-4 sm:p-5 space-y-2.5">
                  <div class="flex items-center justify-between text-xs">
                    <strong class="text-[#18181B] font-bold">${rev.author}</strong>
                    <span class="text-[#71717A]">${rev.city}</span>
                  </div>
                  <p class="text-xs sm:text-sm text-[#3F3F46] leading-relaxed">
                    "${rev.comment}"
                  </p>
                </article>
              `
              )
              .join('')}
          </div>
        </section>

        <!-- Quiet Footer -->
        <footer class="pt-6 border-t border-[#E6E0E3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#71717A]">
          <div class="flex items-center gap-2">
            <span class="font-['Dancing_Script',cursive] text-lg font-bold text-[#DE1B61]">
              ${storeName}
            </span>
            <span aria-hidden="true">·</span>
            <span>${state.cms?.phone || (isAr ? 'خدمة الزبائن 7/7' : 'Service client 7j/7')}</span>
          </div>
          <div class="flex items-center gap-4">
            <button type="button" data-lp-action="share-offer" class="hover:text-[#18181B] transition-colors cursor-pointer">
              ${isAr ? 'نسخ رابط العرض' : 'Copier le lien'}
            </button>
            <a href="./index.html" class="hover:text-[#18181B] transition-colors">
              ${isAr ? 'تصفح المتجر الكامل' : 'Voir la boutique'}
            </a>
          </div>
        </footer>
      </main>

      <!-- Compact Mobile Sticky CTA Bar (<= 60px high, hides when submit CTA is in view) -->
      <div
        id="lp-sticky-bar"
        class="fixed bottom-0 inset-x-0 lg:hidden z-40 bg-white/95 backdrop-blur-sm border-t border-[#EAE6E8] px-3.5 py-2.5 flex items-center justify-between gap-3 transition-transform duration-200"
      >
        <div class="min-w-0 tabular-nums">
          <span class="block text-[11px] text-[#71717A] truncate">${lp.title}</span>
          <strong class="text-base font-black text-[#DE1B61]">${formatDA(pricing.unitPrice, state.lang)}</strong>
        </div>
        <button
          type="button"
          data-lp-action="scroll-to-form"
          class="px-5 py-2.5 rounded-xl bg-[#DE1B61] hover:bg-[#C2185B] text-white text-xs sm:text-sm font-bold shrink-0 whitespace-nowrap cursor-pointer"
        >
          ${isAr ? 'اطلبي الآن ↓' : 'Commander ↓'}
        </button>
      </div>
    </div>
  `;
}

function setupStickyVisibilityObserver() {
  if (formObserver) {
    formObserver.disconnect();
    formObserver = null;
  }
  const stickyBar = document.getElementById('lp-sticky-bar');
  const submitBtn = document.getElementById('lp-submit-btn');
  if (!stickyBar || !submitBtn || typeof IntersectionObserver === 'undefined') return;

  formObserver = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (entry.isIntersecting) {
        stickyBar.classList.add('translate-y-full');
      } else {
        stickyBar.classList.remove('translate-y-full');
      }
    },
    { threshold: 0.15 }
  );
  formObserver.observe(submitBtn);
}

function render() {
  const root = document.getElementById('landing-app-root');
  if (!root) return;

  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';

  if (state.isSubmitted) {
    if (formObserver) formObserver.disconnect();
    root.innerHTML = renderConfirmationScreen();
  } else {
    root.innerHTML = renderLandingUI();
    setupStickyVisibilityObserver();
  }
}

function setupEventListeners() {
  const root = document.getElementById('landing-app-root');
  if (!root) return;

  // Touch swipe on landing gallery
  let swipeStartX = 0;
  let swipeStartY = 0;
  let isSwipingGallery = false;

  root.addEventListener(
    'touchstart',
    (e) => {
      const box = e.target instanceof Element ? e.target.closest('#lp-gallery-box') : null;
      if (!box || !e.touches || e.touches.length !== 1) return;
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
      isSwipingGallery = true;
    },
    { passive: true }
  );

  root.addEventListener(
    'touchend',
    (e) => {
      if (!isSwipingGallery || !e.changedTouches || e.changedTouches.length === 0) return;
      isSwipingGallery = false;
      const dx = e.changedTouches[0].clientX - swipeStartX;
      const dy = e.changedTouches[0].clientY - swipeStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        const gallery =
          Array.isArray(state.activeLanding?.gallery) && state.activeLanding.gallery.length > 0
            ? state.activeLanding.gallery
            : [state.activeLanding?.imageUrl].filter(Boolean);
        if (gallery.length > 1) {
          const step = dx < 0 ? 1 : -1;
          state.galleryIndex = (state.galleryIndex + step + gallery.length) % gallery.length;
          render();
        }
      }
    },
    { passive: true }
  );

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
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(window.location.href).catch(() => {});
        }
        showToast(state.lang === 'ar' ? 'تم نسخ رابط العرض بنجاح' : 'Lien de l’offre copié');
        break;
      }

      case 'scroll-to-form': {
        const formEl = document.getElementById('standalone-lp-form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            const nameInput = document.getElementById('lp-fullname-input');
            if (nameInput instanceof HTMLInputElement) nameInput.focus({ preventScroll: true });
          }, 350);
        }
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
        const gallery =
          Array.isArray(state.activeLanding?.gallery) && state.activeLanding.gallery.length > 0
            ? state.activeLanding.gallery
            : [state.activeLanding?.imageUrl].filter(Boolean);
        if (gallery.length > 1) {
          state.galleryIndex = (state.galleryIndex + dir + gallery.length) % gallery.length;
          render();
        }
        break;
      }

      case 'select-size': {
        const raw = btn.getAttribute('data-size') || '';
        const asNum = Number(raw);
        state.selectedSize = !Number.isNaN(asNum) && raw !== '' ? asNum : raw;
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
        const minQty = Math.max(2, Number(state.activeLanding?.offerMinQty || 2));
        state.quantity = state.quantity < minQty ? minQty : 1;
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
    if (state.isSubmitting) return;

    const fd = new FormData(form);
    const fullName = String(fd.get('fullName') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    const address = String(fd.get('address') || '').trim();
    const cleanPhoneDigits = phone.replace(/\D/g, '');

    if (!fullName || !phone || !address) {
      showToast(state.lang === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs');
      return;
    }

    if (cleanPhoneDigits.length < 9) {
      showToast(
        state.lang === 'ar'
          ? 'يرجى إدخال رقم هاتف صحيح (على الأقل 9 أرقام)'
          : 'Veuillez saisir un numéro de téléphone valide'
      );
      return;
    }

    state.isSubmitting = true;
    const pricing = getPricing();
    const currentWilaya = pricing.currentWilaya;
    const wilayaLabel =
      state.lang === 'ar'
        ? `${currentWilaya.code} - ${currentWilaya.name || currentWilaya.name_ar}`
        : `${currentWilaya.code} - ${currentWilaya.name_fr || currentWilaya.name}`;

    const orderId = `CMD-${Date.now().toString().slice(-6)}`;
    const sizeText = state.selectedSize ? ` - ${state.selectedSize}` : '';
    const itemsSummary = `${state.activeLanding.title} (${state.selectedColor}${sizeText}) × ${state.quantity}`;

    const newOrder = {
      id: orderId,
      date: new Date().toISOString().slice(0, 10),
      fullName,
      phone,
      wilaya: wilayaLabel,
      address: `${address} (${state.deliveryType === 'desk' ? 'Stop-Desk' : 'À Domicile'})`,
      itemsSummary,
      items: [
        {
          id: state.activeLanding.id,
          name: state.activeLanding.title,
          color: state.selectedColor,
          size: state.selectedSize || '',
          quantity: state.quantity,
          price: pricing.unitPrice,
          image: state.activeLanding.imageUrl,
        },
      ],
      total: pricing.total,
      status: 'new',
    };

    const savedOrders = loadJSON(ORDERS_STORAGE_KEY, []);
    savedOrders.unshift(newOrder);
    saveJSON(ORDERS_STORAGE_KEY, savedOrders);

    syncOrderToSupabase(newOrder);
    trackPixelPurchase(newOrder, state.activeLanding);

    state.isSubmitting = false;
    state.isSubmitted = true;
    state.submittedOrder = newOrder;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(state.lang === 'ar' ? 'تم تسجيل طلبكِ بنجاح' : 'Commande enregistrée avec succès');
  });
}

async function initData() {
  resolveActiveLanding();
  initAdPixelsIfNeeded();
  render();
  setupEventListeners();

  try {
    const remote = await fetchAllFromSupabase({ includeProducts: false, includeOrders: false });
    if (remote) {
      let changed = false;
      if (Array.isArray(remote.landingPages) && remote.landingPages.length > 0) {
        if (JSON.stringify(remote.landingPages) !== JSON.stringify(state.landingPages)) {
          state.landingPages = remote.landingPages;
          saveJSON(LANDING_STORAGE_KEY, remote.landingPages);
          changed = true;
        }
      }
      if (remote.cms) {
        const nextCms = { ...state.cms, ...remote.cms };
        if (JSON.stringify(nextCms) !== JSON.stringify(state.cms)) {
          state.cms = nextCms;
          saveJSON(CMS_STORAGE_KEY, state.cms);
          changed = true;
        }
      }
      if (Array.isArray(remote.shippingRates) && remote.shippingRates.length > 0) {
        state.shippingRates = remote.shippingRates;
        changed = true;
      }
      if (changed) {
        resolveActiveLanding();
        initAdPixelsIfNeeded();
        render();
      }
    }
  } catch {
    // fallback to local data
  }

  subscribeRealtimeSync((data) => {
    if (data?.table === 'landing_pages' || data?.table === 'cms_settings') {
      fetchAllFromSupabase({ includeProducts: false, includeOrders: false }).then((refreshed) => {
        if (refreshed?.landingPages) state.landingPages = refreshed.landingPages;
        if (refreshed?.cms) state.cms = { ...state.cms, ...refreshed.cms };
        resolveActiveLanding();
        initAdPixelsIfNeeded();
        render();
      });
    }
  });
}

initData();
