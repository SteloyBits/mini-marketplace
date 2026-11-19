/**
 * Member 4: Integration and Application Glue
 * File: main.js
 *
 * Responsibilities:
 * 1. Maintain cross-page shopping cart persistence in localStorage
 * 2. Listen for global "add-to-cart" events emitted by product.js or summary.js
 * 3. Dynamically update the header Cart badge count across pages
 * 4. Manage order persistence in localStorage for checkout-to-summary handoff
 * 5. Provide shared storage helpers for Member 2 (Cart) and Member 3 (Checkout)
 */

// Storage Keys
const CART_STORAGE_KEY = "cart";
const ORDER_STORAGE_KEY = "latestOrder";

/**
 * Retrieve the current cart array from localStorage.
 * @returns {Array<Object>} Array of cart items: { id, title, price, quantity }
 */
function getCartFromStorage() {
    if (window.location.hash.startsWith("#cart=")) {
        try {
            const fromHash = JSON.parse(decodeURIComponent(window.location.hash.slice(6)));
            if (Array.isArray(fromHash)) {
                localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(fromHash));
                history.replaceState(null, "", window.location.pathname + window.location.search);
                return fromHash;
            }
        } catch (error) {
            console.error("Error reading cart from URL hash:", error);
        }
    }
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        }
    } catch (error) {
        console.error("Error reading cart from localStorage:", error);
    }
    return [];
}

/**
 * Save cart array to localStorage.
 * @param {Array<Object>} cart
 */
function saveCartToStorage(cart) {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error("Error saving cart to localStorage:", error);
    }
}

/**
 * Add a product to the cart in localStorage, incrementing quantity if already present.
 * Conforms to agreed Cart item contract: { id, title, price, quantity }.
 * @param {Object} product - { id, title, price }
 * @param {number} quantity - defaults to 1
 */
function addItemToCart(product, quantity = 1) {
    if (!product || !product.id) return;

    const cart = getCartFromStorage();
    const existingItem = cart.find(function (item) {
        return item.id === product.id;
    });

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + quantity;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail || "",
            quantity: quantity
        });
    }

    saveCartToStorage(cart);
    updateCartBadge();
}

/**
 * Calculate total quantity of items currently in the cart using Array.reduce.
 * @returns {number}
 */
function getCartItemCount() {
    const cart = getCartFromStorage();
    return cart.reduce(function (total, item) {
        return total + (Number(item.quantity) || 1);
    }, 0);
}

/**
 * Update the cart badge count in the header navigation.
 */
function updateCartBadge() {
    const cartBtn = document.getElementById("cart-btn");
    if (!cartBtn) return;

    let badge = cartBtn.querySelector(".cart-badge");
    const count = getCartItemCount();

    if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-badge";
        cartBtn.appendChild(badge);
    }

    badge.textContent = count;
    badge.hidden = count === 0;

    const cart = getCartFromStorage();
    cartBtn.href = cart.length > 0
        ? "cart.html#cart=" + encodeURIComponent(JSON.stringify(cart))
        : "cart.html";
}

/**
 * Save placed order into localStorage for the summary screen.
 * Conforms to agreed Order contract: { orderId, customer, items, total, date }.
 * @param {Object} order
 */
function saveLatestOrder(order) {
    try {
        localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    } catch (error) {
        console.error("Error saving latest order to localStorage:", error);
    }
}

/**
 * Retrieve the latest placed order from localStorage.
 * @returns {Object|null}
 */
function getLatestOrder() {
    try {
        const raw = localStorage.getItem(ORDER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error("Error reading order from localStorage:", error);
        return null;
    }
}

/**
 * Clear shopping cart from localStorage.
 */
function clearCart() {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem("cartItems");
        updateCartBadge();
    } catch (error) {
        console.error("Error clearing cart from localStorage:", error);
    }
}

/**
 * Initialize application-wide glue and listeners.
 */
function initAppGlue() {
    // Initial badge render
    updateCartBadge();

    // Listen for global add-to-cart events emitted by product.js or summary.js
    window.addEventListener("add-to-cart", function (event) {
        if (event.detail) {
            addItemToCart(event.detail);
        }
    });

    // Sync badge if storage changes in another tab
    window.addEventListener("storage", function (event) {
        if (event.key === CART_STORAGE_KEY) {
            updateCartBadge();
        }
    });
}

// Attach shared helpers to window for Member 2 (Cart) and Member 3 (Checkout)
window.AppStorage = {
    getCart: getCartFromStorage,
    saveCart: saveCartToStorage,
    addItem: addItemToCart,
    getItemCount: getCartItemCount,
    updateBadge: updateCartBadge,
    saveOrder: saveLatestOrder,
    getOrder: getLatestOrder,
    clearCart: clearCart
};

// Initialize when DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAppGlue);
} else {
    initAppGlue();
}
