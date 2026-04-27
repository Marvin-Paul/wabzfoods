-- Wabz Foods Database Schema

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number VARCHAR UNIQUE NOT NULL,
    email VARCHAR,
    password_hash VARCHAR,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
    id VARCHAR PRIMARY KEY,
    category VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    description TEXT,
    price DECIMAL NOT NULL,
    image VARCHAR,
    badge VARCHAR,
    modifiers JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    fulfillment VARCHAR NOT NULL, -- 'delivery' or 'pickup'
    location TEXT,
    total_amount DECIMAL NOT NULL,
    status VARCHAR DEFAULT 'Pending', -- 'Pending', 'Preparing', 'Out for Delivery', 'Completed', 'Cancelled'
    payment_method VARCHAR, -- 'MoMo', 'Card', 'Cash'
    payment_status VARCHAR DEFAULT 'Unpaid', -- 'Unpaid', 'Authorized', 'Paid', 'Failed'
    idempotency_key VARCHAR UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR REFERENCES menu_items(id),
    quantity INT DEFAULT 1,
    modifiers JSONB DEFAULT '{}'::jsonb,
    price DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id),
    gateway_transaction_id VARCHAR UNIQUE,
    payment_method VARCHAR NOT NULL,
    amount DECIMAL NOT NULL,
    raw_gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert Menu Items
INSERT INTO menu_items (id, category, name, description, price, image, badge, modifiers) VALUES
('lt1', 'limited-time', 'Mega Crunch Box', '2 Pcs crispy chicken, regular fries, and a refreshing cold drink.', 15000, 'assets/box_meal.png', 'Best Seller', '[{"name": "Choose Flavor", "options": ["Original", "Spicy"]}, {"name": "Upgrade Drink", "options": ["Regular", "Large (+UGX 2,000)"]}]'::jsonb),
('p1', 'promo', 'Double Burger Deal', 'Two classic beef burgers stacked with cheese and fresh lettuce.', 25000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', '2-for-1', '[{"name": "Cheese", "options": ["Extra Cheese", "No Cheese"]}]'::jsonb),
('bm1', 'box-meals', 'Wabz Big Box', 'Burger, 1 Pc Chicken, fries, and a drink.', 22000, 'assets/box_meal.png', 'Classic', '[{"name": "Burger Type", "options": ["Beef", "Chicken"]}, {"name": "Drink", "options": ["Coke", "Fanta", "Sprite"]}]'::jsonb),
('cp1', 'chicken-pieces', '5 Pc Chicken Bucket', '5 Pieces of our signature crispy fried chicken.', 30000, 'assets/sharing_bucket.png', 'Hot', '[{"name": "Flavor", "options": ["Original", "Spicy", "Mixed"]}]'::jsonb),
('s1', 'sharing', 'Family Feast', '10 Pcs Chicken, 2 Large Fries, and 2L Drink.', 65000, 'assets/sharing_bucket.png', 'Family Size', '[{"name": "Flavor", "options": ["Original", "Spicy", "Mixed"]}, {"name": "Drink", "options": ["Coke 2L", "Fanta 2L"]}]'::jsonb),
('b1', 'burgers', 'Cheese Master', 'Premium beef patty, cheddar cheese, and special sauce.', 12000, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80', 'New', '[{"name": "Add-ons", "options": ["Bacon (+UGX 3,000)", "None"]}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    category = EXCLUDED.category,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    badge = EXCLUDED.badge,
    modifiers = EXCLUDED.modifiers;

-- Disable RLS for simplicity in this demo linking
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
