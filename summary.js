/**
 * Member 4: Order Summary Module
 * File: summary.js
 *
 * Blank Canvas / Starter Skeleton
 *
 * Responsibilities:
 * 1. Fetch latest order from localStorage (fallback to summary.json)
 * 2. Render customer details, order date, and order ID
 * 3. Render purchased items into the table with unit price and line totals
 * 4. Calculate and render the grand total using reduce
 * 5. Handle "Continue Shopping" button to clear cart and return to index.html
 */

// Configuration & Constants
const DUMMY_JSON_CART_URL = "https://dummyjson.com/carts/1";
const DUMMY_JSON_USER_URL = "https://dummyjson.com/users/1";
const FALLBACK_ORDER_URL = "summary.json";

// DOM Element Selectors
const loadingElement = document.getElementById("summary-loading");
const errorElement = document.getElementById("summary-error");
const errorTextElement = document.getElementById("summary-error-text");
const contentElement = document.getElementById("summary-content");

const orderIdElement = document.getElementById("summary-order-id");
const customerNameElement = document.getElementById("summary-name");
const customerEmailElement = document.getElementById("summary-email");
const customerPhoneElement = document.getElementById("summary-phone");
const orderDateElement = document.getElementById("summary-date");
const customerAddressElement = document.getElementById("summary-address");

const itemsTableBody = document.getElementById("summary-items-tbody");
const grandTotalElement = document.getElementById("summary-total");
const continueShoppingBtn = document.getElementById("continue-shopping-btn");
const retryButton = document.getElementById("summary-retry-btn");

let currentOrderItems = [];

/**
 * Format price into Nigerian Naira currency format (e.g., ₦25,000.00).
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
    const validAmount = Number(amount) || 0;
    return "₦" + validAmount.toLocaleString("en-NG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format ISO date string into human-readable date.
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    const date = dateString ? new Date(dateString) : new Date();
    if (isNaN(date.getTime())) {
        return String(dateString);
    }
    return date.toLocaleDateString("en-NG", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

/**
 * Add a purchased item from the order summary back into the shopping cart in localStorage.
 * Follows the agreed Cart item schema: { id, title, price, quantity }.
 * @param {Object} item
 */
function addItemToCart(item) {
    let cart = [];
    try {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            cart = JSON.parse(storedCart);
            if (!Array.isArray(cart)) {
                cart = [];
            }
        }
    } catch (error) {
        cart = [];
    }

    const existingItem = cart.find(function (cartItem) {
        return cartItem.id === item.id;
    });

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        cart.push({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: 1
        });
    }

    try {
        localStorage.setItem("cart", JSON.stringify(cart));
    } catch (storageError) {
        // Handle storage quota or access restriction gracefully
        return false;
    }

    // Dispatch global event for integration with Cart badge / listeners
    try {
        window.dispatchEvent(new CustomEvent("add-to-cart", {
            detail: {
                id: item.id,
                title: item.title,
                price: item.price,
                quantity: 1
            }
        }));
    } catch (eventError) {
        // Ignore event dispatch failure
    }

    return true;
}

/**
 * Create a <tr> row element for an item in the items table, including an Add to Cart button.
 * @param {Object} item - { id, title, price, quantity }
 * @returns {HTMLTableRowElement|null}
 */
function createItemRow(item) {
    if (!item || typeof item !== "object") {
        return null;
    }

    const row = document.createElement("tr");

    const titleCell = document.createElement("td");
    titleCell.textContent = item.title || "Unknown Item";

    const priceCell = document.createElement("td");
    priceCell.textContent = formatCurrency(item.price);

    const qtyCell = document.createElement("td");
    const safeQty = Math.max(1, parseInt(item.quantity, 10) || 1);
    qtyCell.textContent = safeQty;

    const lineTotalCell = document.createElement("td");
    lineTotalCell.className = "text-right";
    const lineTotal = (Number(item.price) || 0) * safeQty;
    lineTotalCell.textContent = formatCurrency(lineTotal);

    // Add to Cart action button cell
    const actionCell = document.createElement("td");
    actionCell.className = "text-center";

    const addToCartButton = document.createElement("button");
    addToCartButton.type = "button";
    addToCartButton.className = "add-to-cart-btn btn-sm";
    addToCartButton.dataset.id = item.id;
    addToCartButton.textContent = "Add to Cart";

    actionCell.appendChild(addToCartButton);

    row.appendChild(titleCell);
    row.appendChild(priceCell);
    row.appendChild(qtyCell);
    row.appendChild(lineTotalCell);
    row.appendChild(actionCell);

    return row;
}

/**
 * Render the complete order details into the DOM.
 * - Populate orderId, customer name, email, phone, address, and date
 * - Populate purchased items table with Add to Cart buttons
 * - Calculate and render grand total using Array.reduce
 * @param {Object} order
 */
function renderOrder(order) {
    if (!order) {
        throw new Error("No order data available to render");
    }

    currentOrderItems = Array.isArray(order.items) ? order.items : [];

    // Order Meta
    orderIdElement.textContent = order.orderId || "ORD-" + Date.now().toString().slice(-4);

    // Customer Meta
    const customer = order.customer || {};
    customerNameElement.textContent = customer.name || "N/A";
    customerEmailElement.textContent = customer.email || "N/A";
    customerPhoneElement.textContent = customer.phone || "N/A";
    customerAddressElement.textContent = customer.address || "N/A";
    orderDateElement.textContent = formatDate(order.date);

    // Render table rows
    itemsTableBody.innerHTML = "";
    const validRows = currentOrderItems
        .map(createItemRow)
        .filter(function (row) {
            return row !== null;
        });

    if (validRows.length > 0) {
        validRows.forEach(function (row) {
            itemsTableBody.appendChild(row);
        });
    } else {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 5;
        emptyCell.className = "status-message";
        emptyCell.textContent = "No valid items found in this order.";
        emptyRow.appendChild(emptyCell);
        itemsTableBody.appendChild(emptyRow);
    }

    // Calculate grand total using reduce
    const calculatedTotal = currentOrderItems.reduce(function (accumulator, item) {
        const itemLine = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        return accumulator + itemLine;
    }, 0);

    const grandTotal = typeof order.total === "number" ? order.total : calculatedTotal;
    grandTotalElement.textContent = formatCurrency(grandTotal);
}

/**
 * Helper to fetch and parse JSON with response.ok verification.
 * @param {string} url
 * @returns {Promise<any>}
 */
async function fetchJson(url) {
    let response;
    try {
        response = await fetch(url);
    } catch (networkError) {
        throw new Error("Network request failed for " + url + ": " + networkError.message);
    }

    if (!response.ok) {
        throw new Error("HTTP error " + response.status + " while fetching " + url);
    }

    try {
        return await response.json();
    } catch (parseError) {
        throw new Error("Failed to parse JSON response from " + url);
    }
}

/**
 * Fetch cart and customer details from DummyJSON API and adapt to agreed Order shape.
 * @returns {Promise<Object>}
 */
async function fetchFromDummyJsonApi() {
    const [cartData, userData] = await Promise.all([
        fetchJson(DUMMY_JSON_CART_URL),
        fetchJson(DUMMY_JSON_USER_URL)
    ]);

    const items = (cartData.products || []).map(function (product) {
        return {
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: product.quantity
        };
    });

    const customerAddress = userData.address
        ? `${userData.address.address}, ${userData.address.city}`
        : "N/A";

    return {
        orderId: "ORD-" + (1000 + (cartData.id || 1)),
        customer: {
            name: `${userData.firstName || "Customer"} ${userData.lastName || ""}`.trim(),
            email: userData.email || "customer@example.com",
            phone: userData.phone || "N/A",
            address: customerAddress
        },
        items: items,
        total: cartData.total,
        date: new Date().toISOString()
    };
}

/**
 * Fetch order data:
 * 1. Checks localStorage for a recently placed order.
 * 2. Fetches live sample order from DummyJSON API.
 * 3. Falls back to local summary.json if API is unreachable.
 * @returns {Promise<Object>}
 */
async function fetchOrderData() {
    // 1. Check localStorage for order placed by checkout
    const storedOrderRaw = localStorage.getItem("latestOrder") || localStorage.getItem("order");
    if (storedOrderRaw) {
        try {
            const parsedOrder = JSON.parse(storedOrderRaw);
            if (parsedOrder && typeof parsedOrder === "object") {
                return parsedOrder;
            }
        } catch (storageError) {
            // Ignore parse errors and proceed to API
        }
    }

    // 2. Fetch from DummyJSON API
    try {
        return await fetchFromDummyJsonApi();
    } catch (apiError) {
        // 3. Fallback to local summary.json (offline demo backup)
        return await fetchJson(FALLBACK_ORDER_URL);
    }
}

/**
 * Handle "Continue Shopping" button click.
 * - Clear cart from localStorage ('cart' / 'cartItems')
 * - Redirect to index.html
 */
function handleContinueShopping() {
    localStorage.removeItem("cart");
    localStorage.removeItem("cartItems");
    window.location.href = "index.html";
}

/**
 * Handle click events on table to process Add to Cart button actions.
 * @param {MouseEvent} event
 */
function handleTableClick(event) {
    const button = event.target.closest(".add-to-cart-btn");
    if (!button) {
        return;
    }

    const itemId = Number(button.dataset.id);
    const selectedItem = currentOrderItems.find(function (product) {
        return product.id === itemId;
    });

    if (!selectedItem) {
        return;
    }

    addItemToCart(selectedItem);

    const originalText = button.textContent;
    button.textContent = "Added!";
    button.disabled = true;

    setTimeout(function () {
        button.textContent = originalText;
        button.disabled = false;
    }, 800);
}

/**
 * Initialize summary view.
 * Show loading indicator, call fetchOrderData(), and pass result to renderOrder().
 */
async function initSummary() {
    loadingElement.hidden = false;
    errorElement.hidden = true;
    contentElement.hidden = true;

    try {
        const order = await fetchOrderData();
        if (!order || typeof order !== "object") {
            throw new Error("Invalid or empty order data received.");
        }
        renderOrder(order);
        errorElement.hidden = true;
        contentElement.hidden = false;
    } catch (error) {
        contentElement.hidden = true;
        errorTextElement.textContent = "Unable to load order summary. Please check your connection and try again.";
        errorElement.hidden = false;
    } finally {
        loadingElement.hidden = true;
    }
}

// Event Listeners
if (itemsTableBody) {
    itemsTableBody.addEventListener("click", handleTableClick);
}

if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener("click", handleContinueShopping);
}

if (retryButton) {
    retryButton.addEventListener("click", initSummary);
}

// Initialize on load
initSummary();
