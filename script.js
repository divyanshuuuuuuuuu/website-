// Enhanced JavaScript for Rasoiyaa Food E-commerce Website
console.log('script.js loaded successfully');

// Product Data (from Rasoiyaa Wix site)
const products = [
    {
        id: 'masala-murmura',
        name: 'Masala Murmura',
        price: 60,
        originalPrice: 70,
        category: 'murmura',
        image: 'murmura.png',
        description: 'Light and crunchy murmura with traditional masala spices',
        badge: 'New',
        inStock: true,
        dietary: ['vegetarian', 'vegan'],
        ingredients: 'Murmura, Masala spices, Oil',
        weight: '200g'
    },
    {
        id: 'golden-crunch',
        name: 'Golden Crunch (Saloni)',
        price: 130,
        originalPrice: 150,
        category: 'chips',
        image: 'golden-crunch.png',
        description: 'Crispy goodness with golden texture and authentic taste',
        badge: 'Best Seller',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Potato, Spices, Oil',
        weight: '250g'
    },
    {
        id: 'coco-kaju-delight',
        name: 'Coco-Kaju Delight (Chivda)',
        price: 110,
        originalPrice: 130,
        category: 'chivda',
        image: 'coco-kaju-delight.png',
        description: 'Flavorful mix of coconut and cashew nuts with traditional spices',
        badge: 'Popular',
        inStock: true,
        dietary: ['vegetarian'],
        ingredients: 'Coconut, Cashew nuts, Spices, Oil',
        weight: '300g'
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
    },
    {
        id: 'banana-chips',
        name: 'Banana Chips',
        price: 80,
        originalPrice: 90,
        category: 'chips',
        image: 'golden-crunch.png',
        description: 'Fresh made banana chips with authentic taste',
        badge: 'Fresh',
        inStock: true,
        dietary: ['vegetarian', 'vegan'],
        ingredients: 'Banana, Oil, Salt',
        weight: '200g'
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
    }
];

// Global Variables
let cart = [];
let cartCount = 0;
let currentUser = null;
let currentFilters = {
    category: [],
    priceRange: [0, 500],
    dietary: [],
    availability: [],
    search: ''
};
let currentSort = 'default';
let currentView = 'grid';
let currentPage = 1;
const itemsPerPage = 9;

// Cart Management Functions
function getCartKey() {
    return currentUser ? `cart_${currentUser}` : 'cart';
}

function loadCart() {
    const cartKey = getCartKey();
    cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    updateCartCount();
}

function saveCart() {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadCart(); // Load cart after determining user
    if (document.getElementById('products-grid') || document.getElementById('products-list')) {
        loadProducts();
    }
    console.log('Script.js loaded - Current user:', currentUser);
    console.log('Script.js loaded - Cart key:', getCartKey());
});

function initializeApp() {
    // Check if user is logged in
    if (localStorage.getItem('loggedIn') === 'true') {
        currentUser = localStorage.getItem('userContact');
        showUserMenu();
    }

    console.log('Script.js initialized - Current user:', currentUser);

    // Initialize URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        currentFilters.category = [category];
        updateFilterUI();
    }
}

function setupEventListeners() {
    // Proceed to checkout button
    const proceedCheckoutBtn = document.getElementById('proceed-checkout');
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', proceedToCheckout);
    }

    // Search
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Filters
    const filterToggle = document.getElementById('filter-toggle');
    if (filterToggle) {
        filterToggle.addEventListener('click', toggleFilters);
    }
    const applyFiltersBtn = document.getElementById('apply-filters');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    const clearFiltersBtn = document.getElementById('clear-filters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearFilters);
    }

    // Sorting
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }

    // View Toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentView = this.dataset.view;
            updateViewToggle();
            loadProducts();
        });
    });

    // Price Range
    const priceMin = document.getElementById('price-min');
    if (priceMin) {
        priceMin.addEventListener('input', updatePriceRange);
    }
    const priceMax = document.getElementById('price-max');
    if (priceMax) {
        priceMax.addEventListener('input', updatePriceRange);
    }

    // Category Filters
    document.querySelectorAll('.category-filter').forEach(filter => {
        filter.addEventListener('change', updateCategoryFilters);
    });

    // Dietary Filters
    document.querySelectorAll('.diet-filter').forEach(filter => {
        filter.addEventListener('change', updateDietaryFilters);
    });

    // Availability Filters
    document.querySelectorAll('.availability-filter').forEach(filter => {
        filter.addEventListener('change', updateAvailabilityFilters);
    });

    // Modal
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    
    // Newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletter);
    }

    // Login system
    const sendOtpBtn = document.getElementById('send-otp-btn');
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', sendOTP);
    }

    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    if (verifyOtpBtn) {
        verifyOtpBtn.addEventListener('click', verifyOTP);
    }

    const resendOtpBtn = document.getElementById('resend-otp-btn');
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', resendOTP);
    }

    const completeProfileBtn = document.getElementById('complete-profile-btn');
    if (completeProfileBtn) {
        completeProfileBtn.addEventListener('click', () => showLoginStep(4));
    }

    const skipProfileBtn = document.getElementById('skip-profile-btn');
    if (skipProfileBtn) {
        skipProfileBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    const saveProfileBtn = document.getElementById('save-profile-btn');
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfile);
    }

    const backToSuccessBtn = document.getElementById('back-to-success-btn');
    if (backToSuccessBtn) {
        backToSuccessBtn.addEventListener('click', () => showLoginStep(3));
    }

    const continueShoppingBtn = document.getElementById('continue-shopping-btn');
    if (continueShoppingBtn) {
        continueShoppingBtn.addEventListener('click', () => window.location.href = 'index.html');
    }


    // User Menu
    const userMenuBtn = document.getElementById('user-menu-btn');
    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', toggleUserDropdown);
    }

    // Navigation Logout Button
    const logoutBtnNav = document.getElementById('logout-btn-nav');
    if (logoutBtnNav) {
        logoutBtnNav.addEventListener('click', logout);
    }

    // Account Settings
    const accountSettingsLink = document.getElementById('account-settings-link');
    if (accountSettingsLink) {
        accountSettingsLink.addEventListener('click', openAccountSettings);
    }

    const closeAccountModal = document.querySelector('.close-account-modal');
    if (closeAccountModal) {
        closeAccountModal.addEventListener('click', closeAccountModal);
    }

    // Address Management
    const addAddressBtn = document.getElementById('add-address-btn');
    if (addAddressBtn) {
        addAddressBtn.addEventListener('click', openAddressModal);
        console.log('Add address button listener attached');
    }

    const closeAddressModalBtn = document.querySelector('.close-address-modal');
    if (closeAddressModalBtn) {
        closeAddressModalBtn.addEventListener('click', closeAddressModal);
    }

    const addressForm = document.getElementById('address-form');
    if (addressForm) {
        addressForm.addEventListener('submit', saveAddress);
        console.log('Address form submit listener attached');
    }

    // Order Tracking
    const closeTrackingModal = document.querySelector('.close-tracking-modal');
    if (closeTrackingModal) {
        closeTrackingModal.addEventListener('click', closeTrackingModal);
    }

    // Order Invoice
    const closeInvoiceModal = document.querySelector('.close-invoice-modal');
    if (closeInvoiceModal) {
        closeInvoiceModal.addEventListener('click', closeInvoiceModal);
    }

    // Tab switching in account modal
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', switchTab);
    });


    // User dropdown toggle
    function toggleUserDropdown() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    // Close dropdowns when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
        if (!event.target.closest('.user-menu')) {
            const dropdown = document.getElementById('user-dropdown');
            if (dropdown) {
                dropdown.classList.remove('show');
            }
        }
    });
}

// Product Loading Functions
function loadProducts() {
    let filteredProducts = filterProducts(products);
    filteredProducts = sortProducts(filteredProducts);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    if (paginatedProducts.length === 0) {
        showNoResults();
    } else {
        hideNoResults();
        if (currentView === 'grid') {
            renderProductsGrid(paginatedProducts);
        } else {
            renderProductsList(paginatedProducts);
        }
        renderPagination(filteredProducts.length);
    }
    
    updateFilterCount(filteredProducts.length);
}

function filterProducts(products) {
    return products.filter(product => {
        // Category filter
        if (currentFilters.category.length > 0 && !currentFilters.category.includes(product.category)) {
            return false;
        }
        
        // Price range filter
        if (product.price < currentFilters.priceRange[0] || product.price > currentFilters.priceRange[1]) {
            return false;
        }
        
        // Dietary filter
        if (currentFilters.dietary.length > 0) {
            const hasMatchingDiet = currentFilters.dietary.some(diet => 
                product.dietary.includes(diet)
            );
            if (!hasMatchingDiet) return false;
        }
        
        // Availability filter
        if (currentFilters.availability.length > 0) {
            if (currentFilters.availability.includes('in-stock') && !product.inStock) return false;
            if (currentFilters.availability.includes('pre-order') && !product.preOrder) return false;
        }
        
        // Search filter
        if (currentFilters.search) {
            const searchTerm = currentFilters.search.toLowerCase();
            if (!product.name.toLowerCase().includes(searchTerm) && 
                !product.description.toLowerCase().includes(searchTerm) &&
                !product.category.toLowerCase().includes(searchTerm)) {
                return false;
            }
        }
        
        return true;
    });
}

function sortProducts(products) {
    switch (currentSort) {
        case 'price-low':
            return products.sort((a, b) => a.price - b.price);
        case 'price-high':
            return products.sort((a, b) => b.price - a.price);
        case 'name':
            return products.sort((a, b) => a.name.localeCompare(b.name));
        case 'newest':
            return products.sort((a, b) => (b.badge === 'New' ? 1 : 0) - (a.badge === 'New' ? 1 : 0));
        case 'popular':
            return products.sort((a, b) => (b.badge === 'Best Seller' || b.badge === 'Popular' ? 1 : 0) - (a.badge === 'Best Seller' || a.badge === 'Popular' ? 1 : 0));
        default:
            return products;
    }
}

function renderProductsGrid(products) {
    const container = document.getElementById('products-grid');
    container.innerHTML = products.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="product-overlay">
                    <button class="btn btn-primary btn-quick-view" onclick="showProductDetails('${product.id}')">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                </div>
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-weight">${product.weight}</div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                ${!product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
        </div>
    `).join('');
}

function renderProductsList(products) {
    const container = document.getElementById('products-list');
    container.innerHTML = products.map(product => `
        <div class="product-list-item" data-product-id="${product.id}">
            <div class="product-list-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            </div>
            <div class="product-list-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-details">
                    <span class="product-weight">${product.weight}</span>
                    <span class="product-ingredients">${product.ingredients}</span>
                </div>
                <div class="product-dietary">
                    ${product.dietary.map(diet => `<span class="diet-tag">${diet}</span>`).join('')}
                </div>
            </div>
            <div class="product-list-actions">
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                ${!product.inStock ? '<div class="out-of-stock">Out of Stock</div>' : ''}
            </div>
        </div>
    `).join('');
}



// Filter Functions
function toggleFilters() {
    const sidebar = document.getElementById('filters-sidebar');
    sidebar.classList.toggle('show');
}

function applyFilters() {
    loadProducts();
    toggleFilters();
}

function clearFilters() {
    currentFilters = {
        category: [],
        priceRange: [0, 500],
        dietary: [],
        availability: [],
        search: ''
    };
    
    // Reset UI
    document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
    document.querySelectorAll('.diet-filter').forEach(cb => cb.checked = false);
    document.querySelectorAll('.availability-filter').forEach(cb => cb.checked = false);
    document.getElementById('price-min').value = 0;
    document.getElementById('price-max').value = 500;
    document.getElementById('price-min-display').textContent = '0';
    document.getElementById('price-max-display').textContent = '500';
    document.getElementById('search-input').value = '';
    
    loadProducts();
}

function updateCategoryFilters() {
    currentFilters.category = Array.from(document.querySelectorAll('.category-filter:checked'))
        .map(cb => cb.value);
}

function updateDietaryFilters() {
    currentFilters.dietary = Array.from(document.querySelectorAll('.diet-filter:checked'))
        .map(cb => cb.value);
}

function updateAvailabilityFilters() {
    currentFilters.availability = Array.from(document.querySelectorAll('.availability-filter:checked'))
        .map(cb => cb.value);
}

function updatePriceRange() {
    const minPrice = parseInt(document.getElementById('price-min').value);
    const maxPrice = parseInt(document.getElementById('price-max').value);
    
    currentFilters.priceRange = [minPrice, maxPrice];
    
    document.getElementById('price-min-display').textContent = minPrice;
    document.getElementById('price-max-display').textContent = maxPrice;
}

function handleSearch() {
    currentFilters.search = document.getElementById('search-input').value;
    loadProducts();
}

function handleSort() {
    currentSort = document.getElementById('sort-select').value;
    loadProducts();
}

function updateViewToggle() {
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${currentView}"]`).classList.add('active');
}

function updateFilterCount(count) {
    const filterCount = document.getElementById('filter-count');
    if (count === products.length) {
        filterCount.textContent = 'All Products';
    } else {
        filterCount.textContent = `${count} Products`;
    }
}

function updateFilterUI() {
    // Update checkboxes based on current filters
    document.querySelectorAll('.category-filter').forEach(cb => {
        cb.checked = currentFilters.category.includes(cb.value);
    });
    document.querySelectorAll('.diet-filter').forEach(cb => {
        cb.checked = currentFilters.dietary.includes(cb.value);
    });
    document.querySelectorAll('.availability-filter').forEach(cb => {
        cb.checked = currentFilters.availability.includes(cb.value);
    });
}

// Pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const container = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let paginationHTML = '<div class="pagination-container">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>`;
    }
    
    paginationHTML += '</div>';
    container.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// No Results
function showNoResults() {
    document.getElementById('no-results').style.display = 'block';
    document.getElementById('products-grid').style.display = 'none';
    document.getElementById('products-list').style.display = 'none';
    document.getElementById('pagination').innerHTML = '';
}

function hideNoResults() {
    document.getElementById('no-results').style.display = 'none';
    if (currentView === 'grid') {
        document.getElementById('products-grid').style.display = 'grid';
    } else {
        document.getElementById('products-list').style.display = 'block';
    }
}


// Utility Functions
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showProductDetails(productId) {
    // This would open a product detail modal or navigate to product page
    showToast('Product details coming soon!');
}

function toggleWishlist(productId) {
    showToast('Wishlist feature coming soon!');
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCartCount();

    // Show simple toast notification
    showToast(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = quantity;
            saveCart();
            updateCartCount();
        }
    }
}

function updateCartCount() {
    cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = cartCount;
    }
    console.log('Cart count updated:', cartCount, 'for user:', currentUser);
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty. Add some items before proceeding to checkout.');
        return;
    }

    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn) {
        showToast('Please login to proceed to checkout');
        // Show login modal or redirect to login page
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.click();
        } else {
            window.location.href = 'login.html';
        }
        return;
    }

    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

function handleNewsletter(event) {
    event.preventDefault();
    const email = event.target.querySelector('input[type="email"]').value;
    showToast('Thank you for subscribing to our newsletter!');
    event.target.reset();
}

// Login System Functions
async function sendOTP() {
    const contactInput = document.getElementById('login-contact');
    const email = contactInput.value.trim();

    if (!email) {
        showToast('Please enter your email address');
        return;
    }

    if (!isValidEmail(email)) {
        showToast('Please enter a valid email address');
        return;
    }

    // Show loading state
    const sendBtn = document.getElementById('send-otp-btn');
    const btnText = sendBtn.querySelector('.btn-text');
    const btnLoader = sendBtn.querySelector('.btn-loader');
    btnText.textContent = 'Sending...';
    btnLoader.style.display = 'inline-block';
    sendBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8000/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: email })
        });

        const data = await response.json();

        if (data.success) {
            // Store email for verification
            localStorage.setItem('pendingEmail', email);

            // Update UI
            document.getElementById('otp-email-display').textContent = email;
            showLoginStep(2);
            startOTPTimer();
            showToast('OTP sent to your email!');
        } else {
            showToast(data.message || 'Failed to send OTP');
        }
    } catch (error) {
        console.error('OTP send error:', error);
        showToast('Failed to send OTP. Please try again.');
    } finally {
        // Reset button state
        btnText.textContent = 'Send Login Code';
        btnLoader.style.display = 'none';
        sendBtn.disabled = false;
    }
}

async function verifyOTP() {
    const otpInputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(otpInputs).map(input => input.value).join('');

    if (otp.length !== 6) {
        showToast('Please enter the complete 6-digit code');
        return;
    }

    const email = localStorage.getItem('pendingEmail');
    if (!email) {
        showToast('Session expired. Please try again.');
        showLoginStep(1);
        return;
    }

    // Show loading state
    const verifyBtn = document.getElementById('verify-otp-btn');
    const btnText = verifyBtn.querySelector('.btn-text');
    const btnLoader = verifyBtn.querySelector('.btn-loader');
    btnText.textContent = 'Verifying...';
    btnLoader.style.display = 'inline-block';
    verifyBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8000/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: email, otp: otp })
        });

        const data = await response.json();

        if (data.success) {
            // Login successful
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userContact', email);
            localStorage.setItem('sessionToken', Date.now().toString());
            localStorage.removeItem('pendingEmail');

            // Update user display
            const userEmailDisplay = document.getElementById('user-email-display');
            if (userEmailDisplay) {
                userEmailDisplay.textContent = email;
            }
            currentUser = email;

            // Track login time for admin panel
            localStorage.setItem(`lastLogin_${email}`, new Date().toISOString());

            showLoginStep(3);
            showToast('Login successful!');


            // Show profile completion step instead of auto redirect
            showLoginStep(3);
        } else {
            showToast(data.message || 'Invalid OTP');
        }
    } catch (error) {
        console.error('OTP verify error:', error);
        showToast('Failed to verify OTP. Please try again.');
    } finally {
        // Reset button state
        btnText.textContent = 'Verify Code';
        btnLoader.style.display = 'none';
        verifyBtn.disabled = false;
    }
}

async function resendOTP() {
    const email = localStorage.getItem('pendingEmail');
    if (!email) {
        showToast('Session expired. Please try again.');
        showLoginStep(1);
        return;
    }

    // Show loading state
    const resendBtn = document.getElementById('resend-otp-btn');
    const btnText = resendBtn.querySelector('.btn-text');
    const btnLoader = resendBtn.querySelector('.btn-loader');
    btnText.textContent = 'Sending...';
    btnLoader.style.display = 'inline-block';
    resendBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8000/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: email })
        });

        const data = await response.json();

        if (data.success) {
            startOTPTimer();
            showToast('OTP resent to your email!');
        } else {
            showToast(data.message || 'Failed to resend OTP');
        }
    } catch (error) {
        console.error('OTP resend error:', error);
        showToast('Failed to resend OTP. Please try again.');
    } finally {
        // Reset button state
        btnText.textContent = 'Didn\'t receive code? Resend';
        btnLoader.style.display = 'none';
        resendBtn.disabled = false;
    }
}

function startOTPTimer() {
    let timeLeft = 300; // 5 minutes
    const timerElement = document.getElementById('otp-timer');

    const timer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(timer);
            timerElement.textContent = '00:00';
            showToast('OTP expired. Please request a new one.');
        }
    }, 1000);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// OTP Input Handling
document.addEventListener('DOMContentLoaded', function() {
    // OTP input handling
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Allow only numbers
            this.value = this.value.replace(/[^0-9]/g, '');

            // Auto focus next input
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }

            // Auto submit when all digits entered
            const allFilled = Array.from(otpInputs).every(inp => inp.value.length === 1);
            if (allFilled) {
                verifyOTP();
            }
        });

        input.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace' && this.value.length === 0 && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const digits = paste.replace(/[^0-9]/g, '').slice(0, 6);

            digits.split('').forEach((digit, i) => {
                if (otpInputs[i]) {
                    otpInputs[i].value = digit;
                }
            });

            // Focus last filled input or next empty one
            const lastIndex = Math.min(digits.length - 1, otpInputs.length - 1);
            otpInputs[lastIndex].focus();

            // Auto submit if complete
            if (digits.length === 6) {
                setTimeout(verifyOTP, 100);
            }
        });
    });
});

// Initialize featured products on homepage
function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;

    const featuredProducts = products.slice(0, 6);
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load best sellers carousel
function loadBestSellers() {
    const container = document.getElementById('best-sellers-track');
    if (!container) return;

    const bestSellers = products.filter(p => p.badge === 'Best Seller' || p.badge === 'Popular');
    container.innerHTML = bestSellers.map(product => `
        <div class="product-card" data-product-id="${product.id}">
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-content">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">₹${product.price}</span>
                    ${product.originalPrice > product.price ? `<span class="original-price">₹${product.originalPrice}</span>` : ''}
                </div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-wishlist" onclick="toggleWishlist('${product.id}')">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}


function showLoginStep(step) {
    // Hide all steps
    document.querySelectorAll('.login-step').forEach(stepEl => {
        stepEl.classList.remove('active');
    });

    // Update progress indicators
    document.querySelectorAll('.progress-step').forEach((indicator, index) => {
        if (index + 1 <= step) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });

    // Show current step
    const currentStep = document.getElementById(`login-step-${step}`);
    if (currentStep) {
        currentStep.classList.add('active');
    }
}

async function saveProfile() {
    const firstName = document.getElementById('profile-first-name').value.trim();
    const lastName = document.getElementById('profile-last-name').value.trim();
    const phone = document.getElementById('profile-phone').value.trim();
    const address = document.getElementById('profile-address').value.trim();
    const city = document.getElementById('profile-city').value.trim();
    const state = document.getElementById('profile-state').value.trim();
    const pincode = document.getElementById('profile-pincode').value.trim();

    // Validation
    let isValid = true;
    const errors = {
        'first-name': 'First name is required',
        'last-name': 'Last name is required',
        'phone': 'Phone number is required',
        'address': 'Address is required',
        'city': 'City is required',
        'state': 'State is required',
        'pincode': 'Pincode is required'
    };

    // Clear previous errors
    Object.keys(errors).forEach(key => {
        const errorEl = document.getElementById(key + '-error');
        if (errorEl) errorEl.style.display = 'none';
    });

    // Check required fields
    if (!firstName) {
        document.getElementById('first-name-error').textContent = errors['first-name'];
        document.getElementById('first-name-error').style.display = 'block';
        isValid = false;
    }
    if (!lastName) {
        document.getElementById('last-name-error').textContent = errors['last-name'];
        document.getElementById('last-name-error').style.display = 'block';
        isValid = false;
    }
    if (!phone) {
        document.getElementById('phone-error').textContent = errors['phone'];
        document.getElementById('phone-error').style.display = 'block';
        isValid = false;
    }
    if (!address) {
        document.getElementById('address-error').textContent = errors['address'];
        document.getElementById('address-error').style.display = 'block';
        isValid = false;
    }
    if (!city) {
        document.getElementById('city-error').textContent = errors['city'];
        document.getElementById('city-error').style.display = 'block';
        isValid = false;
    }
    if (!state) {
        document.getElementById('state-error').textContent = errors['state'];
        document.getElementById('state-error').style.display = 'block';
        isValid = false;
    }
    if (!pincode) {
        document.getElementById('pincode-error').textContent = errors['pincode'];
        document.getElementById('pincode-error').style.display = 'block';
        isValid = false;
    }

    if (!isValid) return;

    // Show loading state
    const saveBtn = document.getElementById('save-profile-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoader = saveBtn.querySelector('.btn-loader');
    btnText.textContent = 'Saving...';
    btnLoader.style.display = 'inline-block';
    saveBtn.disabled = true;

    try {
        // Save profile data to localStorage
        const profileData = {
            firstName,
            lastName,
            phone,
            address,
            city,
            state,
            pincode,
            email: currentUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(`profile_${currentUser}`, JSON.stringify(profileData));

        // Show success and redirect
        showToast('Profile saved successfully!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);

    } catch (error) {
        console.error('Profile save error:', error);
        showToast('Failed to save profile. Please try again.');
    } finally {
        // Reset button state
        btnText.textContent = 'Save Profile & Continue';
        btnLoader.style.display = 'none';
        saveBtn.disabled = false;
    }
}

function showUserMenu() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.style.display = 'none';

    const userMenu = document.getElementById('user-menu');
    if (userMenu) {
        userMenu.style.display = 'block';
        const userEmailNav = document.getElementById('user-email-nav');
        if (userEmailNav) userEmailNav.textContent = currentUser;
        const userContactNav = document.getElementById('user-contact-nav');
        if (userContactNav) userContactNav.textContent = currentUser;
    }

    // Show logout button in navigation
    const logoutMenuItem = document.getElementById('logout-menu-item');
    if (logoutMenuItem) {
        logoutMenuItem.style.display = 'block';
    }
}

function logout() {
    // Save current cart before logout
    saveCart();

    const token = localStorage.getItem('sessionToken');
    if (token) {
        fetch('http://localhost:8000/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
    }

    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userContact');
    localStorage.removeItem('sessionToken');

    // Clear current user and load guest cart
    currentUser = null;
    loadCart();

    // Hide user menu and show login button
    const userMenu = document.getElementById('user-menu');
    if (userMenu) userMenu.style.display = 'none';

    const logoutMenuItem = document.getElementById('logout-menu-item');
    if (logoutMenuItem) {
        logoutMenuItem.style.display = 'none';
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) loginBtn.style.display = 'block';

    showToast('Logged out successfully');
}

// Account Settings Functions
function openAccountSettings() {
    const modal = document.getElementById('account-modal');
    if (modal) {
        modal.style.display = 'block';

        // Load user profile info
        const profileEmail = document.getElementById('profile-email');
        if (profileEmail) profileEmail.textContent = currentUser || 'user@example.com';

        const memberSince = document.getElementById('member-since');
        if (memberSince) memberSince.textContent = 'January 2025'; // You can store this in localStorage

        // Load addresses
        loadUserAddresses();

        // Load order history
        loadUserOrders();
    }
}

function closeAccountModal() {
    const modal = document.getElementById('account-modal');
    if (modal) modal.style.display = 'none';
}

function switchTab(e) {
    const tabName = e.target.dataset.tab;

    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    e.target.classList.add('active');
}

// Address Management Functions
function openAddressModal() {
    const modal = document.getElementById('address-modal');
    if (modal) modal.style.display = 'block';
}

function closeAddressModal() {
    const modal = document.getElementById('address-modal');
    if (modal) modal.style.display = 'none';
}

function saveAddress(e) {
    e.preventDefault();

    console.log('Saving address...');
    console.log('Current user:', currentUser);

    if (!currentUser) {
        showToast('Please login to save addresses');
        closeAddressModal();
        return;
    }

    const formData = new FormData(e.target);
    const addressData = {
        id: Date.now().toString(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        city: formData.get('city'),
        state: formData.get('state'),
        pincode: formData.get('pincode'),
        isDefault: formData.get('isDefault') === 'on'
    };

    console.log('Address data:', addressData);

    // Save to localStorage (in production, save to server)
    const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
    console.log('Existing addresses:', addresses);

    addresses.push(addressData);
    localStorage.setItem(`addresses_${currentUser}`, JSON.stringify(addresses));

    console.log('Address saved successfully');
    showToast('Address saved successfully!');
    closeAddressModal();
    loadUserAddresses();

    // Reset form
    e.target.reset();
}

function loadUserAddresses() {
    const container = document.getElementById('saved-addresses');
    if (!container) return;

    const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');

    if (addresses.length === 0) {
        container.innerHTML = '<p class="no-addresses">No saved addresses yet.</p>';
        return;
    }

    container.innerHTML = addresses.map(addr => `
        <div class="address-card">
            <div class="address-header">
                <h4>${addr.firstName} ${addr.lastName}</h4>
                ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}
            </div>
            <div class="address-details">
                <p>${addr.address}</p>
                <p>${addr.city}, ${addr.state} - ${addr.pincode}</p>
                <p>Phone: ${addr.phone}</p>
            </div>
            <div class="address-actions">
                <button class="btn btn-outline btn-sm" onclick="editAddress('${addr.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-outline btn-sm btn-danger" onclick="deleteAddress('${addr.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function editAddress(addressId) {
    // For now, just show a message. In production, open edit modal
    showToast('Edit address feature coming soon!');
}

function deleteAddress(addressId) {
    if (confirm('Are you sure you want to delete this address?')) {
        const addresses = JSON.parse(localStorage.getItem(`addresses_${currentUser}`) || '[]');
        const filteredAddresses = addresses.filter(addr => addr.id !== addressId);
        localStorage.setItem(`addresses_${currentUser}`, JSON.stringify(filteredAddresses));
        loadUserAddresses();
        showToast('Address deleted successfully!');
    }
}

// Order History Functions
function loadUserOrders() {
    const container = document.getElementById('order-history');
    if (!container) return;

    // For demo purposes, create some sample orders
    // In production, fetch from server
    const sampleOrders = [
        {
            id: 'RAS123456',
            date: '2025-01-15',
            status: 'Delivered',
            total: 450,
            items: ['Masala Murmura', 'Golden Crunch']
        },
        {
            id: 'RAS123457',
            date: '2025-01-10',
            status: 'Shipped',
            total: 280,
            items: ['Coco-Kaju Delight']
        }
    ];

    if (sampleOrders.length === 0) {
        container.innerHTML = '<p class="no-orders">No orders found.</p>';
        return;
    }

    container.innerHTML = sampleOrders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-info">
                    <h4>Order #${order.id}</h4>
                    <p>Placed on ${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="order-status">
                    <span class="status-${order.status.toLowerCase()}">${order.status}</span>
                </div>
            </div>
            <div class="order-details">
                <p><strong>Items:</strong> ${order.items.join(', ')}</p>
                <p><strong>Total:</strong> ₹${order.total}</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-outline btn-sm" onclick="trackOrder('${order.id}')">
                    <i class="fas fa-truck"></i> Track Order
                </button>
                <button class="btn btn-outline btn-sm" onclick="viewInvoice('${order.id}')">
                    <i class="fas fa-receipt"></i> View Invoice
                </button>
            </div>
        </div>
    `).join('');
}

function trackOrder(orderId) {
    // Fetch tracking data from server
    fetch(`http://localhost:8000/order/${orderId}/track`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                openTrackingModal(data);
            } else {
                showToast('Order tracking information not available');
            }
        })
        .catch(error => {
            console.error('Tracking error:', error);
            showToast('Unable to load tracking information');
        });
}

function openTrackingModal(data) {
    const modal = document.getElementById('tracking-modal');
    if (!modal) return;

    modal.style.display = 'block';

    // Update order details
    document.getElementById('track-order-id').textContent = data.order.id;
    document.getElementById('track-order-date').textContent = new Date().toLocaleDateString();

    // Update delivery info
    document.getElementById('tracking-id').textContent = data.tracking.trackingId;
    document.getElementById('est-delivery').textContent = data.tracking.estimatedDelivery;

    // Update timeline
    const timelineContainer = modal.querySelector('.tracking-timeline');
    if (timelineContainer) {
        timelineContainer.innerHTML = data.tracking.timeline.map((item, index) => `
            <div class="timeline-item ${item.completed ? 'completed' : ''} ${index === data.tracking.timeline.findIndex(t => !t.completed) ? 'active' : ''}">
                <div class="timeline-icon">
                    <i class="fas fa-${getTimelineIcon(item.status)}"></i>
                </div>
                <div class="timeline-content">
                    <h4>${item.title}</h4>
                    <p>${item.description}</p>
                    <span class="timeline-date">${item.date}</span>
                </div>
            </div>
        `).join('');
    }
}

function getTimelineIcon(status) {
    switch (status) {
        case 'confirmed': return 'check';
        case 'packed': return 'box';
        case 'shipped': return 'truck';
        case 'delivered': return 'check-circle';
        default: return 'circle';
    }
}

function closeTrackingModal() {
    const modal = document.getElementById('tracking-modal');
    if (modal) modal.style.display = 'none';
}

function viewInvoice(orderId) {
    // For demo purposes, create sample invoice data
    // In production, fetch from server
    const sampleOrder = {
        id: orderId,
        date: '2025-01-15',
        items: [
            { name: 'Masala Murmura', quantity: 2, price: 60 },
            { name: 'Golden Crunch', quantity: 1, price: 130 }
        ],
        shipping: {
            firstName: 'John',
            lastName: 'Doe',
            address: '123 Main Street, Apartment 4B',
            city: 'Satna',
            state: 'Madhya Pradesh',
            pincode: '485001',
            phone: '+91 9876543210',
            email: 'john@example.com'
        },
        subtotal: 250,
        shippingCost: 50,
        tax: 45,
        total: 345,
        paymentMethod: 'Razorpay',
        transactionId: 'TXN' + Math.random().toString().substr(2, 10)
    };

    openInvoiceModal(sampleOrder);
}

function openInvoiceModal(order) {
    const modal = document.getElementById('invoice-modal');
    if (!modal) return;

    modal.style.display = 'block';

    // Update invoice header
    document.getElementById('invoice-number').textContent = 'INV' + order.id.slice(3);
    document.getElementById('invoice-date').textContent = new Date(order.date).toLocaleDateString();
    document.getElementById('invoice-order-id').textContent = order.id;

    // Update billing info
    document.getElementById('billing-name').textContent =
        `${order.shipping.firstName} ${order.shipping.lastName}`;
    document.getElementById('billing-address').textContent =
        `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}`;
    document.getElementById('billing-phone').textContent = order.shipping.phone;
    document.getElementById('billing-email').textContent = order.shipping.email;

    // Update items table
    const itemsContainer = document.getElementById('invoice-items');
    itemsContainer.innerHTML = order.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price}</td>
            <td>₹${item.price * item.quantity}</td>
        </tr>
    `).join('');

    // Update summary
    document.getElementById('invoice-subtotal').textContent = `₹${order.subtotal}`;
    document.getElementById('invoice-shipping').textContent = `₹${order.shippingCost}`;
    document.getElementById('invoice-tax').textContent = `₹${order.tax}`;
    document.getElementById('invoice-total').textContent = `₹${order.total}`;

    // Update payment info
    document.getElementById('payment-method').textContent = order.paymentMethod;
    document.getElementById('transaction-id').textContent = order.transactionId;
}

function closeInvoiceModal() {
    const modal = document.getElementById('invoice-modal');
    if (modal) modal.style.display = 'none';
}

function printInvoice() {
    const modal = document.getElementById('invoice-modal');
    const modalContent = modal.querySelector('.modal-content');

    // Hide modal elements for printing
    const modalHeader = modal.querySelector('.modal-header');
    const printBtn = modal.querySelector('.btn');
    const closeBtn = modal.querySelector('.close-invoice-modal');

    modalHeader.style.display = 'none';
    printBtn.style.display = 'none';
    closeBtn.style.display = 'none';

    // Print
    window.print();

    // Restore modal elements
    modalHeader.style.display = 'flex';
    printBtn.style.display = 'inline-block';
    closeBtn.style.display = 'block';
}

// Initialize homepage content
if (document.getElementById('featured-products')) {
    loadFeaturedProducts();
}

if (document.getElementById('best-sellers-track')) {
    loadBestSellers();
}