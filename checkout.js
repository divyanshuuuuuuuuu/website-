// Checkout Page JavaScript

// Global Variables
let checkoutStep = 1;
let currentUser = null;
let orderData = {
    items: [],
    shipping: {},
    payment: {},
    total: 0,
    orderId: null
};

// Cart Management Functions
function getCartKey() {
    return currentUser ? `cart_${currentUser}` : 'cart_guest';
}

function loadCart() {
    const cartKey = getCartKey();
    return JSON.parse(localStorage.getItem(cartKey) || '[]');
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    setupCheckoutEventListeners();
    loadOrderItems();
    updateOrderSummary();
});

function initializeCheckout() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    if (isLoggedIn) {
        currentUser = localStorage.getItem('userContact');
        showUserInfo();
        proceedToShipping();
    }

    // Load cart items
    const cart = loadCart();
    if (cart.length === 0) {
        showToast('Your cart is empty. Please add items to proceed.');
        setTimeout(() => {
            window.location.href = 'shop.html';
        }, 2000);
        return;
    }

    orderData.items = cart;
}

function setupCheckoutEventListeners() {
    // Account section
    document.getElementById('checkout-login-btn').addEventListener('click', showLoginModal);
    document.getElementById('guest-checkout-btn').addEventListener('click', proceedAsGuest);
    document.getElementById('change-user-btn').addEventListener('click', changeUser);
    
    // Shipping form
    document.getElementById('shipping-form').addEventListener('submit', handleShippingSubmit);
    
    // Payment methods
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', updatePaymentMethod);
    });
    
    // Coupon
    document.getElementById('apply-coupon').addEventListener('click', applyCoupon);
    document.getElementById('coupon-code').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
    
    // Place order
    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
    
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
}

function showUserInfo() {
    const userContact = localStorage.getItem('userContact');
    document.getElementById('user-contact').textContent = userContact;
    document.getElementById('login-prompt').style.display = 'none';
    document.getElementById('user-info').style.display = 'block';
}

function proceedAsGuest() {
    document.getElementById('account-section').style.display = 'none';
    proceedToShipping();
}

function changeUser() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('userContact');
    localStorage.removeItem('sessionToken');
    
    document.getElementById('login-prompt').style.display = 'block';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('account-section').style.display = 'block';
    checkoutStep = 1;
}

function proceedToShipping() {
    document.getElementById('account-section').style.display = 'none';
    document.getElementById('shipping-section').style.display = 'block';
    checkoutStep = 2;
    updateCheckoutProgress();
}

function handleShippingSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const shippingData = {};
    
    for (let [key, value] of formData.entries()) {
        shippingData[key] = value;
    }
    
    orderData.shipping = shippingData;
    
    // Validate shipping data
    if (validateShippingData(shippingData)) {
        proceedToPayment();
    }
}

function validateShippingData(data) {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'pincode'];
    
    for (let field of requiredFields) {
        if (!data[field] || data[field].trim() === '') {
            showToast(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
            return false;
        }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showToast('Please enter a valid email address');
        return false;
    }
    
    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(data.phone.replace(/\D/g, ''))) {
        showToast('Please enter a valid 10-digit phone number');
        return false;
    }
    
    // Validate PIN code
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(data.pincode)) {
        showToast('Please enter a valid 6-digit PIN code');
        return false;
    }
    
    return true;
}

function proceedToPayment() {
    document.getElementById('shipping-section').style.display = 'none';
    document.getElementById('payment-section').style.display = 'block';
    checkoutStep = 3;
    updateCheckoutProgress();
    updatePlaceOrderButton();
}

function updatePaymentMethod() {
    const selectedMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    orderData.payment.method = selectedMethod;
    updatePlaceOrderButton();
}

function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value.trim().toUpperCase();
    const messageDiv = document.getElementById('coupon-message');
    
    if (!couponCode) {
        showToast('Please enter a coupon code');
        return;
    }
    
    // Simulate coupon validation
    const validCoupons = {
        'WELCOME10': { discount: 10, type: 'percentage' },
        'SAVE50': { discount: 50, type: 'fixed' },
        'DIWALI20': { discount: 20, type: 'percentage' }
    };
    
    if (validCoupons[couponCode]) {
        const coupon = validCoupons[couponCode];
        let discountAmount = 0;
        
        if (coupon.type === 'percentage') {
            discountAmount = (orderData.total * coupon.discount) / 100;
        } else {
            discountAmount = coupon.discount;
        }
        
        orderData.coupon = {
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
        
        updateOrderSummary();
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

function loadOrderItems() {
    const container = document.getElementById('order-items');
    const cart = loadCart();

    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">No items in cart</div>';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="order-item">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>Quantity: ${item.quantity}</p>
            </div>
            <div class="item-price">
                ₹${item.price * item.quantity}
            </div>
        </div>
    `).join('');
}

function updateOrderSummary() {
    const cart = loadCart();
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 50; // Fixed shipping cost
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const couponDiscount = orderData.coupon ? orderData.coupon.discount : 0;
    const total = subtotal + shipping + tax - couponDiscount;

    orderData.total = total;

    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('shipping').textContent = `₹${shipping}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('total').textContent = `₹${total}`;

    // Update order data
    orderData.subtotal = subtotal;
    orderData.shippingCost = shipping;
    orderData.tax = tax;
    orderData.couponDiscount = couponDiscount;
}

function updatePlaceOrderButton() {
    const button = document.getElementById('place-order-btn');
    const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
    const hasShippingData = Object.keys(orderData.shipping).length > 0;
    const hasPaymentMethod = orderData.payment.method;
    
    if ((isLoggedIn || checkoutStep >= 2) && hasShippingData && hasPaymentMethod) {
        button.disabled = false;
        button.innerHTML = `
            <i class="fas fa-lock"></i>
            Place Order Securely - ₹${orderData.total}
        `;
    } else {
        button.disabled = true;
        button.innerHTML = `
            <i class="fas fa-lock"></i>
            Complete Required Steps
        `;
    }
}

function updateCheckoutProgress() {
    // This would update a progress indicator if we had one
    console.log(`Checkout step: ${checkoutStep}`);
}

function placeOrder() {
    if (!validateOrderData()) {
        return;
    }
    
    // Generate order ID
    orderData.orderId = 'RAS' + Date.now();
    
    // Show loading state
    const button = document.getElementById('place-order-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    button.disabled = true;
    
    // Process payment
    processPayment()
        .then(paymentResult => {
            if (paymentResult.success) {
                // Save order to backend
                saveOrder()
                    .then(orderResult => {
                        if (orderResult.success) {
                            // Clear cart
                            const cartKey = getCartKey();
                            localStorage.removeItem(cartKey);

                            // Show success modal
                            showOrderSuccess(orderResult.orderId, orderData.total);
                            
                            // Send confirmation email
                            sendOrderConfirmation(orderData);
                        } else {
                            throw new Error('Failed to save order');
                        }
                    })
                    .catch(error => {
                        console.error('Order save error:', error);
                        showToast('Order placed but there was an issue saving details. Please contact support.');
                        showOrderSuccess(orderData.orderId, orderData.total);
                    });
            } else {
                throw new Error(paymentResult.message || 'Payment failed');
            }
        })
        .catch(error => {
            console.error('Payment error:', error);
            showToast('Payment failed. Please try again.');
            button.innerHTML = originalText;
            button.disabled = false;
        });
}

function validateOrderData() {
    if (orderData.items.length === 0) {
        showToast('Your cart is empty');
        return false;
    }
    
    if (Object.keys(orderData.shipping).length === 0) {
        showToast('Please complete shipping information');
        return false;
    }
    
    if (!orderData.payment.method) {
        showToast('Please select a payment method');
        return false;
    }
    
    return true;
}

function processPayment() {
    return new Promise((resolve, reject) => {
        const paymentMethod = orderData.payment.method;
        
        if (paymentMethod === 'razorpay') {
            processRazorpayPayment()
                .then(resolve)
                .catch(reject);
        } else {
            // For other payment methods, simulate success
            setTimeout(() => {
                resolve({
                    success: true,
                    paymentId: 'PAY_' + Date.now(),
                    method: paymentMethod
                });
            }, 2000);
        }
    });
}

function processRazorpayPayment() {
    return new Promise((resolve, reject) => {
        // Razorpay configuration
        const options = {
            key: 'rzp_test_1DP5mmOlF5G5ag', // Replace with your Razorpay key
            amount: orderData.total * 100, // Amount in paise
            currency: 'INR',
            name: 'Rasoiyaa Food',
            description: 'Order for Rasoiyaa Food',
            image: 'logo.png',
            order_id: null, // This will be generated by your backend
            handler: function(response) {
                resolve({
                    success: true,
                    paymentId: response.razorpay_payment_id,
                    method: 'razorpay'
                });
            },
            prefill: {
                name: `${orderData.shipping.firstName} ${orderData.shipping.lastName}`,
                email: orderData.shipping.email,
                contact: orderData.shipping.phone
            },
            notes: {
                order_id: orderData.orderId
            },
            theme: {
                color: '#e74c3c'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.on('payment.failed', function(response) {
            reject(new Error('Payment failed: ' + response.error.description));
        });
        
        rzp.open();
    });
}

function saveOrder() {
    return fetch('http://localhost:8000/save-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('sessionToken')
        },
        body: JSON.stringify({
            orderId: orderData.orderId,
            items: orderData.items,
            shipping: orderData.shipping,
            payment: orderData.payment,
            total: orderData.total,
            subtotal: orderData.subtotal,
            shippingCost: orderData.shippingCost,
            tax: orderData.tax,
            couponDiscount: orderData.couponDiscount,
            timestamp: new Date().toISOString()
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Save user details to localStorage for future logins
            const userDetails = {
                firstName: orderData.shipping.firstName,
                lastName: orderData.shipping.lastName,
                phone: orderData.shipping.phone,
                address: orderData.shipping.address,
                city: orderData.shipping.city,
                state: orderData.shipping.state,
                pincode: orderData.shipping.pincode,
                deliveryInstructions: orderData.shipping.deliveryInstructions,
                email: orderData.shipping.email
            };
            localStorage.setItem('userDetails', JSON.stringify(userDetails));

            return { success: true, orderId: data.orderId };
        } else {
            throw new Error(data.message || 'Failed to save order');
        }
    });
}

function sendOrderConfirmation(orderData) {
    fetch('http://localhost:8000/send-order-confirmation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: orderData.shipping.email,
            orderId: orderData.orderId,
            items: orderData.items,
            total: orderData.total,
            shipping: orderData.shipping
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Order confirmation email sent');
        }
    })
    .catch(error => {
        console.error('Failed to send confirmation email:', error);
    });
}

function showOrderSuccess(orderId, total) {
    document.getElementById('order-id').textContent = orderId;
    document.getElementById('order-total').textContent = `₹${total}`;
    document.getElementById('payment-status').textContent = 'Paid';
    
    document.getElementById('order-success-modal').style.display = 'block';
}


function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
