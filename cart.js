// Cart Page JavaScript

// Global Variables
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let appliedCoupon = null;

// Initialize cart page
document.addEventListener('DOMContentLoaded', function() {
    initializeCart();
    setupCartEventListeners();
    loadCartItems();
    updateCartSummary();
    loadRecommendedProducts();
});

function initializeCart() {
    // Check if user is logged in
    if (localStorage.getItem('loggedIn') === 'true') {
        document.getElementById('login-btn').style.display = 'none';
        document.getElementById('logout-btn').style.display = 'inline-flex';
    }
    
    // Update cart count
    updateCartCount();
}

function setupCartEventListeners() {
    // Coupon application
    document.getElementById('apply-coupon').addEventListener('click', applyCoupon);
    document.getElementById('coupon-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
    
    // Login/Logout
    document.getElementById('login-btn').addEventListener('click', showLoginModal);
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
}

function loadCartItems() {
    const container = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart');
    const itemCount = document.getElementById('item-count');
    const cartActions = document.getElementById('cart-actions');

    if (cart.length === 0) {
        container.style.display = 'none';
        emptyCart.style.display = 'block';
        cartActions.style.display = 'none';
        itemCount.textContent = '0 items';
        return;
    }

    container.style.display = 'block';
    emptyCart.style.display = 'none';
    cartActions.style.display = 'flex';

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    itemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;

    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-product-id="${item.id}">
            <div class="item-number">${index + 1}</div>
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
                <div class="item-stock-status">
                    <i class="fas fa-check-circle"></i> In Stock
                </div>
            </div>
            <div class="item-details">
                <h3 class="item-name">
                    <a href="product.html?id=${item.id}" target="_blank">${item.name}</a>
                </h3>
                <p class="item-price">₹${item.price} each</p>
                <div class="item-meta">
                    <span class="item-weight">Net wt: ${getProductWeight(item.id)}</span>
                    <span class="item-category">${getProductCategory(item.id)}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-remove" onclick="removeFromCart('${item.id}')" title="Remove from cart">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                    <button class="btn-wishlist" onclick="moveToWishlist('${item.id}')" title="Move to wishlist">
                        <i class="fas fa-heart"></i> Save for Later
                    </button>
                    <button class="btn-share" onclick="shareProduct('${item.id}')" title="Share product">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
            <div class="item-quantity">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                        <i class="fas fa-minus"></i>
                    </button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10"
                           onchange="updateQuantity('${item.id}', parseInt(this.value) || 1)">
                    <button class="quantity-btn plus" onclick="updateQuantity('${item.id}', ${item.quantity + 1})" ${item.quantity >= 10 ? 'disabled' : ''}>
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                <div class="quantity-limits">
                    <small>Max: 10 per item</small>
                </div>
            </div>
            <div class="item-total">
                <span class="total-price">₹${item.price * item.quantity}</span>
                ${item.quantity > 1 ? `<small class="unit-price">₹${item.price} each</small>` : ''}
            </div>
        </div>
    `).join('');

    // Add event listeners for quantity inputs
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.closest('.cart-item').dataset.productId;
            const newQuantity = parseInt(this.value) || 1;
            updateQuantity(productId, Math.max(1, Math.min(10, newQuantity)));
        });
    });
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        if (confirm('Remove this item from cart?')) {
            removeFromCart(productId);
        }
        return;
    }

    if (newQuantity > 10) {
        showToast('Maximum 10 items allowed per product');
        newQuantity = 10;
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        const oldQuantity = item.quantity;
        item.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));

        // Update only the changed item instead of reloading all
        updateCartItemDisplay(productId);
        updateCartSummary();
        updateCartCount();
        updateMiniCart();

        // Show quantity change feedback
        if (newQuantity > oldQuantity) {
            showToast(`Added ${newQuantity - oldQuantity} more item(s)`);
        } else if (newQuantity < oldQuantity) {
            showToast(`Removed ${oldQuantity - newQuantity} item(s)`);
        }
    }
}

function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const itemName = item.name;
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));

    loadCartItems();
    updateCartSummary();
    updateCartCount();
    updateMiniCart();

    showToast(`"${itemName}" removed from cart`);
}

function updateCartCount() {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const total = subtotal + shipping + tax - discount;
    
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('shipping').textContent = `₹${shipping}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('total').textContent = `₹${total}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('coupon-row');
    if (appliedCoupon) {
        discountRow.style.display = 'flex';
        document.getElementById('discount').textContent = `-₹${discount}`;
    } else {
        discountRow.style.display = 'none';
    }
    
    // Update shipping notice
    if (subtotal > 500) {
        document.getElementById('shipping').textContent = 'FREE';
        document.getElementById('shipping').style.color = '#27ae60';
    } else {
        document.getElementById('shipping').textContent = `₹${shipping}`;
        document.getElementById('shipping').style.color = '#666';
    }
}

function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value.trim().toUpperCase();
    const messageDiv = document.getElementById('coupon-message');
    
    if (!couponCode) {
        showToast('Please enter a coupon code');
        return;
    }
    
    // Valid coupons
    const validCoupons = {
        'WELCOME10': { discount: 10, type: 'percentage', minOrder: 100 },
        'SAVE50': { discount: 50, type: 'fixed', minOrder: 200 },
        'DIWALI20': { discount: 20, type: 'percentage', minOrder: 300 },
        'FREESHIP': { discount: 50, type: 'fixed', minOrder: 0 }
    };
    
    if (validCoupons[couponCode]) {
        const coupon = validCoupons[couponCode];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (subtotal < coupon.minOrder) {
            messageDiv.innerHTML = `
                <div class="coupon-error">
                    <i class="fas fa-times-circle"></i>
                    Minimum order of ₹${coupon.minOrder} required for this coupon
                </div>
            `;
            showToast(`Minimum order of ₹${coupon.minOrder} required`);
            return;
        }
        
        let discountAmount = 0;
        if (coupon.type === 'percentage') {
            discountAmount = Math.round((subtotal * coupon.discount) / 100);
        } else {
            discountAmount = coupon.discount;
        }
        
        appliedCoupon = {
            code: couponCode,
            discount: discountAmount,
            type: coupon.type
        };
        
        messageDiv.innerHTML = `
            <div class="coupon-success">
                <i class="fas fa-check-circle"></i>
                Coupon applied! You saved ₹${discountAmount}
            </div>
        `;
        
        updateCartSummary();
        showToast(`Coupon applied! You saved ₹${discountAmount}`);
    } else {
        messageDiv.innerHTML = `
            <div class="coupon-error">
                <i class="fas fa-times-circle"></i>
                Invalid coupon code
            </div>
        `;
        showToast('Invalid coupon code');
    }
}

function loadRecommendedProducts() {
    const container = document.getElementById('recommended-products');
    
    // Sample recommended products
    const recommendedProducts = [
        {
            id: 'banana-chips',
            name: 'Banana Chips',
            price: 80,
            originalPrice: 90,
            image: 'golden-crunch.png',
            description: 'Fresh made banana chips with authentic taste',
            badge: 'Fresh'
        },
        {
            id: 'namak-para',
            name: 'Namak Para',
            price: 90,
            originalPrice: 100,
            image: 'murmura.png',
            description: 'Traditional crunchy namak para',
            badge: 'Traditional'
        },
        {
            id: 'diwali-sweets',
            name: 'Diwali Sweets Collection',
            price: 299,
            originalPrice: 350,
            image: 'diwali-sweet2.jpg',
            description: 'Festive sweets collection',
            badge: 'Pre-order'
        }
    ];
    
    container.innerHTML = recommendedProducts.map(product => `
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
                </div>
            </div>
        </div>
    `).join('');
}

function addToCart(productId) {
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (!isLoggedIn) {
        showToast('Please login first to add items to cart');
        showLoginModal();
        return;
    }
    
    // Find product in our product data
    const products = [
        {
            id: 'masala-murmura',
            name: 'Masala Murmura',
            price: 60,
            image: 'murmura.png'
        },
        {
            id: 'golden-crunch',
            name: 'Golden Crunch (Saloni)',
            price: 130,
            image: 'golden-crunch.png'
        },
        {
            id: 'coco-kaju-delight',
            name: 'Coco-Kaju Delight (Chivda)',
            price: 110,
            image: 'coco-kaju-delight.png'
        },
        {
            id: 'banana-chips',
            name: 'Banana Chips',
            price: 80,
            image: 'golden-crunch.png'
        },
        {
            id: 'namak-para',
            name: 'Namak Para',
            price: 90,
            image: 'murmura.png'
        },
        {
            id: 'diwali-sweets',
            name: 'Diwali Sweets Collection',
            price: 299,
            image: 'diwali-sweet2.jpg'
        }
    ];
    
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
    
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCartItems();
    updateCartSummary();
    updateCartCount();
    updateMiniCart();
    showToast(`${product.name} added to cart!`);
}

function toggleWishlist(productId) {
    showToast('Wishlist feature coming soon!');
}

function updateMiniCart() {
    const container = document.getElementById('mini-cart-items');
    const totalElement = document.getElementById('mini-cart-total');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        totalElement.textContent = '0';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="mini-cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="mini-cart-item-info">
                <h4>${item.name}</h4>
                <p>₹${item.price} x ${item.quantity}</p>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalElement.textContent = total;
}


function logout() {
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
    
    document.getElementById('login-btn').style.display = 'inline-flex';
    document.getElementById('logout-btn').style.display = 'none';
    
    showToast('Logged out successfully');
}

function showLoginModal() {
    document.getElementById('login-modal').style.display = 'block';
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// New cart management functions
function clearCart() {
    if (confirm('Are you sure you want to clear your entire cart?')) {
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        appliedCoupon = null;
        loadCartItems();
        updateCartSummary();
        updateCartCount();
        updateMiniCart();
        showToast('Cart cleared successfully', 'success');
    }
}

function updateCart() {
    // This function can be used to refresh cart data from server if needed
    loadCartItems();
    updateCartSummary();
    showToast('Cart updated', 'success');
}

function saveCart() {
    const cartName = prompt('Enter a name for your saved cart:');
    if (cartName && cartName.trim()) {
        const savedCarts = JSON.parse(localStorage.getItem('savedCarts') || '[]');
        savedCarts.push({
            name: cartName.trim(),
            items: [...cart],
            date: new Date().toISOString()
        });
        localStorage.setItem('savedCarts', JSON.stringify(savedCarts));
        showToast(`Cart "${cartName}" saved successfully!`, 'success');
    }
}

function moveToWishlist(productId) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    // Add to wishlist (you can implement wishlist storage)
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    wishlist.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        dateAdded: new Date().toISOString()
    });
    localStorage.setItem('wishlist', JSON.stringify(wishlist));

    // Remove from cart
    removeFromCart(productId);
    showToast(`"${item.name}" moved to wishlist`, 'success');
}

function shareProduct(productId) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    const shareUrl = `${window.location.origin}/product.html?id=${productId}`;
    const shareText = `Check out ${item.name} from Rasoiyaa Food! ${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: item.name,
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Product link copied to clipboard!', 'success');
        });
    }
}

// Helper functions
function getProductWeight(productId) {
    const productWeights = {
        'masala-murmura': '125g',
        'golden-crunch': '350g',
        'coco-kaju-delight': '200g',
        'banana-chips': '120g',
        'namak-para': '250g',
        'khasta-papdi': '250g',
        'combo-3pc': '500g',
        'diwali-sweets': '500g'
    };
    return productWeights[productId] || 'N/A';
}

function getProductCategory(productId) {
    const productCategories = {
        'masala-murmura': 'Murmura',
        'golden-crunch': 'Chips',
        'coco-kaju-delight': 'Chivda',
        'banana-chips': 'Chips',
        'namak-para': 'Namak Para',
        'khasta-papdi': 'Papdi',
        'combo-3pc': 'Combo',
        'diwali-sweets': 'Sweets'
    };
    return productCategories[productId] || 'Snack';
}

function updateCartItemDisplay(productId) {
    const itemElement = document.querySelector(`[data-product-id="${productId}"]`);
    if (!itemElement) return;

    const item = cart.find(item => item.id === productId);
    if (!item) return;

    // Update quantity display
    const quantityInput = itemElement.querySelector('.quantity-input');
    const quantityDisplay = itemElement.querySelector('.quantity');
    const totalPrice = itemElement.querySelector('.total-price');

    if (quantityInput) quantityInput.value = item.quantity;
    if (quantityDisplay) quantityDisplay.textContent = item.quantity;
    if (totalPrice) totalPrice.textContent = `₹${item.price * item.quantity}`;

    // Update button states
    const minusBtn = itemElement.querySelector('.quantity-btn.minus');
    const plusBtn = itemElement.querySelector('.quantity-btn.plus');

    if (minusBtn) minusBtn.disabled = item.quantity <= 1;
    if (plusBtn) plusBtn.disabled = item.quantity >= 10;
}
