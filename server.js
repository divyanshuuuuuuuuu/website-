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

// OTP Service
const otpService = new OTPService(process.env.SENDGRID_API_KEY || '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', 'gita82tripathi@gmail.com');

// OTP routes
app.post('/send-otp', async (req, res) => {
    const { contact } = req.body;
    if (!contact) {
        return res.json({ success: false, message: 'Email required' });
    }
    const result = await otpService.sendOTP(contact);
    res.json(result);
});

app.post('/verify-otp', (req, res) => {
    const { contact, otp } = req.body;
    if (!contact || !otp) {
        return res.json({ success: false, message: 'Email and OTP required' });
    }
    const result = otpService.verifyOTP(contact, otp);
    res.json(result);
});

app.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out' });
});

// Save order endpoint
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
    
    return res.json({ 
        success: true, 
        orderId: order.id,
        message: 'Order saved successfully' 
    });
});

// Send order confirmation email
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


app.listen(8000, () => {
    console.log('Server running on http://localhost:8000');
});