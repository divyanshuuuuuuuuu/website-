// Cart Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadCartItems();
    updateCartTotals();
});

// Load cart items on cart page
function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCart = document.getElementById('empty-cart');
    const cartContent = document.getElementById('cart-content');
    const itemCount = document.getElementById('item-count');

    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }

    emptyCart.style.display = 'none';
    cartContent.style.display = 'block';
    itemCount.textContent = cart.length;

    cartItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';

        return `
            <div class="cart-item-card">
                <div class="cart-item-main">
                    <div class="cart-item-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                    </div>
                    <div class="cart-item-info">
                        <h3 class="cart-item-title">${product.name}</h3>
                        <p class="cart-item-description">${product.description}</p>
                        <div class="cart-item-meta">
                            <span class="cart-item-weight">${product.weight}</span>
                            <span class="cart-item-price">₹${product.price} each</span>
                        </div>
                    </div>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn qty-minus" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', parseInt(this.value) || 1)">
                        <button class="qty-btn qty-plus" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">
                        <span class="total-label">Total:</span>
                        <span class="total-amount">₹${(product.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" title="Remove item">
                        <i class="fas fa-trash-alt"></i>
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeCartItem(productId);
        return;
    }

    // Limit max quantity to 99
    if (newQuantity > 99) {
        newQuantity = 99;
        showToast('Maximum quantity is 99');
    }

    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        saveCart();
        updateCartCount();
        loadCartItems();
        updateCartTotals();
        showToast('Quantity updated');
    }
}

function removeCartItem(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    loadCartItems();
    updateCartTotals();
    showToast('Item removed from cart');
}

function updateCartTotals() {
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    // Note: Cart page shows default shipping since PIN code is entered during checkout
    const shipping = subtotal > 500 ? 0 : 50; // Default shipping for cart display
    const tax = subtotal * 0.18; // 18% GST
    const discount = 0; // No discount applied
    const total = subtotal + shipping + tax - discount;

    // Update DOM elements
    document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `₹${total.toFixed(2)}`;

    // Update discount row if applicable
    const discountRow = document.getElementById('coupon-row');
    if (discount > 0) {
        document.getElementById('discount').textContent = `-₹${discount.toFixed(2)}`;
        discountRow.style.display = 'block';
    } else {
        discountRow.style.display = 'none';
    }
}

// Coupon functionality
document.getElementById('apply-coupon')?.addEventListener('click', function() {
    const couponCode = document.getElementById('coupon-code').value.trim().toUpperCase();
    const couponMessage = document.getElementById('coupon-message');

    // Simple coupon logic - you can expand this
    if (couponCode === 'RASOIYAA10') {
        // 10% discount
        showToast('Coupon applied! 10% discount added.');
        couponMessage.textContent = '10% discount applied!';
        couponMessage.style.color = 'green';
        // In a real app, you'd update the totals here
    } else if (couponCode === 'WELCOME20') {
        // 20% discount for first-time customers
        showToast('Welcome coupon applied! 20% discount added.');
        couponMessage.textContent = '20% discount applied!';
        couponMessage.style.color = 'green';
        // In a real app, you'd update the totals here
    } else if (couponCode) {
        couponMessage.textContent = 'Invalid coupon code';
        couponMessage.style.color = 'red';
    } else {
        couponMessage.textContent = '';
    }
});