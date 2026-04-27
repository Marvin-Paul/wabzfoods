// Wabz Foods Admin Control Logic
import { NhostClient } from 'https://cdn.jsdelivr.net/npm/@nhost/nhost-js@latest/+esm';
const nhost = new NhostClient({
    subdomain: 'tzcvixwkdvoybwgmlcuz',
    region: 'eu-central-1'
});


// State Mapping
const state = {
    orders: [],
    menuItems: [],
    users: []
};

const elements = {
    navItems: document.querySelectorAll('.nav-item'),
    views: document.querySelectorAll('.section-view'),
    sectionTitle: document.getElementById('section-title'),
    
    // Dashboard Metrics
    metricRevenue: document.getElementById('metric-revenue'),
    metricOrders: document.getElementById('metric-orders'),
    metricUsers: document.getElementById('metric-users'),
    dashboardOrdersTable: document.getElementById('dashboard-orders-table'),
    
    // Kanban columns
    boardPending: document.getElementById('board-pending'),
    boardPreparing: document.getElementById('board-preparing'),
    boardDelivery: document.getElementById('board-delivery'),
    boardCompleted: document.getElementById('board-completed'),
    
    countPending: document.getElementById('count-pending'),
    countPreparing: document.getElementById('count-preparing'),
    countDelivery: document.getElementById('count-delivery'),
    countCompleted: document.getElementById('count-completed'),
    
    // Menu management
    adminMenuTable: document.getElementById('admin-menu-table'),
    menuFormContainer: document.getElementById('menu-form-container'),
    menuItemForm: document.getElementById('menu-item-form'),
    btnCancelMenu: document.getElementById('btn-cancel-menu'),
    btnAddMenuItem: document.getElementById('btn-add-menu-item'),
    menuFormTitle: document.getElementById('menu-form-title'),
    
    // Form inputs
    formId: document.getElementById('menu-item-id'),
    formName: document.getElementById('menu-item-name'),
    formCategory: document.getElementById('menu-item-category'),
    formPrice: document.getElementById('menu-item-price'),
    formDesc: document.getElementById('menu-item-desc'),
    formImage: document.getElementById('menu-item-image')
};

// Initialize Data Hooks
async function init() {
    setupNav();
    await fetchData();
    renderAll();
    setupEventListeners();
}

// Setup Navigation Clicks
function setupNav() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            elements.views.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            const target = item.getAttribute('data-target');
            document.getElementById(`view-${target}`).classList.add('active');
            elements.sectionTitle.innerText = target.charAt(0).toUpperCase() + target.slice(1);
        });
    });
}

// Fetch data from Nhost backend
async function fetchData() {
    try {
        const ADMIN_QUERY = `
          query AdminData {
            orders(order_by: {created_at: desc}) {
              id
              user_id
              fulfillment
              location
              total_amount
              status
              payment_method
              payment_status
              created_at
              order_items {
                id
                menu_item_id
                quantity
                modifiers
                price
              }
            }
            menu_items {
              id
              category
              name
              description
              price
              image
              badge
              modifiers
              is_active
            }
            users {
              id
              phone_number
              email
            }
          }
        `;

        const { data, error } = await nhost.graphql.request(ADMIN_QUERY);
        
        if (!error && data) {
            state.orders = data.orders || [];
            state.menuItems = data.menu_items || [];
            state.users = data.users || [];
        }
    } catch (err) {
        console.warn("Failed fetching administrative context from Nhost, using local storage:", err);
    }

    // LocalStorage Fallback and Merge
    try {
        const localOrders = JSON.parse(localStorage.getItem('wabz_mock_orders') || '[]');
        const localUsers = JSON.parse(localStorage.getItem('wabz_mock_users') || '[]');
        
        // Merge users
        localUsers.forEach(lu => {
            if (!state.users.some(u => u.id === lu.id)) {
                state.users.push(lu);
            }
        });
        
        // Merge orders
        localOrders.forEach(lo => {
            if (!state.orders.some(o => o.id === lo.id)) {
                state.orders.unshift(lo); // Add to top
            }
        });
    } catch (e) {
        console.error('Local storage retrieval error:', e);
    }
}

// Render metrics & management components
function renderAll() {
    renderDashboard();
    renderKanban();
    renderMenuTable();
}

function renderDashboard() {
    // Calculate Revenue
    const totalRev = state.orders.reduce((acc, order) => acc + parseFloat(order.total_amount), 0);
    elements.metricRevenue.innerText = `UGX ${totalRev.toLocaleString()}`;
    elements.metricOrders.innerText = state.orders.length;
    elements.metricUsers.innerText = state.users.length;
    
    // Render Recent Activity
    elements.dashboardOrdersTable.innerHTML = state.orders.slice(0, 10).map(order => {
        const client = state.users.find(u => u.id === order.user_id);
        const clientInfo = client ? `${client.phone_number} <br><small class="color-text-secondary">${client.email || ''}</small>` : 'Guest';
        return `
            <tr>
                <td class="font-bold">#${order.id.slice(0, 8)}</td>
                <td>${clientInfo}</td>
                <td class="color-secondary">UGX ${parseFloat(order.total_amount).toLocaleString()}</td>
                <td><span style="color: ${getStatusColor(order.status)}">${order.status}</span></td>
                <td class="color-text-secondary">${new Date(order.created_at).toLocaleString()}</td>
            </tr>
        `;
    }).join('');
}

function getStatusColor(status) {
    switch(status) {
        case 'Pending': return '#FFA000';
        case 'Preparing': return '#2196F3';
        case 'Out for Delivery': return '#9C27B0';
        case 'Completed': return '#4CAF50';
        case 'Cancelled': return '#F44336';
        default: return '#FFFFFF';
    }
}

function renderKanban() {
    const columns = {
        'Pending': [],
        'Preparing': [],
        'Out for Delivery': [],
        'Completed': []
    };

    state.orders.forEach(order => {
        if (columns[order.status]) {
            columns[order.status].push(order);
        } else if (order.status !== 'Cancelled') {
            columns['Pending'].push(order); // Fallback
        }
    });

    // Assign totals
    elements.countPending.innerText = columns['Pending'].length;
    elements.countPreparing.innerText = columns['Preparing'].length;
    elements.countDelivery.innerText = columns['Out for Delivery'].length;
    elements.countCompleted.innerText = columns['Completed'].length;

    // Map to boards
    elements.boardPending.innerHTML = renderOrderCards(columns['Pending']);
    elements.boardPreparing.innerHTML = renderOrderCards(columns['Preparing']);
    elements.boardDelivery.innerHTML = renderOrderCards(columns['Out for Delivery']);
    elements.boardCompleted.innerHTML = renderOrderCards(columns['Completed']);
    
    setupCardClickActions();
}

function renderOrderCards(ordersList) {
    if (ordersList.length === 0) return '<p class="color-text-secondary text-center text-sm p-16">No orders</p>';
    
    return ordersList.map(order => {
        const client = state.users.find(u => u.id === order.user_id);
        const clientContact = client ? `${client.phone_number} ${client.email ? `(${client.email})` : ''}` : 'Guest';
        
        const itemsHtml = order.order_items && order.order_items.length > 0 
            ? order.order_items.map(item => {
                const menuItem = state.menuItems.find(mi => mi.id === item.menu_item_id);
                const name = menuItem ? menuItem.name : 'Item ' + item.menu_item_id;
                const mods = item.modifiers ? Object.entries(item.modifiers).map(([k, v]) => `${v}`).join(', ') : '';
                return `<div class="order-item-row" style="font-size: 0.75rem; padding: 4px 0; border-bottom: 1px dashed var(--glass-border);">
                    <strong style="color: var(--secondary-color);">${item.quantity}x</strong> ${name} 
                    ${mods ? `<span style="color: var(--text-secondary); display: block; font-size: 0.7rem;">(${mods})</span>` : ''}
                </div>`;
            }).join('') 
            : '<div class="order-item-row" style="font-size: 0.75rem; color: var(--text-secondary);">No items info available</div>';

        return `
            <div class="order-card" data-id="${order.id}" data-status="${order.status}">
                <div class="order-card-header">
                    <span class="order-id">#${order.id.slice(0, 8)}</span>
                    <span class="order-amount">UGX ${parseFloat(order.total_amount).toLocaleString()}</span>
                </div>
                <div class="color-secondary text-sm font-bold mb-10">${clientContact}</div>
                <div style="margin: 10px 0; padding: 10px; background: var(--surface-elevated); border-radius: var(--radius-sm);">
                    ${itemsHtml}
                </div>
                <div class="order-items">${order.fulfillment.toUpperCase()} - ${order.location || 'No Address Provided'}</div>
                <div class="order-footer">
                    <span class="order-time">${new Date(order.created_at).toLocaleTimeString()}</span>
                    <select class="status-shifter">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                        <option value="Out for Delivery" ${order.status === 'Out for Delivery' ? 'selected' : ''}>Delivering</option>
                        <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancel</option>
                    </select>
                </div>
            </div>
        `;
    }).join('');
}

function setupCardClickActions() {
    document.querySelectorAll('.status-shifter').forEach(select => {
        select.addEventListener('change', async (e) => {
            const card = e.target.closest('.order-card');
            const orderId = card.getAttribute('data-id');
            const newStatus = e.target.value;

            if (orderId && orderId.startsWith('local_order_')) {
                try {
                    const localOrders = JSON.parse(localStorage.getItem('wabz_mock_orders') || '[]');
                    const orderIndex = localOrders.findIndex(o => o.id === orderId);
                    if (orderIndex !== -1) {
                        localOrders[orderIndex].status = newStatus;
                        localStorage.setItem('wabz_mock_orders', JSON.stringify(localOrders));
                        await fetchData();
                        renderAll();
                    }
                } catch (err) {
                    console.error("Failed updating local order state:", err);
                }
            } else {
                const UPDATE_ORDER_STATUS = `
                    mutation UpdateOrderStatus($id: String!, $status: String!) {
                        update_orders_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
                            id
                            status
                        }
                    }
                `;
                const { error } = await nhost.graphql.request(UPDATE_ORDER_STATUS, {
                    id: orderId,
                    status: newStatus
                });

                if (!error) {
                    await fetchData();
                    renderAll();
                } else {
                    alert("Failed updating status. Please try again.");
                }
            }
        });
    });
}

function renderMenuTable() {
    elements.adminMenuTable.innerHTML = state.menuItems.map(item => `
        <tr>
            <td><img src="${item.image}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;"></td>
            <td class="font-bold">${item.name}</td>
            <td class="color-text-secondary">${item.category}</td>
            <td class="color-secondary">UGX ${parseFloat(item.price).toLocaleString()}</td>
            <td>
                <button class="btn-secondary edit-item-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 0.75rem;">Edit</button>
                <button class="btn-primary delete-item-btn" data-id="${item.id}" style="padding: 6px 12px; font-size: 0.75rem; background: var(--primary-color);">Delete</button>
            </td>
        </tr>
    `).join('');

    setupMenuTableActions();
}

function setupMenuTableActions() {
    // Edit
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const item = state.menuItems.find(i => i.id === id);
            if (item) {
                elements.formId.value = item.id;
                elements.formName.value = item.name;
                elements.formCategory.value = item.category;
                elements.formPrice.value = item.price;
                elements.formDesc.value = item.description;
                elements.formImage.value = item.image;
                
                elements.menuFormTitle.innerText = 'Edit Menu Item';
                elements.menuFormContainer.style.display = 'block';
                elements.menuFormContainer.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Delete
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete this item?")) {
                const id = btn.getAttribute('data-id');
                const DELETE_MENU_ITEM = `
                    mutation DeleteMenuItem($id: String!) {
                        delete_menu_items_by_pk(id: $id) {
                            id
                        }
                    }
                `;
                const { error } = await nhost.graphql.request(DELETE_MENU_ITEM, { id });

                if (!error) {
                    await fetchData();
                    renderAll();
                } else {
                    alert("Error deleting product.");
                }
            }
        });
    });
}

function setupEventListeners() {
    elements.btnAddMenuItem.addEventListener('click', () => {
        elements.menuItemForm.reset();
        elements.formId.value = '';
        elements.menuFormTitle.innerText = 'Add New Menu Item';
        elements.menuFormContainer.style.display = 'block';
    });

    elements.btnCancelMenu.addEventListener('click', () => {
        elements.menuFormContainer.style.display = 'none';
    });

    elements.menuItemForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = elements.formId.value || 'custom_' + Date.now();
        const payload = {
            name: elements.formName.value,
            category: elements.formCategory.value,
            price: parseFloat(elements.formPrice.value),
            description: elements.formDesc.value,
            image: elements.formImage.value || 'assets/box_meal.png',
            modifiers: []
        };

        let error = null;
        if (elements.formId.value) {
            // Update
            const UPDATE_ITEM = `
                mutation UpdateItem($id: String!, $set: menu_items_set_input!) {
                    update_menu_items_by_pk(pk_columns: {id: $id}, _set: $set) {
                        id
                    }
                }
            `;
            const resp = await nhost.graphql.request(UPDATE_ITEM, { id: elements.formId.value, set: payload });
            error = resp.error;
        } else {
            // Insert
            const newId = 'custom_' + Date.now();
            const INSERT_ITEM = `
                mutation InsertItem($object: menu_items_insert_input!) {
                    insert_menu_items_one(object: $object) {
                        id
                    }
                }
            `;
            const resp = await nhost.graphql.request(INSERT_ITEM, { 
                object: { ...payload, id: newId } 
            });
            error = resp.error;
        }

        if (!error) {
            elements.menuFormContainer.style.display = 'none';
            await fetchData();
            renderAll();
        } else {
            alert("Failed saving item.");
        }
    });
}

// Boot sequence
init();
