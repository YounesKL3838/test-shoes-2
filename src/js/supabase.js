/**
 * ShoeStyle — وحدة الربط المباشر مع Supabase والمزامنة الفورية (Real-time Sync)
 * تربط بين واجهة المتجر المستقلة (index.html) ولوحة التحكم المستقلة (admin.html)
 * تعمل مباشرة عبر المتصفح (Pure Vanilla JS + Supabase CDN v2) بدون أي Bundler
 */

const { createClient } = typeof supabase !== 'undefined' ? supabase : {};

// 1. يدعم القراءة التلقائية من متغيرات البيئة (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) على Vercel / Netlify / GitHub
// أو يمكنك وضع الرابط والمفتاح مباشرة هنا بين علامتي التنصيص بعد النشر على GitHub Pages:
const ENV_SUPABASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL
    ? String(import.meta.env.VITE_SUPABASE_URL).trim()
    : '';
const ENV_SUPABASE_ANON_KEY =
  typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY
    ? String(import.meta.env.VITE_SUPABASE_ANON_KEY).trim()
    : '';

const FALLBACK_SUPABASE_URL = 'https://mxviqqtewnvwjvoruegs.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'sb_publishable_fEOufDoqK-4PRwp1a7_41Q_ZZMDQlsO';

const SUPABASE_URL = ENV_SUPABASE_URL || FALLBACK_SUPABASE_URL;
const SUPABASE_ANON_KEY = ENV_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  Boolean(SUPABASE_URL && SUPABASE_ANON_KEY) &&
  SUPABASE_URL.startsWith('http') &&
  !SUPABASE_URL.includes('YOUR_PROJECT_ID') &&
  !SUPABASE_URL.includes('your-project-id') &&
  !SUPABASE_ANON_KEY.includes('YOUR_SUPABASE_ANON_KEY') &&
  !SUPABASE_ANON_KEY.includes('your-supabase-anon-public-key');

export const supabaseClient =
  isSupabaseConfigured && typeof createClient === 'function'
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const syncChannel =
  typeof BroadcastChannel !== 'undefined'
    ? new BroadcastChannel('shoestyle_supabase_sync')
    : null;

export function notifyCrossTabSync(table, action = 'update') {
  if (syncChannel) {
    try {
      syncChannel.postMessage({ table, action, timestamp: Date.now() });
    } catch {
      // ignore broadcast errors
    }
  }
}

/**
 * جلب كافة البيانات من جداول Supabase عند تحميل المتجر أو لوحة التحكم
 */
export async function fetchAllFromSupabase() {
  if (!supabaseClient) return null;

  try {
    const [prodsRes, ordersRes, cmsRes, lpRes, shipRes] = await Promise.all([
      supabaseClient.from('products').select('*').order('updated_at', { ascending: false }),
      supabaseClient.from('orders').select('*').order('created_at', { ascending: false }),
      supabaseClient.from('cms_settings').select('*').eq('id', 1).maybeSingle(),
      supabaseClient.from('landing_pages').select('*').order('updated_at', { ascending: false }),
      supabaseClient.from('shipping_rates').select('*').order('code', { ascending: true }),
    ]);

    let parsedCms = null;
    let parsedCategories = null;
    if (!cmsRes.error && cmsRes.data) {
      let extraCms = {};
      const rawAnn = cmsRes.data.announcement_text;
      if (typeof rawAnn === 'string' && rawAnn.startsWith('{')) {
        try {
          const decoded = JSON.parse(rawAnn);
          if (decoded && decoded.__cms_ext_v2) {
            extraCms = decoded.extraCms || {};
            if (Array.isArray(decoded.categories) && decoded.categories.length > 0) {
              parsedCategories = decoded.categories;
            }
          }
        } catch {
          // ignore JSON parse error
        }
      }

      parsedCms = {
        storeName: cmsRes.data.store_name || 'ShoeStyle',
        logoUrl: cmsRes.data.logo_url,
        announcementText: extraCms.announcementText ?? '',
        announcementEnabled: false,
        heroTitle: cmsRes.data.hero_title,
        heroSubtitle: cmsRes.data.hero_subtitle,
        heroBgUrl: cmsRes.data.hero_bg_url,
        heroBtnText: cmsRes.data.hero_btn_text,
        heroBtnLink: cmsRes.data.hero_btn_link || 'Talons',
        features: Array.isArray(cmsRes.data.features) ? cmsRes.data.features : [],
        freeShippingThreshold: Number(cmsRes.data.free_shipping_threshold ?? 0),
        ...extraCms,
      };
    }

    return {
      products:
        !prodsRes.error && Array.isArray(prodsRes.data) && prodsRes.data.length > 0
          ? prodsRes.data.map((row) => ({
              id: row.id,
              slug: row.slug || `shoe-${row.id}`,
              name: row.name_ar || row.name_fr,
              name_fr: row.name_fr || row.name_ar,
              category: row.category || 'Talons',
              description_ar: row.description_ar || '',
              description_fr: row.description_fr || '',
              price: Number(row.price || 0),
              originalPrice: Number(row.original_price || row.price || 0),
              discountPrice:
                row.discount_price !== null && row.discount_price !== undefined
                  ? Number(row.discount_price)
                  : null,
              discountPercent: Number(row.discount_percent ?? 0),
              isVisible: row.is_visible !== false,
              isNew: Boolean(row.is_new ?? true),
              isBestSeller: Boolean(row.is_best_seller ?? false),
              isSpecialOffer: Boolean(row.is_special_offer ?? false),
              colorName: row.color_name || 'Beige',
              colorHex: row.color_hex || '#D2B48C',
              colors: Array.isArray(row.colors) ? row.colors : [row.color_name || 'Beige'],
              sizeFrom: Number(row.size_from || 36),
              sizeTo: Number(row.size_to || 41),
              defaultSizeStock: Number(row.default_size_stock ?? 5),
              sizes: Array.isArray(row.sizes) ? row.sizes : [36, 37, 38, 39, 40, 41],
              sizeStock:
                row.size_stock && typeof row.size_stock === 'object'
                  ? row.size_stock
                  : { 36: 5, 37: 5, 38: 5, 39: 5, 40: 5, 41: 5 },
              stock: Number(row.stock ?? 10),
              image: row.image,
              gallery: Array.isArray(row.gallery) ? row.gallery : [row.image],
            }))
          : null,

      orders:
        !ordersRes.error && Array.isArray(ordersRes.data) && ordersRes.data.length > 0
          ? ordersRes.data.map((row) => ({
              id: row.id,
              date: row.date,
              fullName: row.full_name,
              phone: row.phone,
              wilaya: row.wilaya,
              address: row.address,
              itemsSummary: row.items_summary,
              items: Array.isArray(row.items) ? row.items : [],
              total: Number(row.total || 0),
              status: row.status || 'new',
            }))
          : null,

      cms: parsedCms,
      categories: parsedCategories,

      landingPages:
        !lpRes.error && Array.isArray(lpRes.data) && lpRes.data.length > 0
          ? lpRes.data.map((row) => {
              let extraLp = {};
              if (typeof row.created_at === 'string' && row.created_at.startsWith('{')) {
                try {
                  const decoded = JSON.parse(row.created_at);
                  if (decoded && decoded.__lp_ext_v2) {
                    extraLp = decoded;
                  }
                } catch {
                  // ignore JSON parse error
                }
              }
              return {
                id: row.id,
                title: row.title,
                slug: row.slug,
                originalPrice: Number(row.original_price || 0),
                discountPrice: Number(row.discount_price || 0),
                imageUrl: row.image_url,
                gallery: Array.isArray(row.gallery) ? row.gallery : [row.image_url],
                description: row.description || '',
                quickFormEnabled: Boolean(row.quick_form_enabled),
                offerEnabled: extraLp.offerEnabled !== undefined ? Boolean(extraLp.offerEnabled) : true,
                offerMinQty: Number(extraLp.offerMinQty || 2),
                offerFreeShipping:
                  extraLp.offerFreeShipping !== undefined ? Boolean(extraLp.offerFreeShipping) : true,
                offerText: extraLp.offerText || 'اشترِ 2 واحصل على شحن مجاني',
                createdAt: extraLp.date || row.created_at || '',
              };
            })
          : null,

      shippingRates:
        !shipRes.error && Array.isArray(shipRes.data) && shipRes.data.length > 0
          ? shipRes.data.map((row) => ({
              code: row.code,
              name: row.name_ar,
              name_fr: row.name_fr || row.name_ar,
              homeFee: Number(row.home_fee || 500),
              deskFee: Number(row.desk_fee || 350),
            }))
          : null,
    };
  } catch {
    return null;
  }
}

/**
 * مزامنة منتج واحد (إضافة أو تعديل) مع جدول products في Supabase
 */
export async function syncProductToSupabase(prod) {
  notifyCrossTabSync('products', 'upsert');
  if (!supabaseClient || !prod) return;
  try {
    await supabaseClient.from('products').upsert(
      {
        id: prod.id,
        slug: prod.slug || `shoe-${prod.id}`,
        name_ar: prod.name || prod.name_fr,
        name_fr: prod.name_fr || prod.name,
        category: prod.category || 'Talons',
        description_ar: prod.description_ar || '',
        description_fr: prod.description_fr || '',
        price: Number(prod.price || 0),
        original_price: Number(prod.originalPrice || prod.price || 0),
        discount_price:
          prod.discountPrice !== null && prod.discountPrice !== undefined && prod.discountPrice !== ''
            ? Number(prod.discountPrice)
            : null,
        discount_percent: Number(prod.discountPercent ?? 0),
        is_visible: prod.isVisible !== false,
        is_new: Boolean(prod.isNew ?? true),
        is_best_seller: Boolean(prod.isBestSeller ?? false),
        is_special_offer: Boolean(prod.isSpecialOffer ?? false),
        color_name: prod.colorName || 'Beige',
        color_hex: prod.colorHex || '#D2B48C',
        colors: Array.isArray(prod.colors) ? prod.colors : [prod.colorName || 'Beige'],
        size_from: Number(prod.sizeFrom || 36),
        size_to: Number(prod.sizeTo || 41),
        default_size_stock: Number(prod.defaultSizeStock ?? 5),
        sizes: Array.isArray(prod.sizes) ? prod.sizes : [36, 37, 38, 39, 40, 41],
        size_stock: prod.sizeStock || {},
        stock: Number(prod.stock ?? 0),
        image: prod.image,
        gallery: Array.isArray(prod.gallery) ? prod.gallery : [prod.image],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {
    // fallback handled via localStorage + BroadcastChannel
  }
}

export async function deleteProductFromSupabase(prodId) {
  notifyCrossTabSync('products', 'delete');
  if (!supabaseClient || !prodId) return;
  try {
    await supabaseClient.from('products').delete().eq('id', prodId);
  } catch {}
}

/**
 * مزامنة طلب زبون (إضافة أو تحديث حالة الطلب) مع جدول orders في Supabase
 */
export async function syncOrderToSupabase(order) {
  notifyCrossTabSync('orders', 'upsert');
  if (!supabaseClient || !order) return;
  try {
    await supabaseClient.from('orders').upsert(
      {
        id: order.id,
        date: order.date,
        full_name: order.fullName || order.customer?.fullName || 'Client',
        phone: order.phone || order.customer?.phone || '',
        wilaya: order.wilaya || order.customer?.wilaya || '16 - Alger',
        address: order.address || order.customer?.address || '',
        items_summary:
          order.itemsSummary ||
          (Array.isArray(order.items)
            ? order.items
                .map((i) => `${i.name || 'ShoeStyle'} (${i.size} × ${i.quantity})`)
                .join(' + ')
            : 'ShoeStyle'),
        items: Array.isArray(order.items) ? order.items : [],
        total: Number(order.total || 0),
        status: order.status || 'new',
      },
      { onConflict: 'id' }
    );
  } catch {}
}

export async function deleteOrderFromSupabase(orderId) {
  notifyCrossTabSync('orders', 'delete');
  if (!supabaseClient || !orderId) return;
  try {
    await supabaseClient.from('orders').delete().eq('id', orderId);
  } catch {}
}

/**
 * مزامنة إعدادات واجهة المتجر (CMS) والفئات مع جدول cms_settings في Supabase
 */
export async function syncCmsToSupabase(cms, freeShippingThreshold = 0, categories = null) {
  notifyCrossTabSync('cms_settings', 'upsert');
  if (!supabaseClient || !cms) return;
  try {
    const extraPayload = JSON.stringify({
      __cms_ext_v2: true,
      extraCms: {
        footerFarewell: cms.footerFarewell || 'À bientôt sur ShoeStyle ♥ ♥',
        phone: cms.phone || '',
        location_ar: cms.location_ar || '',
        location_fr: cms.location_fr || '',
        instagramUrl: cms.instagramUrl || '',
        facebookUrl: cms.facebookUrl || '',
        tiktokUrl: cms.tiktokUrl || '',
        whatsappNumber: cms.whatsappNumber || '',
        fbPixelId: cms.fbPixelId || '',
        tiktokPixelId: cms.tiktokPixelId || '',
        snapPixelId: cms.snapPixelId || '',
        googleTagId: cms.googleTagId || '',
      },
      categories: Array.isArray(categories) ? categories : undefined,
    });

    await supabaseClient.from('cms_settings').upsert(
      {
        id: 1,
        store_name: cms.storeName || 'ShoeStyle',
        logo_url: cms.logoUrl,
        announcement_text: extraPayload,
        announcement_enabled: false,
        hero_title: cms.heroTitle,
        hero_subtitle: cms.heroSubtitle,
        hero_bg_url: cms.heroBgUrl,
        hero_btn_text: cms.heroBtnText,
        hero_btn_link: cms.heroBtnLink || 'Talons',
        features: Array.isArray(cms.features) ? cms.features : [],
        free_shipping_threshold: Number(freeShippingThreshold ?? 0),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {}
}

/**
 * مزامنة صفحات الهبوط الترويجية مع جدول landing_pages في Supabase
 */
export async function syncLandingPageToSupabase(lp) {
  notifyCrossTabSync('landing_pages', 'upsert');
  if (!supabaseClient || !lp) return;
  try {
    const encodedMeta = JSON.stringify({
      __lp_ext_v2: true,
      date: lp.createdAt || new Date().toISOString().slice(0, 10),
      offerEnabled: lp.offerEnabled !== false,
      offerMinQty: Number(lp.offerMinQty || 2),
      offerFreeShipping: lp.offerFreeShipping !== false,
      offerText: lp.offerText || 'اشترِ 2 واحصل على شحن مجاني',
    });

    await supabaseClient.from('landing_pages').upsert(
      {
        id: lp.id,
        title: lp.title,
        slug: lp.slug,
        original_price: Number(lp.originalPrice || 0),
        discount_price: Number(lp.discountPrice || 0),
        image_url: lp.imageUrl,
        gallery: Array.isArray(lp.gallery) ? lp.gallery : [lp.imageUrl],
        description: lp.description || '',
        quick_form_enabled: true,
        created_at: encodedMeta,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  } catch {}
}

export async function deleteLandingPageFromSupabase(lpId) {
  notifyCrossTabSync('landing_pages', 'delete');
  if (!supabaseClient || !lpId) return;
  try {
    await supabaseClient.from('landing_pages').delete().eq('id', lpId);
  } catch {}
}

/**
 * مزامنة أسعار التوصيل حسب الولايات مع جدول shipping_rates في Supabase
 */
export async function syncShippingRateToSupabase(rate) {
  notifyCrossTabSync('shipping_rates', 'upsert');
  if (!supabaseClient || !rate) return;
  try {
    await supabaseClient.from('shipping_rates').upsert(
      {
        code: rate.code,
        name_ar: rate.name,
        name_fr: rate.name_fr || rate.name,
        home_fee: Number(rate.homeFee || 500),
        desk_fee: Number(rate.deskFee || 350),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'code' }
    );
  } catch {}
}

export async function deleteShippingRateFromSupabase(code) {
  notifyCrossTabSync('shipping_rates', 'delete');
  if (!supabaseClient || !code) return;
  try {
    await supabaseClient.from('shipping_rates').delete().eq('code', code);
  } catch {}
}

/**
 * رفع ومزامنة كافة بيانات لوحة التحكم دفعة واحدة إلى Supabase
 */
export async function syncAllStateToSupabase(state) {
  if (!supabaseClient || !state) return false;
  try {
    await syncCmsToSupabase(state.cms, 0, state.categories);
    if (Array.isArray(state.inventory)) {
      await Promise.all(state.inventory.map((p) => syncProductToSupabase(p)));
    }
    if (Array.isArray(state.landingPages)) {
      await Promise.all(state.landingPages.map((lp) => syncLandingPageToSupabase(lp)));
    }
    if (Array.isArray(state.shipping?.rates)) {
      await Promise.all(state.shipping.rates.map((r) => syncShippingRateToSupabase(r)));
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * الاشتراك في التحديثات اللحظية (Supabase Realtime + BroadcastChannel + Storage Event)
 * لضمان التزامن الفوري بين واجهة المتجر (index.html) ولوحة التحكم المستقلة (admin.html)
 */
export function subscribeRealtimeSync(onSyncCallback) {
  if (typeof onSyncCallback !== 'function') return;

  if (syncChannel) {
    syncChannel.addEventListener('message', (event) => {
      onSyncCallback(event.data);
    });
  }

  window.addEventListener('storage', (event) => {
    if (event.key && event.key.startsWith('shoestyle_')) {
      onSyncCallback({ table: event.key, action: 'storage' });
    }
  });

  if (supabaseClient) {
    try {
      supabaseClient
        .channel('shoestyle-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            onSyncCallback({
              table: payload.table,
              action: payload.eventType,
              remote: true,
            });
          }
        )
        .subscribe();
    } catch {
      // Realtime optional fallback
    }
  }
}
