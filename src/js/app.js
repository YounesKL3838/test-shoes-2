/**
 * ShoeStyle — Step in Style
 * Contrôleur Vanilla JS avec support bilingue complet (Français / العربية)
 * et système d'animations professionnelles
 */
import {
  CATEGORIES,
  COLOR_SWATCHES,
  I18N,
  IMAGES,
  PRODUCTS,
  WILAYAS,
  formatDA,
} from './data.js';
import { store } from './state.js';
import {
  adminState,
  initAdminFromSupabase,
} from './admin.js';
import { subscribeRealtimeSync, syncOrderToSupabase } from './supabase.js';

let toastTimeout = null;
let heroSlideIndex = 0;
let heroIntervalId = null;
let scrollObserver = null;

const HERO_SLIDES = [
  {
    kicker_fr: 'Nouvelle Collection',
    kicker_ar: 'تشكيلة جديدة وحصرية',
    titleHtml_fr: 'Élégance<br />à chaque pas',
    titleHtml_ar: 'أناقة<br />في كل خطوة',
    subtitle_fr:
      'Découvrez nos sneakers tendances, escarpins vernis rose poudré, sandales fines et bottines élégantes.',
    subtitle_ar:
      'اكتشفي تشكيلة السنيكرز العصرية، أحذية الكعب الوردي اللامع، الصنادل الرقيقة والبوتينات الفخمة.',
    ctaLabel_fr: 'Découvrir',
    ctaLabel_ar: 'اكتشفي الآن',
    targetCategory: 'Talons',
    image: IMAGES.hero,
  },
  {
    kicker_fr: 'Édition Soirée & Satin',
    kicker_ar: 'تشكيلة السهرات والساتان',
    titleHtml_fr: 'Féminité<br />&amp; Raffinement',
    titleHtml_ar: 'أنوثة<br />وفخامة راقية',
    subtitle_fr:
      'Des talons galbés et confortables pensés pour sublimer chacune de vos occasions spéciales.',
    subtitle_ar:
      'أحذية كعب مريحة ومصممة بعناية لتتألقي في جميع مناسباتك وسهراتك الخاصة.',
    ctaLabel_fr: 'Voir les Talons',
    ctaLabel_ar: 'تشكيلة الكعب',
    targetCategory: 'Talons',
    image: IMAGES.talons,
  },
  {
    kicker_fr: 'Allure Citadine',
    kicker_ar: 'أناقة يومية عصرية',
    titleHtml_fr: 'Douceur<br />au Quotidien',
    titleHtml_ar: 'خفة ونعومة<br />لكل يوم',
    subtitle_fr:
      'Sneakers en cuir souple et daim rose poudré : l’alliance parfaite du style et de la légèreté.',
    subtitle_ar:
      'سنيكرز من جلد مرن ومخمل وردي ناعم: المزيج المثالي بين الراحة والجاذبية.',
    ctaLabel_fr: 'Voir les Sneakers',
    ctaLabel_ar: 'تشكيلة السنيكرز',
    targetCategory: 'Sneakers',
    image: IMAGES.sneakers,
  },
  {
    kicker_fr: 'Finesse & Légèreté',
    kicker_ar: 'رقة وانسيابية',
    titleHtml_fr: 'Brides Fines<br />&amp; Cuir Doux',
    titleHtml_ar: 'شرائط ناعمة<br />ولمسة ناعمة',
    subtitle_fr:
      'Sandales à brides croisées et ballerines Mary Jane livrées en 24h–48h sur les 69 wilayas.',
    subtitle_ar:
      'صنادل بشرائط متداخلة وباليرين ماري جين مع توصيل سريع خلال 24 إلى 48 ساعة لجميع الـ 69 ولاية.',
    ctaLabel_fr: 'Explorer',
    ctaLabel_ar: 'استكشاف التشكيلة',
    targetCategory: 'Sandales',
    image: IMAGES.sandales,
  },
];

function getT() {
  return I18N[store.lang] || I18N.fr;
}

function getArrowNext() {
  return store.lang === 'ar' ? '←' : '→';
}

function getBackIconSvg() {
  if (store.lang === 'ar') {
    return `<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />`;
  }
  return `<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />`;
}

export function showToast(message) {
  const toastEl = document.getElementById('toast-notification');
  const toastText = document.getElementById('toast-message');
  if (!toastEl || !toastText) return;

  toastText.textContent = message;
  toastEl.classList.remove('opacity-0', 'translate-y-3', 'pointer-events-none');
  toastEl.classList.add('opacity-100', 'translate-y-0');

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add('opacity-0', 'translate-y-3', 'pointer-events-none');
    toastEl.classList.remove('opacity-100', 'translate-y-0');
  }, 2400);
}

/**
 * تهيئة وتشغيل بيكسل الإعلانات (Facebook Pixel, TikTok Pixel, Snapchat Pixel, Google Tag)
 */
export function initAdPixels() {
  const cms = adminState?.cms || {};
  if (typeof window === 'undefined') return;

  if (cms.fbPixelId && !window._ssFbPixelInitialized) {
    window._ssFbPixelInitialized = cms.fbPixelId;
    window.fbq =
      window.fbq ||
      function (...args) {
        (window.fbq.q = window.fbq.q || []).push(args);
      };
    window.fbq('init', cms.fbPixelId);
    window.fbq('track', 'PageView');
  }

  if (cms.tiktokPixelId && !window._ssTiktokPixelInitialized) {
    window._ssTiktokPixelInitialized = cms.tiktokPixelId;
    window.ttq = window.ttq || {
      track: (...args) => {
        (window._ttqEvents = window._ttqEvents || []).push(args);
      },
      page: () => {},
    };
    window.ttq.page();
  }

  if (cms.snapPixelId && !window._ssSnapPixelInitialized) {
    window._ssSnapPixelInitialized = cms.snapPixelId;
    window.snaptr =
      window.snaptr ||
      function (...args) {
        (window.snaptr.q = window.snaptr.q || []).push(args);
      };
    window.snaptr('init', cms.snapPixelId);
    window.snaptr('track', 'PAGE_VIEW');
  }
}

export function trackAdPixelEvent(eventName, data = {}) {
  const cms = adminState?.cms || {};
  if (typeof window === 'undefined') return;

  try {
    if (cms.fbPixelId && typeof window.fbq === 'function') {
      window.fbq('track', eventName, data);
    }
    if (cms.tiktokPixelId && window.ttq && typeof window.ttq.track === 'function') {
      window.ttq.track(eventName, data);
    }
    if (cms.snapPixelId && typeof window.snaptr === 'function') {
      const snapMap = {
        PageView: 'PAGE_VIEW',
        AddToCart: 'ADD_CART',
        InitiateCheckout: 'START_CHECKOUT',
        Purchase: 'PURCHASE',
      };
      window.snaptr('track', snapMap[eventName] || eventName, data);
    }
  } catch {
    // ignore ad blocker errors
  }
}

/**
 * Animation de particule volante vers l'icône du panier + rebond du compteur
 */
function animateFlyToCart(sourceEl) {
  if (!sourceEl) return;
  const targetCartBtn =
    document.getElementById('header-cart-trigger') ||
    document.getElementById('mobile-cart-trigger');
  if (!targetCartBtn) return;

  const startRect = sourceEl.getBoundingClientRect();
  const endRect = targetCartBtn.getBoundingClientRect();

  const orb = document.createElement('div');
  orb.className = 'ss-flying-orb';
  orb.innerHTML = '🛍️';
  orb.style.left = `${startRect.left + startRect.width / 2 - 14}px`;
  orb.style.top = `${startRect.top + startRect.height / 2 - 14}px`;
  document.body.appendChild(orb);

  const deltaX =
    endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
  const deltaY =
    endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);

  requestAnimationFrame(() => {
    orb.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.35)`;
    orb.style.opacity = '0.2';
  });

  setTimeout(() => {
    orb.remove();
    const badges = document.querySelectorAll('.ss-cart-badge');
    badges.forEach((badge) => {
      badge.classList.remove('animate-pop-spring');
      void badge.offsetWidth;
      badge.classList.add('animate-pop-spring');
    });
  }, 600);
}

/**
 * Explosion de petits cœurs roses lors de l'ajout aux favoris
 */
function spawnHeartBurst(sourceEl) {
  if (!sourceEl) return;
  const rect = sourceEl.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const offsets = [
    { tx: '-18px', ty: '-26px' },
    { tx: '18px', ty: '-24px' },
    { tx: '0px', ty: '-34px' },
    { tx: '-24px', ty: '-10px' },
    { tx: '24px', ty: '-12px' },
  ];

  offsets.forEach((offset) => {
    const p = document.createElement('span');
    p.className = 'ss-heart-particle';
    p.textContent = '♥';
    p.style.left = `${centerX - 6}px`;
    p.style.top = `${centerY - 8}px`;
    p.style.setProperty('--tx', offset.tx);
    p.style.setProperty('--ty', offset.ty);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 660);
  });
}

/**
 * IntersectionObserver pour révéler les sections au défilement
 */
function initScrollReveal() {
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  const elements = document.querySelectorAll('.reveal-on-scroll');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
  );

  elements.forEach((el) => scrollObserver.observe(el));
}

/**
 * SVG Logo Escarpin Rose ShoeStyle
 */
function renderHighHeelLogoSVG(sizeClass = 'w-9 h-9') {
  return `
    <svg class="${sizeClass} shrink-0 transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="heelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF5C93" />
          <stop offset="55%" stop-color="#DE1B61" />
          <stop offset="100%" stop-color="#A30E44" />
        </linearGradient>
      </defs>
      <path
        d="M52 10C48 10 44 16 39 26C33 37 25 44 15 46C9 47 6 49 6 51C6 53 10 54 18 54C29 54 37 46 44 35C46 32 48 33 48 37V53C48 54.1 48.9 55 50 55C51.1 55 52 54.1 52 53V24C54 19 55 10 52 10Z"
        fill="url(#heelGrad)"
      />
    </svg>
  `;
}

/**
 * Carte Produit ShoeStyle bilingue avec animation d'entrée en cascade
 */
function renderShoeStyleCard(product, staggerIndex = 0) {
  const wishlisted = store.isWishlisted(product.id);
  const t = getT();
  const prodName = store.lang === 'ar' ? product.name_ar || product.name : product.name_fr || product.name;
  const mainImage =
    product.image ||
    (Array.isArray(product.gallery) && product.gallery.find(Boolean)) ||
    IMAGES.talons;

  return `
    <article
      class="ss-product-card group animate-stagger-item"
      style="--i: ${staggerIndex};"
    >
      <div
        class="ss-product-img-box cursor-pointer"
        data-action="open-pdp"
        data-id="${product.id}"
      >
        <img
          src="${mainImage}"
          alt="${prodName}"
          referrerpolicy="no-referrer"
          decoding="async"
          fetchpriority="${staggerIndex < 4 ? 'high' : 'auto'}"
          draggable="false"
          class="ss-single-product-img"
          onerror="this.style.display='none';"
        />

        <!-- Bouton Cœur en haut à droite -->
        <button
          type="button"
          data-action="toggle-wishlist"
          data-id="${product.id}"
          class="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xs transition-transform hover:scale-110 active:scale-90"
          aria-label="${t.nav.wishlist}"
        >
          <svg
            class="w-4 h-4 transition-transform ${
              wishlisted
                ? 'fill-[#DE1B61] text-[#DE1B61] animate-pop-spring'
                : 'fill-none text-[#18181B]'
            }"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.9"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </button>

        <!-- Badge Réduction rose en bas à gauche (-25%, -20%, -30%) -->
        ${
          product.discountPercent > 0
            ? `<span class="absolute bottom-2 start-2 sm:bottom-2.5 sm:start-2.5 z-10 px-2 py-0.5 rounded-full bg-[#DE1B61] text-white text-[10px] sm:text-[11px] font-bold tabular-nums shadow-xs pointer-events-none">
                -${product.discountPercent}%
              </span>`
            : ''
        }
      </div>

      <!-- Infos produit (بدون تقييمات) -->
      <div class="p-2.5 sm:p-3 pt-2 flex flex-col flex-1 justify-between">
        <div>
          <h3 class="text-[13px] sm:text-[15px] font-bold text-[#18181B] leading-snug truncate">
            <a
              href="?product=${encodeURIComponent(product.slug || product.id)}"
              data-action="open-pdp"
              data-id="${product.id}"
              class="text-start hover:text-[#DE1B61] transition-colors block truncate"
            >
              ${prodName}
            </a>
          </h3>

          <div class="mt-1 flex items-baseline gap-1 sm:gap-1.5 flex-wrap tabular-nums">
            <span class="text-[13px] sm:text-[15px] font-extrabold text-[#DE1B61]">
              ${formatDA(product.price, store.lang)}
            </span>
            ${
              product.originalPrice
                ? `<span class="text-[10px] sm:text-xs text-[#8E8E93] line-through">
                    ${formatDA(product.originalPrice, store.lang)}
                  </span>`
                : ''
            }
          </div>
        </div>

        <!-- الألوان المتوفرة + زر الإضافة السريعة للسلة -->
        <div class="mt-2 flex items-center justify-between gap-1">
          <div class="flex items-center gap-1">
            ${(Array.isArray(product.colors) ? product.colors : ['Rose'])
              .slice(0, 4)
              .map((cName) => {
                const sw = COLOR_SWATCHES[cName];
                const hex = sw ? sw.hex : product.colorHex || '#F38BA8';
                return `<span class="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/15 inline-block" style="background-color:${hex};" title="${cName}"></span>`;
              })
              .join('')}
          </div>

          <button
            type="button"
            data-action="quick-add-cart"
            data-id="${product.id}"
            class="w-8 h-8 rounded-full border border-[#18181B]/25 hover:border-[#DE1B61] hover:bg-[#DE1B61] hover:text-white text-[#18181B] flex items-center justify-center transition-all hover:scale-110 active:scale-90 shrink-0"
            aria-label="${t.pdp.addToCart}"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Barre d'en-tête dynamique selon l'écran actif
 */
function renderHeader() {
  const headerEl = document.getElementById('app-header');
  if (!headerEl) return;

  const details = store.getCartDetails();
  const screen = store.currentScreen;
  const t = getT();

  const isScrolled = (window.scrollY || 0) > 12;
  const scrollClass = isScrolled ? ' is-scrolled' : '';

  if (screen === 'pdp') {
    headerEl.innerHTML = '';
    headerEl.className = `hidden lg:block ss-smart-header${scrollClass}`;
  } else {
    headerEl.className = `ss-smart-header${scrollClass}`;
  }

  // Bouton de bascule de langue
  const langToggleBtn = `
    <button
      type="button"
      data-action="toggle-language"
      class="px-2 sm:px-2.5 py-1 rounded-full bg-[#FCE8EE] hover:bg-[#DE1B61] text-[#DE1B61] hover:text-white text-[11px] sm:text-xs font-bold transition-all shadow-2xs flex items-center gap-1 shrink-0"
      title="${t.switchTitle}"
    >
      <span class="text-xs">🌐</span>
      <span>${t.langBtn}</span>
    </button>
  `;

  if (screen === 'home' || screen === 'pdp' || screen === 'landing') {
    headerEl.innerHTML = `
      <div class="max-w-6xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        <!-- Menu Hamburger / Catégories -->
        <button
          type="button"
          data-action="nav-screen"
          data-screen="category"
          data-category="${CATEGORIES[0]?.id || 'Talons'}"
          class="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90 shrink-0"
          aria-label="${t.nav.categories}"
        >
          <svg class="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="7" x2="20" y2="7" stroke-linecap="round" />
            <line x1="4" y1="12" x2="20" y2="12" stroke-linecap="round" />
            <line x1="4" y1="17" x2="15" y2="17" stroke-linecap="round" />
          </svg>
        </button>

        <!-- Logo central ShoeStyle — Step in Style -->
        <button
          type="button"
          data-action="nav-screen"
          data-screen="home"
          class="flex items-center gap-1.5 sm:gap-2 text-start group min-w-0"
        >
          ${renderHighHeelLogoSVG('w-7 h-7 sm:w-9 sm:h-9')}
          <div class="leading-none min-w-0">
            <span class="font-script text-2xl sm:text-[34px] font-bold text-[#18181B] tracking-tight block truncate">
              ${adminState?.cms?.storeName || 'ShoeStyle'}
            </span>
            <span class="hidden sm:block text-[10px] italic text-[#71717A] tracking-wider -mt-1 text-center">
              — Step in Style —
            </span>
          </div>
        </button>

        <!-- Liens rapides Desktop bilingues (ديناميكية حسب الفئات) -->
        <nav class="hidden md:flex items-center gap-5 text-xs font-semibold text-[#52525B]">
          <button type="button" data-action="nav-screen" data-screen="home" class="${
            screen === 'home' ? 'text-[#DE1B61]' : 'hover:text-[#18181B]'
          } transition-colors">${t.nav.home}</button>
          ${CATEGORIES.map(
            (cat) => `
              <button
                type="button"
                data-action="nav-screen"
                data-screen="category"
                data-category="${cat.id}"
                class="hover:text-[#DE1B61] transition-colors"
              >
                ${store.lang === 'ar' ? cat.name_ar : cat.name_fr}
              </button>
            `
          ).join('')}
        </nav>

        <!-- Bouton Langue + Recherche & Sac Panier -->
        <div class="flex items-center gap-1 sm:gap-2 shrink-0">
          ${langToggleBtn}

          <button
            type="button"
            data-action="toggle-search"
            class="w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
            aria-label="Recherche / بحث"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7.5" />
              <path stroke-linecap="round" d="M20 20l-3.8-3.8" />
            </svg>
          </button>

          <button
            id="header-cart-trigger"
            type="button"
            data-action="nav-screen"
            data-screen="cart"
            class="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
            aria-label="${t.nav.cart}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span class="ss-cart-badge absolute top-0.5 right-0.5 sm:top-1 sm:right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#DE1B61] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              ${details.totalCount}
            </span>
          </button>
        </div>
      </div>

      ${
        store.searchOpen
          ? `<div class="max-w-6xl mx-auto px-3 sm:px-4 pb-3 animate-screen-enter">
              <input
                id="global-search-input"
                type="search"
                value="${store.searchQuery}"
                placeholder="${t.search.placeholder}"
                class="w-full px-4 py-2.5 rounded-full bg-[#FDF5F7] border border-[#DE1B61]/25 text-xs sm:text-sm text-[#18181B] focus:outline-none"
              />
            </div>`
          : ''
      }
    `;
    return;
  }

  if (screen === 'category' || screen === 'wishlist' || screen === 'account') {
    const activeCatObj = CATEGORIES.find((c) => c.id === store.activeCategory);
    const catName = activeCatObj
      ? store.lang === 'ar'
        ? activeCatObj.name_ar
        : activeCatObj.name_fr
      : t.nav.all;

    const title =
      screen === 'category'
        ? store.activeCategory === 'Tout'
          ? t.nav.all
          : catName
        : screen === 'wishlist'
        ? t.wishlist.title
        : t.account.title;

    headerEl.innerHTML = `
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          data-action="go-back"
          class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B] transition-transform active:scale-90"
          aria-label="${t.pdp.back}"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${getBackIconSvg()}
          </svg>
        </button>

        <h1 id="header-screen-title" class="text-base sm:text-lg font-bold text-[#18181B] animate-screen-enter">${title}</h1>

        <div class="flex items-center gap-1.5">
          ${langToggleBtn}

          <button
            type="button"
            data-action="toggle-search"
            class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
            aria-label="Recherche / بحث"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="7.5" />
              <path stroke-linecap="round" d="M20 20l-3.8-3.8" />
            </svg>
          </button>

          <button
            id="header-cart-trigger"
            type="button"
            data-action="nav-screen"
            data-screen="cart"
            class="relative w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
            aria-label="${t.nav.cart}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span class="ss-cart-badge absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[#DE1B61] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              ${details.totalCount}
            </span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (screen === 'cart') {
    headerEl.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          data-action="go-back"
          class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
          aria-label="${t.pdp.back}"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${getBackIconSvg()}
          </svg>
        </button>

        <h1 class="text-base sm:text-lg font-bold text-[#18181B]">${t.cart.title}</h1>

        <div class="flex items-center gap-2">
          ${langToggleBtn}
          <button
            type="button"
            data-action="clear-cart"
            class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
            aria-label="${t.cart.clearCart}"
            title="${t.cart.clearCart}"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (screen === 'checkout' || screen === 'confirmation') {
    headerEl.innerHTML = `
      <div class="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          data-action="go-back"
          class="w-9 h-9 rounded-full hover:bg-[#FCE8EE]/60 flex items-center justify-center text-[#18181B]"
          aria-label="${t.pdp.back}"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            ${getBackIconSvg()}
          </svg>
        </button>

        <h1 class="text-base sm:text-lg font-bold text-[#18181B]">
          ${screen === 'checkout' ? t.checkout.title : t.confirmation.title}
        </h1>

        <div>${langToggleBtn}</div>
      </div>
    `;
  }
}

/**
 * ÉCRAN 1 : ACCUEIL (Home View bilingue)
 */
function renderHomeScreen() {
  const t = getT();
  const slide = HERO_SLIDES[heroSlideIndex] || HERO_SLIDES[0];
  const newArrivals = PRODUCTS.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4);
  const specialOffers = PRODUCTS.filter((p) => p.isSpecialOffer).slice(0, 4);

  const slideKicker = store.lang === 'ar' ? slide.kicker_ar : slide.kicker_fr;
  const slideTitle = store.lang === 'ar' ? slide.titleHtml_ar : slide.titleHtml_fr;
  const slideSubtitle = store.lang === 'ar' ? slide.subtitle_ar : slide.subtitle_fr;
  const slideCta = store.lang === 'ar' ? slide.ctaLabel_ar : slide.ctaLabel_fr;

  return `
    <div class="max-w-6xl mx-auto animate-screen-enter">
      <!-- 1. Hero Banner ShoeStyle avec Carrousel Bilingue -->
      <section id="hero-banner-section" class="px-2.5 sm:px-6 pt-2 pb-3 sm:pb-4">
        <div class="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#EFE3DC] via-[#F6EAE6] to-[#FCE8EE] border border-[#DE1B61]/10 shadow-sm">
          <div class="grid grid-cols-1 md:grid-cols-12 items-center min-h-[235px] sm:min-h-[340px]">
            <!-- Image Mode avec zoom Ken Burns -->
            <div class="md:col-span-7 relative h-[235px] sm:h-[340px] w-full overflow-hidden">
              <img
                id="hero-banner-img"
                src="${slide.image}"
                alt="ShoeStyle Collection"
                referrerpolicy="no-referrer"
                class="w-full h-full object-cover object-center animate-hero-zoom transition-opacity duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/45 to-[#FCE8EE]/95 md:to-transparent pointer-events-none"></div>

              <!-- Overlay Mobile -->
              <div id="hero-mobile-overlay" class="md:hidden absolute inset-y-0 end-0 w-[64%] flex flex-col items-end justify-center pe-3.5 text-end transition-opacity duration-300">
                <h2 id="hero-mobile-title" class="font-script text-[25px] sm:text-[30px] leading-[1.12] font-bold text-[#18181B] drop-shadow-xs">
                  ${slideTitle}
                </h2>
                <span class="text-lg text-[#DE1B61] mt-0.5 me-1 animate-float-soft inline-block" aria-hidden="true">♡</span>
                <button
                  id="hero-mobile-cta"
                  type="button"
                  data-action="nav-screen"
                  data-screen="category"
                  data-category="${slide.targetCategory}"
                  class="mt-2 ss-btn-pink px-4 py-2 text-xs inline-flex items-center gap-1.5"
                >
                  <span id="hero-mobile-cta-label">${slideCta}</span>
                  <span id="hero-mobile-cta-arrow">${getArrowNext()}</span>
                </button>
              </div>
            </div>

            <!-- Texte Hero sur Desktop/Tablette -->
            <div id="hero-desktop-content" class="hidden md:flex md:col-span-5 flex-col items-start justify-center p-8 transition-opacity duration-300">
              <span id="hero-desktop-kicker" class="text-xs font-semibold uppercase tracking-widest text-[#DE1B61]">
                ${slideKicker}
              </span>
              <div class="flex items-end gap-2 mt-2">
                <h2 id="hero-desktop-title" class="font-script text-5xl font-bold text-[#18181B] leading-[1.1]">
                  ${slideTitle}
                </h2>
                <span class="text-2xl text-[#DE1B61] animate-float-soft inline-block mb-1">♡</span>
              </div>
              <p id="hero-desktop-subtitle" class="text-xs sm:text-sm text-[#52525B] mt-3 leading-relaxed">
                ${slideSubtitle}
              </p>
              <button
                id="hero-desktop-cta"
                type="button"
                data-action="nav-screen"
                data-screen="category"
                data-category="${slide.targetCategory}"
                class="mt-5 ss-btn-pink px-6 py-2.5 text-sm inline-flex items-center gap-2"
              >
                <span id="hero-desktop-cta-label">${slideCta}</span>
                <span id="hero-desktop-cta-arrow">${getArrowNext()}</span>
              </button>
            </div>
          </div>

          <!-- Points de pagination carrousel -->
          <div id="hero-dots-container" class="py-2 flex items-center justify-center gap-2 bg-white/65 backdrop-blur-xs">
            ${HERO_SLIDES.map(
              (_, idx) => `
              <button
                type="button"
                data-action="hero-slide"
                data-index="${idx}"
                aria-label="Diapositive ${idx + 1}"
                class="transition-all duration-300 rounded-full ${
                  idx === heroSlideIndex
                    ? 'w-5 h-2 bg-[#DE1B61]'
                    : 'w-2 h-2 bg-[#18181B]/25 hover:bg-[#18181B]/50'
                }"
              ></button>
            `
            ).join('')}
          </div>
        </div>
      </section>

      <!-- 2. Catégories Rondes bilingues -->
      <section class="px-3 sm:px-6 py-1 sm:py-1.5">
        <div class="flex items-center justify-between sm:justify-around gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pt-3.5 pb-3.5 px-1">
          ${CATEGORIES.map(
            (cat, idx) => `
            <button
              type="button"
              data-action="nav-screen"
              data-screen="category"
              data-category="${cat.id}"
              style="--i: ${idx};"
              class="ss-category-btn animate-stagger-item flex flex-col items-center gap-1.5 sm:gap-2 shrink-0 group"
            >
              <div class="ss-category-circle">
                <img
                  src="${cat.image}"
                  alt="${store.lang === 'ar' ? cat.name_ar : cat.name_fr}"
                  referrerpolicy="no-referrer"
                  class="w-full h-full object-cover"
                />
              </div>
              <span class="text-[11px] sm:text-[13px] font-semibold text-[#18181B] group-hover:text-[#DE1B61] transition-colors whitespace-nowrap">
                ${store.lang === 'ar' ? cat.name_ar : cat.name_fr}
              </span>
            </button>
          `
          ).join('')}
        </div>
      </section>

      <!-- 3. Section Nouveautés -->
      <section class="px-3 sm:px-6 py-4 sm:py-5">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base sm:text-xl font-extrabold text-[#18181B]">${t.sections.newArrivals}</h2>
          <button
            type="button"
            data-action="nav-screen"
            data-screen="category"
            data-category="Tout"
            class="text-xs sm:text-sm font-semibold text-[#DE1B61] hover:underline inline-flex items-center gap-1 group"
          >
            <span>${t.nav.seeAll}</span>
            <span class="transition-transform group-hover:translate-x-1">${getArrowNext()}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          ${newArrivals.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
        </div>
      </section>

      <!-- 4. Section Meilleures Ventes -->
      <section class="px-3 sm:px-6 py-4 sm:py-5 bg-[#FDF5F7]/70 reveal-on-scroll">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-base sm:text-xl font-extrabold text-[#18181B]">${t.sections.bestSellers}</h2>
            <p class="text-[11px] sm:text-xs text-[#71717A]">${t.sections.bestSellersSub}</p>
          </div>
          <button
            type="button"
            data-action="nav-screen"
            data-screen="category"
            data-category="Talons"
            class="text-xs sm:text-sm font-semibold text-[#DE1B61] hover:underline inline-flex items-center gap-1 group"
          >
            <span>${t.nav.seeAll}</span>
            <span class="transition-transform group-hover:translate-x-1">${getArrowNext()}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          ${bestSellers.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
        </div>
      </section>

      <!-- 5. Section Offres Spéciales -->
      <section class="px-3 sm:px-6 py-4 sm:py-5 reveal-on-scroll">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-base sm:text-xl font-extrabold text-[#18181B]">${t.sections.specialOffers}</h2>
            <p class="text-[11px] sm:text-xs text-[#DE1B61] font-medium">${t.sections.specialOffersSub}</p>
          </div>
          <button
            type="button"
            data-action="nav-screen"
            data-screen="category"
            data-category="Talons"
            class="text-xs sm:text-sm font-semibold text-[#DE1B61] hover:underline inline-flex items-center gap-1 group"
          >
            <span>${t.sections.enjoy}</span>
            <span class="transition-transform group-hover:translate-x-1">${getArrowNext()}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
          ${specialOffers.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
        </div>
      </section>

      ${
        Array.isArray(adminState?.landingPages) && adminState.landingPages.length > 0
          ? `
      <!-- 5.B العروض الترويجية الحصرية (صفحات الهبوط السريعة) -->
      <section class="px-4 sm:px-6 py-5 reveal-on-scroll">
        <div class="flex items-center justify-between mb-3.5">
          <div>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FCE8EE] text-[#DE1B61] text-[11px] font-extrabold mb-1">
              🔥 ${store.lang === 'ar' ? 'عروض فلاش محدودة · طلب مباشر بدون سلة' : 'Offres Flash Exclusives · Commande Directe'}
            </span>
            <h2 class="text-lg sm:text-xl font-extrabold text-[#18181B]">
              ${store.lang === 'ar' ? 'صفحات العروض الترويجية الخاصة' : 'Pages d’Offres Promotionnelles VIP'}
            </h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${adminState.landingPages
            .map((lp, idx) => {
              const orig = Number(lp.originalPrice || 0);
              const disc = Number(lp.discountPrice || 0);
              const saveAmt = Math.max(0, orig - disc);
              const pct = orig > disc && orig > 0 ? Math.round(((orig - disc) / orig) * 100) : 25;
              return `
                <article
                  style="--i: ${idx};"
                  class="animate-stagger-item group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF9FB] via-white to-[#FCE8EE]/50 border border-[#DE1B61]/20 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-stretch"
                >
                  <div class="relative sm:w-44 h-48 sm:h-auto shrink-0 overflow-hidden bg-[#F5E8EC] cursor-pointer" data-action="open-landing" data-id="${lp.id}">
                    <img
                      src="${lp.imageUrl}"
                      alt="${lp.title}"
                      referrerpolicy="no-referrer"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span class="absolute top-2.5 start-2.5 px-2.5 py-1 rounded-full bg-[#DE1B61] text-white text-xs font-extrabold shadow-xs">
                      -${pct}%
                    </span>
                  </div>

                  <div class="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div class="flex items-center gap-1.5 text-[11px] font-bold text-[#15803D] mb-1">
                        <span>✓ ${store.lang === 'ar' ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</span>
                        <span>•</span>
                        <span>🚚 69 ${store.lang === 'ar' ? 'ولاية' : 'Wilayas'}</span>
                      </div>
                      <h3 class="text-sm sm:text-base font-extrabold text-[#18181B] leading-snug line-clamp-2">
                        ${lp.title}
                      </h3>
                      <p class="mt-1 text-xs text-[#52525B] line-clamp-2">
                        ${lp.description || ''}
                      </p>
                    </div>

                    <div class="mt-3 pt-2.5 border-t border-black/8 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div class="flex items-baseline gap-2 tabular-nums">
                          <span class="text-base sm:text-lg font-extrabold text-[#DE1B61]">${formatDA(disc, store.lang)}</span>
                          ${
                            orig > disc
                              ? `<span class="text-xs text-[#8E8E93] line-through">${formatDA(orig, store.lang)}</span>`
                              : ''
                          }
                        </div>
                        ${
                          saveAmt > 0
                            ? `<span class="text-[11px] font-bold text-[#15803D]">
                                ${store.lang === 'ar' ? `توفرين ${formatDA(saveAmt, 'ar')}` : `Économisez ${formatDA(saveAmt, 'fr')}`}
                              </span>`
                            : ''
                        }
                      </div>

                      <button
                        type="button"
                        data-action="open-landing"
                        data-id="${lp.id}"
                        class="ss-btn-pink px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
                      >
                        <span>${store.lang === 'ar' ? 'اطلبي الآن' : 'Commander'}</span>
                        <span>${getArrowNext()}</span>
                      </button>
                    </div>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      </section>
      `
          : ''
      }

      <!-- 6. إضافة وعرض الآراء الحقيقية للزبونات -->
      ${renderRealReviewsSection()}

      <!-- 7. Footer ShoeStyle : أرقام الهاتف، مكان المحل، وأيقونات التواصل الاجتماعي -->
      ${renderStoreFooter()}
    </div>
  `;
}

function renderRealReviewsSection() {
  const isAr = store.lang === 'ar';
  const reviews = Array.isArray(store.reviews) ? store.reviews : [];
  const activeRating = Number(store.reviewFormRating || 5);
  const catalogProducts =
    Array.isArray(adminState?.products) && adminState.products.length > 0
      ? adminState.products
      : PRODUCTS;

  return `
    <section id="real-reviews-section" class="px-4 sm:px-6 py-4 bg-[#FDF5F7] border-t border-[#DE1B61]/10 reveal-on-scroll">
      <div class="max-w-3xl mx-auto">
        <!-- نافذة مصغرة ومرتبة لإضافة رأي حقيقي -->
        <form
          id="shoestyle-review-form"
          class="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#DE1B61]/15 shadow-2xs space-y-2.5"
        >
          <!-- السطر العلوي: العنوان + اختيار النجوم في نفس السطر -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/5">
            <div class="flex items-center gap-2">
              <span class="text-sm font-extrabold text-[#18181B]">
                ✍️ ${isAr ? 'شاركينا رأيكِ الحقيقي' : 'Partagez votre avis'}
              </span>
              ${
                reviews.length > 0
                  ? `<span class="px-2 py-0.5 rounded-full bg-[#FCE8EE] text-[#DE1B61] text-[10px] font-bold">
                      ★ ${(reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0) / reviews.length).toFixed(1)} (${reviews.length})
                    </span>`
                  : `<span class="text-[10px] text-[#71717A] hidden sm:inline">
                      · ${isAr ? 'ينشر فوراً' : 'Publié instantanément'}
                    </span>`
              }
            </div>

            <div class="flex items-center gap-1" id="review-stars-picker">
              <span class="text-[11px] font-semibold text-[#71717A] me-1">
                ${isAr ? 'التقييم:' : 'Note :'}
              </span>
              ${[1, 2, 3, 4, 5]
                .map(
                  (star) => `
                <button
                  type="button"
                  data-action="select-review-star"
                  data-rating="${star}"
                  class="w-6 h-6 rounded-lg border transition-all flex items-center justify-center text-xs ${
                    star <= activeRating
                      ? 'bg-[#FFFBEB] border-[#FBBF24] text-[#FBBF24] shadow-2xs scale-105'
                      : 'bg-[#F8F6F7] border-black/8 text-[#D4D4D8]'
                  }"
                  aria-label="${star} stars"
                >
                  ★
                </button>
              `
                )
                .join('')}
              <span id="review-rating-badge" class="ms-1 text-[11px] font-bold text-[#DE1B61]">
                ${activeRating}/5
              </span>
              <input type="hidden" name="rating" id="review-rating-input" value="${activeRating}" />
            </div>
          </div>

          <!-- السطر الأول من الحقول: الاسم + الولاية + الموديل -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              name="reviewerName"
              required
              placeholder="${isAr ? 'الاسم (مثال: سارة م.) *' : 'Votre nom *'}"
              class="w-full h-10 sm:h-9 px-3 rounded-xl bg-[#FDF5F7]/70 border border-black/10 text-xs text-[#18181B] focus:outline-none focus:border-[#DE1B61]"
            />

            <select
              name="reviewerCity"
              required
              aria-label="${isAr ? 'الولاية' : 'Wilaya'}"
              class="w-full h-10 sm:h-9 px-2.5 rounded-xl bg-[#FDF5F7]/70 border border-black/10 text-xs text-[#18181B] focus:outline-none focus:border-[#DE1B61]"
            >
              ${WILAYAS.map(
                (w) => `
                <option value="${isAr ? w.name_ar : w.name_fr}">
                  ${isAr ? w.name_ar : w.name_fr}
                </option>
              `
              ).join('')}
            </select>

            <select
              name="reviewerProduct"
              aria-label="${isAr ? 'الموديل' : 'Modèle'}"
              class="w-full h-10 sm:h-9 px-2.5 rounded-xl bg-[#FDF5F7]/70 border border-black/10 text-xs text-[#18181B] focus:outline-none focus:border-[#DE1B61]"
            >
              <option value="${isAr ? 'تجربة عامة للمتجر' : 'Expérience générale'}">
                ${isAr ? 'الموديل: تجربة عامة للمتجر' : 'Modèle : Expérience générale'}
              </option>
              ${catalogProducts
                .map((p) => {
                  const pName = isAr ? p.name_ar || p.name : p.name_fr || p.name;
                  return `<option value="${pName}">${pName}</option>`;
                })
                .join('')}
            </select>
          </div>

          <!-- السطر الثاني: خانة كتابة التعليق + زر النشر بجانبها مباشرة -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              name="reviewerComment"
              required
              placeholder="${
                isAr
                  ? 'اكتبي رأيكِ باختصار حول الجودة والمقاس والتوصيل... *'
                  : 'Votre commentaire sur la qualité, la pointure et la livraison... *'
              }"
              class="flex-1 h-10 sm:h-9 px-3 rounded-xl bg-[#FDF5F7]/70 border border-black/10 text-xs text-[#18181B] focus:outline-none focus:border-[#DE1B61]"
            />
            <button
              type="submit"
              class="h-10 sm:h-9 px-4 ss-btn-pink text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>${isAr ? 'نشر الرأي' : 'Publier'}</span>
              <span>♥</span>
            </button>
          </div>
        </form>

        <!-- عرض الآراء المضافة إن وجدت (بحجم مدمج وأنيق) -->
        ${
          reviews.length > 0
            ? `
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            ${reviews
              .map(
                (rev, idx) => `
              <article
                style="--i: ${idx};"
                class="animate-stagger-item bg-white p-3 rounded-xl border border-[#DE1B61]/12 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-[#FBBF24] tracking-wider">
                      ${'★'.repeat(Number(rev.rating || 5))}${'☆'.repeat(Math.max(0, 5 - Number(rev.rating || 5)))}
                    </span>
                    <span class="text-[#71717A] truncate max-w-[110px]">${rev.city || ''}</span>
                  </div>
                  <p class="mt-1.5 text-xs text-[#18181B] leading-snug break-words">
                    « ${rev.comment} »
                  </p>
                </div>
                <div class="mt-2 pt-1.5 border-t border-black/5 flex items-center justify-between text-[11px] gap-1">
                  <strong class="text-[#18181B] truncate">${rev.name}</strong>
                  ${
                    rev.product
                      ? `<span class="text-[#DE1B61] font-semibold text-[10px] bg-[#FCE8EE]/60 px-2 py-0.5 rounded-full truncate max-w-[110px]">${rev.product}</span>`
                      : ''
                  }
                </div>
              </article>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    </section>
  `;
}

function renderStoreFooter() {
  const t = getT();
  const isAr = store.lang === 'ar';
  const cms = adminState?.cms || {};
  const storeName = cms.storeName || 'ShoeStyle';
  const phone = cms.phone || '0550 12 34 56';
  const cleanTel = phone.replace(/\s+/g, '');
  const whatsapp = (cms.whatsappNumber || '213550123456').replace(/[^0-9]/g, '');
  const locationText = isAr
    ? cms.location_ar || 'الجزائر العاصمة — باب الزوار، المركز التجاري'
    : cms.location_fr || 'Alger — Bab Ezzouar, Centre Commercial';
  const instagramUrl = cms.instagramUrl || 'https://instagram.com/shoestyle.dz';
  const facebookUrl = cms.facebookUrl || 'https://facebook.com/shoestyle.dz';
  const tiktokUrl = cms.tiktokUrl || 'https://tiktok.com/@shoestyle.dz';

  return `
    <footer class="px-4 sm:px-6 py-9 bg-gradient-to-b from-white via-[#FDF5F7] to-[#FCE8EE]/70 border-t border-[#DE1B61]/15 reveal-on-scroll">
      <div class="max-w-5xl mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-start">
          
          <!-- 1. هوية المتجر -->
          <div class="flex flex-col items-center md:items-start gap-2">
            <div class="flex items-center gap-2">
              ${renderHighHeelLogoSVG('w-9 h-9')}
              <div>
                <span class="font-script text-3xl font-bold text-[#18181B] block leading-none">${storeName}</span>
                <span class="text-[11px] text-[#DE1B61] font-semibold">Step in Style · 69 ${isAr ? 'ولاية' : 'Wilayas'}</span>
              </div>
            </div>
            <p class="text-xs text-[#52525B] max-w-xs leading-relaxed">
              ${
                isAr
                  ? 'وجهتكِ الأولى للأحذية النسائية الراقية في الجزائر مع الدفع عند الاستلام وتوصيل سريع لـ 69 ولاية.'
                  : 'Votre boutique de chaussures féminines en Algérie. Paiement à la livraison sur les 69 wilayas.'
              }
            </p>
          </div>

          <!-- 2. رقم الهاتف ومكان المحل -->
          <div class="flex flex-col items-center gap-2.5 bg-white/90 p-4 rounded-2xl border border-[#DE1B61]/15 shadow-2xs">
            <div class="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[#18181B]">
              <span class="w-8 h-8 rounded-full bg-[#FCE8EE] text-[#DE1B61] flex items-center justify-center shrink-0">
                📞
              </span>
              <div class="text-start">
                <span class="block text-[11px] text-[#71717A] font-semibold">
                  ${isAr ? 'خدمة الزبائن والطلب الهاتفي:' : 'Service Client & Commandes :'}
                </span>
                <a href="tel:${cleanTel}" dir="ltr" class="text-sm sm:text-base font-extrabold text-[#DE1B61] hover:underline tabular-nums">
                  ${phone}
                </a>
              </div>
            </div>

            <div class="w-full h-[1px] bg-black/6"></div>

            <div class="flex items-center gap-2 text-xs font-bold text-[#18181B]">
              <span class="w-8 h-8 rounded-full bg-[#FCE8EE] text-[#DE1B61] flex items-center justify-center shrink-0">
                📍
              </span>
              <div class="text-start">
                <span class="block text-[11px] text-[#71717A] font-semibold">
                  ${isAr ? 'مكان المحل / العنوان:' : 'Adresse du Magasin :'}
                </span>
                <span class="text-xs sm:text-[13px] font-bold text-[#18181B]">
                  ${locationText}
                </span>
              </div>
            </div>
          </div>

          <!-- 3. أيقونات التواصل الاجتماعي -->
          <div class="flex flex-col items-center md:items-end gap-2.5">
            <span class="text-xs font-extrabold text-[#18181B]">
              ${isAr ? 'تابعينا وتواصلي معنا عبر:' : 'Suivez-nous sur nos réseaux :'}
            </span>
            <div class="flex items-center gap-2.5">
              <!-- Instagram -->
              <a
                href="${instagramUrl}"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                class="w-10 h-10 rounded-full bg-white border border-[#DE1B61]/25 text-[#DE1B61] hover:bg-[#DE1B61] hover:text-white flex items-center justify-center shadow-2xs transition-all hover:scale-110"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <!-- Facebook -->
              <a
                href="${facebookUrl}"
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                class="w-10 h-10 rounded-full bg-white border border-[#DE1B61]/25 text-[#1877F2] hover:bg-[#1877F2] hover:text-white flex items-center justify-center shadow-2xs transition-all hover:scale-110"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <!-- TikTok -->
              <a
                href="${tiktokUrl}"
                target="_blank"
                rel="noopener"
                aria-label="TikTok"
                class="w-10 h-10 rounded-full bg-white border border-[#DE1B61]/25 text-[#18181B] hover:bg-[#18181B] hover:text-white flex items-center justify-center shadow-2xs transition-all hover:scale-110"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>

              <!-- WhatsApp -->
              <a
                href="https://wa.me/${whatsapp}"
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                class="w-10 h-10 rounded-full bg-white border border-[#DE1B61]/25 text-[#25D366] hover:bg-[#25D366] hover:text-white flex items-center justify-center shadow-2xs transition-all hover:scale-110"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.82 14.01c-.24.68-1.41 1.3-1.95 1.38-.5.08-1.13.11-1.83-.11-.42-.13-.97-.31-1.67-.61-2.95-1.27-4.88-4.25-5.03-4.45-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.79-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.84 2.04.91 2.19.07.15.12.32.02.52-.1.2-.15.32-.3.5-.15.17-.31.39-.45.52-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.12.65-.07.17-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.35.08.12.08.71-.16 1.39z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-[#DE1B61]/15 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#71717A]">
          <p class="font-script text-2xl text-[#18181B]">
            ${t.footer.bye} <span class="text-[#DE1B61] inline-block animate-float-soft">♥</span>
          </p>
          <p>${t.footer.legal}</p>
        </div>
      </div>
    </footer>
  `;
}

function getFilteredCategoryProducts() {
  let filtered = PRODUCTS.filter((p) => {
    const matchCat =
      store.activeCategory === 'Tout' || p.category === store.activeCategory;
    const matchPrice =
      store.filterPrice === 'all' ||
      (store.filterPrice === 'under-4500' && p.price <= 4500) ||
      (store.filterPrice === '4500-plus' && p.price > 4500);
    const matchSize =
      store.filterSize === 'all' || p.sizes.includes(Number(store.filterSize));
    const matchColor =
      store.filterColor === 'all' || p.colors.includes(store.filterColor);
    const q = store.searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.name_fr.toLowerCase().includes(q) ||
      p.name_ar.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    return matchCat && matchPrice && matchSize && matchColor && matchSearch;
  });

  if (
    filtered.length === 0 &&
    store.filterPrice === 'all' &&
    store.filterColor === 'all'
  ) {
    filtered = PRODUCTS;
  }

  return filtered;
}

/**
 * ÉCRAN 2 : PAGE CATÉGORIE
 */
function renderCategoryScreen() {
  const t = getT();
  const activeCatObj =
    CATEGORIES.find((c) => c.id === store.activeCategory) || CATEGORIES[1];
  const filtered = getFilteredCategoryProducts();

  const catName = store.lang === 'ar' ? activeCatObj.name_ar : activeCatObj.name_fr;
  const catSub = store.lang === 'ar' ? activeCatObj.subtitle_ar : activeCatObj.subtitle_fr;

  return `
    <div class="max-w-5xl mx-auto pb-8 animate-screen-enter">
      <!-- Bannière Catégorie -->
      <div class="relative h-36 sm:h-56 overflow-hidden bg-gradient-to-r from-[#F5E1E6] via-[#F9EBEF] to-[#F3E5E0]">
        <img
          id="cat-banner-img"
          src="${activeCatObj.image}"
          alt="${catName}"
          referrerpolicy="no-referrer"
          class="w-full h-full object-cover object-left opacity-90 animate-hero-zoom transition-opacity duration-300"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-[#F9EBEF]/95 flex flex-col items-end justify-center pe-4 sm:pe-12 text-center">
          <div class="max-w-[190px] sm:max-w-xs animate-stagger-item" style="--i: 1;">
            <h2 id="cat-banner-title" class="font-script text-2xl sm:text-5xl font-bold text-[#18181B]">
              ${store.activeCategory === 'Tout' ? t.nav.all : catName}
            </h2>
            <p id="cat-banner-sub" class="text-[11px] sm:text-sm font-medium text-[#3F3F46] mt-0.5">
              ${catSub}
            </p>
            <!-- Ligne courbe rose avec petit cœur -->
            <svg class="w-24 sm:w-28 h-4 mx-auto mt-1 text-[#DE1B61]" viewBox="0 0 120 18" fill="none">
              <path d="M4 12C35 4 75 18 108 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <circle cx="112" cy="6" r="2.5" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Sélecteur rapide de catégories -->
      <div class="px-3 sm:px-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        ${['Tout', ...CATEGORIES.map((c) => c.id)]
          .map((catId) => {
            const catObj = CATEGORIES.find((c) => c.id === catId);
            const label =
              catId === 'Tout'
                ? t.filters.allCategories
                : store.lang === 'ar'
                ? catObj?.name_ar
                : catObj?.name_fr;
            return `
            <button
              type="button"
              data-action="select-category-pill"
              data-category="${catId}"
              class="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                store.activeCategory === catId
                  ? 'bg-[#18181B] text-white scale-105 shadow-xs'
                  : 'bg-[#F5F3F4] text-[#52525B] hover:text-[#18181B]'
              }"
            >
              ${label}
            </button>
          `;
          })
          .join('')}
      </div>

      <!-- Barre de Filtres ("Filtrer", "Prix ▾", "Taille ▾", "Couleur ▾") -->
      <div class="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          data-action="reset-category-filters"
          class="ss-btn-pink px-4 py-1.5 text-xs inline-flex items-center gap-1.5 shrink-0"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="currentColor" />
            <circle cx="16" cy="12" r="2" fill="currentColor" />
            <circle cx="10" cy="18" r="2" fill="currentColor" />
          </svg>
          <span>${t.filters.filterBtn}</span>
        </button>

        <!-- Filtre Prix -->
        <select
          id="filter-price-select"
          aria-label="${t.filters.price}"
          class="px-3 py-1.5 rounded-full bg-[#F8EEF1] text-[#18181B] text-xs font-semibold border border-transparent focus:border-[#DE1B61] cursor-pointer shrink-0 transition-colors hover:bg-[#FCE8EE]"
        >
          <option value="all" ${store.filterPrice === 'all' ? 'selected' : ''}>${t.filters.price}</option>
          <option value="under-4500" ${store.filterPrice === 'under-4500' ? 'selected' : ''}>${t.filters.priceUnder4500}</option>
          <option value="4500-plus" ${store.filterPrice === '4500-plus' ? 'selected' : ''}>${t.filters.price4500Plus}</option>
        </select>

        <!-- Filtre Taille -->
        <select
          id="filter-size-select"
          aria-label="${t.filters.size}"
          class="px-3 py-1.5 rounded-full bg-[#F8EEF1] text-[#18181B] text-xs font-semibold border border-transparent focus:border-[#DE1B61] cursor-pointer shrink-0 transition-colors hover:bg-[#FCE8EE]"
        >
          <option value="all" ${store.filterSize === 'all' ? 'selected' : ''}>${t.filters.size}</option>
          ${[36, 37, 38, 39, 40, 41]
            .map(
              (sz) =>
                `<option value="${sz}" ${
                  String(store.filterSize) === String(sz) ? 'selected' : ''
                }>${t.filters.sizePrefix} ${sz}</option>`
            )
            .join('')}
        </select>

        <!-- Filtre Couleur -->
        <select
          id="filter-color-select"
          aria-label="${t.filters.color}"
          class="px-3 py-1.5 rounded-full bg-[#F8EEF1] text-[#18181B] text-xs font-semibold border border-transparent focus:border-[#DE1B61] cursor-pointer shrink-0 transition-colors hover:bg-[#FCE8EE]"
        >
          <option value="all" ${store.filterColor === 'all' ? 'selected' : ''}>${t.filters.color}</option>
          ${Object.keys(COLOR_SWATCHES)
            .map((c) => {
              const label = store.lang === 'ar' ? COLOR_SWATCHES[c].label_ar : COLOR_SWATCHES[c].label_fr;
              return `<option value="${c}" ${
                store.filterColor === c ? 'selected' : ''
              }>${label}</option>`;
            })
            .join('')}
        </select>
      </div>

      <!-- Grille Produits -->
      <div id="category-products-grid" class="px-3 sm:px-6 pt-1 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        ${filtered.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
      </div>
    </div>
  `;
}

/**
 * ÉCRAN 3 : FICHE PRODUIT DÉTAILLÉE
 */
function getActiveLandingItemConfig() {
  const isAr = store.lang === 'ar';
  const lpList =
    Array.isArray(adminState?.landingPages) && adminState.landingPages.length > 0
      ? adminState.landingPages
      : [];
  const lp =
    lpList.find((item) => item.id === store.activeLandingId) ||
    lpList[0] || {
      id: 'lp-101',
      title: 'حذاء كعب عالي كلاسيك روز · Escarpins Classiques Rose',
      slug: '/offer/pink-heels-vip',
      originalPrice: 6990,
      discountPrice: 4490,
      imageUrl: IMAGES.talons,
      gallery: [IMAGES.talons],
      description:
        'حذاء الكعب الوردي الأنيق المصنوع من الجلد المرن المريح للقدم طوال اليوم.',
      offerEnabled: true,
      offerMinQty: 2,
      offerFreeShipping: true,
      offerText: isAr ? 'اشترِ 2 واحصل على شحن مجاني' : '2 paires = Livraison gratuite',
    };

  const gallery =
    Array.isArray(lp.gallery) && lp.gallery.length > 0 ? lp.gallery : [lp.imageUrl];

  return {
    id: lp.id,
    title: lp.title,
    description: lp.description || '',
    unitPrice: Number(lp.discountPrice || 4490),
    origUnitPrice: Number(lp.originalPrice || lp.discountPrice || 4490),
    imageUrl: gallery[0] || lp.imageUrl,
    gallery,
    colors:
      Array.isArray(lp.colors) && lp.colors.length > 0
        ? lp.colors
        : ['Rose', 'Beige', 'Noir', 'Blanc'],
    sizes:
      Array.isArray(lp.sizes) && lp.sizes.length > 0
        ? lp.sizes
        : [36, 37, 38, 39, 40, 41],
    offerEnabled: lp.offerEnabled !== false,
    offerMinQty: Math.max(2, Number(lp.offerMinQty || 2)),
    offerFreeShipping: lp.offerFreeShipping !== false,
    offerText: lp.offerText || '',
  };
}

/**
 * حساب تكلفة عرض صفحة الهبوط (الكمية المختارة + العرض الاختياري للشحن المجاني + سعر التوصيل حسب الولاية)
 */
function calculateLandingOrderPricing(rawItem) {
  const cfg = rawItem && rawItem.unitPrice !== undefined ? rawItem : getActiveLandingItemConfig();
  const unitPrice = Number(cfg.unitPrice || cfg.discountPrice || 4490);
  const origUnitPrice = Number(cfg.origUnitPrice || cfg.originalPrice || unitPrice);
  const bundleQty = Math.max(1, Number(store.lpSelectedBundle || 1));

  const offerEnabled = cfg.offerEnabled !== false;
  const offerMinQty = Math.max(2, Number(cfg.offerMinQty || 2));
  const offerFreeShipping = cfg.offerFreeShipping !== false;
  const isOfferApplied = offerEnabled && bundleQty >= offerMinQty;

  const subtotal = unitPrice * bundleQty;
  const originalTotal = origUnitPrice * bundleQty;

  const rates =
    Array.isArray(adminState?.shipping?.rates) && adminState.shipping.rates.length > 0
      ? adminState.shipping.rates
      : WILAYAS.map((w) => ({
          code: w.code,
          name: w.name_ar,
          name_fr: w.name_fr,
          homeFee: w.fee,
          deskFee: Math.max(250, w.fee - 150),
        }));

  const wilayaRate =
    rates.find((r) => r.code === store.lpSelectedWilaya) || rates[15] || rates[0];
  const baseShippingFee =
    store.lpDeliveryType === 'desk'
      ? Number(wilayaRate?.deskFee ?? 350)
      : Number(wilayaRate?.homeFee ?? 500);

  const isFreeShipping = isOfferApplied && offerFreeShipping;
  const shippingFee = isFreeShipping ? 0 : baseShippingFee;
  const total = subtotal + shippingFee;
  const totalSaved = Math.max(0, originalTotal - subtotal + (isFreeShipping ? baseShippingFee : 0));

  const isAr = store.lang === 'ar';
  const defaultOfferText = isAr
    ? `اشترِ ${offerMinQty} واحصلي على شحن مجاني`
    : `Prenez ${offerMinQty} = Livraison Gratuite`;
  const offerLabel = (cfg.offerText && String(cfg.offerText).trim()) || defaultOfferText;

  return {
    unitPrice,
    origUnitPrice,
    bundleQty,
    subtotal,
    originalTotal,
    baseShippingFee,
    shippingFee,
    isFreeShipping,
    isOfferApplied,
    offerEnabled,
    offerMinQty,
    offerLabel,
    total,
    totalSaved,
    wilayaRate,
    rates,
  };
}

/**
 * واجهة صفحة الهبوط الموحدة والهادئة والمريحة للعين:
 * تحتوي فقط على: المنتج مع صوره + الكمية والعرض الاختياري + معلومات الزبون
 */
function renderCleanLandingPageUI() {
  const isAr = store.lang === 'ar';
  const cfg = getActiveLandingItemConfig();
  const gallery =
    Array.isArray(cfg.gallery) && cfg.gallery.length > 0 ? cfg.gallery : [cfg.imageUrl];
  const activeIdx = store.lpGalleryIndex % gallery.length;
  const pricing = calculateLandingOrderPricing(cfg);

  const availableColors = cfg.colors;
  const availableSizes = cfg.sizes;
  const selectedColorSwatch = COLOR_SWATCHES[store.lpSelectedColor];
  const selectedColorLabel = selectedColorSwatch
    ? isAr
      ? selectedColorSwatch.label_ar
      : selectedColorSwatch.label_fr
    : store.lpSelectedColor;

  return `
    <div class="min-h-screen bg-[#FAF8F9] pb-12 animate-screen-enter">
      <div class="max-w-4xl mx-auto px-3 sm:px-6 pt-3 sm:pt-5">
        <!-- شريط علوي هادئ وبسيط للعودة للمتجر -->
        <div class="flex items-center justify-between mb-3 sm:mb-4">
          <button
            type="button"
            data-action="go-back"
            class="px-3.5 py-1.5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#27272A] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span>${isAr ? '→ العودة للمتجر' : '← Retour à la boutique'}</span>
          </button>

          <button
            type="button"
            data-action="share-product"
            class="px-3 py-1.5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#52525B] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span>${isAr ? 'مشاركة الرابط' : 'Partager'}</span>
          </button>
        </div>

        <!-- الشبكة الرئيسية المريحة للعين: (1) المنتج وصوره + (2) الكمية ومعلومات الزبون فقط -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          <!-- القسم الأول: المنتج مع صوره -->
          <div class="md:col-span-6 bg-white rounded-2xl border border-[#EAE6E8] p-3 sm:p-4 shadow-2xs">
            <div
              id="lp-gallery-swipe-box"
              data-swipe-gallery="lp"
              data-active-index="${activeIdx}"
              data-total-slides="${gallery.length}"
              class="ss-insta-gallery-box rounded-xl bg-[#F7F5F6]"
            >
              <div
                class="ss-insta-track"
                style="transform: translate3d(-${activeIdx * 100}%, 0, 0);"
              >
                ${gallery
                  .map(
                    (imgSrc, idx) => `
                  <div class="ss-insta-slide" data-slide-index="${idx}">
                    <img
                      src="${imgSrc}"
                      alt="${cfg.title} - ${idx + 1}"
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
                  data-action="gallery-step"
                  data-dir="-1"
                  class="hidden md:flex absolute left-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#18181B] shadow-xs items-center justify-center text-base font-bold cursor-pointer"
                  aria-label="Previous photo"
                >
                  ‹
                </button>
                <button
                  type="button"
                  data-action="gallery-step"
                  data-dir="1"
                  class="hidden md:flex absolute right-2.5 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#18181B] shadow-xs items-center justify-center text-base font-bold cursor-pointer"
                  aria-label="Next photo"
                >
                  ›
                </button>
                <span
                  data-gallery-counter
                  dir="ltr"
                  class="absolute bottom-2.5 end-2.5 z-10 px-2.5 py-0.5 rounded-full bg-black/45 backdrop-blur-xs text-white text-[11px] font-semibold tabular-nums pointer-events-none"
                >
                  ${activeIdx + 1}/${gallery.length}
                </span>
              `
                  : ''
              }
            </div>

            ${
              gallery.length > 1
                ? `<div class="mt-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                    ${gallery
                      .map(
                        (imgUrl, idx) => `
                        <button
                          type="button"
                          data-action="lp-select-thumb"
                          data-index="${idx}"
                          class="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                            activeIdx === idx
                              ? 'border-[#DE1B61] scale-105'
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

            <!-- اسم المنتج والسعر والوصف المختصر بهدوء ووضوح -->
            <div class="mt-3.5 pt-3 border-t border-[#F1EEF0]">
              <h1 class="text-base sm:text-xl font-bold text-[#18181B] leading-snug">
                ${cfg.title}
              </h1>

              <div class="mt-2 flex items-baseline gap-2.5 tabular-nums">
                <span class="text-xl sm:text-2xl font-extrabold text-[#D81B60]">
                  ${formatDA(pricing.unitPrice, store.lang)}
                </span>
                ${
                  pricing.origUnitPrice > pricing.unitPrice
                    ? `<span class="text-xs sm:text-sm text-[#71717A] line-through">
                        ${formatDA(pricing.origUnitPrice, store.lang)}
                      </span>`
                    : ''
                }
              </div>

              ${
                cfg.description
                  ? `<p class="mt-2 text-xs sm:text-sm text-[#52525B] leading-relaxed">
                      ${cfg.description}
                    </p>`
                  : ''
              }
            </div>
          </div>

          <!-- القسم الثاني: المقاس والكمية والعرض الاختياري ومعلومات الزبون فقط -->
          <div id="lp-order-form-anchor" class="md:col-span-6 bg-white rounded-2xl border border-[#EAE6E8] p-4 sm:p-5 shadow-2xs">
            <h2 class="text-base sm:text-lg font-bold text-[#18181B] pb-3 border-b border-[#F1EEF0]">
              ${isAr ? 'معلومات الطلب والزبون' : 'Détails de la commande'}
            </h2>

            <form id="storefront-lp-order-form" data-lp-id="${cfg.id}" class="mt-3.5 space-y-4">
              
              <!-- 1. المقاس واللون -->
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-bold text-[#3F3F46] mb-1.5">
                    ${isAr ? 'المقاس:' : 'Pointure :'} <strong id="lp-selected-size-label" class="text-[#D81B60]">${store.lpSelectedSize}</strong>
                  </label>
                  <div class="grid grid-cols-6 gap-1.5 tabular-nums">
                    ${availableSizes
                      .map((sz) => {
                        const active = Number(store.lpSelectedSize) === Number(sz);
                        return `
                          <button
                            type="button"
                            data-action="lp-select-size"
                            data-size="${sz}"
                            class="py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                              active
                                ? 'border-2 border-[#D81B60] bg-[#FDF2F6] text-[#D81B60]'
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

                <div class="flex items-center justify-between flex-wrap gap-2 pt-1">
                  <span class="text-xs font-bold text-[#3F3F46]">
                    ${isAr ? 'اللون:' : 'Couleur :'} <strong id="lp-selected-color-label" class="text-[#18181B]">${selectedColorLabel}</strong>
                  </span>
                  <div class="flex items-center gap-2">
                    ${availableColors
                      .map((cName) => {
                        const sw = COLOR_SWATCHES[cName];
                        const hex = sw ? sw.hex : '#F38BA8';
                        const active = store.lpSelectedColor === cName;
                        return `
                          <button
                            type="button"
                            data-action="lp-select-color"
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
                      data-action="lp-qty-step"
                      data-step="-1"
                      class="w-9 h-8 rounded-lg bg-white border border-[#E4E4E7] text-[#18181B] font-bold text-base flex items-center justify-center hover:bg-[#F4F4F5] active:scale-95 transition-all cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span id="lp-qty-value" class="w-11 text-center text-sm font-extrabold text-[#18181B]">
                      ${pricing.bundleQty}
                    </span>
                    <button
                      type="button"
                      data-action="lp-qty-step"
                      data-step="1"
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
                    id="lp-optional-offer-btn"
                    data-action="lp-toggle-offer"
                    data-min-qty="${pricing.offerMinQty}"
                    class="w-full p-3 rounded-xl border text-start flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
                      pricing.isOfferApplied
                        ? 'border-2 border-[#10B981] bg-[#ECFDF5]/60 text-[#065F46]'
                        : 'border-[#E4E4E7] bg-[#FAF8F9] hover:border-[#D81B60]/40 text-[#27272A]'
                    }"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span
                        id="lp-offer-check-circle"
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
                          ${isAr ? 'عرض اختياري:' : 'Offre optionnelle :'} ${pricing.offerLabel}
                        </span>
                      </div>
                    </div>

                    <span
                      id="lp-offer-badge"
                      class="px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
                        pricing.isOfferApplied
                          ? 'bg-[#10B981] text-white'
                          : 'bg-white border border-[#E4E4E7] text-[#D81B60]'
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

              <!-- 3. معلومات الزبون فقط (واضحة ومريحة للعين) -->
              <div class="pt-3 border-t border-[#F1EEF0] space-y-3">
                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                    ${isAr ? 'الاسم واللقب' : 'Nom et Prénom'} <span class="text-[#D81B60]">*</span>
                  </label>
                  <input
                    name="fullName"
                    type="text"
                    required
                    autocomplete="name"
                    placeholder="${isAr ? 'أدخلي الاسم الكامل' : 'Votre nom complet'}"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-medium text-[#18181B] focus:border-[#D81B60] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                    ${isAr ? 'رقم الهاتف' : 'Numéro de téléphone'} <span class="text-[#D81B60]">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    inputmode="tel"
                    required
                    autocomplete="tel"
                    dir="ltr"
                    placeholder="0550 00 00 00"
                    class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-semibold text-[#18181B] tabular-nums focus:border-[#D81B60] focus:bg-white focus:outline-none transition-colors"
                  />
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                      ${isAr ? 'الولاية' : 'Wilaya'} <span class="text-[#D81B60]">*</span>
                    </label>
                    <select
                      id="lp-wilaya-select"
                      name="wilayaCode"
                      required
                      class="w-full px-3 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-semibold text-[#18181B] focus:border-[#D81B60] focus:bg-white focus:outline-none transition-colors"
                    >
                      ${pricing.rates
                        .map((w) => {
                          const wName = isAr ? w.name : w.name_fr || w.name;
                          return `<option value="${w.code}" ${
                            w.code === store.lpSelectedWilaya ? 'selected' : ''
                          }>${w.code} - ${wName}</option>`;
                        })
                        .join('')}
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-[#3F3F46] mb-1">
                      ${isAr ? 'البلدية / العنوان' : 'Commune / Adresse'} <span class="text-[#D81B60]">*</span>
                    </label>
                    <input
                      id="lp-address-input"
                      name="address"
                      type="text"
                      required
                      placeholder="${
                        store.lpDeliveryType === 'desk'
                          ? isAr
                            ? 'اسم البلدية أو مكتب التوصيل'
                            : 'Commune ou bureau Stop-Desk'
                          : isAr
                          ? 'اسم البلدية أو الحي'
                          : 'Commune ou quartier'
                      }"
                      class="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F9] border border-[#E4E4E7] text-sm font-medium text-[#18181B] focus:border-[#D81B60] focus:bg-white focus:outline-none transition-colors"
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
                      data-action="lp-select-delivery"
                      data-delivery="home"
                      class="p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
                        store.lpDeliveryType === 'home'
                          ? 'border-2 border-[#D81B60] bg-[#FDF2F6]/60 text-[#18181B]'
                          : 'border-[#E4E4E7] bg-[#FAF8F9] text-[#52525B]'
                      }"
                    >
                      <span>${isAr ? 'التوصيل للمنزل' : 'À Domicile'}</span>
                      <strong id="lp-home-fee-label" class="text-[#D81B60]">
                        ${
                          pricing.isFreeShipping
                            ? isAr
                              ? 'مجاني'
                              : '0 DA'
                            : formatDA(pricing.wilayaRate?.homeFee ?? 500, store.lang)
                        }
                      </strong>
                    </button>

                    <button
                      type="button"
                      data-action="lp-select-delivery"
                      data-delivery="desk"
                      class="p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
                        store.lpDeliveryType === 'desk'
                          ? 'border-2 border-[#D81B60] bg-[#FDF2F6]/60 text-[#18181B]'
                          : 'border-[#E4E4E7] bg-[#FAF8F9] text-[#52525B]'
                      }"
                    >
                      <span>${isAr ? 'مكتب التوصيل' : 'Stop-Desk'}</span>
                      <strong id="lp-desk-fee-label" class="text-[#D81B60]">
                        ${
                          pricing.isFreeShipping
                            ? isAr
                              ? 'مجاني'
                              : '0 DA'
                            : formatDA(pricing.wilayaRate?.deskFee ?? 350, store.lang)
                        }
                      </strong>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 4. ملخص المبلغ الفرعي والإجمالي قبل التأكيد -->
              <div class="p-3.5 rounded-xl bg-[#FAF8F9] border border-[#EAE6E8] space-y-1.5 tabular-nums">
                <div class="flex items-center justify-between text-xs text-[#52525B]">
                  <span>${isAr ? 'المبلغ الفرعي:' : 'Sous-total :'}</span>
                  <strong id="lp-summary-subtotal" class="text-[#18181B]">${formatDA(pricing.subtotal, store.lang)}</strong>
                </div>
                <div class="flex items-center justify-between text-xs text-[#52525B]">
                  <span id="lp-summary-shipping-label">
                    ${
                      store.lpDeliveryType === 'desk'
                        ? isAr
                          ? 'سعر التوصيل (للمكتب):'
                          : 'Livraison (Stop-Desk) :'
                        : isAr
                        ? 'سعر التوصيل (للمنزل):'
                        : 'Livraison (Domicile) :'
                    }
                  </span>
                  <strong id="lp-summary-shipping-fee" class="text-[#18181B]">
                    ${
                      pricing.isFreeShipping
                        ? `<span class="text-[#059669] font-bold">${isAr ? 'مجاني (0 د.ج)' : 'Gratuite (0 DA)'}</span>`
                        : formatDA(pricing.shippingFee, store.lang)
                    }
                  </strong>
                </div>
                <div class="pt-2 border-t border-[#E4E4E7] flex items-center justify-between">
                  <span class="text-xs sm:text-sm font-bold text-[#18181B]">
                    ${isAr ? 'المبلغ الإجمالي:' : 'Total à payer :'}
                  </span>
                  <strong id="lp-summary-total" class="text-base sm:text-lg font-extrabold text-[#D81B60]">
                    ${formatDA(pricing.total, store.lang)}
                  </strong>
                </div>
              </div>

              <!-- 5. زر تأكيد الطلب -->
              <button
                type="submit"
                class="w-full py-3.5 px-5 rounded-xl bg-[#D81B60] hover:bg-[#BE123C] text-white text-sm sm:text-base font-bold flex items-center justify-center shadow-xs active:scale-99 transition-all cursor-pointer"
              >
                <span id="lp-submit-btn-label">${
                  isAr
                    ? `تأكيد الطلب — ${formatDA(pricing.total, 'ar')}`
                    : `Confirmer la commande — ${formatDA(pricing.total, 'fr')}`
                }</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPDPScreen() {
  const t = getT();
  const isAr = store.lang === 'ar';
  const product = store.getActiveProduct();

  const gallery =
    Array.isArray(product.gallery) && product.gallery.length > 0
      ? product.gallery.filter(Boolean)
      : [product.image].filter(Boolean);

  const activeIdx = (store.pdpGalleryIndex || 0) % gallery.length;
  const prodName = isAr
    ? product.name_ar || product.name || product.name_fr
    : product.name_fr || product.name || product.name_ar;
  const prodDesc = isAr
    ? product.description_ar || ''
    : product.description_fr || '';

  const availableColors =
    Array.isArray(product.colors) && product.colors.length > 0
      ? product.colors
      : ['Rose', 'Beige', 'Noir'];

  const availableSizes =
    Array.isArray(product.sizes) && product.sizes.length > 0
      ? product.sizes
      : [36, 37, 38, 39, 40, 41];

  if (!availableColors.includes(store.pdpSelectedColor)) {
    store.pdpSelectedColor = availableColors[0] || 'Rose';
  }
  if (!availableSizes.includes(store.pdpSelectedSize)) {
    store.pdpSelectedSize =
      availableSizes.includes(37) ? 37 : availableSizes[0] || 37;
  }

  const selectedColorSwatch = COLOR_SWATCHES[store.pdpSelectedColor];
  const selectedColorLabel = selectedColorSwatch
    ? isAr
      ? selectedColorSwatch.label_ar
      : selectedColorSwatch.label_fr
    : store.pdpSelectedColor;

  const isWishlisted = store.isWishlisted(product.id);
  const isOutOfStock = Number(product.stock) === 0;
  const isLowStock = Number(product.stock) > 0 && Number(product.stock) < 5;

  // منتجات مقترحة من نفس التشكيلة
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || !product.category)
  ).slice(0, 4);

  return `
    <div class="min-h-screen bg-[#FAF8F9] pb-16 animate-screen-enter">
      <div class="max-w-6xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">
        
        <!-- الشريط العلوي للتنقل والمشاركة -->
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <button
            type="button"
            data-action="go-back"
            class="px-3.5 py-1.5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#27272A] text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <span>${isAr ? '→ الرجوع' : '← Retour'}</span>
          </button>

          <div class="flex items-center gap-2">
            <button
              type="button"
              data-action="toggle-wishlist"
              data-id="${product.id}"
              class="w-9 h-9 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                isWishlisted ? 'text-[#DE1B61]' : 'text-[#71717A]'
              }"
              title="${isAr ? 'المفضلة' : 'Favoris'}"
            >
              <svg class="w-5 h-5 ${isWishlisted ? 'fill-[#DE1B61]' : 'fill-none'}" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <button
              type="button"
              data-action="share-product"
              class="px-3 py-1.5 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#D4D4D8] text-[#52525B] text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
              <span>${t.pdp.share}</span>
            </button>
          </div>
        </div>

        <!-- شبكة تفاصيل المنتج الرئيسية -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          
          <!-- العمود الأيسر: معرض الصور الاحترافي المتجاوب -->
          <div class="lg:col-span-7 bg-white rounded-3xl border border-[#EAE6E8] p-3 sm:p-5 shadow-2xs">
            <div
              id="pdp-gallery-swipe-box"
              data-swipe-gallery="pdp"
              data-active-index="${activeIdx}"
              data-total-slides="${gallery.length}"
              class="ss-insta-gallery-box rounded-2xl bg-[#F7F5F6] overflow-hidden"
            >
              <div
                class="ss-insta-track"
                style="transform: translate3d(-${activeIdx * 100}%, 0, 0);"
              >
                ${gallery
                  .map(
                    (imgSrc, idx) => `
                  <div class="ss-insta-slide" data-slide-index="${idx}">
                    <img
                      src="${imgSrc}"
                      alt="${prodName} - ${idx + 1}"
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
                  data-action="gallery-step"
                  data-dir="-1"
                  class="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#18181B] shadow-md items-center justify-center text-lg font-bold cursor-pointer transition-transform hover:scale-105"
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  data-action="gallery-step"
                  data-dir="1"
                  class="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/95 hover:bg-white text-[#18181B] shadow-md items-center justify-center text-lg font-bold cursor-pointer transition-transform hover:scale-105"
                  aria-label="Next"
                >
                  ›
                </button>
                <span
                  data-gallery-counter
                  dir="ltr"
                  class="absolute bottom-3 end-3 z-10 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xs text-white text-xs font-semibold tabular-nums pointer-events-none"
                >
                  ${activeIdx + 1}/${gallery.length}
                </span>
              `
                  : ''
              }
            </div>

            <!-- شريط الصور المصغرة إذا توفرت عدة صور -->
            ${
              gallery.length > 1
                ? `<div class="mt-3 flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                    ${gallery
                      .map(
                        (imgUrl, idx) => `
                        <button
                          type="button"
                          data-action="pdp-gallery-dot"
                          data-index="${idx}"
                          class="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
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
          </div>

          <!-- العمود الأيمن: تفاصيل الحذاء وخيارات الشراء وزر أضف إلى السلة -->
          <div class="lg:col-span-5 bg-white rounded-3xl border border-[#EAE6E8] p-4 sm:p-6 shadow-2xs space-y-5">
            
            <!-- عنوان المنتج والتصنيف والشارة -->
            <div>
              <div class="flex items-center justify-between gap-2 mb-1.5">
                <span class="text-xs font-bold tracking-wider uppercase text-[#DE1B61]">
                  ${product.category || 'ShoeStyle'}
                </span>
                <span>
                  ${
                    isOutOfStock
                      ? `<span class="px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-bold">${isAr ? 'نفد من المخزون' : 'Épuisé'}</span>`
                      : isLowStock
                      ? `<span class="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">${isAr ? `متبقي ${product.stock} فقط` : `Plus que ${product.stock} en stock`}</span>`
                      : `<span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">${isAr ? 'متوفر بالمخزون' : 'En stock'}</span>`
                  }
                </span>
              </div>

              <h1 class="text-xl sm:text-2xl font-black text-[#18181B] leading-snug">
                ${prodName}
              </h1>

              <!-- السعر والخصم -->
              <div class="mt-3 flex items-baseline gap-3 tabular-nums">
                <span class="text-2xl sm:text-3xl font-black text-[#DE1B61]">
                  ${formatDA(product.price, store.lang)}
                </span>
                ${
                  product.originalPrice && product.originalPrice > product.price
                    ? `<span class="text-sm sm:text-base text-[#8E8E93] line-through">
                        ${formatDA(product.originalPrice, store.lang)}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-[#DE1B61] text-white text-xs font-bold">
                        -${product.discountPercent || Math.round((1 - product.price / product.originalPrice) * 100)}%
                      </span>`
                    : ''
                }
              </div>
            </div>

            <hr class="border-[#F1EEF0]" />

            <!-- اختيار اللون -->
            <div>
              <label class="block text-xs font-bold text-[#3F3F46] mb-2">
                ${t.pdp.colorLabel} <span id="pdp-selected-color-label" class="text-[#DE1B61] font-extrabold">${selectedColorLabel}</span>
              </label>
              <div class="flex items-center gap-2.5 flex-wrap">
                ${availableColors
                  .map((c) => {
                    const swatch = COLOR_SWATCHES[c] || { hex: '#D2B48C', label_ar: c, label_fr: c };
                    const isActive = store.pdpSelectedColor === c;
                    return `
                      <button
                        type="button"
                        data-action="pdp-select-color"
                        data-color="${c}"
                        class="ss-color-swatch ${isActive ? 'active' : 'border-black/15'}"
                        style="--swatch-color: ${swatch.hex}; background-color: ${swatch.hex}; width: 34px; height: 34px;"
                        title="${isAr ? swatch.label_ar : swatch.label_fr}"
                      ></button>
                    `;
                  })
                  .join('')}
              </div>
            </div>

            <!-- اختيار المقاس -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <label class="text-xs font-bold text-[#3F3F46]">
                  ${t.pdp.sizeLabel} <span id="pdp-selected-size-label" class="text-[#DE1B61] font-extrabold">${store.pdpSelectedSize}</span>
                </label>
              </div>
              <div class="grid grid-cols-6 gap-2 tabular-nums">
                ${availableSizes
                  .map((sz) => {
                    const isActive = Number(store.pdpSelectedSize) === Number(sz);
                    return `
                      <button
                        type="button"
                        data-action="pdp-select-size"
                        data-size="${sz}"
                        class="py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          isActive
                            ? 'border-2 border-[#DE1B61] text-[#DE1B61] bg-[#FCE8EE]/40 animate-pop-spring'
                            : 'border-[#E4E4E7] text-[#18181B] bg-white hover:border-[#D4D4D8]'
                        }"
                      >
                        ${sz}
                      </button>
                    `;
                  })
                  .join('')}
              </div>
            </div>

            <hr class="border-[#F1EEF0]" />

            <!-- الأزرار الرئيسية للشراء: أضف إلى السلة (الزر الأساسي) + اطلب الآن -->
            <div class="space-y-2.5 pt-1">
              <button
                type="button"
                data-action="pdp-add-to-cart"
                ${isOutOfStock ? 'disabled' : ''}
                class="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-[#DE1B61] to-[#E53575] hover:from-[#C71555] hover:to-[#DE1B61] active:scale-[0.98] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#DE1B61]/25 transition-all cursor-pointer ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }"
              >
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <span>${isOutOfStock ? (isAr ? 'نفد من المخزون' : 'Produit épuisé') : t.pdp.addToCart}</span>
              </button>

              <button
                type="button"
                data-action="pdp-buy-now"
                ${isOutOfStock ? 'disabled' : ''}
                class="w-full py-3 px-6 rounded-2xl bg-[#18181B] hover:bg-black active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                }"
              >
                <span>${isAr ? 'شراء فوري / اطلب الآن' : 'Acheter maintenant'}</span>
                <span>→</span>
              </button>
            </div>

            <!-- ميزات وضمانات الشراء (الثقة والأمان) -->
            <div class="grid grid-cols-3 gap-2 pt-2 border-t border-[#F1EEF0] text-center text-[10px] sm:text-xs text-[#52525B]">
              <div class="p-2 rounded-xl bg-[#FAF8F9] flex flex-col items-center gap-1">
                <svg class="w-4 h-4 text-[#DE1B61]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span class="font-bold">${isAr ? 'توصيل 58 ولاية' : 'Livraison 58 wilayas'}</span>
              </div>

              <div class="p-2 rounded-xl bg-[#FAF8F9] flex flex-col items-center gap-1">
                <svg class="w-4 h-4 text-[#DE1B61]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
                <span class="font-bold">${isAr ? 'الدفع عند الاستلام' : 'Paiement à la livraison'}</span>
              </div>

              <div class="p-2 rounded-xl bg-[#FAF8F9] flex flex-col items-center gap-1">
                <svg class="w-4 h-4 text-[#DE1B61]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10"></polyline>
                  <polyline points="1 20 1 14 7 14"></polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                <span class="font-bold">${isAr ? 'استبدال المقاس' : 'Échange garanti'}</span>
              </div>
            </div>

            <!-- الوصف إن وُجد -->
            ${
              prodDesc
                ? `<div class="pt-3 border-t border-[#F1EEF0]">
                    <h3 class="text-xs font-bold text-[#18181B] mb-1.5">${isAr ? 'وصف المنتج وتفاصيله:' : 'Description du produit :'}</h3>
                    <p class="text-xs sm:text-sm text-[#52525B] leading-relaxed">${prodDesc}</p>
                  </div>`
                : ''
            }
          </div>
        </div>

        <!-- قسم منتجات قد تعجبك -->
        ${
          relatedProducts.length > 0
            ? `<div class="mt-12 sm:mt-16 pt-8 border-t border-[#EAE6E8]">
                <div class="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 class="text-lg sm:text-xl font-bold text-[#18181B]">
                    ${isAr ? 'منتجات قد تنال إعجابك أيضاً' : 'Vous pourriez aussi aimer'}
                  </h2>
                  <button
                    type="button"
                    data-action="nav-screen"
                    data-screen="category"
                    class="text-xs sm:text-sm font-bold text-[#DE1B61] hover:underline cursor-pointer"
                  >
                    ${isAr ? 'عرض الكل ←' : 'Tout voir →'}
                  </button>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  ${relatedProducts.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
                </div>
              </div>`
            : ''
        }
      </div>
    </div>
  `;
}

function renderLandingScreen() {
  return renderCleanLandingPageUI();
}

/**
 * ÉCRAN 4 : MON PANIER
 */
function renderCartScreen() {
  const t = getT();
  const details = store.getCartDetails();

  if (details.items.length === 0) {
    return `
      <div class="max-w-xl mx-auto px-4 py-16 text-center animate-screen-enter">
        <div class="w-16 h-16 rounded-full bg-[#FCE8EE] text-[#DE1B61] flex items-center justify-center mx-auto mb-4 animate-float-soft">
          <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </div>
        <h2 class="text-xl font-bold text-[#18181B]">${t.cart.emptyTitle}</h2>
        <p class="text-xs sm:text-sm text-[#71717A] mt-1">
          ${t.cart.emptySub}
        </p>
        <button
          type="button"
          data-action="nav-screen"
          data-screen="home"
          class="mt-6 ss-btn-pink px-6 py-3 text-xs sm:text-sm"
        >
          ${t.cart.exploreBtn}
        </button>
      </div>
    `;
  }

  return `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex flex-col justify-between min-h-[calc(100vh-140px)] animate-screen-enter">
      <!-- Liste des articles du panier -->
      <div class="divide-y divide-black/8">
        ${details.items
          .map((item, idx) => {
            const wishlisted = store.isWishlisted(item.product.id);
            const prodName = store.lang === 'ar' ? item.product.name_ar : item.product.name_fr;
            const swatch = COLOR_SWATCHES[item.color];
            const colorLabel = swatch
              ? store.lang === 'ar'
                ? swatch.label_ar
                : swatch.label_fr
              : item.color;

            return `
              <div
                style="--i: ${idx};"
                class="py-4 flex gap-3.5 items-center animate-stagger-item"
              >
                <!-- Miniature carrée arrondie -->
                <img
                  src="${item.product.image}"
                  alt="${prodName}"
                  referrerpolicy="no-referrer"
                  class="w-22 h-22 sm:w-24 sm:h-24 rounded-2xl object-cover bg-[#F5F3F4] shrink-0 cursor-pointer transition-transform hover:scale-105"
                  data-action="open-pdp"
                  data-id="${item.product.id}"
                />

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <h3 class="text-sm sm:text-base font-bold text-[#18181B] truncate">
                        ${prodName}
                      </h3>
                      <p class="text-xs text-[#71717A] mt-0.5">
                        ${colorLabel} · ${t.cart.sizePrefix} ${item.size}
                      </p>
                    </div>

                    <button
                      type="button"
                      data-action="toggle-wishlist"
                      data-id="${item.product.id}"
                      class="text-[#71717A] hover:text-[#DE1B61] p-1 transition-transform active:scale-90"
                      aria-label="${t.nav.wishlist}"
                    >
                      <svg
                        class="w-4 h-4 ${
                          wishlisted
                            ? 'fill-[#DE1B61] text-[#DE1B61]'
                            : 'fill-none text-current'
                        }"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        stroke-width="1.9"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        />
                      </svg>
                    </button>
                  </div>

                  <p class="mt-1 text-xs sm:text-sm font-extrabold text-[#DE1B61] tabular-nums">
                    ${formatDA(item.product.price, store.lang)}
                  </p>

                  <!-- Stepper (− 1 +) et Total Ligne à droite -->
                  <div class="mt-2 flex items-center justify-between">
                    <div class="inline-flex items-center bg-[#F5F3F4] rounded-full px-1.5 py-0.5 border border-black/8">
                      <button
                        type="button"
                        data-action="cart-qty"
                        data-index="${item.index}"
                        data-delta="-1"
                        class="w-6 h-6 text-sm font-bold text-[#18181B] hover:text-[#DE1B61] transition-transform active:scale-75"
                        aria-label="Moins"
                      >−</button>
                      <span class="px-3 text-xs font-bold tabular-nums">${item.quantity}</span>
                      <button
                        type="button"
                        data-action="cart-qty"
                        data-index="${item.index}"
                        data-delta="1"
                        class="w-6 h-6 text-sm font-bold text-[#18181B] hover:text-[#DE1B61] transition-transform active:scale-75"
                        aria-label="Plus"
                      >+</button>
                    </div>

                    <span class="text-sm sm:text-base font-extrabold text-[#18181B] tabular-nums">
                      ${formatDA(item.lineTotal, store.lang)}
                    </span>
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>

      <!-- Résumé Sous-total / Livraison / Total + Bouton Passer la commande -->
      <div class="pt-4 border-t border-black/10 space-y-2 tabular-nums animate-stagger-item" style="--i: 3;">
        <div class="flex justify-between text-xs sm:text-sm text-[#52525B]">
          <span>${t.cart.subtotal}</span>
          <span class="font-bold text-[#18181B]">${formatDA(details.subtotal, store.lang)}</span>
        </div>
        <div class="flex justify-between text-xs sm:text-sm text-[#52525B]">
          <span>${t.cart.shipping}</span>
          <span class="font-bold text-[#18181B]">${formatDA(details.shippingFee, store.lang)}</span>
        </div>
        <div class="pt-2 border-t border-black/8 flex justify-between items-baseline">
          <span class="text-base sm:text-lg font-extrabold text-[#18181B]">${t.cart.total}</span>
          <span class="text-lg sm:text-xl font-extrabold text-[#18181B]">${formatDA(details.total, store.lang)}</span>
        </div>

        <div class="pt-3">
          <button
            type="button"
            data-action="nav-screen"
            data-screen="checkout"
            class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base flex items-center justify-center gap-2.5"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 9V7a5 5 0 0 0-10 0v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2zm-8-2a3 3 0 0 1 6 0v2H9V7z" />
            </svg>
            <span>${t.cart.checkoutBtn}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * ÉCRAN 5 : COMMANDE / LIVRAISON
 */
function renderCheckoutScreen() {
  const t = getT();
  const isAr = store.lang === 'ar';
  const customRates =
    Array.isArray(adminState?.shipping?.rates) && adminState.shipping.rates.length > 0
      ? adminState.shipping.rates
      : null;
  const details = store.getCartDetails(customRates);

  return `
    <div class="max-w-xl mx-auto px-5 py-5 animate-screen-enter">
      <!-- Barre d'étapes : Panier —— Livraison (Actif Rose) —— Paiement -->
      <div class="flex items-center justify-between max-w-xs mx-auto mb-7">
        <!-- Étape 1 : Panier -->
        <div class="flex flex-col items-center gap-1">
          <div class="w-7 h-7 rounded-full bg-[#FCE8EE] text-[#DE1B61] flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="21" r="1.5" />
              <circle cx="19" cy="21" r="1.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
            </svg>
          </div>
          <span class="text-[11px] text-[#52525B]">${t.checkout.stepCart}</span>
        </div>

        <div class="flex-1 h-[2px] bg-[#DE1B61] mx-2 -mt-4"></div>

        <!-- Étape 2 : Livraison (Active en rose) -->
        <div class="flex flex-col items-center gap-1">
          <div class="w-7 h-7 rounded-full bg-[#DE1B61] text-white flex items-center justify-center shadow-sm animate-pop-spring">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0 2c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4z" />
            </svg>
          </div>
          <span class="text-[11px] font-bold text-[#DE1B61]">${t.checkout.stepDelivery}</span>
        </div>

        <div class="flex-1 h-[1.5px] bg-black/15 mx-2 -mt-4"></div>

        <!-- Étape 3 : Paiement -->
        <div class="flex flex-col items-center gap-1">
          <div class="w-7 h-7 rounded-full bg-[#71717A] text-white flex items-center justify-center">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-[11px] text-[#52525B]">${t.checkout.stepPayment}</span>
        </div>
      </div>

      <!-- Titre section : Informations de livraison -->
      <div class="flex items-center gap-2 mb-4 animate-stagger-item" style="--i: 1;">
        <svg class="w-5 h-5 text-[#18181B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="1" y="3" width="15" height="13" rx="1" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
        <h2 class="text-sm sm:text-base font-bold text-[#18181B]">${t.checkout.sectionTitle}</h2>
      </div>

      <!-- Formulaire de commande -->
      <form id="shoestyle-checkout-form" class="space-y-4">
        <div class="animate-stagger-item" style="--i: 2;">
          <label for="checkout-name" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.fullName} <span class="text-[#DE1B61]">*</span>
          </label>
          <input
            id="checkout-name"
            name="fullName"
            type="text"
            required
            placeholder="${t.checkout.fullNamePlaceholder}"
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-all focus:border-[#DE1B61] focus:bg-white"
          />
        </div>

        <div class="animate-stagger-item" style="--i: 3;">
          <label for="checkout-phone" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.phone} <span class="text-[#DE1B61]">*</span>
          </label>
          <input
            id="checkout-phone"
            name="phone"
            type="tel"
            required
            placeholder="${t.checkout.phonePlaceholder}"
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] placeholder:text-[#A1A1AA] tabular-nums transition-all focus:border-[#DE1B61] focus:bg-white"
          />
        </div>

        <div class="animate-stagger-item" style="--i: 4;">
          <label for="checkout-wilaya" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${t.checkout.wilaya} <span class="text-[#DE1B61]">*</span>
          </label>
          <select
            id="checkout-wilaya"
            name="wilayaCode"
            required
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] transition-all focus:border-[#DE1B61] focus:bg-white"
          >
            <option value="" disabled>${t.checkout.wilayaPlaceholder}</option>
            ${WILAYAS.map(
              (w) => `
              <option value="${w.code}" ${
                w.code === store.selectedWilayaCode ? 'selected' : ''
              }>
                ${store.lang === 'ar' ? w.name_ar : w.name_fr}
              </option>
            `
            ).join('')}
          </select>
        </div>

        <!-- خيار طريقة التوصيل: إلى المنزل أم إلى المكتب (Stop-Desk) -->
        <div class="animate-stagger-item" style="--i: 4.5;">
          <label class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${isAr ? 'طريقة التوصيل' : 'Mode de livraison'} <span class="text-[#DE1B61]">*</span>
          </label>
          <div class="grid grid-cols-2 gap-2.5 tabular-nums">
            <button
              type="button"
              data-action="checkout-select-delivery"
              data-delivery="home"
              class="p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
                details.deliveryType === 'home'
                  ? 'border-2 border-[#DE1B61] bg-[#FCE8EE]/40 text-[#18181B] shadow-2xs'
                  : 'border-black/15 bg-[#FAFAFA] text-[#52525B] hover:border-black/30'
              }"
            >
              <span>🏠 ${isAr ? 'إلى المنزل' : 'À Domicile'}</span>
              <strong id="checkout-home-fee-label" class="text-[#DE1B61]">${formatDA(details.homeFee, store.lang)}</strong>
            </button>

            <button
              type="button"
              data-action="checkout-select-delivery"
              data-delivery="desk"
              class="p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
                details.deliveryType === 'desk'
                  ? 'border-2 border-[#DE1B61] bg-[#FCE8EE]/40 text-[#18181B] shadow-2xs'
                  : 'border-black/15 bg-[#FAFAFA] text-[#52525B] hover:border-black/30'
              }"
            >
              <span>🏢 ${isAr ? 'إلى المكتب' : 'Stop-Desk'}</span>
              <strong id="checkout-desk-fee-label" class="text-[#DE1B61]">${formatDA(details.deskFee, store.lang)}</strong>
            </button>
          </div>
        </div>

        <div class="animate-stagger-item" style="--i: 5;">
          <label id="checkout-address-label" for="checkout-address" class="block text-xs sm:text-sm font-semibold text-[#18181B] mb-1.5">
            ${
              details.deliveryType === 'desk'
                ? isAr
                  ? 'البلدية / مكتب التوصيل الأقرب إليكِ'
                  : 'Commune / Bureau de livraison souhaité'
                : t.checkout.address
            } <span class="text-[#DE1B61]">*</span>
          </label>
          <input
            id="checkout-address"
            name="address"
            type="text"
            required
            placeholder="${
              details.deliveryType === 'desk'
                ? isAr
                  ? 'اكتبي اسم البلدية أو مكتب التوصيل...'
                  : 'Indiquez votre commune ou bureau Stop-Desk...'
                : t.checkout.addressPlaceholder
            }"
            class="w-full px-4 py-3 rounded-xl bg-[#FAFAFA] border border-black/12 text-xs sm:text-sm text-[#18181B] placeholder:text-[#A1A1AA] transition-all focus:border-[#DE1B61] focus:bg-white"
          />
        </div>

        <!-- ملخص المبلغ الفرعي وسعر التوصيل والمبلغ الإجمالي قبل تأكيد الطلبية -->
        <div class="p-4 rounded-2xl bg-[#FDF5F7] border border-[#DE1B61]/20 space-y-2 tabular-nums animate-stagger-item" style="--i: 5.5;">
          <div class="flex items-center justify-between text-xs sm:text-sm text-[#52525B]">
            <span>${t.cart.subtotal} (${details.totalCount} ${isAr ? 'قطع' : 'articles'})</span>
            <strong id="checkout-summary-subtotal" class="text-[#18181B]">${formatDA(details.subtotal, store.lang)}</strong>
          </div>
          <div class="flex items-center justify-between text-xs sm:text-sm text-[#52525B]">
            <span id="checkout-summary-shipping-label">
              ${t.cart.shipping} (${
                details.deliveryType === 'desk'
                  ? isAr
                    ? 'إلى المكتب Stop-Desk'
                    : 'Bureau Stop-Desk'
                  : isAr
                  ? 'إلى المنزل'
                  : 'À Domicile'
              })
            </span>
            <strong id="checkout-summary-shipping-fee" class="text-[#18181B]">${formatDA(details.shippingFee, store.lang)}</strong>
          </div>
          <div class="pt-2.5 border-t border-[#DE1B61]/15 flex items-center justify-between">
            <div>
              <span class="text-sm sm:text-base font-extrabold text-[#18181B] block">
                ${t.cart.total}
              </span>
              <span class="text-[11px] text-[#15803D] font-bold">
                ✓ ${isAr ? 'الدفع نقداً عند استلام الطلبية' : 'Paiement à la livraison'}
              </span>
            </div>
            <strong id="checkout-summary-total" class="text-xl sm:text-2xl font-extrabold text-[#DE1B61]">
              ${formatDA(details.total, store.lang)}
            </strong>
          </div>
        </div>

        <div class="pt-2 animate-stagger-item" style="--i: 6;">
          <button
            type="submit"
            class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span id="checkout-submit-btn-label">${t.checkout.continueBtn} — ${formatDA(details.total, store.lang)}</span>
            <span>${getArrowNext()}</span>
          </button>
        </div>
      </form>
    </div>
  `;
}

/**
 * ÉCRAN 6 : COMMANDE CONFIRMÉE !
 */
function renderConfirmationScreen() {
  const t = getT();
  const order = store.lastConfirmedOrder;

  return `
    <div class="max-w-lg mx-auto px-6 py-8 text-center relative overflow-hidden animate-screen-enter">
      <!-- Confettis & Cœurs décoratifs animés -->
      <div class="flex justify-between items-center px-6 text-[#DE1B61] text-lg select-none" aria-hidden="true">
        <span class="animate-confetti" style="--i: 1; --rot: -25deg;">🎊</span>
        <span class="text-sm text-[#FBBF24] animate-confetti" style="--i: 2; --rot: 35deg;">✦</span>
        <span class="animate-confetti" style="--i: 3; --rot: -15deg;">♡</span>
        <span class="text-sm text-[#43A047] animate-confetti" style="--i: 4; --rot: 20deg;">✦</span>
        <span class="animate-confetti" style="--i: 5; --rot: 30deg;">🎉</span>
      </div>

      <!-- Grand cercle vert avec coche blanche rebondissante -->
      <div class="w-20 h-20 rounded-full bg-[#43A047] text-white flex items-center justify-center mx-auto mt-2 shadow-md animate-check-bounce">
        <svg class="w-11 h-11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 class="mt-5 text-2xl sm:text-3xl font-extrabold text-[#18181B] animate-stagger-item" style="--i: 1;">
        ${t.confirmation.title}
      </h2>
      <p class="mt-1.5 text-sm sm:text-base text-[#3F3F46] font-medium animate-stagger-item" style="--i: 2;">
        ${t.confirmation.thankYou} <span class="text-[#DE1B61] inline-block animate-pop-spring">♥</span>
      </p>

      ${
        order
          ? `<p class="mt-1 text-xs text-[#71717A] tabular-nums animate-stagger-item" style="--i: 3;">
              ${t.confirmation.refPrefix} #${order.id} · ${t.confirmation.amountDue} <strong>${formatDA(order.total, store.lang)}</strong>
            </p>`
          : ''
      }

      <!-- Illustration Sac Shopping Rose avec Escarpin Rose flottant -->
      <div class="my-7 relative flex items-center justify-center animate-float-soft">
        <span class="absolute left-8 top-6 text-2xl text-[#DE1B61]" aria-hidden="true">♡</span>
        <span class="absolute right-8 top-10 text-2xl text-[#DE1B61]" aria-hidden="true">♡</span>

        <div class="relative w-44 h-44 flex items-center justify-center">
          <!-- Anse du sac -->
          <div class="absolute top-3 w-16 h-10 rounded-t-full border-4 border-[#DE1B61]"></div>
          <!-- Corps du sac rose -->
          <div class="mt-6 w-36 h-32 rounded-b-xl rounded-t-md bg-gradient-to-b from-[#FBCFE8] to-[#F48FB1] shadow-md flex items-center justify-center relative border border-[#F48FB1]">
            ${renderHighHeelLogoSVG('w-16 h-16')}
          </div>
        </div>
      </div>

      <!-- Bouton Rose : Suivre ma commande -->
      <button
        type="button"
        data-action="nav-screen"
        data-screen="account"
        class="w-full py-3.5 px-6 ss-btn-pink text-sm sm:text-base flex items-center justify-center gap-2.5 animate-stagger-item"
        style="--i: 4;"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
        <span>${t.confirmation.trackOrderBtn}</span>
      </button>

      <!-- Lien Retour à l'accueil -->
      <button
        type="button"
        data-action="nav-screen"
        data-screen="home"
        class="mt-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#18181B] hover:text-[#DE1B61] transition-colors animate-stagger-item"
        style="--i: 5;"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
        <span>${t.confirmation.backHomeBtn}</span>
      </button>

      <!-- Signature finale : À bientôt sur ShoeStyle ♥ -->
      <div class="mt-7 pt-4 border-t border-[#DE1B61]/15 animate-stagger-item" style="--i: 6;">
        <p class="font-script text-2xl text-[#18181B]">
          — ${t.confirmation.byeCatch} <span class="font-bold">ShoeStyle</span> <span class="text-[#DE1B61]">♥</span> —
        </p>
      </div>
    </div>
  `;
}

/**
 * ÉCRANS FAVORIS & COMPTE
 */
function renderWishlistScreen() {
  const t = getT();
  const wished = PRODUCTS.filter((p) => store.wishlist.includes(p.id));
  return `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 animate-screen-enter">
      ${
        wished.length === 0
          ? `<div class="text-center py-14">
              <p class="text-lg font-bold text-[#18181B]">${t.wishlist.emptyTitle}</p>
              <p class="text-xs text-[#71717A] mt-1">${t.wishlist.emptySub}</p>
            </div>`
          : `<div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              ${wished.map((p, idx) => renderShoeStyleCard(p, idx)).join('')}
            </div>`
      }
    </div>
  `;
}

function renderAccountScreen() {
  const t = getT();

  return `
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5 animate-screen-enter">
      <div class="p-5 rounded-2xl bg-gradient-to-r from-[#FCE8EE] to-[#FDF5F7] border border-[#DE1B61]/15 flex items-center gap-4">
        ${renderHighHeelLogoSVG('w-12 h-12')}
        <div>
          <h2 class="text-base font-bold text-[#18181B]">${t.account.headerTitle}</h2>
          <p class="text-xs text-[#52525B]">${t.account.headerSub}</p>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-bold text-[#18181B] mb-3">${t.account.ordersTitle}</h3>
        ${
          store.orders.length === 0
            ? `<div class="p-6 rounded-2xl bg-[#FAFAFA] border border-black/8 text-center text-xs text-[#71717A]">
                ${t.account.noOrders}
              </div>`
            : `<div class="space-y-3">
                ${store.orders
                  .map(
                    (o, idx) => `
                    <div
                      style="--i: ${idx};"
                      class="animate-stagger-item p-4 rounded-2xl bg-white border border-black/8 shadow-2xs text-xs space-y-1.5"
                    >
                      <div class="flex justify-between font-bold text-[#18181B]">
                        <span>${t.account.orderPrefix} #${o.id}</span>
                        <span class="text-[#DE1B61] tabular-nums">${formatDA(o.total, store.lang)}</span>
                      </div>
                      <p class="text-[#52525B]">${o.customer.fullName} · ${o.customer.wilaya}</p>
                      <p class="text-[#43A047] font-semibold">✓ ${o.status}</p>
                    </div>
                  `
                  )
                  .join('')}
              </div>`
        }
      </div>
    </div>
  `;
}

/**
 * Barre inférieure Mobile bilingue
 */
function renderNavigationBars() {
  const t = getT();
  const details = store.getCartDetails();
  const screen = store.currentScreen;

  const bottomNav = document.getElementById('mobile-bottom-nav');
  if (bottomNav) {
    bottomNav.innerHTML = `
      <button
        type="button"
        data-action="nav-screen"
        data-screen="home"
        class="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'home' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="${
          screen === 'home' ? 'currentColor' : 'none'
        }" stroke="currentColor" stroke-width="1.9">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.home}</span>
      </button>

      <button
        type="button"
        data-action="nav-screen"
        data-screen="category"
        data-category="Talons"
        class="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'category' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.categories}</span>
      </button>

      <button
        type="button"
        data-action="nav-screen"
        data-screen="wishlist"
        class="relative flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'wishlist' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="${
          screen === 'wishlist' ? 'currentColor' : 'none'
        }" stroke="currentColor" stroke-width="1.9">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.wishlist}</span>
      </button>

      <button
        id="mobile-cart-trigger"
        type="button"
        data-action="nav-screen"
        data-screen="cart"
        class="relative flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'cart' || screen === 'checkout'
            ? 'text-[#DE1B61] font-bold'
            : 'text-[#52525B]'
        }"
      >
        <div class="relative">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
            <circle cx="9" cy="21" r="1.5" />
            <circle cx="19" cy="21" r="1.5" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.5 3h2.5l2.2 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 1.9-1.4L22 7H6" />
          </svg>
          <span class="ss-cart-badge absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#DE1B61] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
            ${details.totalCount}
          </span>
        </div>
        <span class="text-[10px] mt-0.5">${t.nav.cart}</span>
      </button>

      <button
        type="button"
        data-action="nav-screen"
        data-screen="account"
        class="flex flex-col items-center justify-center py-1 transition-transform active:scale-90 ${
          screen === 'account' ? 'text-[#DE1B61] font-bold' : 'text-[#52525B]'
        }"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        <span class="text-[10px] mt-0.5">${t.nav.account}</span>
      </button>
    `;
  }
}

function renderAll() {
  document.documentElement.lang = store.lang;
  document.documentElement.dir = store.lang === 'ar' ? 'rtl' : 'ltr';

  renderHeader();
  renderNavigationBars();

  const mainEl = document.getElementById('app-main');
  if (!mainEl) return;

  switch (store.currentScreen) {
    case 'home':
      mainEl.innerHTML = renderHomeScreen();
      break;
    case 'category':
      mainEl.innerHTML = renderCategoryScreen();
      break;
    case 'pdp':
      mainEl.innerHTML = renderPDPScreen();
      break;
    case 'landing':
      mainEl.innerHTML = renderLandingScreen();
      break;
    case 'cart':
      mainEl.innerHTML = renderCartScreen();
      break;
    case 'checkout':
      mainEl.innerHTML = renderCheckoutScreen();
      break;
    case 'confirmation':
      mainEl.innerHTML = renderConfirmationScreen();
      break;
    case 'wishlist':
      mainEl.innerHTML = renderWishlistScreen();
      break;
    case 'account':
      mainEl.innerHTML = renderAccountScreen();
      break;
    default:
      mainEl.innerHTML = renderHomeScreen();
  }

  requestAnimationFrame(() => initScrollReveal());
}

/**
 * تحديث استمارة صفحة الهبوط موضعياً (In-Place DOM Update) بدون إعادة بناء الصفحة أو تشغيل أنيميشن التحديث
 */
function refreshLandingScreenPreservingInputs() {
  if (store.currentScreen !== 'landing' && store.currentScreen !== 'pdp') return;
  const form = document.getElementById('storefront-lp-order-form');
  if (!form) return;

  const cfg = getActiveLandingItemConfig();
  const isAr = store.lang === 'ar';
  const pricing = calculateLandingOrderPricing(cfg);

  // 1. تحديث المقاس المختار
  const sizeLabel = document.getElementById('lp-selected-size-label');
  if (sizeLabel) sizeLabel.textContent = String(store.lpSelectedSize);
  form.querySelectorAll('[data-action="lp-select-size"]').forEach((btn) => {
    const sz = Number(btn.getAttribute('data-size'));
    const active = Number(store.lpSelectedSize) === sz;
    btn.className = `py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
      active
        ? 'border-2 border-[#D81B60] bg-[#FDF2F6] text-[#D81B60]'
        : 'border-[#E4E4E7] bg-white text-[#27272A] hover:border-[#D4D4D8]'
    }`;
  });

  // 2. تحديث اللون المختار
  const colorLabel = document.getElementById('lp-selected-color-label');
  if (colorLabel) {
    const sw = COLOR_SWATCHES[store.lpSelectedColor];
    colorLabel.textContent = sw ? (isAr ? sw.label_ar : sw.label_fr) : store.lpSelectedColor;
  }
  form.querySelectorAll('[data-action="lp-select-color"]').forEach((btn) => {
    const cName = btn.getAttribute('data-color');
    const active = store.lpSelectedColor === cName;
    btn.className = `ss-color-swatch cursor-pointer ${active ? 'active' : 'border-black/15'}`;
  });

  // 3. تحديث عداد الكمية وبطاقة العرض الاختياري
  const qtyValueEl = document.getElementById('lp-qty-value');
  if (qtyValueEl) qtyValueEl.textContent = String(pricing.bundleQty);

  const offerBtn = document.getElementById('lp-optional-offer-btn');
  if (offerBtn) {
    offerBtn.className = `w-full p-3 rounded-xl border text-start flex items-center justify-between gap-2.5 transition-all cursor-pointer ${
      pricing.isOfferApplied
        ? 'border-2 border-[#10B981] bg-[#ECFDF5]/60 text-[#065F46]'
        : 'border-[#E4E4E7] bg-[#FAF8F9] hover:border-[#D81B60]/40 text-[#27272A]'
    }`;
  }
  const offerCheck = document.getElementById('lp-offer-check-circle');
  if (offerCheck) {
    offerCheck.className = `w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors ${
      pricing.isOfferApplied
        ? 'bg-[#10B981] text-white'
        : 'border border-[#A1A1AA] bg-white text-transparent'
    }`;
  }
  const offerBadge = document.getElementById('lp-offer-badge');
  if (offerBadge) {
    offerBadge.className = `px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${
      pricing.isOfferApplied
        ? 'bg-[#10B981] text-white'
        : 'bg-white border border-[#E4E4E7] text-[#D81B60]'
    }`;
    offerBadge.textContent = pricing.isOfferApplied
      ? isAr
        ? 'شحن مجاني مفعّل'
        : 'Livraison 0 DA'
      : isAr
      ? `اختيار (${pricing.offerMinQty})`
      : `Choisir (${pricing.offerMinQty})`;
  }

  // 4. تحديث أزرار التوصيل (منزل / مكتب) وحقل العنوان
  form.querySelectorAll('[data-action="lp-select-delivery"]').forEach((btn) => {
    const deliv = btn.getAttribute('data-delivery');
    const active = store.lpDeliveryType === deliv;
    btn.className = `p-2.5 rounded-xl border text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
      active
        ? 'border-2 border-[#D81B60] bg-[#FDF2F6]/60 text-[#18181B]'
        : 'border-[#E4E4E7] bg-[#FAF8F9] text-[#52525B]'
    }`;
  });

  const homeFeeEl = document.getElementById('lp-home-fee-label');
  if (homeFeeEl) {
    homeFeeEl.textContent = pricing.isFreeShipping
      ? isAr
        ? 'مجاني'
        : '0 DA'
      : formatDA(pricing.wilayaRate?.homeFee ?? 500, store.lang);
  }
  const deskFeeEl = document.getElementById('lp-desk-fee-label');
  if (deskFeeEl) {
    deskFeeEl.textContent = pricing.isFreeShipping
      ? isAr
        ? 'مجاني'
        : '0 DA'
      : formatDA(pricing.wilayaRate?.deskFee ?? 350, store.lang);
  }

  const addrInput = document.getElementById('lp-address-input');
  if (addrInput instanceof HTMLInputElement) {
    addrInput.placeholder =
      store.lpDeliveryType === 'desk'
        ? isAr
          ? 'اسم البلدية أو مكتب التوصيل'
          : 'Commune ou bureau Stop-Desk'
        : isAr
        ? 'اسم البلدية أو الحي'
        : 'Commune ou quartier';
  }

  // 5. تحديث ملخص الأسعار وزر التأكيد
  const subEl = document.getElementById('lp-summary-subtotal');
  if (subEl) subEl.textContent = formatDA(pricing.subtotal, store.lang);

  const shipLabelEl = document.getElementById('lp-summary-shipping-label');
  if (shipLabelEl) {
    shipLabelEl.textContent =
      store.lpDeliveryType === 'desk'
        ? isAr
          ? 'سعر التوصيل (للمكتب):'
          : 'Livraison (Stop-Desk) :'
        : isAr
        ? 'سعر التوصيل (للمنزل):'
        : 'Livraison (Domicile) :';
  }

  const shipFeeEl = document.getElementById('lp-summary-shipping-fee');
  if (shipFeeEl) {
    shipFeeEl.innerHTML = pricing.isFreeShipping
      ? `<span class="text-[#059669] font-bold">${isAr ? 'مجاني (0 د.ج)' : 'Gratuite (0 DA)'}</span>`
      : formatDA(pricing.shippingFee, store.lang);
  }

  const totalEl = document.getElementById('lp-summary-total');
  if (totalEl) totalEl.textContent = formatDA(pricing.total, store.lang);

  const submitBtnLabel = document.getElementById('lp-submit-btn-label');
  if (submitBtnLabel) {
    submitBtnLabel.textContent = isAr
      ? `تأكيد الطلب — ${formatDA(pricing.total, 'ar')}`
      : `Confirmer la commande — ${formatDA(pricing.total, 'fr')}`;
  }
}

/**
 * تحديث شاشة إتمام الطلب (Checkout) موضعياً بدون تحديث الصفحة
 */
function refreshCheckoutScreenPreservingInputs() {
  if (store.currentScreen !== 'checkout') return;
  const form = document.getElementById('shoestyle-checkout-form');
  if (!form) return;

  const t = getT();
  const isAr = store.lang === 'ar';
  const customRates =
    Array.isArray(adminState?.shipping?.rates) && adminState.shipping.rates.length > 0
      ? adminState.shipping.rates
      : null;
  const details = store.getCartDetails(customRates);

  // 1. تحديث أزرار التوصيل (منزل / مكتب) وأسعارها
  form.querySelectorAll('[data-action="checkout-select-delivery"]').forEach((btn) => {
    const deliv = btn.getAttribute('data-delivery');
    const active = details.deliveryType === deliv;
    btn.className = `p-3 rounded-xl border text-xs sm:text-sm font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 transition-all cursor-pointer ${
      active
        ? 'border-2 border-[#DE1B61] bg-[#FCE8EE]/40 text-[#18181B] shadow-2xs'
        : 'border-black/15 bg-[#FAFAFA] text-[#52525B] hover:border-black/30'
    }`;
  });

  const homeFeeEl = document.getElementById('checkout-home-fee-label');
  if (homeFeeEl) homeFeeEl.textContent = formatDA(details.homeFee, store.lang);

  const deskFeeEl = document.getElementById('checkout-desk-fee-label');
  if (deskFeeEl) deskFeeEl.textContent = formatDA(details.deskFee, store.lang);

  // 2. تحديث عنوان وعبارة حقل العنوان
  const addrLabel = document.getElementById('checkout-address-label');
  if (addrLabel) {
    const labelText =
      details.deliveryType === 'desk'
        ? isAr
          ? 'البلدية / مكتب التوصيل الأقرب إليكِ'
          : 'Commune / Bureau de livraison souhaité'
        : t.checkout.address;
    addrLabel.innerHTML = `${labelText} <span class="text-[#DE1B61]">*</span>`;
  }

  const addrInput = document.getElementById('checkout-address');
  if (addrInput instanceof HTMLInputElement) {
    addrInput.placeholder =
      details.deliveryType === 'desk'
        ? isAr
          ? 'اكتبي اسم البلدية أو مكتب التوصيل...'
          : 'Indiquez votre commune ou bureau Stop-Desk...'
        : t.checkout.addressPlaceholder;
  }

  // 3. تحديث ملخص المبلغ الفرعي وسعر التوصيل والمبلغ الإجمالي وزر التأكيد
  const subEl = document.getElementById('checkout-summary-subtotal');
  if (subEl) subEl.textContent = formatDA(details.subtotal, store.lang);

  const shipLabelEl = document.getElementById('checkout-summary-shipping-label');
  if (shipLabelEl) {
    shipLabelEl.textContent = `${t.cart.shipping} (${
      details.deliveryType === 'desk'
        ? isAr
          ? 'إلى المكتب Stop-Desk'
          : 'Bureau Stop-Desk'
        : isAr
        ? 'إلى المنزل'
        : 'À Domicile'
    })`;
  }

  const shipFeeEl = document.getElementById('checkout-summary-shipping-fee');
  if (shipFeeEl) shipFeeEl.textContent = formatDA(details.shippingFee, store.lang);

  const totalEl = document.getElementById('checkout-summary-total');
  if (totalEl) totalEl.textContent = formatDA(details.total, store.lang);

  const submitBtnLabel = document.getElementById('checkout-submit-btn-label');
  if (submitBtnLabel) {
    submitBtnLabel.textContent = `${t.checkout.continueBtn} — ${formatDA(details.total, store.lang)}`;
  }
}

function updateHeroSlide(nextIndex) {
  heroSlideIndex = (nextIndex + HERO_SLIDES.length) % HERO_SLIDES.length;

  if (store.currentScreen !== 'home') {
    return;
  }

  const heroImg = document.getElementById('hero-banner-img');
  if (!heroImg) {
    return;
  }

  const slide = HERO_SLIDES[heroSlideIndex] || HERO_SLIDES[0];
  const slideKicker = store.lang === 'ar' ? slide.kicker_ar : slide.kicker_fr;
  const slideTitle = store.lang === 'ar' ? slide.titleHtml_ar : slide.titleHtml_fr;
  const slideSubtitle = store.lang === 'ar' ? slide.subtitle_ar : slide.subtitle_fr;
  const slideCta = store.lang === 'ar' ? slide.ctaLabel_ar : slide.ctaLabel_fr;
  const arrow = getArrowNext();

  const mobOverlay = document.getElementById('hero-mobile-overlay');
  const deskContent = document.getElementById('hero-desktop-content');

  // Smooth cross-fade transition
  heroImg.style.opacity = '0.35';
  if (mobOverlay) mobOverlay.style.opacity = '0.35';
  if (deskContent) deskContent.style.opacity = '0.35';

  setTimeout(() => {
    // Update image and restart gentle Ken Burns effect smoothly
    if (heroImg) {
      heroImg.src = slide.image;
      heroImg.classList.remove('animate-hero-zoom');
      // trigger reflow to restart CSS animation smoothly
      void heroImg.offsetWidth;
      heroImg.classList.add('animate-hero-zoom');
      heroImg.style.opacity = '1';
    }

    // Update Mobile overlay
    const mobTitle = document.getElementById('hero-mobile-title');
    if (mobTitle) mobTitle.innerHTML = slideTitle;
    const mobCta = document.getElementById('hero-mobile-cta');
    if (mobCta) mobCta.setAttribute('data-category', slide.targetCategory);
    const mobCtaLabel = document.getElementById('hero-mobile-cta-label');
    if (mobCtaLabel) mobCtaLabel.textContent = slideCta;
    const mobCtaArrow = document.getElementById('hero-mobile-cta-arrow');
    if (mobCtaArrow) mobCtaArrow.textContent = arrow;
    if (mobOverlay) mobOverlay.style.opacity = '1';

    // Update Desktop content
    const deskKicker = document.getElementById('hero-desktop-kicker');
    if (deskKicker) deskKicker.textContent = slideKicker;
    const deskTitle = document.getElementById('hero-desktop-title');
    if (deskTitle) deskTitle.innerHTML = slideTitle;
    const deskSub = document.getElementById('hero-desktop-subtitle');
    if (deskSub) deskSub.textContent = slideSubtitle;
    const deskCta = document.getElementById('hero-desktop-cta');
    if (deskCta) deskCta.setAttribute('data-category', slide.targetCategory);
    const deskCtaLabel = document.getElementById('hero-desktop-cta-label');
    if (deskCtaLabel) deskCtaLabel.textContent = slideCta;
    const deskCtaArrow = document.getElementById('hero-desktop-cta-arrow');
    if (deskCtaArrow) deskCtaArrow.textContent = arrow;
    if (deskContent) deskContent.style.opacity = '1';
  }, 160);

  // Update dots indicator in-place
  const dots = document.querySelectorAll('[data-action="hero-slide"]');
  dots.forEach((dot) => {
    const idx = Number(dot.getAttribute('data-index'));
    if (idx === heroSlideIndex) {
      dot.className =
        'transition-all duration-300 rounded-full w-5 h-2 bg-[#DE1B61]';
    } else {
      dot.className =
        'transition-all duration-300 rounded-full w-2 h-2 bg-[#18181B]/25 hover:bg-[#18181B]/50';
    }
  });
}

let lastGallerySwipeTime = 0;

/**
 * تحريك معرض الصور (بطاقة المنتج / صفحة المنتج / صفحة الهبوط) بانسيابية مع أنيميشن
 */
function setGallerySlideIndex(galleryBox, targetIndex) {
  if (!(galleryBox instanceof HTMLElement)) return;
  const total = Number(galleryBox.getAttribute('data-total-slides') || 1);
  if (total <= 1) return;

  const normalized = ((targetIndex % total) + total) % total;
  galleryBox.setAttribute('data-active-index', String(normalized));

  const track = galleryBox.querySelector('.ss-insta-track');
  if (track instanceof HTMLElement) {
    track.classList.remove('is-dragging');
    track.style.transform = `translate3d(-${normalized * 100}%, 0, 0)`;
  }

  // تفعيل أنيميشن ظهور الصورة النشطة
  const slides = galleryBox.querySelectorAll('.ss-insta-slide');
  slides.forEach((slide, idx) => {
    slide.classList.remove('is-swipe-animated');
    if (idx === normalized) {
      void slide.offsetWidth;
      slide.classList.add('is-swipe-animated');
    }
  });

  // تحديث عداد الصور (مثال: 2/4)
  const counterEl = galleryBox.querySelector('[data-gallery-counter]');
  if (counterEl) {
    counterEl.textContent = `${normalized + 1}/${total}`;
  }

  // تحديث النقاط السفلية داخل الصندوق
  const galleryType = galleryBox.getAttribute('data-swipe-gallery');
  const isPdp = galleryType === 'pdp';
  const dots = galleryBox.querySelectorAll('[data-action="gallery-dot"]');
  dots.forEach((dot) => {
    const dotIdx = Number(dot.getAttribute('data-index'));
    if (dotIdx === normalized) {
      dot.className = isPdp
        ? 'transition-all duration-300 rounded-full w-4 h-2 bg-[#DE1B61]'
        : 'transition-all duration-300 rounded-full w-3.5 h-1.5 bg-[#DE1B61]';
    } else {
      dot.className = isPdp
        ? 'transition-all duration-300 rounded-full w-2 h-2 bg-white/85 hover:bg-white'
        : 'transition-all duration-300 rounded-full w-1.5 h-1.5 bg-white/80 hover:bg-white';
    }
  });

  if (galleryType === 'pdp') {
    store.pdpGalleryIndex = normalized;
    document.querySelectorAll('[data-action="pdp-gallery-dot"]').forEach((thumb) => {
      const tIdx = Number(thumb.getAttribute('data-index'));
      if (tIdx === normalized) {
        thumb.className =
          'relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer border-[#DE1B61] scale-105 shadow-xs';
      } else {
        thumb.className =
          'relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer border-transparent opacity-70 hover:opacity-100';
      }
    });
  } else if (galleryType === 'lp') {
    store.lpGalleryIndex = normalized;
    document.querySelectorAll('[data-action="lp-select-thumb"]').forEach((thumb) => {
      const tIdx = Number(thumb.getAttribute('data-index'));
      if (tIdx === normalized) {
        thumb.className =
          'relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all border-[#DE1B61] scale-105';
      } else {
        thumb.className =
          'relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all border-transparent opacity-70';
      }
    });
  }
}

function updatePDPGallery(idx) {
  const pdpBox = document.getElementById('pdp-gallery-swipe-box');
  if (pdpBox) {
    setGallerySlideIndex(pdpBox, idx);
  } else {
    store.pdpGalleryIndex = idx;
  }
}

function updatePDPColorInPlace(color) {
  store.pdpSelectedColor = color;

  const colorLabelEl = document.getElementById('pdp-selected-color-label');
  if (colorLabelEl) {
    const swatch = COLOR_SWATCHES[color];
    colorLabelEl.textContent = swatch
      ? store.lang === 'ar'
        ? swatch.label_ar
        : swatch.label_fr
      : color;
  }

  const swatches = document.querySelectorAll('[data-action="pdp-select-color"]');
  swatches.forEach((btn) => {
    const btnColor = btn.getAttribute('data-color');
    if (btnColor === color) {
      btn.className = 'ss-color-swatch active';
    } else {
      btn.className = 'ss-color-swatch border-black/15';
    }
  });
}

function updatePDPSizeInPlace(size) {
  store.pdpSelectedSize = Number(size);

  const sizeLabel = document.getElementById('pdp-selected-size-label');
  if (sizeLabel) {
    sizeLabel.textContent = String(store.pdpSelectedSize);
  }

  const sizeBtns = document.querySelectorAll('[data-action="pdp-select-size"]');
  sizeBtns.forEach((btn) => {
    const btnSize = Number(btn.getAttribute('data-size'));
    if (btnSize === store.pdpSelectedSize) {
      btn.className =
        'py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer border-2 border-[#DE1B61] text-[#DE1B61] bg-[#FCE8EE]/40 animate-pop-spring';
    } else {
      btn.className =
        'py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer border-[#E4E4E7] text-[#18181B] bg-white hover:border-[#D4D4D8]';
    }
  });
}

function updateCategoryInPlace(updateBanner = false) {
  const t = getT();
  const filtered = getFilteredCategoryProducts();

  // Update products grid in-place
  const gridEl = document.getElementById('category-products-grid');
  if (gridEl) {
    gridEl.innerHTML = filtered
      .map((p, idx) => renderShoeStyleCard(p, idx))
      .join('');
  }

  // Update category pills active state
  const pills = document.querySelectorAll('[data-action="select-category-pill"]');
  pills.forEach((pill) => {
    const catId = pill.getAttribute('data-category');
    if (catId === store.activeCategory) {
      pill.className =
        'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all bg-[#18181B] text-white scale-105 shadow-xs';
    } else {
      pill.className =
        'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all bg-[#F5F3F4] text-[#52525B] hover:text-[#18181B]';
    }
  });

  if (updateBanner) {
    const activeCatObj =
      CATEGORIES.find((c) => c.id === store.activeCategory) || CATEGORIES[1];
    const catName =
      store.lang === 'ar' ? activeCatObj.name_ar : activeCatObj.name_fr;
    const catSub =
      store.lang === 'ar' ? activeCatObj.subtitle_ar : activeCatObj.subtitle_fr;
    const displayTitle =
      store.activeCategory === 'Tout' ? t.nav.all : catName;

    const headerTitleEl = document.getElementById('header-screen-title');
    if (headerTitleEl) headerTitleEl.textContent = displayTitle;

    const bannerTitleEl = document.getElementById('cat-banner-title');
    if (bannerTitleEl) bannerTitleEl.textContent = displayTitle;

    const bannerSubEl = document.getElementById('cat-banner-sub');
    if (bannerSubEl) bannerSubEl.textContent = catSub;

    const bannerImgEl = document.getElementById('cat-banner-img');
    if (bannerImgEl && bannerImgEl.getAttribute('src') !== activeCatObj.image) {
      bannerImgEl.style.opacity = '0.35';
      setTimeout(() => {
        bannerImgEl.src = activeCatObj.image;
        bannerImgEl.alt = catName;
        bannerImgEl.style.opacity = '0.9';
      }, 130);
    }
  }
}

function updateWishlistButtonsInPlace(productId, added) {
  const buttons = document.querySelectorAll(
    `[data-action="toggle-wishlist"][data-id="${productId}"]`
  );
  buttons.forEach((btn) => {
    const svg = btn.querySelector('svg');
    if (!svg) return;
    const isLarge = svg.classList.contains('w-5');
    const sizeCls = isLarge ? 'w-5 h-5' : 'w-4 h-4 transition-transform';
    svg.setAttribute(
      'class',
      `${sizeCls} ${
        added
          ? 'fill-[#DE1B61] text-[#DE1B61] animate-pop-spring'
          : 'fill-none text-[#18181B]'
      }`
    );
  });
}

function updateCartBadgesInPlace() {
  const details = store.getCartDetails();
  const badges = document.querySelectorAll('.ss-cart-badge');
  badges.forEach((b) => {
    b.textContent = String(details.totalCount);
  });
}

function startHeroAutoSlider() {
  if (heroIntervalId) clearInterval(heroIntervalId);
  heroIntervalId = setInterval(() => {
    if (store.currentScreen === 'home') {
      const next = (heroSlideIndex + 1) % HERO_SLIDES.length;
      updateHeroSlide(next);
    }
  }, 5000);
}

function setupEvents() {
  document.addEventListener('click', (e) => {
    const target =
      e.target instanceof Element ? e.target.closest('[data-action]') : null;
    if (!target) return;

    const action = target.getAttribute('data-action');
    const id = target.getAttribute('data-id');
    const t = getT();

    switch (action) {
      case 'select-review-star': {
        const chosen = Number(target.getAttribute('data-rating') || 5);
        store.reviewFormRating = Math.min(5, Math.max(1, chosen));
        const ratingInput = document.getElementById('review-rating-input');
        if (ratingInput instanceof HTMLInputElement) {
          ratingInput.value = String(store.reviewFormRating);
        }
        const badge = document.getElementById('review-rating-badge');
        if (badge) {
          badge.textContent = `${store.reviewFormRating}/5`;
        }
        const picker = document.getElementById('review-stars-picker');
        if (picker) {
          picker.querySelectorAll('[data-action="select-review-star"]').forEach((btn) => {
            const starVal = Number(btn.getAttribute('data-rating') || 0);
            if (starVal <= store.reviewFormRating) {
              btn.className =
                'w-6 h-6 rounded-lg border transition-all flex items-center justify-center text-xs bg-[#FFFBEB] border-[#FBBF24] text-[#FBBF24] shadow-2xs scale-105';
            } else {
              btn.className =
                'w-6 h-6 rounded-lg border transition-all flex items-center justify-center text-xs bg-[#F8F6F7] border-black/8 text-[#D4D4D8]';
            }
          });
        }
        break;
      }

      case 'toggle-language': {
        store.toggleLanguage();
        showToast(
          store.lang === 'ar'
            ? 'تم التحويل إلى اللغة العربية'
            : 'Passé en langue Française'
        );
        break;
      }

      case 'nav-screen': {
        const screen = target.getAttribute('data-screen') || 'home';
        const category = target.getAttribute('data-category');
        store.navigate(screen, { category });
        break;
      }

      case 'hero-slide': {
        const idx = Number(target.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          updateHeroSlide(idx);
          startHeroAutoSlider();
        }
        break;
      }

      case 'gallery-dot':
      case 'pdp-gallery-dot': {
        e.stopPropagation();
        const idx = Number(target.getAttribute('data-index'));
        const galleryBox = target.closest('[data-swipe-gallery]');
        if (!Number.isNaN(idx) && galleryBox instanceof HTMLElement) {
          setGallerySlideIndex(galleryBox, idx);
        } else if (!Number.isNaN(idx)) {
          updatePDPGallery(idx);
        }
        break;
      }

      case 'gallery-step': {
        e.stopPropagation();
        const stepDir = Number(target.getAttribute('data-dir') || 1);
        const galleryBox = target.closest('[data-swipe-gallery]');
        if (galleryBox instanceof HTMLElement) {
          const currentIdx = Number(galleryBox.getAttribute('data-active-index') || 0);
          setGallerySlideIndex(galleryBox, currentIdx + stepDir);
        }
        break;
      }

      case 'go-back': {
        store.goBack();
        break;
      }

      case 'toggle-search': {
        store.searchOpen = !store.searchOpen;
        renderHeader();
        if (store.searchOpen) {
          setTimeout(() => {
            const input = document.getElementById('global-search-input');
            if (input) input.focus();
          }, 50);
        }
        break;
      }

      case 'open-pdp': {
        if (Date.now() - lastGallerySwipeTime < 340) {
          e.preventDefault();
          break;
        }
        if (
          e instanceof MouseEvent &&
          (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)
        ) {
          // السماح بفتح رابط المنتج المستقل في تبويب جديد عند الضغط بـ Ctrl/Cmd أو زر الفأرة الأوسط
          break;
        }
        e.preventDefault();
        if (!id) break;
        store.navigate('pdp', { productId: id });
        break;
      }

      case 'open-landing': {
        if (!id) break;
        store.navigate('landing', { landingId: id });
        break;
      }

      case 'lp-select-thumb': {
        const idx = Number(target.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          const lpBox = document.getElementById('lp-gallery-swipe-box');
          if (lpBox) {
            setGallerySlideIndex(lpBox, idx);
          } else {
            store.lpGalleryIndex = idx;
            refreshLandingScreenPreservingInputs();
          }
        }
        break;
      }

      case 'lp-select-bundle': {
        const bundle = Number(target.getAttribute('data-bundle'));
        if (bundle >= 1) {
          store.lpSelectedBundle = bundle;
          refreshLandingScreenPreservingInputs();
        }
        break;
      }

      case 'lp-qty-step': {
        const step = Number(target.getAttribute('data-step') || 0);
        const currentQty = Math.max(1, Number(store.lpSelectedBundle || 1));
        const nextQty = Math.max(1, Math.min(20, currentQty + step));
        store.lpSelectedBundle = nextQty;
        refreshLandingScreenPreservingInputs();
        break;
      }

      case 'lp-toggle-offer': {
        const minQty = Math.max(2, Number(target.getAttribute('data-min-qty') || 2));
        const currentQty = Math.max(1, Number(store.lpSelectedBundle || 1));
        store.lpSelectedBundle = currentQty >= minQty ? 1 : minQty;
        refreshLandingScreenPreservingInputs();
        break;
      }

      case 'lp-select-color': {
        const color = target.getAttribute('data-color');
        if (color) {
          store.lpSelectedColor = color;
          store.pdpSelectedColor = color;
          refreshLandingScreenPreservingInputs();
        }
        break;
      }

      case 'lp-select-size': {
        const size = Number(target.getAttribute('data-size'));
        if (size) {
          store.lpSelectedSize = size;
          store.pdpSelectedSize = size;
          refreshLandingScreenPreservingInputs();
        }
        break;
      }

      case 'lp-select-delivery': {
        const deliv = target.getAttribute('data-delivery');
        if (deliv === 'home' || deliv === 'desk') {
          store.lpDeliveryType = deliv;
          refreshLandingScreenPreservingInputs();
        }
        break;
      }

      case 'checkout-select-delivery': {
        const deliv = target.getAttribute('data-delivery');
        if (deliv === 'home' || deliv === 'desk') {
          store.checkoutDeliveryType = deliv;
          refreshCheckoutScreenPreservingInputs();
        }
        break;
      }

      case 'lp-scroll-to-form': {
        const formAnchor = document.getElementById('lp-order-form-anchor');
        if (formAnchor) {
          formAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
          const firstInput = formAnchor.querySelector('input[name="fullName"]');
          if (firstInput instanceof HTMLInputElement) {
            setTimeout(() => firstInput.focus({ preventScroll: true }), 450);
          }
        }
        break;
      }

      case 'toggle-wishlist': {
        e.stopPropagation();
        if (!id) break;
        const isWishlistScreen = store.currentScreen === 'wishlist';
        const added = store.toggleWishlist(id, !isWishlistScreen);
        if (added) {
          spawnHeartBurst(target);
        }
        if (!isWishlistScreen) {
          updateWishlistButtonsInPlace(id, added);
        }
        showToast(added ? t.wishlist.added : t.wishlist.removed);
        break;
      }

      case 'quick-add-cart': {
        e.stopPropagation();
        if (!id) break;
        animateFlyToCart(target);
        const res = store.addToCart(id, undefined, undefined, 1, true);
        if (res) {
          updateCartBadgesInPlace();
          trackAdPixelEvent('AddToCart', {
            content_ids: [res.product.id],
            content_name: res.product.name_fr,
            value: res.product.price,
            currency: 'DZD',
          });
          const pName = store.lang === 'ar' ? res.product.name_ar : res.product.name_fr;
          showToast(`${pName} ${t.cart.addedToast}`);
        }
        break;
      }

      case 'select-category-pill': {
        const cat = target.getAttribute('data-category') || 'Talons';
        store.activeCategory = cat;
        store.syncUrlWithState(true);
        updateCategoryInPlace(true);
        break;
      }

      case 'reset-category-filters': {
        store.filterPrice = 'all';
        store.filterSize = 'all';
        store.filterColor = 'all';
        const priceSel = document.getElementById('filter-price-select');
        if (priceSel instanceof HTMLSelectElement) priceSel.value = 'all';
        const sizeSel = document.getElementById('filter-size-select');
        if (sizeSel instanceof HTMLSelectElement) sizeSel.value = 'all';
        const colorSel = document.getElementById('filter-color-select');
        if (colorSel instanceof HTMLSelectElement) colorSel.value = 'all';
        updateCategoryInPlace(false);
        showToast(t.filters.reset);
        break;
      }

      case 'pdp-select-color': {
        const color = target.getAttribute('data-color');
        if (color) {
          updatePDPColorInPlace(color);
        }
        break;
      }

      case 'pdp-select-size': {
        const size = Number(target.getAttribute('data-size'));
        if (size) {
          updatePDPSizeInPlace(size);
        }
        break;
      }

      case 'pdp-add-to-cart': {
        animateFlyToCart(target);
        const prod = store.getActiveProduct();
        const res = store.addToCart(
          prod.id,
          store.pdpSelectedSize,
          store.pdpSelectedColor,
          1,
          true
        );
        if (res) {
          updateCartBadgesInPlace();
          const pName = store.lang === 'ar' ? res.product.name_ar : res.product.name_fr;
          const swatch = COLOR_SWATCHES[res.color];
          const colorName = swatch
            ? store.lang === 'ar'
              ? swatch.label_ar
              : swatch.label_fr
            : res.color;
          showToast(`${pName} (${colorName}, ${t.cart.sizePrefix} ${res.size}) ${t.cart.addedToast}!`);
          setTimeout(() => {
            store.navigate('cart');
          }, 380);
        }
        break;
      }

      case 'pdp-buy-now': {
        const prod = store.getActiveProduct();
        const res = store.addToCart(
          prod.id,
          store.pdpSelectedSize,
          store.pdpSelectedColor,
          1,
          true
        );
        if (res) {
          updateCartBadgesInPlace();
          store.navigate('checkout');
        }
        break;
      }

      case 'share-product': {
        const prod = store.getActiveProduct();
        const slugOrId = (prod && (prod.slug || prod.id)) || store.activeProductId;
        const shareUrl = new URL(
          `?product=${encodeURIComponent(slugOrId)}`,
          window.location.href
        ).href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(shareUrl).catch(() => {});
        }
        showToast(t.pdp.shareCopied);
        break;
      }

      case 'cart-qty': {
        const index = Number(target.getAttribute('data-index'));
        const delta = Number(target.getAttribute('data-delta'));
        store.updateCartQuantity(index, delta);
        break;
      }

      case 'clear-cart': {
        store.clearCart();
        showToast(t.cart.clearedToast);
        break;
      }
    }
  });

  document.addEventListener('input', (e) => {
    const target = e.target;
    if (
      target instanceof HTMLInputElement &&
      target.id === 'global-search-input'
    ) {
      store.searchQuery = target.value;
      if (store.currentScreen !== 'category') {
        store.currentScreen = 'category';
        store.activeCategory = 'Tout';
        const mainEl = document.getElementById('app-main');
        if (mainEl) mainEl.innerHTML = renderCategoryScreen();
        renderNavigationBars();
      } else {
        updateCategoryInPlace(false);
      }
    }
  });

  document.addEventListener('change', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLSelectElement)) return;

    if (target.id === 'filter-price-select') {
      store.filterPrice = target.value;
      updateCategoryInPlace(false);
    } else if (target.id === 'filter-size-select') {
      store.filterSize = target.value;
      updateCategoryInPlace(false);
    } else if (target.id === 'filter-color-select') {
      store.filterColor = target.value;
      updateCategoryInPlace(false);
    } else if (target.id === 'checkout-wilaya') {
      store.selectedWilayaCode = target.value;
      refreshCheckoutScreenPreservingInputs();
    } else if (target.id === 'lp-wilaya-select') {
      store.lpSelectedWilaya = target.value;
      refreshLandingScreenPreservingInputs();
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;

    const t = getT();
    if (form.id === 'shoestyle-review-form') {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('reviewerName') || '').trim();
      const city = String(data.get('reviewerCity') || '').trim();
      const product = String(data.get('reviewerProduct') || '').trim();
      const rating = Number(data.get('rating') || store.reviewFormRating || 5);
      const comment = String(data.get('reviewerComment') || '').trim();
      if (!name || !comment) return;

      store.addReview({ name, city, product, rating, comment });
      form.reset();
      showToast(
        store.lang === 'ar'
          ? 'شكراً لكِ! تم نشر رأيكِ الحقيقي بنجاح ♥'
          : 'Merci ! Votre avis authentique a été publié ♥'
      );
      return;
    }

    if (form.id === 'shoestyle-checkout-form') {
      e.preventDefault();
      const data = new FormData(form);
      const fullName = String(data.get('fullName') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const wilayaCode = String(data.get('wilayaCode') || store.selectedWilayaCode || '16');
      const address = String(data.get('address') || '').trim();

      if (!fullName || !phone || !address) return;
      const customRates =
        Array.isArray(adminState?.shipping?.rates) && adminState.shipping.rates.length > 0
          ? adminState.shipping.rates
          : null;
      const order = store.submitOrder({
        fullName,
        phone,
        wilayaCode,
        address,
        deliveryType: store.checkoutDeliveryType,
        customShippingRates: customRates,
      });
      if (order && Array.isArray(adminState?.orders)) {
        adminState.orders.unshift(order);
        adminState.saveAll();
      }
      trackAdPixelEvent('Purchase', {
        value: order?.total || 0,
        currency: 'DZD',
        order_id: order?.id,
      });
      showToast(t.confirmation.title);
    } else if (form.id === 'storefront-lp-order-form') {
      e.preventDefault();
      const cfg = getActiveLandingItemConfig();
      if (!cfg) return;

      const data = new FormData(form);
      const fullName = String(data.get('fullName') || '').trim();
      const phone = String(data.get('phone') || '').trim();
      const wilayaCode = String(data.get('wilayaCode') || store.lpSelectedWilaya || '16');
      const address = String(data.get('address') || '').trim();
      if (!fullName || !phone || !address) return;

      const pricing = calculateLandingOrderPricing(cfg);
      const wilayaName =
        store.lang === 'ar'
          ? pricing.wilayaRate?.name || wilayaCode
          : pricing.wilayaRate?.name_fr || pricing.wilayaRate?.name || wilayaCode;
      const delivTypeLabel =
        store.lpDeliveryType === 'desk'
          ? store.lang === 'ar'
            ? 'مكتب التوصيل Stop-Desk'
            : 'Stop-Desk'
          : store.lang === 'ar'
          ? 'توصيل للمنزل'
          : 'À Domicile';

      const newOrder = {
        id: 'LP-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().slice(0, 10),
        fullName,
        phone,
        wilaya: `${wilayaCode} - ${wilayaName}`,
        address: `${address} (${delivTypeLabel})`,
        itemsSummary: `${cfg.title} (${store.lpSelectedColor} · مقاس ${store.lpSelectedSize} × ${pricing.bundleQty})`,
        customer: {
          fullName,
          phone,
          wilaya: wilayaName,
          address: `${address} (${delivTypeLabel})`,
        },
        items: [
          {
            name: cfg.title,
            size: store.lpSelectedSize,
            color: store.lpSelectedColor,
            quantity: pricing.bundleQty,
            price: pricing.unitPrice,
          },
        ],
        subtotal: pricing.subtotal,
        shippingFee: pricing.shippingFee,
        total: pricing.total,
        status: 'new',
      };

      store.orders.unshift(newOrder);
      store.lastConfirmedOrder = newOrder;
      if (Array.isArray(adminState?.orders)) {
        adminState.orders.unshift(newOrder);
        adminState.saveAll();
      }
      syncOrderToSupabase(newOrder);
      trackAdPixelEvent('Purchase', {
        value: newOrder.total,
        currency: 'DZD',
        order_id: newOrder.id,
        content_name: cfg.title,
      });
      store.currentScreen = 'confirmation';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      store.notify();
      showToast(t.confirmation.title);
    }
  });

  // Pause carrousel on hover / touch so the user can comfortably view and click
  document.addEventListener(
    'mouseenter',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el && el.closest('#hero-banner-section') && heroIntervalId) {
        clearInterval(heroIntervalId);
        heroIntervalId = null;
      }
    },
    true
  );

  document.addEventListener(
    'mouseleave',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (
        el &&
        el.closest('#hero-banner-section') &&
        !heroIntervalId &&
        store.currentScreen === 'home'
      ) {
        startHeroAutoSlider();
      }
    },
    true
  );

  document.addEventListener(
    'touchstart',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (el && el.closest('#hero-banner-section') && heroIntervalId) {
        clearInterval(heroIntervalId);
        heroIntervalId = null;
      }
    },
    { passive: true }
  );

  document.addEventListener(
    'touchend',
    (e) => {
      const el = e.target instanceof Element ? e.target : null;
      if (
        el &&
        el.closest('#hero-banner-section') &&
        !heroIntervalId &&
        store.currentScreen === 'home'
      ) {
        startHeroAutoSlider();
      }
    },
    { passive: true }
  );
  // Smart sticky header: hide on scroll down, immediately reveal on scroll up
  let lastScrollY = window.scrollY || 0;
  let scrollTicking = false;

  window.addEventListener(
    'scroll',
    () => {
      if (scrollTicking) return;
      scrollTicking = true;

      requestAnimationFrame(() => {
        const headerEl = document.getElementById('app-header');
        const currentScrollY = Math.max(
          0,
          window.scrollY || document.documentElement.scrollTop || 0
        );
        const delta = currentScrollY - lastScrollY;

        if (headerEl) {
          if (currentScrollY <= 16) {
            headerEl.classList.remove('is-hidden', 'is-scrolled');
          } else {
            headerEl.classList.add('is-scrolled');
            if (delta > 5 && currentScrollY > 60 && !store.searchOpen) {
              // Scrolling down: hide header smoothly
              headerEl.classList.add('is-hidden');
            } else if (delta < -2) {
              // Immediately upon scrolling up: show header
              headerEl.classList.remove('is-hidden');
            }
          }
        }

        lastScrollY = currentScrollY;
        scrollTicking = false;
      });
    },
    { passive: true }
  );

  // سحب وتقليب صور المنتجات باللمس أو الماوس مع أنيميشن انسيابي (Instagram 4:5 Swipe)
  let swipeState = null;

  function beginSwipe(targetEl, clientX, clientY) {
    if (!(targetEl instanceof Element)) return;
    if (
      targetEl.closest(
        'button, a, input, select, textarea, label, [data-action="toggle-wishlist"], [data-action="gallery-step"], [data-action="gallery-dot"], [data-action="go-back"], [data-action="share-product"]'
      )
    ) {
      return;
    }
    const galleryBox = targetEl.closest('[data-swipe-gallery]');
    if (!(galleryBox instanceof HTMLElement)) return;
    const total = Number(galleryBox.getAttribute('data-total-slides') || 1);
    if (total <= 1) return;

    const track = galleryBox.querySelector('.ss-insta-track');
    if (!(track instanceof HTMLElement)) return;

    swipeState = {
      galleryBox,
      track,
      total,
      activeIndex: Number(galleryBox.getAttribute('data-active-index') || 0),
      startX: clientX,
      startY: clientY,
      deltaX: 0,
      deltaY: 0,
      isHorizontal: null,
    };
  }

  function moveSwipe(clientX, clientY) {
    if (!swipeState) return;
    swipeState.deltaX = clientX - swipeState.startX;
    swipeState.deltaY = clientY - swipeState.startY;

    const absX = Math.abs(swipeState.deltaX);
    const absY = Math.abs(swipeState.deltaY);

    if (swipeState.isHorizontal === null) {
      // تحديد النية: إذا تحرك الإصبع بمقدار 8 بكسل على الأقل
      if (absX >= 8 || absY >= 8) {
        if (absX > absY * 1.35) {
          // حركة أفقية واضحة لسحب الصور
          swipeState.isHorizontal = true;
        } else {
          // حركة رأسية لتمرير الصفحة — نلغي السحب فوراً لمنح المتصفح تحكماً كاملاً بالتمرير بسلاسة
          swipeState = null;
          return;
        }
      } else {
        // حركة طفيفة جداً، لا نتدخل
        return;
      }
    }

    if (!swipeState || !swipeState.isHorizontal) return;

    swipeState.track.classList.add('is-dragging');
    const isEdge =
      (swipeState.activeIndex === 0 && swipeState.deltaX > 0) ||
      (swipeState.activeIndex === swipeState.total - 1 && swipeState.deltaX < 0);
    const dragOffset = isEdge ? swipeState.deltaX * 0.28 : swipeState.deltaX;
    swipeState.track.style.transform = `translate3d(calc(-${swipeState.activeIndex * 100}% + ${dragOffset}px), 0, 0)`;
  }

  function endSwipe() {
    if (!swipeState) return;
    const { galleryBox, track, activeIndex, deltaX, isHorizontal } = swipeState;
    swipeState = null;

    track.classList.remove('is-dragging');
    if (!isHorizontal) return;

    if (Math.abs(deltaX) > 14) {
      lastGallerySwipeTime = Date.now();
    }

    const threshold = Math.max(28, galleryBox.clientWidth * 0.14);
    let nextIndex = activeIndex;
    if (deltaX < -threshold) {
      nextIndex = activeIndex + 1;
    } else if (deltaX > threshold) {
      nextIndex = activeIndex - 1;
    }

    setGallerySlideIndex(galleryBox, nextIndex);
  }

  document.addEventListener(
    'touchstart',
    (e) => {
      if (e.touches.length !== 1) {
        swipeState = null;
        return;
      }
      beginSwipe(e.target, e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  document.addEventListener(
    'touchmove',
    (e) => {
      if (!swipeState || e.touches.length !== 1) return;
      moveSwipe(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  document.addEventListener('touchend', () => endSwipe(), { passive: true });
  document.addEventListener('touchcancel', () => endSwipe(), { passive: true });

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    beginSwipe(e.target, e.clientX, e.clientY);
  });

  document.addEventListener('mousemove', (e) => {
    if (!swipeState) return;
    moveSwipe(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => endSwipe());
}

/**
 * التحقق من رابط الصفحة لفتح المنتج المستقل (?product=slug أو ?p=...) أو صفحة الهبوط (?lp=...) أو الفئة (?category=...)
 */
function checkUrlForLandingPage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const prodParam = (params.get('product') || params.get('p') || '').trim();
    const lpParam = (params.get('lp') || params.get('offer') || '').trim();
    const catParam = (params.get('category') || '').trim();

    if (prodParam) {
      const cleanProd = prodParam.replace(/^\/+/, '').toLowerCase();
      const catalog = getStoreCatalog();
      const matchedProd = catalog.find(
        (item) =>
          String(item.id || '').toLowerCase() === cleanProd ||
          String(item.slug || '').toLowerCase() === cleanProd
      );
      if (matchedProd) {
        store.activeProductId = matchedProd.id;
        store.pdpSelectedColor =
          (Array.isArray(matchedProd.colors) && matchedProd.colors[0]) || 'Rose';
        store.pdpSelectedSize =
          Array.isArray(matchedProd.sizes) && matchedProd.sizes.includes(37)
            ? 37
            : (Array.isArray(matchedProd.sizes) && matchedProd.sizes[0]) || 37;
        store.pdpGalleryIndex = 0;
        store.lpSelectedColor = store.pdpSelectedColor;
        store.lpSelectedSize = store.pdpSelectedSize;
        store.lpSelectedBundle = 1;
        store.lpDeliveryType = 'home';
        store.lpGalleryIndex = 0;
        store.currentScreen = 'pdp';
        return;
      }
    }

    if (lpParam) {
      const lpList = adminState?.landingPages || [];
      const matched = lpList.find(
        (item) =>
          item.id === lpParam ||
          item.slug === lpParam ||
          item.slug === `/offer/${lpParam}` ||
          item.slug.replace('/offer/', '') === lpParam
      );
      if (matched) {
        store.activeLandingId = matched.id;
        store.lpSelectedBundle = 1;
        store.lpDeliveryType = 'home';
        store.lpGalleryIndex = 0;
        store.currentScreen = 'landing';
        return;
      }
    }

    if (catParam) {
      store.activeCategory = catParam;
      store.currentScreen = 'category';
      return;
    }
  } catch {
    // ignore URL parse error
  }
}

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  if (
    params.has('product') ||
    params.has('p') ||
    params.has('lp') ||
    params.has('offer') ||
    params.has('category')
  ) {
    checkUrlForLandingPage();
  } else {
    store.currentScreen = 'home';
  }
  renderAll();
});

document.addEventListener('DOMContentLoaded', async () => {
  initAdPixels();
  checkUrlForLandingPage();
  renderAll();
  store.subscribe(() => renderAll());
  setupEvents();
  startHeroAutoSlider();

  // جلب البيانات المحدثة من Supabase وتحديث واجهة المتجر تلقائياً
  const updatedFromSupabase = await initAdminFromSupabase();
  if (updatedFromSupabase) {
    initAdPixels();
    checkUrlForLandingPage();
    renderAll();
  }

  // الاستماع لأي تعديلات تجري في صفحة لوحة التحكم المستقلة (/admin.html) عبر Supabase Realtime
  subscribeRealtimeSync(async () => {
    adminState.reloadFromStorage();
    await initAdminFromSupabase();
    initAdPixels();
    renderAll();
  });
});
