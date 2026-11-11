/**
 * ShoeStyle — Gestion d'état réactive (Vanilla JS)
 * Avec support bilingue (Français / العربية)
 */
import { PRODUCTS, WILAYAS } from './data.js';
import { syncOrderToSupabase } from './supabase.js';

const STORAGE_KEYS = {
  CART: 'shoestyle_cart_v2',
  WISHLIST: 'shoestyle_wishlist_v2',
  ORDERS: 'shoestyle_orders_v2',
  REVIEWS: 'shoestyle_reviews_v1',
  LANG: 'shoestyle_lang_v1',
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

const initialLang = (function() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    if (saved === 'ar' || saved === 'fr') return saved;
  } catch {}
  return 'fr';
})();

export const store = {
  // Langue active: 'fr' | 'ar'
  lang: initialLang,

  // 'home' | 'category' | 'pdp' | 'cart' | 'checkout' | 'confirmation' | 'wishlist' | 'account'
  currentScreen: 'home',
  previousScreen: 'home',
  activeCategory: 'Talons',
  searchQuery: '',
  searchOpen: false,
  filterPrice: 'all', // 'all' | 'under-4500' | '4500-plus'
  filterSize: 'all', // 'all' | 36 | 37 | 38 | 39 | 40
  filterColor: 'all', // 'all' | 'Rose' | 'Noir' | 'Beige' | 'Blanc' | 'Rouge'

  // Articles initiaux dans le panier (comme sur l'écran 4)
  cart: loadFromStorage(STORAGE_KEYS.CART, [
    {
      productId: 'ss-01',
      size: 37,
      color: 'Rose',
      quantity: 1,
    },
    {
      productId: 'ss-02',
      size: 38,
      color: 'Blanc',
      quantity: 1,
    },
  ]),
  wishlist: loadFromStorage(STORAGE_KEYS.WISHLIST, ['ss-01']),
  orders: loadFromStorage(STORAGE_KEYS.ORDERS, []),
  reviews: loadFromStorage(STORAGE_KEYS.REVIEWS, []),
  reviewFormRating: 5,

  // État PDP (Fiche produit)
  activeProductId: 'ss-01',
  pdpSelectedColor: 'Rose',
  pdpSelectedSize: 37,
  pdpGalleryIndex: 0,

  // État Landing Page (Page d'offre promotionnelle autonome)
  activeLandingId: 'lp-101',
  lpSelectedColor: 'Rose',
  lpSelectedSize: 37,
  lpSelectedBundle: 1, // 1 = 1 paire, 2 = Pack 2 paires (-500 DA + Livraison Gratuite)
  lpDeliveryType: 'home', // 'home' | 'desk'
  lpSelectedWilaya: '16',
  lpGalleryIndex: 0,

  selectedWilayaCode: '16',
  checkoutDeliveryType: 'home', // 'home' | 'desk'
  lastConfirmedOrder: null,
  listeners: [],

  subscribe(fn) {
    this.listeners.push(fn);
  },

  save() {
    saveToStorage(STORAGE_KEYS.CART, this.cart);
    saveToStorage(STORAGE_KEYS.WISHLIST, this.wishlist);
    saveToStorage(STORAGE_KEYS.ORDERS, this.orders);
    saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    try {
      localStorage.setItem(STORAGE_KEYS.LANG, this.lang);
    } catch {}
  },

  notify() {
    this.save();
    this.listeners.forEach((fn) => fn(this));
  },

  setLanguage(newLang) {
    if (newLang !== 'fr' && newLang !== 'ar') return;
    this.lang = newLang;
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    this.notify();
  },

  toggleLanguage() {
    this.setLanguage(this.lang === 'fr' ? 'ar' : 'fr');
  },

  syncUrlWithState(replace = false) {
    if (typeof window === 'undefined' || !window.history) return;
    try {
      let targetUrl = window.location.pathname;
      if (this.currentScreen === 'pdp') {
        const prod = this.getActiveProduct();
        const slugOrId = (prod && (prod.slug || prod.id)) || this.activeProductId;
        if (slugOrId) {
          targetUrl = `${window.location.pathname}?product=${encodeURIComponent(slugOrId)}`;
        }
      } else if (this.currentScreen === 'landing' && this.activeLandingId) {
        targetUrl = `${window.location.pathname}?lp=${encodeURIComponent(this.activeLandingId)}`;
      } else if (this.currentScreen === 'category' && this.activeCategory) {
        targetUrl = `${window.location.pathname}?category=${encodeURIComponent(this.activeCategory)}`;
      }

      const currentFull = `${window.location.pathname}${window.location.search}`;
      if (currentFull !== targetUrl) {
        const stateObj = {
          screen: this.currentScreen,
          productId: this.activeProductId,
          category: this.activeCategory,
          landingId: this.activeLandingId,
        };
        if (replace) {
          window.history.replaceState(stateObj, '', targetUrl);
        } else {
          window.history.pushState(stateObj, '', targetUrl);
        }
      }
    } catch {
      // Ignore history errors in restricted environments
    }
  },

  navigate(screen, options = {}) {
    if (screen !== this.currentScreen) {
      this.previousScreen = this.currentScreen;
    }
    this.currentScreen = screen;
    if (options.category) {
      this.activeCategory = options.category;
    }
    if (options.productId) {
      const prod =
        PRODUCTS.find(
          (p) => p.id === options.productId || p.slug === options.productId
        ) || null;
      this.activeProductId = prod ? prod.id : options.productId;
      if (prod) {
        const defaultColor = prod.colors[0] || 'Rose';
        const defaultSize = Array.isArray(prod.sizes) && prod.sizes.length > 0 ? (prod.sizes.includes(37) ? 37 : prod.sizes[0]) : '';
        this.pdpSelectedColor = defaultColor;
        this.pdpSelectedSize = defaultSize;
        this.pdpGalleryIndex = 0;
        this.lpSelectedColor = defaultColor;
        this.lpSelectedSize = defaultSize;
        this.lpSelectedBundle = 1;
        this.lpDeliveryType = 'home';
        this.lpGalleryIndex = 0;
      }
    }
    if (options.landingId) {
      this.activeLandingId = options.landingId;
      this.lpSelectedColor = 'Rose';
      this.lpSelectedSize = 37;
      this.lpSelectedBundle = 1;
      this.lpDeliveryType = 'home';
      this.lpGalleryIndex = 0;
    }
    if (!options.skipUrlUpdate) {
      this.syncUrlWithState(Boolean(options.replaceUrl));
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
    this.notify();
  },

  goBack() {
    if (this.currentScreen === 'checkout') {
      this.navigate('cart');
    } else if (this.currentScreen === 'pdp' || this.currentScreen === 'landing') {
      this.navigate(this.previousScreen === 'category' ? 'category' : 'home');
    } else {
      this.navigate('home');
    }
  },

  getActiveProduct() {
    return (
      PRODUCTS.find(
        (p) => p.id === this.activeProductId || p.slug === this.activeProductId
      ) || PRODUCTS[0]
    );
  },

  toggleWishlist(productId, silent = false) {
    const idx = this.wishlist.indexOf(productId);
    let added = false;
    if (idx === -1) {
      this.wishlist.push(productId);
      added = true;
    } else {
      this.wishlist.splice(idx, 1);
    }
    if (silent) {
      this.save();
    } else {
      this.notify();
    }
    return added;
  },

  isWishlisted(productId) {
    return this.wishlist.includes(productId);
  },

  addToCart(productId, size, color, quantity = 1, silent = false) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return null;

    const chosenSize = size || (Array.isArray(product.sizes) && product.sizes.length > 0 ? (product.sizes.includes(37) ? 37 : product.sizes[0]) : '');
    const chosenColor = color || product.colors[0];

    const existing = this.cart.find(
      (item) =>
        item.productId === productId &&
        item.size === chosenSize &&
        item.color === chosenColor
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cart.push({
        productId,
        size: chosenSize,
        color: chosenColor,
        quantity,
      });
    }
    if (silent) {
      this.save();
    } else {
      this.notify();
    }
    return { product, size: chosenSize, color: chosenColor };
  },

  updateCartQuantity(index, delta) {
    const item = this.cart[index];
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      this.cart.splice(index, 1);
    }
    this.notify();
  },

  clearCart() {
    this.cart = [];
    this.notify();
  },

  getCartDetails(customShippingRates = null) {
    const items = this.cart
      .map((item, index) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...item,
          index,
          product,
          lineTotal: product.price * item.quantity,
        };
      })
      .filter(Boolean);

    const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const wilaya =
      WILAYAS.find((w) => w.code === this.selectedWilayaCode) || WILAYAS[15] || WILAYAS[0];
    const customRate = Array.isArray(customShippingRates)
      ? customShippingRates.find((r) => r.code === wilaya.code)
      : null;

    const homeFee = Number(customRate?.homeFee ?? wilaya.fee ?? 500);
    const deskFee = Number(customRate?.deskFee ?? Math.max(250, homeFee - 150));
    const deliveryType = this.checkoutDeliveryType === 'desk' ? 'desk' : 'home';
    const shippingFee = subtotal === 0 ? 0 : deliveryType === 'desk' ? deskFee : homeFee;
    const total = subtotal + shippingFee;

    return {
      items,
      totalCount,
      subtotal,
      homeFee,
      deskFee,
      deliveryType,
      shippingFee,
      total,
      wilaya,
    };
  },

  submitOrder({ fullName, phone, wilayaCode, address, deliveryType, customShippingRates = null }) {
    if (wilayaCode) {
      this.selectedWilayaCode = wilayaCode;
    }
    if (deliveryType === 'home' || deliveryType === 'desk') {
      this.checkoutDeliveryType = deliveryType;
    }

    const details = this.getCartDetails(customShippingRates);
    if (details.items.length === 0) return null;

    const orderNumber = 'SS-' + Math.floor(1000 + Math.random() * 9000);
    const wilayaObj =
      WILAYAS.find((w) => w.code === (wilayaCode || this.selectedWilayaCode)) || details.wilaya;

    const wilayaLabel = this.lang === 'ar' ? wilayaObj.name_ar : wilayaObj.name_fr;
    const delivLabel =
      details.deliveryType === 'desk'
        ? this.lang === 'ar'
          ? 'مكتب التوصيل Stop-Desk'
          : 'Bureau Stop-Desk'
        : this.lang === 'ar'
        ? 'توصيل للمنزل'
        : 'À Domicile';

    const itemsSummary = details.items
      .map(
        (item) =>
          `${this.lang === 'ar' ? item.product.name_ar : item.product.name_fr} (${this.lang === 'ar' ? 'مقاس' : 'Pointure'} ${item.size} × ${item.quantity})`
      )
      .join(' + ');

    const fullAddressWithType = `${address} (${delivLabel})`;

    const newOrder = {
      id: orderNumber,
      date: new Date().toISOString().slice(0, 10),
      fullName,
      phone,
      wilaya: `${wilayaObj.code} - ${wilayaLabel}`,
      address: fullAddressWithType,
      deliveryType: details.deliveryType,
      itemsSummary,
      customer: {
        fullName,
        phone,
        wilaya: wilayaLabel,
        address: fullAddressWithType,
      },
      items: details.items.map((item) => ({
        name: this.lang === 'ar' ? item.product.name_ar : item.product.name_fr,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal: details.subtotal,
      shippingFee: details.shippingFee,
      total: details.total,
      status: 'new',
    };

    this.orders.unshift(newOrder);
    this.cart = [];
    this.lastConfirmedOrder = newOrder;
    this.currentScreen = 'confirmation';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
    this.notify();
    syncOrderToSupabase(newOrder);
    return newOrder;
  },

  addReview({ name, city, product, rating, comment }) {
    const newReview = {
      id: 'rev-' + Date.now(),
      name: String(name || '').trim(),
      city: String(city || '').trim(),
      product: String(product || '').trim(),
      rating: Math.min(5, Math.max(1, Number(rating || 5))),
      comment: String(comment || '').trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    this.reviews.unshift(newReview);
    this.reviewFormRating = 5;
    this.notify();
    return newReview;
  },
};
