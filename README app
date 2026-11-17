# MarketPulse - Mini Marketplace (Group Project)

An end-to-end, responsive online store built with vanilla HTML5, CSS3, and modular ES6+ JavaScript. Designed for teams of 3-4 members following a strict feature-ownership structure. Visitors can browse live products from the DummyJSON API (with offline backup support), search and filter items, manage a dynamic shopping cart, check out with strict client-side validation, and view an order confirmation summary.

---

## Agreed Data Shapes

All team members code against these standardized data contracts:

### 1. Product Object
```javascript
{
  id: 1,
  title: "iPhone 9",
  price: 549,
  category: "smartphones",
  thumbnail: "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg",
  stock: 94,
  description: "An apple mobile which is nothing like apple"
}
```

### 2. Cart Item Object
```javascript
{
  id: 1,
  title: "iPhone 9",
  price: 549,
  quantity: 2,
  thumbnail: "https://cdn.dummyjson.com/product-images/1/thumbnail.jpg"
}
```

### 3. Order Object
```javascript
{
  orderId: "ORD-4821",
  customer: {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "08012345678",
    address: "123 Tech Boulevard, Lagos, Nigeria"
  },
  items: [
    { id: 1, title: "iPhone 9", price: 549, quantity: 2, thumbnail: "..." }
  ],
  total: 1098,
  date: "2026-11-15T20:30:00.000Z"
}
```

---

## Team Roles & Ownership

| Member | Role | File | Owned Features |
|---|---|---|---|
| **Member 1** | **Products Owner** | `products.js` | Fetch products from DummyJSON API with loading/error states, offline backup fallback (`products.json`), live search filtering by title, category filtering dropdown, price/title sorting, dynamic card rendering using `map` and `filter`. |
| **Member 2** | **Cart Owner** | `cart.js` | `Cart` class implementation (`addItem`, `removeItem`, `updateQuantity`, `getTotal`, `getItemCount`), quantity increment for duplicates, total calculation using `reduce`, cart panel UI with line item totals, interactive `[-] [qty] [+]` controls, header badge indicator, empty cart state, and static price formatting. |
| **Member 3** | **Checkout Owner** | `checkout.js` | Comprehensive checkout form (name, email, phone, delivery address), strict inline validation without alerts, regex email checks, numeric phone checks, empty-cart guard, and standardized order payload creation. |
| **Member 4** | **Integration & Summary** | `main.js`, `summary.js` | Single-page view navigation router (Products, Cart, Checkout, Summary), `localStorage` synchronization for cart state and completed orders, order confirmation presentation, and cross-module event coordination. |

---

## Core Technologies & Modules Covered

- **Fetch API & Promises** (Modules 14, 15): Asynchronous data retrieval with status checks and fallback handling.
- **Data Structures** (Modules 8, 9): Complex arrays of objects for products, cart, and orders.
- **ES6 Classes & OOP** (Module 13): `Cart`, `ProductsModule`, `CheckoutModule`, `SummaryModule`, and `App`.
- **Functional Array Methods** (Module 12): `map`, `filter`, and `reduce`.
- **DOM & Event Listeners** (Modules 10, 11): Dynamic component injection, input delegation, and keyboard accessibility.
- **Form Validation** (Module 5): Detailed regex and conditional rules with inline field errors.
- **Web Storage** (Module 15): Persistent cart and order state via `localStorage`.

---

## How to Run

1. Clone or download this project folder (`mini-marketplace`).
2. Open `index.html` directly in any web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
   - Alternatively, serve locally via `npx serve .` or VS Code Live Server.
3. Browse products, search or filter by category, add items to cart, proceed to checkout, fill in delivery details, and inspect the order summary!

---

## Stretch Goals Implemented

- **Local Backup Fallback**: Offline mode button when network is down to load `products.json`.
- **Live Search & Clear**: Real-time filtering as you type with one-click clear button.
- **Sorting**: Sort products by price (low-to-high, high-to-low) and alphabetical title.
- **Interactive Toast Notifications**: Feedback badges when adding items to cart or placing orders.
- **Static Price Formatter**: `Cart.formatPrice()` for consistent currency presentation.
