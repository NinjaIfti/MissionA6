const API_BASE = 'https://fakestoreapi.com';

const categoryLabel = (slug) => {
  const map = {
    electronics: "Electronics",
    jewelery: "Jewelry",
    "men's clothing": "Men's Clothing",
    "women's clothing": "Women's Clothing",
  };
  return map[slug] || slug;
};

const categoryTagClass = (slug) => {
  const map = {
    electronics: 'category-tag-electronics',
    jewelery: 'category-tag-jewelery',
    "men's clothing": 'category-tag-mens',
    "women's clothing": 'category-tag-womens',
  };
  return map[slug] || 'bg-slate-200 text-slate-700';
};

const stars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  let html = '';
  for (let i = 0; i < full; i++) html += '<span class="text-amber-400">★</span>';
  if (half) html += '<span class="text-amber-400">★</span>';
  for (let i = 0; i < empty; i++) html += '<span class="text-slate-300">★</span>';
  return html;
};

let cart = JSON.parse(localStorage.getItem('swiftcart_cart') || '[]');

function updateCartCount() {
  const total = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const el = document.getElementById('cart-count');
  el.textContent = total;
  if (total > 0) el.classList.remove('hidden');
  else el.classList.add('hidden');
  localStorage.setItem('swiftcart_cart', JSON.stringify(cart));
}

function addToCart(product, qty = 1) {
  const existing = cart.find((p) => p.id === product.id);
  if (existing) existing.qty = (existing.qty || 1) + qty;
  else cart.push({ ...product, qty });
  updateCartCount();
}

function productCard(product) {
  const slug = product.category;
  const tagClass = categoryTagClass(slug);
  const label = categoryLabel(slug);
  const rating = product.rating?.rate ?? 0;
  const count = product.rating?.count ?? 0;
  const title = product.title.length > 40 ? product.title.slice(0, 40) + '...' : product.title;
  return `
    <article class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100 flex flex-col">
      <div class="relative aspect-square bg-slate-100">
        <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain p-2" loading="lazy">
        <span class="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${tagClass}">${label}</span>
      </div>
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="font-medium text-slate-800 text-sm leading-snug">${title}</h3>
        <p class="mt-1 text-amber-500 text-sm">${stars(rating)} <span class="text-slate-500">${rating.toFixed(1)} (${count})</span></p>
        <p class="mt-2 text-lg font-bold text-slate-800">$${product.price}</p>
        <div class="mt-4 flex gap-2">
          <button type="button" class="details-btn flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1" data-id="${product.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
            Details
          </button>
          <button type="button" class="add-btn flex-1 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 flex items-center justify-center gap-1" data-id="${product.id}">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            Add
          </button>
        </div>
      </div>
    </article>
  `;
}

function trendingCard(product) {
  const slug = product.category;
  const tagClass = categoryTagClass(slug);
  const label = categoryLabel(slug);
  const title = product.title.length > 35 ? product.title.slice(0, 35) + '...' : product.title;
  const rating = product.rating?.rate ?? 0;
  return `
    <article class="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div class="relative aspect-square bg-slate-100">
        <img src="${product.image}" alt="${product.title}" class="w-full h-full object-contain p-2" loading="lazy">
        <span class="absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium ${tagClass}">${label}</span>
      </div>
      <div class="p-4">
        <h3 class="font-medium text-slate-800 text-sm">${title}</h3>
        <p class="mt-1 text-amber-500 text-sm">${stars(rating)} ${rating.toFixed(1)}</p>
        <p class="mt-2 text-lg font-bold text-slate-800">$${product.price}</p>
        <a href="#products" class="mt-3 inline-block px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-indigo-600">View all</a>
      </div>
    </article>
  `;
}

async function loadCategories() {
  const res = await fetch(`${API_BASE}/products/categories`);
  const list = await res.json();
  const container = document.getElementById('category-filters');
  list.forEach((slug) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'category-btn px-5 py-2 rounded-full font-medium bg-slate-200 text-slate-700 hover:bg-slate-300';
    btn.dataset.category = slug;
    btn.textContent = categoryLabel(slug);
    container.appendChild(btn);
  });
}

async function loadProducts(category = 'all') {
  const grid = document.getElementById('products-grid');
  const loading = document.getElementById('products-loading');
  grid.innerHTML = '';
  loading.classList.remove('hidden');
  const url = category === 'all' ? `${API_BASE}/products` : `${API_BASE}/products/category/${category}`;
  const res = await fetch(url);
  const products = await res.json();
  loading.classList.add('hidden');
  grid.innerHTML = products.map((p) => productCard(p)).join('');
  bindProductButtons();
  document.querySelectorAll('.category-btn').forEach((btn) => {
    btn.classList.remove('bg-primary', 'text-white');
    btn.classList.add('bg-slate-200', 'text-slate-700');
    if (btn.dataset.category === category) {
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('bg-slate-200', 'text-slate-700');
    }
  });
}

async function loadTrending() {
  const res = await fetch(`${API_BASE}/products`);
  const products = await res.json();
  const top = [...products].sort((a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0)).slice(0, 3);
  const container = document.getElementById('trending-grid');
  container.innerHTML = top.map((p) => trendingCard(p)).join('');
}

function bindProductButtons() {
  document.querySelectorAll('.details-btn').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.id));
  });
  document.querySelectorAll('.add-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      fetch(`${API_BASE}/products/${id}`)
        .then((r) => r.json())
        .then((product) => {
          addToCart(product);
        });
    });
  });
}

async function openModal(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const product = await res.json();
  const rating = product.rating?.rate ?? 0;
  const modal = document.getElementById('product-modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <img src="${product.image}" alt="${product.title}" class="w-full max-h-64 object-contain bg-slate-100 rounded-lg mb-4">
    <h3 class="text-xl font-bold text-slate-800">${product.title}</h3>
    <p class="mt-2 text-slate-600 text-sm">${product.description}</p>
    <p class="mt-3 text-amber-500">${stars(rating)} ${rating.toFixed(1)} (${product.rating?.count ?? 0} reviews)</p>
    <p class="mt-2 text-2xl font-bold text-slate-800">$${product.price}</p>
    <div class="mt-6 flex gap-3">
      <button type="button" class="modal-add flex-1 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-indigo-600" data-id="${product.id}">Add to Cart</button>
      <button type="button" class="modal-buy flex-1 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white">Buy Now</button>
    </div>
  `;
  body.querySelector('.modal-add').addEventListener('click', () => {
    addToCart(product);
    closeModal();
  });
  body.querySelector('.modal-buy').addEventListener('click', () => {
    addToCart(product);
    closeModal();
  });
  modal.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('product-modal').classList.add('hidden');
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);

document.getElementById('category-filters').addEventListener('click', (e) => {
  const btn = e.target.closest('.category-btn');
  if (!btn) return;
  loadProducts(btn.dataset.category);
});

document.getElementById('newsletter-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.querySelector('input[type="email"]').value;
  if (email) alert('Thanks for subscribing with: ' + email);
});

document.getElementById('mobile-menu-btn').addEventListener('click', () => {
  document.getElementById('nav-menu').classList.toggle('mobile-open');
});

(async function init() {
  updateCartCount();
  await loadCategories();
  await loadProducts('all');
  await loadTrending();
})();
