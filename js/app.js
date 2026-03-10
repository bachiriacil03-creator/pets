/**
 * Pet's Corner - Main Application Logic
 * Handles product loading, filtering, search, pagination, animations
 *
 * FIXES:
 * 1. IntersectionObserver now called AFTER products rendered (not at DOMContentLoaded)
 * 2. Inline fallback data used when fetch fails (e.g. file:// protocol)
 */

'use strict';

// ===== Constants =====
const PRODUCTS_PER_PAGE = 20;
const NEW_DAYS_THRESHOLD = 10;

// ===== Inline fallback data (used when fetch fails / file:// protocol) =====
const PRODUCTS_FALLBACK = [
  { id:"p001", image:"https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80", name:"قطة فارسية أصيلة", price:15000, promotion_price:12000, description:"قطة فارسية من سلالة أصيلة، عمرها 3 أشهر، ملقحة وبصحة ممتازة.", date:"2025-05-25", animal:"cat", branch:"animals" },
  { id:"p002", image:"https://images.unsplash.com/photo-1533743983669-94fa5c4338ec?w=600&q=80", name:"كلب هاسكي سيبيري", price:25000, promotion_price:"", description:"كلب هاسكي سيبيري بالغ عمره 4 أشهر، أزرق العيون، صحة ممتازة.", date:"2025-05-10", animal:"dog", branch:"animals" },
  { id:"p003", image:"https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80", name:"ببغاء أفريقي رمادي", price:35000, promotion_price:30000, description:"ببغاء أفريقي رمادي يتكلم ويحاكي الأصوات. عمره سنة ونصف.", date:"2025-04-20", animal:"bird", branch:"animals" },
  { id:"p004", image:"https://images.unsplash.com/photo-1520302630591-fd1f1b0f9b19?w=600&q=80", name:"سمك ذهبي زينة", price:500, promotion_price:"", description:"سمك ذهبي للزينة، متعدد الألوان، مناسب للحوض المنزلي.", date:"2025-05-28", animal:"fish", branch:"animals" },
  { id:"p005", image:"https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80", name:"أرنب قزم هولندي", price:3500, promotion_price:3000, description:"أرنب قزم هولندي صغير الحجم ومحبوب جداً.", date:"2025-05-20", animal:"rabbit", branch:"animals" },
  { id:"p006", image:"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&q=80", name:"طعام كلاب رويال كانين", price:3200, promotion_price:2800, description:"علف عالي الجودة للكلاب من رويال كانين.", date:"2025-04-15", animal:"dog", branch:"food" },
  { id:"p007", image:"https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&q=80", name:"طعام قطط ويسكاس", price:850, promotion_price:"", description:"علف ويسكاس الشهير للقطط بنكهة السمك والدجاج.", date:"2025-05-01", animal:"cat", branch:"food" },
  { id:"p008", image:"https://images.unsplash.com/photo-1489466280716-9408d4ad0e78?w=600&q=80", name:"طعام الطيور المتنوع", price:600, promotion_price:500, description:"خليط متوازن من البذور والحبوب. عبوة 2 كيلوغرام.", date:"2025-03-10", animal:"bird", branch:"food" },
  { id:"p009", image:"https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=600&q=80", name:"طعام أسماك تيترامين", price:750, promotion_price:"", description:"رقائق متوازنة غنية بالبروتينات والفيتامينات لأسماك الزينة.", date:"2025-05-22", animal:"fish", branch:"food" },
  { id:"p010", image:"https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&q=80", name:"طوق مزخرف للقطط", price:450, promotion_price:350, description:"طوق أنيق للقطط من الجلد الطبيعي مع جرس صغير.", date:"2025-05-26", animal:"cat", branch:"accessories" },
  { id:"p011", image:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80", name:"مقود وحزام للكلاب", price:1200, promotion_price:"", description:"مقود متين وحزام قابل للتعديل من النايلون المتين.", date:"2025-05-03", animal:"dog", branch:"accessories" },
  { id:"p012", image:"https://images.unsplash.com/photo-1548199268-20b2948cf6ee?w=600&q=80", name:"قفص طيور فاخر", price:4500, promotion_price:4000, description:"قفص معدني فاخر مزود بمغذيات وأعشاب ومتنقل بعجلات.", date:"2025-04-08", animal:"bird", branch:"accessories" },
  { id:"p013", image:"https://images.unsplash.com/photo-1534361960057-19f4434a5fef?w=600&q=80", name:"سرير قطط فاخر", price:1800, promotion_price:1500, description:"سرير دافئ من القطيفة عالية الجودة قابل للغسيل.", date:"2025-05-27", animal:"cat", branch:"accessories" },
  { id:"p014", image:"https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=600&q=80", name:"لعبة عصا وريشة للقطط", price:350, promotion_price:"", description:"لعبة تفاعلية تحفز غريزة الصيد عند القطط.", date:"2025-03-20", animal:"cat", branch:"accessories" },
  { id:"p015", image:"https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=600&q=80", name:"حوض أسماك زجاجي", price:5500, promotion_price:5000, description:"حوض سعة 60 لتر مع مضخة وفلتر وإضاءة LED.", date:"2025-05-15", animal:"fish", branch:"accessories" },
  { id:"p016", image:"https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&q=80", name:"كلب ألماني نبيل", price:30000, promotion_price:"", description:"كلب ألماني أصيل عمره 5 أشهر، مدرب على الأوامر.", date:"2025-05-05", animal:"dog", branch:"animals" },
  { id:"p017", image:"https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&q=80", name:"حمام الزينة الروماني", price:2500, promotion_price:2000, description:"طائر حمام روماني فاخر أبيض اللون.", date:"2025-05-18", animal:"bird", branch:"animals" },
  { id:"p018", image:"https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&q=80", name:"أرنب عنكوري فلافي", price:4500, promotion_price:"", description:"أرنب بشعر طويل وناعم كالحرير.", date:"2025-04-25", animal:"rabbit", branch:"animals" },
  { id:"p019", image:"https://images.unsplash.com/photo-1519052537078-e6302a4968d4?w=600&q=80", name:"علف قطط رويال كانين فيلين", price:2200, promotion_price:1900, description:"علف مخصص للقطط البالغة، غني بالبروتينات.", date:"2025-04-10", animal:"cat", branch:"food" },
  { id:"p020", image:"https://images.unsplash.com/photo-1512237798647-84b57b22b517?w=600&q=80", name:"شامبو كلاب بالألوة", price:950, promotion_price:"", description:"شامبو طبيعي يرطب الشعر ويقضي على البراغيث.", date:"2025-05-29", animal:"dog", branch:"accessories" }
];

// ===== State =====
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let activeAnimal = null;
let activeBranch = null;

// ===== DOM Ready =====
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initNavbar();
  loadProducts();  // async — renders cards when done
  initScrollTop();
  // NOTE: initIntersectionObserver is intentionally NOT called here.
  // observeProductCards() is called inside renderProducts() instead,
  // so it always runs AFTER the cards exist in the DOM.
});

// ===== Page Loader =====
function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      document.getElementById('page-loader')?.classList.add('hidden');
    }, 500);
  });
}

// ===== Navbar =====
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  if (searchInput) {
    let searchTimer;
    searchInput.addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => handleSearch(e.target.value.trim()), 200);
    });
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) searchResults.classList.add('show');
    });
    document.addEventListener('click', e => {
      if (!e.target.closest('.nav-search')) searchResults.classList.remove('show');
    });
  }

  const searchToggle = document.getElementById('search-toggle');
  const navSearch = document.querySelector('.nav-search');
  if (searchToggle && navSearch) {
    searchToggle.addEventListener('click', () => {
      navSearch.classList.toggle('mobile-show');
      if (navSearch.classList.contains('mobile-show')) navSearch.querySelector('input').focus();
    });
  }

  document.getElementById('contact-btn')?.addEventListener('click', () => {
    document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('cart-btn')?.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  Cart.updateCartUI();
}

// ===== Search =====
function handleSearch(query) {
  const searchResults = document.getElementById('search-results');
  if (!query) { searchResults.classList.remove('show'); return; }
  const q = query.toLowerCase();
  const results = allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.animal.toLowerCase().includes(q) ||
    p.branch.toLowerCase().includes(q)
  ).slice(0, 6);

  searchResults.innerHTML = results.length === 0
    ? '<p class="search-empty">لا توجد نتائج</p>'
    : results.map(p => `
        <div class="search-result-item" onclick="goToProduct('${p.id}')">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <div class="search-result-info">
            <div class="name">${p.name}</div>
            <div class="price">${formatPrice(p.promotion_price || p.price)} دج</div>
          </div>
        </div>`).join('');

  searchResults.classList.add('show');
}

function goToProduct(id) {
  window.location.href = `product.html?id=${id}`;
}

// ===== Load Products — with fallback =====
async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allProducts = await res.json();
  } catch (err) {
    // fetch failed (file:// protocol, CORS, or missing file) — use inline data
    console.warn('Using inline product fallback:', err.message);
    allProducts = PRODUCTS_FALLBACK;
  }

  filteredProducts = [...allProducts];
  updateBranchCounts();
  renderProducts();
  renderPagination();
  initHeroAnimals();
  initBranchFilter();
}

// ===== Helpers =====
function isNew(dateStr) {
  if (!dateStr) return false;
  const diff = (Date.now() - new Date(dateStr).getTime()) / 86400000;
  return diff >= 0 && diff <= NEW_DAYS_THRESHOLD;
}

function hasDiscount(p) {
  const promo = Number(p.promotion_price);
  return p.promotion_price !== '' && p.promotion_price != null && promo > 0 && promo < Number(p.price);
}

function formatPrice(n) {
  return Number(n).toLocaleString('ar-DZ');
}

function calcDiscount(orig, promo) {
  return Math.round(((orig - promo) / orig) * 100);
}

// ===== Render Products =====
function renderProducts() {
  const grid = document.getElementById('products-grid');
  const resultsCount = document.getElementById('results-count');
  if (!grid) return;

  const start = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const page = filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);

  if (resultsCount) resultsCount.textContent = `${filteredProducts.length} منتج`;

  if (page.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="material-icons" style="font-size:64px;color:var(--gray-light)">sentiment_dissatisfied</span>
        <p>لا توجد منتجات في هذه الفئة</p>
      </div>`;
    return;
  }

  grid.innerHTML = page.map((p, i) => createProductCard(p, i)).join('');

  // *** FIX: lazy load and animation observer run AFTER cards are in DOM ***
  initLazyLoad();
  observeProductCards();
}

// ===== FIX: Observe cards AFTER they are injected into the DOM =====
function observeProductCards() {
  const cards = document.querySelectorAll('.product-card.fade-in-up');

  if (!('IntersectionObserver' in window)) {
    cards.forEach(c => c.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  cards.forEach(card => observer.observe(card));
}

function createProductCard(product, idx) {
  const discount = hasDiscount(product);
  const fresh = isNew(product.date);

  let labelHtml = '';
  if (discount) {
    labelHtml = `<span class="card-label label-discount">
      <span class="material-icons" style="font-size:13px;vertical-align:middle">local_offer</span>
      خصم ${calcDiscount(product.price, product.promotion_price)}%
    </span>`;
  } else if (fresh) {
    labelHtml = `<span class="card-label label-new">
      <span class="material-icons" style="font-size:13px;vertical-align:middle">fiber_new</span>
      جديد
    </span>`;
  }

  const priceHtml = discount
    ? `<span class="price-original">${formatPrice(product.price)} دج</span>
       <span class="price-current discounted">${formatPrice(product.promotion_price)} دج</span>`
    : `<span class="price-current">${formatPrice(product.price)} دج</span>`;

  const branchLabels = { animals:'حيوانات', food:'غذاء', accessories:'إكسسوارات' };
  const animalLabels = { cat:'قطط', dog:'كلاب', bird:'طيور', fish:'أسماك', rabbit:'أرانب', hamster:'هامستر' };
  const inCart = Cart.has(product.id);

  return `
    <div class="product-card fade-in-up" style="transition-delay:${Math.min(idx,8)*0.06}s" data-id="${product.id}" role="listitem">
      <div class="card-img-wrapper">
        <img data-src="${product.image}"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23f0f0f0' width='400' height='300'/%3E%3C/svg%3E"
          alt="${product.name}" class="lazy">
        ${labelHtml}
        <button class="card-wishlist" onclick="toggleWishlist(event,'${product.id}')" aria-label="أضف للمفضلة">
          <span class="material-icons">favorite_border</span>
        </button>
      </div>
      <div class="card-body">
        <div class="card-branch">${branchLabels[product.branch]||product.branch} &bull; ${animalLabels[product.animal]||product.animal}</div>
        <h3 class="card-name">${product.name}</h3>
        <div class="card-price">${priceHtml}</div>
      </div>
      <div class="card-actions">
        <button class="btn-add-cart ${inCart?'added':''}"
          onclick="addToCart('${product.id}')"
          id="cart-btn-${product.id}"
          aria-label="أضف إلى السلة">
          <span class="material-icons" style="font-size:18px">${inCart?'check':'shopping_cart'}</span>
          ${inCart?'في السلة':'أضف للسلة'}
        </button>
        <button class="btn-details" onclick="goToProduct('${product.id}')" aria-label="تفاصيل المنتج">
          <span class="material-icons">visibility</span>
        </button>
      </div>
    </div>`;
}

// ===== Cart Actions =====
function addToCart(productId) {
  const product = allProducts.find(p => p.id === productId);
  if (!product) return;
  Cart.add(product);
  const btn = document.getElementById(`cart-btn-${productId}`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = '<span class="material-icons" style="font-size:18px">check</span> في السلة';
  }
  showToast('تمت إضافة المنتج إلى السلة', 'success');
}

function toggleWishlist(e, productId) {
  e.stopPropagation();
  const btn = e.currentTarget;
  const icon = btn.querySelector('.material-icons');
  btn.classList.toggle('active');
  icon.textContent = btn.classList.contains('active') ? 'favorite' : 'favorite_border';
}

// ===== Filtering =====
function applyFilters() {
  currentPage = 1;
  filteredProducts = allProducts.filter(p =>
    (!activeAnimal || p.animal === activeAnimal) &&
    (!activeBranch || p.branch === activeBranch)
  );
  renderProducts();
  renderPagination();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Branch Filter =====
function initBranchFilter() {
  document.querySelectorAll('.branch-box').forEach(box => {
    box.addEventListener('click', () => {
      const branch = box.dataset.branch;
      document.querySelectorAll('.branch-box').forEach(b => b.classList.remove('active'));
      activeBranch = (activeBranch === branch) ? null : branch;
      if (activeBranch) box.classList.add('active');
      document.querySelectorAll('.filter-chip[data-branch]').forEach(chip =>
        chip.classList.toggle('active', chip.dataset.branch === activeBranch)
      );
      applyFilters();
    });
  });

  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const branch = chip.dataset.branch;
      if (branch === 'all') {
        activeBranch = null;
        activeAnimal = null;
        document.querySelectorAll('.animal-btn, .branch-box').forEach(b => b.classList.remove('active'));
      } else {
        activeBranch = branch;
        document.querySelectorAll('.branch-box').forEach(b =>
          b.classList.toggle('active', b.dataset.branch === branch)
        );
      }
      applyFilters();
    });
  });
}

// ===== Animals Hero Buttons =====
function initHeroAnimals() {
  const animals = [
    { id:'cat',     name:'قطط',    img:'./assets/cat.webp' },
    { id:'dog',     name:'كلاب',   img:'./assets/dog.webp' },
    { id:'bird',    name:'طيور',   img:'./assets/bird.webp' },
    { id:'fish',    name:'أسماك',  img:'./assets/fish.webp' },
    { id:'rabbit',  name:'أرانب',  img:'./assets/rab.webp' },
    { id:'hamster', name:'هامستر', img:'./assets/hamster.webp' },
  ];
  const track = document.getElementById('animals-track');
  if (!track) return;

  track.innerHTML = animals.map(a => `
    <button class="animal-btn" data-animal="${a.id}" aria-label="تصفية ${a.name}">
      <img src="${a.img}" alt="${a.name}" loading="lazy">
      <span>${a.name}</span>
    </button>`).join('');

  track.querySelectorAll('.animal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const animal = btn.dataset.animal;
      track.querySelectorAll('.animal-btn').forEach(b => b.classList.remove('active'));
      activeAnimal = (activeAnimal === animal) ? null : animal;
      if (activeAnimal) btn.classList.add('active');
      applyFilters();
    });
  });
}

// ===== Branch Counts =====
function updateBranchCounts() {
  const counts = { animals:0, food:0, accessories:0 };
  allProducts.forEach(p => { if (counts[p.branch] !== undefined) counts[p.branch]++; });
  document.querySelectorAll('.branch-box').forEach(box => {
    const el = box.querySelector('.branch-count');
    if (el) el.textContent = `${counts[box.dataset.branch]||0} منتج`;
  });
}

// ===== Pagination =====
function renderPagination() {
  const container = document.getElementById('pagination');
  if (!container) return;
  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  const range = getPageRange(currentPage, totalPages);
  let html = `<button class="page-btn" onclick="goToPage(${currentPage-1})" ${currentPage===1?'disabled':''}>
    <span class="material-icons">chevron_right</span></button>`;

  range.forEach(p => {
    html += p === '...'
      ? `<span style="padding:0 6px;color:var(--text-muted);line-height:44px">…</span>`
      : `<button class="page-btn ${p===currentPage?'active':''}" onclick="goToPage(${p})">${p}</button>`;
  });

  html += `<button class="page-btn" onclick="goToPage(${currentPage+1})" ${currentPage===totalPages?'disabled':''}>
    <span class="material-icons">chevron_left</span></button>`;

  container.innerHTML = html;
}

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current-1); i <= Math.min(total-1, current+1); i++) pages.push(i);
  if (current < total-2) pages.push('...');
  pages.push(total);
  return pages;
}

function goToPage(page) {
  const total = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  if (page < 1 || page > total) return;
  currentPage = page;
  renderProducts();
  renderPagination();
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== Lazy Load Images =====
function initLazyLoad() {
  const imgs = document.querySelectorAll('img.lazy[data-src]');
  if (!imgs.length) return;

  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
          o.unobserve(img);
        }
      });
    }, { rootMargin: '300px' });
    imgs.forEach(img => obs.observe(img));
  } else {
    imgs.forEach(img => { img.src = img.dataset.src; img.classList.remove('lazy'); });
  }
}

// ===== Toast =====
function showToast(msg, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Scroll To Top =====
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ===== Expose globals =====
window.showToast    = showToast;
window.addToCart    = addToCart;
window.goToProduct  = goToProduct;
window.goToPage     = goToPage;
window.toggleWishlist = toggleWishlist;
