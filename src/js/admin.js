/**
 * ShoeStyle — لوحة التحكم الإدارية الشاملة ثنائية اللغة (العربية / Français)
 * Mobile-First Chic Blush Pink & Ivory Identity — Vanilla JS + LocalStorage
 */
import { CATEGORIES, COLOR_SWATCHES, IMAGES, PRODUCTS, WILAYAS, formatDA } from './data.js';
import { store, showToast } from './app_bridge.js';
import {
  deleteLandingPageFromSupabase,
  deleteOrderFromSupabase,
  deleteProductFromSupabase,
  deleteShippingRateFromSupabase,
  fetchAllFromSupabase,
  notifyCrossTabSync,
  syncCmsToSupabase,
  syncLandingPageToSupabase,
  syncOrderToSupabase,
  syncProductToSupabase,
  syncShippingRateToSupabase,
} from './supabase.js';

const CMS_STORAGE_KEY = 'shoestyle_full_cms_v1';
const LANDING_STORAGE_KEY = 'shoestyle_landing_pages_v1';
const INVENTORY_STORAGE_KEY = 'shoestyle_inventory_v1';
const CATEGORIES_STORAGE_KEY = 'shoestyle_categories_v1';
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
    switchLangBtn: '🌐 Français',
    tabs: {
      inventory: 'المنتجات والفئات',
      inventoryShort: 'المنتجات',
      orders: 'الطلبات',
      ordersShort: 'الطلبات',
      cms: 'الواجهة والبيكسل',
      cmsShort: 'الواجهة',
      landing: 'صفحات الهبوط',
      landingShort: 'الهبوط',
      shipping: 'التوصيل (69 ولاية)',
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
      lowStockAlert: (names) => `⚠️ تنبيه مخزون منخفض (أقل من 5 قطع): ${names}`,
      productsBadge: (n) => `${n} منتجات`,
      editProdTitle: (name) => `✏️ تعديل المنتج: ${name}`,
      addProdTitle: '➕ إضافة حذاء جديد للمتجر',
      prodFormSub: 'ارفع صورة الحذاء مباشرة من هاتفك أو حاسوبك وحدد السعر والكمية',
      cancelEdit: 'إلغاء التعديل',
      mainPhotoLabel: 'صورة الحذاء الأساسية (اضغط لرفع صورة من هاتفك أو جهازك)',
      uploadTapTitle: '📷 اضغط هنا لاختيار صورة من الاستوديو أو الكاميرا',
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
      galleryTapTitle: (n) => `🖼️ إضافة صور أخرى للمعرض (${n} صور مرفوعة)`,
      galleryTapSub: 'يمكنك اختيار عدة صور معاً من هاتفك',
      galleryBtn: '➕ صور إضافية',
      saveProdChanges: '💾 حفظ التعديلات',
      addProdNow: '➕ إضافة الحذاء للمتجر الآن',
      currentProdsTitle: (n) => `المنتجات الحالية والتحكم السريع بالمخزون (${n})`,
      currentProdsSub: 'اضغط على (+) أو (-) لتعديل المخزون فوراً، أو اضغط على الصورة لتغييرها من هاتفك',
      searchPlaceholder: '🔍 ابحث عن اسم الحذاء...',
      changePhotoBtn: '📷 تغيير',
      outOfStock: 'نفد (0)',
      lowStockBadge: (n) => `⚠️ منخفض (${n})`,
      inStockBadge: (n) => `متوفر (${n})`,
      editBtn: 'تعديل',
      deleteBtn: 'حذف',
    },
    orders: {
      title: (n) => `🛍️ طلبات الزبائن (${n})`,
      sub: 'غيّر حالة الطلب بلمسة واحدة أو اتصل بالزبون مباشرة من البطاقة',
      addDemoBtn: '➕ إضافة طلب تجريبي',
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
      livePreviewBanner: '👁️ معاينة مباشرة لواجهة المتجر (تتغير تلقائياً أثناء الكتابة)',
      navLinksPreview: 'الرئيسية · كعب · سنيكرز',
      formTitle: '🎨 تعديل نصوص وصور الواجهة الرئيسية',
      formSub: 'عدّل اسم المتجر، الإعلانات، البانر، والمميزات ثم اضغط حفظ',
      saveBtn: '💾 حفظ التعديلات',
      storeNameLabel: 'اسم المتجر',
      logoLabel: 'تغيير صورة شعار المتجر (من الهاتف)',
      logoUploadTitle: '📷 رفع صورة الشعار',
      chooseBtn: 'اختيار',
      annSwitchTitle: 'إظهار شريط الإعلانات الوردي بأعلى الموقع',
      annSwitchSub: 'لعرض عروض التوصيل المجاني أو التخفيضات',
      annTextLabel: 'نص شريط الإعلانات العلوي',
      heroTitleLabel: 'عنوان البانر الرئيسي',
      heroBtnLabel: 'نص زر البانر',
      heroSubLabel: 'الوصف التسويقي للبانر',
      heroImgLabel: 'صورة البانر الرئيسي (رفع مباشر من الجهاز)',
      heroImgTitle: '🖼️ اضغط لرفع صورة جديدة للبانر الرئيسي',
      heroImgSub: 'تظهر فوراً في المعاينة أعلاه',
      featLabel: (i) => `الميزة ${i} (الأيقونة والعنوان)`,
      featDescLabel: (i) => `وصف الميزة ${i}`,
      saveAllCmsBtn: '💾 حفظ وتطبيق تعديلات الواجهة',
    },
    lp: {
      editTitle: (t) => `✏️ تعديل العرض: ${t}`,
      createTitle: '🚀 إنشاء صفحة هبوط لعرض ترويجي',
      sub: 'صفحة خاصة بمنتج مخفض مع استمارة شراء سريع تزيد المبيعات',
      cancelBtn: 'إلغاء',
      offerTitleLabel: 'عنوان العرض الترويجي',
      offerTitlePlaceholder: 'مثال: عرض خاص: حذاء كعب سهرة + توصيل مجاني',
      slugLabel: 'رابط العرض المخصص (Slug)',
      origPriceLabel: 'السعر قبل التخفيض (د.ج)',
      discPriceLabel: 'سعر العرض المخفض (د.ج)',
      mainImgLabel: 'صورة العرض الرئيسية (من الهاتف)',
      mainImgTitle: '📷 رفع صورة العرض',
      mainImgSub: 'من ألبوم الصور',
      galleryLabel: 'صور إضافية لمعرض العرض',
      galleryTitle: (n) => `🖼️ إضافة صور للمعرض (${n})`,
      gallerySub: 'اختيار متعدد',
      addPhotosBtn: '➕ صور',
      descLabel: 'وصف العرض ومميزاته',
      descPlaceholder: 'اشرح مميزات الحذاء والعرض...',
      updateBtn: '💾 تحديث صفحة الهبوط',
      createBtn: '➕ إنشاء وحفظ صفحة الهبوط',
      activeListTitle: (n) => `صفحات الهبوط النشطة (${n})`,
      activeListSub: 'اضغط على "معاينة العرض" لتجربة استمارة الشراء السريع',
      previewBtn: '👁️ معاينة العرض',
      modalHeader: (slug) => `✨ معاينة صفحة الهبوط (${slug})`,
      closeModal: 'إغلاق ✕',
      quickOrderTitle: '🛍️ اطلبي الآن — الدفع عند الاستلام',
      quickOrderSub: 'أدخلي معلوماتكِ ليصلكِ الطلب لباب المنزل',
      fullNamePlaceholder: 'الاسم واللقب *',
      phonePlaceholder: 'رقم الهاتف *',
      addressPlaceholder: 'العنوان الكامل (البلدية والحي) *',
      confirmQuickOrder: (price) => `تأكيد الطلب — ${price}`,
    },
    ship: {
      title: '🚚 سقف التوصيل المجاني وإضافة ولاية',
      sub: 'حدد المبلغ الذي يصبح بعده الشحن مجانياً تلقائياً',
      thresholdLabel: 'سقف التوصيل المجاني (د.ج)',
      saveThresholdBtn: '💾 حفظ سقف الشحن المجاني',
      addWilayaLabel: 'إضافة ولاية جديدة (الرمز والاسم)',
      wilayaNamePlaceholder: 'اسم الولاية (مثلاً: بجاية)',
      feesLabel: 'سعر المنزل والمكتب (د.ج)',
      homePlaceholder: 'المنزل 600',
      deskPlaceholder: 'المكتب 400',
      addBtn: '➕ إضافة',
      ratesListTitle: (n) => `أسعار التوصيل حسب الولايات (${n})`,
      ratesListSub: 'عدّل السعر مباشرة وسيتم الحفظ تلقائياً',
      homeFeeLabel: '🏠 للمنزل (د.ج)',
      deskFeeLabel: '🏢 للمكتب (د.ج)',
    },
    toasts: {
      loggedOut: 'تم الخروج والعودة إلى واجهة المتجر',
      lpDeleted: 'تم حذف صفحة الهبوط',
      prodDeleted: 'تم حذف المنتج من الكتالوج',
      newOrderAdded: (id) => `تم تسجيل الطلب الجديد #${id}`,
      orderDeleted: 'تم حذف الطلب',
      wilayaDeleted: 'تم حذف الولاية',
      photoUploaded: '📷 تم رفع الصورة بنجاح',
      galleryAdded: (n) => `🖼️ تمت إضافة ${n} صور`,
      prodPhotoUpdated: (name) => `✅ تم تحديث صورة "${name}" فوراً`,
      invalidImage: '⚠️ يرجى اختيار صورة صالحة',
      orderStatusChanged: (id, st) => `✅ تم تحديث حالة الطلب #${id} إلى "${st}"`,
      cmsSaved: '💖 تم حفظ تعديلات واجهة المتجر بنجاح!',
      lpUpdated: '✅ تم تحديث العرض الترويجي',
      lpCreated: '🚀 تم إنشاء صفحة الهبوط الجديدة',
      prodUpdated: '✅ تم حفظ تعديلات المنتج',
      prodCreated: '👠 تمت إضافة الحذاء الجديد للمتجر',
      thresholdSaved: '✅ تم حفظ سقف التوصيل المجاني',
      wilayaAdded: (name) => `✅ تمت إضافة ولاية ${name}`,
      langSwitched: '🌐 تم التبديل إلى اللغة العربية',
    },
  },
  fr: {
    brandSubtitle: 'Panneau d’Administration & CMS Complet',
    viewStore: 'Voir la Boutique',
    logout: 'Quitter',
    switchLangBtn: '🌐 العربية',
    tabs: {
      inventory: 'Produits & Stock',
      inventoryShort: 'Produits',
      orders: 'Commandes',
      ordersShort: 'Commandes',
      cms: 'Design & CMS',
      cmsShort: 'Vitrine',
      landing: 'Landing Pages',
      landingShort: 'Offres',
      shipping: 'Livraison',
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
      lowStockAlert: (names) => `⚠️ Alerte stock faible (moins de 5 pièces) : ${names}`,
      productsBadge: (n) => `${n} produits`,
      editProdTitle: (name) => `✏️ Modifier le produit : ${name}`,
      addProdTitle: '➕ Ajouter une nouvelle chaussure',
      prodFormSub: 'Importez la photo directement depuis votre téléphone ou PC et fixez le prix',
      cancelEdit: 'Annuler',
      mainPhotoLabel: 'Photo principale (Appuyez pour importer depuis votre téléphone)',
      uploadTapTitle: '📷 Appuyez ici pour choisir une photo (Galerie ou Caméra)',
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
      galleryTapTitle: (n) => `🖼️ Ajouter d’autres angles (${n} photos importées)`,
      galleryTapSub: 'Sélection multiple possible depuis votre téléphone',
      galleryBtn: '➕ Photos',
      saveProdChanges: '💾 Enregistrer les modifications',
      addProdNow: '➕ Ajouter au catalogue maintenant',
      currentProdsTitle: (n) => `Catalogue & Contrôle Rapide du Stock (${n})`,
      currentProdsSub: 'Appuyez sur (+) ou (-) pour ajuster le stock, ou sur la photo pour la remplacer',
      searchPlaceholder: '🔍 Rechercher un modèle...',
      changePhotoBtn: '📷 Changer',
      outOfStock: 'Épuisé (0)',
      lowStockBadge: (n) => `⚠️ Faible (${n})`,
      inStockBadge: (n) => `En stock (${n})`,
      editBtn: 'Modifier',
      deleteBtn: 'Supprimer',
    },
    orders: {
      title: (n) => `🛍️ Commandes Clients (${n})`,
      sub: 'Changez le statut en un clic ou appelez directement le client depuis la carte',
      addDemoBtn: '➕ Commande test',
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
      livePreviewBanner: '👁️ Aperçu en direct de la boutique (Mise à jour instantanée)',
      navLinksPreview: 'Accueil · Talons · Sneakers',
      formTitle: '🎨 Personnaliser les textes et images de la vitrine',
      formSub: 'Modifiez le nom, la barre d’annonce, la bannière Hero et les avantages',
      saveBtn: '💾 Enregistrer',
      storeNameLabel: 'Nom de la boutique',
      logoLabel: 'Changer le logo (Depuis le téléphone)',
      logoUploadTitle: '📷 Importer le logo',
      chooseBtn: 'Choisir',
      annSwitchTitle: 'Afficher la barre d’annonce rose en haut du site',
      annSwitchSub: 'Pour annoncer la livraison gratuite ou les promotions',
      annTextLabel: 'Texte de la barre d’annonce',
      heroTitleLabel: 'Titre principal de la bannière (Hero)',
      heroBtnLabel: 'Texte du bouton d’action',
      heroSubLabel: 'Sous-titre de la bannière',
      heroImgLabel: 'Image de la bannière principale (Importation directe)',
      heroImgTitle: '🖼️ Appuyez pour importer une nouvelle image de bannière',
      heroImgSub: 'S’affiche immédiatement dans l’aperçu ci-dessus',
      featLabel: (i) => `Avantage ${i} (Icône & Titre)`,
      featDescLabel: (i) => `Description de l’avantage ${i}`,
      saveAllCmsBtn: '💾 Enregistrer et appliquer à la boutique',
    },
    lp: {
      editTitle: (t) => `✏️ Modifier l’offre : ${t}`,
      createTitle: '🚀 Créer une Landing Page promotionnelle',
      sub: 'Page dédiée à une offre spéciale avec formulaire de commande rapide intégré',
      cancelBtn: 'Annuler',
      offerTitleLabel: 'Titre de l’offre promotionnelle',
      offerTitlePlaceholder: 'Ex: Offre VIP : Escarpins Rose + Sac de soirée offert',
      slugLabel: 'Lien personnalisé (Slug)',
      origPriceLabel: 'Prix initial avant remise (DA)',
      discPriceLabel: 'Prix promo (DA)',
      mainImgLabel: 'Photo principale de l’offre (Depuis téléphone)',
      mainImgTitle: '📷 Importer la photo',
      mainImgSub: 'Depuis la galerie',
      galleryLabel: 'Galerie photos de l’offre',
      galleryTitle: (n) => `🖼️ Ajouter à la galerie (${n})`,
      gallerySub: 'Sélection multiple',
      addPhotosBtn: '➕ Photos',
      descLabel: 'Description marketing de l’offre',
      descPlaceholder: 'Décrivez les avantages du modèle et de la promotion...',
      updateBtn: '💾 Mettre à jour la Landing Page',
      createBtn: '➕ Créer et publier la Landing Page',
      activeListTitle: (n) => `Landing Pages Actives (${n})`,
      activeListSub: 'Cliquez sur "Aperçu" pour tester le formulaire de commande rapide',
      previewBtn: '👁️ Aperçu de l’offre',
      modalHeader: (slug) => `✨ Aperçu de la Landing Page (${slug})`,
      closeModal: 'Fermer ✕',
      quickOrderTitle: '🛍️ Commandez maintenant — Paiement à la livraison',
      quickOrderSub: 'Remplissez vos coordonnées pour recevoir votre colis à domicile',
      fullNamePlaceholder: 'Nom et Prénom *',
      phonePlaceholder: 'Numéro de téléphone *',
      addressPlaceholder: 'Adresse complète (Commune et quartier) *',
      confirmQuickOrder: (price) => `Confirmer la commande — ${price}`,
    },
    ship: {
      title: '🚚 Seuil de livraison gratuite & Ajout de Wilaya',
      sub: 'Définissez le montant à partir duquel la livraison devient gratuite',
      thresholdLabel: 'Seuil de livraison gratuite (DA)',
      saveThresholdBtn: '💾 Enregistrer le seuil',
      addWilayaLabel: 'Ajouter une wilaya (Code & Nom)',
      wilayaNamePlaceholder: 'Nom de la wilaya (ex: Béjaïa)',
      feesLabel: 'Tarifs Domicile & Stop-Desk (DA)',
      homePlaceholder: 'Domicile 600',
      deskPlaceholder: 'Stop-Desk 400',
      addBtn: '➕ Ajouter',
      ratesListTitle: (n) => `Tarifs de livraison par Wilaya (${n})`,
      ratesListSub: 'Modifiez directement les tarifs, sauvegarde automatique',
      homeFeeLabel: '🏠 À Domicile (DA)',
      deskFeeLabel: '🏢 Stop-Desk (DA)',
    },
    toasts: {
      loggedOut: 'Déconnexion réussie — Retour à la boutique',
      lpDeleted: 'Landing Page supprimée',
      prodDeleted: 'Produit supprimé du catalogue',
      newOrderAdded: (id) => `Nouvelle commande #${id} enregistrée`,
      orderDeleted: 'Commande supprimée',
      wilayaDeleted: 'Wilaya supprimée',
      photoUploaded: '📷 Photo importée avec succès',
      galleryAdded: (n) => `🖼️ ${n} photos ajoutées`,
      prodPhotoUpdated: (name) => `✅ Photo de "${name}" mise à jour`,
      invalidImage: '⚠️ Veuillez sélectionner une image valide',
      orderStatusChanged: (id, st) => `✅ Statut de #${id} changé en "${st}"`,
      cmsSaved: '💖 Modifications de la vitrine enregistrées !',
      lpUpdated: '✅ Offre promotionnelle mise à jour',
      lpCreated: '🚀 Nouvelle Landing Page créée',
      prodUpdated: '✅ Produit mis à jour avec succès',
      prodCreated: '👠 Nouveau modèle ajouté à la boutique',
      thresholdSaved: '✅ Seuil de livraison gratuite enregistré',
      wilayaAdded: (name) => `✅ Wilaya ${name} ajoutée`,
      langSwitched: '🌐 Langue changée en Français',
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
function readAndCompressImageFile(file, maxWidth = 850, quality = 0.82) {
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
      icon: '🚚',
      title: 'توصيل سريع 69 ولاية · Livraison 69 Wilayas',
      desc: 'شحن مباشر لباب المنزل أو المكتب خلال 24-48 ساعة',
    },
    {
      icon: '🤝',
      title: 'الدفع عند الاستلام · Paiement à la livraison',
      desc: 'معاينة الطلبية والتأكد من المقاس قبل الدفع بكل أمان',
    },
    {
      icon: '💖',
      title: 'ضمان الاستبدال · Échange garanti',
      desc: 'إمكانية استبدال المقاس مجاناً خلال 7 أيام من الاستلام',
    },
  ],
};

function ensureAll69Wilayas(savedRates) {
  const mapByCode = new Map();
  if (Array.isArray(savedRates)) {
    savedRates.forEach((r) => {
      if (r && r.code) mapByCode.set(String(r.code).padStart(2, '0'), r);
    });
  }
  const merged = WILAYAS.map((w) => {
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
    title: 'عرض خاص: حذاء كعب عالي كلاسيك روز · Offre VIP Escarpins Rose',
    slug: '/offer/pink-heels-vip',
    originalPrice: 6990,
    discountPrice: 4490,
    imageUrl: IMAGES.talons,
    gallery: [IMAGES.talons, IMAGES.hero, IMAGES.sandales],
    description:
      'تألقي بإطلالة أنثوية ساحرة مع حذاء الكعب الوردي اللامع المصنوع من الجلد المرن المريح للقدم طوال السهرة. Un style raffiné et confortable avec livraison rapide.',
    quickFormEnabled: true,
    createdAt: '2026-11-08',
  },
  {
    id: 'lp-102',
    title: 'تخفيض نهاية الأسبوع: سنيكرز أبيض ووردي · Promo Sneakers Mode',
    slug: '/offer/urban-sneakers-pack',
    originalPrice: 5400,
    discountPrice: 3790,
    imageUrl: IMAGES.sneakers,
    gallery: [IMAGES.sneakers, IMAGES.ballerines],
    description:
      'الحذاء اليومي الأكثر مبيعاً! نعل خفيف مضاد للانزلاق وتصميم عصري ناعم يناسب الجامعة والعمل والنزهات اليومية.',
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
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
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
  return Object.values(sizeStockMap).reduce((sum, v) => sum + Math.max(0, Number(v || 0)), 0);
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
  activeTab: 'inventory', // 'inventory' | 'orders' | 'cms' | 'landing' | 'shipping'
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

  // حالة مسودة إضافة/تعديل المنتج التفصيلية (الأقسام الـ 3 + التوليد الذكي)
  draftProductBrief: '',
  draftGeneratedPreview: null,
  draftProductImage: IMAGES.talons,
  draftProductGallery: [],
  draftProductForm: {
    name: '',
    name_fr: '',
    slug: 'sandale-beige-talon',
    category: 'Sandales',
    description_ar: '',
    description_fr: '',
    originalPrice: 6200,
    discountPrice: 4790,
    isVisible: true,
    isNew: true,
    isBestSeller: false,
    isSpecialOffer: false,
    colorName: 'Beige',
    colorHex: '#D2B48C',
    sizeFrom: 36,
    sizeTo: 41,
    defaultSizeStock: 5,
    sizeStock: buildSizeStockRange(36, 41, 5),
  },

  draftLandingMainImage: IMAGES.talons,
  draftLandingGallery: [IMAGES.talons, IMAGES.hero],
  draftCmsLogo: null,
  draftCmsHeroBg: null,

  cms: { ...DEFAULT_CMS, ...loadJSON(CMS_STORAGE_KEY, DEFAULT_CMS), announcementEnabled: false },
  categories: loadJSON(
    CATEGORIES_STORAGE_KEY,
    CATEGORIES.map((c) => ({ ...c }))
  ),
  landingPages: loadJSON(LANDING_STORAGE_KEY, DEFAULT_LANDING_PAGES),
  inventory: loadJSON(
    INVENTORY_STORAGE_KEY,
    PRODUCTS.map((p, idx) => {
      const szList = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : [36, 37, 38, 39, 40];
      const szFrom = Math.min(...szList);
      const szTo = Math.max(...szList);
      const defQty = idx === 1 ? 1 : idx === 4 ? 1 : 3;
      const szMap = buildSizeStockRange(szFrom, szTo, defQty);
      const primaryColor = (Array.isArray(p.colors) && p.colors[0]) || 'Beige';
      const swatchHex = COLOR_SWATCHES[primaryColor]?.hex || '#D2B48C';
      return {
        id: p.id,
        slug:
          p.slug ||
          (p.name_fr || p.id)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, ''),
        name: p.name_ar || p.name_fr,
        name_fr: p.name_fr || p.name_ar,
        category: p.category,
        description_ar: p.description_ar || '',
        description_fr: p.description_fr || '',
        price: p.price,
        originalPrice: p.originalPrice || Math.round(p.price * 1.25),
        discountPrice: p.price,
        discountPercent: p.discountPercent || 20,
        isVisible: p.isVisible !== false,
        isNew: Boolean(p.isNew ?? true),
        isBestSeller: Boolean(p.isBestSeller ?? false),
        isSpecialOffer: Boolean(p.isSpecialOffer ?? false),
        colorName: primaryColor,
        colorHex: swatchHex,
        colors: Array.isArray(p.colors) ? p.colors : [primaryColor],
        sizeFrom: szFrom,
        sizeTo: szTo,
        defaultSizeStock: defQty,
        sizes: szList,
        sizeStock: szMap,
        image: p.image,
        gallery: p.gallery || [p.image],
        stock: idx === 1 ? 3 : idx === 4 ? 2 : idx === 7 ? 4 : sumSizeStock(szMap),
      };
    })
  ),
  orders: loadJSON(ORDERS_ADMIN_KEY, DEFAULT_ORDERS),
  shipping: (() => {
    const loaded = loadJSON(SHIPPING_STORAGE_KEY, null);
    return {
      freeShippingThreshold: 0,
      rates: ensureAll69Wilayas(loaded?.rates),
    };
  })(),

  syncWithStorefront() {
    if (Array.isArray(this.categories) && this.categories.length > 0) {
      CATEGORIES.length = 0;
      this.categories.forEach((cat) => {
        CATEGORIES.push({ ...cat });
        CATEGORY_LABELS[cat.id] = {
          ar: `${cat.name_ar} (${cat.name_fr || cat.id})`,
          fr: `${cat.name_fr || cat.id} (${cat.name_ar})`,
        };
      });
    }

    this.inventory.forEach((invItem) => {
      if (invItem.colorName && invItem.colorHex) {
        if (!COLOR_SWATCHES[invItem.colorName]) {
          COLOR_SWATCHES[invItem.colorName] = {
            hex: invItem.colorHex,
            label_fr: invItem.colorName,
            label_ar: invItem.colorName,
          };
        } else {
          COLOR_SWATCHES[invItem.colorName].hex = invItem.colorHex;
        }
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

      const sizesList =
        invItem.sizeStock && Object.keys(invItem.sizeStock).length > 0
          ? Object.keys(invItem.sizeStock).map((s) => Number(s))
          : Array.isArray(invItem.sizes) && invItem.sizes.length > 0
          ? invItem.sizes
          : [36, 37, 38, 39, 40, 41];

      const colorsList =
        Array.isArray(invItem.colors) && invItem.colors.length > 0
          ? invItem.colors
          : [invItem.colorName || 'Beige', 'Noir', 'Rose'];

      const existing = PRODUCTS.find((p) => p.id === invItem.id);
      if (existing) {
        existing.slug = invItem.slug;
        existing.name_ar = invItem.name || invItem.name_fr;
        existing.name_fr = invItem.name_fr || invItem.name;
        existing.category = invItem.category;
        existing.description_ar =
          invItem.description_ar || existing.description_ar || invItem.name;
        existing.description_fr =
          invItem.description_fr || existing.description_fr || invItem.name_fr;
        existing.price = effectivePrice;
        existing.originalPrice = origPrice > effectivePrice ? origPrice : null;
        existing.discountPercent = discPercent;
        existing.isVisible = invItem.isVisible !== false;
        existing.isNew = Boolean(invItem.isNew);
        existing.isBestSeller = Boolean(invItem.isBestSeller);
        existing.isSpecialOffer = Boolean(invItem.isSpecialOffer);
        existing.colors = colorsList;
        existing.sizes = sizesList;
        existing.image = invItem.image;
        if (invItem.gallery && invItem.gallery.length > 0) {
          existing.gallery = invItem.gallery;
        }
      } else if (invItem.isVisible !== false) {
        PRODUCTS.unshift({
          id: invItem.id,
          slug: invItem.slug,
          name_fr: invItem.name_fr || invItem.name,
          name_ar: invItem.name || invItem.name_fr,
          category: invItem.category,
          price: effectivePrice,
          originalPrice: origPrice > effectivePrice ? origPrice : null,
          discountPercent: discPercent,
          rating: 4.9,
          reviewsCount: 45,
          isVisible: true,
          isNew: Boolean(invItem.isNew ?? true),
          isBestSeller: Boolean(invItem.isBestSeller ?? false),
          isSpecialOffer: Boolean(invItem.isSpecialOffer ?? false),
          colors: colorsList,
          sizes: sizesList,
          image: invItem.image,
          gallery:
            invItem.gallery && invItem.gallery.length > 0
              ? invItem.gallery
              : [invItem.image],
          description_fr:
            invItem.description_fr || invItem.name_fr || invItem.name,
          description_ar:
            invItem.description_ar ||
            `${invItem.name || invItem.name_fr} بتصميم عصري وخامة مريحة عالية الجودة.`,
        });
      }
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
    saveJSON(CMS_STORAGE_KEY, this.cms);
    saveJSON(CATEGORIES_STORAGE_KEY, this.categories);
    saveJSON(LANDING_STORAGE_KEY, this.landingPages);
    saveJSON(INVENTORY_STORAGE_KEY, this.inventory);
    saveJSON(ORDERS_ADMIN_KEY, this.orders);
    saveJSON(SHIPPING_STORAGE_KEY, this.shipping);
    this.syncWithStorefront();
    notifyCrossTabSync('all', 'save');
  },
};

export async function initAdminFromSupabase() {
  const remoteData = await fetchAllFromSupabase();
  if (!remoteData) return false;

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
      id: 'inventory',
      icon: '📦',
      label: tr.tabs.inventory,
      shortLabel: tr.tabs.inventoryShort,
      badge: adminState.inventory.length,
    },
    {
      id: 'orders',
      icon: '🛍️',
      label: tr.tabs.orders,
      shortLabel: tr.tabs.ordersShort,
      badge: adminState.orders.length,
    },
    {
      id: 'cms',
      icon: '🎨',
      label: tr.tabs.cms,
      shortLabel: tr.tabs.cmsShort,
      badge: 'CMS',
    },
    {
      id: 'landing',
      icon: '🚀',
      label: tr.tabs.landing,
      shortLabel: tr.tabs.landingShort,
      badge: adminState.landingPages.length,
    },
    {
      id: 'shipping',
      icon: '🚚',
      label: tr.tabs.shipping,
      shortLabel: tr.tabs.shippingShort,
      badge: adminState.shipping.rates.length,
    },
  ];

  root.innerHTML = `
    <div class="adm-shell" dir="${dir}" lang="${lang}">
      <!-- 1. الهيدر العلوي بنفس الهوية البصرية لـ ShoeStyle مع زر تبديل اللغة (العربية / Français) -->
      <header class="adm-header">
        <div class="adm-header-inner">
          <div class="adm-brand-lockup">
            ${renderShoeStyleHeelSVG()}
            <div>
              <span class="adm-brand-script">${adminState.cms.storeName}</span>
              <span class="adm-brand-tag">${tr.brandSubtitle}</span>
            </div>
          </div>

          <div class="adm-header-actions">
            <button
              type="button"
              data-adm-action="toggle-admin-lang"
              class="adm-btn adm-btn-soft adm-btn-sm"
            >
              <span>${tr.switchLangBtn}</span>
            </button>
            <button
              type="button"
              data-adm-action="close-admin"
              class="adm-btn adm-btn-pink adm-btn-sm"
            >
              <span>👁️</span>
              <span>${tr.viewStore}</span>
            </button>
            <button
              type="button"
              data-adm-action="logout-admin"
              class="adm-btn adm-btn-outline adm-btn-sm"
            >
              <span>${tr.logout}</span>
            </button>
          </div>
        </div>

        <!-- شريط التبويبات السلس -->
        <nav class="adm-desktop-tabs">
          ${tabs
            .map(
              (tab) => `
              <button
                type="button"
                data-adm-action="switch-tab"
                data-tab="${tab.id}"
                class="adm-tab-pill ${adminState.activeTab === tab.id ? 'active' : ''}"
              >
                <span>${tab.icon}</span>
                <span>${tab.label}</span>
                <span class="adm-tab-pill-badge">${tab.badge}</span>
              </button>
            `
            )
            .join('')}
        </nav>
      </header>

      <!-- 2. المحتوى الرئيسي المبسط والمناسب للهاتف -->
      <main class="adm-container">
        <!-- ملخص سريع (KPIs) -->
        <section class="adm-kpi-strip">
          <div class="adm-kpi-box">
            <span class="adm-kpi-title">${tr.kpi.totalSales}</span>
            <span class="adm-kpi-num">${formatDA(totalRevenue, lang)}</span>
            <span class="adm-kpi-foot">${tr.kpi.totalOrdersFoot(adminState.orders.length)}</span>
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
            <span class="adm-kpi-title">${lang === 'fr' ? 'Catégories & Wilayas' : 'الفئات والتوصيل'}</span>
            <span class="adm-kpi-num">${adminState.categories.length} ${lang === 'fr' ? 'catégories' : 'فئات'}</span>
            <span class="adm-kpi-foot">${tr.kpi.activeWilayas(adminState.shipping.rates.length)}</span>
          </div>
        </section>

        <!-- تبويب 1: المنتجات والمخزون -->
        <section id="adm-tab-inventory" class="adm-tab-section ${adminState.activeTab === 'inventory' ? 'active' : ''}">
          ${renderInventorySection()}
        </section>

        <!-- تبويب 2: الطلبات والمبيعات -->
        <section id="adm-tab-orders" class="adm-tab-section ${adminState.activeTab === 'orders' ? 'active' : ''}">
          ${renderOrdersSection()}
        </section>

        <!-- تبويب 3: واجهة ومحتوى الموقع -->
        <section id="adm-tab-cms" class="adm-tab-section ${adminState.activeTab === 'cms' ? 'active' : ''}">
          ${renderCMSSection()}
        </section>

        <!-- تبويب 4: صفحات الهبوط والعروض -->
        <section id="adm-tab-landing" class="adm-tab-section ${adminState.activeTab === 'landing' ? 'active' : ''}">
          ${renderLandingBuilderSection()}
        </section>

        <!-- تبويب 5: أسعار التوصيل والشحن -->
        <section id="adm-tab-shipping" class="adm-tab-section ${adminState.activeTab === 'shipping' ? 'active' : ''}">
          ${renderShippingSection()}
        </section>
      </main>

      <!-- 3. شريط التنقل السفلي للهاتف (Mobile Bottom Bar) -->
      <nav class="adm-bottom-nav">
        ${tabs
          .map(
            (tab) => `
            <button
              type="button"
              data-adm-action="switch-tab"
              data-tab="${tab.id}"
              class="adm-bottom-nav-btn ${adminState.activeTab === tab.id ? 'active' : ''}"
            >
              <span class="adm-bnav-icon">${tab.icon}</span>
              <span class="adm-bnav-label">${tab.shortLabel}</span>
            </button>
          `
          )
          .join('')}
      </nav>
    </div>

    <!-- نافذة معاينة صفحة الهبوط -->
    <div id="adm-landing-modal" class="adm-modal-backdrop ${adminState.previewLandingId ? 'open' : ''}">
      ${renderLandingPreviewModal()}
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
 * القسم 1: إدارة المنتجات والمخزون (واجهة مريحة للعين — الكتالوج أولاً + نموذج مبسط مع إخفاء الخيارات المتقدمة)
 */
function renderInventorySection() {
  const tr = t();
  const lang = getLang();
  const isFr = lang === 'fr';

  const editingProd = adminState.editingProductId
    ? adminState.inventory.find((p) => p.id === adminState.editingProductId)
    : null;

  const isFormVisible = Boolean(adminState.isProductFormOpen || editingProd);
  const showAdvanced = Boolean(adminState.showAdvancedProductFields);

  const df = adminState.draftProductForm;
  const currentProdImg =
    adminState.draftProductImage || (editingProd ? editingProd.image : IMAGES.talons);
  const currentProdGallery = adminState.draftProductGallery || [];

  const sizeMap = df.sizeStock || buildSizeStockRange(df.sizeFrom, df.sizeTo, df.defaultSizeStock);
  const totalCalculatedStock = sumSizeStock(sizeMap);

  const lowStockItems = adminState.inventory.filter((p) => Number(p.stock) < 5);

  const q = adminState.inventorySearch.trim().toLowerCase();
  const filteredProducts = adminState.inventory.filter(
    (p) =>
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.name_fr && p.name_fr.toLowerCase().includes(q)) ||
      (p.slug && p.slug.toLowerCase().includes(q)) ||
      p.category.toLowerCase().includes(q)
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

    <!-- نافذة إضافة / تعديل المنتج (تظهر فقط عند الطلب لتبقى اللوحة هادئة ومريحة للعين) -->
    ${
      isFormVisible
        ? `
      <div class="adm-card" style="border-color:rgba(216, 27, 96, 0.25);">
        <div class="adm-card-head">
          <div>
            <h2 class="adm-card-title">
              ${editingProd ? tr.inv.editProdTitle(getProdDisplayName(editingProd)) : tr.inv.addProdTitle}
            </h2>
            <p class="adm-card-sub">
              ${
                isFr
                  ? 'Mode simple : 4 champs essentiels seulement (le reste est généré automatiquement).'
                  : 'الوضع المريح والمبسط: 4 خانات أساسية فقط، أو اكتب اسم الحذاء ليُكمل المساعد الذكي الباقي تلقائياً.'
              }
            </p>
          </div>
          <button
            type="button"
            data-adm-action="cancel-product-edit"
            class="adm-btn adm-btn-outline adm-btn-sm"
          >
            ${isFr ? '✕ Fermer' : '✕ إغلاق النافذة'}
          </button>
        </div>

        <!-- شريط التوليد السريع بضغطة واحدة -->
        <div style="background:#faf7f8; border:1px solid #ece7ea; border-radius:12px; padding:0.85rem 1rem; margin-bottom:1.25rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.55rem;">
            <label for="adm-product-brief-input" style="font-size:0.8rem; font-weight:700; color:#18181b;">
              ${
                isFr
                  ? '✨ Remplissage automatique en 1 clic (optionnel) :'
                  : '✨ تعبئة ذكية بضغطة واحدة (اكتب نوع الحذاء ولونه فقط):'
              }
            </label>
            <div style="display:flex; gap:0.35rem; flex-wrap:wrap;">
              <button type="button" data-adm-action="quick-brief-preset" data-brief="صندل بيج بكعب عالي مريح للسهرات" class="adm-btn adm-btn-soft adm-btn-sm" style="font-size:0.7rem; padding:0.2rem 0.55rem;">
                ${isFr ? 'Sandale Beige' : 'صندل بيج'}
              </button>
              <button type="button" data-adm-action="quick-brief-preset" data-brief="حذاء كعب عالي كلاسيك أسود ملكي للسهرات" class="adm-btn adm-btn-soft adm-btn-sm" style="font-size:0.7rem; padding:0.2rem 0.55rem;">
                ${isFr ? 'Escarpin Noir' : 'كعب أسود'}
              </button>
              <button type="button" data-adm-action="quick-brief-preset" data-brief="حذاء رياضي سنيكرز أبيض ناصع مريح للمشي" class="adm-btn adm-btn-soft adm-btn-sm" style="font-size:0.7rem; padding:0.2rem 0.55rem;">
                ${isFr ? 'Sneakers Blanc' : 'سنيكرز أبيض'}
              </button>
            </div>
          </div>

          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <input
              id="adm-product-brief-input"
              type="text"
              class="adm-input"
              style="flex:1; min-width:200px;"
              placeholder="${
                isFr
                  ? 'Ex: Sandale beige à talon confortable...'
                  : 'مثال: صندل بيج بكعب مريح للسهرات...'
              }"
              value="${adminState.draftProductBrief || ''}"
            />
            <button
              type="button"
              data-adm-action="generate-from-brief"
              class="adm-btn adm-btn-pink adm-btn-sm"
              style="padding:0.6rem 1rem;"
            >
              ${isFr ? '⚡ Remplir pour moi' : '⚡ املأ الحقول تلقائياً'}
            </button>
          </div>
        </div>

        <form id="adm-product-form" class="adm-form-grid">
          <!-- الخانات الـ 4 الأساسية المريحة للعين فقط -->
          <div class="adm-field full">
            <label class="adm-label">${tr.inv.mainPhotoLabel}</label>
            <div class="adm-upload-box">
              <div class="adm-upload-left">
                <img
                  id="adm-prod-img-preview"
                  src="${currentProdImg}"
                  alt="Product"
                  referrerpolicy="no-referrer"
                  class="adm-upload-thumb"
                />
                <div>
                  <span class="adm-upload-title">${tr.inv.uploadTapTitle}</span>
                  <span class="adm-upload-sub">${tr.inv.uploadTapSub}</span>
                </div>
              </div>
              <span class="adm-btn adm-btn-pink adm-btn-sm">${tr.inv.uploadBtn}</span>
              <input
                id="adm-prod-file-input"
                type="file"
                accept="image/*"
                class="adm-file-hidden"
              />
            </div>
          </div>

          <div class="adm-field">
            <label class="adm-label">${isFr ? 'Nom de la chaussure' : 'اسم الحذاء'}</label>
            <input
              name="name"
              type="text"
              class="adm-input"
              placeholder="مثال: صندل بيج بكعب أنيق"
              value="${df.name || ''}"
              required
            />
          </div>

          <div class="adm-field">
            <label class="adm-label">${isFr ? 'Catégorie' : 'التصنيف'}</label>
            <select name="category" class="adm-select">
              ${Object.keys(CATEGORY_LABELS)
                .map(
                  (catId) =>
                    `<option value="${catId}" ${df.category === catId ? 'selected' : ''}>${CATEGORY_LABELS[catId][lang]}</option>`
                )
                .join('')}
            </select>
          </div>

          <div class="adm-field">
            <label class="adm-label">${isFr ? 'Prix de vente (DA)' : 'سعر البيع (د.ج)'}</label>
            <input
              name="discountPrice"
              type="number"
              min="100"
              class="adm-input"
              placeholder="4790"
              value="${df.discountPrice || df.originalPrice || 4790}"
              required
            />
          </div>

          <div class="adm-field">
            <label class="adm-label">${isFr ? 'Couleur & Stock par pointure (36–41)' : 'اللون والكمية لكل مقاس (36–41)'}</label>
            <div style="display:flex; gap:0.5rem;">
              <select name="colorName" class="adm-select" style="flex:1;">
                ${['Beige', 'Noir', 'Rose', 'Blanc', 'Doré', 'Rouge']
                  .map(
                    (cName) =>
                      `<option value="${cName}" ${df.colorName === cName ? 'selected' : ''}>${cName}</option>`
                  )
                  .join('')}
              </select>
              <input
                id="adm-default-size-stock"
                name="defaultSizeStock"
                type="number"
                min="0"
                class="adm-input"
                style="width:95px; text-align:center;"
                title="${isFr ? 'Stock par pointure' : 'الكمية لكل مقاس'}"
                value="${df.defaultSizeStock ?? 5}"
              />
            </div>
          </div>

          <!-- زر اختياري لإظهار أو إخفاء التفاصيل المتقدمة (يبقى مغلقاً افتراضياً لراحة العين) -->
          <div class="adm-field full" style="padding-top:0.25rem;">
            <button
              type="button"
              data-adm-action="toggle-advanced-product-fields"
              class="adm-btn adm-btn-soft adm-btn-sm"
              style="width:100%; justify-content:space-between; padding:0.65rem 1rem;"
            >
              <span>
                ${
                  isFr
                    ? '⚙️ Options avancées (Traduction FR, Slug, Prix barré, Pointures détaillées, Galerie)'
                    : '⚙️ خيارات متقدمة إضافية (الاسم والوصف بالفرنسية، السعر قبل الخصم، وجدول المقاسات التفصيلي)'
                }
              </span>
              <span>${showAdvanced ? '▲' : '▼'}</span>
            </button>
          </div>

          ${
            showAdvanced
              ? `
              <!-- التفاصيل المتقدمة الكاملة (تظهر فقط عند رغبة المستخدم) -->
              <div class="adm-field full" style="background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:1rem;">
                ${
                  adminState.draftGeneratedPreview
                    ? `
                    <div style="margin-bottom:1rem; background:#fff; border:1px solid #ece7ea; border-radius:10px; padding:0.75rem;">
                      <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; margin-bottom:0.4rem;">
                        <span style="font-size:0.75rem; font-weight:700; color:#18181b;">
                          ${isFr ? '📋 Fiche complète générée :' : '📋 بطاقة المنتج الكاملة بالتنسيق الثلاثي:'}
                        </span>
                        <button type="button" data-adm-action="copy-generated-spec" class="adm-btn adm-btn-soft adm-btn-sm">
                          ${isFr ? 'Copier' : 'نسخ النص'}
                        </button>
                      </div>
                      <pre id="adm-generated-spec-text" style="margin:0; white-space:pre-wrap; font-family:inherit; font-size:0.74rem; line-height:1.6; color:#3f3f46; max-height:160px; overflow-y:auto;">${formatGeneratedProductSpec(adminState.draftGeneratedPreview)}</pre>
                    </div>
                  `
                    : ''
                }

                <div class="adm-form-grid">
                  <div class="adm-field">
                    <label class="adm-label">Nom en français</label>
                    <input name="name_fr" type="text" class="adm-input" value="${df.name_fr || ''}" />
                  </div>

                  <div class="adm-field">
                    <label class="adm-label">Slug (URL)</label>
                    <input name="slug" type="text" dir="ltr" class="adm-input" value="${df.slug || 'sandale-beige-talon'}" />
                  </div>

                  <div class="adm-field">
                    <label class="adm-label">${isFr ? 'Description (Arabe)' : 'الوصف بالعربية'}</label>
                    <textarea name="description_ar" rows="2" class="adm-textarea">${df.description_ar || ''}</textarea>
                  </div>

                  <div class="adm-field">
                    <label class="adm-label">Description en français</label>
                    <textarea name="description_fr" rows="2" dir="ltr" class="adm-textarea">${df.description_fr || ''}</textarea>
                  </div>

                  <div class="adm-field">
                    <label class="adm-label">${isFr ? 'Prix initial avant remise (DA)' : 'السعر الأصلي قبل التخفيض (د.ج)'}</label>
                    <input name="originalPrice" type="number" min="100" class="adm-input" value="${df.originalPrice ?? 6200}" />
                  </div>

                  <div class="adm-field">
                    <label class="adm-label">${isFr ? 'Code Couleur (Hex)' : 'كود اللون (Hex Code)'}</label>
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <input id="adm-color-picker" type="color" value="${df.colorHex || '#D2B48C'}" style="width:42px; height:38px; border:1px solid #d4d4d8; border-radius:8px; cursor:pointer; background:#fff; padding:2px;" />
                      <input id="adm-color-hex-input" name="colorHex" type="text" dir="ltr" class="adm-input" value="${df.colorHex || '#D2B48C'}" />
                    </div>
                  </div>

                  <div class="adm-field full">
                    <label class="adm-label">${isFr ? "Options d'affichage" : 'خيارات العرض في المتجر'}</label>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:0.5rem;">
                      <select name="isVisible" class="adm-select">
                        <option value="yes" ${df.isVisible !== false ? 'selected' : ''}>${isFr ? 'Visible : Oui' : 'ظاهر في المتجر: نعم'}</option>
                        <option value="no" ${df.isVisible === false ? 'selected' : ''}>${isFr ? 'Visible : Non' : 'ظاهر في المتجر: لا'}</option>
                      </select>
                      <select name="isNew" class="adm-select">
                        <option value="yes" ${df.isNew ? 'selected' : ''}>${isFr ? 'Nouveau : Oui' : 'وصل حديثاً: نعم'}</option>
                        <option value="no" ${!df.isNew ? 'selected' : ''}>${isFr ? 'Nouveau : Non' : 'وصل حديثاً: لا'}</option>
                      </select>
                      <select name="isBestSeller" class="adm-select">
                        <option value="yes" ${df.isBestSeller ? 'selected' : ''}>${isFr ? 'Best-seller : Oui' : 'الأكثر مبيعاً: نعم'}</option>
                        <option value="no" ${!df.isBestSeller ? 'selected' : ''}>${isFr ? 'Best-seller : Non' : 'الأكثر مبيعاً: لا'}</option>
                      </select>
                      <select name="isSpecialOffer" class="adm-select">
                        <option value="yes" ${df.isSpecialOffer ? 'selected' : ''}>${isFr ? 'En vedette : Oui' : 'مميز: نعم'}</option>
                        <option value="no" ${!df.isSpecialOffer ? 'selected' : ''}>${isFr ? 'En vedette : Non' : 'مميز: لا'}</option>
                      </select>
                    </div>
                  </div>

                  <div class="adm-field full">
                    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.4rem;">
                      <label class="adm-label" style="margin:0;">
                        ${isFr ? 'Pointures & Quantités (De / À)' : 'نطاق المقاسات وجدول الكميات التفصيلي'}
                      </label>
                      <div style="display:flex; align-items:center; gap:0.4rem;">
                        <input id="adm-size-from" name="sizeFrom" type="number" min="34" max="44" class="adm-input" style="width:64px; padding:0.3rem; text-align:center;" value="${df.sizeFrom || 36}" />
                        <span>–</span>
                        <input id="adm-size-to" name="sizeTo" type="number" min="34" max="44" class="adm-input" style="width:64px; padding:0.3rem; text-align:center;" value="${df.sizeTo || 41}" />
                        <button type="button" data-adm-action="apply-default-size-stock" class="adm-btn adm-btn-soft adm-btn-sm">
                          ${isFr ? 'Appliquer stock' : 'تطبيق الكمية'}
                        </button>
                      </div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(90px, 1fr)); gap:0.45rem;">
                      ${Object.entries(sizeMap)
                        .map(
                          ([sz, qty]) => `
                          <div style="background:#fff; border:1px solid #e4e4e7; border-radius:8px; padding:0.4rem; text-align:center;">
                            <div style="font-size:0.72rem; font-weight:700; color:#71717a; margin-bottom:0.2rem;">${sz}</div>
                            <input
                              type="number"
                              min="0"
                              data-adm-size-qty="${sz}"
                              name="size_qty_${sz}"
                              value="${qty}"
                              class="adm-input"
                              style="text-align:center; padding:0.25rem; font-weight:700;"
                            />
                          </div>
                        `
                        )
                        .join('')}
                    </div>
                  </div>

                  <div class="adm-field full">
                    <label class="adm-label">${tr.inv.galleryLabel}</label>
                    <div class="adm-upload-box" style="padding:0.6rem 0.85rem;">
                      <span class="adm-upload-title" style="font-size:0.78rem;">${tr.inv.galleryTapTitle(currentProdGallery.length)}</span>
                      <span class="adm-btn adm-btn-soft adm-btn-sm">${tr.inv.galleryBtn}</span>
                      <input id="adm-prod-gallery-input" type="file" accept="image/*" multiple class="adm-file-hidden" />
                    </div>
                    ${
                      currentProdGallery.length > 0
                        ? `<div class="adm-thumbs-row">
                            ${currentProdGallery
                              .map(
                                (gImg, idx) => `
                                <div class="adm-thumb-chip">
                                  <img src="${gImg}" alt="Gallery ${idx + 1}" referrerpolicy="no-referrer" />
                                  <button type="button" data-adm-action="remove-prod-gallery-img" data-index="${idx}" class="adm-thumb-del">×</button>
                                </div>
                              `
                              )
                              .join('')}
                          </div>`
                        : ''
                    }
                  </div>
                </div>
              </div>
            `
              : `
              <!-- حقول مخفية تحفظ جميع القيم المولدة تلقائياً دون إزعاج عين المستخدم -->
              <input type="hidden" name="name_fr" value="${df.name_fr || df.name || ''}" />
              <input type="hidden" name="slug" value="${df.slug || 'sandale-beige-talon'}" />
              <input type="hidden" name="description_ar" value="${df.description_ar || ''}" />
              <input type="hidden" name="description_fr" value="${df.description_fr || ''}" />
              <input type="hidden" name="originalPrice" value="${df.originalPrice ?? 6200}" />
              <input type="hidden" name="colorHex" value="${df.colorHex || '#D2B48C'}" />
              <input type="hidden" name="isVisible" value="${df.isVisible !== false ? 'yes' : 'no'}" />
              <input type="hidden" name="isNew" value="${df.isNew ? 'yes' : 'no'}" />
              <input type="hidden" name="isBestSeller" value="${df.isBestSeller ? 'yes' : 'no'}" />
              <input type="hidden" name="isSpecialOffer" value="${df.isSpecialOffer ? 'yes' : 'no'}" />
              <input type="hidden" name="sizeFrom" value="${df.sizeFrom || 36}" />
              <input type="hidden" name="sizeTo" value="${df.sizeTo || 41}" />
            `
          }

          <input type="hidden" id="adm-calculated-stock-input" name="stock" value="${totalCalculatedStock}" />

          <div class="adm-field full">
            <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem; font-size:0.9rem;">
              ${editingProd ? tr.inv.saveProdChanges : tr.inv.addProdNow}
            </button>
          </div>
        </form>
      </div>
    `
        : ''
    }

    <!-- قسم التحكم بالفئات / الأقسام (إضافة، تعديل، تغيير صورة، حذف) -->
    ${renderCategoryManagerCard()}

    <!-- قائمة المنتجات الحالية (تظهر مباشرة وبشكل مريح وواضح) -->
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.inv.currentProdsTitle(filteredProducts.length)}</h2>
          <p class="adm-card-sub">${tr.inv.currentProdsSub}</p>
        </div>

        <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
          <input
            id="adm-inventory-search"
            type="search"
            class="adm-input"
            style="width:210px; padding:0.5rem 0.8rem;"
            placeholder="${tr.inv.searchPlaceholder}"
            value="${adminState.inventorySearch}"
          />
          ${
            !isFormVisible
              ? `<button
                  type="button"
                  data-adm-action="toggle-product-form"
                  class="adm-btn adm-btn-pink"
                >
                  ${tr.inv.addProdTitle}
                </button>`
              : ''
          }
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
            🗂️ ${isFr ? `Gestion des Catégories (${adminState.categories.length})` : `التحكم بالفئات والأقسام (${adminState.categories.length})`}
          </h2>
          <p class="adm-card-sub">
            ${isFr ? 'Ajoutez, renommez ou changez les photos des catégories affichées sur la boutique' : 'أضف فئة جديدة، عدّل أسماء الفئات أو غيّر صورها الدائرية في المتجر'}
          </p>
        </div>
        ${
          !isCatFormOpen
            ? `<button type="button" data-adm-action="toggle-category-form" class="adm-btn adm-btn-soft adm-btn-sm">
                ➕ ${isFr ? 'Nouvelle Catégorie' : 'إضافة فئة جديدة'}
              </button>`
            : `<button type="button" data-adm-action="cancel-category-edit" class="adm-btn adm-btn-outline adm-btn-sm">
                ✕ ${isFr ? 'Fermer' : 'إغلاق'}
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
                  <span class="adm-upload-title" style="font-size:0.78rem;">📷 ${isFr ? 'Choisir une photo' : 'رفع صورة الفئة'}</span>
                </div>
                <span class="adm-btn adm-btn-soft adm-btn-sm">${isFr ? 'Importer' : 'اختيار'}</span>
                <input id="adm-cat-file-input" type="file" accept="image/*" class="adm-file-hidden" />
              </div>
            </div>

            <div class="adm-field full">
              <button type="submit" class="adm-btn adm-btn-pink" style="width:100%;">
                ${editingCat ? (isFr ? '💾 Mettre à jour la catégorie' : '💾 حفظ تعديلات الفئة') : (isFr ? '➕ Ajouter la catégorie' : '➕ إضافة الفئة للمتجر الآن')}
              </button>
            </div>
          </form>
        `
          : ''
      }

      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(210px, 1fr)); gap:0.65rem;">
        ${adminState.categories
          .map(
            (cat) => `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:0.55rem 0.75rem;">
              <div style="display:flex; align-items:center; gap:0.6rem; min-width:0;">
                <img src="${cat.image}" alt="${cat.name_ar}" referrerpolicy="no-referrer" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid rgba(216,27,96,0.3); flex-shrink:0;" />
                <div style="min-width:0;">
                  <strong style="font-size:0.84rem; color:var(--adm-text-dark); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${isFr ? cat.name_fr : cat.name_ar}
                  </strong>
                  <span style="font-size:0.72rem; color:var(--adm-text-muted); display:block;">
                    ${isFr ? cat.name_ar : cat.name_fr}
                  </span>
                </div>
              </div>
              <div style="display:flex; gap:0.25rem; flex-shrink:0;">
                <button type="button" data-adm-action="edit-category" data-id="${cat.id}" class="adm-btn adm-btn-soft adm-btn-sm" style="padding:0.25rem 0.5rem;">✏️</button>
                <button type="button" data-adm-action="delete-category" data-id="${cat.id}" class="adm-btn adm-btn-danger adm-btn-sm" style="padding:0.25rem 0.5rem;">🗑️</button>
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
      const sizesRangeText =
        p.sizeFrom && p.sizeTo
          ? `${p.sizeFrom}–${p.sizeTo}`
          : Array.isArray(p.sizes) && p.sizes.length
          ? `${Math.min(...p.sizes)}–${Math.max(...p.sizes)}`
          : '36–41';

      return `
        <article id="adm-prod-card-${p.id}" class="adm-prod-card ${isLow ? 'low-stock' : ''}">
          <div class="adm-prod-top">
            <label class="adm-prod-img-wrap">
              <img
                id="adm-row-thumb-${p.id}"
                src="${p.image}"
                alt="${displayName}"
                referrerpolicy="no-referrer"
              />
              <span class="adm-prod-cam-btn">${tr.inv.changePhotoBtn}</span>
              <input
                type="file"
                accept="image/*"
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
                ${
                  p.colorHex
                    ? `<span style="display:inline-flex; align-items:center; gap:0.25rem;">
                        <span style="width:10px; height:10px; border-radius:50%; background:${p.colorHex}; border:1px solid #d4d4d8; display:inline-block;"></span>
                        <span>${p.colorName || 'Beige'}</span>
                      </span>`
                    : ''
                }
                <span>· ${isFr ? 'Pointures' : 'المقاسات'} ${sizesRangeText}</span>
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

            <div style="display:flex; gap:0.35rem;">
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

                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">
                      <div>
                        <strong style="font-size:0.92rem; display:block;">${order.fullName}</strong>
                        <span style="font-size:0.78rem; color:var(--adm-text-body);">${order.wilaya} — ${order.address}</span>
                      </div>
                      <a
                        href="tel:${order.phone}"
                        class="adm-btn adm-btn-soft adm-btn-sm"
                        style="text-decoration:none;"
                      >
                        📞 ${order.phone}
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

                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; padding-top:0.4rem;">
                      <div>
                        <span style="font-size:0.72rem; color:var(--adm-text-muted); display:block;">${tr.orders.totalAmount}</span>
                        <strong style="font-size:1.05rem; color:var(--adm-text-dark);">${formatDA(order.total, lang)}</strong>
                      </div>

                      <div style="display:flex; align-items:center; gap:0.4rem; flex:1; max-width:230px;">
                        <select
                          data-adm-order-status="${order.id}"
                          class="adm-select"
                          style="padding:0.45rem 0.65rem; font-size:0.8rem;"
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
                          🗑️
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

        <!-- 📞 معلومات الهاتف، مكان المحل، وأيقونات التواصل الاجتماعي في أسفل الموقع -->
        <div class="adm-field full" style="background:#fdf5f7; border:1px solid rgba(216,27,96,0.2); border-radius:12px; padding:1rem;">
          <h3 style="margin:0 0 0.75rem; font-size:0.9rem; font-weight:800; color:var(--adm-text-dark);">
            📍 ${isFr ? 'Contact, Adresse du Magasin & Réseaux Sociaux (Pied de page)' : 'رقم الهاتف، مكان المحل، وأيقونات التواصل الاجتماعي (أسفل الموقع)'}
          </h3>
          <div class="adm-form-grid">
            <div class="adm-field">
              <label class="adm-label">📞 ${isFr ? 'Numéro de téléphone du magasin' : 'رقم هاتف المحل'}</label>
              <input name="phone" type="tel" dir="ltr" class="adm-input" value="${c.phone || '0550 12 34 56'}" placeholder="0550 12 34 56" />
            </div>

            <div class="adm-field">
              <label class="adm-label">💬 ${isFr ? 'Numéro WhatsApp' : 'رقم واتساب للتواصل السريع'}</label>
              <input name="whatsappNumber" type="text" dir="ltr" class="adm-input" value="${c.whatsappNumber || '213550123456'}" placeholder="213550123456" />
            </div>

            <div class="adm-field">
              <label class="adm-label">📍 ${isFr ? 'Adresse du magasin (Arabe)' : 'مكان المحل / العنوان (بالعربية)'}</label>
              <input name="location_ar" type="text" class="adm-input" value="${c.location_ar || 'الجزائر العاصمة — باب الزوار، المركز التجاري'}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">📍 ${isFr ? 'Adresse du magasin (Français)' : 'مكان المحل (بالفرنسية)'}</label>
              <input name="location_fr" type="text" class="adm-input" value="${c.location_fr || 'Alger — Bab Ezzouar, Centre Commercial'}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">📸 Instagram URL</label>
              <input name="instagramUrl" type="text" dir="ltr" class="adm-input" value="${c.instagramUrl || 'https://instagram.com/shoestyle.dz'}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">📘 Facebook URL</label>
              <input name="facebookUrl" type="text" dir="ltr" class="adm-input" value="${c.facebookUrl || 'https://facebook.com/shoestyle.dz'}" />
            </div>

            <div class="adm-field full">
              <label class="adm-label">🎵 TikTok URL</label>
              <input name="tiktokUrl" type="text" dir="ltr" class="adm-input" value="${c.tiktokUrl || 'https://tiktok.com/@shoestyle.dz'}" />
            </div>
          </div>
        </div>

        <!-- 🎯 بيكسل الإعلانات وتتبع المبيعات (Facebook / TikTok / Snapchat / Google) -->
        <div class="adm-field full" style="background:#fafafa; border:1px solid #ece7ea; border-radius:12px; padding:1rem;">
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.75rem;">
            <div>
              <h3 style="margin:0; font-size:0.9rem; font-weight:800; color:var(--adm-text-dark);">
                🎯 ${isFr ? 'Pixels Publicitaires (Facebook, TikTok, Snapchat)' : 'بيكسل الإعلانات وتتبع الحملات الإعلانية (Ad Pixels)'}
              </h3>
              <p style="margin:0.15rem 0 0; font-size:0.75rem; color:var(--adm-text-muted);">
                ${isFr ? 'Suivi automatique des événements PageView, AddToCart et Purchase sur la boutique et les Landing Pages' : 'يتم تفعيل تتبع الزيارات (PageView) وإضافة السلة (AddToCart) والطلبات المؤكدة (Purchase) تلقائياً'}
              </p>
            </div>
            <span class="adm-badge adm-badge-delivered">
              ${c.fbPixelId || c.tiktokPixelId || c.snapPixelId ? (isFr ? '🟢 Pixel Actif' : '🟢 البيكسل مفعل') : (isFr ? '⚪ Prêt à configurer' : '⚪ جاهز للربط')}
            </span>
          </div>

          <div class="adm-form-grid">
            <div class="adm-field">
              <label class="adm-label">📘 Facebook / Meta Pixel ID</label>
              <input name="fbPixelId" type="text" dir="ltr" class="adm-input" placeholder="Ex: 123456789012345" value="${c.fbPixelId || ''}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">🎵 TikTok Pixel ID</label>
              <input name="tiktokPixelId" type="text" dir="ltr" class="adm-input" placeholder="Ex: C8ABCDEF123456" value="${c.tiktokPixelId || ''}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">👻 Snapchat Pixel ID</label>
              <input name="snapPixelId" type="text" dir="ltr" class="adm-input" placeholder="Ex: a1b2c3d4-e5f6-7890" value="${c.snapPixelId || ''}" />
            </div>

            <div class="adm-field">
              <label class="adm-label">📊 Google Tag / Analytics ID</label>
              <input name="googleTagId" type="text" dir="ltr" class="adm-input" placeholder="Ex: G-XXXXXXXXXX" value="${c.googleTagId || ''}" />
            </div>
          </div>
        </div>

        <!-- طي بطاقات المميزات الـ 3 داخل قائمة اختيارية هادئة -->
        <div class="adm-field full">
          <details style="background:#fafafa; border:1px solid #ece7ea; border-radius:10px; padding:0.75rem 1rem;">
            <summary style="cursor:pointer; font-size:0.82rem; font-weight:700; color:var(--adm-text-body);">
              ${isFr ? '⚙️ Modifier les 3 cartes d’avantages (Optionnel)' : '⚙️ تعديل بطاقات المميزات الثلاث أسفل البانر (اختياري)'}
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
              ⚡ ${isFr ? 'Importation rapide depuis votre catalogue :' : 'تعبئة ذكية من منتجات متجرك بضغطة واحدة:'}
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
            const liveUrl = `./index.html?lp=${encodeURIComponent(lp.id)}`;

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
                        🟢 ${isFr ? 'Active · Prête Ads' : 'نشطة · جاهزة للإعلانات'}
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
                    🌐 ${isFr ? 'Ouvrir la page' : 'فتح الصفحة'}
                  </a>
                  <button
                    type="button"
                    data-adm-action="copy-landing-link"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-outline adm-btn-sm"
                  >
                    🔗 ${isFr ? 'Copier Lien' : 'نسخ الرابط'}
                  </button>
                </div>

                <div style="display:flex; gap:0.35rem;">
                  <button
                    type="button"
                    data-adm-action="edit-landing"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-outline adm-btn-sm"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    data-adm-action="delete-landing"
                    data-id="${lp.id}"
                    class="adm-btn adm-btn-danger adm-btn-sm"
                  >
                    🗑️
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
  const saved = Math.max(0, orig - disc);
  const pct = orig > disc && orig > 0 ? Math.round(((orig - disc) / orig) * 100) : 28;
  const pack2Price = Math.max(0, disc * 2 - 500);
  const liveUrl = `./index.html?lp=${encodeURIComponent(lp.id)}`;

  return `
    <div class="adm-modal-card" dir="${dir}" style="max-width:920px;">
      <!-- شريط عنوان نافذة المعاينة مع أزرار النسخ والفتح المباشر -->
      <div style="background:#18181b; color:#fff; padding:0.75rem 1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span style="background:var(--adm-pink); color:#fff; font-size:0.72rem; font-weight:800; padding:0.2rem 0.6rem; border-radius:99px;">
            🔥 ${isFr ? 'OFFRE FLASH COD' : 'صفحة هبوط عالية التحويل'}
          </span>
          <strong style="font-size:0.84rem; color:#fbcfe8;">${tr.lp.modalHeader(lp.slug)}</strong>
        </div>

        <div style="display:flex; align-items:center; gap:0.4rem;">
          <button
            type="button"
            data-adm-action="copy-landing-link"
            data-id="${lp.id}"
            class="adm-btn adm-btn-soft adm-btn-sm"
            style="padding:0.3rem 0.65rem; font-size:0.74rem;"
          >
            🔗 ${isFr ? 'Copier le lien pub' : 'نسخ رابط الإعلان'}
          </button>
          <a
            href="${liveUrl}"
            target="_blank"
            rel="noopener"
            class="adm-btn adm-btn-pink adm-btn-sm"
            style="padding:0.3rem 0.65rem; font-size:0.74rem; text-decoration:none;"
          >
            🌐 ${isFr ? 'Voir sur la boutique' : 'فتح في المتجر'}
          </a>
          <button
            type="button"
            data-adm-action="close-landing-modal"
            class="adm-btn adm-btn-danger adm-btn-sm"
            style="padding:0.3rem 0.65rem; font-size:0.74rem;"
          >
            ${tr.lp.closeModal}
          </button>
        </div>
      </div>

      <!-- شريط العد التنازلي الترويجي -->
      <div style="background:#fdf2f6; border-bottom:1px solid #f5d0de; padding:0.5rem 1.25rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; font-size:0.76rem;">
        <span style="font-weight:700; color:#be123c;">
          ⏳ ${isFr ? 'Offre limitée — Plus que 5 pièces disponibles à ce prix !' : 'عرض محدود جداً — بقي 5 قطع فقط في المخزون بهذا السعر!'}
        </span>
        <span style="font-weight:800; color:#15803d;">
          ✓ ${isFr ? 'Paiement à la livraison · Livraison 69 Wilayas' : 'الدفع عند الاستلام · توصيل سريع 69 ولاية'}
        </span>
      </div>

      <div style="padding:1.25rem; display:grid; grid-template-columns:repeat(auto-fit, minmax(290px, 1fr)); gap:1.35rem; align-items:start;">
        <!-- العمود الأول: معرض الصور + المميزات -->
        <div>
          <div style="position:relative; border-radius:14px; overflow:hidden; aspect-ratio:4/3; margin-bottom:0.65rem; background:#fdf2f6; border:1px solid #ece7ea;">
            <img id="lp-modal-main-img" src="${lp.imageUrl}" alt="${lp.title}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" />
            <span style="position:absolute; top:10px; right:10px; background:var(--adm-pink); color:#fff; font-size:0.78rem; font-weight:800; padding:0.25rem 0.7rem; border-radius:99px;">
              -${pct}%
            </span>
          </div>

          <div style="display:flex; gap:0.45rem; overflow-x:auto; padding-bottom:0.25rem;">
            ${gallery
              .map(
                (imgUrl) => `
                <img
                  src="${imgUrl}"
                  alt="Thumb"
                  data-adm-action="swap-lp-img"
                  data-src="${imgUrl}"
                  style="width:56px; height:56px; border-radius:10px; object-fit:cover; cursor:pointer; border:2px solid var(--adm-pink);"
                />
              `
              )
              .join('')}
          </div>

          <div style="margin-top:0.75rem; display:flex; align-items:center; gap:0.4rem; font-size:0.76rem;">
            <span style="color:#fbbf24; font-size:0.9rem;">★★★★★</span>
            <strong>4.9/5</strong>
            <span style="color:var(--adm-text-muted);">(${isFr ? '184 avis clientes vérifiés' : '184 تقييم موثق من الزبونات'})</span>
          </div>

          <h3 style="font-size:1.15rem; font-weight:800; margin:0.35rem 0; color:var(--adm-text-dark);">${lp.title}</h3>

          <div style="display:flex; align-items:baseline; gap:0.6rem; flex-wrap:wrap; margin-bottom:0.6rem;">
            <strong style="font-size:1.4rem; color:var(--adm-pink);">${formatDA(disc, lang)}</strong>
            ${
              orig > disc
                ? `<span style="text-decoration:line-through; color:var(--adm-text-muted); font-size:0.9rem;">${formatDA(orig, lang)}</span>`
                : ''
            }
            ${
              saved > 0
                ? `<span style="background:#ecfdf5; color:#15803d; font-size:0.74rem; font-weight:800; padding:2px 8px; border-radius:6px;">
                    ${isFr ? `Économisez ${formatDA(saved, 'fr')}` : `وفر ${formatDA(saved, 'ar')}`}
                  </span>`
                : ''
            }
          </div>

          <p style="font-size:0.83rem; color:var(--adm-text-body); line-height:1.6; margin-bottom:0.85rem;">${lp.description}</p>

          <!-- بطاقات الثقة الـ 4 -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; font-size:0.74rem;">
            <div style="background:#fafafa; border:1px solid #ece7ea; border-radius:10px; padding:0.55rem 0.7rem;">
              <strong>✨ ${isFr ? 'Qualité supérieure' : 'خامة مريحة وفاخرة'}</strong>
            </div>
            <div style="background:#fafafa; border:1px solid #ece7ea; border-radius:10px; padding:0.55rem 0.7rem;">
              <strong>🤝 ${isFr ? 'Vérification avant paiement' : 'معاينة الطرد قبل الدفع'}</strong>
            </div>
            <div style="background:#fafafa; border:1px solid #ece7ea; border-radius:10px; padding:0.55rem 0.7rem;">
              <strong>🚚 ${isFr ? 'Livraison 69 Wilayas' : 'توصيل سريع 69 ولاية'}</strong>
            </div>
            <div style="background:#fafafa; border:1px solid #ece7ea; border-radius:10px; padding:0.55rem 0.7rem;">
              <strong>🔄 ${isFr ? 'Échange garanti 7j' : 'ضمان استبدال المقاس'}</strong>
            </div>
          </div>
        </div>

        <!-- العمود الثاني: استمارة الشراء السريع المدمجة المناسبة للهاتف -->
        <div style="background:#fff; border:2px solid rgba(216, 27, 96, 0.25); border-radius:16px; overflow:hidden; box-shadow:0 6px 20px rgba(0,0,0,0.05);">
          <div style="background:linear-gradient(135deg, #d81b60, #ad1457); color:#fff; padding:0.85rem 1.15rem;">
            <h4 style="margin:0; font-size:0.98rem; font-weight:800;">${tr.lp.quickOrderTitle}</h4>
            <p style="margin:0.2rem 0 0; font-size:0.74rem; opacity:0.9;">${tr.lp.quickOrderSub}</p>
          </div>

          <form id="adm-lp-quick-order-form" data-lp-id="${lp.id}" style="padding:1.1rem; display:flex; flex-direction:column; gap:0.75rem;">
            <div>
              <label class="adm-label" style="margin-bottom:0.35rem;">
                ${isFr ? '1. Choisissez votre offre :' : '1. اختاري العرض المناسب:'}
              </label>
              <select name="bundleQty" id="adm-lp-modal-bundle" data-unit-price="${disc}" class="adm-select" style="font-weight:700; border-color:var(--adm-pink);">
                <option value="1">
                  🥿 ${isFr ? `1 Paire — ${formatDA(disc, 'fr')}` : `زوج واحد (حذاء واحد) — ${formatDA(disc, 'ar')}`}
                </option>
                <option value="2">
                  👠👠 ${isFr ? `Pack 2 Paires (-500 DA + Livraison Gratuite) — ${formatDA(pack2Price, 'fr')}` : `عرض زوجين (خصم 500 د.ج + توصيل مجاني 🎁) — ${formatDA(pack2Price, 'ar')}`}
                </option>
              </select>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
              <div>
                <label class="adm-label" style="margin-bottom:0.25rem;">${isFr ? 'Couleur' : 'اللون'}</label>
                <select name="color" class="adm-select">
                  <option value="Rose">Rose / وردي</option>
                  <option value="Beige">Beige / بيج</option>
                  <option value="Noir">Noir / أسود</option>
                  <option value="Blanc">Blanc / أبيض</option>
                </select>
              </div>
              <div>
                <label class="adm-label" style="margin-bottom:0.25rem;">${isFr ? 'Pointure' : 'المقاس'}</label>
                <select name="size" class="adm-select">
                  <option value="36">${tr.orders.sizeWord} 36</option>
                  <option value="37" selected>${tr.orders.sizeWord} 37</option>
                  <option value="38">${tr.orders.sizeWord} 38</option>
                  <option value="39">${tr.orders.sizeWord} 39</option>
                  <option value="40">${tr.orders.sizeWord} 40</option>
                  <option value="41">${tr.orders.sizeWord} 41</option>
                </select>
              </div>
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
                <option value="À Domicile / للمنزل">🏠 ${isFr ? 'À Domicile' : 'توصيل للمنزل'}</option>
                <option value="Stop-Desk / للمكتب">🏢 ${isFr ? 'Stop-Desk' : 'مكتب التوصيل'}</option>
              </select>
            </div>

            <input name="address" type="text" required class="adm-input" placeholder="${tr.lp.addressPlaceholder}" />

            <button type="submit" class="adm-btn adm-btn-pink" style="width:100%; padding:0.85rem; font-size:0.92rem;">
              🛍️ ${tr.lp.confirmQuickOrder(formatDA(disc, lang))}
            </button>
          </form>
        </div>
      </div>
    </div>
  `;
}

/**
 * القسم 5: إعدادات الشحن وأسعار التوصيل لجميع الـ 69 ولاية (بدون سقف التوصيل المجاني)
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

  return `
    <div class="adm-card">
      <div class="adm-card-head">
        <div>
          <h2 class="adm-card-title">${tr.ship.ratesListTitle(adminState.shipping.rates.length)}</h2>
          <p class="adm-card-sub">${tr.ship.ratesListSub}</p>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <input
            id="adm-shipping-search"
            type="search"
            class="adm-input"
            style="width:210px; padding:0.5rem 0.8rem;"
            placeholder="${isFr ? '🔍 Chercher une wilaya...' : '🔍 ابحث عن اسم أو رقم الولاية...'}"
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
                  style="padding:0.2rem 0.5rem;"
                >✕</button>
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
                    ? 'Réduire la liste ▲'
                    : 'طي القائمة (عرض 12 ولاية فقط) ▲'
                  : isFr
                  ? `Afficher les ${adminState.shipping.rates.length} wilayas ▼`
                  : `عرض جميع الولايات (${adminState.shipping.rates.length} ولاية) ▼`
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

      case 'switch-tab': {
        const tab = btn.getAttribute('data-tab') || 'inventory';
        adminState.activeTab = tab;
        root.querySelectorAll('[data-adm-action="switch-tab"]').forEach((b) => {
          b.classList.toggle('active', b.getAttribute('data-tab') === tab);
        });
        root.querySelectorAll('.adm-tab-section').forEach((sec) => {
          sec.classList.toggle('active', sec.id === `adm-tab-${tab}`);
        });
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
        adminState.isProductFormOpen = !adminState.isProductFormOpen;
        renderAdminDashboard();
        if (adminState.isProductFormOpen) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
          showToast(getLang() === 'fr' ? '⚠️ Gardez au moins une catégorie' : '⚠️ يجب الإبقاء على فئة واحدة على الأقل');
          break;
        }
        adminState.categories = adminState.categories.filter((c) => c.id !== id);
        adminState.saveAll();
        renderAdminDashboard();
        showToast(getLang() === 'fr' ? '🗑️ Catégorie supprimée' : '🗑️ تم حذف الفئة بنجاح');
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
        const shareUrl = new URL(`./index.html?lp=${encodeURIComponent(id)}`, window.location.href).href;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).catch(() => {});
        }
        showToast(
          getLang() === 'fr'
            ? `🔗 Lien de l'offre copié : ${shareUrl}`
            : `🔗 تم نسخ رابط صفحة الهبوط للإعلانات بنجاح!`
        );
        break;
      }

      case 'quick-brief-preset': {
        const presetText = btn.getAttribute('data-brief') || '';
        adminState.draftProductBrief = presetText;
        const generated = generateProductFromBrief(presetText);
        adminState.draftGeneratedPreview = generated;
        adminState.draftProductImage = generated.image;
        adminState.draftProductForm = {
          name: generated.name,
          name_fr: generated.name_fr,
          slug: generated.slug,
          category: generated.category,
          description_ar: generated.description_ar,
          description_fr: generated.description_fr,
          originalPrice: generated.originalPrice,
          discountPrice: generated.discountPrice,
          isVisible: generated.isVisible,
          isNew: generated.isNew,
          isBestSeller: generated.isBestSeller,
          isSpecialOffer: generated.isSpecialOffer,
          colorName: generated.colorName,
          colorHex: generated.colorHex,
          sizeFrom: generated.sizeFrom,
          sizeTo: generated.sizeTo,
          defaultSizeStock: generated.defaultSizeStock,
          sizeStock: { ...generated.sizeStock },
        };
        renderAdminDashboard();
        showToast(
          getLang() === 'fr'
            ? '✨ Tous les champs du produit ont été générés et remplis !'
            : '✨ تم استخراج وتوليد وتجهيز جميع حقول المنتج بنجاح!'
        );
        break;
      }

      case 'generate-from-brief': {
        const briefInp = document.getElementById('adm-product-brief-input');
        const rawText =
          briefInp instanceof HTMLInputElement
            ? briefInp.value.trim()
            : adminState.draftProductBrief;
        adminState.draftProductBrief = rawText || 'صندل بيج بكعب أنيق ومريح للسهرات';
        const generated = generateProductFromBrief(adminState.draftProductBrief);
        adminState.draftGeneratedPreview = generated;
        adminState.draftProductImage = generated.image;
        adminState.draftProductForm = {
          name: generated.name,
          name_fr: generated.name_fr,
          slug: generated.slug,
          category: generated.category,
          description_ar: generated.description_ar,
          description_fr: generated.description_fr,
          originalPrice: generated.originalPrice,
          discountPrice: generated.discountPrice,
          isVisible: generated.isVisible,
          isNew: generated.isNew,
          isBestSeller: generated.isBestSeller,
          isSpecialOffer: generated.isSpecialOffer,
          colorName: generated.colorName,
          colorHex: generated.colorHex,
          sizeFrom: generated.sizeFrom,
          sizeTo: generated.sizeTo,
          defaultSizeStock: generated.defaultSizeStock,
          sizeStock: { ...generated.sizeStock },
        };
        renderAdminDashboard();
        showToast(
          getLang() === 'fr'
            ? '✨ Fiche produit complète générée avec succès !'
            : '✨ تم توليد وتعبئة جميع حقول المنتج تلقائياً بنجاح!'
        );
        break;
      }

      case 'copy-generated-spec': {
        const text = formatGeneratedProductSpec(adminState.draftGeneratedPreview);
        if (text && navigator.clipboard) {
          navigator.clipboard.writeText(text).catch(() => {});
        }
        showToast(
          getLang() === 'fr'
            ? '📋 Fiche produit copiée dans le presse-papiers !'
            : '📋 تم نسخ بطاقة المنتج المنسقة إلى الحافظة!'
        );
        break;
      }

      case 'apply-default-size-stock': {
        const df = adminState.draftProductForm;
        const fromInp = document.getElementById('adm-size-from');
        const toInp = document.getElementById('adm-size-to');
        const defInp = document.getElementById('adm-default-size-stock');
        const sFrom = fromInp instanceof HTMLInputElement ? Number(fromInp.value || 36) : df.sizeFrom;
        const sTo = toInp instanceof HTMLInputElement ? Number(toInp.value || 41) : df.sizeTo;
        const defQty = defInp instanceof HTMLInputElement ? Number(defInp.value || 5) : df.defaultSizeStock;

        df.sizeFrom = Math.min(sFrom, sTo);
        df.sizeTo = Math.max(sFrom, sTo);
        df.defaultSizeStock = Math.max(0, defQty);
        df.sizeStock = buildSizeStockRange(df.sizeFrom, df.sizeTo, df.defaultSizeStock);
        renderAdminDashboard();
        showToast(
          getLang() === 'fr'
            ? `Quantité (${df.defaultSizeStock} pcs) appliquée aux pointures ${df.sizeFrom}–${df.sizeTo}`
            : `تم تطبيق الكمية الافتراضية (${df.defaultSizeStock} قطع) على المقاسات من ${df.sizeFrom} إلى ${df.sizeTo}`
        );
        break;
      }

      case 'edit-product': {
        const prod = adminState.inventory.find((p) => p.id === id);
        if (prod) {
          adminState.editingProductId = id;
          adminState.isProductFormOpen = true;
          adminState.draftProductImage = prod.image;
          adminState.draftProductGallery = Array.isArray(prod.gallery)
            ? [...prod.gallery]
            : [prod.image];

          const szFrom = prod.sizeFrom || 36;
          const szTo = prod.sizeTo || 41;
          const defQty = prod.defaultSizeStock ?? 5;
          adminState.draftProductForm = {
            name: prod.name || '',
            name_fr: prod.name_fr || prod.name || '',
            slug: prod.slug || 'sandale-beige-talon',
            category: prod.category || 'Talons',
            description_ar: prod.description_ar || '',
            description_fr: prod.description_fr || '',
            originalPrice: prod.originalPrice || prod.price || 5800,
            discountPrice:
              prod.discountPrice && prod.discountPrice < (prod.originalPrice || prod.price)
                ? prod.discountPrice
                : prod.price,
            isVisible: prod.isVisible !== false,
            isNew: Boolean(prod.isNew ?? true),
            isBestSeller: Boolean(prod.isBestSeller ?? false),
            isSpecialOffer: Boolean(prod.isSpecialOffer ?? false),
            colorName: prod.colorName || (Array.isArray(prod.colors) && prod.colors[0]) || 'Beige',
            colorHex: prod.colorHex || '#D2B48C',
            sizeFrom: szFrom,
            sizeTo: szTo,
            defaultSizeStock: defQty,
            sizeStock:
              prod.sizeStock && Object.keys(prod.sizeStock).length > 0
                ? { ...prod.sizeStock }
                : buildSizeStockRange(szFrom, szTo, defQty),
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
        adminState.draftProductImage = IMAGES.talons;
        adminState.draftProductGallery = [];
        adminState.draftProductForm = {
          name: '',
          name_fr: '',
          slug: 'sandale-beige-talon',
          category: 'Sandales',
          description_ar: '',
          description_fr: '',
          originalPrice: 6200,
          discountPrice: 4790,
          isVisible: true,
          isNew: true,
          isBestSeller: false,
          isSpecialOffer: false,
          colorName: 'Beige',
          colorHex: '#D2B48C',
          sizeFrom: 36,
          sizeTo: 41,
          defaultSizeStock: 5,
          sizeStock: buildSizeStockRange(36, 41, 5),
        };
        renderAdminDashboard();
        break;
      }

      case 'remove-prod-gallery-img': {
        const idx = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(idx)) {
          adminState.draftProductGallery.splice(idx, 1);
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

    if (target instanceof HTMLInputElement && target.id === 'adm-product-brief-input') {
      adminState.draftProductBrief = target.value;
    }

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

    // تزامن حقول نموذج المنتج (الأقسام الـ 3) مع المسودة الحية
    if (target.closest('#adm-product-form')) {
      const df = adminState.draftProductForm;

      if (target instanceof HTMLInputElement && target.id === 'adm-color-picker') {
        df.colorHex = target.value;
        const hexText = document.getElementById('adm-color-hex-input');
        if (hexText instanceof HTMLInputElement) hexText.value = target.value;
      } else if (target instanceof HTMLInputElement && target.id === 'adm-color-hex-input') {
        df.colorHex = target.value;
        const picker = document.getElementById('adm-color-picker');
        if (picker instanceof HTMLInputElement && /^#[0-9A-Fa-f]{6}$/.test(target.value.trim())) {
          picker.value = target.value.trim();
        }
      } else if (target instanceof HTMLInputElement && target.hasAttribute('data-adm-size-qty')) {
        const sz = target.getAttribute('data-adm-size-qty');
        if (sz) {
          df.sizeStock[sz] = Math.max(0, Number(target.value || 0));
          const total = sumSizeStock(df.sizeStock);
          const badge = document.getElementById('adm-total-size-stock-badge');
          if (badge) {
            badge.textContent =
              getLang() === 'fr'
                ? `Stock total calculé : ${total} pcs`
                : `إجمالي المخزون المحسوب: ${total} قطعة`;
          }
          const hiddenTotal = document.getElementById('adm-calculated-stock-input');
          if (hiddenTotal instanceof HTMLInputElement) {
            hiddenTotal.value = String(total);
          }
        }
      } else if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        const fieldName = target.getAttribute('name');
        if (fieldName && fieldName in df) {
          if (
            fieldName === 'isVisible' ||
            fieldName === 'isNew' ||
            fieldName === 'isBestSeller' ||
            fieldName === 'isSpecialOffer'
          ) {
            df[fieldName] = target.value === 'yes';
          } else if (
            fieldName === 'originalPrice' ||
            fieldName === 'discountPrice' ||
            fieldName === 'defaultSizeStock'
          ) {
            df[fieldName] = target.value === '' ? '' : Number(target.value);
            if (fieldName === 'defaultSizeStock' && !adminState.showAdvancedProductFields) {
              df.sizeStock = buildSizeStockRange(df.sizeFrom, df.sizeTo, Number(target.value || 5));
            }
          } else {
            df[fieldName] = target.value;
            if (fieldName === 'colorName' && COLOR_SWATCHES[target.value]?.hex) {
              df.colorHex = COLOR_SWATCHES[target.value].hex;
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
          p.category.toLowerCase().includes(q)
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

  // رفع الصور من الجهاز + تغيير حالة الطلبات + تغيير نطاق المقاسات
  root.addEventListener('change', async (e) => {
    const target = e.target;

    if (
      target instanceof HTMLInputElement &&
      (target.id === 'adm-size-from' || target.id === 'adm-size-to')
    ) {
      const df = adminState.draftProductForm;
      const fromEl = document.getElementById('adm-size-from');
      const toEl = document.getElementById('adm-size-to');
      const sFrom = fromEl instanceof HTMLInputElement ? Number(fromEl.value || 36) : 36;
      const sTo = toEl instanceof HTMLInputElement ? Number(toEl.value || 41) : 41;
      df.sizeFrom = Math.max(34, Math.min(44, Math.min(sFrom, sTo)));
      df.sizeTo = Math.max(34, Math.min(44, Math.max(sFrom, sTo)));
      df.sizeStock = buildSizeStockRange(df.sizeFrom, df.sizeTo, df.defaultSizeStock, df.sizeStock);
      renderAdminDashboard();
      return;
    }

    if (target instanceof HTMLInputElement && target.type === 'file') {
      const files = Array.from(target.files || []);
      if (files.length === 0) return;

      try {
        if (target.id === 'adm-prod-file-input') {
          const dataUrl = await readAndCompressImageFile(files[0]);
          adminState.draftProductImage = dataUrl;
          const previewEl = document.getElementById('adm-prod-img-preview');
          if (previewEl instanceof HTMLImageElement) previewEl.src = dataUrl;
          showToast(t().toasts.photoUploaded);
        } else if (target.id === 'adm-prod-gallery-input') {
          for (const f of files) {
            const dataUrl = await readAndCompressImageFile(f);
            adminState.draftProductGallery.push(dataUrl);
          }
          renderAdminDashboard();
          showToast(t().toasts.galleryAdded(files.length));
        } else if (target.hasAttribute('data-adm-row-img-upload')) {
          const prodId = target.getAttribute('data-adm-row-img-upload');
          const dataUrl = await readAndCompressImageFile(files[0]);
          const prod = adminState.inventory.find((p) => p.id === prodId);
          if (prod) {
            prod.image = dataUrl;
            if (!Array.isArray(prod.gallery) || prod.gallery.length === 0) {
              prod.gallery = [dataUrl];
            } else {
              prod.gallery[0] = dataUrl;
            }
            adminState.saveAll();
            syncProductToSupabase(prod);
            const rowThumb = document.getElementById(`adm-row-thumb-${prodId}`);
            if (rowThumb instanceof HTMLImageElement) rowThumb.src = dataUrl;
            showToast(t().toasts.prodPhotoUpdated(getProdDisplayName(prod)));
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
            ? '⚡ Données du produit importées dans la Landing Page !'
            : '⚡ تم استيراد بيانات وصور الحذاء إلى صفحة الهبوط تلقائياً!'
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
          icon: String(fd.get(`featIcon_${idx}`) || '✨').trim(),
          title: String(fd.get(`featTitle_${idx}`) || '').trim(),
          desc: String(fd.get(`featDesc_${idx}`) || '').trim(),
        })),
      };
      adminState.saveAll();
      syncCmsToSupabase(adminState.cms, 0);
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
        showToast(getLang() === 'fr' ? '✅ Catégorie mise à jour !' : '✅ تم تحديث الفئة بنجاح!');
      } else {
        adminState.categories.push(catPayload);
        showToast(getLang() === 'fr' ? '✅ Nouvelle catégorie ajoutée !' : '✅ تمت إضافة الفئة الجديدة للمتجر!');
      }
      adminState.isCategoryFormOpen = false;
      adminState.saveAll();
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
      const uploadedImage = adminState.draftProductImage || IMAGES.talons;
      const uploadedGallery =
        adminState.draftProductGallery && adminState.draftProductGallery.length > 0
          ? [uploadedImage, ...adminState.draftProductGallery]
          : [uploadedImage];

      const nameAr = String(fd.get('name') || '').trim();
      const autoGenerated = generateProductFromBrief(nameAr);
      const nameFr = String(fd.get('name_fr') || autoGenerated.name_fr || nameAr).trim();
      const rawSlug = String(fd.get('slug') || autoGenerated.slug || 'sandale-beige-talon')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-|-$/g, '');
      const category = String(fd.get('category') || 'Talons');
      const descriptionAr = String(fd.get('description_ar') || autoGenerated.description_ar).trim();
      const descriptionFr = String(fd.get('description_fr') || autoGenerated.description_fr).trim();

      const rawDiscount = Number(fd.get('discountPrice') || 0);
      const rawOriginal = Number(fd.get('originalPrice') || 0);
      const finalPrice = rawDiscount > 0 ? rawDiscount : rawOriginal > 0 ? rawOriginal : 4990;
      const originalPrice = rawOriginal > finalPrice ? rawOriginal : Math.round(finalPrice * 1.25);
      const discountPercent = Math.max(
        5,
        Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      );

      const isVisible = fd.get('isVisible') !== 'no';
      const isNew = fd.get('isNew') !== 'no';
      const isBestSeller = fd.get('isBestSeller') === 'yes';
      const isSpecialOffer = fd.get('isSpecialOffer') === 'yes';

      const colorName = String(fd.get('colorName') || 'Beige').trim();
      const colorHex = String(
        fd.get('colorHex') || COLOR_SWATCHES[colorName]?.hex || '#D2B48C'
      ).trim();

      if (!COLOR_SWATCHES[colorName]) {
        COLOR_SWATCHES[colorName] = {
          hex: colorHex,
          label_ar: colorName,
          label_fr: colorName,
        };
      }

      const sFrom = Math.min(
        Number(fd.get('sizeFrom') || 36),
        Number(fd.get('sizeTo') || 41)
      );
      const sTo = Math.max(
        Number(fd.get('sizeFrom') || 36),
        Number(fd.get('sizeTo') || 41)
      );
      const defaultSizeStock = Math.max(0, Number(fd.get('defaultSizeStock') || 5));

      const sizeStock = {};
      const sizes = [];
      for (let sz = sFrom; sz <= sTo; sz++) {
        const qtyVal = fd.get(`size_qty_${sz}`);
        const qty = qtyVal !== null ? Math.max(0, Number(qtyVal)) : defaultSizeStock;
        sizeStock[sz] = qty;
        sizes.push(sz);
      }
      const totalStock = sumSizeStock(sizeStock);

      const payload = {
        id: adminState.editingProductId || 'ss-' + Date.now().toString().slice(-3),
        slug: rawSlug || 'sandale-beige-talon',
        name: nameAr,
        name_fr: nameFr,
        category,
        description_ar: descriptionAr,
        description_fr: descriptionFr,
        price: finalPrice,
        originalPrice,
        discountPrice: finalPrice,
        discountPercent,
        isVisible,
        isNew,
        isBestSeller,
        isSpecialOffer,
        colorName,
        colorHex,
        colors: [colorName],
        sizeFrom: sFrom,
        sizeTo: sTo,
        defaultSizeStock,
        sizes,
        sizeStock,
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
      adminState.draftProductGallery = [];
      adminState.draftGeneratedPreview = payload;
      adminState.saveAll();
      syncProductToSupabase(payload);
      renderAdminDashboard();
    } else if (form.id === 'adm-add-wilaya-form') {
      const code = String(fd.get('code') || '').trim();
      const name = String(fd.get('name') || '').trim();
      const homeFee = Number(fd.get('homeFee') || 500);
      const deskFee = Number(fd.get('deskFee') || 350);
      if (code && name) {
        const newRate = { code, name, name_fr: name, homeFee, deskFee };
        adminState.shipping.rates.push(newRate);
        adminState.saveAll();
        syncShippingRateToSupabase(newRate);
        renderAdminDashboard();
        showToast(t().toasts.wilayaAdded(name));
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
}

export function openAdminDashboard() {
  window.location.href = './admin.html';
}

export function closeAdminDashboard() {
  window.location.href = './index.html';
}
