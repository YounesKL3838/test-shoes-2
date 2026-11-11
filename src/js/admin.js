/**
 * ShoeStyle — لوحة التحكم الإدارية الشاملة ثنائية اللغة (العربية / Français)
 * Mobile-First Chic Blush Pink & Ivory Identity — Vanilla JS + LocalStorage
 */
import { CATEGORIES, COLOR_SWATCHES, DEMO_CATEGORY_IDS, DEMO_PRODUCT_IDS, IMAGES, PRODUCTS, WILAYAS, formatDA, getProductColorHex } from './data.js';
import { store, showToast } from './app_bridge.js';
import {
  deleteLandingPageFromSupabase,
  deleteOrderFromSupabase,
  deleteProductFromSupabase,
  deleteShippingRateFromSupabase,
  fetchAllFromSupabase,
  isSupabaseConfigured,
  notifyCrossTabSync,
  syncAllStateToSupabase,
  syncCmsToSupabase,
  syncLandingPageToSupabase,
  syncOrderToSupabase,
  syncProductToSupabase,
  syncShippingRateToSupabase,
} from './supabase.js';

const CMS_STORAGE_KEY = 'shoestyle_full_cms_v1';
const LANDING_STORAGE_KEY = 'shoestyle_landing_pages_v1';
const INVENTORY_STORAGE_KEY = 'shoestyle_inventory_v1';
const CATEGORIES_STORAGE_KEY = 'shoestyle_categories_v2';
const LEGACY_CATEGORIES_KEY = 'shoestyle_categories_v1';
const SHIPPING_STORAGE_KEY = 'shoestyle_shipping_v1';
const ORDERS_ADMIN_KEY = 'shoestyle_orders_v2';

function getLang() {
  return store && store.lang === 'fr' ? 'fr' : 'ar';
}

/**
 * قاموس الترجمة الكامل للوحة التحكم (العربية / الفرنسية)
 */
const ADMIN_I18N = {
  ar: {
    brandSubtitle: 'لوحة التحكم الشاملة للمتجر',
    viewStore: 'عرض المتجر',
    logout: 'خروج',
    switchLangBtn: 'Français',
    tabs: {
      inventory: 'المنتجات والفئات',
      inventoryShort: 'المنتجات',
      orders: 'الطلبات',
      ordersShort: 'الطلبات',
      stats: 'الإحصائيات',
      statsShort: 'الإحصائيات',
      cms: 'الواجهة والبيكسل',
      cmsShort: 'الواجهة',
      landing: 'صفحات الهبوط',
      landingShort: 'الهبوط',
      shipping: 'التوصيل والولايات',
      shippingShort: 'التوصيل',
    },
    kpi: {
      totalSales: 'إجمالي المبيعات',
      totalOrdersFoot: (n) => `${n} طلب إجمالي`,
      newOrders: 'طلبات جديدة',
      orderUnit: 'طلب',
      awaitingConfirm: 'بانتظار التأكيد',
      productsCount: 'عدد المنتجات',
      shoeUnit: 'حذاء',
      lowStockFoot: (n) => `${n} بمخزون منخفض`,
      freeShipping: 'الفئات والتوصيل',
      activeWilayas: (n) => `${n} ولاية مفعلة`,
    },
    inv: {
      lowStockAlert: (names) => `تنبيه مخزون منخفض (أقل من 5 قطع): ${names}`,
      productsBadge: (n) => `${n} منتجات`,
      editProdTitle: (name) => `تعديل المنتج: ${name}`,
      addProdTitle: '+ إضافة حذاء جديد للمتجر',
      prodFormSub: 'ارفع صورة الحذاء مباشرة من هاتفك أو حاسوبك وحدد السعر والكمية',
      cancelEdit: 'إلغاء التعديل',
      mainPhotoLabel: 'صورة الحذاء الأساسية (اضغط لرفع صورة من هاتفك أو جهازك)',
      uploadTapTitle: 'اضغط هنا لاختيار صورة من الاستوديو أو الكاميرا',
      uploadTapSub: 'بدون روابط — رفع مباشر وسريع',
      uploadBtn: 'رفع صورة',
      nameArLabel: 'اسم الحذاء (بالعربية)',
      nameArPlaceholder: 'مثال: حذاء كعب عالي كلاسيك وردي',
      nameFrLabel: 'اسم الحذاء (بالفرنسية)',
      nameFrPlaceholder: 'Ex: Escarpins Classiques Rose',
      categoryLabel: 'القسم / التصنيف',
      priceLabel: 'السعر (د.ج)',
      stockLabel: 'الكمية المتوفرة في المخزون',
      galleryLabel: 'صور إضافية للحذاء (اختياري)',
      galleryTapTitle: (n) => `إضافة صور أخرى للمعرض (${n} صور مرفوعة)`,
      galleryTapSub: 'يمكنك اختيار عدة صور معاً من هاتفك',
      galleryBtn: '+ صور إضافية',
      saveProdChanges: 'حفظ التعديلات',
      addProdNow: '+ إضافة الحذاء للمتجر الآن',
      currentProdsTitle: (n) => `المنتجات الحالية والتحكم السريع بالمخزون (${n})`,
      currentProdsSub: 'اضغط على (+) أو (-) لتعديل المخزون فوراً، أو اضغط على الصورة لتغييرها من هاتفك',
      searchPlaceholder: 'ابحث عن اسم الحذاء...',
      changePhotoBtn: 'تغيير',
      outOfStock: 'نفد (0)',
      lowStockBadge: (n) => `منخفض (${n})`,
      inStockBadge: (n) => `متوفر (${n})`,
      editBtn: 'تعديل',
      deleteBtn: 'حذف',
    },
    orders: {
      title: (n) => `طلبات الزبائن (${n})`,
      sub: 'غيّر حالة الطلب بلمسة واحدة أو اتصل بالزبون مباشرة من البطاقة',
      addDemoBtn: '+ إضافة طلب تجريبي',
      allFilter: (n) => `الكل (${n})`,
      emptyOrders: 'لا توجد طلبات في هذه الحالة حالياً',
      totalAmount: 'المبلغ الإجمالي',
      sizeWord: 'مقاس',
      statuses: {
        new: 'جديد',
        confirming: 'قيد التأكيد',
        shipping: 'قيد الشحن',
        delivered: 'تم التسليم',
        cancelled: 'ملغى',
      },
    },
    cms: {
      livePreviewBanner: 'معاينة مباشرة لواجهة المتجر (تتغير تلقائياً أثناء الكتابة)',
      navLinksPreview: 'الرئيسية · كعب · سنيكرز',
      formTitle: 'تعديل نصوص وصور الواجهة الرئيسية',
      formSub: 'عدّل اسم المتجر، الإعلانات، البانر، والمميزات ثم اضغط حفظ',
      saveBtn: 'حفظ التعديلات',
      storeNameLabel: 'اسم المتجر',
      logoLabel: 'تغيير صورة شعار المتجر (من الهاتف)',
      logoUploadTitle: 'رفع صورة الشعار',
      chooseBtn: 'اختيار',
      annSwitchTitle: 'إظهار شريط الإعلانات الوردي بأعلى الموقع',
      annSwitchSub: 'لعرض عروض التوصيل المجاني أو التخفيضات',
      annTextLabel: 'نص شريط الإعلانات العلوي',
      heroTitleLabel: 'عنوان البانر الرئيسي',
      heroBtnLabel: 'نص زر البانر',
      heroSubLabel: 'الوصف التسويقي للبانر',
      heroImgLabel: 'صورة البانر الرئيسي (رفع مباشر من الجهاز)',
      heroImgTitle: 'اضغط لرفع صورة جديدة للبانر الرئيسي',
      heroImgSub: 'تظهر فوراً في المعاينة أعلاه',
      featLabel: (i) => `الميزة ${i} (الرمز والعنوان)`,
      featDescLabel: (i) => `وصف الميزة ${i}`,
      saveAllCmsBtn: 'حفظ وتطبيق تعديلات الواجهة',
    },
    lp: {
      editTitle: (t) => `تعديل العرض: ${t}`,
      createTitle: '+ إنشاء صفحة هبوط لعرض ترويجي',
      sub: 'صفحة خاصة بمنتج مخفض مع استمارة شراء سريع تزيد المبيعات',
      cancelBtn: 'إلغاء',
      offerTitleLabel: 'عنوان العرض الترويجي',
      offerTitlePlaceholder: 'مثال: عرض خاص: حذاء كعب سهرة + توصيل مجاني',
      slugLabel: 'رابط العرض المخصص (Slug)',
      origPriceLabel: 'السعر قبل التخفيض (د.ج)',
      discPriceLabel: 'سعر العرض المخفض (د.ج)',
      mainImgLabel: 'صورة العرض الرئيسية (من الهاتف)',
      mainImgTitle: 'رفع صورة العرض',
      mainImgSub: 'من ألبوم الصور',
      galleryLabel: 'صور إضافية لمعرض العرض',
      galleryTitle: (n) => `إضافة صور للمعرض (${n})`,
      gallerySub: 'اختيار متعدد',
      addPhotosBtn: '+ صور',
      descLabel: 'وصف العرض ومميزاته',
      descPlaceholder: 'اشرح مميزات الحذاء والعرض...',
      updateBtn: 'تحديث صفحة الهبوط',
      createBtn: '+ إنشاء وحفظ صفحة الهبوط',
      activeListTitle: (n) => `صفحات الهبوط النشطة (${n})`,
      activeListSub: 'اضغط على "معاينة العرض" لتجربة استمارة الشراء السريع',
      previewBtn: 'معاينة العرض',
      modalHeader: (slug) => `معاينة صفحة الهبوط (${slug})`,
      closeModal: 'إغلاق',
      quickOrderTitle: 'اطلبي الآن — الدفع عند الاستلام',
      quickOrderSub: 'أدخلي معلوماتكِ ليصلكِ الطلب لباب المنزل',
      fullNamePlaceholder: 'الاسم واللقب *',
      phonePlaceholder: 'رقم الهاتف *',
      addressPlaceholder: 'العنوان الكامل (البلدية والحي) *',
      confirmQuickOrder: (price) => `تأكيد الطلب — ${price}`,
    },
    ship: {
      title: 'إضافة ولاية جديدة',
      sub: 'أضف ولاية جديدة مع تحديد سعر التوصيل للمنزل وللمكتب',
      thresholdLabel: 'سقف التوصيل المجاني (د.ج)',
      saveThresholdBtn: 'حفظ سقف الشحن المجاني',
      addWilayaLabel: 'إضافة ولاية جديدة (الرمز والاسم)',
      wilayaNamePlaceholder: 'اسم الولاية (مثلاً: بجاية)',
      feesLabel: 'سعر المنزل والمكتب (د.ج)',
      homePlaceholder: 'المنزل 600',
      deskPlaceholder: 'المكتب 400',
      addBtn: '+ إضافة الولاية',
      ratesListTitle: (n) => `أسعار التوصيل حسب الولايات (${n})`,
      ratesListSub: 'عدّل السعر مباشرة وسيتم الحفظ تلقائياً',
      homeFeeLabel: 'للمنزل (د.ج)',
      deskFeeLabel: 'للمكتب (د.ج)',
    },
    toasts: {
      loggedOut: 'تم الخروج والعودة إلى واجهة المتجر',
      lpDeleted: 'تم حذف صفحة الهبوط',
      prodDeleted: 'تم حذف المنتج من الكتالوج',
      newOrderAdded: (id) => `تم تسجيل الطلب الجديد #${id}`,
      orderDeleted: 'تم حذف الطلب',
      wilayaDeleted: 'تم حذف الولاية',
      photoUploaded: 'تم رفع الصورة بنجاح',
      galleryAdded: (n) => `تمت إضافة ${n} صور`,
      prodPhotoUpdated: (name) => `تم تحديث صورة "${name}" فوراً`,
      invalidImage: 'يرجى اختيار صورة صالحة',
      orderStatusChanged: (id, st) => `تم تحديث حالة الطلب #${id} إلى "${st}"`,
      cmsSaved: 'تم حفظ تعديلات واجهة المتجر بنجاح',
      lpUpdated: 'تم تحديث العرض الترويجي',
      lpCreated: 'تم إنشاء صفحة الهبوط الجديدة',
      prodUpdated: 'تم حفظ تعديلات المنتج',
      prodCreated: 'تمت إضافة الحذاء الجديد للمتجر',
      thresholdSaved: 'تم حفظ سقف التوصيل المجاني',
      wilayaAdded: (name) => `تمت إضافة ولاية ${name}`,
      langSwitched: 'تم التبديل إلى اللغة العربية',
    },
  },
  fr: {
    brandSubtitle: 'Panneau d’Administration & CMS Complet',
    viewStore: 'Voir la Boutique',
    logout: 'Quitter',
    switchLangBtn: 'العربية',
    tabs: {
      inventory: 'Produits & Stock',
      inventoryShort: 'Produits',
      orders: 'Commandes',
      ordersShort: 'Commandes',
      stats: 'Statistiques',
      statsShort: 'Stats',
      cms: 'Design & CMS',
      cmsShort: 'Vitrine',
      landing: 'Landing Pages',
      landingShort: 'Offres',
      shipping: 'Livraison & Wilayas',
      shippingShort: 'Livraison',
    },
    kpi: {
      totalSales: 'Chiffre d’Affaires',
      totalOrdersFoot: (n) => `${n} commandes au total`,
      newOrders: 'Nouvelles Commandes',
      orderUnit: 'cmd',
      awaitingConfirm: 'En attente de confirmation',
      productsCount: 'Catalogue Produits',
      shoeUnit: 'modèles',
      lowStockFoot: (n) => `${n} en stock faible`,
      freeShipping: 'Livraison Gratuite',
      activeWilayas: (n) => `${n} wilayas actives`,
    },
    inv: {
      lowStockAlert: (names) => `Alerte stock faible (moins de 5 pièces) : ${names}`,
      productsBadge: (n) => `${n} produits`,
      editProdTitle: (name) => `Modifier le produit : ${name}`,
      addProdTitle: '+ Ajouter une nouvelle chaussure',
      prodFormSub: 'Importez la photo directement depuis votre téléphone ou PC et fixez le prix',
      cancelEdit: 'Annuler',
      mainPhotoLabel: 'Photo principale (Appuyez pour importer depuis votre téléphone)',
      uploadTapTitle: 'Appuyez ici pour choisir une photo (Galerie ou Caméra)',
      uploadTapSub: 'Sans lien URL — Importation directe et rapide',
      uploadBtn: 'Importer',
      nameArLabel: 'Nom de la chaussure (Arabe)',
      nameArPlaceholder: 'Ex: حذاء كعب عالي كلاسيك وردي',
      nameFrLabel: 'Nom de la chaussure (Français)',
      nameFrPlaceholder: 'Ex: Escarpins Classiques Rose',
      categoryLabel: 'Catégorie',
      priceLabel: 'Prix (DA)',
      stockLabel: 'Quantité en stock',
      galleryLabel: 'Photos supplémentaires pour la galerie (Optionnel)',
      galleryTapTitle: (n) => `Ajouter d’autres angles (${n} photos importées)`,
      galleryTapSub: 'Sélection multiple possible depuis votre téléphone',
      galleryBtn: '+ Photos',
      saveProdChanges: 'Enregistrer les modifications',
      addProdNow: '+ Ajouter au catalogue maintenant',
      currentProdsTitle: (n) => `Catalogue & Contrôle Rapide du Stock (${n})`,
      currentProdsSub: 'Appuyez sur (+) ou (-) pour ajuster le stock, ou sur la photo pour la remplacer',
      searchPlaceholder: 'Rechercher un modèle...',
      changePhotoBtn: 'Changer',
      outOfStock: 'Épuisé (0)',
      lowStockBadge: (n) => `Faible (${n})`,
      inStockBadge: (n) => `En stock (${n})`,
      editBtn: 'Modifier',
      deleteBtn: 'Supprimer',
    },
    orders: {
      title: (n) => `Commandes Clients (${n})`,
      sub: 'Changez le statut en un clic ou appelez directement le client depuis la carte',
      addDemoBtn: '+ Commande test',
      allFilter: (n) => `Toutes (${n})`,
      emptyOrders: 'Aucune commande avec ce statut pour le moment',
      totalAmount: 'Montant Total',
      sizeWord: 'Pointure',
      statuses: {
        new: 'Nouveau',
        confirming: 'En confirmation',
        shipping: 'En livraison',
        delivered: 'Livré',
        cancelled: 'Annulé',
      },
    },
    cms: {
      livePreviewBanner: 'Aperçu en direct de la boutique (Mise à jour instantanée)',
      navLinksPreview: 'Accueil · Talons · Sneakers',
      formTitle: 'Personnaliser les textes et images de la vitrine',
      formSub: 'Modifiez le nom, la barre d’annonce, la bannière Hero et les avantages',
      saveBtn: 'Enregistrer',
      storeNameLabel: 'Nom de la boutique',
      logoLabel: 'Changer le logo (Depuis le téléphone)',
      logoUploadTitle: 'Importer le logo',
      chooseBtn: 'Choisir',
      annSwitchTitle: 'Afficher la barre d’annonce rose en haut du site',
      annSwitchSub: 'Pour annoncer la livraison gratuite ou les promotions',
      annTextLabel: 'Texte de la barre d’annonce',
      heroTitleLabel: 'Titre principal de la bannière (Hero)',
      heroBtnLabel: 'Texte du bouton d’action',
      heroSubLabel: 'Sous-titre de la bannière',
      heroImgLabel: 'Image de la bannière principale (Importation directe)',
      heroImgTitle: 'Appuyez pour importer une nouvelle image de bannière',
      heroImgSub: 'S’affiche immédiatement dans l’aperçu ci-dessus',
      featLabel: (i) => `Avantage ${i} (Symbole & Titre)`,
      featDescLabel: (i) => `Description de l’avantage ${i}`,
      saveAllCmsBtn: 'Enregistrer et appliquer à la boutique',
    },
    lp: {
      editTitle: (t) => `Modifier l’offre : ${t}`,
      createTitle: '+ Créer une Landing Page promotionnelle',
      sub: 'Page dédiée à une offre spéciale avec formulaire de commande rapide intégré',
      cancelBtn: 'Annuler',
      offerTitleLabel: 'Titre de l’offre promotionnelle',
      offerTitlePlaceholder: 'Ex: Offre VIP : Escarpins Rose + Sac de soirée offert',
      slugLabel: 'Lien personnalisé (Slug)',
      origPriceLabel: 'Prix initial avant remise (DA)',
      discPriceLabel: 'Prix promo (DA)',
      mainImgLabel: 'Photo principale de l’offre (Depuis téléphone)',
      mainImgTitle: 'Importer la photo',
      mainImgSub: 'Depuis la galerie',
      galleryLabel: 'Galerie photos de l’offre',
      galleryTitle: (n) => `Ajouter à la galerie (${n})`,
      gallerySub: 'Sélection multiple',
      addPhotosBtn: '+ Photos',
      descLabel: 'Description marketing de l’offre',
      descPlaceholder: 'Décrivez les avantages du modèle et de la promotion...',
      updateBtn: 'Mettre à jour la Landing Page',
      createBtn: '+ Créer et publier la Landing Page',
      activeListTitle: (n) => `Landing Pages Actives (${n})`,
      activeListSub: 'Cliquez sur "Aperçu" pour tester le formulaire de commande rapide',
      previewBtn: 'Aperçu de l’offre',
      modalHeader: (slug) => `Aperçu de la Landing Page (${slug})`,
      closeModal: 'Fermer',
      quickOrderTitle: 'Commandez maintenant — Paiement à la livraison',
      quickOrderSub: 'Remplissez vos coordonnées pour recevoir votre colis à domicile',
      fullNamePlaceholder: 'Nom et Prénom *',
      phonePlaceholder: 'Numéro de téléphone *',
      addressPlaceholder: 'Adresse complète (Commune et quartier) *',
      confirmQuickOrder: (price) => `Confirmer la commande — ${price}`,
    },
    ship: {
      title: 'Ajouter une nouvelle Wilaya',
      sub: 'Ajoutez une wilaya avec ses tarifs de livraison à domicile et stop-desk',
      thresholdLabel: 'Seuil de livraison gratuite (DA)',
      saveThresholdBtn: 'Enregistrer le seuil',
      addWilayaLabel: 'Ajouter une wilaya (Code & Nom)',
      wilayaNamePlaceholder: 'Nom de la wilaya (ex: Béjaïa)',
      feesLabel: 'Tarifs Domicile & Stop-Desk (DA)',
      homePlaceholder: 'Domicile 600',
      deskPlaceholder: 'Stop-Desk 400',
      addBtn: '+ Ajouter la wilaya',
      ratesListTitle: (n) => `Tarifs de livraison par Wilaya (${n})`,
      ratesListSub: 'Modifiez directement les tarifs, sauvegarde automatique',
      homeFeeLabel: 'À Domicile (DA)',
      deskFeeLabel: 'Stop-Desk (DA)',
    },
    toasts: {
      loggedOut: 'Déconnexion réussie — Retour à la boutique',
      lpDeleted: 'Landing Page supprimée',
      prodDeleted: 'Produit supprimé du catalogue',
      newOrderAdded: (id) => `Nouvelle commande #${id} enregistrée`,
      orderDeleted: 'Commande supprimée',
      wilayaDeleted: 'Wilaya supprimée',
      photoUploaded: 'Photo importée avec succès',
      galleryAdded: (n) => `${n} photos ajoutées`,
      prodPhotoUpdated: (name) => `Photo de "${name}" mise à jour`,
      invalidImage: 'Veuillez sélectionner une image valide',
      orderStatusChanged: (id, st) => `Statut de #${id} changé en "${st}"`,
      cmsSaved: 'Modifications de la vitrine enregistrées',
      lpUpdated: 'Offre promotionnelle mise à jour',
      lpCreated: 'Nouvelle Landing Page créée',
      prodUpdated: 'Produit mis à jour avec succès',
      prodCreated: 'Nouveau modèle ajouté à la boutique',
      thresholdSaved: 'Seuil de livraison gratuite enregistré',
      wilayaAdded: (name) => `Wilaya ${name} ajoutée`,
      langSwitched: 'Langue changée en Français',
    },
  },
};

function t() {
  return ADMIN_I18N[getLang()];
}

const CATEGORY_LABELS = {
  Talons: { ar: 'كعب عالي (Talons)', fr: 'Talons (Escarpins)' },
  Sneakers: { ar: 'سنيكرز (Sneakers)', fr: 'Sneakers (Baskets)' },
  Sandales: { ar: 'صنادل (Sandales)', fr: 'Sandales' },
  Ballerines: { ar: 'باليرين (Ballerines)', fr: 'Ballerines' },
  Bottes: { ar: 'بوتين (Bottes)', fr: 'Bottes & Bottines' },
};

/**
 * توحيد حالات الطلب بين العربية والفرنسية
 */
const STATUS_KEYS = ['new', 'confirming', 'shipping', 'delivered', 'cancelled'];

function normalizeStatusKey(rawStatus) {
  if (!rawStatus) return 'new';
  const map = {
    new: 'new',
    'جديد': 'new',
    Nouveau: 'new',
    confirming: 'confirming',
    'قيد التأكيد': 'confirming',
    'En confirmation': 'confirming',
    shipping: 'shipping',
    'قيد الشحن': 'shipping',
    'قيد التجهيز للشحن': 'shipping',
    'En livraison': 'shipping',
    'En cours de préparation': 'shipping',
    delivered: 'delivered',
    'تم التسليم': 'delivered',
    Livré: 'delivered',
    cancelled: 'cancelled',
    'ملغى': 'cancelled',
    Annulé: 'cancelled',
  };
  return map[rawStatus] || 'new';
}

function getStatusLabel(rawStatus) {
  const key = normalizeStatusKey(rawStatus);
  return t().orders.statuses[key] || rawStatus;
}

function getStatusBadgeClass(rawStatus) {
  const key = normalizeStatusKey(rawStatus);
  switch (key) {
    case 'new':
      return 'adm-badge adm-badge-new';
    case 'confirming':
      return 'adm-badge adm-badge-confirming';
    case 'shipping':
      return 'adm-badge adm-badge-shipping';
    case 'delivered':
      return 'adm-badge adm-badge-delivered';
    case 'cancelled':
      return 'adm-badge adm-badge-cancelled';
    default:
      return 'adm-badge adm-badge-new';
  }
}

/**
 * قراءة وضغط ملف الصورة المرفوع من الهاتف أو الحاسوب
 */
function readAndCompressImageFile(file, maxWidth = 760, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = String(e.target?.result || '');
      const img = new Image();
      img.onload = () => {
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Read error'));
    reader.readAsDataURL(file);
  });
}

function renderShoeStyleHeelSVG() {
  return `
    <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0;">
      <defs>
        <linearGradient id="admHeelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF5C93" />
          <stop offset="55%" stop-color="#DE1B61" />
          <stop offset="100%" stop-color="#A30E44" />
        </linearGradient>
      </defs>
      <path
        d="M52 10C48 10 44 16 39 26C33 37 25 44 15 46C9 47 6 49 6 51C6 53 10 54 18 54C29 54 37 46 44 35C46 32 48 33 48 37V53C48 54.1 48.9 55 50 55C51.1 55 52 54.1 52 53V24C54 19 55 10 52 10Z"
        fill="url(#admHeelGrad)"
      />
    </svg>
  `;
}

const DEFAULT_CMS = {
  storeName: 'ShoeStyle',
  logoUrl: IMAGES.talons,
  announcementText: '',
  announcementEnabled: false,
  footerFarewell: 'À bientôt sur ShoeStyle ♥ ♥',
  heroTitle: 'أناقة في كل خطوة · Élégance à chaque pas',
  heroSubtitle:
    'اكتشفي أحدث تشكيلة من الأحذية النسائية الفاخرة، الكعب الوردي اللامع، والسنيكرز العصرية.',
  heroBgUrl: IMAGES.hero,
  heroBtnText: 'اكتشفي التشكيلة · Découvrir',
  heroBtnLink: 'Talons',
  phone: '0550 12 34 56',
  location_ar: 'الجزائر العاصمة — باب الزوار، المركز التجاري',
  location_fr: 'Alger — Bab Ezzouar, Centre Commercial',
  instagramUrl: 'https://instagram.com/shoestyle.dz',
  facebookUrl: 'https://facebook.com/shoestyle.dz',
  tiktokUrl: 'https://tiktok.com/@shoestyle.dz',
  whatsappNumber: '213550123456',
  fbPixelId: '',
  tiktokPixelId: '',
  snapPixelId: '',
  googleTagId: '',
  features: [
    {
      icon: '01',
      title: 'توصيل سريع 69 ولاية · Livraison 69 Wilayas',
      desc: 'شحن مباشر لباب المنزل أو المكتب خلال 24-48 ساعة',
    },
    {
      icon: '02',
      title: 'الدفع عند الاستلام · Paiement à la livraison',
      desc: 'معاينة الطلبية والتأكد من المقاس قبل الدفع بكل أمان',
    },
    {
      icon: '03',
      title: 'ضمان الاستبدال · Échange garanti',
      desc: 'إمكانية استبدال المقاس مجاناً خلال 7 أيام من الاستلام',
    },
  ],
};

const INITIAL_DEFAULT_WILAYAS = WILAYAS.map((w) => ({ ...w }));

function ensureAll69Wilayas(savedRates) {
  if (Array.isArray(savedRates) && savedRates.length > 0 && savedRates.length !== 58) {
    return savedRates
      .filter((r) => r && r.code)
      .map((r) => {
        const cleanCode = String(r.code).trim().padStart(2, '0');
        const foundDefault = INITIAL_DEFAULT_WILAYAS.find((w) => w.code === cleanCode);
        const homeFee = Number(r.homeFee ?? foundDefault?.fee ?? 500);
        return {
          code: cleanCode,
          name: r.name || foundDefault?.name_ar || r.name_fr || cleanCode,
          name_fr: r.name_fr || foundDefault?.name_fr || r.name || cleanCode,
          homeFee,
          deskFee: Number(r.deskFee ?? Math.max(250, homeFee - 150)),
        };
      });
  }

  const mapByCode = new Map();
  if (Array.isArray(savedRates)) {
    savedRates.forEach((r) => {
      if (r && r.code) mapByCode.set(String(r.code).trim().padStart(2, '0'), r);
    });
  }
  const merged = INITIAL_DEFAULT_WILAYAS.map((w) => {
    const existing = mapByCode.get(w.code);
    if (existing) {
      mapByCode.delete(w.code);
      return {
        code: w.code,
        name: existing.name || w.name_ar,
        name_fr: existing.name_fr || w.name_fr,
        homeFee: Number(existing.homeFee ?? w.fee),
        deskFee: Number(existing.deskFee ?? Math.max(250, w.fee - 150)),
      };
    }
    return {
      code: w.code,
      name: w.name_ar,
      name_fr: w.name_fr,
      homeFee: w.fee,
      deskFee: Math.max(250, w.fee - 150),
    };
  });
  mapByCode.forEach((customRate) => merged.push(customRate));
  return merged;
}

const DEFAULT_LANDING_PAGES = [
  {
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
    gallery: [IMAGES.sneakers],
    description:
      'نعل خفيف مضاد للانزلاق وتصميم عصري ناعم يناسب الجامعة والعمل والنزهات اليومية.',
    offerEnabled: true,
    offerMinQty: 2,
    offerFreeShipping: true,
    offerText: 'اشترِ 2 واحصل على شحن مجاني',
    quickFormEnabled: true,
    createdAt: '2026-11-09',
  },
];

const DEFAULT_ORDERS = [
  {
    id: 'SS-8491',
    date: '2026-11-09',
    fullName: 'Sara Benali / سارة بن علي',
    phone: '0554 12 89 34',
    wilaya: '16 - Alger / الجزائر',
    address: 'Hydra, Rue des Frères Bouadou / حي حيدرة',
    itemsSummary: 'Escarpins Élégants Rose (37 × 1) + Baskets Mode (38 × 1)',
    total: 9380,
    status: 'new',
  },
  {
    id: 'SS-8488',
    date: '2026-11-09',
    fullName: 'Yasmine Mansouri / ياسمين منصوري',
    phone: '0661 45 78 90',
    wilaya: '31 - Oran / وهران',
    address: 'Akid Lotfi / حي العقيد لطفي',
    itemsSummary: 'Sandales Soirée Dorées (38 × 1)',
    total: 5390,
    status: 'confirming',
  },
  {
    id: 'SS-8475',
    date: '2026-11-08',
    fullName: 'Nourhane Kacimi / نورهان قاسمي',
    phone: '0770 98 23 11',
    wilaya: '25 - Constantine / قسنطينة',
    address: 'Ali Mendjeli UV 7 / علي منجلي',
    itemsSummary: 'Bottines Cuir Noir (39 × 1)',
    total: 6490,
    status: 'shipping',
  },
  {
    id: 'SS-8460',
    date: '2026-11-07',
    fullName: 'Meriem Bouzid / مريم بوزيد',
    phone: '0550 33 21 09',
    wilaya: '19 - Sétif / سطيف',
    address: 'Cité Boumarchi / حي بومرشي',
    itemsSummary: 'Ballerines Mary Jane (37 × 2)',
    total: 7480,
    status: 'delivered',
  },
];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === INVENTORY_STORAGE_KEY && Array.isArray(parsed)) {
      return parsed.filter((item) => item && !DEMO_PRODUCT_IDS.has(item.id));
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function loadInitialCategories() {
  try {
    const v2Raw = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (v2Raw) {
      const parsed = JSON.parse(v2Raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((c) => c && !DEMO_CATEGORY_IDS.has(c.id));
      }
    }
    const v1Raw = localStorage.getItem(LEGACY_CATEGORIES_KEY);
    if (v1Raw) {
      const parsedV1 = JSON.parse(v1Raw);
      localStorage.removeItem(LEGACY_CATEGORIES_KEY);
      if (Array.isArray(parsedV1)) {
        const customCats = parsedV1.filter((c) => c && !DEMO_CATEGORY_IDS.has(c.id));
        if (customCats.length > 0) {
          saveJSON(CATEGORIES_STORAGE_KEY, customCats);
          return customCats;
        }
      }
    }
  } catch {
    // ignore storage read error
  }
  return [];
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    try {
      localStorage.removeItem(LEGACY_CATEGORIES_KEY);
      localStorage.removeItem('shoestyle_orders_v1');
      if (key === INVENTORY_STORAGE_KEY && Array.isArray(value)) {
        const compact = value.map((item) => ({
          ...item,
          gallery: item.image ? [item.image] : [],
        }));
        localStorage.setItem(key, JSON.stringify(compact));
      } else {
        const invRaw = localStorage.getItem(INVENTORY_STORAGE_KEY);
        if (invRaw) {
          const invParsed = JSON.parse(invRaw);
          if (Array.isArray(invParsed)) {
            const compactInv = invParsed.map((item) => ({
              ...item,
              gallery: [],
            }));
            localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(compactInv));
          }
        }
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // ignore if still over quota
    }
  }
}

function buildSizeStockRange(fromSize = 36, toSize = 41, defaultQty = 5, existingMap = {}) {
  const start = Math.min(Number(fromSize) || 36, Number(toSize) || 41);
  const end = Math.max(Number(fromSize) || 36, Number(toSize) || 41);
  const map = {};
  for (let sz = start; sz <= end; sz++) {
    map[sz] =
      existingMap && existingMap[sz] !== undefined
        ? Math.max(0, Number(existingMap[sz]))
        : Math.max(0, Number(defaultQty));
  }
  return map;
}

function sumSizeStock(sizeStockMap) {
  if (!sizeStockMap || typeof sizeStockMap !== 'object') return 0;
  return Object.entries(sizeStockMap).reduce((sum, [k, v]) => {
    if (k.startsWith('__')) return sum;
    return sum + Math.max(0, Number(v || 0));
  }, 0);
}

/**
 * توليد وتجهيز جميع حقول المنتج تلقائياً بناءً على وصف مختصر أو نوع الحذاء
 */
function generateProductFromBrief(rawBrief = '') {
  const text = (rawBrief || 'صندل بيج بكعب مريح للسهرات').trim();
  const lower = text.toLowerCase();

  // 1. استنتاج التصنيف (Category)
  let category = 'Talons';
  let catSlug = 'escarpin-talon';
  let catArLabel = 'حذاء بكعب';
  let catFrNoun = 'Escarpins à Talon';

  if (lower.includes('صندل') || lower.includes('sandale')) {
    category = 'Sandales';
    catSlug = 'sandale-talon';
    catArLabel = 'صندل نسائي';
    catFrNoun = 'Sandales à Talon';
  } else if (
    lower.includes('رياضي') ||
    lower.includes('سنيكرز') ||
    lower.includes('باسكت') ||
    lower.includes('sneaker') ||
    lower.includes('basket')
  ) {
    category = 'Sneakers';
    catSlug = 'sneakers-mode';
    catArLabel = 'حذاء رياضي سنيكرز';
    catFrNoun = 'Sneakers Chic';
  } else if (
    lower.includes('بوت') ||
    lower.includes('بوتين') ||
    lower.includes('botte') ||
    lower.includes('bottine')
  ) {
    category = 'Bottes';
    catSlug = 'bottines-cuir';
    catArLabel = 'بوت نسائي أنيق';
    catFrNoun = 'Bottines Élégantes';
  } else if (
    lower.includes('باليرين') ||
    lower.includes('مسطح') ||
    lower.includes('ballerine')
  ) {
    category = 'Ballerines';
    catSlug = 'ballerine-confort';
    catArLabel = 'باليرين مريحة';
    catFrNoun = 'Ballerines Souples';
  }

  // 2. استنتاج اللون وكود الـ Hex
  let colorName = 'Beige';
  let colorHex = '#D2B48C';
  let colorAr = 'بيج ناعم';
  let colorSlug = 'beige';

  if (lower.includes('أسود') || lower.includes('اسود') || lower.includes('noir') || lower.includes('black')) {
    colorName = 'Noir';
    colorHex = '#1A1A1E';
    colorAr = 'أسود ملكي';
    colorSlug = 'noir';
  } else if (lower.includes('أبيض') || lower.includes('ابيض') || lower.includes('blanc') || lower.includes('white')) {
    colorName = 'Blanc';
    colorHex = '#F8F6F4';
    colorAr = 'أبيض ناصع';
    colorSlug = 'blanc';
  } else if (lower.includes('أحمر') || lower.includes('احمر') || lower.includes('rouge') || lower.includes('red')) {
    colorName = 'Rouge';
    colorHex = '#B91C2E';
    colorAr = 'أحمر جذاب';
    colorSlug = 'rouge';
  } else if (lower.includes('ذهبي') || lower.includes('دوغي') || lower.includes('dore') || lower.includes('doré') || lower.includes('gold')) {
    colorName = 'Doré';
    colorHex = '#D4AF37';
    colorAr = 'ذهبي لامع';
    colorSlug = 'dore';
  } else if (lower.includes('وردي') || lower.includes('روز') || lower.includes('rose') || lower.includes('pink')) {
    colorName = 'Rose';
    colorHex = '#F38BA8';
    colorAr = 'وردي بودري';
    colorSlug = 'rose-poudre';
  }

  // 3. توليد الاسم التسويقي بالعربية والفرنسية والرابط (Slug)
  const name_ar =
    text.length > 6
      ? `${text} — إصدار فاخر باللون ال${colorAr}`
      : `${catArLabel} فاخر باللون ال${colorAr}`;
  const name_fr = `${catFrNoun} ${colorName} Raffiné`;
  const slug = `${catSlug}-${colorSlug}`;

  // 4. توليد الوصف التفصيلي بالعربية والفرنسية
  const description_ar = `تألقي بإطلالة أنثوية ساحرة مع ${name_ar}. صُمم بعناية فائقة من خامات عالية الجودة بلمسة ناعمة مع نعل داخلي مبطن ومريح للقدم طوال اليوم، ليمنحكِ الثبات والأناقة في السهرات، المناسبات الخاصة، والإطلالات الراقية.`;
  const description_fr = `Sublimez votre allure avec ces ${name_fr}. Conçues dans une matière souple de qualité supérieure avec une semelle intérieure coussinée ultra-confortable, elles offrent un maintien parfait et un style chic pour vos soirées et sorties quotidiennes.`;

  // 5. السعر المقترح والمقاسات
  const originalPrice = category === 'Bottes' ? 6900 : category === 'Talons' ? 6200 : 5400;
  const discountPrice = category === 'Bottes' ? 5490 : category === 'Talons' ? 4790 : 3990;
  const sizeFrom = 36;
  const sizeTo = 41;
  const defaultSizeStock = 5;
  const sizeStock = buildSizeStockRange(sizeFrom, sizeTo, defaultSizeStock);

  const categoryImageMap = {
    Talons: IMAGES.talons,
    Sneakers: IMAGES.sneakers,
    Sandales: IMAGES.sandales,
    Bottes: IMAGES.ballerinesBoots,
    Ballerines: IMAGES.ballerinesBoots,
  };

  return {
    brief: text,
    name: name_ar,
    name_fr,
    slug,
    category,
    description_ar,
    description_fr,
    originalPrice,
    discountPrice,
    isVisible: true,
    isNew: true,
    isBestSeller: true,
    isSpecialOffer: true,
    colorName,
    colorHex,
    sizeFrom,
    sizeTo,
    defaultSizeStock,
    sizeStock,
    stock: sumSizeStock(sizeStock),
    image: categoryImageMap[category] || IMAGES.talons,
  };
}

export const adminState = {
  activeTab: 'stats', // 'stats' | 'inventory' | 'orders' | 'cms' | 'landing' | 'shipping'
  isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  editingLandingId: null,
  editingProductId: null,
  editingCategoryId: null,
  previewLandingId: null,
  orderFilterStatus: 'all',
  inventorySearch: '',
  shippingSearch: '',
  showAllWilayas: false,

  // إخفاء النماذج الطويلة افتراضياً لتكون اللوحة مريحة للعين وبسيطة جداً
  isProductFormOpen: false,
  isCategoryFormOpen: false,
  showAdvancedProductFields: false,
  isLandingFormOpen: false,

  draftCategoryImage: IMAGES.talons,

  // حالة مسودة إضافة/تعديل المنتج التفصيلية
  draftProductBrief: '',
  draftGeneratedPreview: null,
  draftProductImage: '',
  draftProductGallery: [],
  draftProductForm: {
    name: '',
    name_fr: '',
    slug: '',
    category: '',
    description_ar: '',
    description_fr: '',
    originalPrice: '',
    discountPrice: '',
    isVisible: true,
    isNew: false,
    isBestSeller: false,
    isSpecialOffer: false,
    offerEnabled: false,
    offerMinQty: 2,
    offerFreeShipping: false,
    offerText: '',
    colorName: 'Beige',
    colorHex: '#D2B48C',
    sizeFrom: 36,
    sizeTo: 41,
    defaultSizeStock: 5,
    sizeStock: buildSizeStockRange(36, 41, 5),
    variants: [],
  },

  draftLandingMainImage: IMAGES.talons,
  draftLandingGallery: [IMAGES.talons],
  draftCmsLogo: null,
  draftCmsHeroBg: null,

  cms: { ...DEFAULT_CMS, ...loadJSON(CMS_STORAGE_KEY, DEFAULT_CMS), announcementEnabled: false },
  categories: loadInitialCategories(),
  landingPages: loadJSON(LANDING_STORAGE_KEY, DEFAULT_LANDING_PAGES),
  inventory: loadJSON(INVENTORY_STORAGE_KEY, []),
  orders: loadJSON(ORDERS_ADMIN_KEY, DEFAULT_ORDERS),
  shipping: (() => {
    const loaded = loadJSON(SHIPPING_STORAGE_KEY, null);
    return {
      freeShippingThreshold: 0,
      rates: ensureAll69Wilayas(loaded?.rates),
    };
  })(),

  syncWithStorefront() {
    if (Array.isArray(this.cms?.features)) {
      this.cms.features = this.cms.features.map((f, idx) => ({
        ...f,
        icon: String(f.icon || '').replace(/\p{Extended_Pictographic}/gu, '').trim() || `0${idx + 1}`,
      }));
    }

    if (Array.isArray(this.categories)) {
      CATEGORIES.length = 0;
      this.categories.forEach((cat) => {
        if (cat.id === 'Bottes' && (!cat.image || cat.image.includes('shoe_ballerines_boots'))) {
          cat.image = IMAGES.boots;
        } else if (cat.id === 'Ballerines' && (!cat.image || cat.image.includes('shoe_ballerines_boots'))) {
          cat.image = IMAGES.ballerines;
        }
        CATEGORIES.push({ ...cat });
        CATEGORY_LABELS[cat.id] = {
          ar: `${cat.name_ar} (${cat.name_fr || cat.id})`,
          fr: `${cat.name_fr || cat.id} (${cat.name_ar})`,
        };
      });
    }

    if (Array.isArray(this.shipping?.rates) && this.shipping.rates.length > 0) {
      WILAYAS.length = 0;
      this.shipping.rates.forEach((r) => {
        if (!r || !r.code) return;
        const cleanCode = String(r.code).trim().padStart(2, '0');
        WILAYAS.push({
          code: cleanCode,
          name_ar: r.name || r.name_fr || cleanCode,
          name_fr: r.name_fr || r.name || cleanCode,
          fee: Number(r.homeFee ?? 500),
          deskFee: Number(r.deskFee ?? 350),
        });
      });
    }

    // إعادة بناء قائمة منتجات الواجهة (PRODUCTS) بالكامل من المخزون الحالي لضمان انعكاس أي إضافة أو تعديل أو إخفاء أو حذف فوراً
    PRODUCTS.length = 0;
    this.inventory.forEach((invItem) => {
      if (invItem.colorName && invItem.colorHex) {
        if (!COLOR_SWATCHES[invItem.colorName]) {
          COLOR_SWATCHES[invItem.colorName] = {
            hex: invItem.colorHex,
            label_fr: invItem.colorName,
            label_ar: invItem.colorName,
          };
        }
      }
      if (invItem.colorHexes && typeof invItem.colorHexes === 'object') {
        Object.entries(invItem.colorHexes).forEach(([cName, cHex]) => {
          if (cName && cHex && !COLOR_SWATCHES[cName]) {
            COLOR_SWATCHES[cName] = {
              hex: cHex,
              label_fr: cName,
              label_ar: cName,
            };
          }
        });
      }

      if (invItem.isVisible === false) {
        return;
      }

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

      // الحفاظ على المقاسات الفعلية فقط؛ إذا لم يتم إدخال أي مقاس تظل المصفوفة فارغة []
      const sizesList = Array.isArray(invItem.sizes)
        ? invItem.sizes.filter(
            (s) => s !== null && s !== undefined && String(s).trim() !== '' && String(s) !== 'default' && String(s) !== 'NaN'
          )
        : [];

      const colorsList =
        Array.isArray(invItem.colors) && invItem.colors.length > 0
          ? invItem.colors
          : [invItem.colorName || 'Beige'];

      const cleanGallery =
        Array.isArray(invItem.gallery) && invItem.gallery.filter(Boolean).length > 0
          ? [...invItem.gallery.filter(Boolean)]
          : [invItem.image].filter(Boolean);

      PRODUCTS.push({
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
        isVisible: true,
        isNew: Boolean(invItem.isNew ?? true),
        isBestSeller: Boolean(invItem.isBestSeller ?? false),
        isSpecialOffer: Boolean(invItem.isSpecialOffer ?? false),
        offerEnabled: invItem.offerEnabled !== false,
        offerMinQty: Math.max(2, Number(invItem.offerMinQty || 2)),
        offerFreeShipping: invItem.offerFreeShipping !== false,
        offerText: invItem.offerText || '',
        colorName: invItem.colorName || colorsList[0] || 'Beige',
        colorHex: invItem.colorHex || '#D2B48C',
        colorHexes: invItem.colorHexes ? { ...invItem.colorHexes } : {},
        variants: Array.isArray(invItem.variants) ? invItem.variants.map((v) => ({ ...v })) : [],
        colors: colorsList,
        sizes: sizesList,
        image: cleanGallery[0] || invItem.image,
        gallery: cleanGallery,
        description_fr:
          invItem.description_fr || invItem.name_fr || invItem.name,
        description_ar:
          invItem.description_ar ||
          `${invItem.name || invItem.name_fr} بتصميم عصري وخامة مريحة عالية الجودة.`,
      });
    });
  },

  reloadFromStorage() {
    this.cms = { ...DEFAULT_CMS, ...loadJSON(CMS_STORAGE_KEY, this.cms), announcementEnabled: false };
    this.categories = loadJSON(CATEGORIES_STORAGE_KEY, this.categories);
    this.landingPages = loadJSON(LANDING_STORAGE_KEY, this.landingPages);
    this.inventory = loadJSON(INVENTORY_STORAGE_KEY, this.inventory);
    this.orders = loadJSON(ORDERS_ADMIN_KEY, this.orders);
    const loadedShip = loadJSON(SHIPPING_STORAGE_KEY, this.shipping);
    this.shipping = {
      freeShippingThreshold: 0,
      rates: ensureAll69Wilayas(loadedShip?.rates),
    };
    this.syncWithStorefront();
  },

  saveAll() {
    this.cms.announcementEnabled = false;
    saveJSON(CATEGORIES_STORAGE_KEY, this.categories);
    saveJSON(CMS_STORAGE_KEY, this.cms);
    saveJSON(ORDERS_ADMIN_KEY, this.orders);
    saveJSON(SHIPPING_STORAGE_KEY, this.shipping);
    saveJSON(LANDING_STORAGE_KEY, this.landingPages);
    saveJSON(INVENTORY_STORAGE_KEY, this.inventory);
    this.syncWithStorefront();
    notifyCrossTabSync('all', 'save');
  },
};

// تزامن فوري ومباشر مع منتجات المتجر فور تحميل الملف لتفادي وميض المنتجات التجريبية
adminState.syncWithStorefront();

export async function initAdminFromSupabase() {
  const remoteData = await fetchAllFromSupabase();
  if (!remoteData) return false;

  // إذا كانت قاعدة بيانات Supabase متصلة لكنها فارغة تماماً (عند الربط لأول مرة)، نرفع بيانات المتجر الحالية إليها تلقائياً
  if (
    isSupabaseConfigured &&
    !remoteData.products &&
    !remoteData.cms &&
    !remoteData.landingPages
  ) {
    await syncAllStateToSupabase(adminState);
    return false;
  }

  let changed = false;
  if (remoteData.products) {
    adminState.inventory = remoteData.products;
    changed = true;
  }
  if (remoteData.orders) {
    adminState.orders = remoteData.orders;
    changed = true;
  }
  if (remoteData.cms) {
    const { freeShippingThreshold, ...cmsFields } = remoteData.cms;
    adminState.cms = { ...adminState.cms, ...cmsFields, announcementEnabled: false };
    changed = true;
  }
  if (Array.isArray(remoteData.categories) && remoteData.categories.length > 0) {
    adminState.categories = remoteData.categories;
    changed = true;
  }
  if (remoteData.landingPages) {
    adminState.landingPages = remoteData.landingPages;
    changed = true;
  }
  if (remoteData.shippingRates) {
    adminState.shipping.rates = ensureAll69Wilayas(remoteData.shippingRates);
    changed = true;
  }

  if (changed) {
    adminState.saveAll();
    renderAdminDashboard();
  }
  return changed;
}

adminState.syncWithStorefront();

function getProdDisplayName(prod) {
  const lang = getLang();
  return lang === 'fr' ? prod.name_fr || prod.name : prod.name || prod.name_fr;
}

function getWilayaDisplayName(rate) {
  const lang = getLang();
  if (lang === 'fr') {
    if (rate.name_fr) return rate.name_fr;
    const found = WILAYAS.find((w) => w.code === rate.code);
    return found ? found.name_fr : rate.name;
  }
  return rate.name;
}

export function renderAdminDashboard() {
  const root = document.getElementById('admin-dashboard-root');
  if (!root) return;

  const lang = getLang();
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const tr = t();

  const lowStockItems = adminState.inventory.filter((item) => Number(item.stock) < 5);
  const newOrdersCount = adminState.orders.filter(
    (o) => normalizeStatusKey(o.status) === 'new'
  ).length;
  const totalRevenue = adminState.orders
    .filter((o) => normalizeStatusKey(o.status) !== 'cancelled')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const tabs = [
    {
      id: 'stats',
      label: tr.tabs.stats,
      shortLabel: tr.tabs.statsShort,
      badge: adminState.orders.length,
      icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    },
    {
      id: 'inventory',
      label: tr.tabs.inventory,
      shortLabel: tr.tabs.inventoryShort,
      badge: adminState.inventory.length,
      icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`,
    },
    {
      id: 'orders',
      label: tr.tabs.orders,
      shortLabel: tr.tabs.ordersShort,
      badge: newOrdersCount > 0 ? `${newOrdersCount}` : adminState.orders.length,
      icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>`,
    },
    {
      id: 'cms',
      label: tr.tabs.cms,
      shortLabel: tr.tabs.cmsShort,
      badge: 'CMS',
      icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/></svg>`,
    },
    {
      id: 'landing',
      label: tr.tabs.landing,
      shortLabel: tr.tabs.landingShort,
      badge: adminState.landingPages.length,
      icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    },
    {
      id: 'shipping',
      label: tr.tabs.shipping,
      shortLabel: tr.tabs.shippingShort,
      badge: adminState.shipping.rates.length,
      icon: `<svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1"/></svg>`,
    },
  ];

  root.innerHTML = `
    <div class="adm-shell" dir="${dir}" lang="${lang}">
      <!-- خلفية حجب لإغلاق الشريط الجانبي عند الضغط خارجه -->
      <div id="adm-sidebar-overlay" class="adm-sidebar-overlay ${adminState.isSidebarOpen ? 'open' : ''}" data-adm-action="close-admin-sidebar"></div>

      <!-- الشريط الجانبي القابل للفتح والإغلاق الذي يضم جميع نوافذ لوحة التحكم (على الجهة اليمنى في اللغتين) -->
      <aside id="adm-sidebar" class="adm-sidebar ${adminState.isSidebarOpen ? 'open' : 'collapsed'}">
        <div class="adm-sidebar-header">
          <div class="adm-brand-lockup">
            ${renderShoeStyleHeelSVG()}
            <div class="min-w-0">
              <span class="adm-brand-script">${adminState.cms.storeName}</span>
              <span class="adm-sidebar-subtitle">${lang === 'fr' ? 'Panneau de gestion' : 'لوحة التحكم والإدارة'}</span>
            </div>
          </div>
          <button
            type="button"
            data-adm-action="close-admin-sidebar"
            class="adm-sidebar-close-btn"
            title="${lang === 'fr' ? 'Fermer le menu' : 'إغلاق القائمة'}"
            aria-label="Close sidebar"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="adm-sidebar-section-title">
          <span>${lang === 'fr' ? 'Niveaux & Fenêtres' : 'نوافذ الإدارة'}</span>
        </div>

        <nav class="adm-sidebar-nav">
          ${tabs
            .map(
              (tab) => `
              <button
                type="button"
                data-adm-action="switch-tab"
                data-tab="${tab.id}"
                class="adm-sidebar-item ${adminState.activeTab === tab.id ? 'active' : ''}"
              >
                <span class="adm-sidebar-item-icon">${tab.icon}</span>
                <span class="adm-sidebar-item-label">${tab.label}</span>
                <span class="adm-sidebar-item-badge">${tab.badge}</span>
              </button>
            `
            )
            .join('')}
        </nav>

        <div class="adm-sidebar-footer">
          <div class="adm-sidebar-actions">
            <button
              type="button"
              data-adm-action="toggle-admin-lang"
              class="adm-btn adm-btn-soft adm-btn-sm w-full justify-center"
            >
              <span>${tr.switchLangBtn}</span>
            </button>
            <button
              type="button"
              data-adm-action="close-admin"
              class="adm-btn adm-btn-pink adm-btn-sm w-full justify-center"
            >
              <span>${tr.viewStore}</span>
            </button>
            <button
              type="button"
              data-adm-action="logout-admin"
              class="adm-btn adm-btn-outline adm-btn-sm w-full justify-center"
            >
              <span>${tr.logout}</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- المنطقة الرئيسية للمحتوى -->
      <div class="adm-main-wrapper">
        <!-- الهيدر العلوي مع أيقونة فتح وإغلاق الشريط الجانبي فقط بدون نص -->
        <header class="adm-header">
          <div class="adm-header-inner">
            <div class="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                data-adm-action="toggle-admin-sidebar"
                class="adm-sidebar-toggle-btn shrink-0"
                title="${lang === 'fr' ? 'Ouvrir / Fermer le menu' : 'فتح / إغلاق القائمة الجانبية'}"
                aria-label="Toggle Navigation Sidebar"
              >
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>

              <div class="adm-brand-lockup min-w-0">
                <span class="adm-brand-script hidden sm:inline">${adminState.cms.storeName}</span>
                <span class="adm-active-tab-title text-xs font-bold text-[#D81B60] inline-flex items-center px-2.5 py-1 rounded-lg bg-[#FDF0F5] truncate">
                  ${tabs.find((t) => t.id === adminState.activeTab)?.label || ''}
                </span>
              </div>
            </div>

          </div>

        </header>

        <!-- المحتوى الرئيسي المبسط والمناسب للهاتف (صفحة الإحصائيات تظهر هي الأولى) -->
        <main class="adm-container">
          <!-- تبويب 1: الإحصائيات الشاملة (تظهر هي الأولى) -->
          <section id="adm-tab-stats" class="adm-tab-section ${adminState.activeTab === 'stats' ? 'active' : ''}">
            ${renderStatsSection({ totalRevenue, newOrdersCount, lowStockItems })}
          </section>

          <!-- تبويب 2: المنتجات والمخزون -->
          <section id="adm-tab-inventory" class="adm-tab-section ${adminState.activeTab === 'inventory' ? 'active' : ''}">
            ${renderInventorySection()}
          </section>

          <!-- تبويب 3: الطلبات والمبيعات -->
          <section id="adm-tab-orders" class="adm-tab-section ${adminState.activeTab === 'orders' ? 'active' : ''}">
            ${renderOrdersSection()}
          </section>

          <!-- تبويب 4: واجهة ومحتوى الموقع -->
          <section id="adm-tab-cms" class="adm-tab-section ${adminState.activeTab === 'cms' ? 'active' : ''}">
            ${renderCMSSection()}
          </section>

          <!-- تبويب 5: صفحات الهبوط والعروض -->
          <section id="adm-tab-landing" class="adm-tab-section ${adminState.activeTab === 'landing' ? 'active' : ''}">
            ${renderLandingBuilderSection()}
          </section>

          <!-- تبويب 6: أسعار التوصيل والشحن -->
          <section id="adm-tab-shipping" class="adm-tab-section ${adminState.activeTab === 'shipping' ? 'active' : ''}">
            ${renderShippingSection()}
          </section>
        </main>
      </div>
    </div>

    <!-- نافذة معاينة صفحة الهبوط -->
    <div id="adm-landing-modal" class="adm-modal-backdrop ${adminState.previewLandingId ? 'open' : ''}">
      ${renderLandingPreviewModal()}
    </div>
  `;
}

/**
 * نافذة الإحصائيات المستقلة (تظهر فقط عند فتح نافذة الإحصائيات)
 */
function renderStatsSection({ totalRevenue, newOrdersCount, lowStockItems }) {
  const lang = getLang();
  const isFr = lang === 'fr';
  const tr = t();

  const orders = Array.isArray(adminState.orders) ? adminState.orders : [];
  const confirmingCount = orders.filter((o) => normalizeStatusKey(o.status) === 'confirming').length;
  const shippingCount = orders.filter((o) => normalizeStatusKey(o.status) === 'shipping').length;
  const deliveredCount = orders.filter((o) => normalizeStatusKey(o.status) === 'delivered').length;
  const cancelledCount = orders.filter((o) => normalizeStatusKey(o.status) === 'cancelled').length;

  const deliveredRevenue = orders
    .filter((o) => normalizeStatusKey(o.status) === 'delivered')
    .reduce((sum, o) => sum + Number(o.total || 0), 0);

  const totalStockUnits = adminState.inventory.reduce(
    (sum, item) => sum + Math.max(0, Number(item.stock || 0)),
    0
  );

  return `
    <div class="space-y-4">
      <div class="adm-card">
        <div class="adm-card-head">
          <div>
            <h2 class="adm-card-title">${isFr ? 'Tableau des Statistiques' : 'إحصائيات المتجر الشاملة'}</h2>
            <p class="adm-card-sub">${
              isFr
                ? 'Suivez vos ventes, commandes et état du stock en temps réel'
                : 'ملخص دقيق للمبيعات، حالات الطلبات، وحركة المخزون في متجرك'
            }</p>
          </div>
          <span class="adm-badge adm-badge-pink">${orders.length} ${tr.kpi.orderUnit}</span>
        </div>

        <section class="adm-kpi-strip" style="margin-bottom: 0;">
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.totalSales}</span>
            <span class="adm-kpi-num">${formatDA(totalRevenue, lang)}</span>
            <span class="adm-kpi-foot">${tr.kpi.totalOrdersFoot(orders.length)}</span>
          </div>
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.newOrders}</span>
            <span class="adm-kpi-num">${newOrdersCount} ${tr.kpi.orderUnit}</span>
            <span class="adm-kpi-foot">${tr.kpi.awaitingConfirm}</span>
          </div>
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.productsCount}</span>
            <span class="adm-kpi-num">${adminState.inventory.length} ${tr.kpi.shoeUnit}</span>
            <span class="adm-kpi-foot">${tr.kpi.lowStockFoot(lowStockItems.length)}</span>
          </div>
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${isFr ? 'Catégories & Wilayas' : 'الفئات والتوصيل'}</span>
            <span class="adm-kpi-num">${adminState.categories.length} ${isFr ? 'catégories' : 'فئات'}</span>
            <span class="adm-kpi-foot">${tr.kpi.activeWilayas(adminState.shipping.rates.length)}</span>
          </div>
        </section>
      </div>

      <div class="adm-grid-2">
        <div class="adm-card">
          <div class="adm-card-head">
            <div>
              <h3 class="adm-card-title">${isFr ? 'Répartition des Commandes' : 'توزيع حالات الطلبات'}</h3>
              <p class="adm-card-sub">${isFr ? 'Détail par statut de traitement' : 'تفصيل الطلبات حسب مرحلة المعالجة والتوصيل'}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 tabular-nums">
            <div class="p-3 rounded-xl bg-[#FDF2F6] border border-[#FBCFE8]">
              <span class="text-xs font-bold text-[#9D174D] block">${tr.orders.statuses.new}</span>
              <strong class="text-lg font-black text-[#D81B60]">${newOrdersCount}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
              <span class="text-xs font-bold text-[#1E40AF] block">${tr.orders.statuses.confirming}</span>
              <strong class="text-lg font-black text-[#2563EB]">${confirmingCount}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
              <span class="text-xs font-bold text-[#92400E] block">${tr.orders.statuses.shipping}</span>
              <strong class="text-lg font-black text-[#D97706]">${shippingCount}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <span class="text-xs font-bold text-[#065F46] block">${tr.orders.statuses.delivered}</span>
              <strong class="text-lg font-black text-[#059669]">${deliveredCount}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA]">
              <span class="text-xs font-bold text-[#991B1B] block">${tr.orders.statuses.cancelled}</span>
              <strong class="text-lg font-black text-[#DC2626]">${cancelledCount}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7]">
              <span class="text-xs font-bold text-[#3F3F46] block">${isFr ? 'Revenu Livré' : 'مبيعات مستلمة'}</span>
              <strong class="text-sm font-black text-[#18181B]">${formatDA(deliveredRevenue, lang)}</strong>
            </div>
          </div>
        </div>

        <div class="adm-card">
          <div class="adm-card-head">
            <div>
              <h3 class="adm-card-title">${isFr ? 'Aperçu du Catalogue & Stock' : 'ملخص المخزون والمنتجات'}</h3>
              <p class="adm-card-sub">${isFr ? 'Indicateurs rapides du catalogue' : 'نظرة سريعة على حالة توفر المنتجات والعروض'}</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2.5 tabular-nums">
            <div class="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
              <span class="text-xs font-bold text-[#52525B] block">${isFr ? 'Total pièces en stock' : 'إجمالي القطع المتوفرة'}</span>
              <strong class="text-lg font-black text-[#18181B]">${totalStockUnits}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
              <span class="text-xs font-bold text-[#52525B] block">${isFr ? 'Nouveautés (الجديد)' : 'منتجات قسم الجديد'}</span>
              <strong class="text-lg font-black text-[#D81B60]">${adminState.inventory.filter((p) => p.isNew).length}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
              <span class="text-xs font-bold text-[#52525B] block">${isFr ? 'Meilleures ventes' : 'أفضل المبيعات'}</span>
              <strong class="text-lg font-black text-[#18181B]">${adminState.inventory.filter((p) => p.isBestSeller).length}</strong>
            </div>
            <div class="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
              <span class="text-xs font-bold text-[#52525B] block">${isFr ? 'Offres spéciales' : 'العروض الترويجية'}</span>
              <strong class="text-lg font-black text-[#059669]">${adminState.inventory.filter((p) => p.isSpecialOffer).length}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * تنسيق البطاقة النصية المستخرجة وفق الهيكل المطلوب (1. المعلومات الأساسية، 2. السعر والعرض، 3. المقاسات والألوان والمخزون)
 */
function formatGeneratedProductSpec(gen) {
  if (!gen) return '';
  const catAr = CATEGORY_LABELS[gen.category]?.ar || gen.category;
  const yn = (val) => (val ? 'نعم' : 'لا');
  const sizeRows = Object.entries(gen.sizeStock || {})
    .map(([sz, qty]) => `    - مقاس ${sz}: ${qty} قطع`)
    .join('\n');

  return `1. المعلومات الأساسية:
- الاسم بالعربية: ${gen.name}
- Nom en français: ${gen.name_fr}
- الرابط (Slug): ${gen.slug}
- التصنيف: ${catAr} (${gen.category})
- الوصف بالعربية: ${gen.description_ar}
- Description en français: ${gen.description_fr}

2. السعر والعرض:
- السعر الأصلي (د.ج): ${gen.originalPrice} د.ج
- سعر التخفيض (اختياري): ${gen.discountPrice ? `${gen.discountPrice} د.ج` : 'لا يوجد'}
- خيارات العرض:
  * ظاهر في المتجر: ${yn(gen.isVisible)}
  * وصل حديثاً: ${yn(gen.isNew)}
  * الأكثر مبيعاً: ${yn(gen.isBestSeller)}
  * مميز: ${yn(gen.isSpecialOffer)}

3. المقاسات والألوان والمخزون:
- اسم اللون (بالفرنسية/الإنجليزية للواجهة): ${gen.colorName}
- كود اللون (Hex Code): ${gen.colorHex}
- المقاسات والمخزون:
  * نطاق المقاسات: من ${gen.sizeFrom} إلى ${gen.sizeTo}
  * الكمية الافتراضية لكل مقاس: ${gen.defaultSizeStock} قطع
  * جدول تفصيلي للمقاسات والكميات (الإجمالي: ${gen.stock} قطعة):
${sizeRows}`;
}

/**
 * حفظ القيم المدخلة حالياً في نموذج المنتج داخل مسودة draftProductForm قبل إعادة التصيير
 */
function syncCurrentProductFormToDraft() {
  const form = document.getElementById('adm-product-form');
  if (!form) return;
  const fd = new FormData(form);
  const df = adminState.draftProductForm;
  if (!df) return;

  if (fd.has('name')) df.name = String(fd.get('name') || '').trim();
  if (fd.has('name_fr')) df.name_fr = String(fd.get('name_fr') || '').trim();
  if (fd.has('slug')) df.slug = String(fd.get('slug') || '').trim();
  if (fd.has('category')) df.category = String(fd.get('category') || df.category || '').trim();
  if (fd.has('description_ar')) df.description_ar = String(fd.get('description_ar') || '').trim();
  if (fd.has('description_fr')) df.description_fr = String(fd.get('description_fr') || '').trim();

  const orig = fd.get('originalPrice');
  if (orig !== null) df.originalPrice = orig === '' ? '' : Number(orig);
  const disc = fd.get('discountPrice');
  if (disc !== null) df.discountPrice = disc === '' ? '' : Number(disc);

  df.isVisible = fd.has('isVisible');
  df.isNew = fd.has('isNew');
  df.isBestSeller = fd.has('isBestSeller');
  df.isSpecialOffer = fd.has('isSpecialOffer');
  df.offerEnabled = fd.has('offerEnabled');
  df.offerFreeShipping = fd.has('offerFreeShipping');

  const minQ = fd.get('offerMinQty');
  if (minQ !== null) df.offerMinQty = Math.max(2, Number(minQ || 2));
  if (fd.has('offerText')) df.offerText = String(fd.get('offerText') || '').trim();

  if (fd.has('colorName')) df.colorName = String(fd.get('colorName') || df.colorName || 'Beige').trim();
  const hexInp = document.getElementById('adm-color-picker');
  if (hexInp instanceof HTMLInputElement) df.colorHex = hexInp.value;

  const rows = form.querySelectorAll('.adm-variant-table tbody tr');
  rows.forEach((row) => {
    const sizeInp = row.querySelector('.adm-var-input-size');
    const colorInp = row.querySelector('.adm-var-input-color');
    const hexColorInp = row.querySelector('input[type="color"]');
    const qtyInp = row.querySelector('.adm-var-input-qty');
    const activeInp = row.querySelector('input[type="checkbox"]');
    if (sizeInp instanceof HTMLInputElement) {
      const vIdx = Number(sizeInp.getAttribute('data-variant-idx'));
      if (Array.isArray(df.variants) && df.variants[vIdx]) {
        df.variants[vIdx].size = sizeInp.value.trim();
        if (colorInp instanceof HTMLInputElement) df.variants[vIdx].colorName = colorInp.value.trim();
        if (hexColorInp instanceof HTMLInputElement) df.variants[vIdx].colorHex = hexColorInp.value;
        if (qtyInp instanceof HTMLInputElement) df.variants[vIdx].quantity = Math.max(0, Number(qtyInp.value || 0));
        if (activeInp instanceof HTMLInputElement) df.variants[vIdx].active = activeInp.checked;
      }
    }
  });
}

/**
 * القسم 1: إدارة المنتجات والمخزون
 */
function renderInventorySection() {
  const tr = t();
  const lang = getLang();
  const isFr = lang === 'fr';

  const editingProd = adminState.editingProductId
    ? adminState.inventory.find((p) => p.id === adminState.editingProductId)
    : null;

  const isFormVisible = Boolean(adminState.isProductFormOpen || editingProd);

  const df = adminState.draftProductForm;
  const variants = Array.isArray(df.variants) ? df.variants : [];

  // دمج الصورة الرئيسية ومعرض الصور في مصفوفة واحدة لعرضها والتحكم بها بسهولة
  const galleryList = Array.isArray(adminState.draftProductGallery)
    ? [...adminState.draftProductGallery]
    : [];
  if (adminState.draftProductImage && !galleryList.includes(adminState.draftProductImage)) {
    galleryList.unshift(adminState.draftProductImage);
  }

  // خيارات التصنيفات المتاحة
  const categoryOptions = [];
  const seenCats = new Set();
  if (Array.isArray(adminState.categories)) {
    adminState.categories.forEach((c) => {
      if (c && c.id && !seenCats.has(c.id)) {
        seenCats.add(c.id);
        categoryOptions.push({
          id: c.id,
          label: isFr ? c.name_fr || c.name_ar : c.name_ar || c.name_fr,
        });
      }
    });
  }
  Object.keys(CATEGORY_LABELS).forEach((catId) => {
    if (!seenCats.has(catId)) {
      seenCats.add(catId);
      categoryOptions.push({
        id: catId,
        label: CATEGORY_LABELS[catId][lang] || catId,
      });
    }
  });

  if (isFormVisible) {
    return `
      <div class="adm-new-prod-page" style="max-width:1040px; margin:0 auto;">
        <!-- شريط العنوان العلوي: منتج جديد + زر العودة لكل المنتجات -->
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.1rem;">
          <h2 style="font-size:1.3rem; font-weight:800; color:#18181b; margin:0;">
            ${editingProd ? (isFr ? `Modifier : ${getProdDisplayName(editingProd)}` : `تعديل المنتج : ${getProdDisplayName(editingProd)}`) : (isFr ? 'Nouveau produit' : 'منتج جديد')}
          </h2>
          <button
            type="button"
            data-adm-action="cancel-product-edit"
            style="background:#fff; color:#18181b; border:1px solid #27272a; border-radius:6px; padding:0.45rem 0.9rem; font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.4rem;"
          >
            <span>${isFr ? '← Tous les produits' : '← كل المنتجات'}</span>
          </button>
        </div>

        <form id="adm-product-form" style="display:flex; flex-direction:column; gap:1rem;">
          <!-- 1. المعلومات الأساسية -->
          <div class="adm-prod-section-card">
            <h3 style="font-size:1rem; font-weight:800; color:#18181b; margin:0 0 1rem 0;">
              ${isFr ? 'Informations de base' : 'المعلومات الأساسية'}
            </h3>

            <div class="adm-form-grid">
              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Nom en arabe *' : 'الاسم بالعربية *'}</label>
                <input
                  name="name"
                  type="text"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.name || ''}"
                  required
                />
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">Nom en français *</label>
                <input
                  name="name_fr"
                  type="text"
                  dir="ltr"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.name_fr || ''}"
                  required
                />
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Lien (slug) *' : 'الرابط (slug) *'}</label>
                <input
                  name="slug"
                  type="text"
                  dir="ltr"
                  placeholder="sandale-beige"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff; text-align:left;"
                  value="${df.slug || ''}"
                  required
                />
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Catégorie' : 'التصنيف'}</label>
                <select
                  name="category"
                  class="adm-select"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                >
                  <option value="" ${!df.category ? 'selected' : ''}>${isFr ? '-- Aucune --' : '-- بدون --'}</option>
                  ${categoryOptions
                    .map(
                      (c) =>
                        `<option value="${c.id}" ${df.category === c.id ? 'selected' : ''}>${c.label}</option>`
                    )
                    .join('')}
                </select>
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Description en arabe' : 'الوصف بالعربية'}</label>
                <textarea
                  name="description_ar"
                  rows="3"
                  class="adm-textarea"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff; min-height:92px;"
                >${df.description_ar || ''}</textarea>
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">Description en français</label>
                <textarea
                  name="description_fr"
                  rows="3"
                  dir="ltr"
                  class="adm-textarea"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff; min-height:92px;"
                >${df.description_fr || ''}</textarea>
              </div>
            </div>
          </div>

          <!-- 2. السعر والعرض -->
          <div class="adm-prod-section-card">
            <h3 style="font-size:1rem; font-weight:800; color:#18181b; margin:0 0 1rem 0;">
              ${isFr ? 'Prix et affichage' : 'السعر والعرض'}
            </h3>

            <div class="adm-form-grid">
              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Prix original (DA) *' : 'السعر الأصلي (د.ج) *'}</label>
                <input
                  name="originalPrice"
                  type="number"
                  min="0"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.originalPrice !== undefined && df.originalPrice !== null ? df.originalPrice : ''}"
                  required
                />
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Prix remisé (optionnel)' : 'سعر التخفيض (اختياري)'}</label>
                <input
                  name="discountPrice"
                  type="number"
                  min="0"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.discountPrice !== undefined && df.discountPrice !== null ? df.discountPrice : ''}"
                />
              </div>
            </div>

            <!-- خيارات العرض (Checkboxes) -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(135px, 1fr)); gap:0.75rem; margin-top:1rem;">
              <label style="display:inline-flex; align-items:center; gap:0.45rem; font-size:0.84rem; font-weight:600; color:#27272a; cursor:pointer;">
                <input
                  type="checkbox"
                  name="isVisible"
                  style="width:17px; height:17px; accent-color:#18181b; cursor:pointer;"
                  ${df.isVisible !== false ? 'checked' : ''}
                />
                <span>${isFr ? 'Visible en boutique' : 'ظاهر في المتجر'}</span>
              </label>

              <label style="display:inline-flex; align-items:center; gap:0.45rem; font-size:0.84rem; font-weight:600; color:#27272a; cursor:pointer;">
                <input
                  type="checkbox"
                  name="isNew"
                  style="width:17px; height:17px; accent-color:#18181b; cursor:pointer;"
                  ${df.isNew ? 'checked' : ''}
                />
                <span>${isFr ? 'Nouvel arrivage' : 'وصل حديثاً'}</span>
              </label>

              <label style="display:inline-flex; align-items:center; gap:0.45rem; font-size:0.84rem; font-weight:600; color:#27272a; cursor:pointer;">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  style="width:17px; height:17px; accent-color:#18181b; cursor:pointer;"
                  ${df.isBestSeller ? 'checked' : ''}
                />
                <span>${isFr ? 'Meilleures ventes' : 'الأكثر مبيعاً'}</span>
              </label>

              <label style="display:inline-flex; align-items:center; gap:0.45rem; font-size:0.84rem; font-weight:600; color:#27272a; cursor:pointer;">
                <input
                  type="checkbox"
                  name="isSpecialOffer"
                  style="width:17px; height:17px; accent-color:#18181b; cursor:pointer;"
                  ${df.isSpecialOffer ? 'checked' : ''}
                />
                <span>${isFr ? 'En vedette' : 'مميز'}</span>
              </label>
            </div>
          </div>

          <!-- 3. صور المنتج (إمكانية إضافة عدة صور) -->
          <div class="adm-prod-section-card">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.85rem;">
              <div>
                <h3 style="font-size:1rem; font-weight:800; color:#18181b; margin:0; display:flex; align-items:center; gap:0.5rem;">
                  <span>${isFr ? 'Photos du produit' : 'صور المنتج'}</span>
                  <span style="font-size:0.75rem; font-weight:700; color:#de1b61; background:#fce8ee; padding:0.15rem 0.55rem; border-radius:999px;">
                    ${galleryList.length} ${isFr ? (galleryList.length > 1 ? 'photos' : 'photo') : (galleryList.length === 1 ? 'صورة واحدة' : `${galleryList.length} صور`)}
                  </span>
                </h3>
                <p style="font-size:0.76rem; color:#71717a; margin:0.25rem 0 0 0;">
                  ${isFr ? 'Vous pouvez ajouter plusieurs photos à la fois (format 4:5). La première photo sera la photo principale.' : 'يمكنك إضافة عدة صور للمنتج دفعة واحدة أو بالتدريج (بمقاس 4:5). الصورة الأولى تكون هي الصورة الرئيسية.'}
                </p>
              </div>

              <button
                type="button"
                data-adm-action="trigger-gallery-input"
                style="background:#18181b; color:#fff; border:none; border-radius:6px; padding:0.5rem 1rem; font-size:0.82rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:0.45rem;"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>${isFr ? '+ Ajouter des photos (multi-fichiers)' : '+ رفع عدة صور من الجهاز'}</span>
              </button>
            </div>

            <!-- منطقة السحب والإفلات لاختيار عدة صور بسهولة -->
            <div
              id="adm-prod-dropzone"
              data-adm-action="trigger-gallery-input"
              style="border:2px dashed #d6d1c7; border-radius:10px; padding:1.25rem 1rem; text-align:center; background:#faf8f9; cursor:pointer; transition:border-color 0.2s, background 0.2s; margin-bottom:1rem;"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#71717a" stroke-width="1.8" style="margin:0 auto 0.4rem auto; display:block;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div style="font-size:0.86rem; font-weight:700; color:#18181b;">
                ${isFr ? 'Glissez vos photos ici ou cliquez pour choisir plusieurs images' : 'اسحب وأفلت صور المنتج هنا، أو اضغط لاختيار عدة صور معاً'}
              </div>
              <div style="font-size:0.75rem; color:#71717a; margin-top:0.25rem;">
                ${isFr ? 'Prend en charge plusieurs fichiers (JPG, PNG, WebP) avec compression automatique' : 'يمكنك تحديد حتى 10 صور في نفس الوقت وسيتم ضغطها وتجهيزها تلقائياً'}
              </div>
              <input
                id="adm-prod-gallery-input"
                type="file"
                accept="image/*"
                multiple
                style="display:none;"
              />
            </div>

            <!-- إضافة رابط صورة أو عدة روابط مفصولة بفواصل -->
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;">
              <input
                id="adm-prod-image-url-input"
                type="text"
                dir="ltr"
                placeholder="${isFr ? 'Ou collez un lien (ou plusieurs liens séparés par des virgules)' : 'أو ألصق رابط صورة مباشر (أو عدة روابط مفصولة بفاصلة)'}"
                class="adm-input"
                style="flex:1 1 200px; min-width:0; border-radius:6px; border-color:#d6d1c7; background:#fff;"
              />
              <button
                type="button"
                data-adm-action="add-prod-image-url"
                style="background:#f5f2eb; color:#18181b; border:1px solid #d6d1c7; border-radius:6px; padding:0.55rem 1rem; font-size:0.82rem; font-weight:700; cursor:pointer;"
              >
                ${isFr ? '+ Ajouter le lien' : '+ إضافة الرابط'}
              </button>
            </div>

            <!-- شبكة معاينة صور المنتج المرفوعة -->
            ${
              galleryList.length > 0
                ? `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(130px, 1fr)); gap:0.75rem;">
                    ${galleryList
                      .map(
                        (imgSrc, idx) => `
                        <div style="position:relative; border:1px solid ${idx === 0 ? '#de1b61' : '#e4e4e7'}; border-radius:8px; overflow:hidden; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                          <div style="aspect-ratio:4/5; width:100%; overflow:hidden; background:#f4f4f5; position:relative;">
                            <img
                              src="${imgSrc}"
                              alt="Product ${idx + 1}"
                              referrerpolicy="no-referrer"
                              style="width:100%; height:100%; object-fit:cover; display:block;"
                            />
                            <span style="position:absolute; top:4px; ${isFr ? 'left:4px' : 'right:4px'}; font-size:0.68rem; font-weight:800; color:#fff; background:rgba(0,0,0,0.6); padding:0.1rem 0.35rem; border-radius:4px; line-height:1.2;">
                              #${idx + 1}
                            </span>
                            ${
                              idx === 0
                                ? `<span style="position:absolute; bottom:4px; ${isFr ? 'left:4px' : 'right:4px'}; font-size:0.65rem; font-weight:800; color:#fff; background:#de1b61; padding:0.15rem 0.45rem; border-radius:4px; line-height:1.2;">
                                    ${isFr ? 'Principale' : 'الرئيسية'}
                                  </span>`
                                : ''
                            }
                          </div>

                          <div style="padding:0.4rem; display:flex; align-items:center; justify-content:space-between; gap:0.25rem; background:#fff; border-top:1px solid #f4f4f5;">
                            ${
                              idx !== 0
                                ? `<button
                                    type="button"
                                    data-adm-action="set-main-prod-img"
                                    data-index="${idx}"
                                    title="${isFr ? 'Définir comme photo principale' : 'تعيين كصورة رئيسية'}"
                                    style="font-size:0.68rem; font-weight:700; color:#de1b61; background:#fce8ee; border:none; border-radius:4px; padding:0.2rem 0.45rem; cursor:pointer;"
                                  >
                                    ${isFr ? 'Principale' : 'رئيسية'}
                                  </button>`
                                : `<span style="font-size:0.68rem; font-weight:700; color:#15803d;">✓ ${isFr ? 'Active' : 'معتمدة'}</span>`
                            }

                            <div style="display:flex; align-items:center; gap:0.2rem;">
                              ${
                                idx > 0
                                  ? `<button
                                      type="button"
                                      data-adm-action="move-prod-gallery-img"
                                      data-index="${idx}"
                                      data-dir="-1"
                                      title="${isFr ? 'Déplacer avant' : 'تقديم'}"
                                      style="width:22px; height:22px; border-radius:4px; border:1px solid #d4d4d8; background:#fff; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;"
                                    >‹</button>`
                                  : ''
                              }
                              ${
                                idx < galleryList.length - 1
                                  ? `<button
                                      type="button"
                                      data-adm-action="move-prod-gallery-img"
                                      data-index="${idx}"
                                      data-dir="1"
                                      title="${isFr ? 'Déplacer après' : 'تأخير'}"
                                      style="width:22px; height:22px; border-radius:4px; border:1px solid #d4d4d8; background:#fff; font-size:0.75rem; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;"
                                    >›</button>`
                                  : ''
                              }
                              <button
                                type="button"
                                data-adm-action="remove-prod-gallery-img"
                                data-index="${idx}"
                                title="${isFr ? 'Supprimer' : 'حذف الصورة'}"
                                style="width:22px; height:22px; border-radius:4px; border:1px solid #fecdd3; background:#fff1f2; color:#e11d48; font-weight:800; font-size:0.85rem; line-height:1; cursor:pointer; display:inline-flex; align-items:center; justify-content:center;"
                              >×</button>
                            </div>
                          </div>
                        </div>
                      `
                      )
                      .join('')}
                  </div>`
                : `<div style="border:1px dashed #d6d1c7; border-radius:8px; padding:1.25rem; text-align:center; color:#71717a; font-size:0.82rem; background:#faf9f6;">
                    ${isFr ? 'Aucune photo ajoutée. Cliquez sur « + Ajouter des photos » pour importer les images du produit.' : 'لم تتم إضافة صور للمنتج بعد. اضغط على «+ رفع عدة صور من الجهاز» أو اسحب الصور لإضافتها.'}
                  </div>`
            }
          </div>

          <!-- 4. المقاسات والألوان والمخزون -->
          <div class="adm-prod-section-card">
            <h3 style="font-size:1rem; font-weight:800; color:#18181b; margin:0 0 1rem 0;">
              ${isFr ? 'Pointures, couleurs et stock' : 'المقاسات والألوان والمخزون'}
            </h3>

            <!-- السطر 1: اللون + درجة اللون -->
            <div style="display:flex; align-items:flex-end; gap:0.75rem; flex-wrap:wrap; margin-bottom:1rem;">
              <div class="adm-field" style="flex:1; min-width:160px;">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Couleur' : 'اللون'}</label>
                <input
                  id="adm-variant-color-name"
                  name="colorName"
                  type="text"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.colorName || 'Beige'}"
                />
              </div>

              <div class="adm-field" style="width:auto;">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Nuance' : 'درجة اللون'}</label>
                <input
                  id="adm-color-picker"
                  name="colorHex"
                  type="color"
                  value="${df.colorHex || '#D2B48C'}"
                  style="width:58px; height:42px; padding:3px; border:1px solid #d6d1c7; border-radius:6px; background:#fff; cursor:pointer; display:block;"
                />
              </div>
            </div>

            <!-- السطر 2: من المقاس | إلى المقاس | الكمية لكل مقاس -->
            <div class="adm-size-range-grid">
              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'De la pointure' : 'من المقاس'}</label>
                <input
                  id="adm-size-from"
                  name="sizeFrom"
                  type="number"
                  min="30"
                  max="48"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.sizeFrom ?? 36}"
                />
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? "Jusqu'à la pointure" : 'إلى المقاس'}</label>
                <input
                  id="adm-size-to"
                  name="sizeTo"
                  type="number"
                  min="30"
                  max="48"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.sizeTo ?? 41}"
                />
              </div>

              <div class="adm-field">
                <label class="adm-label" style="font-weight:600; color:#52525b;">${isFr ? 'Quantité par pointure' : 'الكمية لكل مقاس'}</label>
                <input
                  id="adm-default-size-stock"
                  name="defaultSizeStock"
                  type="number"
                  min="0"
                  class="adm-input"
                  style="border-radius:6px; border-color:#d6d1c7; background:#fff;"
                  value="${df.defaultSizeStock ?? 5}"
                />
              </div>
            </div>

            <!-- السطر 3: أزرار توليد المقاسات لهذا اللون + سطر يدوي -->
            <div style="display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap; margin-bottom:1rem;">
              <button
                type="button"
                data-adm-action="generate-variant-rows"
                style="flex:1 1 auto; background:#fff; color:#18181b; border:1px solid #27272a; border-radius:6px; padding:0.55rem 0.9rem; font-size:0.82rem; font-weight:700; cursor:pointer;"
              >
                ${isFr ? 'Générer les pointures pour cette couleur' : 'توليد المقاسات لهذا اللون'}
              </button>

              <button
                type="button"
                data-adm-action="add-manual-variant-row"
                style="flex:1 1 auto; background:#fff; color:#18181b; border:1px solid #27272a; border-radius:6px; padding:0.55rem 0.9rem; font-size:0.82rem; font-weight:700; cursor:pointer;"
              >
                ${isFr ? '+ Ligne manuelle' : '+ سطر يدوي'}
              </button>
            </div>

            <!-- السطر 4: جدول المقاسات والألوان والكميات -->
            <div style="border:1px solid #e6e1d6; border-radius:6px; overflow-x:auto;">
              <table class="adm-variant-table">
                <thead>
                  <tr style="background:#ebe5dc; color:#27272a; font-weight:800;">
                    <th style="text-align:right; border-bottom:1px solid #dfd9ce;">${isFr ? 'Pointure' : 'المقاس'}</th>
                    <th style="text-align:center; border-bottom:1px solid #dfd9ce;">${isFr ? 'Couleur' : 'اللون'}</th>
                    <th style="text-align:center; border-bottom:1px solid #dfd9ce;">${isFr ? 'Nuance' : 'درجة'}</th>
                    <th style="text-align:center; border-bottom:1px solid #dfd9ce;">${isFr ? 'Quantité' : 'الكمية'}</th>
                    <th style="text-align:center; border-bottom:1px solid #dfd9ce;">${isFr ? 'Actif' : 'مفعل'}</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    variants.length === 0
                      ? `<tr>
                          <td colspan="5" style="padding:1.4rem 0.75rem; text-align:center; color:#71717a; font-size:0.84rem; background:#fff;">
                            ${isFr ? 'Ajoutez des pointures et des couleurs.' : 'أضف مقاسات وألواناً.'}
                          </td>
                        </tr>`
                      : variants
                          .map(
                            (v, vIdx) => `
                            <tr style="border-bottom:1px solid #f0ece3; background:#fff;">
                              <td style="text-align:right;">
                                <input
                                  type="text"
                                  data-variant-idx="${vIdx}"
                                  data-variant-field="size"
                                  value="${v.size !== undefined && v.size !== null ? v.size : ''}"
                                  placeholder="${isFr ? 'Pointure (ou vide)' : 'المقاس (أو فارغ)'}"
                                  class="adm-input adm-var-input-size"
                                  style="border-radius:4px; border-color:#d6d1c7;"
                                />
                              </td>
                              <td style="text-align:center;">
                                <input
                                  type="text"
                                  data-variant-idx="${vIdx}"
                                  data-variant-field="colorName"
                                  value="${v.colorName || 'Beige'}"
                                  class="adm-input adm-var-input-color"
                                  style="border-radius:4px; border-color:#d6d1c7;"
                                />
                              </td>
                              <td style="text-align:center;">
                                <input
                                  type="color"
                                  data-variant-idx="${vIdx}"
                                  data-variant-field="colorHex"
                                  value="${v.colorHex || '#D2B48C'}"
                                  style="width:38px; height:30px; padding:2px; border:1px solid #d6d1c7; border-radius:4px; background:#fff; cursor:pointer; vertical-align:middle;"
                                />
                              </td>
                              <td style="text-align:center;">
                                <input
                                  type="number"
                                  min="0"
                                  data-variant-idx="${vIdx}"
                                  data-variant-field="quantity"
                                  value="${v.quantity ?? 5}"
                                  class="adm-input adm-var-input-qty"
                                  style="border-radius:4px; border-color:#d6d1c7;"
                                />
                              </td>
                              <td style="text-align:center;">
                                <div style="display:inline-flex; align-items:center; justify-content:center; gap:0.5rem;">
                                  <input
                                    type="checkbox"
                                    data-variant-idx="${vIdx}"
                                    data-variant-field="active"
                                    style="width:16px; height:16px; accent-color:#18181b; cursor:pointer;"
                                    ${v.active !== false ? 'checked' : ''}
                                  />
                                  <button
                                    type="button"
                                    data-adm-action="remove-variant-row"
                                    data-index="${vIdx}"
                                    title="${isFr ? 'Supprimer la ligne' : 'حذف السطر'}"
                                    style="background:transparent; border:none; color:#a1a1aa; font-size:1.1rem; font-weight:800; cursor:pointer; line-height:1; padding:0.2rem;"
                                  >
                                    ×
                                  </button>
                                </div>
                              </td>
                            </tr>
                          `
                          )
                          .join('')
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- شريط الحفظ السفلي -->
          <div style="display:flex; align-items:center; justify-content:flex-start; flex-wrap:wrap; gap:0.65rem;">
            <button
              type="submit"
              style="flex:1 1 200px; background:#18181b; color:#fff; border:1px solid #18181b; border-radius:6px; padding:0.75rem 1.5rem; font-size:0.9rem; font-weight:800; cursor:pointer;"
            >
              ${editingProd ? (isFr ? 'Enregistrer les modifications' : 'حفظ التعديلات') : (isFr ? 'Enregistrer le produit' : 'حفظ المنتج')}
            </button>

            <button
              type="button"
              data-adm-action="cancel-product-edit"
              style="flex:0 1 auto; background:#fff; color:#18181b; border:1px solid #d6d1c7; border-radius:6px; padding:0.75rem 1.25rem; font-size:0.88rem; font-weight:700; cursor:pointer;"
            >
              ${isFr ? 'Annuler' : 'إلغاء'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  const lowStockItems = adminState.inventory.filter((p) => Number(p.stock) < 5);

  const q = adminState.inventorySearch.trim().toLowerCase();
  const filteredProducts = adminState.inventory.filter(
    (p) =>
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
  );

  return `
    ${
      lowStockItems.length > 0
        ? `<div class="adm-alert-low" role="alert">
            <span>${tr.inv.lowStockAlert(lowStockItems.map((i) => getProdDisplayName(i)).join(' · '))}</span>
            <span class="adm-badge adm-badge-cancelled">${tr.inv.productsBadge(lowStockItems.length)}</span>
          </div>`
        : ''
    }

    <!-- قسم التحكم بالفئات / الأقسام (إضافة، تعديل، تغيير صورة، حذف) -->
    ${renderCategoryManagerCard()}

    <!-- قائمة المنتجات الحالية -->
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.inv.currentProdsTitle(filteredProducts.length)}</h2>
          <p class="adm-card-sub">${tr.inv.currentProdsSub}</p>
        </div>

        <div class="adm-card-head-actions">
          <input
            id="adm-inventory-search"
            type="search"
            class="adm-input"
            style="padding:0.5rem 0.8rem;"
            placeholder="${tr.inv.searchPlaceholder}"
            value="${adminState.inventorySearch}"
          />
          <button
            type="button"
            data-adm-action="toggle-product-form"
            class="adm-btn adm-btn-pink"
          >
            ${tr.inv.addProdTitle}
          </button>
        </div>
      </div>

      <div id="adm-inventory-grid" class="adm-products-grid">
        ${renderInventoryCards(filteredProducts)}
      </div>
    </div>
  `;
}

function renderCategoryManagerCard() {
  const lang = getLang();
  const isFr = lang === 'fr';
  const editingCat = adminState.editingCategoryId
    ? adminState.categories.find((c) => c.id === adminState.editingCategoryId)
    : null;
  const isCatFormOpen = Boolean(adminState.isCategoryFormOpen || editingCat);
  const catPreviewImg =
    adminState.draftCategoryImage || (editingCat ? editingCat.image : IMAGES.talons);

  return `
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">
            ${isFr ? `Gestion des Catégories (${adminState.categories.length})` : `التحكم بالفئات والأقسام (${adminState.categories.length})`}
          </h2>
          <p class="adm-card-sub">
            ${isFr ? 'Ajoutez, renommez ou changez les photos des catégories affichées sur la boutique' : 'أضف فئة جديدة، عدّل أسماء الفئات أو غيّر صورها الدائرية في المتجر'}
          </p>
        </div>
        ${
          !isCatFormOpen
            ? `<button type="button" data-adm-action="toggle-category-form" class="adm-btn adm-btn-soft adm-btn-sm">
                ${isFr ? '+ Nouvelle Catégorie' : '+ إضافة فئة جديدة'}
              </button>`
            : `<button type="button" data-adm-action="cancel-category-edit" class="adm-btn adm-btn-outline adm-btn-sm">
                ${isFr ? 'Fermer' : 'إغلاق'}
              </button>`
        }
      </div>

      ${
        isCatFormOpen
          ? `
          <form id="adm-category-form" class="adm-form-grid" style="background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:1rem; margin-bottom:1rem;">
            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Nom de la catégorie (Arabe) *' : 'اسم الفئة (بالعربية) *'}</label>
              <input
                name="name_ar"
                type="text"
                class="adm-input"
                placeholder="مثال: حقائب سهرة / صابو"
                value="${editingCat ? editingCat.name_ar : ''}"
                required
              />
            </div>

            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Nom en Français / Identifiant *' : 'الاسم بالفرنسية (Nom FR) *'}</label>
              <input
                name="name_fr"
                type="text"
                class="adm-input"
                placeholder="Ex: Sabots / Sacs"
                value="${editingCat ? editingCat.name_fr : ''}"
                required
              />
            </div>

            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Sous-titre (Arabe)' : 'وصف قصير للفئة (اختياري)'}</label>
              <input
                name="subtitle_ar"
                type="text"
                class="adm-input"
                placeholder="مثال: تصاميم عصرية ومريحة"
                value="${editingCat ? editingCat.subtitle_ar || '' : 'تشكيلة أنيقة ومريحة'}"
              />
            </div>

            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Photo de la catégorie (Depuis téléphone/PC)' : 'صورة الفئة الدائرية (من الهاتف أو الحاسوب)'}</label>
              <div class="adm-upload-box" style="padding:0.45rem 0.75rem;">
                <div class="adm-upload-left">
                  <img id="adm-cat-img-preview" src="${catPreviewImg}" alt="Category" referrerpolicy="no-referrer" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid var(--adm-pink);" />
                  <span class="adm-upload-title" style="font-size:0.78rem;">${isFr ? 'Choisir une photo' : 'رفع صورة الفئة'}</span>
                </div>
                <span class="adm-btn adm-btn-soft adm-btn-sm">${isFr ? 'Importer' : 'اختيار'}</span>
                <input id="adm-cat-file-input" type="file" accept="image/*" class="adm-file-hidden" />
              </div>
            </div>

            <div class="adm-field full">
              <button type="submit" class="adm-btn adm-btn-pink" style="width:100%;">
                ${editingCat ? (isFr ? 'Mettre à jour la catégorie' : 'حفظ تعديلات الفئة') : (isFr ? '+ Ajouter la catégorie' : '+ إضافة الفئة للمتجر الآن')}
              </button>
            </div>
          </form>
        `
          : ''
      }

      <div class="adm-categories-grid">
        ${adminState.categories
          .map(
            (cat) => `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.65rem; background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:0.6rem 0.8rem;">
              <div style="display:flex; align-items:center; gap:0.6rem; min-width:0; flex:1;">
                <img src="${cat.image}" alt="${cat.name_ar}" referrerpolicy="no-referrer" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid rgba(216,27,96,0.3); flex-shrink:0;" />
                <div style="min-width:0; flex:1;">
                  <strong style="font-size:0.86rem; color:var(--adm-text-dark); display:block; line-height:1.3; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${isFr ? cat.name_fr : cat.name_ar}
                  </strong>
                  <span style="font-size:0.74rem; color:var(--adm-text-muted); display:block; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                    ${isFr ? cat.name_ar : cat.name_fr}
                  </span>
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:0.35rem; flex-shrink:0;">
                <button type="button" data-adm-action="edit-category" data-id="${cat.id}" class="adm-btn adm-btn-soft adm-btn-sm" style="padding:0.32rem 0.65rem; font-size:0.75rem; font-weight:700;">${isFr ? 'Modifier' : 'تعديل'}</button>
                <button type="button" data-adm-action="delete-category" data-id="${cat.id}" class="adm-btn adm-btn-danger adm-btn-sm" style="padding:0.32rem 0.65rem; font-size:0.75rem; font-weight:700;">${isFr ? 'Supprimer' : 'حذف'}</button>
              </div>
            </div>
          `
          )
          .join('')}
      </div>
    </div>
  `;
}

function renderInventoryCards(productsList) {
  const tr = t();
  const lang = getLang();
  const isFr = lang === 'fr';

  return productsList
    .map((p) => {
      const isLow = Number(p.stock) < 5;
      const isOut = Number(p.stock) === 0;
      const displayName = getProdDisplayName(p);
      const hasDiscount = p.originalPrice && p.originalPrice > p.price;
      const cleanSizes = Array.isArray(p.sizes)
        ? p.sizes.filter(
            (s) =>
              s !== null &&
              s !== undefined &&
              String(s).trim() !== '' &&
              String(s) !== 'default' &&
              String(s) !== 'NaN' &&
              !Number.isNaN(s)
          )
        : [];
      const sizesRangeText =
        cleanSizes.length > 0
          ? cleanSizes.length === 1
            ? `${cleanSizes[0]}`
            : `${cleanSizes[0]}–${cleanSizes[cleanSizes.length - 1]}`
          : '';

      return `
        <article id="adm-prod-card-${p.id}" class="adm-prod-card ${isLow ? 'low-stock' : ''}">
          <div class="adm-prod-top">
            <label
              class="adm-prod-img-wrap"
              title="${isFr ? 'Cliquer pour importer plusieurs photos' : 'اضغط لإضافة أو تغيير عدة صور للمنتج'}"
              style="cursor:pointer;"
            >
              <img
                id="adm-row-thumb-${p.id}"
                src="${p.image}"
                alt="${displayName}"
                referrerpolicy="no-referrer"
              />
              <span class="adm-prod-cam-btn">
                ${p.gallery && p.gallery.length > 1 ? `${p.gallery.length} صور` : tr.inv.changePhotoBtn}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                data-adm-row-img-upload="${p.id}"
                style="display:none;"
              />
            </label>

            <div class="adm-prod-info">
              <div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem;">
                <span style="font-size:0.7rem; font-weight:700; color:var(--adm-text-muted);">${CATEGORY_LABELS[p.category]?.[lang] || p.category}</span>
                <span id="adm-stock-badge-${p.id}">
                  ${
                    isOut
                      ? `<span class="adm-badge adm-badge-cancelled">${tr.inv.outOfStock}</span>`
                      : isLow
                      ? `<span class="adm-badge adm-badge-confirming">${tr.inv.lowStockBadge(p.stock)}</span>`
                      : `<span class="adm-badge adm-badge-delivered">${tr.inv.inStockBadge(p.stock)}</span>`
                  }
                </span>
              </div>
              <h3 class="adm-prod-name">${displayName}</h3>
              <div style="display:flex; align-items:center; gap:0.45rem; flex-wrap:wrap;">
                <span class="adm-prod-price">${formatDA(p.price, lang)}</span>
                ${
                  hasDiscount
                    ? `<span style="font-size:0.73rem; text-decoration:line-through; color:var(--adm-text-muted);">${formatDA(p.originalPrice, lang)}</span>`
                    : ''
                }
              </div>
              <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; margin-top:0.25rem; font-size:0.7rem; color:var(--adm-text-muted);">
                ${(Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : [p.colorName || 'Beige'])
                  .map((cName) => {
                    const hex = getProductColorHex(p, cName);
                    return `<span style="display:inline-flex; align-items:center; gap:0.25rem;">
                      <span style="width:10px; height:10px; border-radius:50%; background:${hex}; border:1px solid #d4d4d8; display:inline-block;"></span>
                      <span>${cName}</span>
                    </span>`;
                  })
                  .join('')}
                ${sizesRangeText ? `<span>· ${isFr ? 'Pointures' : 'المقاسات'} ${sizesRangeText}</span>` : ''}
                ${
                  p.gallery && p.gallery.length > 1
                    ? `<span style="background:#fce8ee; color:#de1b61; font-weight:700; font-size:0.68rem; padding:0.1rem 0.35rem; border-radius:4px;">
                        ${p.gallery.length} ${isFr ? 'photos' : 'صور'}
                      </span>`
                    : ''
                }
                ${p.isVisible === false ? `<span class="adm-badge adm-badge-cancelled">${isFr ? 'Masqué' : 'مخفي'}</span>` : ''}
              </div>
            </div>
          </div>

          <div class="adm-prod-bottom">
            <div class="adm-stock-stepper">
              <button
                type="button"
                data-adm-action="step-stock"
                data-id="${p.id}"
                data-delta="1"
                class="adm-step-btn"
              >+</button>
              <input
                id="adm-stock-input-${p.id}"
                type="number"
                min="0"
                data-adm-stock-id="${p.id}"
                value="${p.stock}"
                class="adm-stock-num-input"
              />
              <button
                type="button"
                data-adm-action="step-stock"
                data-id="${p.id}"
                data-delta="-1"
                class="adm-step-btn"
              >−</button>
            </div>

            <div class="adm-prod-actions">
              <button
                type="button"
                data-adm-action="quick-add-prod-photos"
                data-id="${p.id}"
                title="${isFr ? 'Ajouter des photos à ce produit' : 'إضافة عدة صور لهذا المنتج مباشرة'}"
                class="adm-btn adm-btn-outline adm-btn-sm"
                style="color:#de1b61; border-color:#fecdd3;"
              >
                + ${isFr ? 'Photos' : 'صور'}
              </button>
              <a
                href="./index.html?product=${encodeURIComponent(p.slug || p.id)}"
                target="_blank"
                rel="noopener"
                class="adm-btn adm-btn-outline adm-btn-sm"
                style="text-decoration:none;"
              >
                ${isFr ? 'Voir' : 'الرابط'}
              </a>
              <button
                type="button"
                data-adm-action="copy-product-link"
                data-slug="${p.slug || p.id}"
                class="adm-btn adm-btn-outline adm-btn-sm"
              >
                ${isFr ? 'Copier' : 'نسخ'}
              </button>
              <button
                type="button"
                data-adm-action="edit-product"
                data-id="${p.id}"
                class="adm-btn adm-btn-soft adm-btn-sm"
              >
                ${tr.inv.editBtn}
              </button>
              <button
                type="button"
                data-adm-action="delete-product"
                data-id="${p.id}"
                class="adm-btn adm-btn-danger adm-btn-sm"
              >
                ${tr.inv.deleteBtn}
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join('');
}

/**
 * القسم 2: إدارة الطلبات والمبيعات
 */
function renderOrdersSection() {
  const tr = t();
  const lang = getLang();

  const filteredOrders =
    adminState.orderFilterStatus === 'all'
      ? adminState.orders
      : adminState.orders.filter(
          (o) => normalizeStatusKey(o.status) === adminState.orderFilterStatus
        );

  return `
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.orders.title(filteredOrders.length)}</h2>
          <p class="adm-card-sub">${tr.orders.sub}</p>
        </div>

        <button
          type="button"
          data-adm-action="add-demo-order"
          class="adm-btn adm-btn-soft adm-btn-sm"
        >
          ${tr.orders.addDemoBtn}
        </button>
      </div>

      <div style="display:flex; gap:0.4rem; overflow-x:auto; padding-bottom:0.85rem; margin-bottom:0.75rem;">
        <button
          type="button"
          data-adm-action="filter-orders"
          data-status="all"
          class="adm-tab-pill ${adminState.orderFilterStatus === 'all' ? 'active' : ''}"
          style="padding:0.4rem 0.85rem; font-size:0.76rem;"
        >
          ${tr.orders.allFilter(adminState.orders.length)}
        </button>
        ${STATUS_KEYS.map(
          (stKey) => `
            <button
              type="button"
              data-adm-action="filter-orders"
              data-status="${stKey}"
              class="adm-tab-pill ${adminState.orderFilterStatus === stKey ? 'active' : ''}"
              style="padding:0.4rem 0.85rem; font-size:0.76rem;"
            >
              ${tr.orders.statuses[stKey]}
            </button>
          `
        ).join('')}
      </div>

      <div class="adm-orders-list">
        ${
          filteredOrders.length === 0
            ? `<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--adm-text-muted);">${tr.orders.emptyOrders}</div>`
            : filteredOrders
                .map((order) => {
                  const stKey = normalizeStatusKey(order.status);
                  return `
                  <article class="adm-order-card">
                    <div class="adm-order-top">
                      <div>
                        <strong style="color:var(--adm-pink); font-size:0.9rem;">#${order.id}</strong>
                        <span style="font-size:0.74rem; color:var(--adm-text-muted); margin-inline-start:0.4rem;">· ${order.date}</span>
                      </div>
                      <span id="adm-order-badge-${order.id}" class="${getStatusBadgeClass(stKey)}">
                        ${getStatusLabel(stKey)}
                      </span>
                    </div>

                    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                      <div style="min-width:0; flex:1;">
                        <strong style="font-size:0.9rem; display:block;">${order.fullName}</strong>
                        <span style="font-size:0.78rem; color:var(--adm-text-body); display:block;">${order.wilaya} — ${order.address}</span>
                      </div>
                      <a
                        href="tel:${order.phone}"
                        class="adm-btn adm-btn-soft adm-btn-sm"
                        style="text-decoration:none; flex-shrink:0;"
                      >
                        ${order.phone}
                      </a>
                    </div>

                    <div style="background:#fafafa; border:1px solid #ece7ea; padding:0.6rem 0.8rem; border-radius:10px; font-size:0.8rem; color:var(--adm-text-body);">
                      ${
                        order.itemsSummary ||
                        (order.items
                          ? order.items
                              .map(
                                (i) =>
                                  `${i.name || i.product?.name_fr || i.product?.name_ar || 'ShoeStyle'} (${tr.orders.sizeWord} ${i.size} × ${i.quantity})`
                              )
                              .join(' + ')
                          : 'ShoeStyle')
                      }
                    </div>

                    <div class="adm-order-foot">
                      <div>
                        <span style="font-size:0.72rem; color:var(--adm-text-muted); display:block;">${tr.orders.totalAmount}</span>
                        <strong style="font-size:1.05rem; color:var(--adm-text-dark);">${formatDA(order.total, lang)}</strong>
                      </div>

                      <div class="adm-order-controls">
                        <select
                          data-adm-order-status="${order.id}"
                          class="adm-select"
                          style="padding:0.45rem 0.65rem; font-size:0.8rem; flex:1;"
                        >
                          ${STATUS_KEYS.map(
                            (k) =>
                              `<option value="${k}" ${stKey === k ? 'selected' : ''}>${tr.orders.statuses[k]}</option>`
                          ).join('')}
                        </select>
                        <button
                          type="button"
                          data-adm-action="delete-order"
                          data-id="${order.id}"
                          class="adm-btn adm-btn-danger adm-btn-sm"
                        >
                          ${tr.inv.deleteBtn}
                        </button>
                      </div>
                    </div>
                  </article>
                `;
                })
                .join('')
        }
      </div>
    </div>
  `;
}

/**
 * القسم 3: التحكم في واجهة المتجر (مبسط ومريح للعين)
 */
function renderCMSSection() {
  const tr = t();
  const isFr = getLang() === 'fr';
  const c = adminState.cms;
  const currentLogo = adminState.draftCmsLogo || c.logoUrl;
  const currentHeroBg = adminState.draftCmsHeroBg || c.heroBgUrl;

  return `
    <div class="adm-card" style="padding:0; overflow:hidden;">
      <div style="background:#fafafa; border-bottom:1px solid #ece7ea; color:var(--adm-text-muted); padding:0.55rem 1.15rem; font-size:0.75rem; font-weight:700; display:flex; justify-content:space-between;">
        <span>${tr.cms.livePreviewBanner}</span>
        <span>ShoeStyle</span>
      </div>

      <div style="background:#fff; padding:0.65rem 1.15rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(0,0,0,0.05);">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <img id="preview-logo-img" src="${currentLogo}" alt="Logo" referrerpolicy="no-referrer" style="width:32px; height:32px; border-radius:8px; object-fit:cover;" />
          <strong id="preview-store-name" style="font-family:'Dancing Script', cursive; font-size:1.5rem;">${c.storeName}</strong>
        </div>
        <span style="font-size:0.74rem; color:#71717a;">${tr.cms.navLinksPreview}</span>
      </div>

      <div
        id="preview-hero-box"
        style="position:relative; min-height:175px; background-image:url('${currentHeroBg}'); background-size:cover; background-position:center; display:flex; align-items:center; padding:1.25rem;"
      >
        <div style="position:absolute; inset:0; background:linear-gradient(90deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.92) 65%);"></div>
        <div style="position:relative; z-index:2; max-width:75%;">
          <h3 id="preview-hero-title" style="font-size:1.2rem; font-weight:800; margin:0 0 0.3rem; color:#18181b;">${c.heroTitle}</h3>
          <p id="preview-hero-sub" style="font-size:0.76rem; color:#3f3f46; margin:0 0 0.75rem;">${c.heroSubtitle}</p>
          <span id="preview-hero-btn" class="adm-btn adm-btn-pink adm-btn-sm">${c.heroBtnText}</span>
        </div>
      </div>
    </div>

    <form id="adm-cms-form" class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.cms.formTitle}</h2>
          <p class="adm-card-sub">${isFr ? 'Personnalisez la bannière, les réseaux sociaux, l’adresse du magasin et les Pixels publicitaires' : 'عدّل اسم المتجر، البانر، رقم الهاتف، مكان المحل، حسابات التواصل، وبيكسل الإعلانات'}</p>
        </div>
        <button type="submit" class="adm-btn adm-btn-pink">
          ${tr.cms.saveBtn}
        </button>
      </div>

      <div class="adm-form-grid">
        <div class="adm-field">
          <label class="adm-label" for="cms-store-name">${tr.cms.storeNameLabel}</label>
          <input id="cms-store-name" name="storeName" type="text" class="adm-input" value="${c.storeName}" required />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.cms.logoLabel}</label>
          <div class="adm-upload-box" style="padding:0.5rem 0.75rem;">
            <div class="adm-upload-left">
              <img id="cms-logo-preview-thumb" src="${currentLogo}" alt="Logo" referrerpolicy="no-referrer" style="width:38px; height:38px; border-radius:8px; object-fit:cover;" />
              <span class="adm-upload-title" style="font-size:0.78rem;">${tr.cms.logoUploadTitle}</span>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.cms.chooseBtn}</span>
            <input id="cms-logo-file-input" type="file" accept="image/*" class="adm-file-hidden" />
          </div>
        </div>

        <div class="adm-field">
          <label class="adm-label" for="cms-hero-title">${tr.cms.heroTitleLabel}</label>
          <input id="cms-hero-title" name="heroTitle" type="text" class="adm-input" value="${c.heroTitle}" required />
        </div>

        <div class="adm-field">
          <label class="adm-label" for="cms-hero-btn">${tr.cms.heroBtnLabel}</label>
          <input id="cms-hero-btn" name="heroBtnText" type="text" class="adm-input" value="${c.heroBtnText}" required />
        </div>

        <div class="adm-field">
          <label class="adm-label" for="cms-hero-sub">${tr.cms.heroSubLabel}</label>
          <textarea id="cms-hero-sub" name="heroSubtitle" rows="2" class="adm-textarea">${c.heroSubtitle}</textarea>
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.cms.heroImgLabel}</label>
          <div class="adm-upload-box">
            <div class="adm-upload-left">
              <img id="cms-hero-preview-thumb" src="${currentHeroBg}" alt="Hero" referrerpolicy="no-referrer" class="adm-upload-thumb" />
              <div>
                <span class="adm-upload-title">${tr.cms.heroImgTitle}</span>
                <span class="adm-upload-sub">${tr.cms.heroImgSub}</span>
              </div>
            </div>
            <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.inv.uploadBtn}</span>
            <input id="cms-hero-file-input" type="file" accept="image/*" class="adm-file-hidden" />
          </div>
        </div>

        <!-- معلومات الهاتف، مكان المحل، وروابط التواصل الاجتماعي في أسفل الموقع -->
        <div class="adm-field full" style="background:#fdf5f7; border:1px solid rgba(216,27,96,0.2); border-radius:12px; padding:1rem;">
          <h3 style="margin:0 0 0.75rem; font-size:0.9rem; font-weight:800; color:var(--adm-text-dark);">
            ${isFr ? 'Contact, Adresse du Magasin & Réseaux Sociaux (Pied de page)' : 'رقم الهاتف، مكان المحل، وروابط التواصل الاجتماعي (أسفل الموقع)'}
          </h3>
          <div class="adm-form-grid">
            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Numéro de téléphone du magasin' : 'رقم هاتف المحل'}</label>
              <input name="phone" type="tel" dir="ltr" class="adm-input" value="${c.phone || '0550 12 34 56'}" placeholder="0550 12 34 56" />
            </div>

            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Numéro WhatsApp' : 'رقم واتساب للتواصل السريع'}</label>
              <input name="whatsappNumber" type="text" dir="ltr" class="adm-input" value="${c.whatsappNumber || '213550123456'}" placeholder="213550123456" />
            </div>

            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Adresse du magasin (Arabe)' : 'مكان المحل / العنوان (بالعربية)'}</label>
              <input name="location_ar" type="text" class="adm-input" value="${c.location_ar || 'الجزائر العاصمة — باب الزوار، المركز التجاري'}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">${isFr ? 'Adresse du magasin (Français)' : 'مكان المحل (بالفرنسية)'}</label>
              <input name="location_fr" type="text" class="adm-input" value="${c.location_fr || 'Alger — Bab Ezzouar, Centre Commercial'}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">Instagram URL</label>
              <input name="instagramUrl" type="text" dir="ltr" class="adm-input" value="${c.instagramUrl || 'https://instagram.com/shoestyle.dz'}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">Facebook URL</label>
              <input name="facebookUrl" type="text" dir="ltr" class="adm-input" value="${c.facebookUrl || 'https://facebook.com/shoestyle.dz'}" />
            </div>

            <div class="adm-field full">
              <label class="adm-label">TikTok URL</label>
              <input name="tiktokUrl" type="text" dir="ltr" class="adm-input" value="${c.tiktokUrl || 'https://tiktok.com/@shoestyle.dz'}" />
            </div>

            <!-- عبارة التوقيع في الفوتر أسفل الصفحة -->
            <div class="adm-field full">
              <label class="adm-label" for="cms-footer-farewell">
                ${isFr ? 'Texte de signature en bas de page (Footer)' : 'العبارة الختامية أسفل المتجر (Footer)'}
              </label>
              <input
                id="cms-footer-farewell"
                name="footerFarewell"
                type="text"
                class="adm-input"
                value="${c.footerFarewell || 'À bientôt sur ShoeStyle ♥ ♥'}"
                placeholder="À bientôt sur ShoeStyle ♥ ♥"
              />
              <span style="font-size:0.73rem; color:var(--adm-text-muted); margin-top:0.25rem; display:block;">
                ${isFr ? 'Modifiez le texte affiché au bas du site (Ex: À bientôt sur ShoeStyle ♥ ♥)' : 'يمكنك تعديل العبارة التي تظهر أسفل الموقع (مثل: À bientôt sur ShoeStyle ♥ ♥ أو أي عبارة تحبينها)'}
              </span>
            </div>
          </div>
        </div>

        <!-- بيكسل الإعلانات وتتبع المبيعات (Facebook / TikTok / Snapchat / Google) -->
        <div class="adm-field full" style="background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:1rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <div>
              <h3 style="margin:0; font-size:0.9rem; font-weight:800; color:var(--adm-text-dark);">
                ${isFr ? 'Pixels Publicitaires (Facebook, TikTok, Snapchat)' : 'بيكسل الإعلانات وتتبع الحملات الإعلانية (Ad Pixels)'}
              </h3>
              <p style="margin:0.15rem 0 0; font-size:0.75rem; color:var(--adm-text-muted);">
                ${isFr ? 'Suivi automatique des événements PageView, AddToCart et Purchase sur la boutique et les Landing Pages' : 'يتم تفعيل تتبع الزيارات (PageView) وإضافة السلة (AddToCart) والطلبات المؤكدة (Purchase) تلقائياً'}
              </p>
            </div>
            <span class="adm-badge adm-badge-delivered">
              ${c.fbPixelId || c.tiktokPixelId || c.snapPixelId ? (isFr ? 'Pixel Actif' : 'البيكسل مفعل') : (isFr ? 'Prêt à configurer' : 'جاهز للربط')}
            </span>
          </div>

          <div class="adm-form-grid">
            <div class="adm-field">
              <label class="adm-label">Facebook / Meta Pixel ID</label>
              <input name="fbPixelId" type="text" dir="ltr" class="adm-input" placeholder="Ex: 123456789012345" value="${c.fbPixelId || ''}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">TikTok Pixel ID</label>
              <input name="tiktokPixelId" type="text" dir="ltr" class="adm-input" placeholder="Ex: C8ABCDEF123456" value="${c.tiktokPixelId || ''}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">Snapchat Pixel ID</label>
              <input name="snapPixelId" type="text" dir="ltr" class="adm-input" placeholder="Ex: a1b2c3d4-e5f6-7890" value="${c.snapPixelId || ''}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">Google Tag / Analytics ID</label>
              <input name="googleTagId" type="text" dir="ltr" class="adm-input" placeholder="Ex: G-XXXXXXXXXX" value="${c.googleTagId || ''}" />
            </div>
          </div>
        </div>

        <!-- طي بطاقات المميزات الـ 3 داخل قائمة اختيارية هادئة -->
        <div class="adm-field full">
          <details style="background:#fafafa; border:1px solid #ece7ea; border-radius:10px; padding:0.75rem 1rem;">
            <summary style="cursor:pointer; font-size:0.82rem; font-weight:700; color:var(--adm-text-body);">
              ${isFr ? 'Modifier les 3 cartes d’avantages (Optionnel)' : 'تعديل بطاقات المميزات الثلاث أسفل البانر (اختياري)'}
            </summary>
            <div class="adm-form-grid" style="margin-top:0.85rem;">
              ${c.features
                .map(
                  (f, idx) => `
                  <div class="adm-field">
                    <label class="adm-label">${tr.cms.featLabel(idx + 1)}</label>
                    <div style="display:flex; gap:0.4rem;">
                      <input name="featIcon_${idx}" data-cms-feat-icon="${idx}" type="text" class="adm-input" style="width:54px; text-align:center;" value="${f.icon}" />
                      <input name="featTitle_${idx}" data-cms-feat-title="${idx}" type="text" class="adm-input" value="${f.title}" />
                    </div>
                  </div>
                  <div class="adm-field">
                    <label class="adm-label">${tr.cms.featDescLabel(idx + 1)}</label>
                    <input name="featDesc_${idx}" data-cms-feat-desc="${idx}" type="text" class="adm-input" value="${f.desc}" />
                  </div>
                `
                )
                .join('')}
            </div>
          </details>
        </div>

        <div class="adm-field full">
          <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem;">
            ${tr.cms.saveAllCmsBtn}
          </button>
        </div>
      </div>
    </form>
  `;
}

/**
 * القسم 4: منشئ صفحات الهبوط الترويجية الاحترافي (مرتبط بمنتجات المتجر وروابط الإعلانات الحقيقية)
 */
function renderLandingBuilderSection() {
  const tr = t();
  const lang = getLang();
  const isFr = lang === 'fr';

  const editingPage = adminState.editingLandingId
    ? adminState.landingPages.find((lp) => lp.id === adminState.editingLandingId)
    : null;

  const isLpFormVisible = Boolean(adminState.isLandingFormOpen || editingPage);

  const mainImg =
    adminState.draftLandingMainImage || (editingPage ? editingPage.imageUrl : IMAGES.talons);
  const galleryList =
    adminState.draftLandingGallery ||
    (editingPage && editingPage.gallery ? editingPage.gallery : [mainImg]);

  return `
    ${
      isLpFormVisible
        ? `
      <div class="adm-card" style="border-color:rgba(216, 27, 96, 0.28);">
        <div class="adm-card-head">
          <div>
            <h2 class="adm-card-title">
              ${editingPage ? tr.lp.editTitle(editingPage.title) : tr.lp.createTitle}
            </h2>
            <p class="adm-card-sub">${tr.lp.sub}</p>
          </div>
          <button type="button" data-adm-action="cancel-landing-edit" class="adm-btn adm-btn-outline adm-btn-sm">
            ${isFr ? '✕ Fermer' : '✕ إغلاق'}
          </button>
        </div>

        <!-- شريط الاستيراد السريع من منتجات المتجر بضغطة واحدة -->
        <div style="background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:0.85rem 1rem; margin-bottom:1.15rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
          <div>
            <strong style="font-size:0.84rem; color:var(--adm-text-dark); display:block;">
              ${isFr ? 'Importation rapide depuis votre catalogue :' : 'تعبئة ذكية من منتجات متجرك بضغطة واحدة:'}
            </strong>
            <span style="font-size:0.74rem; color:var(--adm-text-muted);">
              ${isFr ? 'Sélectionnez une chaussure pour remplir automatiquement les photos, prix et textes' : 'اختر أي حذاء من متجرك وسيتم ملء الصور والأسعار والوصف التسويقي تلقائياً'}
            </span>
          </div>
          <select id="adm-lp-import-product" class="adm-select" style="max-width:290px; font-weight:700;">
            <option value="">${isFr ? '-- Choisir un produit du catalogue --' : '-- اختر حذاءً من الكتالوج للتعبئة التلقائية --'}</option>
            ${adminState.inventory
              .map(
                (prod) =>
                  `<option value="${prod.id}">${getProdDisplayName(prod)} (${formatDA(prod.price, lang)})</option>`
              )
              .join('')}
          </select>
        </div>

        <form id="adm-landing-form" class="adm-form-grid">
          <div class="adm-field">
            <label class="adm-label">${tr.lp.offerTitleLabel}</label>
            <input
              id="adm-lp-title-input"
              name="title"
              type="text"
              class="adm-input"
              placeholder="${tr.lp.offerTitlePlaceholder}"
              value="${editingPage ? editingPage.title : ''}"
              required
            />
          </div>

          <div class="adm-field">
            <label class="adm-label">${tr.lp.slugLabel}</label>
            <input
              id="adm-lp-slug-input"
              name="slug"
              type="text"
              dir="ltr"
              class="adm-input"
              value="${editingPage ? editingPage.slug : '/offer/special-promo'}"
              required
            />
          </div>

          <div class="adm-field">
            <label class="adm-label">${tr.lp.origPriceLabel}</label>
            <input
              id="adm-lp-orig-price"
              name="originalPrice"
              type="number"
              min="0"
              class="adm-input"
              value="${editingPage ? editingPage.originalPrice : '6500'}"
              required
            />
          </div>

          <div class="adm-field">
            <label class="adm-label">${tr.lp.discPriceLabel}</label>
            <input
              id="adm-lp-disc-price"
              name="discountPrice"
              type="number"
              min="0"
              class="adm-input"
              value="${editingPage ? editingPage.discountPrice : '4500'}"
              required
            />
          </div>

          <div class="adm-field">
            <label class="adm-label">${tr.lp.mainImgLabel}</label>
            <div class="adm-upload-box">
              <div class="adm-upload-left">
                <img id="lp-main-preview-thumb" src="${mainImg}" alt="Offer" referrerpolicy="no-referrer" class="adm-upload-thumb" />
                <div>
                  <span class="adm-upload-title">${tr.lp.mainImgTitle}</span>
                  <span class="adm-upload-sub">${tr.lp.mainImgSub}</span>
                </div>
              </div>
              <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.cms.chooseBtn}</span>
              <input id="adm-lp-main-file" type="file" accept="image/*" class="adm-file-hidden" />
            </div>
          </div>

          <div class="adm-field">
            <label class="adm-label">${tr.lp.galleryLabel}</label>
            <div class="adm-upload-box">
              <div class="adm-upload-left">
                <div>
                  <span class="adm-upload-title">${tr.lp.galleryTitle(galleryList.length)}</span>
                  <span class="adm-upload-sub">${tr.lp.gallerySub}</span>
                </div>
              </div>
              <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.lp.addPhotosBtn}</span>
              <input id="adm-lp-gallery-files" type="file" accept="image/*" multiple class="adm-file-hidden" />
            </div>
          </div>

          <div class="adm-field full">
            <label class="adm-label">${tr.lp.descLabel}</label>
            <textarea
              id="adm-lp-desc-input"
              name="description"
              rows="2"
              class="adm-textarea"
              placeholder="${tr.lp.descPlaceholder}"
              required
            >${editingPage ? editingPage.description : ''}</textarea>
          </div>

          <!-- العرض الاختياري في صفحة الهبوط (مثال: تاخذ 2 شحن مجاني) -->
          <div class="adm-field full" style="background:#faf8f9; border:1px solid #ece7ea; border-radius:12px; padding:0.9rem;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
              <label style="display:inline-flex; align-items:center; gap:0.5rem; font-size:0.86rem; font-weight:800; color:#18181b; cursor:pointer;">
                <input
                  type="checkbox"
                  name="offerEnabled"
                  style="width:17px; height:17px; accent-color:var(--adm-pink); cursor:pointer;"
                  ${!editingPage || editingPage.offerEnabled !== false ? 'checked' : ''}
                />
                <span>${isFr ? 'Activer une offre optionnelle (ex: Prenez 2 = Livraison Gratuite)' : 'تفعيل عرض اختياري في صفحة الهبوط (مثال: تاخذ 2 شحن مجاني)'}</span>
              </label>
            </div>

            <div class="adm-form-grid">
              <div class="adm-field">
                <label class="adm-label">${isFr ? 'Quantité pour l’offre (ex: 2)' : 'الكمية المطلوبة للعرض (مثلاً: 2)'}</label>
                <input
                  name="offerMinQty"
                  type="number"
                  min="2"
                  max="20"
                  class="adm-input"
                  style="background:#fff;"
                  value="${editingPage && editingPage.offerMinQty ? editingPage.offerMinQty : 2}"
                />
              </div>

              <div class="adm-field">
                <label class="adm-label">${isFr ? 'Texte de l’offre affiché au client' : 'نص العرض الاختياري للزبون'}</label>
                <input
                  name="offerText"
                  type="text"
                  class="adm-input"
                  style="background:#fff;"
                  placeholder="${isFr ? 'Ex: Prenez 2 = Livraison Gratuite' : 'مثال: اشترِ 2 واحصل على شحن مجاني'}"
                  value="${editingPage && editingPage.offerText !== undefined ? editingPage.offerText : 'اشترِ 2 واحصل على شحن مجاني'}"
                />
              </div>

              <div class="adm-field full">
                <label style="display:inline-flex; align-items:center; gap:0.45rem; font-size:0.82rem; font-weight:700; color:#15803d; cursor:pointer;">
                  <input
                    type="checkbox"
                    name="offerFreeShipping"
                    style="width:16px; height:16px; accent-color:#15803d; cursor:pointer;"
                    ${!editingPage || editingPage.offerFreeShipping !== false ? 'checked' : ''}
                  />
                  <span>${isFr ? 'Livraison gratuite automatique avec cette offre' : 'منح شحن مجاني تلقائياً عند اختيار هذا العرض'}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="adm-field full">
            <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem;">
              ${editingPage ? tr.lp.updateBtn : tr.lp.createBtn}
            </button>
          </div>
        </form>
      </div>
    `
        : ''
    }

    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.lp.activeListTitle(adminState.landingPages.length)}</h2>
          <p class="adm-card-sub">
            ${isFr ? 'Pages d’atterrissage prêtes pour vos publicités Facebook, Instagram & TikTok avec formulaire COD intégré' : 'صفحات هبوط احترافية جاهزة لإعلانات فيسبوك، إنستغرام وتيك توك مع استمارة الدفع عند الاستلام'}
          </p>
        </div>
        ${
          !isLpFormVisible
            ? `<button type="button" data-adm-action="toggle-landing-form" class="adm-btn adm-btn-pink">
                ${tr.lp.createTitle}
              </button>`
            : ''
        }
      </div>

      <div class="adm-orders-list">
        ${adminState.landingPages
          .map((lp) => {
            const orig = Number(lp.originalPrice || 0);
            const disc = Number(lp.discountPrice || 0);
            const saved = Math.max(0, orig - disc);
            const pct = orig > disc && orig > 0 ? Math.round(((orig - disc) / orig) * 100) : 25;
            const liveUrl = `./landing.html?id=${encodeURIComponent(lp.id)}`;

            return `
            <article class="adm-order-card" style="justify-content:space-between;">
              <div>
                <div style="display:flex; gap:0.9rem; align-items:flex-start;">
                  <div style="position:relative; width:84px; height:84px; border-radius:12px; overflow:hidden; flex-shrink:0; border:1px solid #ece7ea;">
                    <img src="${lp.imageUrl}" alt="${lp.title}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" />
                    <span style="position:absolute; top:4px; right:4px; background:var(--adm-pink); color:#fff; font-size:0.68rem; font-weight:800; padding:2px 6px; border-radius:99px;">
                      -${pct}%
                    </span>
                  </div>

                  <div style="flex:1; min-width:0;">
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.4rem; margin-bottom:0.25rem;">
                      <span class="adm-badge adm-badge-delivered" style="font-size:0.68rem;">
                        ${isFr ? 'Active · Prête Ads' : 'نشطة · جاهزة للإعلانات'}
                      </span>
                      <span dir="ltr" style="font-size:0.72rem; color:var(--adm-text-muted); font-family:monospace;">
                        ?lp=${lp.id}
                      </span>
                    </div>

                    <strong style="font-size:0.94rem; color:var(--adm-text-dark); display:block; line-height:1.35;">
                      ${lp.title}
                    </strong>

                    <div style="margin-top:0.4rem; display:flex; align-items:baseline; gap:0.5rem; flex-wrap:wrap;">
                      <strong style="color:var(--adm-pink); font-size:1.05rem;">${formatDA(disc, lang)}</strong>
                      ${
                        orig > disc
                          ? `<span style="text-decoration:line-through; color:var(--adm-text-muted); font-size:0.78rem;">${formatDA(orig, lang)}</span>`
                          : ''
                      }
                      ${
                        saved > 0
                          ? `<span style="font-size:0.72rem; font-weight:700; color:#15803d; background:#ecfdf5; padding:2px 7px; border-radius:6px;">
                              ${isFr ? `Économie ${formatDA(saved, 'fr')}` : `توفير ${formatDA(saved, 'ar')}`}
                            </span>`
                          : ''
                      }
                    </div>
                  </div>
                </div>

                <p style="font-size:0.78rem; color:var(--adm-text-body); margin:0.65rem 0 0; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                  ${lp.description || ''}
                </p>
              </div>

              <div style="display:flex; gap:0.4rem; flex-wrap:wrap; justify-content:space-between; align-items:center; border-top:1px solid #ece7ea; padding-top:0.7rem; margin-top:0.4rem;">
                <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
                  <button
                    type="button"
                    data-adm-action="preview-landing"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-pink adm-btn-sm"
                  >
                    ${tr.lp.previewBtn}
                  </button>
                  <a
                    href="${liveUrl}"
                    target="_blank"
                    rel="noopener"
                    class="adm-btn adm-btn-soft adm-btn-sm"
                    style="text-decoration:none;"
                  >
                    ${isFr ? 'Ouvrir la page' : 'فتح الصفحة'}
                  </a>
                  <button
                    type="button"
                    data-adm-action="copy-landing-link"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-outline adm-btn-sm"
                  >
                    ${isFr ? 'Copier Lien' : 'نسخ الرابط'}
                  </button>
                </div>

                <div style="display:flex; gap:0.35rem;">
                  <button
                    type="button"
                    data-adm-action="edit-landing"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-outline adm-btn-sm"
                  >
                    ${tr.inv.editBtn}
                  </button>
                  <button
                    type="button"
                    data-adm-action="delete-landing"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-danger adm-btn-sm"
                  >
                    ${tr.inv.deleteBtn}
                  </button>
                </div>
              </div>
            </article>
          `;
          })
          .join('')}
      </div>
    </div>
  `;
}

function renderLandingPreviewModal() {
  if (!adminState.previewLandingId) return '';
  const lp = adminState.landingPages.find((item) => item.id === adminState.previewLandingId);
  if (!lp) return '';

  const tr = t();
  const lang = getLang();
  const isFr = lang === 'fr';
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const gallery =
    Array.isArray(lp.gallery) && lp.gallery.length > 0 ? lp.gallery : [lp.imageUrl];

  const orig = Number(lp.originalPrice || 0);
  const disc = Number(lp.discountPrice || 0);
  const offerEnabled = lp.offerEnabled !== false;
  const offerMinQty = Math.max(2, Number(lp.offerMinQty || 2));
  const offerLabel =
    lp.offerText ||
    (isFr
      ? `Prenez ${offerMinQty} = Livraison Gratuite`
      : `اشترِ ${offerMinQty} واحصل على شحن مجاني`);
  const liveUrl = `./landing.html?id=${encodeURIComponent(lp.id)}`;

  return `
    <div class="adm-modal-card" dir="${dir}" style="max-width:860px; background:#faf8f9;">
      <!-- شريط علوي هادئ ومريح للعين -->
      <div style="background:#ffffff; border-bottom:1px solid #ece7ea; padding:0.75rem 1.15rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
        <strong style="font-size:0.88rem; color:#18181b;">${tr.lp.modalHeader(lp.slug)}</strong>

        <div style="display:flex; align-items:center; gap:0.4rem;">
          <button
            type="button"
            data-adm-action="copy-landing-link"
            data-id="${lp.id}"
            class="adm-btn adm-btn-outline adm-btn-sm"
            style="padding:0.35rem 0.7rem; font-size:0.75rem;"
          >
            ${isFr ? 'Copier le lien' : 'نسخ الرابط'}
          </button>
          <a
            href="${liveUrl}"
            target="_blank"
            rel="noopener"
            class="adm-btn adm-btn-pink adm-btn-sm"
            style="padding:0.35rem 0.7rem; font-size:0.75rem; text-decoration:none;"
          >
            ${isFr ? 'Ouvrir la page' : 'فتح الصفحة'}
          </a>
          <button
            type="button"
            data-adm-action="close-landing-modal"
            class="adm-btn adm-btn-soft adm-btn-sm"
            style="padding:0.35rem 0.7rem; font-size:0.75rem;"
          >
            ${tr.lp.closeModal}
          </button>
        </div>
      </div>

      <div class="adm-lp-modal-grid">
        <!-- العمود الأول: المنتج مع صوره فقط -->
        <div style="background:#fff; border:1px solid #ece7ea; border-radius:14px; padding:0.9rem;">
          <div style="position:relative; border-radius:12px; overflow:hidden; aspect-ratio:4/5; margin-bottom:0.65rem; background:#f7f4f5;">
            <img id="lp-modal-main-img" src="${lp.imageUrl}" alt="${lp.title}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" />
          </div>

          ${
            gallery.length > 1
              ? `<div style="display:flex; gap:0.45rem; overflow-x:auto; padding-bottom:0.25rem; margin-bottom:0.5rem;">
                  ${gallery
                    .map(
                      (imgUrl) => `
                      <img
                        src="${imgUrl}"
                        alt="Thumb"
                        data-adm-action="swap-lp-img"
                        data-src="${imgUrl}"
                        style="width:54px; height:54px; border-radius:10px; object-fit:cover; cursor:pointer; border:1.5px solid #e4e4e7;"
                      />
                    `
                    )
                    .join('')}
                </div>`
              : ''
          }

          <h3 style="font-size:1.05rem; font-weight:800; margin:0.4rem 0 0.25rem; color:#18181b;">${lp.title}</h3>

          <div style="display:flex; align-items:baseline; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.45rem;">
            <strong style="font-size:1.3rem; color:var(--adm-pink);">${formatDA(disc, lang)}</strong>
            ${
              orig > disc
                ? `<span style="text-decoration:line-through; color:#71717a; font-size:0.85rem;">${formatDA(orig, lang)}</span>`
                : ''
            }
          </div>

          <p style="font-size:0.8rem; color:#52525b; line-height:1.55; margin:0;">${lp.description || ''}</p>
        </div>

        <!-- العمود الثاني: الكمية + العرض الاختياري + معلومات الزبون فقط -->
        <div style="background:#fff; border:1px solid #ece7ea; border-radius:14px; padding:1rem;">
          <h4 style="margin:0 0 0.85rem; font-size:0.95rem; font-weight:800; color:#18181b;">
            ${isFr ? 'Quantité & Informations client' : 'الكمية ومعلومات الزبون'}
          </h4>

          <form id="adm-lp-quick-order-form" data-lp-id="${lp.id}" style="display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <div>
                <label class="adm-label" style="margin-bottom:0.25rem;">${isFr ? 'Pointure' : 'المقاس'}</label>
                <select name="size" class="adm-select">
                  <option value="36">36</option>
                  <option value="37" selected>37</option>
                  <option value="38">38</option>
                  <option value="39">39</option>
                  <option value="40">40</option>
                  <option value="41">41</option>
                </select>
              </div>
              <div>
                <label class="adm-label" style="margin-bottom:0.25rem;">${isFr ? 'Couleur' : 'اللون'}</label>
                <select name="color" class="adm-select">
                  <option value="Rose">Rose / وردي</option>
                  <option value="Beige">Beige / بيج</option>
                  <option value="Noir">Noir / أسود</option>
                  <option value="Blanc">Blanc / أبيض</option>
                </select>
              </div>
            </div>

            <div>
              <label class="adm-label" style="margin-bottom:0.3rem;">
                ${isFr ? 'Quantité & Offre :' : 'الكمية والعرض الاختياري:'}
              </label>
              <select name="bundleQty" id="adm-lp-modal-bundle" data-unit-price="${disc}" class="adm-select" style="font-weight:700;">
                <option value="1">
                  ${isFr ? `1 Pièce — ${formatDA(disc, 'fr')}` : `قطعة واحدة (1) — ${formatDA(disc, 'ar')}`}
                </option>
                ${
                  offerEnabled
                    ? `<option value="${offerMinQty}">
                        ${offerLabel} (${offerMinQty}) — ${formatDA(disc * offerMinQty, lang)}
                      </option>`
                    : `<option value="2">2 — ${formatDA(disc * 2, lang)}</option>`
                }
              </select>
            </div>

            <input name="fullName" type="text" required class="adm-input" placeholder="${tr.lp.fullNamePlaceholder}" />
            <input name="phone" type="tel" dir="ltr" required class="adm-input" placeholder="${tr.lp.phonePlaceholder}" />

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <select name="wilaya" class="adm-select">
                ${adminState.shipping.rates
                  .map(
                    (w) =>
                      `<option value="${w.code} - ${getWilayaDisplayName(w)}">${w.code} - ${getWilayaDisplayName(w)}</option>`
                  )
                  .join('')}
              </select>
              <select name="deliveryType" class="adm-select">
                <option value="À Domicile / للمنزل">${isFr ? 'À Domicile' : 'توصيل للمنزل'}</option>
                <option value="Stop-Desk / للمكتب">${isFr ? 'Stop-Desk' : 'مكتب التوصيل'}</option>
              </select>
            </div>

            <input name="address" type="text" required class="adm-input" placeholder="${tr.lp.addressPlaceholder}" />

            <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem; font-size:0.9rem;">
              ${tr.lp.confirmQuickOrder(formatDA(disc, lang))}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * القسم 5: إعدادات الشحن وأسعار التوصيل وإضافة ولاية جديدة
 */
function renderShippingSection() {
  const tr = t();
  const isFr = getLang() === 'fr';
  const sq = (adminState.shippingSearch || '').trim().toLowerCase();

  const indexedRates = adminState.shipping.rates.map((r, idx) => ({ r, idx }));
  const filteredRates = sq
    ? indexedRates.filter(
        ({ r }) =>
          r.code.toLowerCase().includes(sq) ||
          (r.name && r.name.toLowerCase().includes(sq)) ||
          (r.name_fr && r.name_fr.toLowerCase().includes(sq)) ||
          getWilayaDisplayName(r).toLowerCase().includes(sq)
      )
    : adminState.showAllWilayas
    ? indexedRates
    : indexedRates.slice(0, 12);

  const nextSuggestedCode = String(adminState.shipping.rates.length + 1).padStart(2, '0');

  return `
    <!-- بطاقة إضافة ولاية جديدة -->
    <div class="adm-card" style="margin-bottom:1.1rem;">
      <div class="adm-card-head" style="margin-bottom:0.85rem;">
        <div>
          <h2 class="adm-card-title">${isFr ? 'Ajouter une nouvelle wilaya' : 'إضافة ولاية جديدة'}</h2>
          <p class="adm-card-sub">
            ${isFr ? 'Ajoutez une wilaya avec son code, son nom et ses tarifs de livraison (Domicile & Stop-Desk)' : 'أدخل رقم الولاية واسمها وسعر التوصيل للمنزل وللمكتب لإضافتها فوراً إلى قائمة التوصيل'}
          </p>
        </div>
      </div>

      <form id="adm-add-wilaya-form" class="adm-wilaya-add-grid">
        <div class="adm-field">
          <label class="adm-label">${isFr ? 'Code Wilaya *' : 'رقم / رمز الولاية *'}</label>
          <input
            name="code"
            type="text"
            dir="ltr"
            required
            placeholder="${nextSuggestedCode}"
            class="adm-input"
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${isFr ? 'Nom (Arabe) *' : 'اسم الولاية (بالعربية) *'}</label>
          <input
            name="name"
            type="text"
            required
            placeholder="${isFr ? 'Ex: بجاية' : 'مثال: بجاية'}"
            class="adm-input"
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${isFr ? 'Nom (Français)' : 'الاسم بالفرنسية (اختياري)'}</label>
          <input
            name="name_fr"
            type="text"
            dir="ltr"
            placeholder="Ex: Béjaïa"
            class="adm-input"
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.ship.homeFeeLabel}</label>
          <input
            name="homeFee"
            type="number"
            min="0"
            step="50"
            value="600"
            required
            class="adm-input"
          />
        </div>

        <div class="adm-field">
          <label class="adm-label">${tr.ship.deskFeeLabel}</label>
          <input
            name="deskFee"
            type="number"
            min="0"
            step="50"
            value="400"
            required
            class="adm-input"
          />
        </div>

        <div class="adm-field">
          <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.65rem 1rem;">
            ${tr.ship.addBtn}
          </button>
        </div>
      </form>
    </div>

    <!-- قائمة أسعار التوصيل حسب الولايات -->
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.ship.ratesListTitle(adminState.shipping.rates.length)}</h2>
          <p class="adm-card-sub">${tr.ship.ratesListSub}</p>
        </div>
        <div class="adm-card-head-actions">
          <input
            id="adm-shipping-search"
            type="search"
            class="adm-input"
            style="padding:0.5rem 0.8rem;"
            placeholder="${isFr ? 'Chercher une wilaya...' : 'ابحث عن اسم أو رقم الولاية...'}"
            value="${adminState.shippingSearch || ''}"
          />
        </div>
      </div>

      <div id="adm-shipping-grid" class="adm-products-grid">
        ${filteredRates
          .map(
            ({ r, idx }) => `
            <div class="adm-prod-card" style="gap:0.5rem;">
              <div style="display:flex; align-items:center; justify-content:space-between;">
                <strong style="font-size:0.88rem; color:var(--adm-text-dark);">${r.code} - ${getWilayaDisplayName(r)}</strong>
                <button
                  type="button"
                  data-adm-action="delete-wilaya"
                  data-index="${idx}"
                  class="adm-btn adm-btn-danger adm-btn-sm"
                  style="padding:0.2rem 0.55rem;"
                >${tr.inv.deleteBtn}</button>
              </div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
                <div>
                  <span style="font-size:0.7rem; color:var(--adm-text-muted); display:block;">${tr.ship.homeFeeLabel}</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    data-adm-ship-home="${idx}"
                    value="${r.homeFee}"
                    class="adm-input"
                    style="padding:0.4rem 0.6rem; font-weight:700;"
                  />
                </div>
                <div>
                  <span style="font-size:0.7rem; color:var(--adm-text-muted); display:block;">${tr.ship.deskFeeLabel}</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    data-adm-ship-desk="${idx}"
                    value="${r.deskFee}"
                    class="adm-input"
                    style="padding:0.4rem 0.6rem; font-weight:700;"
                  />
                </div>
              </div>
            </div>
          `
          )
          .join('')}
      </div>

      ${
        !sq && adminState.shipping.rates.length > 12
          ? `
          <div style="text-align:center; margin-top:1rem;">
            <button type="button" data-adm-action="toggle-all-wilayas" class="adm-btn adm-btn-soft adm-btn-sm">
              ${
                adminState.showAllWilayas
                  ? isFr
                    ? 'Réduire la liste'
                    : 'طي القائمة (عرض 12 ولاية فقط)'
                  : isFr
                  ? `Afficher les ${adminState.shipping.rates.length} wilayas`
                  : `عرض جميع الولايات (${adminState.shipping.rates.length} ولاية)`
              }
            </button>
          </div>
        `
          : ''
      }
    </div>
  `;
}

function updateProductStockUI(prodId, newStock) {
  const tr = t();
  const inputEl = document.getElementById(`adm-stock-input-${prodId}`);
  if (inputEl instanceof HTMLInputElement) {
    inputEl.value = String(newStock);
  }
  const cardEl = document.getElementById(`adm-prod-card-${prodId}`);
  if (cardEl) {
    cardEl.classList.toggle('low-stock', newStock < 5);
  }
  const badgeCell = document.getElementById(`adm-stock-badge-${prodId}`);
  if (badgeCell) {
    badgeCell.innerHTML =
      newStock === 0
        ? `<span class="adm-badge adm-badge-cancelled">${tr.inv.outOfStock}</span>`
        : newStock < 5
        ? `<span class="adm-badge adm-badge-confirming">${tr.inv.lowStockBadge(newStock)}</span>`
        : `<span class="adm-badge adm-badge-delivered">${tr.inv.inStockBadge(newStock)}</span>`;
  }
}

export function setupAdminEvents() {
  const root = document.getElementById('admin-dashboard-root');
  if (!root) return;

  root.addEventListener('click', (e) => {
    const btn = e.target instanceof Element ? e.target.closest('[data-adm-action]') : null;
    if (!btn) return;

    const action = btn.getAttribute('data-adm-action');
    const id = btn.getAttribute('data-id');

    switch (action) {
      case 'toggle-admin-lang': {
        if (store) {
          store.toggleLanguage();
        }
        renderAdminDashboard();
        showToast(t().toasts.langSwitched);
        break;
      }

      case 'toggle-admin-sidebar': {
        adminState.isSidebarOpen = !adminState.isSidebarOpen;
        const sidebar = document.getElementById('adm-sidebar');
        const overlay = document.getElementById('adm-sidebar-overlay');
        if (sidebar) {
          sidebar.classList.toggle('open', adminState.isSidebarOpen);
          sidebar.classList.toggle('collapsed', !adminState.isSidebarOpen);
        }
        if (overlay) {
          overlay.classList.toggle('open', adminState.isSidebarOpen);
        }
        break;
      }

      case 'close-admin-sidebar': {
        adminState.isSidebarOpen = false;
        const sidebar = document.getElementById('adm-sidebar');
        const overlay = document.getElementById('adm-sidebar-overlay');
        if (sidebar) {
          sidebar.classList.remove('open');
          sidebar.classList.add('collapsed');
        }
        if (overlay) {
          overlay.classList.remove('open');
        }
        break;
      }

      case 'switch-tab': {
        const tab = btn.getAttribute('data-tab') || 'inventory';
        adminState.activeTab = tab;
        root.querySelectorAll('[data-adm-action="switch-tab"]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-tab') === tab);
        });
        root.querySelectorAll('.adm-tab-section').forEach((sec) => {
          sec.classList.toggle('active', sec.id === `adm-tab-${tab}`);
        });
        const activeTitleEl = root.querySelector('.adm-active-tab-title');
        if (activeTitleEl) {
          const tabObj = root.querySelector(`.adm-sidebar-item[data-tab="${tab}"] .adm-sidebar-item-label`);
          if (tabObj) activeTitleEl.textContent = tabObj.textContent.trim();
        }
        // إغلاق الشريط الجانبي تلقائياً على الهواتف والشاشات الصغيرة
        if (window.innerWidth < 1024) {
          adminState.isSidebarOpen = false;
          const sidebar = document.getElementById('adm-sidebar');
          const overlay = document.getElementById('adm-sidebar-overlay');
          if (sidebar) {
            sidebar.classList.remove('open');
            sidebar.classList.add('collapsed');
          }
          if (overlay) {
            overlay.classList.remove('open');
          }
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }

      case 'step-stock': {
        const delta = Number(btn.getAttribute('data-delta') || 0);
        const item = adminState.inventory.find((p) => p.id === id);
        if (item) {
          item.stock = Math.max(0, Number(item.stock || 0) + delta);
          adminState.saveAll();
          syncProductToSupabase(item);
          updateProductStockUI(item.id, item.stock);
        }
        break;
      }

      case 'filter-orders': {
        adminState.orderFilterStatus = btn.getAttribute('data-status') || 'all';
        renderAdminDashboard();
        break;
      }

      case 'close-admin': {
        closeAdminDashboard();
        break;
      }

      case 'logout-admin': {
        showToast(t().toasts.loggedOut);
        closeAdminDashboard();
        break;
      }

      case 'preview-landing': {
        adminState.previewLandingId = id;
        const modal = document.getElementById('adm-landing-modal');
        if (modal) {
          modal.innerHTML = renderLandingPreviewModal();
          modal.classList.add('open');
        }
        break;
      }

      case 'close-landing-modal': {
        adminState.previewLandingId = null;
        const modal = document.getElementById('adm-landing-modal');
        if (modal) modal.classList.remove('open');
        break;
      }

      case 'swap-lp-img': {
        const src = btn.getAttribute('data-src');
        const mainImg = document.getElementById('lp-modal-main-img');
        if (mainImg && src) mainImg.setAttribute('src', src);
        break;
      }

      case 'toggle-product-form': {
        adminState.editingProductId = null;
        adminState.isProductFormOpen = !adminState.isProductFormOpen;
        if (adminState.isProductFormOpen) {
          adminState.draftProductImage = '';
          adminState.draftProductGallery = [];
          adminState.draftProductForm = {
            name: '',
            name_fr: '',
            slug: '',
            category: '',
            description_ar: '',
            description_fr: '',
            originalPrice: '',
            discountPrice: '',
            isVisible: true,
            isNew: false,
            isBestSeller: false,
            isSpecialOffer: false,
            colorName: 'Beige',
            colorHex: '#D2B48C',
            sizeFrom: 36,
            sizeTo: 41,
            defaultSizeStock: 5,
            sizeStock: buildSizeStockRange(36, 41, 5),
            variants: [],
          };
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        renderAdminDashboard();
        break;
      }

      case 'toggle-category-form': {
        adminState.isCategoryFormOpen = !adminState.isCategoryFormOpen;
        adminState.editingCategoryId = null;
        adminState.draftCategoryImage = IMAGES.talons;
        renderAdminDashboard();
        break;
      }

      case 'edit-category': {
        const cat = adminState.categories.find((c) => c.id === id);
        if (cat) {
          adminState.editingCategoryId = cat.id;
          adminState.isCategoryFormOpen = true;
          adminState.draftCategoryImage = cat.image;
          renderAdminDashboard();
        }
        break;
      }

      case 'cancel-category-edit': {
        adminState.editingCategoryId = null;
        adminState.isCategoryFormOpen = false;
        adminState.draftCategoryImage = IMAGES.talons;
        renderAdminDashboard();
        break;
      }

      case 'delete-category': {
        if (adminState.categories.length <= 1) {
          showToast(getLang() === 'fr' ? 'Gardez au moins une catégorie' : 'يجب الإبقاء على فئة واحدة على الأقل');
          break;
        }
        adminState.categories = adminState.categories.filter((c) => c.id !== id);
        adminState.saveAll();
        syncCmsToSupabase(adminState.cms, 0, adminState.categories);
        renderAdminDashboard();
        showToast(getLang() === 'fr' ? 'Catégorie supprimée' : 'تم حذف الفئة بنجاح');
        break;
      }

      case 'toggle-advanced-product-fields': {
        adminState.showAdvancedProductFields = !adminState.showAdvancedProductFields;
        renderAdminDashboard();
        break;
      }

      case 'toggle-landing-form': {
        adminState.isLandingFormOpen = !adminState.isLandingFormOpen;
        renderAdminDashboard();
        if (adminState.isLandingFormOpen) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }

      case 'toggle-all-wilayas': {
        adminState.showAllWilayas = !adminState.showAllWilayas;
        renderAdminDashboard();
        break;
      }

      case 'edit-landing': {
        const lp = adminState.landingPages.find((item) => item.id === id);
        if (lp) {
          adminState.editingLandingId = id;
          adminState.isLandingFormOpen = true;
          adminState.draftLandingMainImage = lp.imageUrl;
          adminState.draftLandingGallery = Array.isArray(lp.gallery)
            ? [...lp.gallery]
            : [lp.imageUrl];
          renderAdminDashboard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }

      case 'cancel-landing-edit': {
        adminState.editingLandingId = null;
        adminState.isLandingFormOpen = false;
        adminState.draftLandingMainImage = IMAGES.talons;
        adminState.draftLandingGallery = [IMAGES.talons, IMAGES.hero];
        renderAdminDashboard();
        break;
      }

      case 'remove-lp-gallery-img': {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          adminState.draftLandingGallery.splice(idx, 1);
          renderAdminDashboard();
        }
        break;
      }

      case 'delete-landing': {
        adminState.landingPages = adminState.landingPages.filter((lp) => lp.id !== id);
        adminState.saveAll();
        if (id) deleteLandingPageFromSupabase(id);
        renderAdminDashboard();
        showToast(t().toasts.lpDeleted);
        break;
      }

      case 'copy-landing-link': {
        if (!id) break;
        const shareUrl = new URL(`./landing.html?id=${encodeURIComponent(id)}`, window.location.href).href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).catch(() => {});
        }
        showToast(
          getLang() === 'fr'
            ? `Lien de la page d'atterrissage copié : ${shareUrl}`
            : `تم نسخ رابط صفحة الهبوط المستقلة بنجاح`
        );
        break;
      }

      case 'copy-product-link': {
        const slug = btn.getAttribute('data-slug') || id;
        if (!slug) break;
        const prodUrl = new URL(`./index.html?product=${encodeURIComponent(slug)}`, window.location.href).href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(prodUrl).catch(() => {});
        }
        showToast(
          getLang() === 'fr'
            ? `Lien du produit copié : ${prodUrl}`
            : `تم نسخ رابط المنتج المستقل بنجاح`
        );
        break;
      }

      case 'generate-variant-rows': {
        const df = adminState.draftProductForm;
        const colorInp = document.getElementById('adm-variant-color-name');
        const hexInp = document.getElementById('adm-color-picker');
        const fromInp = document.getElementById('adm-size-from');
        const toInp = document.getElementById('adm-size-to');
        const qtyInp = document.getElementById('adm-default-size-stock');

        const cName =
          (colorInp instanceof HTMLInputElement ? colorInp.value.trim() : df.colorName) || 'Beige';
        const cHex =
          (hexInp instanceof HTMLInputElement ? hexInp.value.trim() : df.colorHex) || '#D2B48C';
        const rawFrom = fromInp instanceof HTMLInputElement ? Number(fromInp.value || 36) : Number(df.sizeFrom || 36);
        const rawTo = toInp instanceof HTMLInputElement ? Number(toInp.value || 41) : Number(df.sizeTo || 41);
        const sFrom = Math.max(30, Math.min(48, Math.min(rawFrom, rawTo)));
        const sTo = Math.max(30, Math.min(48, Math.max(rawFrom, rawTo)));
        const defQty = Math.max(
          0,
          qtyInp instanceof HTMLInputElement ? Number(qtyInp.value ?? 5) : Number(df.defaultSizeStock ?? 5)
        );

        df.colorName = cName;
        df.colorHex = cHex;
        df.sizeFrom = sFrom;
        df.sizeTo = sTo;
        df.defaultSizeStock = defQty;

        if (!Array.isArray(df.variants)) df.variants = [];

        for (let sz = sFrom; sz <= sTo; sz++) {
          const existingIdx = df.variants.findIndex(
            (v) =>
              Number(v.size) === sz &&
              String(v.colorName || '').trim().toLowerCase() === cName.toLowerCase()
          );
          if (existingIdx !== -1) {
            df.variants[existingIdx].colorHex = cHex;
            df.variants[existingIdx].quantity = defQty;
            df.variants[existingIdx].active = true;
          } else {
            df.variants.push({
              size: sz,
              colorName: cName,
              colorHex: cHex,
              quantity: defQty,
              active: true,
            });
          }
        }

        renderAdminDashboard();
        showToast(
          getLang() === 'fr'
            ? `Pointures ${sFrom} à ${sTo} générées pour la couleur ${cName}`
            : `تم توليد المقاسات من ${sFrom} إلى ${sTo} للون ${cName}`
        );
        break;
      }

      case 'add-manual-variant-row': {
        syncCurrentProductFormToDraft();
        const df = adminState.draftProductForm;
        if (!Array.isArray(df.variants)) df.variants = [];
        const lastRow = df.variants[df.variants.length - 1];
        let nextSize = '';
        if (lastRow && lastRow.size !== '' && lastRow.size !== null && lastRow.size !== undefined) {
          const num = Number(lastRow.size);
          if (!isNaN(num) && num > 0) {
            nextSize = Math.min(48, num + 1);
          } else {
            nextSize = lastRow.size;
          }
        }
        df.variants.push({
          size: nextSize,
          colorName: df.colorName || 'Beige',
          colorHex: df.colorHex || '#D2B48C',
          quantity: Number(df.defaultSizeStock ?? 5),
          active: true,
        });
        renderAdminDashboard();
        break;
      }

      case 'remove-variant-row': {
        const idx = Number(btn.getAttribute('data-index'));
        const df = adminState.draftProductForm;
        if (Array.isArray(df.variants) && !Number.isNaN(idx)) {
          df.variants.splice(idx, 1);
          renderAdminDashboard();
        }
        break;
      }

      case 'trigger-gallery-input': {
        syncCurrentProductFormToDraft();
        const fileInp = document.getElementById('adm-prod-gallery-input');
        if (fileInp instanceof HTMLInputElement) fileInp.click();
        break;
      }

      case 'add-prod-image-url': {
        syncCurrentProductFormToDraft();
        const urlInp = document.getElementById('adm-prod-image-url-input');
        const rawVal = urlInp instanceof HTMLInputElement ? urlInp.value.trim() : '';
        if (!rawVal) {
          showToast(getLang() === 'fr' ? 'Entrez un lien image valide' : 'يرجى إدخال رابط صورة صحيح');
          break;
        }
        const urls = rawVal
          .split(/[\n,;]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 5);

        if (urls.length === 0) {
          showToast(getLang() === 'fr' ? 'Entrez un lien image valide' : 'يرجى إدخال رابط صورة صحيح');
          break;
        }

        if (!Array.isArray(adminState.draftProductGallery)) {
          adminState.draftProductGallery = [];
        }
        if (adminState.draftProductImage && !adminState.draftProductGallery.includes(adminState.draftProductImage)) {
          adminState.draftProductGallery.unshift(adminState.draftProductImage);
        }

        urls.forEach((u) => {
          if (!adminState.draftProductGallery.includes(u)) {
            adminState.draftProductGallery.push(u);
          }
        });

        adminState.draftProductImage = adminState.draftProductGallery[0] || urls[0];
        renderAdminDashboard();
        showToast(
          getLang() === 'fr'
            ? `${urls.length} photo(s) ajoutée(s) au produit`
            : `تمت إضافة ${urls.length} صور للمنتج بنجاح`
        );
        break;
      }

      case 'set-main-prod-img': {
        syncCurrentProductFormToDraft();
        const idx = Number(btn.getAttribute('data-index'));
        if (Array.isArray(adminState.draftProductGallery) && !Number.isNaN(idx) && adminState.draftProductGallery[idx]) {
          const [chosen] = adminState.draftProductGallery.splice(idx, 1);
          adminState.draftProductGallery.unshift(chosen);
          adminState.draftProductImage = chosen;
          renderAdminDashboard();
          showToast(getLang() === 'fr' ? 'Photo principale mise à jour' : 'تم تعيين الصورة كرئيسية للمنتج');
        }
        break;
      }

      case 'move-prod-gallery-img': {
        syncCurrentProductFormToDraft();
        const idx = Number(btn.getAttribute('data-index'));
        const dir = Number(btn.getAttribute('data-dir') || 0);
        if (!Number.isNaN(idx) && dir !== 0 && Array.isArray(adminState.draftProductGallery)) {
          const targetIdx = idx + dir;
          if (targetIdx >= 0 && targetIdx < adminState.draftProductGallery.length) {
            const item = adminState.draftProductGallery.splice(idx, 1)[0];
            adminState.draftProductGallery.splice(targetIdx, 0, item);
            adminState.draftProductImage = adminState.draftProductGallery[0] || '';
            renderAdminDashboard();
          }
        }
        break;
      }

      case 'quick-add-prod-photos': {
        if (!id) break;
        const inputEl = document.querySelector(`input[data-adm-row-img-upload="${id}"]`);
        if (inputEl instanceof HTMLInputElement) {
          inputEl.click();
        }
        break;
      }

      case 'edit-product': {
        const prod = adminState.inventory.find((p) => p.id === id);
        if (prod) {
          adminState.editingProductId = id;
          adminState.isProductFormOpen = true;
          const gallery =
            Array.isArray(prod.gallery) && prod.gallery.length > 0
              ? [...prod.gallery]
              : prod.image
              ? [prod.image]
              : [];
          adminState.draftProductImage = gallery[0] || prod.image || '';
          adminState.draftProductGallery = gallery;

          const szFrom = prod.sizeFrom || 36;
          const szTo = prod.sizeTo || 41;
          const defQty = prod.defaultSizeStock ?? 5;
          const primaryColor =
            prod.colorName || (Array.isArray(prod.colors) && prod.colors[0]) || 'Beige';
          const primaryHex =
            prod.colorHex || COLOR_SWATCHES[primaryColor]?.hex || '#D2B48C';

          let variants = [];
          if (Array.isArray(prod.variants) && prod.variants.length > 0) {
            variants = prod.variants.map((v) => ({
              ...v,
              size:
                v.size === null ||
                v.size === undefined ||
                String(v.size) === 'default' ||
                String(v.size) === 'NaN'
                  ? ''
                  : v.size,
            }));
          } else {
            const cleanSizes = Array.isArray(prod.sizes)
              ? prod.sizes.filter(
                  (s) =>
                    s !== null &&
                    s !== undefined &&
                    String(s).trim() !== '' &&
                    String(s) !== 'default' &&
                    String(s) !== 'NaN' &&
                    !Number.isNaN(s)
                )
              : [];
            const colorsArr =
              Array.isArray(prod.colors) && prod.colors.length > 0
                ? prod.colors
                : [primaryColor];

            if (cleanSizes.length === 0) {
              colorsArr.forEach((cName) => {
                const hex = getProductColorHex(prod, cName) || primaryHex;
                variants.push({
                  size: '',
                  colorName: cName,
                  colorHex: hex,
                  quantity: Number(prod.stock || defQty),
                  active: true,
                });
              });
            } else {
              colorsArr.forEach((cName) => {
                const hex = getProductColorHex(prod, cName) || primaryHex;
                cleanSizes.forEach((sz) => {
                  const qty =
                    prod.sizeStock && prod.sizeStock[sz] !== undefined
                      ? Number(prod.sizeStock[sz])
                      : defQty;
                  variants.push({
                    size: sz,
                    colorName: cName,
                    colorHex: hex,
                    quantity: qty,
                    active: true,
                  });
                });
              });
            }
          }

          const origVal = prod.originalPrice || prod.price || '';
          const discVal =
            prod.discountPrice && prod.discountPrice < (prod.originalPrice || prod.price)
              ? prod.discountPrice
              : prod.price && prod.originalPrice && prod.price < prod.originalPrice
              ? prod.price
              : '';

          adminState.draftProductForm = {
            name: prod.name || '',
            name_fr: prod.name_fr || prod.name || '',
            slug: prod.slug || '',
            category: prod.category || '',
            description_ar: prod.description_ar || '',
            description_fr: prod.description_fr || '',
            originalPrice: origVal,
            discountPrice: discVal,
            isVisible: prod.isVisible !== false,
            isNew: Boolean(prod.isNew ?? false),
            isBestSeller: Boolean(prod.isBestSeller ?? false),
            isSpecialOffer: Boolean(prod.isSpecialOffer ?? false),
            offerEnabled: false,
            offerMinQty: 2,
            offerFreeShipping: false,
            offerText: '',
            colorName: primaryColor,
            colorHex: primaryHex,
            sizeFrom: szFrom,
            sizeTo: szTo,
            defaultSizeStock: defQty,
            sizeStock:
              prod.sizeStock && Object.keys(prod.sizeStock).length > 0
                ? { ...prod.sizeStock }
                : buildSizeStockRange(szFrom, szTo, defQty),
            variants,
          };
          renderAdminDashboard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        break;
      }

      case 'cancel-product-edit': {
        adminState.editingProductId = null;
        adminState.isProductFormOpen = false;
        adminState.showAdvancedProductFields = false;
        adminState.draftGeneratedPreview = null;
        adminState.draftProductImage = '';
        adminState.draftProductGallery = [];
        adminState.draftProductForm = {
          name: '',
          name_fr: '',
          slug: '',
          category: '',
          description_ar: '',
          description_fr: '',
          originalPrice: '',
          discountPrice: '',
          isVisible: true,
          isNew: false,
          isBestSeller: false,
          isSpecialOffer: false,
          offerEnabled: false,
          offerMinQty: 2,
          offerFreeShipping: false,
          offerText: '',
          colorName: 'Beige',
          colorHex: '#D2B48C',
          sizeFrom: 36,
          sizeTo: 41,
          defaultSizeStock: 5,
          sizeStock: buildSizeStockRange(36, 41, 5),
          variants: [],
        };
        renderAdminDashboard();
        break;
      }

      case 'remove-prod-gallery-img': {
        syncCurrentProductFormToDraft();
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          if (adminState.draftProductImage && !adminState.draftProductGallery.includes(adminState.draftProductImage)) {
            adminState.draftProductGallery.unshift(adminState.draftProductImage);
          }
          adminState.draftProductGallery.splice(idx, 1);
          adminState.draftProductImage = adminState.draftProductGallery[0] || '';
          renderAdminDashboard();
        }
        break;
      }

      case 'delete-product': {
        adminState.inventory = adminState.inventory.filter((p) => p.id !== id);
        adminState.saveAll();
        if (id) deleteProductFromSupabase(id);
        renderAdminDashboard();
        showToast(t().toasts.prodDeleted);
        break;
      }

      case 'add-demo-order': {
        const newOrder = {
          id: 'SS-' + Math.floor(1000 + Math.random() * 9000),
          date: new Date().toISOString().slice(0, 10),
          fullName: getLang() === 'fr' ? 'Amira Belkacem' : 'أميرة بلقاسم',
          phone: '0558 91 42 10',
          wilaya: getLang() === 'fr' ? '09 - Blida' : '09 - البليدة',
          address: getLang() === 'fr' ? 'Centre-ville, Blida' : 'شارع فلسطين، وسط المدينة',
          itemsSummary:
            getLang() === 'fr'
              ? 'Escarpins Classiques Rose (Pointure 38 × 1)'
              : 'حذاء كعب عالي كلاسيك وردي (مقاس 38 × 1)',
          total: 5490,
          status: 'new',
        };
        adminState.orders.unshift(newOrder);
        adminState.saveAll();
        syncOrderToSupabase(newOrder);
        renderAdminDashboard();
        showToast(t().toasts.newOrderAdded(newOrder.id));
        break;
      }

      case 'delete-order': {
        adminState.orders = adminState.orders.filter((o) => o.id !== id);
        adminState.saveAll();
        if (id) deleteOrderFromSupabase(id);
        renderAdminDashboard();
        showToast(t().toasts.orderDeleted);
        break;
      }

      case 'delete-wilaya': {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          const removed = adminState.shipping.rates.splice(idx, 1)[0];
          adminState.saveAll();
          if (removed?.code) deleteShippingRateFromSupabase(removed.code);
          renderAdminDashboard();
          showToast(t().toasts.wilayaDeleted);
        }
        break;
      }
    }
  });

  // المعاينة الحية وتعديل المخزون والبحث وتزامن نموذج المنتج
  root.addEventListener('input', (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    if (target instanceof HTMLInputElement && target.id === 'adm-shipping-search') {
      adminState.shippingSearch = target.value;
      const tabSec = document.getElementById('adm-tab-shipping');
      if (tabSec) {
        tabSec.innerHTML = renderShippingSection();
        const newSearchInp = document.getElementById('adm-shipping-search');
        if (newSearchInp instanceof HTMLInputElement) {
          newSearchInp.focus();
          newSearchInp.setSelectionRange(newSearchInp.value.length, newSearchInp.value.length);
        }
      }
      return;
    }

    // تزامن حقول نموذج المنتج مع المسودة الحية
    if (target.closest('#adm-product-form')) {
      const df = adminState.draftProductForm;

      // تزامن تعديلات جدول المقاسات والألوان المباشرة
      if (target.hasAttribute('data-variant-idx')) {
        const vIdx = Number(target.getAttribute('data-variant-idx'));
        const vField = target.getAttribute('data-variant-field');
        if (Array.isArray(df.variants) && df.variants[vIdx] && vField) {
          if (vField === 'active' && target instanceof HTMLInputElement) {
            df.variants[vIdx].active = target.checked;
          } else if (vField === 'quantity' && target instanceof HTMLInputElement) {
            df.variants[vIdx][vField] = Math.max(0, Number(target.value || 0));
          } else if (vField === 'size' && target instanceof HTMLInputElement) {
            df.variants[vIdx][vField] = target.value.trim();
          } else if (target instanceof HTMLInputElement) {
            df.variants[vIdx][vField] = target.value;
          }
        }
        return;
      }

      if (target instanceof HTMLInputElement && target.id === 'adm-color-picker') {
        df.colorHex = target.value;
        if (Array.isArray(df.variants) && df.variants.length === 1) {
          df.variants[0].colorHex = target.value;
          const rowColorInp = document.querySelector(
            '#adm-product-form input[type="color"][data-variant-idx="0"]'
          );
          if (rowColorInp instanceof HTMLInputElement) {
            rowColorInp.value = target.value;
          }
        }
      } else if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        const fieldName = target.getAttribute('name');
        if (fieldName && fieldName in df) {
          if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            df[fieldName] = target.checked;
          } else if (
            fieldName === 'originalPrice' ||
            fieldName === 'discountPrice' ||
            fieldName === 'defaultSizeStock' ||
            fieldName === 'sizeFrom' ||
            fieldName === 'sizeTo'
          ) {
            df[fieldName] = target.value === '' ? '' : Number(target.value);
          } else {
            df[fieldName] = target.value;
            // توليد تلقائي للـ slug عند كتابة الاسم بالفرنسية إذا كان حقل الـ slug فارغاً
            if (fieldName === 'name_fr' && !adminState.editingProductId) {
              const slugInp = document.querySelector('#adm-product-form input[name="slug"]');
              if (slugInp instanceof HTMLInputElement && (!df.slug || df.slug === df._autoSlug)) {
                const generatedSlug = target.value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-|-$/g, '');
                df.slug = generatedSlug;
                df._autoSlug = generatedSlug;
                slugInp.value = generatedSlug;
              }
            }
            if (fieldName === 'colorName' && COLOR_SWATCHES[target.value]?.hex) {
              df.colorHex = COLOR_SWATCHES[target.value].hex;
              const picker = document.getElementById('adm-color-picker');
              if (picker instanceof HTMLInputElement) {
                picker.value = df.colorHex;
              }
            }
          }
        }
      }
    }

    if (target.closest('#adm-cms-form')) {
      const storeNameEl = document.getElementById('cms-store-name');
      const annEnabledEl = document.getElementById('cms-ann-enabled');
      const annTextEl = document.getElementById('cms-ann-text');
      const heroTitleEl = document.getElementById('cms-hero-title');
      const heroSubEl = document.getElementById('cms-hero-sub');
      const heroBtnEl = document.getElementById('cms-hero-btn');

      const pName = document.getElementById('preview-store-name');
      if (pName && storeNameEl instanceof HTMLInputElement) pName.textContent = storeNameEl.value;

      const pAnn = document.getElementById('preview-ann-bar');
      if (pAnn && annEnabledEl instanceof HTMLInputElement && annTextEl instanceof HTMLInputElement) {
        pAnn.style.display = annEnabledEl.checked ? 'block' : 'none';
        pAnn.textContent = annTextEl.value;
      }

      const pHeroTitle = document.getElementById('preview-hero-title');
      if (pHeroTitle && heroTitleEl instanceof HTMLInputElement) pHeroTitle.textContent = heroTitleEl.value;

      const pHeroSub = document.getElementById('preview-hero-sub');
      if (pHeroSub && heroSubEl instanceof HTMLTextAreaElement) pHeroSub.textContent = heroSubEl.value;

      const pHeroBtn = document.getElementById('preview-hero-btn');
      if (pHeroBtn && heroBtnEl instanceof HTMLInputElement) {
        pHeroBtn.textContent = heroBtnEl.value;
      }
    }

    if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-stock-id')) {
      const prodId = target.getAttribute('data-adm-stock-id');
      const newStock = Math.max(0, Number(target.value || 0));
      const item = adminState.inventory.find((p) => p.id === prodId);
      if (item && prodId) {
        item.stock = newStock;
        adminState.saveAll();
        syncProductToSupabase(item);
        updateProductStockUI(prodId, newStock);
      }
    }

    if (target instanceof HTMLInputElement && target.id === 'adm-inventory-search') {
      adminState.inventorySearch = target.value;
      const q = adminState.inventorySearch.trim().toLowerCase();
      const filtered = adminState.inventory.filter(
        (p) =>
          !q ||
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
          (p.slug && p.slug.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
      );
      const grid = document.getElementById('adm-inventory-grid');
      if (grid) grid.innerHTML = renderInventoryCards(filtered);
    }

    if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-ship-home')) {
      const idx = Number(target.getAttribute('data-adm-ship-home'));
      if (adminState.shipping.rates[idx]) {
        adminState.shipping.rates[idx].homeFee = Math.max(0, Number(target.value || 0));
        adminState.saveAll();
        syncShippingRateToSupabase(adminState.shipping.rates[idx]);
      }
    }
    if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-ship-desk')) {
      const idx = Number(target.getAttribute('data-adm-ship-desk'));
      if (adminState.shipping.rates[idx]) {
        adminState.shipping.rates[idx].deskFee = Math.max(0, Number(target.value || 0));
        adminState.saveAll();
        syncShippingRateToSupabase(adminState.shipping.rates[idx]);
      }
    }
  });

  // رفع الصور من الجهاز + تغيير حالة الطلبات
  root.addEventListener('change', async (e) => {
    const target = e.target;

    // تزامن الـ checkboxes و color pickers في نموذج المنتج وجدول المقاسات عند حدث change
    if (target instanceof HTMLInputElement && target.closest('#adm-product-form')) {
      const df = adminState.draftProductForm;
      if (target.id === 'adm-color-picker') {
        df.colorHex = target.value;
        if (Array.isArray(df.variants) && df.variants.length === 1) {
          df.variants[0].colorHex = target.value;
          const rowColorInp = document.querySelector(
            '#adm-product-form input[type="color"][data-variant-idx="0"]'
          );
          if (rowColorInp instanceof HTMLInputElement) {
            rowColorInp.value = target.value;
          }
        }
        return;
      }
      if (target.hasAttribute('data-variant-idx')) {
        const vIdx = Number(target.getAttribute('data-variant-idx'));
        const vField = target.getAttribute('data-variant-field');
        if (Array.isArray(df.variants) && df.variants[vIdx] && vField) {
          if (vField === 'active' && target.type === 'checkbox') {
            df.variants[vIdx].active = target.checked;
          } else if (vField === 'colorHex' && target.type === 'color') {
            df.variants[vIdx].colorHex = target.value;
            if (vIdx === 0) df.colorHex = target.value;
          } else if (vField === 'size') {
            df.variants[vIdx].size = target.value.trim();
          } else if (vField === 'colorName') {
            df.variants[vIdx].colorName = target.value.trim();
          }
        }
        return;
      }
      if (target.type === 'checkbox') {
        const fieldName = target.getAttribute('name');
        if (fieldName && fieldName in df) {
          df[fieldName] = target.checked;
        }
        return;
      }
    }

    if (target instanceof HTMLInputElement && target.type === 'file') {
      const files = Array.from(target.files || []);
      if (files.length === 0) return;

      try {
        if (target.id === 'adm-prod-file-input') {
          syncCurrentProductFormToDraft();
          if (!Array.isArray(adminState.draftProductGallery)) {
            adminState.draftProductGallery = [];
          }
          for (const f of files) {
            const dataUrl = await readAndCompressImageFile(f);
            adminState.draftProductGallery.push(dataUrl);
          }
          adminState.draftProductImage = adminState.draftProductGallery[0] || '';
          target.value = '';
          renderAdminDashboard();
          showToast(t().toasts.galleryAdded(files.length));
        } else if (target.id === 'adm-prod-gallery-input') {
          syncCurrentProductFormToDraft();
          if (!Array.isArray(adminState.draftProductGallery)) {
            adminState.draftProductGallery = [];
          }
          if (adminState.draftProductImage && !adminState.draftProductGallery.includes(adminState.draftProductImage)) {
            adminState.draftProductGallery.unshift(adminState.draftProductImage);
          }
          for (const f of files) {
            const dataUrl = await readAndCompressImageFile(f);
            adminState.draftProductGallery.push(dataUrl);
          }
          adminState.draftProductImage = adminState.draftProductGallery[0] || '';
          target.value = '';
          renderAdminDashboard();
          showToast(t().toasts.galleryAdded(files.length));
        } else if (target.hasAttribute('data-adm-row-img-upload')) {
          const prodId = target.getAttribute('data-adm-row-img-upload');
          const prod = adminState.inventory.find((p) => p.id === prodId);
          if (prod) {
            if (!Array.isArray(prod.gallery)) {
              prod.gallery = prod.image ? [prod.image] : [];
            }
            for (const f of files) {
              const dataUrl = await readAndCompressImageFile(f);
              prod.gallery.push(dataUrl);
            }
            if (prod.gallery.length > 0 && !prod.image) {
              prod.image = prod.gallery[0];
            }
            target.value = '';
            adminState.saveAll();
            syncProductToSupabase(prod);
            renderAdminDashboard();
            showToast(
              getLang() === 'fr'
                ? `${files.length} photo(s) ajoutée(s) à ${getProdDisplayName(prod)}`
                : `تمت إضافة ${files.length} صور إلى ${getProdDisplayName(prod)} بنجاح`
            );
          }
        } else if (target.id === 'adm-lp-main-file') {
          const dataUrl = await readAndCompressImageFile(files[0]);
          adminState.draftLandingMainImage = dataUrl;
          const thumb = document.getElementById('lp-main-preview-thumb');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'adm-lp-gallery-files') {
          for (const f of files) {
            const dataUrl = await readAndCompressImageFile(f);
            adminState.draftLandingGallery.push(dataUrl);
          }
          renderAdminDashboard();
          showToast(t().toasts.galleryAdded(files.length));
        } else if (target.id === 'cms-logo-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0], 400);
          adminState.draftCmsLogo = dataUrl;
          const thumb = document.getElementById('cms-logo-preview-thumb');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          const liveLogo = document.getElementById('preview-logo-img');
          if (liveLogo instanceof HTMLImageElement) liveLogo.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'cms-hero-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0], 1100);
          adminState.draftCmsHeroBg = dataUrl;
          const thumb = document.getElementById('cms-hero-preview-thumb');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          const liveHero = document.getElementById('preview-hero-box');
          if (liveHero) liveHero.style.backgroundImage = `url('${dataUrl}')`;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'adm-cat-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0], 500);
          adminState.draftCategoryImage = dataUrl;
          const thumb = document.getElementById('adm-cat-img-preview');
          if (thumb instanceof HTMLImageElement) thumb.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        }
      } catch {
        showToast(t().toasts.invalidImage);
      }
      return;
    }

    if (target instanceof HTMLSelectElement && target.id === 'adm-lp-import-product') {
      const prodId = target.value;
      const prod = adminState.inventory.find((p) => p.id === prodId);
      if (prod) {
        adminState.draftLandingMainImage = prod.image;
        adminState.draftLandingGallery =
          Array.isArray(prod.gallery) && prod.gallery.length > 0
            ? [...prod.gallery]
            : [prod.image];

        const titleInp = document.getElementById('adm-lp-title-input');
        const slugInp = document.getElementById('adm-lp-slug-input');
        const origInp = document.getElementById('adm-lp-orig-price');
        const discInp = document.getElementById('adm-lp-disc-price');
        const descInp = document.getElementById('adm-lp-desc-input');
        const mainThumb = document.getElementById('lp-main-preview-thumb');

        if (titleInp instanceof HTMLInputElement) {
          titleInp.value = `عرض خاص: ${prod.name || prod.name_fr} · ${prod.name_fr || prod.name}`;
        }
        if (slugInp instanceof HTMLInputElement) {
          slugInp.value = `/offer/${prod.slug || prod.id}`;
        }
        if (origInp instanceof HTMLInputElement) {
          origInp.value = String(prod.originalPrice || Math.round(prod.price * 1.3));
        }
        if (discInp instanceof HTMLInputElement) {
          discInp.value = String(prod.price);
        }
        if (descInp instanceof HTMLTextAreaElement) {
          descInp.value =
            prod.description_ar ||
            prod.description_fr ||
            `استفيدي من العرض الترويجي الحصري على ${prod.name || prod.name_fr} مع الدفع عند الاستلام وتوصيل سريع لـ 58 ولاية.`;
        }
        if (mainThumb instanceof HTMLImageElement) {
          mainThumb.src = prod.image;
        }
        showToast(
          getLang() === 'fr'
            ? 'Données du produit importées dans la Landing Page'
            : 'تم استيراد بيانات وصور الحذاء إلى صفحة الهبوط تلقائياً'
        );
      }
      return;
    }

    if (target instanceof HTMLSelectElement && target.hasAttribute('data-adm-order-status')) {
      const orderId = target.getAttribute('data-adm-order-status');
      const newStatusKey = target.value;
      const order = adminState.orders.find((o) => o.id === orderId);
      if (order) {
        order.status = newStatusKey;
        adminState.saveAll();
        syncOrderToSupabase(order);
        const badge = document.getElementById(`adm-order-badge-${orderId}`);
        const label = getStatusLabel(newStatusKey);
        if (badge) {
          badge.className = getStatusBadgeClass(newStatusKey);
          badge.textContent = label;
        }
        showToast(t().toasts.orderStatusChanged(orderId, label));
      }
    }
  });

  // حفظ النماذج
  root.addEventListener('submit', (e) => {
    const form = e.target;
    if (!(form instanceof HTMLFormElement)) return;
    e.preventDefault();

    const fd = new FormData(form);

    if (form.id === 'adm-cms-form') {
      adminState.cms = {
        ...adminState.cms,
        storeName: String(fd.get('storeName') || 'ShoeStyle').trim(),
        logoUrl: adminState.draftCmsLogo || adminState.cms.logoUrl || IMAGES.talons,
        announcementEnabled: false,
        announcementText: '',
        heroTitle: String(fd.get('heroTitle') || '').trim(),
        heroSubtitle: String(fd.get('heroSubtitle') || '').trim(),
        heroBgUrl: adminState.draftCmsHeroBg || adminState.cms.heroBgUrl || IMAGES.hero,
        heroBtnText: String(fd.get('heroBtnText') || 'Découvrir').trim(),
        heroBtnLink: 'Talons',
        footerFarewell: String(fd.get('footerFarewell') || 'À bientôt sur ShoeStyle ♥ ♥').trim(),
        phone: String(fd.get('phone') || '0550 12 34 56').trim(),
        whatsappNumber: String(fd.get('whatsappNumber') || '213550123456').trim(),
        location_ar: String(fd.get('location_ar') || 'الجزائر العاصمة — باب الزوار، المركز التجاري').trim(),
        location_fr: String(fd.get('location_fr') || 'Alger — Bab Ezzouar, Centre Commercial').trim(),
        instagramUrl: String(fd.get('instagramUrl') || 'https://instagram.com/shoestyle.dz').trim(),
        facebookUrl: String(fd.get('facebookUrl') || 'https://facebook.com/shoestyle.dz').trim(),
        tiktokUrl: String(fd.get('tiktokUrl') || 'https://tiktok.com/@shoestyle.dz').trim(),
        fbPixelId: String(fd.get('fbPixelId') || '').trim(),
        tiktokPixelId: String(fd.get('tiktokPixelId') || '').trim(),
        snapPixelId: String(fd.get('snapPixelId') || '').trim(),
        googleTagId: String(fd.get('googleTagId') || '').trim(),
        features: [0, 1, 2].map((idx) => ({
          icon: String(fd.get(`featIcon_${idx}`) || `0${idx + 1}`).trim(),
          title: String(fd.get(`featTitle_${idx}`) || '').trim(),
          desc: String(fd.get(`featDesc_${idx}`) || '').trim(),
        })),
      };
      adminState.saveAll();
      syncCmsToSupabase(adminState.cms, 0, adminState.categories);
      showToast(t().toasts.cmsSaved);
      renderAdminDashboard();
    } else if (form.id === 'adm-category-form') {
      const name_ar = String(fd.get('name_ar') || '').trim();
      const name_fr = String(fd.get('name_fr') || '').trim();
      const subtitle_ar = String(fd.get('subtitle_ar') || 'تشكيلة أنيقة ومريحة').trim();
      if (!name_ar || !name_fr) return;

      const catId =
        adminState.editingCategoryId ||
        name_fr.replace(/[^a-zA-Z0-9\u00C0-\u017F]+/g, '') ||
        'Cat' + Date.now().toString().slice(-3);

      const catPayload = {
        id: catId,
        name_ar,
        name_fr,
        subtitle_ar,
        subtitle_fr: name_fr,
        image: adminState.draftCategoryImage || IMAGES.talons,
      };

      if (adminState.editingCategoryId) {
        const idx = adminState.categories.findIndex((c) => c.id === adminState.editingCategoryId);
        if (idx !== -1) adminState.categories[idx] = catPayload;
        adminState.editingCategoryId = null;
        showToast(getLang() === 'fr' ? 'Catégorie mise à jour' : 'تم تحديث الفئة بنجاح');
      } else {
        adminState.categories.push(catPayload);
        showToast(getLang() === 'fr' ? 'Nouvelle catégorie ajoutée' : 'تمت إضافة الفئة الجديدة للمتجر');
      }
      adminState.isCategoryFormOpen = false;
      adminState.saveAll();
      syncCmsToSupabase(adminState.cms, 0, adminState.categories);
      renderAdminDashboard();
    } else if (form.id === 'adm-landing-form') {
      const mainImg = adminState.draftLandingMainImage || IMAGES.talons;
      const gallery =
        adminState.draftLandingGallery && adminState.draftLandingGallery.length > 0
          ? [...adminState.draftLandingGallery]
          : [mainImg];

      const payload = {
        id: adminState.editingLandingId || 'lp-' + Date.now().toString().slice(-4),
        title: String(fd.get('title') || '').trim(),
        slug: String(fd.get('slug') || '/offer/promo').trim(),
        originalPrice: Number(fd.get('originalPrice') || 0),
        discountPrice: Number(fd.get('discountPrice') || 0),
        imageUrl: mainImg,
        gallery,
        description: String(fd.get('description') || '').trim(),
        offerEnabled: fd.has('offerEnabled'),
        offerMinQty: Math.max(2, Number(fd.get('offerMinQty') || 2)),
        offerFreeShipping: fd.has('offerFreeShipping'),
        offerText: String(fd.get('offerText') || 'اشترِ 2 واحصل على شحن مجاني').trim(),
        quickFormEnabled: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };

      if (adminState.editingLandingId) {
        const idx = adminState.landingPages.findIndex((lp) => lp.id === adminState.editingLandingId);
        if (idx !== -1) adminState.landingPages[idx] = payload;
        adminState.editingLandingId = null;
        showToast(t().toasts.lpUpdated);
      } else {
        adminState.landingPages.unshift(payload);
        showToast(t().toasts.lpCreated);
      }
      adminState.isLandingFormOpen = false;
      adminState.saveAll();
      syncLandingPageToSupabase(payload);
      renderAdminDashboard();
    } else if (form.id === 'adm-product-form') {
      syncCurrentProductFormToDraft();
      const df = adminState.draftProductForm;

      const nameAr = String(fd.get('name') || df.name || '').trim();
      const nameFr = String(fd.get('name_fr') || df.name_fr || nameAr).trim();
      const rawSlug = String(fd.get('slug') || df.slug || nameFr || 'sandale-beige')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '');

      const rawCat = String(fd.get('category') || df.category || '').trim();
      const category =
        rawCat || (adminState.categories[0] ? adminState.categories[0].id : 'Sandales');

      const descriptionAr = String(fd.get('description_ar') || df.description_ar || '').trim();
      const descriptionFr = String(fd.get('description_fr') || df.description_fr || '').trim();

      const rawOriginal = Number(fd.get('originalPrice') || df.originalPrice || 0);
      const rawDiscount = Number(fd.get('discountPrice') || df.discountPrice || 0);

      const finalPrice =
        rawDiscount > 0 && (rawOriginal === 0 || rawDiscount <= rawOriginal)
          ? rawDiscount
          : rawOriginal > 0
          ? rawOriginal
          : 4900;
      const originalPrice = rawOriginal > 0 ? rawOriginal : finalPrice;
      const discountPrice = rawDiscount > 0 && rawDiscount < originalPrice ? rawDiscount : null;
      const discountPercent =
        discountPrice && originalPrice > discountPrice
          ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
          : 0;

      const isVisible = fd.has('isVisible');
      const isNew = fd.has('isNew');
      const isBestSeller = fd.has('isBestSeller');
      const isSpecialOffer = fd.has('isSpecialOffer');
      const offerEnabled = false;
      const offerMinQty = 2;
      const offerFreeShipping = false;
      const offerText = '';

      const colorName = String(fd.get('colorName') || df.colorName || 'Beige').trim() || 'Beige';
      const colorHex = String(fd.get('colorHex') || df.colorHex || '#D2B48C').trim() || '#D2B48C';

      const defaultSizeStock = Math.max(
        0,
        Number(fd.get('defaultSizeStock') ?? df.defaultSizeStock ?? 5)
      );

      let activeVariants = Array.isArray(df.variants)
        ? df.variants.filter((v) => v && v.active !== false)
        : [];

      if (activeVariants.length === 0) {
        activeVariants.push({
          size: '',
          colorName,
          colorHex,
          quantity: defaultSizeStock,
          active: true,
        });
      }

      const sizeStock = {};
      const sizesSet = new Set();
      const colorsSet = new Set();
      const colorHexes = {};

      activeVariants.forEach((v) => {
        const rawSz =
          v.size !== undefined &&
          v.size !== null &&
          String(v.size).trim() !== 'default' &&
          String(v.size).trim() !== 'NaN'
            ? String(v.size).trim()
            : '';
        const qty = Math.max(0, Number(v.quantity ?? defaultSizeStock));
        let cName = String(v.colorName || colorName).trim() || 'Beige';
        const cHex = String(v.colorHex || colorHex).trim() || '#D2B48C';

        // إذا أضاف التاجر عدة أسطر بألوان مختلفة في الـ Color Picker دون تغيير اسم اللون النصي، نميز كل لون لكي تظهر جميع الدوائر بألوانها الصحيحة
        if (colorHexes[cName] && colorHexes[cName].toLowerCase() !== cHex.toLowerCase()) {
          const existingSameHexName = Object.keys(colorHexes).find(
            (k) => colorHexes[k].toLowerCase() === cHex.toLowerCase()
          );
          if (existingSameHexName) {
            cName = existingSameHexName;
          } else {
            let suffix = 2;
            while (colorHexes[`${cName} ${suffix}`] && colorHexes[`${cName} ${suffix}`].toLowerCase() !== cHex.toLowerCase()) {
              suffix++;
            }
            cName = `${cName} ${suffix}`;
          }
          v.colorName = cName;
        }

        colorHexes[cName] = cHex;

        if (rawSz !== '') {
          const numSz = Number(rawSz);
          const szKey = !isNaN(numSz) ? numSz : rawSz;
          sizesSet.add(szKey);
          sizeStock[szKey] = (sizeStock[szKey] || 0) + qty;
        } else {
          sizeStock['default'] = (sizeStock['default'] || 0) + qty;
        }

        colorsSet.add(cName);
      });

      const sizes = Array.from(sizesSet);
      if (sizes.every((s) => typeof s === 'number')) {
        sizes.sort((a, b) => a - b);
      }
      const colors = Array.from(colorsSet);
      const totalStock = sumSizeStock(sizeStock);

      // معالجة صور المنتج
      const galleryImages = Array.isArray(adminState.draftProductGallery)
        ? [...adminState.draftProductGallery]
        : [];
      if (adminState.draftProductImage && !galleryImages.includes(adminState.draftProductImage)) {
        galleryImages.unshift(adminState.draftProductImage);
      }
      const fallbackImg = IMAGES.sandales || IMAGES.talons;
      const uploadedImage = galleryImages[0] || fallbackImg;
      const uploadedGallery = galleryImages.length > 0 ? galleryImages : [uploadedImage];

      const payload = {
        id: adminState.editingProductId || 'ss-' + Date.now().toString().slice(-4),
        slug: rawSlug || 'sandale-beige',
        name: nameAr,
        name_fr: nameFr,
        category,
        description_ar: descriptionAr,
        description_fr: descriptionFr,
        price: finalPrice,
        originalPrice,
        discountPrice: discountPrice ?? finalPrice,
        discountPercent,
        isVisible,
        isNew,
        isBestSeller,
        isSpecialOffer,
        offerEnabled,
        offerMinQty,
        offerFreeShipping,
        offerText,
        colorName: colors[0] || colorName,
        colorHex: colorHexes[colors[0]] || colorHex,
        colorHexes,
        colors: colors.length > 0 ? colors : [colorName],
        sizeFrom: sizes.length > 0 ? sizes[0] : null,
        sizeTo: sizes.length > 0 ? sizes[sizes.length - 1] : null,
        defaultSizeStock,
        sizes: sizes,
        sizeStock,
        variants: Array.isArray(df.variants) && df.variants.length > 0 ? df.variants : activeVariants,
        stock: totalStock,
        image: uploadedImage,
        gallery: uploadedGallery,
      };

      if (adminState.editingProductId) {
        const idx = adminState.inventory.findIndex((p) => p.id === adminState.editingProductId);
        if (idx !== -1) adminState.inventory[idx] = payload;
        adminState.editingProductId = null;
        showToast(t().toasts.prodUpdated);
      } else {
        adminState.inventory.unshift(payload);
        showToast(t().toasts.prodCreated);
      }

      adminState.isProductFormOpen = false;
      adminState.showAdvancedProductFields = false;
      adminState.draftProductImage = '';
      adminState.draftProductGallery = [];
      adminState.draftGeneratedPreview = payload;
      adminState.saveAll();
      syncProductToSupabase(payload);
      renderAdminDashboard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (form.id === 'adm-add-wilaya-form') {
      const rawCode = String(fd.get('code') || '').trim();
      const code = rawCode ? rawCode.padStart(2, '0') : '';
      const name = String(fd.get('name') || '').trim();
      const name_fr = String(fd.get('name_fr') || '').trim() || name;
      const homeFee = Math.max(0, Number(fd.get('homeFee') ?? 600));
      const deskFee = Math.max(0, Number(fd.get('deskFee') ?? 400));
      if (code && name) {
        const newRate = { code, name, name_fr, homeFee, deskFee };
        const existingIdx = adminState.shipping.rates.findIndex((r) => r.code === code);
        if (existingIdx !== -1) {
          adminState.shipping.rates[existingIdx] = newRate;
        } else {
          adminState.shipping.rates.unshift(newRate);
        }
        adminState.shippingSearch = '';
        adminState.saveAll();
        syncShippingRateToSupabase(newRate);
        renderAdminDashboard();
        showToast(t().toasts.wilayaAdded(getLang() === 'fr' ? name_fr : name));
      }
    } else if (form.id === 'adm-lp-quick-order-form') {
      const lpId = form.getAttribute('data-lp-id');
      const lp = adminState.landingPages.find((item) => item.id === lpId);
      if (!lp) return;

      const bundleQty = Number(fd.get('bundleQty') || 1) === 2 ? 2 : 1;
      const color = String(fd.get('color') || 'Rose');
      const size = String(fd.get('size') || '37');
      const deliveryType = String(fd.get('deliveryType') || 'À Domicile');
      const unitPrice = Number(lp.discountPrice || 0);
      const totalAmount = bundleQty === 2 ? Math.max(0, unitPrice * 2 - 500) : unitPrice;

      const newOrder = {
        id: 'LP-' + Math.floor(1000 + Math.random() * 9000),
        date: new Date().toISOString().slice(0, 10),
        fullName: String(fd.get('fullName') || '').trim(),
        phone: String(fd.get('phone') || '').trim(),
        wilaya: String(fd.get('wilaya') || '16 - Alger'),
        address: `${String(fd.get('address') || '').trim()} (${deliveryType})`,
        itemsSummary: `[Promo] ${lp.title} (${color} · ${t().orders.sizeWord} ${size} × ${bundleQty})`,
        total: totalAmount,
        status: 'new',
      };
      adminState.orders.unshift(newOrder);
      adminState.previewLandingId = null;
      adminState.activeTab = 'orders';
      const modal = document.getElementById('adm-landing-modal');
      if (modal) modal.classList.remove('open');
      adminState.saveAll();
      syncOrderToSupabase(newOrder);
      renderAdminDashboard();
      showToast(t().toasts.newOrderAdded(newOrder.id));
    }
  });

  // سحب وإفلات عدة صور مباشرة في نموذج المنتج
  root.addEventListener('dragover', (e) => {
    const dz = e.target && e.target.closest ? e.target.closest('#adm-prod-dropzone') : null;
    if (dz) {
      e.preventDefault();
      e.stopPropagation();
      dz.style.borderColor = '#de1b61';
      dz.style.background = '#fdf2f6';
    }
  });

  root.addEventListener('dragleave', (e) => {
    const dz = e.target && e.target.closest ? e.target.closest('#adm-prod-dropzone') : null;
    if (dz) {
      dz.style.borderColor = '#d6d1c7';
      dz.style.background = '#faf8f9';
    }
  });

  root.addEventListener('drop', async (e) => {
    const dz = e.target && e.target.closest ? e.target.closest('#adm-prod-dropzone') : null;
    if (dz && e.dataTransfer) {
      e.preventDefault();
      e.stopPropagation();
      dz.style.borderColor = '#d6d1c7';
      dz.style.background = '#faf8f9';

      const droppedFiles = Array.from(e.dataTransfer.files || []).filter(
        (f) => f.type && f.type.startsWith('image/')
      );
      if (droppedFiles.length === 0) return;

      syncCurrentProductFormToDraft();
      if (!Array.isArray(adminState.draftProductGallery)) {
        adminState.draftProductGallery = [];
      }
      if (adminState.draftProductImage && !adminState.draftProductGallery.includes(adminState.draftProductImage)) {
        adminState.draftProductGallery.unshift(adminState.draftProductImage);
      }
      for (const f of droppedFiles) {
        const dataUrl = await readAndCompressImageFile(f);
        adminState.draftProductGallery.push(dataUrl);
      }
      adminState.draftProductImage = adminState.draftProductGallery[0] || '';
      renderAdminDashboard();
      showToast(t().toasts.galleryAdded(droppedFiles.length));
    }
  });
}

export function openAdminDashboard() {
  window.location.href = './admin.html';
}

export function closeAdminDashboard() {
  window.location.href = './index.html';
}
