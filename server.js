require('dotenv').config();
const express = require('express');
const path = require('path');
const OTPService = require('./otp-service');

const app = express();
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Simple in-memory stores (replace with DB in production)
const orders = []; // demo order list

// CORS for local dev
try {
    const cors = require('cors');
    app.use(cors());
} catch (e) {
    // cors is optional if same-origin
}

// SendGrid Web API (direct configuration)
let sgMail = null;
try {
    sgMail = require('@sendgrid/mail');
    // Set API key directly (no environment variables needed)
    sgMail.setApiKey(process.env.SENDGRID_API_KEY || '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');
    console.log('SendGrid Web API configured successfully');
} catch (e) {
    console.log('SendGrid package not available:', e.message);
    sgMail = null;
}

// Initialize real SendGrid OTP service
const otpService = new OTPService(process.env.SENDGRID_API_KEY || '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', 'gita82tripathi@gmail.com');
console.log('OTP service initialized with real SendGrid - emails will be sent');

// OTP routes
app.post('/send-otp', async (req, res) => {
    const { contact } = req.body;
    if (!contact) {
        return res.json({ success: false, message: 'Email required' });
    }

    try {
        const result = await otpService.sendOTP(contact);
        res.json(result);
    } catch (error) {
        console.error('OTP send error:', error);
        res.json({ success: false, message: 'Failed to send OTP' });
    }
});

app.post('/verify-otp', (req, res) => {
    const { contact, otp } = req.body;
    if (!contact || !otp) {
        return res.json({ success: false, message: 'Email and OTP required' });
    }

    try {
        const result = otpService.verifyOTP(contact, otp);
        res.json(result);
    } catch (error) {
        console.error('OTP verify error:', error);
        res.json({ success: false, message: 'Failed to verify OTP' });
    }
});

app.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

// Place order endpoint (updated for checkout.js)
app.post('/place-order', (req, res) => {
    const orderData = req.body;
    console.log('New order received:', orderData);

    // Generate order ID if not provided
    if (!orderData.id) {
        orderData.id = 'RAS' + Date.now().toString().slice(-6);
    }
    orderData.status = 'confirmed';
    orderData.orderDate = new Date().toISOString();
    orderData.estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString();

    // Save order to memory (in production, save to database)
    orders.push(orderData);
    console.log('[ORDER SAVED]', orderData);

    // Send WhatsApp notification to admin
    sendOrderNotification(orderData);

    // Send confirmation email
    sendOrderConfirmationEmail(orderData);

    res.json({ success: true, orderId: orderData.id, message: 'Order placed successfully!' });
});

// Save order endpoint (legacy)
app.post('/save-order', (req, res) => {
    const { orderId, items, shipping, payment, total, subtotal, shippingCost, tax, couponDiscount, timestamp } = req.body || {};

    if (!orderId || !items || !shipping || !payment) {
        return res.json({ success: false, message: 'Missing required order data' });
    }

    const order = {
        id: orderId,
        items,
        shipping,
        payment,
        total,
        subtotal,
        shippingCost,
        tax,
        couponDiscount,
        status: 'confirmed',
        createdAt: timestamp || new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    orders.push(order);
    console.log('[ORDER SAVED]', order);

    // Send WhatsApp notification to admin
    sendOrderNotification(order);

    // Add notification to admin panel
    if (typeof notifyNewOrder === 'function') {
        notifyNewOrder(order);
    }

    return res.json({
        success: true,
        orderId: order.id,
        message: 'Order saved successfully'
    });
});

// Function to send WhatsApp notification for new orders
function sendOrderNotification(order) {
    const adminPhone = '+919303044289'; // Your WhatsApp number
    const message = `🛒 *NEW ORDER RECEIVED*

📦 *Order ID:* ${order.id}
👤 *Customer:* ${order.shipping.firstName} ${order.shipping.lastName}
📧 *Email:* ${order.shipping.email}
📱 *Phone:* ${order.shipping.phone}
📍 *Address:* ${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}

🛍️ *Items:*
${order.items.map(item => `• ${item.name} (${item.quantity}x) - ₹${item.price * item.quantity}`).join('\n')}

💰 *Total:* ₹${order.total}
💳 *Payment:* ${order.payment.method}

⏰ *Order Time:* ${new Date(order.createdAt).toLocaleString('en-IN')}

Please process this order ASAP!`;

    // WhatsApp API integration (using a service like 360Dialog or Twilio)
    // For now, we'll log it and you can integrate with a WhatsApp service
    console.log('📱 WHATSAPP NOTIFICATION:');
    console.log(message);
    console.log('='.repeat(50));

    // TODO: Integrate with WhatsApp Business API
    // Example with 360Dialog:
    /*
    const whatsappData = {
        to: adminPhone,
        type: 'text',
        text: { body: message }
    };

    fetch('https://waba.360dialog.io/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_360DIALOG_API_KEY'
        },
        body: JSON.stringify(whatsappData)
    })
    .then(response => response.json())
    .then(data => console.log('WhatsApp sent:', data))
    .catch(error => console.error('WhatsApp error:', error));
    */
}

// Send order confirmation email function
function sendOrderConfirmationEmail(orderData) {
    const { customer, shipping, items, totals, id } = orderData;

    if (!sgMail) {
        console.log('[EMAIL:DEV] Order confirmation would be sent to:', customer.email);
        return;
    }

    const itemsList = items.map(item => {
        const product = products.find(p => p.id === item.id);
        return `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${product ? product.name : item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
        </tr>`;
    }).join('');

    const msg = {
        to: customer.email,
        from: {
            email: 'gita82tripathi@gmail.com',
            name: 'Rasoiyaa Food'
        },
        replyTo: 'gita82tripathi@gmail.com',
        subject: `Order Confirmation - ${id}`,
        headers: {
            'X-Mailer': 'Rasoiyaa-Food-System',
            'X-Priority': '1',
            'X-MSMail-Priority': 'High'
        },
        text: `Thank you for your order!

Order ID: ${id}
Total Amount: ₹${totals.total}

Shipping Address:
${customer.firstName} ${customer.lastName}
${shipping.address}
${shipping.city}, ${shipping.state} - ${shipping.pincode}
Phone: ${customer.phone}

We'll process your order and send you tracking information soon.

Best regards,
Rasoiyaa Food Team`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #e74c3c; margin-bottom: 20px; text-align: center;">Rasoiyaa Food</h1>
                    <h2 style="color: #333; margin-bottom: 30px; text-align: center;">Order Confirmation</h2>

                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${id}</p>
                        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                        <p><strong>Total Amount:</strong> ₹${totals.total}</p>
                    </div>

                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e74c3c;">Item</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e74c3c;">Qty</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e74c3c;">Price</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e74c3c;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                            </tbody>
                        </table>
                    </div>

                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Shipping Address</h3>
                        <p>${customer.firstName} ${customer.lastName}<br>
                        ${shipping.address}<br>
                        ${shipping.city}, ${shipping.state} - ${shipping.pincode}<br>
                        Phone: ${customer.phone}</p>
                    </div>

                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #27ae60; font-weight: bold;">
                            <i class="fas fa-check-circle"></i>
                            Your order has been confirmed and will be processed soon.
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; font-size: 14px;">
                            Thank you for choosing Rasoiyaa Food!<br>
                            We'll send you tracking information once your order is shipped.
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Rasoiyaa Food - Authentic Indian Snacks<br>
                            Satna, Madhya Pradesh, India<br>
                            Contact: +91 8085654059 | rasoiyaafood@gmail.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    sgMail.send(msg).then(() => {
        console.log('Order confirmation email sent successfully to:', customer.email);
    }).catch(err => {
        console.error('Order confirmation email send failed', err);
    });
}

// Legacy send order confirmation email endpoint
app.post('/send-order-confirmation', (req, res) => {
    const { email, orderId, items, total, shipping } = req.body || {};
    
    if (!email || !orderId || !items) {
        return res.json({ success: false, message: 'Missing required data' });
    }

    if (!sgMail) {
        console.log('[EMAIL:DEV] Order confirmation would be sent to:', email);
        return res.json({ success: true, channel: 'dev' });
    }

    const itemsList = items.map(item => 
        `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">₹${item.price * item.quantity}</td>
        </tr>`
    ).join('');

    const msg = {
        to: email,
        from: {
            email: 'gita82tripathi@gmail.com',
            name: 'Rasoiyaa Food'
        },
        replyTo: 'gita82tripathi@gmail.com',
        subject: `Order Confirmation - ${orderId}`,
        headers: {
            'X-Mailer': 'Rasoiyaa-Food-System',
            'X-Priority': '1',
            'X-MSMail-Priority': 'High'
        },
        text: `Thank you for your order!

Order ID: ${orderId}
Total Amount: ₹${total}

Shipping Address:
${shipping.firstName} ${shipping.lastName}
${shipping.address}
${shipping.city}, ${shipping.state} - ${shipping.pincode}
Phone: ${shipping.phone}

We'll process your order and send you tracking information soon.

Best regards,
Rasoiyaa Food Team`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Confirmation</title>
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 30px; border-radius: 10px;">
                    <h1 style="color: #e74c3c; margin-bottom: 20px; text-align: center;">Rasoiyaa Food</h1>
                    <h2 style="color: #333; margin-bottom: 30px; text-align: center;">Order Confirmation</h2>
                    
                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
                        <p><strong>Total Amount:</strong> ₹${total}</p>
                    </div>

                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="background: #f8f9fa;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e74c3c;">Item</th>
                                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e74c3c;">Qty</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e74c3c;">Price</th>
                                    <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e74c3c;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsList}
                            </tbody>
                        </table>
                    </div>

                    <div style="background: #fff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #333; margin-bottom: 15px;">Shipping Address</h3>
                        <p>${shipping.firstName} ${shipping.lastName}<br>
                        ${shipping.address}<br>
                        ${shipping.city}, ${shipping.state} - ${shipping.pincode}<br>
                        Phone: ${shipping.phone}</p>
                    </div>

                    <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #27ae60; font-weight: bold;">
                            <i class="fas fa-check-circle"></i> 
                            Your order has been confirmed and will be processed soon.
                        </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p style="color: #666; font-size: 14px;">
                            Thank you for choosing Rasoiyaa Food!<br>
                            We'll send you tracking information once your order is shipped.
                        </p>
                    </div>

                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                        <p style="color: #999; font-size: 12px; margin: 0;">
                            Rasoiyaa Food - Authentic Indian Snacks<br>
                            Satna, Madhya Pradesh, India<br>
                            Contact: +91 8085654059 | rasoiyaafood@gmail.com
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    sgMail.send(msg).then(() => {
        console.log('Order confirmation email sent successfully to:', email);
        return res.json({ success: true, message: 'Confirmation email sent' });
    }).catch(err => {
        console.error('Order confirmation email send failed', err);
        return res.json({ success: false, message: 'Failed to send confirmation email' });
    });
});

// Get order details
app.get('/order/:orderId', (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        return res.json({ success: false, message: 'Order not found' });
    }
    
    return res.json({ success: true, order });
});

// Get user orders
app.get('/orders/:contact', (req, res) => {
    const { contact } = req.params;
    const userOrders = orders.filter(o => o.shipping?.email === contact || o.shipping?.phone === contact);
    
    return res.json({ success: true, orders: userOrders });
});


app.get('/health', (req, res) => res.json({ ok: true }));

// Admin endpoints
app.get('/orders', (req, res) => {
    return res.json({ success: true, orders });
});

app.put('/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
        return res.json({ success: false, message: 'Order not found' });
    }
    
    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    
    return res.json({ success: true, order: orders[orderIndex] });
});

app.get('/admin/stats', (req, res) => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalCustomers = new Set(orders.map(order => order.shipping?.email || order.shipping?.phone)).size;

    return res.json({
        success: true,
        stats: {
            totalOrders,
            totalRevenue,
            totalCustomers,
            totalProducts: 4 // Sample data
        }
    });
});

// Get order tracking information
app.get('/order/:orderId/track', (req, res) => {
    const { orderId } = req.params;
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        return res.json({ success: false, message: 'Order not found' });
    }

    // Generate tracking timeline based on order status and date
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysSinceOrder = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

    let timeline = [
        {
            status: 'confirmed',
            title: 'Order Confirmed',
            description: 'Your order has been confirmed and payment processed.',
            date: orderDate.toLocaleString(),
            completed: true
        },
        {
            status: 'packed',
            title: 'Order Packed',
            description: 'Your order has been carefully packed and prepared for shipping.',
            date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toLocaleString(),
            completed: daysSinceOrder >= 1
        },
        {
            status: 'shipped',
            title: 'Out for Delivery',
            description: 'Your order is on the way! Expected delivery within 2-3 days.',
            date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleString(),
            completed: daysSinceOrder >= 2
        },
        {
            status: 'delivered',
            title: 'Delivered',
            description: 'Your order has been successfully delivered.',
            date: new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleString(),
            completed: order.status === 'delivered'
        }
    ];

    return res.json({
        success: true,
        order: {
            id: order.id,
            status: order.status,
            total: order.total,
            items: order.items.length
        },
        tracking: {
            carrier: 'Delhivery',
            trackingId: 'DLV' + order.id.slice(3),
            estimatedDelivery: new Date(orderDate.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            timeline: timeline
        }
    });
});

// General email sending endpoint using SendGrid Web API
app.post('/send-email', async (req, res) => {
    const { to, subject, text, html, fromName, replyTo } = req.body;

    if (!to || !subject) {
        return res.json({ success: false, message: 'Recipient email and subject are required' });
    }

    if (!sgMail) {
        console.log('[EMAIL:DEV] Email would be sent to:', to, 'Subject:', subject);
        return res.json({ success: true, channel: 'dev', message: 'Email sent (dev mode)' });
    }

    const msg = {
        to,
        from: {
            email: 'gita82tripathi@gmail.com',
            name: fromName || 'Rasoiyaa Food'
        },
        replyTo: replyTo || 'gita82tripathi@gmail.com',
        subject,
        text: text || '',
        html: html || '',
        headers: {
            'X-Mailer': 'Rasoiyaa-Food-System',
            'X-Priority': '1',
            'X-MSMail-Priority': 'High'
        }
    };

    try {
        await sgMail.send(msg);
        console.log('Email sent successfully to:', to);
        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Email send failed:', error);
        res.json({ success: false, message: 'Failed to send email', error: error.message });
    }
});


app.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});