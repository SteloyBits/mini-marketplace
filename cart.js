const CART_STORAGE_KEY = "mini_marketplace_cart";

function loadStoredCartItems() {
    if (window.location.hash.startsWith("#cart=")) {
        try {
            const fromHash = JSON.parse(decodeURIComponent(window.location.hash.slice(6)));
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(fromHash));
            history.replaceState(null, "", window.location.pathname + window.location.search);
            return fromHash;
        } catch (error) {
            return [];
        }
    }

    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

class Cart {
    constructor() {
        this.items = loadStoredCartItems();
    }

    save() {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    }

    addItem(product) {
        const existing = this.items.find(function (item) {
            return item.id === product.id;
        });

        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail,
                quantity: 1
            });
        }

        this.save();
    }

    removeItem(productId) {
        this.items = this.items.filter(function (item) {
            return item.id !== productId;
        });
        this.save();
    }

    updateQuantity(productId, newQuantity) {
        const quantity = Number(newQuantity);
        if (quantity <= 0 || Number.isNaN(quantity)) {
            this.removeItem(productId);
            return;
        }

        const item = this.items.find(function (entry) {
            return entry.id === productId;
        });

        if (item) {
            item.quantity = quantity;
            this.save();
        }
    }

    getTotal() {
        return this.items.reduce(function (sum, item) {
            return sum + item.price * item.quantity;
        }, 0);
    }

    getItemCount() {
        return this.items.reduce(function (count, item) {
            return count + item.quantity;
        }, 0);
    }
}

const cart = new Cart();

const cartItemsContainer = document.getElementById("cart-items");
const cartEmpty = document.getElementById("cart-empty");
const cartSummary = document.getElementById("cart-summary");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartBadge = document.getElementById("cart-badge");
const checkoutBtn = document.getElementById("checkout-btn");

function formatNaira(amount) {
    return "₦" + amount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function createCartRow(item) {
    const row = document.createElement("div");
    row.className = "cart-item-card";

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const img = document.createElement("img");
    img.className = "cart-item-image";
    img.src = item.thumbnail || "https://via.placeholder.com/60x60?text=Item";
    img.alt = item.title;

    const textGroup = document.createElement("div");

    const title = document.createElement("p");
    title.className = "cart-item-title";
    title.textContent = item.title;

    const unitPrice = document.createElement("p");
    unitPrice.className = "cart-item-unit";
    unitPrice.textContent = formatNaira(item.price) + " each";

    textGroup.appendChild(title);
    textGroup.appendChild(unitPrice);
    info.appendChild(img);
    info.appendChild(textGroup);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const qtyInput = document.createElement("input");
    qtyInput.type = "number";
    qtyInput.min = "1";
    qtyInput.value = item.quantity;
    qtyInput.className = "cart-qty-input";
    qtyInput.setAttribute("aria-label", "Quantity for " + item.title);
    qtyInput.addEventListener("change", function () {
        cart.updateQuantity(item.id, qtyInput.value);
        renderCart();
    });

    const lineTotal = document.createElement("span");
    lineTotal.className = "cart-line-total";
    lineTotal.textContent = formatNaira(item.price * item.quantity);

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "cart-remove-btn";
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", function () {
        cart.removeItem(item.id);
        renderCart();
    });

    actions.appendChild(qtyInput);
    actions.appendChild(lineTotal);
    actions.appendChild(removeBtn);

    row.appendChild(info);
    row.appendChild(actions);

    return row;
}

function updateShopLinks() {
    const shopLinks = document.querySelectorAll('a[href^="index.html"]');
    const targetHref = "index.html#cart=" + encodeURIComponent(JSON.stringify(cart.items));
    shopLinks.forEach(function (link) {
        link.href = targetHref;
    });
}

function renderCart() {
    cartBadge.textContent = cart.getItemCount();
    updateShopLinks();
    cartItemsContainer.innerHTML = "";

    if (cart.items.length === 0) {
        cartEmpty.hidden = false;
        cartSummary.hidden = true;
        return;
    }

    cartEmpty.hidden = true;
    cartSummary.hidden = false;

    cart.items.forEach(function (item) {
        cartItemsContainer.appendChild(createCartRow(item));
    });

    cartSubtotal.textContent = formatNaira(cart.getTotal());
}

checkoutBtn.addEventListener("click", function () {
    window.location.href = "checkout.html";
});

window.addEventListener("pageshow", function () {
    cart.items = loadStoredCartItems();
    renderCart();
});

renderCart();
