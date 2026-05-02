// Wabz Foods Admin Control Logic
import { createClient } from 'https://cdn.jsdelivr.net/npm/@nhost/nhost-js@latest/+esm';
const nhost = createClient({
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
    formImage: document.getElementById('menu-item-image'),
    imagePreview: document.getElementById('image-preview'),
    usersTableBody: document.getElementById('users-table-body'),
    orderDetailsModal: document.getElementById('order-details-modal'),
    closeOrderModal: document.getElementById('close-order-modal'),
    modalOrderBody: document.getElementById('modal-order-body'),
    modalOrderTitle: document.getElementById('modal-order-title'),
    btnCloseTracking: document.getElementById('btn-close-tracking'),
    trackingModal: document.getElementById('tracking-modal')
};

// Initialize Data Hooks
async function init() {
    setupNav();
    setupEventListeners();
    await fetchData();
    renderAll();
}

// Setup Navigation Clicks
function setupNav() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            const targetView = document.getElementById(`view-${target}`);
            
            if (targetView) {
                // Update UI state
                elements.navItems.forEach(nav => nav.classList.remove('active'));
                elements.views.forEach(view => {
                    view.classList.remove('active');
                    // Ensure the view is hidden if it's not the target
                    view.classList.add('hidden');
                });
                
                item.classList.add('active');
                targetView.classList.remove('hidden');
                targetView.classList.add('active');
                
                // Update Title
                let title = target.charAt(0).toUpperCase() + target.slice(1);
                if (target === 'menu') title = 'Menu Catalog';
                if (target === 'orders') title = 'Manage Orders';
                if (target === 'users') title = 'Registered Users';
                elements.sectionTitle.innerText = title;
                
                // Auto-scroll to top of view on mobile
                if (window.innerWidth <= 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }
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

        const response = await nhost.graphql.request({ query: ADMIN_QUERY });
        const data = response.data || response.body?.data;
        const error = response.error || response.body?.errors;
        
        if (!error && data) {
            state.orders = data.orders || [];
            state.menuItems = data.menu_items || [];
            state.users = data.users || [];
        }
    } catch (err) {
        // Local fallbacks bound efficiently
    }

    // LocalStorage Fallback and Merge
    try {
        const localOrders = JSON.parse(localStorage.getItem('wabz_mock_orders') || '[]');
        const localUsers = JSON.parse(localStorage.getItem('wabz_mock_users') || '[]');
        const localMenu = JSON.parse(localStorage.getItem('wabz_mock_menu') || '[]');
        
        // Merge users
        localUsers.forEach(lu => {
            if (!state.users.some(u => u.id === lu.id)) {
                state.users.push(lu);
            }
        });
        
        // Merge orders
        localOrders.forEach(lo => {
            const index = state.orders.findIndex(o => o.id === lo.id);
            if (index > -1) {
                state.orders[index] = lo; // Override stale Nhost data with updated local state
            } else {
                state.orders.unshift(lo); // Add new local orders to top
            }
        });

        // Merge menu items
        localMenu.forEach(lm => {
            const index = state.menuItems.findIndex(m => m.id === lm.id);
            if (index > -1) {
                state.menuItems[index] = lm;
            } else {
                state.menuItems.push(lm);
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
    renderUsers();
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

function renderUsers() {
    if (!elements.usersTableBody) return;
    elements.usersTableBody.innerHTML = state.users.map(user => `
        <tr>
            <td class="font-bold">#${user.id.slice(0, 8)}</td>
            <td>${user.phone_number || '<span class="color-text-secondary">No Phone</span>'}</td>
            <td>${user.email || '<span class="color-text-secondary">No Email</span>'}</td>
        </tr>
    `).join('');
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
                <div style="margin: 10px 0; padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid var(--glass-border); border-radius: var(--radius-sm);">
                    ${itemsHtml}
                </div>
                <div class="order-items order-details-trigger" style="margin-top: 8px; font-weight: 600; color: var(--text-primary); cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    🛍️ ${(order.fulfillment || 'Order').toUpperCase()}
                    <small style="font-weight: 400; color: var(--primary-color);">(View Details)</small>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">📍 ${order.location || 'No Address Provided'}</div>
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
            
            // Professional feedback: Disable dropdown during processing
            e.target.disabled = true;
            e.target.style.opacity = '0.5';

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
                    e.target.disabled = false;
                }
            } else {
                let error = null;
                try {
                    const UPDATE_ORDER_STATUS = `
                        mutation UpdateOrderStatus($id: String!, $status: String!) {
                            update_orders_by_pk(pk_columns: {id: $id}, _set: {status: $status}) {
                                id
                                status
                            }
                        }
                    `;
                    const response = await nhost.graphql.request({
                        query: UPDATE_ORDER_STATUS,
                        variables: {
                            id: orderId,
                            status: newStatus
                        }
                    });
                    error = response.error || response.body?.errors;
                } catch(err) {
                    error = err;
                }
                
                if (error) {
                    console.warn("Nhost order update failed. Using local storage fallback.");
                    try {
                        const localOrders = JSON.parse(localStorage.getItem('wabz_mock_orders') || '[]');
                        const orderIndex = localOrders.findIndex(o => o.id === orderId);
                        if (orderIndex !== -1) {
                            localOrders[orderIndex].status = newStatus;
                        } else {
                            const existingOrder = state.orders.find(o => o.id === orderId);
                            if (existingOrder) {
                                existingOrder.status = newStatus;
                                localOrders.push(existingOrder);
                            }
                        }
                        localStorage.setItem('wabz_mock_orders', JSON.stringify(localOrders));
                        error = null;
                    } catch(localErr) {
                        error = localErr;
                    }
                }

                if (!error) {
                    await fetchData();
                    renderAll();
                } else {
                    alert("Failed updating status. Please try again.");
                    e.target.value = card.getAttribute('data-status'); // Revert UI
                    e.target.disabled = false;
                }
            }
        });
    });

    // Detailed View Trigger: Open modal when clicking on "🛍️ ORDER (View Details)"
    document.querySelectorAll('.order-details-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const card = trigger.closest('.order-card');
            const orderId = card.getAttribute('data-id');
            const order = state.orders.find(o => o.id === orderId);
            if (order) showOrderDetails(order);
        });
    });
}

function showOrderDetails(order) {
    const client = state.users.find(u => u.id === order.user_id);
    const clientName = client ? `${client.phone_number} ${client.email ? `(${client.email})` : ''}` : 'Guest User';
    
    const itemsHtml = (order.order_items || []).map(item => {
        const menuItem = state.menuItems.find(mi => mi.id === item.menu_item_id);
        const name = menuItem ? menuItem.name : 'Item ' + item.menu_item_id;
        const mods = item.modifiers ? Object.entries(item.modifiers).map(([k, v]) => `<div><small style="color: var(--text-secondary)">- ${k}: ${v}</small></div>`).join('') : '';
        return `
            <div style="padding: 12px 0; border-bottom: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <strong style="color: var(--secondary-color);">${item.quantity}x</strong> <span style="font-weight: 600;">${name}</span>
                    ${mods}
                </div>
                <div style="font-weight: bold; color: var(--text-primary);">UGX ${parseFloat(item.price).toLocaleString()}</div>
            </div>
        `;
    }).join('');

    elements.modalOrderTitle.innerText = `Order Detail: #${order.id.slice(0, 8).toUpperCase()}`;
    elements.modalOrderBody.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 20px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div style="background: var(--surface-elevated); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
                    <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Customer</div>
                    <div style="font-weight: 600; overflow-wrap: break-word;">${clientName}</div>
                </div>
                <div style="background: var(--surface-elevated); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
                    <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Placed On</div>
                    <div style="font-weight: 600;">${new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div style="background: var(--surface-elevated); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
                    <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Fulfillment</div>
                    <div style="font-weight: 600; text-transform: capitalize;">${order.fulfillment}</div>
                    <div style="font-size: 0.8rem; margin-top: 4px; color: var(--text-secondary);">📍 ${order.location}</div>
                </div>
                <div style="background: var(--surface-elevated); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--glass-border);">
                    <div style="color: var(--text-secondary); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px;">Payment</div>
                    <div style="font-weight: 600;">${order.payment_method}</div>
                    <div style="font-size: 0.8rem; margin-top: 4px; color: ${order.payment_status === 'Paid' ? '#4CAF50' : '#F44336'}; font-weight: bold;">
                        ${order.payment_status.toUpperCase()}
                    </div>
                </div>
            </div>
            <div>
                <h4 style="margin-bottom: 12px; color: var(--secondary-color); border-bottom: 2px solid var(--primary-color); display: inline-block;">Items Ordered</h4>
                <div style="background: var(--surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--glass-border); padding: 0 15px;">
                    ${itemsHtml || '<div style="padding: 15px; color: var(--text-secondary);">No item data available.</div>'}
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; background: var(--surface-color); border-radius: var(--radius-md); border: 1px solid var(--primary-color);">
                <span style="font-size: 1.1rem; font-weight: bold;">Grand Total:</span>
                <span style="font-size: 1.4rem; font-weight: 800; color: var(--primary-color);">UGX ${parseFloat(order.total_amount).toLocaleString()}</span>
            </div>
        </div>
    `;
    elements.orderDetailsModal.classList.add('active');
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
                
                if (item.image) {
                    elements.imagePreview.src = item.image;
                    elements.imagePreview.style.display = 'block';
                } else {
                    elements.imagePreview.style.display = 'none';
                }
                
                elements.menuFormTitle.innerText = 'Edit Menu Item';
                elements.menuFormContainer.classList.remove('hidden');
                elements.menuFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setTimeout(() => elements.formName.focus(), 100);
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
                
                let err = null;
                try {
                    const resp = await nhost.graphql.request(DELETE_MENU_ITEM, { id });
                    err = resp.error || resp.body?.errors;
                } catch(e) { err = e; }

                if (err) {
                    console.warn("Nhost delete failed, falling back to local storage.");
                    const localMenu = JSON.parse(localStorage.getItem('wabz_mock_menu') || '[]');
                    const filtered = localMenu.filter(i => i.id !== id);
                    localStorage.setItem('wabz_mock_menu', JSON.stringify(filtered));
                    err = null;
                }

                if (!err) {
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
        elements.imagePreview.src = '';
        elements.imagePreview.style.display = 'none';
        elements.menuFormTitle.innerText = 'Add New Menu Item';
        elements.menuFormContainer.classList.remove('hidden');
        elements.menuFormContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => elements.formName.focus(), 100);
    });

    elements.formImage.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (val) {
            elements.imagePreview.src = val;
            elements.imagePreview.style.display = 'block';
        } else {
            elements.imagePreview.style.display = 'none';
        }
    });

    if (elements.btnCloseTracking) {
        elements.btnCloseTracking.addEventListener('click', () => {
            elements.trackingModal.classList.remove('active');
        });
    }
    
    if (elements.closeOrderModal) {
        elements.closeOrderModal.addEventListener('click', () => {
            elements.orderDetailsModal.classList.remove('active');
        });
    }

    elements.btnCancelMenu.addEventListener('click', () => {
        elements.menuFormContainer.classList.add('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
        try {
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
                error = resp.error || resp.body?.errors;
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
                error = resp.error || resp.body?.errors;
            }
        } catch(e) {
            error = e;
        }

        if (error) {
            console.warn("Nhost save failed. Using local storage fallback.");
            try {
                const localMenu = JSON.parse(localStorage.getItem('wabz_mock_menu') || '[]');
                const saveId = elements.formId.value || 'custom_' + Date.now();
                const completeItem = { ...payload, id: saveId };
                
                const itemIndex = localMenu.findIndex(i => i.id === saveId);
                if (itemIndex > -1) {
                    localMenu[itemIndex] = completeItem;
                } else {
                    localMenu.push(completeItem);
                }
                localStorage.setItem('wabz_mock_menu', JSON.stringify(localMenu));
                error = null;
            } catch(localErr) {
                error = localErr;
            }
        }

        if (!error) {
            elements.menuFormContainer.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            await fetchData();
            renderAll();
        } else {
            alert("Failed saving item.");
        }
    });
}

// Boot sequence
init();
