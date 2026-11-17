/**
 * Member 4: Integration and App Glue
 * File: main.js
 * Responsibilities:
 * - Application lifecycle orchestration and view router
 * - Navigation between Products, Cart, Checkout, and Summary screens
 * - localStorage persistence for shopping cart across page reloads
 * - localStorage persistence for the most recent order
 * - Integrates ProductsModule, Cart, CartUI, CheckoutModule, and SummaryModule
 * - Toast notifications for user actions
 */

// ==========================================================================
// 1. APPLICATION ORCHESTRATOR
// ==========================================================================

class App {
  constructor() {
    // Views
    this.views = {
      products: document.getElementById('products-view'),
      cart: document.getElementById('cart-view'),
      checkout: document.getElementById('checkout-view'),
      summary: document.getElementById('summary-view')
    };

    // Navigation buttons
    this.navProductsBtn = document.getElementById('nav-products-btn');
    this.navCartBtn = document.getElementById('nav-cart-btn');
    this.brandLogo = document.getElementById('brand-logo');

    // Action buttons across views
    this.cartStartShoppingBtn = document.getElementById('cart-start-shopping-btn');
    this.cartContinueBrowsingBtn = document.getElementById('cart-continue-browsing-btn');
    this.proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    this.checkoutBackCartBtn = document.getElementById('checkout-back-cart-btn');

    // Toast element
    this.toastEl = document.getElementById('toast');
    this.toastTimeout = null;

    // Initialize Cart with localStorage persistence (Module 15 requirement)
    const savedCartItems = this.loadCartFromStorage();
    this.cart = new window.Cart(savedCartItems);
    this.cartUI = new window.CartUI(this.cart);

    // Save cart to localStorage whenever it changes
    this.cart.onChange(() => {
      this.saveCartToStorage();
    });

    // Initialize Member 1: Products
    this.productsModule = new window.ProductsModule();
    this.productsModule.setOnAddToCart((product) => {
      this.cart.addItem(product, 1);
      this.showToast(`✓ Added "${product.title}" to cart!`);
    });

    // Initialize Member 3: Checkout
    this.checkoutModule = new window.CheckoutModule(this.cart, (completedOrder) => {
      this.handleOrderCompleted(completedOrder);
    });

    // Initialize Member 4: Summary
    this.summaryModule = new window.SummaryModule(() => {
      this.cart.clear();
      this.switchView('products');
    });

    this.initNavigation();
  }

  initNavigation() {
    // Brand click returns to Products view
    this.brandLogo.addEventListener('click', () => this.switchView('products'));
    this.brandLogo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        this.switchView('products');
      }
    });

    // Nav buttons
    this.navProductsBtn.addEventListener('click', () => this.switchView('products'));
    this.navCartBtn.addEventListener('click', () => this.switchView('cart'));

    // Cart actions
    this.cartStartShoppingBtn.addEventListener('click', () => this.switchView('products'));
    this.cartContinueBrowsingBtn.addEventListener('click', () => this.switchView('products'));
    this.proceedToCheckoutBtn.addEventListener('click', () => {
      if (this.cart.getItemCount() === 0) {
        this.showToast('Your cart is empty! Add products first.');
        return;
      }
      this.switchView('checkout');
    });

    // Checkout back button
    this.checkoutBackCartBtn.addEventListener('click', () => this.switchView('cart'));
  }

  switchView(viewName) {
    // Hide all views
    Object.keys(this.views).forEach((name) => {
      if (this.views[name]) {
        this.views[name].classList.remove('active');
        this.views[name].classList.add('hidden');
      }
    });

    // Show target view
    if (this.views[viewName]) {
      this.views[viewName].classList.remove('hidden');
      this.views[viewName].classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav button state
    if (viewName === 'products') {
      this.navProductsBtn.classList.add('active');
      this.navCartBtn.classList.remove('active');
    } else if (viewName === 'cart' || viewName === 'checkout') {
      this.navCartBtn.classList.add('active');
      this.navProductsBtn.classList.remove('active');
    } else {
      this.navProductsBtn.classList.remove('active');
      this.navCartBtn.classList.remove('active');
    }
  }

  handleOrderCompleted(order) {
    // Save order in localStorage (Module 15 requirement)
    this.saveOrderToStorage(order);

    // Render Order in Summary Module
    this.summaryModule.renderSummary(order);

    // Switch to Summary View
    this.switchView('summary');
    this.showToast('🎉 Order placed successfully!');
  }

  showToast(message) {
    if (!this.toastEl) return;
    if (this.toastTimeout) clearTimeout(this.toastTimeout);

    this.toastEl.textContent = message;
    this.toastEl.classList.remove('hidden');

    this.toastTimeout = setTimeout(() => {
      this.toastEl.classList.add('hidden');
    }, 2500);
  }

  // ==========================================================================
  // LocalStorage Helpers (Module 15)
  // ==========================================================================
  loadCartFromStorage() {
    try {
      const data = localStorage.getItem('mini_marketplace_cart');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveCartToStorage() {
    try {
      localStorage.setItem('mini_marketplace_cart', JSON.stringify(this.cart.items));
    } catch {
      // Ignore quota errors
    }
  }

  saveOrderToStorage(order) {
    try {
      localStorage.setItem('mini_marketplace_latest_order', JSON.stringify(order));
    } catch {
      // Ignore quota errors
    }
  }

  start() {
    // Initial render of cart UI with stored items
    this.cartUI.render();

    // Fetch products
    this.productsModule.fetchProducts();

    // Show default view
    this.switchView('products');
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});
