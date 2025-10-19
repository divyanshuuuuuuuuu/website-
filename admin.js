// Admin Panel JavaScript

// Global Variables
let currentSection = 'dashboard';
let products = [];
let orders = [];
let customers = [];
let loginDetails = [];
let customerDetails = [];
let adminProducts = [];
let charts = {};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
    loadDashboardData();
});

function initializeAdmin() {
    // Load initial data (authentication check is now in admin.html)
    loadProducts();
    loadOrders();
    loadCustomers();
    loadLoginDetails();
    loadCustomerDetails();
    loadAdminProducts();
    updateStats();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
        });
    });

    // Product management
    const addProductBtn = document.getElementById('add-product-btn');
    const addNewProductBtn = document.getElementById('add-new-product-btn');

    if (addProductBtn) addProductBtn.addEventListener('click', openProductModal);
    if (addNewProductBtn) addNewProductBtn.addEventListener('click', openProductModal);

    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);

    // Product filters
    document.getElementById('product-search')?.addEventListener('input', filterAdminProducts);
    document.getElementById('category-filter')?.addEventListener('change', filterAdminProducts);
    document.getElementById('status-filter')?.addEventListener('change', filterAdminProducts);

    // Image upload
    document.getElementById('image-upload-area')?.addEventListener('click', function() {
        document.getElementById('product-image-file').click();
    });

    document.getElementById('product-image-file')?.addEventListener('change', handleImageUpload);
    document.getElementById('remove-image')?.addEventListener('click', removeImage);

    // Order management
    document.getElementById('order-status-filter').addEventListener('change', filterOrders);
    document.getElementById('order-date-filter').addEventListener('change', filterOrders);

    // Customer management
    document.getElementById('customer-search').addEventListener('input', searchCustomers);

    // Analytics
    document.getElementById('analytics-period').addEventListener('change', updateAnalytics);
    document.getElementById('export-report').addEventListener('click', exportReport);

    // Settings
    document.querySelectorAll('.settings-form').forEach(form => {
        form.addEventListener('submit', handleSettingsSubmit);
    });

    // Logout
    document.getElementById('admin-logout').addEventListener('click', logout);

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

function showSection(sectionName) {
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Show section
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(`${sectionName}-section`).classList.add('active');
    
    currentSection = sectionName;
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'products':
            loadProductsTable();
            break;
        case 'orders':
            loadOrdersTable();
            break;
        case 'customers':
            loadCustomersTable();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'login-details':
            loadLoginDetailsTable();
            break;
    }
}

function loadDashboardData() {
    updateStats();
    loadRecentOrders();
    createCharts();
}

function updateStats() {
    // Calculate stats from orders and products
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalProducts = products.length;
    const totalCustomers = customers.length;
    
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-revenue').textContent = `₹${totalRevenue}`;
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-customers').textContent = totalCustomers;
}

function loadRecentOrders() {
    const container = document.getElementById('recent-orders-tbody');
    const recentOrders = orders.slice(-5).reverse();
    
    container.innerHTML = recentOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}</td>
            <td>₹${order.total}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function createCharts() {
    // Sales Chart
    const salesCtx = document.getElementById('sales-chart').getContext('2d');
    if (charts.sales) charts.sales.destroy();
    
    charts.sales = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: getLast7Days(),
            datasets: [{
                label: 'Sales (₹)',
                data: getSalesData(),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Products Chart
    const productsCtx = document.getElementById('products-chart').getContext('2d');
    if (charts.products) charts.products.destroy();
    
    charts.products = new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: ['Murmura', 'Chips', 'Chivda', 'Sweets', 'Namak Para'],
            datasets: [{
                data: getProductSalesData(),
                backgroundColor: [
                    '#e74c3c',
                    '#3498db',
                    '#2ecc71',
                    '#f39c12',
                    '#9b59b6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getSalesData() {
    const sales = [0, 0, 0, 0, 0, 0, 0];
    const today = new Date();
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < 7) {
            sales[6 - daysDiff] += order.total;
        }
    });
    
    return sales;
}

function getProductSalesData() {
    const categories = ['murmura', 'chips', 'chivda', 'sweets', 'namak-para'];
    return categories.map(category => {
        return orders.reduce((sum, order) => {
            return sum + order.items.filter(item => item.category === category).length;
        }, 0);
    });
}

function loadProducts() {
    // Sample products data
    products = [
        {
            id: 'masala-murmura',
            name: 'Masala Murmura',
            category: 'murmura',
            price: 60,
            originalPrice: 70,
            image: 'murmura.png',
            description: 'Light and crunchy murmura with traditional masala spices',
            badge: 'New',
            status: 'active',
            weight: '200g',
            ingredients: 'Murmura, Masala spices, Oil',
            vegetarian: true,
            vegan: true
        },
        {
            id: 'golden-crunch',
            name: 'Golden Crunch (Saloni)',
            category: 'chips',
            price: 130,
            originalPrice: 150,
            image: 'golden-crunch.png',
            description: 'Crispy goodness with golden texture and authentic taste',
            badge: 'Best Seller',
            status: 'active',
            weight: '250g',
            ingredients: 'Potato, Spices, Oil',
            vegetarian: true,
            vegan: false
        },
        {
            id: 'coco-kaju-delight',
            name: 'Coco-Kaju Delight (Chivda)',
            category: 'chivda',
            price: 110,
            originalPrice: 130,
            image: 'coco-kaju-delight.png',
            description: 'Flavorful mix of coconut and cashew nuts with traditional spices',
            badge: 'Popular',
            status: 'active',
            weight: '300g',
            ingredients: 'Coconut, Cashew nuts, Spices, Oil',
            vegetarian: true,
            vegan: false
        },
        {
            id: 'diwali-sweets',
            name: 'Diwali Sweets Collection',
            category: 'sweets',
            price: 299,
            originalPrice: 350,
            image: 'diwali-sweet2.jpg',
            description: 'Festive sweets collection for special celebrations',
            badge: 'Pre-order',
            status: 'active',
            weight: '500g',
            ingredients: 'Sugar, Milk, Dry fruits, Traditional spices',
            vegetarian: true,
            vegan: false
        }
    ];
}

function loadOrders() {
    // Load orders from server
    fetch('http://localhost:8000/orders')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                orders = data.orders;
                updateStats();
                if (currentSection === 'dashboard') {
                    loadRecentOrders();
                }
            }
        })
        .catch(error => {
            console.error('Error loading orders:', error);
            // Use sample data if server is not available
            orders = [];
        });
}

function loadCustomers() {
    // Extract customers from orders
    const customerMap = new Map();

    orders.forEach(order => {
        const contact = order.shipping?.email || order.shipping?.phone;
        if (contact) {
            if (!customerMap.has(contact)) {
                customerMap.set(contact, {
                    contact: contact,
                    orders: 0,
                    totalSpent: 0,
                    lastOrder: null,
                    status: 'active'
                });
            }

            const customer = customerMap.get(contact);
            customer.orders++;
            customer.totalSpent += order.total;
            if (!customer.lastOrder || new Date(order.createdAt) > new Date(customer.lastOrder)) {
                customer.lastOrder = order.createdAt;
            }
        }
    });

    customers = Array.from(customerMap.values());
}

function loadAdminProducts() {
    // Load products from server
    fetch('http://localhost:8000/admin/products')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                adminProducts = data.products;
                if (currentSection === 'products') {
                    renderAdminProductsTable();
                }
            }
        })
        .catch(error => {
            console.error('Error loading admin products:', error);
            adminProducts = [];
        });
}

function loadLoginDetails() {
    // Load login details from server
    fetch('http://localhost:8000/login-details')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loginDetails = data.loginDetails;
            }
        })
        .catch(error => {
            console.error('Error loading login details:', error);
            loginDetails = [];
        });
}

function loadCustomerDetails() {
    // Load customer details from server
    fetch('http://localhost:8000/customer-details')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                customerDetails = data.customerDetails;
            }
        })
        .catch(error => {
            console.error('Error loading customer details:', error);
            customerDetails = [];
        });
}

function loadProductsTable() {
    renderAdminProductsTable();
}

function renderAdminProductsTable(filteredProducts = null) {
    const productsToShow = filteredProducts || adminProducts;
    const container = document.getElementById('products-tbody');

    container.innerHTML = productsToShow.map(product => `
        <tr>
            <td>
                <img src="${product.image || '/placeholder.png'}" alt="${product.name}" class="product-thumb" onerror="this.src='/placeholder.png'">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price}</td>
            <td>In Stock</td>
            <td><span class="status-badge status-${product.status || 'active'}">${product.status || 'active'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterAdminProducts() {
    const searchTerm = document.getElementById('product-search').value.toLowerCase();
    const categoryFilter = document.getElementById('category-filter').value;
    const statusFilter = document.getElementById('status-filter').value;

    let filtered = adminProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || product.category === categoryFilter;
        const matchesStatus = !statusFilter || product.status === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
    });

    renderAdminProductsTable(filtered);
}

function loadOrdersTable() {
    const container = document.getElementById('orders-tbody');
    
    container.innerHTML = orders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}</td>
            <td>${order.items.length} items</td>
            <td>₹${order.total}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}', 'confirmed')">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function loadCustomersTable() {
    const container = document.getElementById('customers-tbody');

    container.innerHTML = customerDetails.map(customer => `
        <tr>
            <td>${customer.firstName} ${customer.lastName}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>${getCustomerOrderCount(customer.email)}</td>
            <td>₹${getCustomerTotalSpent(customer.email)}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewCustomerDetails('${customer.email}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getCustomerOrderCount(email) {
    return orders.filter(order => order.shipping?.email === email).length;
}

function getCustomerTotalSpent(email) {
    return orders
        .filter(order => order.shipping?.email === email)
        .reduce((total, order) => total + order.total, 0);
}

function viewCustomerDetails(email) {
    const customer = customerDetails.find(c => c.email === email);
    if (!customer) return;

    const customerOrders = orders.filter(order => order.shipping?.email === email);
    const totalSpent = customerOrders.reduce((sum, order) => sum + order.total, 0);

    alert(`Customer Details:
Name: ${customer.firstName} ${customer.lastName}
Email: ${customer.email}
Phone: ${customer.phone}
Address: ${customer.address}
Total Orders: ${customerOrders.length}
Total Spent: ₹${totalSpent}
Member Since: ${new Date(customer.createdAt).toLocaleDateString()}`);
}

function loadLoginDetailsTable() {
    const container = document.getElementById('login-details-tbody');

    container.innerHTML = loginDetails.map(login => `
        <tr>
            <td>${login.email}</td>
            <td>${login.firstName && login.lastName ? `${login.firstName} ${login.lastName}` : 'N/A'}</td>
            <td>${login.phone || 'N/A'}</td>
            <td>${formatAddress(login)}</td>
            <td>${new Date(login.loginTime).toLocaleString()}</td>
            <td>${getDeviceInfo(login.userAgent)}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewLoginDetail('${login.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function formatAddress(login) {
    if (!login.address) return 'N/A';

    const parts = [];
    if (login.address) parts.push(login.address);
    if (login.city) parts.push(login.city);
    if (login.state && login.pincode) parts.push(`${login.state} - ${login.pincode}`);

    return parts.join(', ') || 'N/A';
}

function getDeviceInfo(userAgent) {
    if (!userAgent) return 'Unknown';

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile')) return 'Mobile';
    if (ua.includes('tablet')) return 'Tablet';
    if (ua.includes('windows')) return 'Windows PC';
    if (ua.includes('mac')) return 'Mac';
    if (ua.includes('linux')) return 'Linux';
    return 'Desktop';
}

function viewLoginDetail(loginId) {
    const login = loginDetails.find(l => l.id === loginId);
    if (!login) return;

    const fullAddress = formatAddress(login);

    alert(`Complete Login Details:

Email: ${login.email}
Name: ${login.firstName && login.lastName ? `${login.firstName} ${login.lastName}` : 'N/A'}
Phone: ${login.phone || 'N/A'}
Address: ${fullAddress}
Delivery Instructions: ${login.deliveryInstructions || 'N/A'}

Login Time: ${new Date(login.loginTime).toLocaleString()}
IP Address: ${login.ipAddress || 'N/A'}
Device/Browser: ${getDeviceInfo(login.userAgent)}
User Agent: ${login.userAgent || 'N/A'}`);
}

function loadAnalytics() {
    createAnalyticsCharts();
    updateAnalyticsSummary();
}

function createAnalyticsCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenue-chart').getContext('2d');
    if (charts.revenue) charts.revenue.destroy();
    
    charts.revenue = new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: getLast30Days(),
            datasets: [{
                label: 'Revenue (₹)',
                data: getRevenueData(),
                backgroundColor: '#e74c3c'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Status Chart
    const statusCtx = document.getElementById('status-chart').getContext('2d');
    if (charts.status) charts.status.destroy();
    
    const statusData = getOrderStatusData();
    charts.status = new Chart(statusCtx, {
        type: 'pie',
        data: {
            labels: Object.keys(statusData),
            datasets: [{
                data: Object.values(statusData),
                backgroundColor: [
                    '#f39c12',
                    '#3498db',
                    '#2ecc71',
                    '#e74c3c',
                    '#95a5a6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    // Customers Chart
    const customersCtx = document.getElementById('customers-chart').getContext('2d');
    if (charts.customers) charts.customers.destroy();
    
    charts.customers = new Chart(customersCtx, {
        type: 'line',
        data: {
            labels: getLast30Days(),
            datasets: [{
                label: 'New Customers',
                data: getCustomerData(),
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getLast30Days() {
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    return days;
}

function getRevenueData() {
    const revenue = new Array(30).fill(0);
    const today = new Date();
    
    orders.forEach(order => {
        const orderDate = new Date(order.createdAt);
        const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff >= 0 && daysDiff < 30) {
            revenue[29 - daysDiff] += order.total;
        }
    });
    
    return revenue;
}

function getOrderStatusData() {
    const statusCount = {};
    orders.forEach(order => {
        statusCount[order.status] = (statusCount[order.status] || 0) + 1;
    });
    return statusCount;
}

function getCustomerData() {
    const customers = new Array(30).fill(0);
    const today = new Date();
    const customerMap = new Map();
    
    orders.forEach(order => {
        const contact = order.shipping?.email || order.shipping?.phone;
        if (contact) {
            const orderDate = new Date(order.createdAt);
            const daysDiff = Math.floor((today - orderDate) / (1000 * 60 * 60 * 24));
            
            if (daysDiff >= 0 && daysDiff < 30) {
                const dayKey = `${contact}-${29 - daysDiff}`;
                if (!customerMap.has(dayKey)) {
                    customerMap.set(dayKey, true);
                    customers[29 - daysDiff]++;
                }
            }
        }
    });
    
    return customers;
}

function updateAnalyticsSummary() {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    const conversionRate = customers.length > 0 ? (orders.length / customers.length) * 100 : 0;
    const retentionRate = 75; // Placeholder
    const topCategory = getTopCategory();
    
    document.getElementById('avg-order-value').textContent = `₹${Math.round(avgOrderValue)}`;
    document.getElementById('conversion-rate').textContent = `${Math.round(conversionRate)}%`;
    document.getElementById('retention-rate').textContent = `${retentionRate}%`;
    document.getElementById('top-category').textContent = topCategory;
}

function getTopCategory() {
    const categoryCount = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        });
    });
    
    const topCategory = Object.keys(categoryCount).reduce((a, b) => 
        categoryCount[a] > categoryCount[b] ? a : b, 'murmura'
    );
    
    return topCategory.charAt(0).toUpperCase() + topCategory.slice(1);
}

// Product Management Functions
function openProductModal(productId = null) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');

    // Reset form
    form.reset();
    form.dataset.productId = productId || '';

    // Reset image upload
    removeImage();

    // Reset button text
    document.getElementById('save-product-btn').querySelector('.btn-text').textContent = 'Save Product';

    if (productId) {
        title.textContent = 'Edit Product';
    } else {
        title.textContent = 'Add New Product';
    }

    modal.style.display = 'block';
}

function populateProductForm(product) {
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-original-price').value = product.originalPrice || '';
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-weight').value = product.weight || '';
    document.getElementById('product-ingredients').value = product.ingredients || '';
    document.getElementById('product-image').value = product.image || '';
    document.getElementById('product-badge').value = product.badge || '';
    document.getElementById('product-status').value = product.status;
    document.getElementById('product-vegetarian').checked = product.vegetarian || false;
    document.getElementById('product-vegan').checked = product.vegan || false;
}

function handleProductSubmit(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('save-product-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnLoader = saveBtn.querySelector('.btn-loader');

    // Show loading state
    saveBtn.disabled = true;
    btnText.textContent = 'Saving...';
    btnLoader.style.display = 'inline';

    const productData = {
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        originalPrice: parseFloat(document.getElementById('product-original-price').value) || null,
        description: document.getElementById('product-description').value,
        weight: document.getElementById('product-weight').value,
        ingredients: document.getElementById('product-ingredients').value,
        image: document.getElementById('product-image-url').value,
        badge: document.getElementById('product-badge').value,
        status: document.getElementById('product-status').value,
        vegetarian: document.getElementById('product-vegetarian').checked,
        vegan: document.getElementById('product-vegan').checked
    };

    const productId = document.getElementById('product-form').dataset.productId;
    const isEditing = !!productId;

    const url = isEditing ? `http://localhost:8000/admin/products/${productId}` : 'http://localhost:8000/admin/products';
    const method = isEditing ? 'PUT' : 'POST';

    if (isEditing) {
        productData.id = productId;
    }

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast(isEditing ? 'Product updated successfully' : 'Product added successfully');
            closeProductModal();
            loadAdminProducts();
            updateStats();
        } else {
            showToast(data.message || 'Error saving product', 'error');
        }
    })
    .catch(error => {
        console.error('Error saving product:', error);
        showToast('Error saving product', 'error');
    })
    .finally(() => {
        // Reset loading state
        saveBtn.disabled = false;
        btnText.textContent = 'Save Product';
        btnLoader.style.display = 'none';
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageUrl = e.target.result;

        // Show preview
        document.getElementById('preview-image').src = imageUrl;
        document.getElementById('uploaded-image').style.display = 'block';
        document.getElementById('image-upload-area').querySelector('.upload-placeholder').style.display = 'none';

        // Store base64 data
        document.getElementById('product-image-url').value = imageUrl;
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    document.getElementById('product-image-file').value = '';
    document.getElementById('product-image-url').value = '';
    document.getElementById('uploaded-image').style.display = 'none';
    document.getElementById('image-upload-area').querySelector('.upload-placeholder').style.display = 'flex';
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function editProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;

    openProductModal(productId);

    // Populate form with existing data
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-original-price').value = product.originalPrice || '';
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-weight').value = product.weight || '';
    document.getElementById('product-ingredients').value = product.ingredients || '';
    document.getElementById('product-badge').value = product.badge || '';
    document.getElementById('product-status').value = product.status || 'active';
    document.getElementById('product-vegetarian').checked = product.vegetarian || false;
    document.getElementById('product-vegan').checked = product.vegan || false;

    // Handle image
    if (product.image) {
        document.getElementById('preview-image').src = product.image;
        document.getElementById('uploaded-image').style.display = 'block';
        document.getElementById('image-upload-area').querySelector('.upload-placeholder').style.display = 'none';
        document.getElementById('product-image-url').value = product.image;
    }

    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('save-product-btn').querySelector('.btn-text').textContent = 'Update Product';
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        return;
    }

    fetch(`http://localhost:8000/admin/products/${productId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Product deleted successfully');
            loadAdminProducts();
            updateStats();
        } else {
            showToast(data.message || 'Error deleting product', 'error');
        }
    })
    .catch(error => {
        console.error('Error deleting product:', error);
        showToast('Error deleting product', 'error');
    });
}

// Order Management Functions
function viewOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modal = document.getElementById('order-modal');
    const content = document.getElementById('order-details-content');
    
    content.innerHTML = `
        <div class="order-details">
            <div class="order-header">
                <h3>Order ${order.id}</h3>
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
            
            <div class="order-info">
                <div class="info-section">
                    <h4>Customer Information</h4>
                    <p><strong>Name:</strong> ${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}</p>
                    <p><strong>Email:</strong> ${order.shipping?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> ${order.shipping?.phone || 'N/A'}</p>
                </div>
                
                <div class="info-section">
                    <h4>Shipping Address</h4>
                    <p>${order.shipping?.address || 'N/A'}</p>
                    <p>${order.shipping?.city || 'N/A'}, ${order.shipping?.state || 'N/A'} - ${order.shipping?.pincode || 'N/A'}</p>
                </div>
                
                <div class="info-section">
                    <h4>Order Items</h4>
                    <table class="order-items-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>₹${item.price}</td>
                                    <td>₹${item.price * item.quantity}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="info-section">
                    <h4>Order Summary</h4>
                    <p><strong>Subtotal:</strong> ₹${order.subtotal || order.total}</p>
                    <p><strong>Shipping:</strong> ₹${order.shippingCost || 50}</p>
                    <p><strong>Tax:</strong> ₹${order.tax || 0}</p>
                    <p><strong>Total:</strong> ₹${order.total}</p>
                </div>
            </div>
            
            <div class="order-actions">
                <button class="btn btn-success" onclick="updateOrderStatus('${order.id}', 'confirmed')">
                    Confirm Order
                </button>
                <button class="btn btn-warning" onclick="updateOrderStatus('${order.id}', 'shipped')">
                    Mark as Shipped
                </button>
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'delivered')">
                    Mark as Delivered
                </button>
                <button class="btn btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">
                    Cancel Order
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function updateOrderStatus(orderId, status) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = status;
        order.updatedAt = new Date().toISOString();
        
        // Update on server
        fetch(`http://localhost:8000/orders/${orderId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        showToast(`Order status updated to ${status}`);
        loadOrdersTable();
        if (currentSection === 'dashboard') {
            loadRecentOrders();
        }
    }
}

function filterOrders() {
    const statusFilter = document.getElementById('order-status-filter').value;
    const dateFilter = document.getElementById('order-date-filter').value;
    
    let filteredOrders = orders;
    
    if (statusFilter) {
        filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
    }
    
    if (dateFilter) {
        filteredOrders = filteredOrders.filter(order => {
            const orderDate = new Date(order.createdAt).toDateString();
            const filterDate = new Date(dateFilter).toDateString();
            return orderDate === filterDate;
        });
    }
    
    // Update table with filtered orders
    const container = document.getElementById('orders-tbody');
    container.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}</td>
            <td>${order.items.length} items</td>
            <td>₹${order.total}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}', 'confirmed')">
                    <i class="fas fa-check"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const filteredCustomers = customers.filter(customer => 
        customer.contact.toLowerCase().includes(searchTerm)
    );
    
    const container = document.getElementById('customers-tbody');
    container.innerHTML = filteredCustomers.map(customer => `
        <tr>
            <td>${customer.contact}</td>
            <td>${customer.orders}</td>
            <td>₹${customer.totalSpent}</td>
            <td>${customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : 'N/A'}</td>
            <td><span class="status-badge status-${customer.status}">${customer.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewCustomer('${customer.contact}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewCustomer(contact) {
    const customerOrders = orders.filter(order => 
        (order.shipping?.email === contact) || (order.shipping?.phone === contact)
    );
    
    alert(`Customer: ${contact}\nOrders: ${customerOrders.length}\nTotal Spent: ₹${customerOrders.reduce((sum, order) => sum + order.total, 0)}`);
}

function updateAnalytics() {
    const period = document.getElementById('analytics-period').value;
    // Update charts based on selected period
    createAnalyticsCharts();
}

function exportReport() {
    const data = {
        orders: orders,
        products: products,
        customers: customers,
        period: document.getElementById('analytics-period').value
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rasoiyaa-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Report exported successfully');
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    showToast('Settings saved successfully');
}

// Removed showLoginPrompt function - now handled by admin-login.html

function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
