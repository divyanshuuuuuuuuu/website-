// Admin Panel JavaScript

// Global Variables
let currentSection = 'dashboard';
let products = [];
let orders = [];
let customers = [];
let charts = {};

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    initializeAdmin();
    setupEventListeners();
    loadDashboardData();
});

function initializeAdmin() {
    // Check admin authentication
    const isAdmin = localStorage.getItem('adminLoggedIn') === 'true';
    if (!isAdmin) {
        showLoginPrompt();
        return;
    }
    
    // Load initial data
    loadProducts();
    loadOrders();
    loadCustomers();
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
    document.getElementById('add-product-btn').addEventListener('click', openProductModal);
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    
    // Order management
    document.getElementById('order-status-filter').addEventListener('change', filterOrders);
    document.getElementById('order-date-filter').addEventListener('change', filterOrders);
    
    // Customer management
    document.getElementById('customer-search').addEventListener('input', searchCustomers);

    // User data management
    document.getElementById('user-search').addEventListener('input', searchUsers);
    document.getElementById('user-status-filter').addEventListener('change', filterUsers);
    document.getElementById('export-users').addEventListener('click', exportUsers);
    
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
        case 'user-data':
            loadUserData();
            break;
        case 'notifications':
            loadNotifications();
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

function loadProductsTable() {
    const container = document.getElementById('products-tbody');
    
    container.innerHTML = products.map(product => `
        <tr>
            <td>
                <img src="${product.image}" alt="${product.name}" class="product-thumb">
            </td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₹${product.price}</td>
            <td>In Stock</td>
            <td><span class="status-badge status-${product.status}">${product.status}</span></td>
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
    
    container.innerHTML = customers.map(customer => `
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
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        title.textContent = 'Edit Product';
        populateProductForm(product);
    } else {
        title.textContent = 'Add New Product';
        form.reset();
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
    
    const formData = new FormData(event.target);
    const productData = {
        id: document.getElementById('product-name').value.toLowerCase().replace(/\s+/g, '-'),
        name: document.getElementById('product-name').value,
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        originalPrice: parseFloat(document.getElementById('product-original-price').value) || null,
        description: document.getElementById('product-description').value,
        weight: document.getElementById('product-weight').value,
        ingredients: document.getElementById('product-ingredients').value,
        image: document.getElementById('product-image').value,
        badge: document.getElementById('product-badge').value,
        status: document.getElementById('product-status').value,
        vegetarian: document.getElementById('product-vegetarian').checked,
        vegan: document.getElementById('product-vegan').checked
    };
    
    // Save product (in real app, this would be sent to server)
    const existingIndex = products.findIndex(p => p.id === productData.id);
    if (existingIndex >= 0) {
        products[existingIndex] = productData;
        showToast('Product updated successfully');
    } else {
        products.push(productData);
        showToast('Product added successfully');
    }
    
    closeProductModal();
    loadProductsTable();
    updateStats();
}

function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        loadProductsTable();
        updateStats();
        showToast('Product deleted successfully');
    }
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

function showLoginPrompt() {
    const username = prompt('Enter admin username:');
    const password = prompt('Enter admin password:');
    
    // Simple authentication (in production, use proper authentication)
    if (username === 'admin' && password === 'rasoiyaa123') {
        localStorage.setItem('adminLoggedIn', 'true');
        initializeAdmin();
    } else {
        alert('Invalid credentials');
        window.location.href = 'index.html';
    }
}

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

// User Data Management Functions
let allUsers = [];

function loadUserData() {
    // Collect all user data from localStorage
    allUsers = [];
    const userEmails = new Set();

    // Get all users who have logged in (from orders and profiles)
    orders.forEach(order => {
        if (order.shipping?.email) {
            userEmails.add(order.shipping.email);
        }
    });

    // Get all users with profiles
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('profile_')) {
            const email = key.replace('profile_', '');
            userEmails.add(email);
        }
    }

    // Build user data
    userEmails.forEach(email => {
        const profile = JSON.parse(localStorage.getItem(`profile_${email}`) || 'null');
        const userOrders = orders.filter(order =>
            order.shipping?.email === email
        );

        const lastLogin = localStorage.getItem(`lastLogin_${email}`);
        const createdAt = profile?.createdAt || userOrders[0]?.createdAt || new Date().toISOString();

        allUsers.push({
            email: email,
            name: profile ? `${profile.firstName} ${profile.lastName}` : 'N/A',
            phone: profile?.phone || 'N/A',
            address: profile ? `${profile.address}, ${profile.city}, ${profile.state} - ${profile.pincode}` : 'N/A',
            profileStatus: profile ? 'Complete' : 'Incomplete',
            lastLogin: lastLogin || 'Never',
            createdAt: createdAt,
            ordersCount: userOrders.length,
            totalSpent: userOrders.reduce((sum, order) => sum + order.total, 0)
        });
    });

    updateUserStats();
    loadUserDataTable();
}

function updateUserStats() {
    const totalRegistered = allUsers.length;
    const totalActive = allUsers.filter(user => user.lastLogin !== 'Never').length;
    const totalProfiles = allUsers.filter(user => user.profileStatus === 'Complete').length;
    const recentLogins = allUsers.filter(user => {
        if (user.lastLogin === 'Never') return false;
        const loginDate = new Date(user.lastLogin);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return loginDate > oneDayAgo;
    }).length;

    document.getElementById('total-registered-users').textContent = totalRegistered;
    document.getElementById('total-active-users').textContent = totalActive;
    document.getElementById('total-profiles').textContent = totalProfiles;
    document.getElementById('recent-logins').textContent = recentLogins;
}

function loadUserDataTable(filteredUsers = null) {
    const users = filteredUsers || allUsers;
    const container = document.getElementById('user-data-tbody');

    container.innerHTML = users.map(user => `
        <tr>
            <td>${user.email}</td>
            <td>${user.name}</td>
            <td>${user.phone}</td>
            <td>${user.address.length > 50 ? user.address.substring(0, 50) + '...' : user.address}</td>
            <td><span class="status-badge status-${user.profileStatus.toLowerCase()}">${user.profileStatus}</span></td>
            <td>${user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="viewUserDetails('${user.email}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-info" onclick="viewUserOrders('${user.email}')">
                    <i class="fas fa-shopping-cart"></i>
                </button>
                <button class="btn btn-sm btn-warning" onclick="sendUserEmail('${user.email}')">
                    <i class="fas fa-envelope"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function searchUsers() {
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const filteredUsers = allUsers.filter(user =>
        user.email.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm) ||
        user.phone.includes(searchTerm)
    );
    loadUserDataTable(filteredUsers);
}

function filterUsers() {
    const statusFilter = document.getElementById('user-status-filter').value;
    let filteredUsers = allUsers;

    switch (statusFilter) {
        case 'active':
            filteredUsers = allUsers.filter(user => user.lastLogin !== 'Never');
            break;
        case 'inactive':
            filteredUsers = allUsers.filter(user => user.lastLogin === 'Never');
            break;
        case 'has-profile':
            filteredUsers = allUsers.filter(user => user.profileStatus === 'Complete');
            break;
        case 'no-profile':
            filteredUsers = allUsers.filter(user => user.profileStatus === 'Incomplete');
            break;
    }

    loadUserDataTable(filteredUsers);
}

function viewUserDetails(email) {
    const user = allUsers.find(u => u.email === email);
    if (!user) return;

    const profile = JSON.parse(localStorage.getItem(`profile_${email}`) || 'null');

    let detailsHTML = `
        <div class="user-details-modal">
            <h3>User Details: ${user.email}</h3>
            <div class="user-info-grid">
                <div class="info-section">
                    <h4>Basic Information</h4>
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Phone:</strong> ${user.phone}</p>
                    <p><strong>Profile Status:</strong> <span class="status-badge status-${user.profileStatus.toLowerCase()}">${user.profileStatus}</span></p>
                </div>

                <div class="info-section">
                    <h4>Address Information</h4>
                    <p><strong>Address:</strong> ${user.address}</p>
                </div>

                <div class="info-section">
                    <h4>Account Statistics</h4>
                    <p><strong>Total Orders:</strong> ${user.ordersCount}</p>
                    <p><strong>Total Spent:</strong> ₹${user.totalSpent}</p>
                    <p><strong>Last Login:</strong> ${user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleString()}</p>
                    <p><strong>Account Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            </div>
    `;

    if (profile) {
        detailsHTML += `
            <div class="info-section">
                <h4>Profile Details</h4>
                <p><strong>Updated:</strong> ${new Date(profile.updatedAt).toLocaleString()}</p>
            </div>
        `;
    }

    detailsHTML += `</div>`;

    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <span class="close">&times;</span>
            ${detailsHTML}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
}

function viewUserOrders(email) {
    const userOrders = orders.filter(order => order.shipping?.email === email);

    if (userOrders.length === 0) {
        showToast('No orders found for this user');
        return;
    }

    let ordersHTML = `
        <div class="user-orders-modal">
            <h3>Orders for ${email}</h3>
            <div class="orders-list">
    `;

    userOrders.forEach(order => {
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <h4>Order #${order.id}</h4>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="order-details">
                    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><strong>Items:</strong> ${order.items.length}</p>
                    <p><strong>Total:</strong> ₹${order.total}</p>
                </div>
                <div class="order-actions">
                    <button class="btn btn-sm btn-primary" onclick="viewOrder('${order.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    });

    ordersHTML += `
            </div>
        </div>
    `;

    // Create and show modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <span class="close">&times;</span>
            ${ordersHTML}
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'block';

    // Close modal functionality
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });
}

function sendUserEmail(email) {
    const subject = prompt('Enter email subject:');
    if (!subject) return;

    const message = prompt('Enter email message:');
    if (!message) return;

    // Send email using the API
    fetch('http://localhost:8000/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            to: email,
            subject: subject,
            text: message,
            html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
            fromName: 'Rasoiyaa Food Admin'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Email sent successfully to ' + email);
        } else {
            showToast('Failed to send email: ' + (data.message || 'Unknown error'));
        }
    })
    .catch(error => {
        console.error('Email send error:', error);
        showToast('Failed to send email');
    });
}

function exportUsers() {
    const data = {
        users: allUsers,
        exportDate: new Date().toISOString(),
        totalUsers: allUsers.length,
        summary: {
            totalRegistered: allUsers.length,
            totalActive: allUsers.filter(user => user.lastLogin !== 'Never').length,
            totalProfiles: allUsers.filter(user => user.profileStatus === 'Complete').length,
            totalRevenue: allUsers.reduce((sum, user) => sum + user.totalSpent, 0)
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rasoiyaa-users-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showToast('User data exported successfully');
}

// Notification Management Functions
let notifications = [];

function loadNotifications() {
    // Load notifications from localStorage or initialize empty
    notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');

    // Filter to show only recent notifications (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentNotifications = notifications.filter(n => new Date(n.timestamp) > thirtyDaysAgo);

    updateNotificationStats();
    loadNotificationsList(recentNotifications);
}

function updateNotificationStats() {
    const pendingOrders = orders.filter(order => order.status === 'confirmed').length;
    const whatsappSent = notifications.filter(n => n.type === 'whatsapp').length;
    const emailsSent = notifications.filter(n => n.type === 'email').length;
    const lastNotification = notifications.length > 0 ?
        new Date(notifications[notifications.length - 1].timestamp).toLocaleString() : '-';

    document.getElementById('pending-notifications').textContent = pendingOrders;
    document.getElementById('whatsapp-sent').textContent = whatsappSent;
    document.getElementById('emails-sent').textContent = emailsSent;
    document.getElementById('last-notification').textContent = lastNotification;
}

function loadNotificationsList(notificationList) {
    const container = document.getElementById('notifications-container');

    if (notificationList.length === 0) {
        container.innerHTML = `
            <div class="no-notifications">
                <i class="fas fa-bell-slash"></i>
                <p>No recent notifications</p>
                <small>Order notifications will appear here</small>
            </div>
        `;
        return;
    }

    container.innerHTML = notificationList.reverse().map(notification => `
        <div class="notification-card ${notification.type}">
            <div class="notification-header">
                <div class="notification-icon">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div class="notification-info">
                    <h4>${notification.title}</h4>
                    <span class="notification-time">${new Date(notification.timestamp).toLocaleString()}</span>
                </div>
                <span class="notification-type ${notification.type}">${notification.type}</span>
            </div>
            <div class="notification-content">
                <p>${notification.message}</p>
                ${notification.orderId ? `<p><strong>Order ID:</strong> ${notification.orderId}</p>` : ''}
                ${notification.customer ? `<p><strong>Customer:</strong> ${notification.customer}</p>` : ''}
                ${notification.amount ? `<p><strong>Amount:</strong> ₹${notification.amount}</p>` : ''}
            </div>
            <div class="notification-actions">
                ${notification.orderId ? `<button class="btn btn-sm btn-primary" onclick="viewOrder('${notification.orderId}')">View Order</button>` : ''}
                <button class="btn btn-sm btn-danger" onclick="deleteNotification('${notification.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function getNotificationIcon(type) {
    switch (type) {
        case 'whatsapp': return 'comment';
        case 'email': return 'envelope';
        case 'order': return 'shopping-cart';
        default: return 'bell';
    }
}

function addNotification(type, title, message, data = {}) {
    const notification = {
        id: Date.now().toString(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        ...data
    };

    notifications.push(notification);

    // Keep only last 1000 notifications
    if (notifications.length > 1000) {
        notifications = notifications.slice(-1000);
    }

    // Save to localStorage
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));

    // Update UI if notifications section is active
    if (currentSection === 'notifications') {
        loadNotifications();
    }

    return notification;
}

// Function to be called when order is placed (from server.js)
function notifyNewOrder(order) {
    const customerName = `${order.shipping.firstName} ${order.shipping.lastName}`;

    // Add order notification
    addNotification('order', 'New Order Received', `Order ${order.id} placed by ${customerName}`, {
        orderId: order.id,
        customer: customerName,
        amount: order.total
    });

    // Add WhatsApp notification
    addNotification('whatsapp', 'WhatsApp Notification Sent', `Order details sent to admin WhatsApp`, {
        orderId: order.id,
        customer: customerName,
        amount: order.total
    });

    // Add email notification
    addNotification('email', 'Order Confirmation Email Sent', `Confirmation email sent to ${order.shipping.email}`, {
        orderId: order.id,
        customer: customerName,
        amount: order.total
    });
}

function deleteNotification(notificationId) {
    notifications = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    loadNotifications();
    showToast('Notification deleted');
}

function testNotification() {
    const testOrder = {
        id: 'TEST' + Date.now(),
        shipping: {
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@example.com',
            phone: '+91 9876543210',
            address: 'Test Address',
            city: 'Test City',
            state: 'Test State',
            pincode: '485001'
        },
        total: 299
    };

    notifyNewOrder(testOrder);
    showToast('Test notification added');
}

function clearNotifications() {
    if (confirm('Are you sure you want to clear all notifications?')) {
        notifications = [];
        localStorage.removeItem('admin_notifications');
        loadNotifications();
        showToast('All notifications cleared');
    }
}
