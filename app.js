// Wabz Foods State Management & Logic
import { createClient } from 'https://cdn.jsdelivr.net/npm/@nhost/nhost-js@latest/+esm';
const nhost = createClient({
    subdomain: 'tzcvixwkdvoybwgmlcuz',
    region: 'eu-central-1'
});


const state = {
    fulfillment: null, // 'delivery' or 'pickup'
    location: null,
    cart: [],
    currentCategory: 'limited-time',
    user: null,
    menuItems: [
        // ΓöÇΓöÇ BREAKFAST ΓöÇΓöÇ
        {
            id: 'bf1',
            category: 'breakfast',
            name: 'Katogo Special',
            description: 'Matooke cooked with offals (matumbo), groundnut sauce & fresh tomatoes ΓÇö a Kampala morning classic.',
            price: 8000,
            image: 'assets/box_meal.png',
            badge: 'Fan Favourite',
            modifiers: [
                { name: 'Protein Add-on', options: ['Offals (Matumbo)', 'Beef', 'Groundnut Only'] }
            ]
        },
        {
            id: 'bf2',
            category: 'breakfast',
            name: 'Chapati & Beans',
            description: 'Soft, layered chapati served with rich, spiced beans ΓÇö the go-to Kampala street breakfast.',
            price: 5000,
            image: 'assets/box_meal.png',
            badge: 'Street Classic',
            modifiers: [
                { name: 'Extras', options: ['Extra Chapati (+UGX 1,500)', 'Plain'] }
            ]
        },
        {
            id: 'bf3',
            category: 'breakfast',
            name: 'Full Breakfast Plate',
            description: 'Scrambled eggs, sausages, toast, baked beans, and a fresh juice ΓÇö the Wabz way to start the day.',
            price: 15000,
            image: 'assets/box_meal.png',
            badge: 'Premium',
            modifiers: [
                { name: 'Eggs', options: ['Scrambled', 'Fried', 'Boiled'] },
                { name: 'Drink', options: ['Fresh Juice', 'Tea', 'Coffee'] }
            ]
        },
        // ΓöÇΓöÇ LUNCH ΓöÇΓöÇ
        {
            id: 'lu1',
            category: 'lunch',
            name: 'Wabz Big Box',
            description: 'Burger, 1 Pc Crispy Chicken, seasoned fries, and a cold drink ΓÇö the midday power combo.',
            price: 22000,
            image: 'assets/box_meal.png',
            badge: 'Best Seller',
            modifiers: [
                { name: 'Burger Type', options: ['Beef', 'Chicken'] },
                { name: 'Drink', options: ['Coke', 'Fanta', 'Sprite', 'Water'] }
            ]
        },
        {
            id: 'lu2',
            category: 'lunch',
            name: 'Rice & Stew Plate',
            description: 'Steamed white rice with rich beef stew, coleslaw salad, and fried plantain (matoke).',
            price: 12000,
            image: 'assets/sharing_bucket.png',
            badge: 'Local Fave',
            modifiers: [
                { name: 'Protein', options: ['Beef', 'Chicken', 'Fish'] }
            ]
        },
        {
            id: 'lu3',
            category: 'lunch',
            name: 'Mega Crunch Box',
            description: '2 Pcs crispy fried chicken, seasoned fries, and a refreshing cold drink.',
            price: 15000,
            image: 'assets/box_meal.png',
            badge: 'Hot Pick',
            modifiers: [
                { name: 'Flavor', options: ['Original', 'Spicy'] },
                { name: 'Upgrade Drink', options: ['Regular', 'Large (+UGX 2,000)'] }
            ]
        },
        // ΓöÇΓöÇ DINNER ΓöÇΓöÇ
        {
            id: 'di1',
            category: 'dinner',
            name: 'Family Feast Bucket',
            description: '10 Pcs Chicken, 2 Large Fries, and a 2L Drink ΓÇö feeds the whole family.',
            price: 65000,
            image: 'assets/sharing_bucket.png',
            badge: 'Family Size',
            modifiers: [
                { name: 'Flavor', options: ['Original', 'Spicy', 'Mixed'] },
                { name: 'Drink', options: ['Coke 2L', 'Fanta 2L', 'Sprite 2L'] }
            ]
        },
        {
            id: 'di2',
            category: 'dinner',
            name: 'Double Burger Deal',
            description: 'Two classic beef burgers stacked with cheddar cheese, fresh lettuce, and special sauce.',
            price: 25000,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
            badge: '2-for-1',
            modifiers: [
                { name: 'Cheese', options: ['Extra Cheese', 'No Cheese'] }
            ]
        },
        {
            id: 'di3',
            category: 'dinner',
            name: 'Grilled Tilapia Dinner',
            description: 'Whole grilled Nile tilapia with steamed rice, sukuma wiki, and a side of kachumbari salad.',
            price: 28000,
            image: 'assets/sharing_bucket.png',
            badge: 'Local Special',
            modifiers: [
                { name: 'Sides', options: ['Rice + Sukuma', 'Chips + Salad'] }
            ]
        },
        // ΓöÇΓöÇ LOCAL FOOD ΓöÇΓöÇ
        {
            id: 'lf1',
            category: 'local',
            name: 'Matooke & G-Nut Sauce',
            description: 'Steamed Matooke (green banana) served with rich groundnut (peanut) sauce and beef.',
            price: 10000,
            image: 'assets/box_meal.png',
            badge: 'Ugandan Classic',
            modifiers: [
                { name: 'Protein', options: ['Beef', 'Chicken', 'Vegetable Only'] }
            ]
        },
        {
            id: 'lf2',
            category: 'local',
            name: 'Rolex (Rolled Eggs)',
            description: 'The iconic Kampala street food ΓÇö eggs & vegetables rolled in a fresh chapati. Served hot.',
            price: 4000,
            image: 'assets/box_meal.png',
            badge: 'Kampala Icon',
            modifiers: [
                { name: 'Eggs', options: ['1 Egg', '2 Eggs (+UGX 1,500)'] },
                { name: 'Add Extras', options: ['Tomato + Cabbage', 'Plain'] }
            ]
        },
        {
            id: 'lf3',
            category: 'local',
            name: 'Posho & Beans',
            description: 'Smooth maize posho served with slow-cooked beans ΓÇö a comforting, filling Ugandan staple.',
            price: 6000,
            image: 'assets/box_meal.png',
            badge: 'Staple',
            modifiers: [
                { name: 'Extras', options: ['Add Greens (+UGX 1,000)', 'Plain'] }
            ]
        },
        // ΓöÇΓöÇ JUNK FOOD ΓöÇΓöÇ
        {
            id: 'jk1',
            category: 'junk',
            name: 'Cheese Master Burger',
            description: 'Premium beef patty, double cheddar, crispy bacon, and our special Wabz sauce on a toasted bun.',
            price: 12000,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80',
            badge: 'New',
            modifiers: [
                { name: 'Add-ons', options: ['Bacon (+UGX 3,000)', 'Jalape├▒os (+UGX 1,000)', 'None'] }
            ]
        },
        {
            id: 'jk2',
            category: 'junk',
            name: '5 Pc Chicken Bucket',
            description: '5 pieces of our signature crispy fried chicken. Choose your heat level.',
            price: 30000,
            image: 'assets/sharing_bucket.png',
            badge: 'Hot ≡ƒöÑ',
            modifiers: [
                { name: 'Flavor', options: ['Original', 'Spicy', 'Mixed'] }
            ]
        },
        {
            id: 'jk3',
            category: 'junk',
            name: 'Loaded Fries',
            description: 'Crispy fries piled high with cheese sauce, bacon bits, jalape├▒os, and sour cream.',
            price: 9000,
            image: 'assets/box_meal.png',
            badge: 'Loaded',
            modifiers: [
                { name: 'Size', options: ['Regular', 'Large (+UGX 2,000)'] },
                { name: 'Sauce', options: ['Cheese', 'BBQ', 'Spicy Mayo'] }
            ]
        },
        // ΓöÇΓöÇ DRINKS ΓöÇΓöÇ
        {
            id: 'dr1',
            category: 'drinks',
            name: 'Fresh Passion Juice',
            description: 'Freshly blended passion fruit juice ΓÇö sweet, tangy, and chilled. No added sugar.',
            price: 4000,
            image: 'assets/box_meal.png',
            badge: 'Fresh',
            modifiers: [
                { name: 'Size', options: ['Small (300ml)', 'Large (500ml) (+UGX 2,000)'] }
            ]
        },
        {
            id: 'dr2',
            category: 'drinks',
            name: 'Sodas & Water',
            description: 'Coke, Fanta Orange, Fanta Pineapple, Sprite, or Mineral Water ΓÇö ice cold.',
            price: 2500,
            image: 'assets/box_meal.png',
            badge: 'Cold',
            modifiers: [
                { name: 'Choose', options: ['Coke', 'Fanta Orange', 'Fanta Pineapple', 'Sprite', 'Water'] }
            ]
        },
        {
            id: 'dr3',
            category: 'drinks',
            name: 'Milkshake',
            description: 'Thick, creamy milkshake blended fresh. Choose from chocolate, vanilla, or strawberry.',
            price: 8000,
            image: 'assets/box_meal.png',
            badge: 'Creamy',
            modifiers: [
                { name: 'Flavor', options: ['Chocolate', 'Vanilla', 'Strawberry'] }
            ]
        }
    ]
};

// DOM Elements
const elements = {
    fulfillmentModal: document.getElementById('fulfillment-modal'),
    locationModal: document.getElementById('location-modal'),
    productModal: document.getElementById('product-modal'),
    cartModal: document.getElementById('cart-modal'),
    paymentModal: document.getElementById('payment-modal'),
    trackingModal: document.getElementById('tracking-modal'),
    
    btnOrderNow: document.getElementById('hero-order-now'),
    btnSelectDelivery: document.getElementById('select-delivery'),
    btnSelectPickup: document.getElementById('select-pickup'),
    btnConfirmAddress: document.getElementById('confirm-address'),
    btnConfirmStore: document.getElementById('confirm-store'),
    btnCloseLocation: document.getElementById('close-location'),
    btnCloseProduct: document.getElementById('close-product'),
    btnCloseCart: document.getElementById('close-cart'),
    btnClosePayment: document.getElementById('close-payment'),
    btnCloseTracking: document.getElementById('close-tracking'),
    btnCloseAuth: document.getElementById('close-auth'),
    
    authModal: document.getElementById('auth-modal'),
    btnSignIn: document.getElementById('signin-btn'),
    authTitle: document.getElementById('auth-title'),
    authEmail: document.getElementById('auth-email'),
    authPhone: document.getElementById('auth-phone'),
    authPassword: document.getElementById('auth-password'),
    btnAuthSubmit: document.getElementById('btn-auth-submit'),
    tabLogin: document.getElementById('tab-login'),
    tabRegister: document.getElementById('tab-register'),
    
    deliveryInputGroup: document.getElementById('delivery-input-group'),
    pickupInputGroup: document.getElementById('pickup-input-group'),
    locationTitle: document.getElementById('location-title'),
    addressInput: document.getElementById('address-input'),
    
    categoryTabs: document.getElementById('category-tabs'),
    menuGrid: document.getElementById('menu-grid'),
    
    cartTrigger: document.getElementById('cart-trigger'),
    cartCount: document.querySelector('.cart-count'),
    cartTotal: document.querySelector('.cart-total'),
    cartTotalAmount: document.getElementById('cart-total-amount'),
    cartItemsContainer: document.getElementById('cart-items-container'),
    btnProceedCheckout: document.getElementById('proceed-to-checkout'),
    
    payMomo: document.getElementById('pay-momo'),
    payCard: document.getElementById('pay-card'),
    payCash: document.getElementById('pay-cash'),
    momoInputGroup: document.getElementById('momo-input-group'),
    submitMomo: document.getElementById('submit-momo'),
    paymentStatusContainer: document.getElementById('payment-status-container'),
    paymentStatusText: document.getElementById('payment-status-text'),
    paymentStatusSubtext: document.getElementById('payment-status-subtext'),
    trackingStatus: document.getElementById('tracking-status'),
    
    reviewModal: document.getElementById('review-modal'),
    btnOpenReview: document.getElementById('open-review-modal'),
    btnCloseReview: document.getElementById('close-review'),
    btnSubmitReview: document.getElementById('submit-review')
};

// =====================================================
// SPLASH SCREEN — Controller
// =====================================================
function initSplash() {
    const splash = document.getElementById('wabz-splash');
    if (!splash) return Promise.resolve();

    // Lock scroll while splash is showing
    document.body.classList.add('splash-active');

    return new Promise(resolve => {
        // The CSS progress bar animation takes ~3.2s (0.6s delay + 2.6s fill).
        // We wait for that to finish, then fade the splash out.
        setTimeout(() => {
            splash.classList.add('splash-exit');

            // Remove it from the DOM after the CSS transition completes (0.7s)
            setTimeout(() => {
                splash.remove();
                document.body.classList.remove('splash-active');
                resolve();
            }, 720);
        }, 3300);
    });
}

// Initialize App
async function init() {
    await initSplash();         // Wait for splash to finish before showing the page
    await fetchMenuItems();
    checkSession();
    renderMenu();
    setupEventListeners();
    startCarousel();
}



function checkSession() {
    const savedUser = localStorage.getItem('wabz_user');
    if (savedUser) {
        try {
            state.user = JSON.parse(savedUser);
            updateAuthUI();
        } catch (e) {
            localStorage.removeItem('wabz_user');
        }
    }
}

function updateAuthUI() {
    if (state.user) {
        const identifier = state.user.email || state.user.phone_number || 'User';
        const displayName = identifier.includes('@') ? identifier.split('@')[0] : identifier;
        elements.btnSignIn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Hi, ${displayName}</span>
        `;
        elements.btnSignIn.classList.add('user-active-chip');
    } else {
        elements.btnSignIn.innerHTML = 'Sign In';
        elements.btnSignIn.classList.remove('user-active-chip');
    }
}

async function fetchMenuItems() {
    try {
        const GET_MENU_ITEMS = `
          query GetMenuItems {
            menu_items(where: {is_active: {_eq: true}}) {
              id
              category
              name
              description
              price
              image
              badge
              modifiers
            }
          }
        `;

        const response = await nhost.graphql.request({ query: GET_MENU_ITEMS });
        const data = response.data || response.body?.data;
        const error = response.error || response.body?.errors;
        
        if (error) throw error;
        if (data && data.menu_items && data.menu_items.length > 0) {
            state.menuItems = data.menu_items;
        }
    } catch (error) {
        console.error('Error fetching menu items from Nhost:', error);
    }
    
    // Merge with Local Storage
    try {
        const localMenu = JSON.parse(localStorage.getItem('wabz_mock_menu') || '[]');
        localMenu.forEach(lm => {
            const index = state.menuItems.findIndex(m => m.id === lm.id);
            if (index > -1) {
                state.menuItems[index] = lm;
            } else {
                state.menuItems.push(lm);
            }
        });
    } catch (e) {
        console.error('Local storage menu retrieval error:', e);
    }
}

// Carousel Logic
function startCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    
    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000);
}

// Render Menu
function renderMenu() {
    const categories = [
        { key: 'breakfast', label: 'Breakfast',  emoji: '&#127749;' },
        { key: 'lunch',     label: 'Lunch',      emoji: '&#9728;&#65039;' },
        { key: 'dinner',    label: 'Dinner',     emoji: '&#127769;' },
        { key: 'local',     label: 'Local Food', emoji: '&#127482;&#127468;' },
        { key: 'junk',      label: 'Junk Food',  emoji: '&#127828;' },
        { key: 'drinks',    label: 'Drinks',     emoji: '&#129384;' },
    ];

    const container = elements.menuGrid;
    container.innerHTML = '';

    categories.forEach(cat => {
        const items = state.menuItems.filter(item => item.category === cat.key);
        if (items.length === 0) return;

        const section = document.createElement('div');
        section.className = 'menu-category-section';
        section.innerHTML = `
            <div class="menu-category-header">
                <span class="menu-category-emoji">${cat.emoji}</span>
                <h3 class="menu-category-title">${cat.label}</h3>
                <span class="menu-category-count">${items.length} items</span>
            </div>
            <div class="menu-grid-inner">
                ${items.map(item => `
                    <div class="menu-card">
                        <div class="card-img" style="background-image: url('${item.image}')">
                            ${item.badge ? `<span class="card-badge">${item.badge}</span>` : ''}
                        </div>
                        <div class="card-body">
                            <h3 class="card-title">${item.name}</h3>
                            <p class="card-desc">${item.description}</p>
                            <div class="card-footer">
                                <span class="card-price">UGX ${item.price.toLocaleString()}</span>
                                <button class="btn-primary open-product" data-id="${item.id}" style="padding: 8px 16px;">Order</button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    });

    // Attach click listeners for all Order buttons
    document.querySelectorAll('.open-product').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.closest('[data-id]').dataset.id;
            openProductModal(id);
        });
    });
}

// Modals Control
function showModal(modal) {
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

// Setup Event Listeners
function setupEventListeners() {
    // Order Now
    elements.btnOrderNow.addEventListener('click', () => {
        showModal(elements.fulfillmentModal);
    });

    // Location Chips Interactive Setting
    const locationChips = document.querySelectorAll('.location-chips .chip');
    locationChips.forEach(chip => {
        chip.addEventListener('click', (e) => {
            const locName = e.currentTarget.getAttribute('data-location');
            if (locName) {
                state.fulfillment = 'delivery';
                state.location = locName;
                elements.addressInput.value = locName;
                
                // Visual Update
                locationChips.forEach(c => c.classList.remove('active'));
                document.querySelectorAll(`.location-chips .chip[data-location="${locName}"]`).forEach(c => {
                    c.classList.add('active');
                });
                
                showToast(`Delivery location set to ${locName}. Explore our menu!`);
                document.getElementById('menu-container').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
    
    // Fulfillment Selection
    elements.btnSelectDelivery.addEventListener('click', () => {
        state.fulfillment = 'delivery';
        hideModal(elements.fulfillmentModal);
        elements.locationTitle.innerText = 'Enter Delivery Address';
        elements.deliveryInputGroup.style.display = 'flex';
        elements.pickupInputGroup.style.display = 'none';
        showModal(elements.locationModal);
    });
    
    elements.btnSelectPickup.addEventListener('click', () => {
        state.fulfillment = 'pickup';
        hideModal(elements.fulfillmentModal);
        elements.locationTitle.innerText = 'Select Pickup Store';
        elements.deliveryInputGroup.style.display = 'none';
        elements.pickupInputGroup.style.display = 'flex';
        showModal(elements.locationModal);
    });
    
    // Location Confirmation
    elements.btnConfirmAddress.addEventListener('click', () => {
        if (elements.addressInput.value.trim() === '') {
            showToast('Please enter your address');
            return;
        }
        state.location = elements.addressInput.value;
        hideModal(elements.locationModal);
        scrollToMenu();
    });
    
    elements.btnConfirmStore.addEventListener('click', () => {
        const store = document.getElementById('store-select').value;
        state.location = store;
        hideModal(elements.locationModal);
        scrollToMenu();
    });
    
    // Close Modals
    // Auth Modals
    elements.btnSignIn.addEventListener('click', () => {
        if (state.user) {
            if (confirm('Are you sure you want to sign out?')) {
                state.user = null;
                localStorage.removeItem('wabz_user');
                updateAuthUI();
            }
        } else {
            showModal(elements.authModal);
        }
    });
    
    elements.btnCloseAuth.addEventListener('click', () => hideModal(elements.authModal));
    
    let authMode = 'login';

    elements.tabLogin.addEventListener('click', () => {
        authMode = 'login';
        elements.authTitle.innerText = 'Sign In';
        elements.authEmail.placeholder = 'Email or Phone Number';
        elements.authPhone.style.display = 'none';
        elements.tabLogin.classList.add('active');
        elements.tabRegister.classList.remove('active');
    });

    elements.tabRegister.addEventListener('click', () => {
        authMode = 'register';
        elements.authTitle.innerText = 'Register';
        elements.authEmail.placeholder = 'Email address';
        elements.authPhone.style.display = 'block';
        elements.tabRegister.classList.add('active');
        elements.tabLogin.classList.remove('active');
    });

    elements.btnAuthSubmit.addEventListener('click', async () => {
        let email = elements.authEmail.value.trim();
        const password = elements.authPassword.value;
        let phone = elements.authPhone.value.trim();

        console.log('[Auth] Initialization initiated:', { email, phone, authMode });

        if (!password) {
            showToast('Please enter a password.');
            return;
        }

        if (!email && !phone) {
            showToast('Please provide an Email address or Phone number.');
            return;
        }

        // Swap phone strings if inputted mistakenly into email templates
        if (email && !email.includes('@') && !phone) {
            phone = email;
            email = '';
        }

        try {
            if (authMode === 'login') {
                console.log('[Auth] Processing sign-in logic...');
                let user = null;
                try {
                    const isEmail = email.includes('@');
                    const GET_USER = `
                        query GetUser($email: String, $phone: String) {
                            users(where: {_or: [{email: {_eq: $email}}, {phone_number: {_eq: $phone}}]}) {
                                id
                                email
                                password_hash
                                phone_number
                            }
                        }
                    `;
                    
                    const response = await nhost.graphql.request({
                        query: GET_USER,
                        variables: {
                            email: isEmail ? email : null,
                            phone: !isEmail ? email : null
                        }
                    });
                    const data = response.data || response.body?.data;
                    const error = response.error || response.body?.errors;

                    if (!error && data && data.users && data.users[0]) {
                        user = data.users[0];
                        console.log('[Auth] Remote match retrieved.');
                    }
                } catch (e) {
                    console.warn('[Auth] Nhost parameters bypassed.', e);
                }

                // LocalStorage Fallback
                if (!user) {
                    console.log('[Auth] Applying offline proxy validations...');
                    const localUsers = JSON.parse(localStorage.getItem('wabz_mock_users') || '[]');
                    user = localUsers.find(u => u.email === email || u.phone_number === email);
                }

                if (!user || user.password_hash !== password) {
                    console.error('[Auth] Login failure: Mismatched strings.');
                    showToast('Invalid credentials provided.');
                    return;
                }

                console.log('[Auth] Successful authentication state.');
                showToast(`Welcome back to Wabz Foods!`);
                state.user = user;
                localStorage.setItem('wabz_user', JSON.stringify(user));
                updateAuthUI();
                hideModal(elements.authModal);
            } else {
                console.log('[Auth] Processing registration creation...');
                let newUser = null;
                try {
                    const REGISTER_MUTATION = `
                        mutation RegisterUser($email: String!, $password: String!, $phone: String!) {
                            insert_users_one(object: {email: $email, password_hash: $password, phone_number: $phone}) {
                                id
                                email
                                password_hash
                                phone_number
                            }
                        }
                    `;

                    const response = await nhost.graphql.request({
                        query: REGISTER_MUTATION,
                        variables: {
                            email,
                            password,
                            phone
                        }
                    });
                    const data = response.data || response.body?.data;
                    const error = response.error || response.body?.errors;

                    if (!error && data && data.insert_users_one) {
                        newUser = data.insert_users_one;
                        console.log('[Auth] Remote onboarding successful.');
                    }
                } catch (e) {
                    console.warn('[Auth] Offline thresholds activated.', e);
                }

                // LocalStorage Fallback
                if (!newUser) {
                    console.log('[Auth] Committing account variables locally.');
                    const localUsers = JSON.parse(localStorage.getItem('wabz_mock_users') || '[]');
                    if (localUsers.some(u => u.email === email || u.phone_number === phone)) {
                        showToast('User with this email or phone already exists.');
                        return;
                    }
                    newUser = {
                        id: 'local_' + Date.now(),
                        email,
                        password_hash: password,
                        phone_number: phone
                    };
                    localUsers.push(newUser);
                    localStorage.setItem('wabz_mock_users', JSON.stringify(localUsers));
                }
                
                showToast('Registration successful! Welcome to Wabz Foods.');
                state.user = newUser;
                localStorage.setItem('wabz_user', JSON.stringify(newUser));
                updateAuthUI();
                hideModal(elements.authModal);
            }
        } catch (e) {
            console.error('[Auth] General failure state:', e);
            showToast(`Authentication operation failed: ${e.message || e.details || JSON.stringify(e)}`);
        }
    });

    elements.btnCloseLocation.addEventListener('click', () => hideModal(elements.locationModal));
    elements.btnCloseProduct.addEventListener('click', () => hideModal(elements.productModal));
    elements.btnCloseCart.addEventListener('click', () => hideModal(elements.cartModal));
    elements.btnClosePayment.addEventListener('click', () => hideModal(elements.paymentModal));
    elements.btnCloseTracking.addEventListener('click', () => hideModal(elements.trackingModal));
    
    // Cart Trigger
    elements.cartTrigger.addEventListener('click', () => {
        renderCart();
        showModal(elements.cartModal);
    });
    
    // Checkout
    elements.btnProceedCheckout.addEventListener('click', () => {
        if (state.cart.length === 0) {
            showToast('Your cart is empty!');
            return;
        }
        hideModal(elements.cartModal);
        showModal(elements.paymentModal);
    });
    
    // Payment Methods
    elements.payMomo.addEventListener('click', () => {
        document.getElementById('payment-methods').style.display = 'none';
        elements.momoInputGroup.style.display = 'flex';
    });
    
    elements.payCard.addEventListener('click', () => {
        simulatePayment('Card');
    });
    
    elements.payCash.addEventListener('click', () => {
        simulatePayment('Cash');
    });
    
    elements.submitMomo.addEventListener('click', () => {
        const phone = document.getElementById('momo-number').value;
        if (phone.trim() === '') {
            showToast('Please enter your phone number');
            return;
        }
        simulatePayment('MoMo');
    });

    // Review Modal Listeners
    if (elements.btnOpenReview) {
        elements.btnOpenReview.addEventListener('click', () => showModal(elements.reviewModal));
    }
    if (elements.btnCloseReview) {
        elements.btnCloseReview.addEventListener('click', () => hideModal(elements.reviewModal));
    }

    // Star Selection Logic
    const starItems = document.querySelectorAll('.star-item');
    starItems.forEach(star => {
        star.addEventListener('click', (e) => {
            const val = parseInt(e.target.dataset.value);
            state.currentRating = val;
            starItems.forEach((s, idx) => {
                if (idx < val) s.classList.add('active');
                else s.classList.remove('active');
            });
        });
    });

    if (elements.btnSubmitReview) {
        elements.btnSubmitReview.addEventListener('click', () => {
            if (!state.currentRating) {
                showToast('Please select a star rating.');
                return;
            }
            const text = document.getElementById('review-text').value;
            if (text.length < 5) {
                showToast('Please share a little more about your experience.');
                return;
            }
            
            // Save to Local Storage for Admin access
            try {
                const reviews = JSON.parse(localStorage.getItem('wabz_mock_reviews') || '[]');
                let authorName = "Anonymous Customer";
                
                // Try to get user from Nhost session or local storage
                try {
                    const sessionData = JSON.parse(localStorage.getItem('nhostRefreshToken') || '{}');
                    // Check if there is a known wabz_user
                    const localUser = JSON.parse(localStorage.getItem('wabz_user'));
                    if (localUser && localUser.displayName) authorName = localUser.displayName;
                } catch(e) {}
                
                reviews.unshift({
                    id: 'rev_' + Date.now(),
                    rating: state.currentRating,
                    text: text,
                    author: authorName,
                    date: new Date().toISOString()
                });
                
                localStorage.setItem('wabz_mock_reviews', JSON.stringify(reviews));
            } catch (err) {
                console.error("Failed to save review", err);
            }
            
            showToast('Thank you for your feedback! Your review has been submitted for moderation.');
            hideModal(elements.reviewModal);
            // Reset for next time
            state.currentRating = 0;
            starItems.forEach(s => s.classList.remove('active'));
            document.getElementById('review-text').value = '';
        });
    }
}

function scrollToMenu() {
    document.getElementById('menu-container').scrollIntoView({ behavior: 'smooth' });
}

// Product Modal Logic
let selectedProduct = null;

function openProductModal(productId) {
    selectedProduct = state.menuItems.find(item => item.id === productId);
    document.getElementById('modal-product-name').innerText = selectedProduct.name;
    document.getElementById('modal-product-price').innerText = `UGX ${selectedProduct.price.toLocaleString()}`;
    
    const optionsHtml = selectedProduct.modifiers.map(mod => `
        <div style="margin-bottom: 16px;">
            <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 8px; color: var(--secondary-color);">${mod.name}</h4>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                ${mod.options.map((opt, index) => `
                    <label style="background: var(--surface-elevated); padding: 8px 16px; border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--glass-border); display: flex; align-items: center; gap: 8px;">
                        <input type="radio" name="${mod.name}" value="${opt}" ${index === 0 ? 'checked' : ''} style="accent-color: var(--primary-color);">
                        <span>${opt}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    document.getElementById('modal-product-body').innerHTML = `
        <div style="height: 200px; background-image: url('${selectedProduct.image}'); background-size: cover; background-position: center; border-radius: var(--radius-md); margin-bottom: 20px;"></div>
        <p style="color: var(--text-secondary); margin-bottom: 20px;">${selectedProduct.description}</p>
        ${optionsHtml}
    `;
    
    showModal(elements.productModal);
    
    // Add to Cart Button Handler
    document.getElementById('add-to-cart-btn').onclick = () => {
        const selectedModifiers = {};
        selectedProduct.modifiers.forEach(mod => {
            const selectedOpt = document.querySelector(`input[name="${mod.name}"]:checked`).value;
            selectedModifiers[mod.name] = selectedOpt;
        });
        
        addToCart(selectedProduct, selectedModifiers);
        hideModal(elements.productModal);
    };
}

function addToCart(product, modifiers) {
    const modifiersString = JSON.stringify(modifiers);
    
    // Check if identical item already exists
    const existingItemIndex = state.cart.findIndex(item => 
        item.id === product.id && JSON.stringify(item.selectedModifiers) === modifiersString
    );

    if (existingItemIndex > -1) {
        state.cart[existingItemIndex].quantity += 1;
    } else {
        state.cart.push({
            ...product,
            selectedModifiers: modifiers,
            quantity: 1,
            cartId: Date.now()
        });
    }
    
    updateCartUI();
    showToast(`Added ${product.name} to cart`);
}

function updateCartUI() {
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    elements.cartCount.innerText = totalItems;
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    elements.cartTotal.innerText = `UGX ${total.toLocaleString()}`;
    elements.cartTotalAmount.innerText = `UGX ${total.toLocaleString()}`;
}

window.updateCartQuantity = function(cartId, change) {
    const itemIndex = state.cart.findIndex(item => item.cartId === cartId);
    if (itemIndex > -1) {
        state.cart[itemIndex].quantity += change;
        if (state.cart[itemIndex].quantity <= 0) {
            state.cart = state.cart.filter(item => item.cartId !== cartId);
        }
        updateCartUI();
        renderCart();
    }
};

function renderCart() {
    if (state.cart.length === 0) {
        elements.cartItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Your cart is empty.</p>';
        return;
    }
    
    elements.cartItemsContainer.innerHTML = state.cart.map(item => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--glass-border);">
            <div style="flex: 1;">
                <h4 style="font-weight: 600;">${item.name}</h4>
                <p style="font-size: 0.75rem; color: var(--text-secondary);">
                    ${Object.entries(item.selectedModifiers).map(([k, v]) => `${k}: ${v}`).join(', ')}
                </p>
                <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                    <button class="qty-btn" onclick="updateCartQuantity(${item.cartId}, -1)" style="background: var(--surface-color); border: 1px solid var(--glass-border); color: var(--text-primary); width: 24px; height: 24px; border-radius: 4px; cursor: pointer;">-</button>
                    <span style="font-size: 0.9rem; font-weight: 600;">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateCartQuantity(${item.cartId}, 1)" style="background: var(--surface-color); border: 1px solid var(--glass-border); color: var(--text-primary); width: 24px; height: 24px; border-radius: 4px; cursor: pointer;">+</button>
                </div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                <span style="font-weight: 700; color: var(--secondary-color);">UGX ${(item.price * item.quantity).toLocaleString()}</span>
                <button class="remove-item" data-id="${item.cartId}" style="background: none; border: none; color: var(--primary-color); cursor: pointer;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `).join('');
    
    // Add Remove Handlers
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartId = parseInt(e.currentTarget.dataset.id);
            state.cart = state.cart.filter(item => item.cartId !== cartId);
            updateCartUI();
            renderCart();
        });
    });
}

async function saveOrderToBackend(method) {
    try {
        const total = state.cart.reduce((sum, item) => sum + item.price, 0);
        const orderData = {
            user_id: state.user ? state.user.id : null,
            fulfillment: state.fulfillment,
            location: state.location || 'Default Location',
            total_amount: total,
            status: 'Pending',
            payment_method: method,
            payment_status: method === 'Cash' ? 'Unpaid' : 'Paid',
            idempotency_key: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        const INSERT_ORDER = `
            mutation InsertOrder($object: orders_insert_input!) {
                insert_orders_one(object: $object) {
                    id
                }
            }
        `;
        
        const { data: orderResp, error: orderError } = await nhost.graphql.request(INSERT_ORDER, {
            object: orderData
        });

        if (orderError) throw orderError;
        const orderId = orderResp && orderResp.insert_orders_one && orderResp.insert_orders_one.id;
        if (!orderId) throw new Error("Failed to create order record.");

        const orderItemsData = state.cart.map(item => ({
            order_id: orderId,
            menu_item_id: item.id,
            quantity: 1,
            modifiers: item.selectedModifiers,
            price: item.price
        }));

        const INSERT_ORDER_ITEMS = `
            mutation InsertOrderItems($objects: [order_items_insert_input!]!) {
                insert_order_items(objects: $objects) {
                    affected_rows
                }
            }
        `;

        const { error: itemsError } = await nhost.graphql.request(INSERT_ORDER_ITEMS, {
            objects: orderItemsData
        });

        if (itemsError) throw itemsError;

        if (method !== 'Cash') {
            const paymentData = {
                order_id: orderId,
                gateway_transaction_id: `tx_${Date.now()}`,
                payment_method: method,
                amount: total
            };

            const INSERT_PAYMENT = `
                mutation InsertPayment($object: payments_insert_input!) {
                    insert_payments_one(object: $object) {
                        id
                    }
                }
            `;

            const { error: paymentError } = await nhost.graphql.request(INSERT_PAYMENT, {
                object: paymentData
            });

            if (paymentError) throw paymentError;
        }

        return orderId;
    } catch (error) {
        console.error('Error saving order to backend, falling back to local state:', error);
        try {
            const localOrders = JSON.parse(localStorage.getItem('wabz_mock_orders') || '[]');
            const orderId = 'local_order_' + Date.now();
            const total = state.cart.reduce((sum, item) => sum + item.price, 0);
            
            const orderData = {
                id: orderId,
                user_id: state.user ? state.user.id : null,
                fulfillment: state.fulfillment,
                location: state.location || 'Default Location',
                total_amount: total,
                status: 'Pending',
                payment_method: method,
                payment_status: method === 'Cash' ? 'Unpaid' : 'Paid',
                created_at: new Date().toISOString(),
                order_items: state.cart.map(item => ({
                    id: 'local_item_' + Math.random().toString(36).substr(2, 9),
                    order_id: orderId,
                    menu_item_id: item.id,
                    quantity: 1,
                    modifiers: item.selectedModifiers,
                    price: item.price
                }))
            };
            
            localOrders.push(orderData);
            localStorage.setItem('wabz_mock_orders', JSON.stringify(localOrders));
            return orderId;
        } catch (e) {
            console.error('Failed updating offline logs:', e);
        }
        return null;
    }
}

// Payment Simulation
async function simulatePayment(method) {
    document.getElementById('payment-methods').style.display = 'none';
    elements.momoInputGroup.style.display = 'none';
    elements.paymentStatusContainer.style.display = 'block';
    
    if (method === 'MoMo') {
        elements.paymentStatusText.innerText = 'Waiting for MoMo PIN...';
        elements.paymentStatusSubtext.innerText = 'Please check your phone for the prompt.';
    } else if (method === 'Card') {
        elements.paymentStatusText.innerText = 'Processing Card...';
        elements.paymentStatusSubtext.innerText = 'Communicating with secure gateway.';
    } else {
        elements.paymentStatusText.innerText = 'Finalizing Order...';
        elements.paymentStatusSubtext.innerText = 'Confirming with kitchen.';
    }
    
    // Save order to backend
    const orderId = await saveOrderToBackend(method);
    if (orderId) {
        console.log('Order successfully created in backend with ID:', orderId);
    }
    
    // Simulate Real-time updates
    setTimeout(() => {
        elements.paymentStatusText.innerText = 'Payment Successful!';
        elements.paymentStatusSubtext.innerText = 'Order sent to kitchen.';
        
        setTimeout(() => {
            hideModal(elements.paymentModal);
            showModal(elements.trackingModal);
            state.cart = [];
            updateCartUI();
            
            // Reset Payment Modal state
            document.getElementById('payment-methods').style.display = 'block';
            elements.momoInputGroup.style.display = 'none';
            elements.paymentStatusContainer.style.display = 'none';
            
            // Start Live Order Tracking
            simulateTracking(orderId);
        }, 2000);
    }, 3000);
}

function simulateTracking(orderId) {
    if (!orderId) return;
    
    const trackingTitle = document.querySelector('#tracking-modal h4');
    if (trackingTitle) {
        trackingTitle.innerText = `Order #${orderId.replace('local_order_', '').slice(0, 8).toUpperCase()}`;
    }
    
    elements.trackingStatus.innerText = 'Pending';
    
    const interval = setInterval(async () => {
        let currentStatus = null;
        
        // 1. Check Nhost (if backend is active)
        if (!orderId.startsWith('local_')) {
            try {
                const GET_ORDER_STATUS = `query { orders_by_pk(id: "${orderId}") { status } }`;
                const resp = await nhost.graphql.request({ query: GET_ORDER_STATUS });
                if (resp.data && resp.data.orders_by_pk) {
                    currentStatus = resp.data.orders_by_pk.status;
                }
            } catch(e) {}
        }
        
        // 2. Check LocalStorage fallback
        if (!currentStatus) {
            const localOrders = JSON.parse(localStorage.getItem('wabz_mock_orders') || '[]');
            const order = localOrders.find(o => o.id === orderId);
            if (order) {
                currentStatus = order.status;
            }
        }
        
        if (currentStatus) {
            const prevStatus = elements.trackingStatus.innerText;
            elements.trackingStatus.innerText = currentStatus;
            
            if (currentStatus !== prevStatus && (currentStatus === 'Completed' || currentStatus === 'Cancelled')) {
                clearInterval(interval);
                const msg = currentStatus === 'Completed' ? 'Your food is ready and has arrived! Enjoy!' : 'Your order was cancelled.';
                setTimeout(() => showToast(`🔔 Wabz Foods: ${msg}`), 500);
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('Wabz Foods', { body: msg });
                }
            }
        }
    }, 2000); // Check every 2 seconds for a highly responsive live feel
}

// Run
init();

// Scroll-aware header shadow
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (header) {
        header.classList.toggle('scrolled', window.scrollY > 20);
    }
}, { passive: true });

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'error' ? '&#9888;' : '&#10003;';
    toast.innerHTML = `<div class="toast-content"><span class="toast-icon">${icon}</span><span class="toast-message">${message}</span></div>`;
    
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
