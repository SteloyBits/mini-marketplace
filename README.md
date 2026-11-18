# Mini Marketplace

A simple online store built with HTML, CSS, and vanilla JavaScript. Visitors can browse products loaded from the DummyJSON API (with a local `products.json` fallback), search and filter by category, add items to a cart, check out with a validated form, and view an order summary.

## Team Members & Roles

| Role | Member | Owns | File(s) |
|---|---|---|---|
| **Member 1: Products** | Abdulsamad Baruwa | Product listing, search, category filter, and `products.json` fallback | `products.js` |
| **Member 2: Cart** | Udeme Enobong | `Cart` class, cart UI, add/remove/quantity, totals | `cart.js` |
| **Member 3: Checkout** | Adeola Amowie | Checkout form, field validation, error messages | `checkout.js` |
| **Member 4: Summary & Integration** | TitobiOluwa Soneye | Order summary, `localStorage`, page layout, app integration | `main.js`, `summary.js` |

## How to Run

1. Clone or download this repository.
2. Open the `mini_marketplace` folder in VS Code and start **Live Server** (or run a local static server such as `npx serve .`).
3. Open the served URL (defaulting to `index.html`) in your browser.

## Agreed Data Shapes

### Product Object
```js
{
  id: 1,
  title: "Phone",
  price: 499,
  category: "smartphones",
  thumbnail: "url",
  stock: 20
}
```

### Cart Item Object
```js
{
  id: 1,
  title: "Phone",
  price: 499,
  quantity: 2
}
```

### Order Object
```js
{
  orderId: "ORD-1001",
  customer: {
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "08012345678",
    address: "123 Main Street"
  },
  items: [
    { id: 1, title: "Phone", price: 499, quantity: 2 }
  ],
  total: 998,
  date: "2026-11-18T12:00:00.000Z"
}
```
