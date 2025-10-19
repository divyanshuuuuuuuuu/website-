// Enhanced JavaScript for Rasoiyaa Food E-commerce Website
console.log('script.js loaded successfully');

// Product Data (from Rasoiyaa Wix site)
const products = [
    {
        id: 'masala-murmura',
        name: 'Masala Murmura',
        price: 60,
        originalPrice: 80,
        category: 'murmura',
        image: 'masala murmura .png',
        description: 'Net weight- 125g. Salty and little spicy.',
        badge: 'New',
        inStock: true,
        dietary: ['vegetarian', 'vegan'],
        ingredients: 'Murmura, Masala spices, Oil',
        weight: '125g'
    },
    {
        id: 'golden-crunch',
        name: 'Golden Crunch (Saloni)',
        price: 135,
        originalPrice: 180,
        category: 'chips',
        image: 'golden-crunch.png',
        description: 'Net weight - 350g. Fresh | Healthier | Home-made. Crispy, Salty & Non Spicy. Packaging- Silver Standy Pouch - Airtight Ziplock.',
        badge: 'Best Seller',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Potato, Spices, Oil',
        weight: '350g'
    },
    {
        id: 'coco-kaju-delight',
        name: 'Coco-Crunch Delight (Chivda)',
        price: 110,
        originalPrice: 150,
        category: 'chivda',
        image: 'coco-crunch-new.png',
        description: 'Net weight- 200g. Fresh | Healthier | Home-made. Salty, Tasty & Little Spicy. Packaging- Silver Standy Pouch- Airtight Ziplock.',
        badge: 'Popular',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Coconut, Cashew nuts, Spices, Oil',
        weight: '200g'
    },
    {
        id: 'banana-chips',
        name: 'Chatpata Banana Chips',
        price: 85,
        originalPrice: 100,
        category: 'chips',
        image: 'banana-chips-new.png',
        description: 'Net weight- 120g. Salty and chatpata masaledar.',
        badge: 'Fresh',
        inStock: true,
        dietary: ['vegetarian', 'vegan'],
        ingredients: 'Banana, Oil, Salt, Spices',
        weight: '120g'
    },
    {
        id: 'namak-para',
        name: 'Namak Para',
        price: 90,
        originalPrice: 100,
        category: 'namak-para',
        image: 'murmura.png',
        description: 'Traditional crunchy namak para, perfect anytime snack',
        badge: 'Traditional',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Flour, Oil, Salt, Spices',
        weight: '250g'
    },
    {
        id: 'khasta-papdi',
        name: 'Khasta Papdi',
        price: 90,
        originalPrice: 120,
        category: 'papdi',
        image: 'murmura.png',
        description: 'Net weight- 250g. Kurkuri Masaledar Spicy Papdi.',
        badge: 'Spicy',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Flour, Oil, Salt, Spices, Chili',
        weight: '250g'
    },
    {
        id: 'combo-3pc',
        name: '3 Pc Combo Snack',
        price: 229,
        originalPrice: 320,
        category: 'combo',
        image: 'combo-3pc-new.png',
        description: 'Golden-Crunch Saloni - 175g, Coco-Crunch Delight- 200g, Masala Murmura- 125g. Enjoy 3 pc combo and save 100 Rs. Fresh | Healthier | Home-made.',
        badge: 'Best Value',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Mixed snacks - Potato, Coconut, Cashew nuts, Murmura, Spices, Oil',
        weight: '500g (Combo)'
    },
    {
        id: 'diwali-sweets',
        name: 'Diwali Sweets Collection',
        price: 299,
        originalPrice: 350,
        category: 'sweets',
        image: 'diwali-sweet2.jpg',
        description: 'Festive sweets collection for special celebrations',
        badge: 'Pre-order',
        inStock: false,
        preOrder: true,
        dietary: ['vegetarian'],
        ingredients: 'Sugar, Milk, Dry fruits, Traditional spices',
        weight: '500g'
    }
];

// Load Products Function
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    const productsList = document.getElementById('products-list');

    if (!productsGrid) return;

    // Clear existing content
    productsGrid.innerHTML = '';
    productsList.innerHTML = '';

    // Get current filters and sorting
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    const selectedDietary = Array.from(document.querySelectorAll('.diet-filter:checked')).map(cb => cb.value);
    const selectedAvailability = Array.from(document.querySelectorAll('.availability-filter:checked')).map(cb => cb.value);
    const minPrice = parseInt(document.getElementById('price-min')?.value) || 0;
    const maxPrice = parseInt(document.getElementById('price-max')?.value) || 500;
    const sortBy = document.getElementById('sort-select')?.value || 'default';

    // Filter products
    let filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.category.toLowerCase().includes(searchTerm);

        const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const matchesDietary = selectedDietary.length === 0 || selectedDietary.some(d => product.dietary.includes(d));
        const matchesAvailability = selectedAvailability.length === 0 ||
                                  (selectedAvailability.includes('in-stock') && product.inStock) ||
                                  (selectedAvailability.includes('pre-order') && product.preOrder);
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;

        return matchesSearch && matchesCategory && matchesDietary && matchesAvailability && matchesPrice;
    });

    // Sort products
    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'name':
                return a.name.localeCompare(b.name);
            case 'newest':
                return new Date(b.id) - new Date(a.id); // Assuming ID contains date info
            case 'popular':
                return (b.badge === 'Best Seller' ? 1 : 0) - (a.badge === 'Best Seller' ? 1 : 0);
            default:
                return 0;
        }
    });

    // Display products
    if (filteredProducts.length === 0) {
        document.getElementById('no-results').style.display = 'block';
        document.getElementById('pagination').style.display = 'none';
    } else {
        document.getElementById('no-results').style.display = 'none';
        document.getElementById('pagination').style.display = 'block';

        filteredProducts.forEach(product => {
            const productCard = createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }
}

// Create Product Card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-product-id', product.id);

    const badgeHtml = product.badge ? `<div class="product-badge ${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</div>` : '';
    const originalPriceHtml = product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : '';
    const stockStatus = product.inStock ? 'In Stock' : (product.preOrder ? 'Pre-order' : 'Out of Stock');
    const stockClass = product.inStock ? 'in-stock' : (product.preOrder ? 'pre-order' : 'out-of-stock');

    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${badgeHtml}
            <div class="product-actions">
                <a href="product.html?id=${product.id}" class="quick-view-btn">
                    <i class="fas fa-eye"></i>
                </a>
                <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                    <i class="fas fa-shopping-cart"></i>
                </button>
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-title"><a href="product.html?id=${product.id}">${product.name}</a></h3>
            <p class="product-description">${product.description}</p>
            <div class="product-meta">
                <span class="product-weight">${product.weight}</span>
                <span class="product-stock ${stockClass}">${stockStatus}</span>
            </div>
            <div class="product-price">
                <span class="current-price">₹${product.price}</span>
                ${originalPriceHtml}
            </div>
            <div class="product-rating">
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star-half-alt"></i>
                </div>
                <span class="rating-count">(4.5)</span>
            </div>
        </div>
    `;

    return card;
}

// Quick View Function
function quickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Create modal for quick view
    const modal = document.createElement('div');
    modal.className = 'modal quick-view-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <div class="quick-view-content">
                <div class="quick-view-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="quick-view-details">
                    <h2>${product.name}</h2>
                    <p class="description">${product.description}</p>
                    <div class="ingredients">
                        <strong>Ingredients:</strong> ${product.ingredients}
                    </div>
                    <div class="dietary-info">
                        <strong>Dietary:</strong> ${product.dietary.join(', ')}
                    </div>
                    <div class="price">₹${product.price}</div>
                    <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    modal.querySelector('.close').onclick = () => modal.remove();
    window.onclick = (event) => {
        if (event.target === modal) modal.remove();
    };
}

// Add to Cart Function
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Get existing cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart count
    updateCartCount();

    // Show toast notification
    showToast('Product added to cart!', 'success');
}

// Update Cart Count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Load Product Details for individual product page
function loadProductDetails(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'shop.html';
        return;
    }

    // Update page title and breadcrumb
    document.title = `${product.name} - Rasoiyaa Food`;
    document.getElementById('product-title').setAttribute('content', `${product.name} - Authentic Indian Snacks from Rasoiyaa Food`);
    document.getElementById('breadcrumb-product').textContent = product.name;

    // Update main image
    document.getElementById('main-product-image').src = product.image;
    document.getElementById('main-product-image').alt = product.name;

    // Update badge
    const badgeElement = document.getElementById('product-badge');
    if (product.badge) {
        badgeElement.textContent = product.badge;
        badgeElement.className = `product-badge ${product.badge.toLowerCase().replace(' ', '-')}`;
        badgeElement.style.display = 'block';
    } else {
        badgeElement.style.display = 'none';
    }

    // Update product info
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('current-price').textContent = `₹${product.price}`;
    document.getElementById('product-weight').textContent = product.weight;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-ingredients').textContent = product.ingredients;
    document.getElementById('product-category').textContent = product.category.charAt(0).toUpperCase() + product.category.slice(1);

    // Update availability
    const availabilityElement = document.getElementById('product-availability');
    if (product.inStock) {
        availabilityElement.textContent = 'In Stock';
        availabilityElement.className = 'in-stock';
    } else if (product.preOrder) {
        availabilityElement.textContent = 'Pre-order';
        availabilityElement.className = 'pre-order';
    } else {
        availabilityElement.textContent = 'Out of Stock';
        availabilityElement.className = 'out-of-stock';
    }

    // Update original price
    const originalPriceElement = document.getElementById('original-price');
    if (product.originalPrice > product.price) {
        originalPriceElement.textContent = `₹${product.originalPrice}`;
        originalPriceElement.style.display = 'inline';
    } else {
        originalPriceElement.style.display = 'none';
    }

    // Update dietary tags
    const dietaryTags = document.getElementById('dietary-tags');
    dietaryTags.innerHTML = '';
    product.dietary.forEach(diet => {
        const tag = document.createElement('span');
        tag.className = 'dietary-tag';
        tag.textContent = diet.charAt(0).toUpperCase() + diet.slice(1);
        dietaryTags.appendChild(tag);
    });

    // Load related products
    loadRelatedProducts(product.category, productId);

    // Add to cart functionality
    document.getElementById('add-to-cart-btn').addEventListener('click', function() {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(productId, quantity);
    });

    // Buy now functionality
    document.getElementById('buy-now-btn').addEventListener('click', function() {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(productId, quantity);
        window.location.href = 'checkout.html';
    });

    // Quantity controls
    document.getElementById('increase-qty').addEventListener('click', function() {
        const qtyInput = document.getElementById('quantity');
        const currentQty = parseInt(qtyInput.value);
        if (currentQty < 10) {
            qtyInput.value = currentQty + 1;
        }
    });

    document.getElementById('decrease-qty').addEventListener('click', function() {
        const qtyInput = document.getElementById('quantity');
        const currentQty = parseInt(qtyInput.value);
        if (currentQty > 1) {
            qtyInput.value = currentQty - 1;
        }
    });
}

// Load Related Products
function loadRelatedProducts(category, excludeId) {
    const relatedProducts = products.filter(p => p.category === category && p.id !== excludeId).slice(0, 4);
    const relatedContainer = document.getElementById('related-products');

    if (!relatedContainer) return;

    relatedContainer.innerHTML = '';

    if (relatedProducts.length === 0) {
        relatedContainer.innerHTML = '<p>No related products found.</p>';
        return;
    }

    relatedProducts.forEach(product => {
        const productCard = createRelatedProductCard(product);
        relatedContainer.appendChild(productCard);
    });
}

// Create Related Product Card
function createRelatedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'related-product-card';

    const badgeHtml = product.badge ? `<div class="product-badge ${product.badge.toLowerCase().replace(' ', '-')}">${product.badge}</div>` : '';
    const originalPriceHtml = product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : '';

    card.innerHTML = `
        <div class="product-image">
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </a>
            ${badgeHtml}
        </div>
        <div class="product-info">
            <h4><a href="product.html?id=${product.id}">${product.name}</a></h4>
            <div class="product-price">
                <span class="current-price">₹${product.price}</span>
                ${originalPriceHtml}
            </div>
        </div>
    `;

    return card;
}

// Login functionality
function sendOTP() {
    const emailInput = document.getElementById('login-contact');
    const email = emailInput.value.trim();
    const sendBtn = document.getElementById('send-otp-btn');
    const btnText = sendBtn.querySelector('.btn-text');
    const btnLoader = sendBtn.querySelector('.btn-loader');

    if (!email) {
        showToast('Please enter your email address', 'error');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }

    // Show loading state
    sendBtn.disabled = true;
    btnText.textContent = 'Sending...';
    btnLoader.style.display = 'inline';

    // Send OTP request
    fetch('http://localhost:8000/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contact: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Move to step 2
            document.getElementById('login-step-1').classList.remove('active');
            document.getElementById('login-step-2').classList.add('active');

            // Update progress
            document.querySelector('[data-step="1"]').classList.remove('active');
            document.querySelector('[data-step="2"]').classList.add('active');

            // Set email display
            document.getElementById('otp-email-display').textContent = email;

            // Start OTP timer
            startOTPTimer();

            showToast('OTP sent successfully! Check your email.', 'success');
        } else {
            showToast(data.message || 'Failed to send OTP', 'error');
        }
    })
    .catch(error => {
        console.error('OTP send error:', error);
        showToast('Failed to send OTP. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        sendBtn.disabled = false;
        btnText.textContent = 'Send Login Code';
        btnLoader.style.display = 'none';
    });
}

function startOTPTimer() {
    let timeLeft = 300; // 5 minutes
    const timerElement = document.getElementById('otp-timer');

    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            timerElement.textContent = '00:00';
            showToast('OTP expired. Please request a new one.', 'error');
        }
        timeLeft--;
    }, 1000);
}

function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const verifyBtn = document.getElementById('verify-otp-btn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const btnLoader = verifyBtn.querySelector('.btn-loader');

    // Get OTP from inputs
    let otp = '';
    otpInputs.forEach(input => {
        otp += input.value;
    });

    if (otp.length !== 6) {
        showToast('Please enter the complete 6-digit code', 'error');
        return;
    }

    const email = document.getElementById('otp-email-display').textContent;

    // Show loading state
    verifyBtn.disabled = true;
    btnText.textContent = 'Verifying...';
    btnLoader.style.display = 'inline';

    // Verify OTP request
    fetch('http://localhost:8000/verify-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contact: email, otp: otp })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Move to step 3 (success)
            document.getElementById('login-step-2').classList.remove('active');
            document.getElementById('login-step-3').classList.add('active');

            // Update progress
            document.querySelector('[data-step="2"]').classList.remove('active');
            document.querySelector('[data-step="3"]').classList.add('active');

            // Set user email display
            document.getElementById('user-email-display').textContent = email;

            // Store login session
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);

            showToast('Login successful! Welcome to Rasoiyaa Food.', 'success');

            // Auto redirect after 3 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        } else {
            showToast(data.message || 'Invalid OTP code', 'error');
        }
    })
    .catch(error => {
        console.error('OTP verify error:', error);
        showToast('Failed to verify OTP. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        verifyBtn.disabled = false;
        btnText.textContent = 'Verify Code';
        btnLoader.style.display = 'none';
    });
}

function resendOTP() {
    const email = document.getElementById('otp-email-display').textContent;
    const resendBtn = document.getElementById('resend-otp-btn');
    const btnText = resendBtn.querySelector('.btn-text');
    const btnLoader = resendBtn.querySelector('.btn-loader');

    // Show loading state
    resendBtn.disabled = true;
    btnText.textContent = 'Sending...';
    btnLoader.style.display = 'inline';

    // Resend OTP request
    fetch('http://localhost:8000/send-otp', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contact: email })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Restart timer
            startOTPTimer();
            showToast('OTP sent again! Check your email.', 'success');
        } else {
            showToast(data.message || 'Failed to resend OTP', 'error');
        }
    })
    .catch(error => {
        console.error('OTP resend error:', error);
        showToast('Failed to resend OTP. Please try again.', 'error');
    })
    .finally(() => {
        // Reset button state
        resendBtn.disabled = false;
        btnText.textContent = 'Didn\'t receive code? Resend';
        btnLoader.style.display = 'none';
    });
}

// OTP input handling
function setupOTPInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');

    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');

            // Auto move to next input
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', function(e) {
            // Handle backspace
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = e.clipboardData.getData('text');
            const pasteNumbers = paste.replace(/[^0-9]/g, '');

            for (let i = 0; i < Math.min(pasteNumbers.length, otpInputs.length - index); i++) {
                otpInputs[index + i].value = pasteNumbers[i];
            }

            // Focus last filled input or next empty one
            const nextEmpty = Array.from(otpInputs).find((input, i) => i >= index && input.value === '');
            if (nextEmpty) {
                nextEmpty.focus();
            } else {
                otpInputs[otpInputs.length - 1].focus();
            }
        });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load products on shop page
    if (document.getElementById('products-grid')) {
        loadProducts();
    }

    // Load product details on product page
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId && document.getElementById('main-product-image')) {
        loadProductDetails(productId);
    }

    // Update cart count
    updateCartCount();

    // Search functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', loadProducts);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') loadProducts();
        });
    }

    // Filter functionality
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('category-filter') ||
            e.target.classList.contains('diet-filter') ||
            e.target.classList.contains('availability-filter') ||
            e.target.id === 'price-min' ||
            e.target.id === 'price-max') {
            loadProducts();
        }
    });

    // Sort functionality
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', loadProducts);
    }

    // Apply filters button
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', loadProducts);
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', function() {
            // Reset all filters
            document.querySelectorAll('.category-filter, .diet-filter, .availability-filter').forEach(cb => cb.checked = false);
            document.getElementById('price-min').value = 0;
            document.getElementById('price-max').value = 500;
            document.getElementById('search-input').value = '';
            loadProducts();
        });
    }

    // Reset search button
    const resetSearchBtn = document.getElementById('reset-search');
    if (resetSearchBtn) {
        resetSearchBtn.addEventListener('click', function() {
            document.getElementById('search-input').value = '';
            loadProducts();
        });
    }

    // Login functionality
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const resendOtpBtn = document.getElementById('resend-otp-btn');

    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', sendOTP);
    }

    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', verifyOTP);
    }

    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', resendOTP);
    }

    // Setup OTP input handling
    setupOTPInputs();
});