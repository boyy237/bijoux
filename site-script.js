 // ========================= BIJOUX PRO - SITE WEB JS =========================

class BijouxStore {
  constructor() {
    this.cart = this.loadCart();
    this.products = [];
    this.init();
  }

  init() {
    this.loadProducts();
    this.setupEventListeners();
    this.updateCartUI();
  }

  loadProducts() {
    fetch('products.json')
      .then(res => res.json())
      .then(data => {
        this.products = data.products;
        this.renderProducts();
      })
      .catch(err => console.error('Erreur de chargement des produits:', err));
  }

  setupEventListeners() {
    // Search
    const searchInput = document.querySelector('[data-search]');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.search(e.target.value));
    }

    // Filter
    const categoryFilter = document.querySelector('[data-category]');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.applyFilters());
    }

    const priceFilter = document.querySelector('[data-price]');
    if (priceFilter) {
      priceFilter.addEventListener('change', () => this.applyFilters());
    }

    // Cart toggle
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
      cartIcon.addEventListener('click', () => this.toggleCart());
    }

    // Checkout
    const checkoutBtn = document.querySelector('[data-checkout]');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => this.checkout());
    }

    // Remove from cart
    document.querySelectorAll('[data-remove-item]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.removeFromCart(e.target.dataset.removeItem);
      });
    });

    // Quantity change
    document.querySelectorAll('[data-quantity]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.quantity;
        const id = e.target.closest('[data-cart-item]').dataset.cartItem;
        this.updateQuantity(id, action);
      });
    });
  }

  renderProducts(productsToRender = this.products) {
    const grid = document.querySelector('.products-grid');
    if (!grid) return;

    grid.innerHTML = productsToRender
      .map(product => `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" />
            ${!product.inStock ? '<div class="product-badge">Rupture</div>' : ''}
          </div>
          <div class="product-info">
            <span class="product-category">${product.category}</span>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-specs">
            </div>
            <div class="product-footer">
              <span class="product-price">${product.price.toLocaleString('fr-FR')} fcfa</span>
              <button class="btn-add-to-cart" data-add-to-cart="${product.id}" 
                ${product.inStock ? '' : 'disabled'}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      `)
      .join('');

    // Add event listeners to buttons
    grid.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = parseInt(e.target.dataset.addToCart);
        this.addToCart(productId);
      });
    });
  }

  addToCart(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = this.cart.find(item => item.id === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({ ...product, quantity: 1 });
    }

    this.saveCart();
    this.updateCartUI();
    this.showNotification(`${product.name} ajouté au panier!`);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== parseInt(productId));
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(productId, action) {
    const item = this.cart.find(item => item.id === parseInt(productId));
    if (!item) return;

    if (action === 'increase') {
      item.quantity += 1;
    } else if (action === 'decrease' && item.quantity > 1) {
      item.quantity -= 1;
    } else if (action === 'decrease' && item.quantity === 1) {
      this.removeFromCart(productId);
      return;
    }

    this.saveCart();
    this.updateCartUI();
  }

  updateCartUI() {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      const total = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = total;
      cartCount.style.display = total > 0 ? 'grid' : 'none';
    }

    // Render cart items if on cart page
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
      this.renderCartItems();
    }
  }

  renderCartItems() {
    const container = document.querySelector('.cart-items');
    if (!container) return;

    if (this.cart.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: #999;">Votre panier est vide</p>';
      return;
    }

    container.innerHTML = this.cart
      .map(item => `
        <div class="cart-item" data-cart-item="${item.id}">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" />
          </div>
          <div class="cart-item-details">
            <h3>${item.name}</h3>
            <p><strong>Matière:</strong> ${item.material}</p>
            <p><strong>Pierre:</strong> ${item.stone}</p>
            <p><strong>Prix unitaire:</strong> ${item.price} €</p>
          </div>
          <div class="cart-item-actions">
            <div class="quantity-selector">
              <button data-quantity="decrease">−</button>
              <span>${item.quantity}</span>
              <button data-quantity="increase">+</button>
            </div>
            <div class="cart-item-price">${(item.price * item.quantity).toLocaleString('fr-FR')} €</div>
            <button data-remove-item="${item.id}" style="color: var(--danger);">✕</button>
          </div>
        </div>
      `)
      .join('');

    this.setupEventListeners();
    this.updateCartSummary();
  }

  updateCartSummary() {
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxes = subtotal * 0.20;
    const total = subtotal + taxes;

    const summaryContainer = document.querySelector('.cart-summary');
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <h3>Résumé</h3>
        <div class="summary-row">
          <span>Sous-total:</span>
          <span>${subtotal.toLocaleString('fr-FR')} €</span>
        </div>
        <div class="summary-row">
          <span>Taxes (20%):</span>
          <span>${taxes.toLocaleString('fr-FR')} €</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>${total.toLocaleString('fr-FR')} €</span>
        </div>
        <button class="btn-checkout" data-checkout>Passer la commande</button>
      `;

      const checkoutBtn = summaryContainer.querySelector('[data-checkout]');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => this.checkout());
      }
    }
  }

  search(query) {
    const filtered = this.products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    this.renderProducts(filtered);
  }

  applyFilters() {
    let filtered = [...this.products];

    const categoryFilter = document.querySelector('[data-category]');
    if (categoryFilter && categoryFilter.value) {
      filtered = filtered.filter(p => p.category === categoryFilter.value);
    }

    const priceFilter = document.querySelector('[data-price]');
    if (priceFilter && priceFilter.value) {
      const max = parseInt(priceFilter.value);
      filtered = filtered.filter(p => p.price <= max);
    }

    this.renderProducts(filtered);
  }

  checkout() {
    if (this.cart.length === 0) {
      alert('Votre panier est vide!');
      return;
    }

    const isClientLogged = sessionStorage.getItem('clientLogged');
    const clientId = isClientLogged ? sessionStorage.getItem('clientId') : null;
    const clientEmail = isClientLogged ? sessionStorage.getItem('clientEmail') : 'Client anonyme';

    const reservation = {
      id: Date.now(),
      clientId: clientId,
      clientEmail: clientEmail,
      items: this.cart,
      total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'En attente'
    };

    // Save to localStorage
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    reservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(reservations));

    // Clear cart
    this.cart = [];
    this.saveCart();
    this.updateCartUI();

    this.showNotification('Réservation confirmée! Numéro: ' + reservation.id);
    setTimeout(() => {
      if (isClientLogged) {
        window.location.href = 'client-profile.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 2000);
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  loadCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
  }

  toggleCart() {
    // Could be implemented for cart preview
    console.log('Cart toggled');
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--success);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
      z-index: 2000;
      animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Initialize store
let store;
document.addEventListener('DOMContentLoaded', () => {
  store = new BijouxStore();

  // Login for admin
  const loginBtn = document.querySelector('.btn-login');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      // Redirect to admin dashboard
      window.location.href = 'bijoux.html';
    });
  }

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const expanded = navMenu.classList.contains('active');
      navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    document.addEventListener('click', (event) => {
      if (!event.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1024) {
        navMenu.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Add styles for animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});
