/**
 * Member 4: Order Summary Module
 * File: summary.js
 * Responsibilities:
 * - Render order summary screen showing Order ID, Customer details, Items table, and Grand Total
 * - Handle "Continue Shopping" button action that clears cart and navigates back to products
 */

class SummaryModule {
  constructor(onContinueShoppingCallback) {
    this.onContinueShoppingCallback = onContinueShoppingCallback;

    // DOM Elements
    this.orderIdEl = document.getElementById('summary-order-id');
    this.custNameEl = document.getElementById('summary-cust-name');
    this.custEmailEl = document.getElementById('summary-cust-email');
    this.custPhoneEl = document.getElementById('summary-cust-phone');
    this.custAddressEl = document.getElementById('summary-cust-address');
    this.orderDateEl = document.getElementById('summary-order-date');
    this.itemsTbody = document.getElementById('summary-items-tbody');
    this.grandTotalEl = document.getElementById('summary-grand-total');
    this.continueBtn = document.getElementById('continue-shopping-btn');

    this.initEventListeners();
  }

  initEventListeners() {
    this.continueBtn.addEventListener('click', () => {
      if (typeof this.onContinueShoppingCallback === 'function') {
        this.onContinueShoppingCallback();
      }
    });
  }

  renderSummary(order) {
    if (!order) return;

    // Populate Order Meta
    this.orderIdEl.textContent = order.orderId;
    this.custNameEl.textContent = order.customer.name;
    this.custEmailEl.textContent = order.customer.email;
    this.custPhoneEl.textContent = order.customer.phone;
    this.custAddressEl.textContent = order.customer.address;

    const formattedDate = new Date(order.date).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
    this.orderDateEl.textContent = formattedDate;

    // Populate Purchased Items Table
    this.itemsTbody.innerHTML = '';
    order.items.forEach((item) => {
      const tr = document.createElement('tr');

      const tdProduct = document.createElement('td');
      tdProduct.className = 'text-bold';
      tdProduct.textContent = item.title;

      const tdPrice = document.createElement('td');
      tdPrice.textContent = `₦₦{Number(item.price).toFixed(2)}`;

      const tdQty = document.createElement('td');
      tdQty.textContent = item.quantity;

      const tdLineTotal = document.createElement('td');
      tdLineTotal.className = 'text-right text-bold';
      tdLineTotal.textContent = `₦₦{(item.price * item.quantity).toFixed(2)}`;

      tr.appendChild(tdProduct);
      tr.appendChild(tdPrice);
      tr.appendChild(tdQty);
      tr.appendChild(tdLineTotal);

      this.itemsTbody.appendChild(tr);
    });

    // Populate Grand Total
    this.grandTotalEl.textContent = `₦₦{Number(order.total).toFixed(2)}`;
  }
}

// Attach to window
window.SummaryModule = SummaryModule;
