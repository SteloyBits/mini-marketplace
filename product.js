const PRODUCTS_API_URL = "https://dummyjson.com/products?limit=20";
const FALLBACK_PRODUCTS_URL = "products.json";

const loadingMessage = document.getElementById("products-loading");
const errorBox = document.getElementById("products-error");
const errorText = document.getElementById("products-error-text");
const retryButton = document.getElementById("products-retry-btn");
const emptyMessage = document.getElementById("products-empty");
const productsGrid = document.getElementById("products-grid");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");

let allProducts = [];

function createProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.thumbnail;
    image.alt = product.title;

    const title = document.createElement("h2");
    title.className = "product-title";
    title.textContent = product.title;

    const category = document.createElement("p");
    category.className = "product-category";
    category.textContent = product.category;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = "₦" + product.price.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.className = "add-to-cart-btn";
    addButton.dataset.id = product.id;
    addButton.textContent = "Add to Cart";

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(category);
    card.appendChild(price);
    card.appendChild(addButton);

    return card;
}

function renderProducts(products) {
    productsGrid.innerHTML = "";

    if (products.length === 0) {
        emptyMessage.hidden = false;
        return;
    }

    emptyMessage.hidden = true;

    const cards = products.map(createProductCard);
    cards.forEach(function (card) {
        productsGrid.appendChild(card);
    });
}

function populateCategories(products) {
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    const categories = [];

    products.forEach(function (product) {
        if (!categories.includes(product.category)) {
            categories.push(product.category);
        }
    });

    categories.forEach(function (category) {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function filterProducts() {
    const searchText = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = allProducts.filter(function (product) {
        const matchesSearch = product.title.toLowerCase().includes(searchText);
        const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
}

function handleAddToCartClick(event) {
    if (!event.target.classList.contains("add-to-cart-btn")) {
        return;
    }

    const button = event.target;
    const productId = Number(button.dataset.id);
    const selectedProduct = allProducts.find(function (product) {
        return product.id === productId;
    });

    if (!selectedProduct) {
        return;
    }

    window.dispatchEvent(new CustomEvent("add-to-cart", { detail: selectedProduct }));

    button.textContent = "Added!";
    setTimeout(function () {
        button.textContent = "Add to Cart";
    }, 800);
}

async function loadProductData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Failed to fetch from " + url);
    }
    return response.json();
}

async function fetchProducts() {
    loadingMessage.hidden = false;
    errorBox.hidden = true;

    try {
        let data;

        try {
            data = await loadProductData(PRODUCTS_API_URL);
        } catch (apiError) {
            data = await loadProductData(FALLBACK_PRODUCTS_URL);
        }

        allProducts = data.products.map(function (item) {
            return {
                id: item.id,
                title: item.title,
                price: item.price,
                category: item.category,
                thumbnail: item.thumbnail,
                stock: item.stock
            };
        });

        populateCategories(allProducts);
        filterProducts();
    } catch (error) {
        errorText.textContent = "Unable to load products. Please check your connection and try again.";
        errorBox.hidden = false;
    } finally {
        loadingMessage.hidden = true;
    }
}

retryButton.addEventListener("click", fetchProducts);
searchInput.addEventListener("input", filterProducts);
categoryFilter.addEventListener("change", filterProducts);
productsGrid.addEventListener("click", handleAddToCartClick);

fetchProducts();