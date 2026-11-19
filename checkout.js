/** Checkout form: validation, clear field errors, and order handoff to summary.js. */
(function () {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const fields = {
    name: document.getElementById('customer-name'),
    email: document.getElementById('customer-email'),
    phone: document.getElementById('customer-phone'),
    address: document.getElementById('customer-address')
  };
  const errorBox = document.getElementById('checkout-form-error');
  const totalElement = document.getElementById('checkout-total');
  const messages = {
    name: 'Please enter your full name (at least 2 characters).',
    email: 'Enter a valid email address, for example name@example.com.',
    phone: 'Enter a valid Nigerian phone number (11 digits or +234 followed by 10 digits).',
    address: 'Please enter a delivery address of at least 8 characters.'
  };

  function getCart() {
    try {
      const stored = localStorage.getItem('cart');
      const cart = stored ? JSON.parse(stored) : [];
      return Array.isArray(cart) ? cart.filter(item => item && Number(item.quantity) > 0) : [];
    } catch (_) {
      return [];
    }
  }

  function money(value) {
    return '₦' + Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0);
  totalElement.textContent = money(total);

  function setError(fieldName, message) {
    const input = fields[fieldName];
    const error = document.getElementById(fieldName + '-error');
    error.textContent = message;
    input.classList.toggle('invalid-field', Boolean(message));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }

  function validateField(name) {
    const value = fields[name].value.trim();
    let message = '';

    if (!value) {
      message = name === 'address' ? 'Delivery address is required.' :
        name === 'name' ? 'Full name is required.' :
        name === 'email' ? 'Email address is required.' : 'Phone number is required.';
    } else if (name === 'name' && value.length < 2) {
      message = messages.name;
    } else if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      message = messages.email;
    } else if (name === 'phone') {
      const normalized = value.replace(/[\s()-]/g, '');
      if (!/^(?:0\d{10}|\+234\d{10}|234\d{10})$/.test(normalized)) message = messages.phone;
    } else if (name === 'address' && value.length < 8) {
      message = messages.address;
    }

    setError(name, message);
    return !message;
  }

  Object.keys(fields).forEach(name => {
    fields[name].addEventListener('blur', () => validateField(name));
    fields[name].addEventListener('input', () => {
      if (fields[name].getAttribute('aria-invalid') === 'true') validateField(name);
      errorBox.hidden = true;
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    errorBox.hidden = true;

    if (!cart.length) {
      errorBox.textContent = 'Your cart is empty. Add an item before checking out.';
      errorBox.hidden = false;
      return;
    }

    const valid = Object.keys(fields).map(validateField).every(Boolean);
    if (!valid) {
      errorBox.textContent = 'Please correct the highlighted fields before placing your order.';
      errorBox.hidden = false;
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const order = {
      orderId: 'ORD-' + Date.now().toString().slice(-8),
      customer: {
        name: fields.name.value.trim(),
        email: fields.email.value.trim(),
        phone: fields.phone.value.trim(),
        address: fields.address.value.trim()
      },
      items: cart.map(item => ({
        id: item.id,
        title: item.title,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1
      })),
      total,
      date: new Date().toISOString()
    };

    try {
      localStorage.setItem('latestOrder', JSON.stringify(order));
      localStorage.removeItem('cart');
      localStorage.removeItem('cartItems');
      window.location.href = 'summary.html';
    } catch (_) {
      errorBox.textContent = 'We could not save your order on this device. Please check your browser storage and try again.';
      errorBox.hidden = false;
    }
  });
})();
