# 🍲 Rasoiyaa Food - Authentic Indian Snacks E-commerce Website

A modern, fully-functional e-commerce website for authentic Indian snacks with complete cart and checkout functionality.

## 🌟 Features

### 🛒 Shopping Cart System
- Add/remove products from cart
- Quantity management with +/- buttons
- Real-time total calculations
- Local storage persistence
- Cart count indicator in header

### 💳 Advanced Checkout Process
- **4-step wizard checkout**:
  1. Customer Information
  2. Shipping Address (with PIN code validation)
  3. Payment Method (Razorpay integration)
  4. Order Review & Confirmation

### 📍 Smart Shipping Logic
- **PIN code-based pricing**:
  - Satna (485001): ₹30 local delivery
  - Other areas: ₹60 standard delivery
  - Orders > ₹500: FREE shipping
- Real-time shipping cost updates

### 🔐 User Authentication
- OTP-based email login system
- Session management
- User profile management
- Order history tracking

### 📧 Email Integration
- Order confirmations via SendGrid
- Invoice generation and delivery
- Admin notifications

### 🎨 Modern UI/UX
- Glassmorphism design with animations
- Responsive mobile-first design
- Smooth transitions and hover effects
- Professional checkout flow

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

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

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   SENDGRID_API_KEY=your_sendgrid_api_key
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   PORT=8000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests with UI mode
npm run test:ui
```

### Test Coverage
- ✅ Cart functionality (add, remove, quantity updates)
- ✅ Checkout process validation
- ✅ PIN code-based shipping calculations
- ✅ Form validation and navigation
- ✅ Empty cart state handling
- ✅ Payment integration testing

## 📁 Project Structure

```
rosaiya-food/
├── 📄 HTML Files (14 pages)
│   ├── index.html          # Homepage with hero banner
│   ├── shop.html           # Product catalog with filters
│   ├── cart.html           # Shopping cart page
│   ├── checkout.html       # 4-step checkout process
│   ├── login.html          # OTP authentication
│   └── ... (other static pages)
├── 📄 JavaScript Files (6 modules)
│   ├── script.js           # Main application logic
│   ├── cart.js             # Cart management
│   ├── checkout.js         # Checkout flow logic
│   ├── server.js           # Express backend API
│   └── ... (utility scripts)
├── 📄 CSS Files
│   └── styles.css          # Global styles
├── 🧪 Tests
│   └── tests/e2e/          # End-to-end test suite
├── 📄 Configuration
│   ├── package.json        # Dependencies & scripts
│   ├── .env               # Environment variables
│   └── .nojekyll          # GitHub Pages config
└── 📄 Assets
    ├── Images (PNG/JPG)   # Product images & logos
    └── Icons (FontAwesome) # UI icons
```

## 🔧 API Endpoints

### Authentication
- `POST /send-otp` - Send login OTP
- `POST /verify-otp` - Verify OTP and login
- `POST /logout` - Logout user

### Orders
- `POST /create-order` - Create Razorpay order
- `POST /verify-payment` - Verify payment completion

## 💰 Payment Integration

### Razorpay Setup
1. Create account at [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get API keys from Settings > API Keys
3. Add keys to `.env` file
4. Test payments in sandbox mode

### Supported Payment Methods
- Credit/Debit Cards
- Net Banking
- UPI
- Wallets

## 📧 Email Configuration

### SendGrid Setup
1. Create account at [SendGrid](https://sendgrid.com)
2. Generate API key
3. Verify sender email
4. Add API key to `.env`

## 🚀 Deployment

### Option 1: GitHub Pages (Frontend Only)
```bash
# Deploy static files to GitHub Pages
# Backend needs separate hosting (Heroku, Railway, etc.)
```

### Option 2: Full Stack Deployment
1. **Frontend**: Deploy static files to GitHub Pages/Netlify/Vercel
2. **Backend**: Deploy Node.js server to Heroku/Railway/Render
3. **Database**: Add MongoDB/PostgreSQL for production data

### Environment Variables for Production
```env
NODE_ENV=production
SENDGRID_API_KEY=your_production_key
RAZORPAY_KEY_ID=your_production_key
RAZORPAY_KEY_SECRET=your_production_secret
CORS_ORIGIN=https://yourdomain.com
```

## 🎯 Key Features Implemented

### Cart Management
- ✅ Persistent cart with localStorage
- ✅ Real-time quantity updates
- ✅ Automatic total calculations
- ✅ Cart icon with item count

### Checkout Flow
- ✅ Multi-step form validation
- ✅ PIN code shipping logic
- ✅ Payment gateway integration
- ✅ Order confirmation emails

### User Experience
- ✅ Responsive design (mobile-first)
- ✅ Loading states and animations
- ✅ Error handling and validation
- ✅ Toast notifications

### Security
- ✅ OTP-based authentication
- ✅ Secure payment processing
- ✅ Input validation and sanitization
- ✅ CORS protection

## 🐛 Troubleshooting

### Common Issues

**Server won't start**
```bash
# Check Node.js version
node --version

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Tests failing**
```bash
# Install Playwright browsers
npx playwright install

# Run tests in debug mode
npm run test:headed
```

**Payment not working**
- Check Razorpay keys in `.env`
- Ensure correct environment (test/production)
- Verify webhook endpoints

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

For support, email rasoiyaafood@gmail.com or create an issue in this repository.

---

**Made with ❤️ for authentic Indian snack lovers**

🍲 **Rasoiyaa Food** - स्वाद अपना अपना रसोई का