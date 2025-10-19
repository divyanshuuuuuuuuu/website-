# Rasoiyaa Food - Authentic Indian Snacks E-commerce

A modern e-commerce website for authentic Indian snacks, built with Node.js, Express, and vanilla JavaScript.

## Features

- 🛒 Complete e-commerce functionality
- 📧 OTP-based email authentication
- 📦 Order management and tracking
- 💳 Razorpay payment gateway integration
- 📱 Responsive design
- 🔍 Advanced product filtering and search
- 🛡️ Secure API key management
- 🔒 Payment signature verification
- 🔔 Webhook support for payment status updates

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SendGrid account for email services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rosaiya-food.git
   cd rosaiya-food
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example file
   cp .env.example .env.local

   # Edit .env.local with your actual values
   # Required: SENDGRID_API_KEY
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:8000
   ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# SendGrid Email Service (Required)
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM=your_email@example.com

# Optional: Add other API keys as needed
# DATABASE_URL=your_database_url_here
# STRIPE_SECRET_KEY=your_stripe_key_here
```

### Getting API Keys

#### SendGrid (Email Service)
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key in Settings > API Keys
3. Copy the key to your `.env.local` file

#### Razorpay (Payment Gateway)
1. Sign up at [Razorpay](https://razorpay.com)
2. Create an account and verify your business
3. Go to Dashboard > Settings > API Keys
4. Generate API Key ID and Key Secret
5. Create a webhook secret for payment verification
6. Copy all keys to your `.env.local` file

## Security Notes

- Never commit `.env.local` or any file containing real API keys
- The `.env.example` file is safe to commit (contains placeholder values)
- API keys are only used server-side and never exposed to the browser
- Rotate API keys immediately if they are accidentally exposed

## Project Structure

```
rosaiya-food/
├── server.js              # Main server file
├── otp-service.js         # Email/OTP service
├── script.js              # Frontend JavaScript
├── styles.css             # Styles
├── *.html                 # HTML pages
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
└── package.json          # Dependencies
```

## API Endpoints

### Authentication
- `POST /send-otp` - Send OTP to email
- `POST /verify-otp` - Verify OTP code
- `POST /logout` - Logout user

### Orders
- `POST /save-order` - Save order data
- `POST /send-order-confirmation` - Send order confirmation email
- `GET /order/:orderId` - Get order details
- `GET /orders/:contact` - Get user orders
- `GET /order/:orderId/track` - Get order tracking info
- `PUT /orders/:orderId` - Update order status

### Payments (Razorpay)
- `POST /create-razorpay-order` - Create Razorpay payment order
- `POST /verify-razorpay-payment` - Verify payment signature
- `POST /razorpay-webhook` - Handle Razorpay webhooks

### Admin
- `GET /orders` - Get all orders (admin)
- `GET /admin/stats` - Get admin statistics

### Utilities
- `GET /health` - Health check endpoint

## Deployment

### Vercel (Recommended)

1. **Connect to GitHub**
   - Push your code to GitHub
   - Import project in Vercel dashboard

2. **Add Environment Variables**
   - In Vercel project settings, add:
     - `SENDGRID_API_KEY`
     - `SENDGRID_FROM`

3. **Deploy**
   - Vercel will automatically deploy on git push

### Local Development

```bash
npm start
# Server runs on http://localhost:8000
```

## Razorpay Integration Details

### Backend Requirements

**Dependencies:**
```json
{
  "razorpay": "^2.9.2",
  "crypto": "built-in"
}
```

**Environment Variables:**
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Security Features

- **Signature Verification**: All payments are verified using HMAC-SHA256
- **Webhook Validation**: Webhooks are authenticated with secret keys
- **Server-side Processing**: All payment logic runs on the server
- **No Client-side Secrets**: API keys never exposed to frontend

### Webhook Configuration

1. In Razorpay Dashboard > Settings > Webhooks
2. Create webhook with URL: `https://yourdomain.com/razorpay-webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Set webhook secret and add to environment variables

### Hosting Prerequisites

- **HTTPS Required**: Razorpay requires SSL certificate
- **Domain Verification**: Webhooks need verified domain
- **Firewall**: Allow Razorpay IP addresses for webhooks
- **Server Requirements**: Node.js 14+, stable internet connection

### Payment Flow

1. **Order Creation**: Frontend requests order creation
2. **Razorpay Order**: Server creates order via Razorpay API
3. **Checkout**: User completes payment on Razorpay's secure gateway
4. **Verification**: Server verifies payment signature
5. **Confirmation**: Order status updated and confirmation sent

### Testing

Use Razorpay test credentials for development:
- Test Key ID: `rzp_test_*`
- Test Secret: Available in dashboard
- Test Cards: Use Razorpay's test card numbers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security Checklist

- [ ] No API keys in source code
- [ ] `.env.local` not committed
- [ ] Environment variables properly configured
- [ ] API calls routed through server (not direct from frontend)
- [ ] Sensitive data encrypted in transit

## License

MIT License - see LICENSE file for details.

## Support

For support, email rasoiyaafood@gmail.com or create an issue in this repository.