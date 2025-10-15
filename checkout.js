// Checkout Page JavaScript
let currentStep = 1;
let checkoutData = {
    customer: {},
    shipping: {},
    payment: {}
};

document.addEventListener('DOMContentLoaded', function() {
    initializeCheckout();
    loadCheckoutItems();
    updateCheckoutTotals();
});

function initializeCheckout() {
    // Pre-fill customer info if logged in
    if (currentUser) {
        const profile = JSON.parse(localStorage.getItem(`profile_${currentUser}`) || '{}');
        if (profile.email) {
            document.getElementById('email').value = profile.email;
        }
        if (profile.firstName) {
            document.getElementById('first-name').value = profile.firstName;
        }
        if (profile.lastName) {
            document.getElementById('last-name').value = profile.lastName;
        }
        if (profile.phone) {
            document.getElementById('phone').value = profile.phone;
        }
    }
}

function nextStep(step) {
    if (!validateCurrentStep()) return;

    // Save current step data
    saveStepData(currentStep);

    // Hide current step
    document.getElementById(`checkout-step-${currentStep}`).classList.remove('active');

    // Update step indicator
    document.querySelector(`[data-step="${currentStep}"]`).classList.add('completed');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');

    // Show next step
    currentStep = step;
    document.getElementById(`checkout-step-${step}`).classList.add('active');

    // Update progress line
    updateProgressLine();
}

function prevStep(step) {
    // Hide current step
    document.getElementById(`checkout-step-${currentStep}`).classList.remove('active');

    // Update step indicator
    document.querySelector(`[data-step="${currentStep}"]`).classList.remove('active');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');

    // Show previous step
    currentStep = step;
    document.getElementById(`checkout-step-${step}`).classList.add('active');

    // Update progress line
    updateProgressLine();
}

function updateProgressLine() {
    const progressLines = document.querySelectorAll('.step-line');
    progressLines.forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('active');
        } else {
            line.classList.remove('active');
        }
    });
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            return validateCustomerInfo();
        case 2:
            return validateShippingInfo();
        case 3:
            return validatePaymentMethod();
        case 4:
            return validateTermsAgreement();
        default:
            return true;
    }
}

function validateCustomerInfo() {
    const firstName = document.getElementById('first-name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();

    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    if (!firstName) {
        document.getElementById('first-name-error').textContent = 'First name is required';
        isValid = false;
    }

    if (!lastName) {
        document.getElementById('last-name-error').textContent = 'Last name is required';
        isValid = false;
    }

    if (!email) {
        document.getElementById('email-error').textContent = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(email)) {
        document.getElementById('email-error').textContent = 'Please enter a valid email';
        isValid = false;
    }

    if (!phone) {
        document.getElementById('phone-error').textContent = 'Phone number is required';
        isValid = false;
    } else if (!/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
        document.getElementById('phone-error').textContent = 'Please enter a valid 10-digit phone number';
        isValid = false;
    }

    return isValid;
}

function validateShippingInfo() {
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const pincode = document.getElementById('pincode').value.trim();

    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    if (!address) {
        document.getElementById('address-error').textContent = 'Address is required';
        isValid = false;
    }

    if (!city) {
        document.getElementById('city-error').textContent = 'City is required';
        isValid = false;
    }

    if (!state) {
        document.getElementById('state-error').textContent = 'State is required';
        isValid = false;
    }

    if (!pincode) {
        document.getElementById('pincode-error').textContent = 'PIN code is required';
        isValid = false;
    } else if (!/^\d{6}$/.test(pincode)) {
        document.getElementById('pincode-error').textContent = 'Please enter a valid 6-digit PIN code';
        isValid = false;
    }

    return isValid;
}

function validatePaymentMethod() {
    // Razorpay is the only option, so always valid
    return true;
}

function validateTermsAgreement() {
    const termsAgreed = document.getElementById('terms-agree').checked;
    if (!termsAgreed) {
        document.getElementById('terms-error').textContent = 'Please agree to the terms and conditions';
        return false;
    }
    return true;
}

function saveStepData(step) {
    switch (step) {
        case 1:
            checkoutData.customer = {
                firstName: document.getElementById('first-name').value.trim(),
                lastName: document.getElementById('last-name').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim()
            };
            break;
        case 2:
            checkoutData.shipping = {
                address: document.getElementById('address').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value.trim(),
                pincode: document.getElementById('pincode').value.trim(),
                billingSame: document.getElementById('billing-same').checked
            };
            break;
        case 3:
            checkoutData.payment = {
                method: 'razorpay'
            };
            break;
    }
}

function loadCheckoutItems() {
    const checkoutItemsContainer = document.getElementById('checkout-items');

    checkoutItemsContainer.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';

        return `
            <div class="checkout-item">
                <div class="item-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="item-info">
                    <h4>${product.name}</h4>
                    <p>₹${product.price} × ${item.quantity}</p>
                </div>
                <div class="item-price">
                    ₹${(product.price * item.quantity).toFixed(2)}
                </div>
            </div>
        `;
    }).join('');
}

function updateCheckoutTotals() {
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    // Get shipping based on PIN code
    const pincode = document.getElementById('pincode')?.value?.trim() || '';
    let shipping = 0;

    if (subtotal > 500) {
        shipping = 0; // Free shipping over ₹500
    } else if (pincode === '485001') {
        shipping = 30; // Local delivery (Satna)
    } else if (pincode && pincode.length === 6) {
        shipping = 60; // Outside local area
    } else {
        shipping = 50; // Default shipping when no PIN entered
    }

    const tax = subtotal * 0.18;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    document.getElementById('checkout-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
    document.getElementById('checkout-shipping').textContent = shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`;
    document.getElementById('checkout-tax').textContent = `₹${tax.toFixed(2)}`;
    document.getElementById('checkout-total').textContent = `₹${total.toFixed(2)}`;

    const discountRow = document.getElementById('checkout-discount-row');
    if (discount > 0) {
        document.getElementById('checkout-discount').textContent = `-₹${discount.toFixed(2)}`;
        discountRow.style.display = 'block';
    } else {
        discountRow.style.display = 'none';
    }

    // Update shipping info display
    updateShippingInfo(pincode, shipping);

    // Add event listener for PIN code changes to update shipping
    const pincodeInput = document.getElementById('pincode');
    if (pincodeInput && !pincodeInput.hasAttribute('data-listener-added')) {
        pincodeInput.addEventListener('input', function() {
            updateCheckoutTotals();
        });
        pincodeInput.setAttribute('data-listener-added', 'true');
    }
}

function updateShippingInfo(pincode, shipping) {
    const shippingInfo = document.getElementById('shipping-info');
    if (!shippingInfo) return;

    let shippingText = '';
    if (shipping === 0) {
        shippingText = 'FREE shipping on orders over ₹500';
    } else if (pincode === '485001') {
        shippingText = '₹30 local delivery (Satna area)';
    } else if (pincode.length === 6) {
        shippingText = '₹60 standard delivery';
    } else {
        shippingText = '₹50 standard delivery';
    }

    shippingInfo.textContent = shippingText;
}

function initiateRazorpayPayment() {
    if (!validateCurrentStep()) return;

    // Save final step data
    saveStepData(currentStep);

    // Show loading state
    const placeOrderBtn = document.getElementById('place-order-btn');
    const btnText = placeOrderBtn.querySelector('.btn-text');
    const btnLoader = placeOrderBtn.querySelector('.btn-loader');

    btnText.textContent = 'Processing...';
    btnLoader.style.display = 'inline-block';
    placeOrderBtn.disabled = true;

    // Calculate order totals (with PIN code based shipping)
    updateCheckoutTotals(); // Update display first

    // Get current totals for order
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price * item.quantity : 0);
    }, 0);

    const pincode = document.getElementById('pincode')?.value?.trim() || '';
    let shipping = 0;

    if (subtotal > 500) {
        shipping = 0; // Free shipping over ₹500
    } else if (pincode === '485001') {
        shipping = 30; // Local delivery (Satna)
    } else if (pincode && pincode.length === 6) {
        shipping = 60; // Outside local area
    } else {
        shipping = 50; // Default shipping when no PIN entered
    }

    const tax = subtotal * 0.18;
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    // Create order data
    const orderData = {
        id: 'RAS' + Date.now().toString().slice(-6),
        customer: checkoutData.customer,
        shipping: checkoutData.shipping,
        payment: { method: 'razorpay' },
        items: cart,
        totals: {
            subtotal: subtotal,
            shipping: shipping,
            tax: tax,
            discount: discount,
            total: total
        },
        status: 'pending',
        orderDate: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    // Razorpay options
    const options = {
        key: 'rzp_test_your_key_here', // Replace with your actual Razorpay test key
        amount: total * 100, // Amount in paisa
        currency: 'INR',
        name: 'Rasoiyaa Food',
        description: `Order #${orderData.id}`,
        image: 'logo.png',
        handler: function (response) {
            // Payment successful
            handlePaymentSuccess(response, orderData);
        },
        prefill: {
            name: checkoutData.customer.firstName + ' ' + checkoutData.customer.lastName,
            email: checkoutData.customer.email,
            contact: checkoutData.customer.phone
        },
        notes: {
            address: checkoutData.shipping.address + ', ' + checkoutData.shipping.city
        },
        theme: {
            color: '#e74c3c'
        },
        modal: {
            ondismiss: function() {
                // Payment cancelled
                handlePaymentFailure('Payment cancelled by user');
            }
        }
    };

    // Initialize Razorpay
    const rzp = new Razorpay(options);
    rzp.open();

    // Reset button state
    btnText.textContent = 'Pay Now';
    btnLoader.style.display = 'none';
    placeOrderBtn.disabled = false;
}

function handlePaymentSuccess(response, orderData) {
    // Update order with payment details
    orderData.payment = {
        method: 'razorpay',
        paymentId: response.razorpay_payment_id,
        orderId: response.razorpay_order_id,
        signature: response.razorpay_signature,
        status: 'completed'
    };
    orderData.status = 'confirmed';

    // Send order to server
    fetch('http://localhost:8000/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Clear cart
            cart = [];
            saveCart();
            updateCartCount();

            // Show success modal with payment details
            showOrderSuccess(orderData);
        } else {
            showToast(data.message || 'Failed to process order');
        }
    })
    .catch(error => {
        console.error('Order processing error:', error);
        showToast('Order placed but confirmation failed. Please contact support.');
        // Still show success since payment was successful
        showOrderSuccess(orderData);
    });
}

function handlePaymentFailure(message) {
    showToast(message || 'Payment failed. Please try again.');
}

function showOrderSuccess(orderData) {
    // Update success modal with order details
    document.getElementById('success-order-id').textContent = orderData.id;
    document.getElementById('success-payment-id').textContent = orderData.payment.paymentId || 'N/A';
    document.getElementById('success-total').textContent = `₹${orderData.totals.total.toFixed(2)}`;
    document.getElementById('success-delivery').textContent = orderData.estimatedDelivery;
    document.getElementById('success-customer-name').textContent = `${orderData.customer.firstName} ${orderData.customer.lastName}`;
    document.getElementById('success-customer-email').textContent = orderData.customer.email;

    // Populate order items
    const itemsContainer = document.getElementById('success-order-items');
    itemsContainer.innerHTML = orderData.items.map(item => {
        const product = products.find(p => p.id === item.id);
        return `
            <div class="success-item">
                <span>${product ? product.name : item.name} × ${item.quantity}</span>
                <span>₹${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `;
    }).join('');

    // Update totals
    document.getElementById('success-subtotal').textContent = `₹${orderData.totals.subtotal.toFixed(2)}`;
    document.getElementById('success-shipping').textContent = orderData.totals.shipping === 0 ? 'FREE' : `₹${orderData.totals.shipping.toFixed(2)}`;
    document.getElementById('success-tax').textContent = `₹${orderData.totals.tax.toFixed(2)}`;
    document.getElementById('success-grand-total').textContent = `₹${orderData.totals.total.toFixed(2)}`;

    // Show modal
    const modal = document.getElementById('order-success-modal');
    modal.style.display = 'block';
}

function downloadInvoice() {
    // Generate and download PDF invoice
    const orderId = document.getElementById('success-order-id').textContent;

    // Create a simple HTML invoice for download
    const invoiceHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice - ${orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; border-bottom: 2px solid #e74c3c; padding-bottom: 20px; }
                .invoice-details { margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
                .total { font-weight: bold; }
                .footer { margin-top: 40px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>RASOIYAA FOOD</h1>
                <p>Satna, Madhya Pradesh, India - 485001</p>
                <h2>INVOICE</h2>
                <p>Order ID: ${orderId}</p>
                <p>Date: ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="invoice-details">
                <h3>Customer Details</h3>
                <p>Name: ${document.getElementById('success-customer-name').textContent}</p>
                <p>Email: ${document.getElementById('success-customer-email').textContent}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${Array.from(document.querySelectorAll('.success-item')).map(item => {
                        const spans = item.querySelectorAll('span');
                        return `<tr><td>${spans[0].textContent}</td><td>1</td><td>${spans[1].textContent}</td><td>${spans[1].textContent}</td></tr>`;
                    }).join('')}
                </tbody>
            </table>

            <div class="totals">
                <p>Subtotal: ${document.getElementById('success-subtotal').textContent}</p>
                <p>Shipping: ${document.getElementById('success-shipping').textContent}</p>
                <p>Tax: ${document.getElementById('success-tax').textContent}</p>
                <p class="total">Total: ${document.getElementById('success-grand-total').textContent}</p>
            </div>

            <div class="footer">
                <p>Thank you for shopping with Rasoiyaa Food!</p>
                <p>Payment Method: Razorpay</p>
            </div>
        </body>
        </html>
    `;

    // Create blob and download
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Invoice downloaded successfully!');
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}