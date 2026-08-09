#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
 * Wabz Foods — Seed Script
 * Run: node lib/seed-food-items.js
 * Populates categories + food_items tables with all images
 * from assets/images/food/ (mirrored into public/food/).
 * ═══════════════════════════════════════════════════════════ */

import { createClient } from "@supabase/supabase-js";

/* Supabase client for seeding.
 * Prefer the SERVICE ROLE key (bypasses RLS) when it's provided —
 * required once RLS is enabled via supabase/setup.sql. Falls back to
 * the anon key so the script still works on databases with RLS off.
 */
const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://apnxvhjlpahiepwntpmn.supabase.co";
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbnh2aGpscGFoaWVwd250cG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMTY0MDAsImV4cCI6MjA5Mjc5MjQwMH0.7GX9Pt-gW43fkoiTytFGIhzkfUnQI9H9iK4YyiBawbM";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* Public base URL for food images in the Supabase "Wabzfoods" storage bucket. */
const IMAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/Wabzfoods`;

/* ── Category definitions ── */
const CATEGORIES = [
  {
    category_code: "local",
    name: "Local Foods",
    description: "Traditional Ugandan dishes made from fresh local ingredients.",
    icon: "wheat",
    sort_order: 1,
  },
  {
    category_code: "fast",
    name: "Fast Foods",
    description: "Burgers, fries, pizza, and other quick favourites.",
    icon: "pizza",
    sort_order: 2,
  },
  {
    category_code: "drinks",
    name: "Drinks",
    description: "Fresh juices, sodas, coffee, tea, and bottled beverages.",
    icon: "coffee",
    sort_order: 3,
  },
];

/* ── Food items per category ── */
const LOCAL_FOODS = [
  {
    name: "Beef Luwombo",
    description:
      "Tender beef slow-cooked in traditional groundnut sauce, steamed in banana leaves for that authentic Ugandan flavour.",
    price: 15000,
    image: "beef-luwombo.jpg",
    featured: true,
    prep: "25-30 mins",
    kcal: "~650 kcal",
  },
  {
    name: "Chicken Luwombo",
    description:
      "Succulent chicken luwombo — steamed in banana leaves with groundnut sauce, onions, and aromatic spices.",
    price: 14000,
    image: "chicken-luwombo.jpg",
    featured: true,
    prep: "25-30 mins",
    kcal: "~600 kcal",
  },
  {
    name: "Goat Meat & Rice",
    description:
      "Spiced grilled goat meat served with fluffy steamed rice and a side of fresh kachumbari salad.",
    price: 13000,
    image: "goat-meat-and-rice.jpg",
    featured: false,
    prep: "20-25 mins",
    kcal: "~580 kcal",
  },
  {
    name: "Matooke & Beef",
    description:
      "Steamed green bananas (matooke) paired with rich beef stew — a classic Ugandan comfort meal.",
    price: 10000,
    image: "matooke-and-beef.jpg",
    featured: true,
    prep: "20-25 mins",
    kcal: "~550 kcal",
  },
  {
    name: "Matooke & Fish",
    description:
      "Fresh steamed matooke served with grilled Nile perch in a light tomato and onion sauce.",
    price: 12000,
    image: "matooke-and-fish.jpg",
    featured: false,
    prep: "20-25 mins",
    kcal: "~520 kcal",
  },
  {
    name: "Matooke with Groundnuts",
    description:
      "Smooth steamed matooke generously coated in rich peanut groundnut sauce — pure comfort.",
    price: 9000,
    image: "matooke-with-groundnuts.jpg",
    featured: true,
    prep: "20-25 mins",
    kcal: "~580 kcal",
  },
  {
    name: "Pilao Beef",
    description:
      "Fragrant spiced rice pilao with tender beef chunks, caramelised onions, and authentic East African spices.",
    price: 12000,
    image: "pilao-beef.jpg",
    featured: false,
    prep: "20-25 mins",
    kcal: "~600 kcal",
  },
  {
    name: "Ugandan Kikomando",
    description:
      "The ultimate street-food combo — sliced chapati served with steamed beans and a side of fresh avocado.",
    price: 5000,
    image: "ugandan-kikomando.jpg",
    featured: false,
    prep: "10-15 mins",
    kcal: "~400 kcal",
  },
  {
    name: "Local Food Mega Combo",
    description:
      "The full Ugandan experience: matooke, luwombo, groundnut sauce, rice, beef, and vegetables — feeds 2-3 people.",
    price: 35000,
    image: "ugandan-local-food-mega-combo.jpg",
    featured: true,
    prep: "30-40 mins",
    kcal: "~900 kcal",
  },
];

const FAST_FOODS = [
  {
    name: "Air Fryer Tandoori Chicken",
    description:
      "Spicy tandoori-marinated chicken cooked to perfection in an air fryer — crispy outside, juicy inside.",
    price: 15000,
    image: "air-fryer-tandoori-chicken.jpg",
    featured: false,
    prep: "20-25 mins",
    kcal: "~380 kcal",
  },
  {
    name: "Family Feast Box",
    description:
      "A generous box loaded with fried chicken, chips, coleslaw, and a drink — perfect for sharing.",
    price: 45000,
    image: "box_meal.png",
    featured: true,
    prep: "20-25 mins",
    kcal: "~850 kcal",
  },
  {
    name: "Chapati",
    description: "Soft, layered Ugandan chapati — golden-brown and freshly made to order.",
    price: 2500,
    image: "chapati.jpg",
    featured: false,
    prep: "10-15 mins",
    kcal: "~200 kcal",
  },
  {
    name: "Cheesy BBQ Chicken Pizza",
    description:
      "Wood-fired pizza topped with smoky BBQ chicken, mozzarella, red onions, and fresh herbs.",
    price: 25000,
    image: "cheesy-bbq-chicken-pizza.webp",
    featured: true,
    prep: "20-25 mins",
    kcal: "~680 kcal",
  },
  {
    name: "Chips & Chicken",
    description: "Golden crispy chips served with your choice of grilled or fried chicken pieces.",
    price: 12000,
    image: "chips-and-chicken.jpg",
    featured: false,
    prep: "15-20 mins",
    kcal: "~520 kcal",
  },
  {
    name: "Crispy Oven Sausages",
    description:
      "Oven-baked pork sausages with a crispy golden finish, served with fries and dipping sauce.",
    price: 10000,
    image: "crispy-oven-sausages.jpg",
    featured: false,
    prep: "15-20 mins",
    kcal: "~450 kcal",
  },
  {
    name: "Crispy Samosa Pinwheels",
    description:
      "Delightful crispy samosa pinwheels filled with spiced minced meat and vegetables — a perfect snack.",
    price: 6000,
    image: "crispy-samosa-pinwheels.jpg",
    featured: false,
    prep: "10-15 mins",
    kcal: "~350 kcal",
  },
  {
    name: "Double Burger Deal",
    description:
      "Two juicy beef patties with cheddar, lettuce, tomato, onion rings, and our secret sauce on a toasted brioche bun.",
    price: 18000,
    image: "double-burger-deal.jpg",
    featured: true,
    prep: "15-20 mins",
    kcal: "~650 kcal",
  },
  {
    name: "Fast Food Combo",
    description:
      "The ultimate combo: a burger, chips, a cold drink, and a side of coleslaw — all in one.",
    price: 20000,
    image: "fast-food-combo.jpg",
    featured: true,
    prep: "15-20 mins",
    kcal: "~750 kcal",
  },
  {
    name: "Fish & Chips",
    description:
      "Beer-battered Nile perch fillets, fried golden, served with thick-cut chips and tartar sauce.",
    price: 14000,
    image: "fish-and-chips.jpg",
    featured: false,
    prep: "15-20 mins",
    kcal: "~480 kcal",
  },
  {
    name: "Lipton Onion Soup Burger",
    description:
      "A flavour-packed burger seasoned with Lipton onion soup mix, topped with caramelised onions and Swiss cheese.",
    price: 13000,
    image: "lipton-onion-soup-burger.webp",
    featured: false,
    prep: "15-20 mins",
    kcal: "~500 kcal",
  },
  {
    name: "Low Carb Meatballs",
    description:
      "Keto-friendly beef meatballs in a rich tomato sauce, served with sautéed vegetables instead of pasta.",
    price: 12000,
    image: "low-carb-meatballs.jpg",
    featured: false,
    prep: "15-20 mins",
    kcal: "~320 kcal",
  },
  {
    name: "Nyama Choma",
    description:
      "Traditional East African roasted meat — flame-grilled beef served with ugali, kachumbari, and chilli sauce.",
    price: 18000,
    image: "nyama-choma.jpg",
    featured: true,
    prep: "25-30 mins",
    kcal: "~550 kcal",
  },
  {
    name: "Plain Chips (Fries)",
    description:
      "Classic golden French fries — crispy on the outside, fluffy on the inside. Served with ketchup.",
    price: 5000,
    image: "plain-chips.webp",
    featured: false,
    prep: "10-15 mins",
    kcal: "~350 kcal",
  },
  {
    name: "Roasted Duck in Wine",
    description:
      "Slow-roasted duck marinated in red wine with rosemary and garlic — tender, rich, and unforgettable.",
    price: 28000,
    image: "roasted-duck-in-wine.jpg",
    featured: true,
    prep: "30-40 mins",
    kcal: "~620 kcal",
  },
  {
    name: "Roasted Goat Meat",
    description:
      "Spiced whole-roasted goat meat, slow-cooked until fork-tender and charred to perfection on the edges.",
    price: 22000,
    image: "roasted-goat-meat.jpg",
    featured: false,
    prep: "30-40 mins",
    kcal: "~580 kcal",
  },
  {
    name: "Sharing Bucket",
    description:
      "A heaped bucket of crispy fried chicken, chips, onion rings, chicken wings, and dipping sauces — feeds 3-4 people.",
    price: 55000,
    image: "sharing_bucket.png",
    featured: true,
    prep: "25-30 mins",
    kcal: "~1100 kcal",
  },
  {
    name: "Tassot Cabrit (Fried Goat)",
    description:
      "Haitian-style fried goat meat — crispy, seasoned, and served with pikliz (spicy pickled slaw) and fried plantains.",
    price: 16000,
    image: "tassot-cabrit.jpg",
    featured: false,
    prep: "20-25 mins",
    kcal: "~480 kcal",
  },
  {
    name: "Ugandan Rolex",
    description:
      "The iconic Kampala street food — eggs rolled in a chapati with cabbage, tomatoes, and onions. A national treasure!",
    price: 4000,
    image: "ugandan-rolex.jpg",
    featured: true,
    prep: "10-15 mins",
    kcal: "~350 kcal",
  },
];

const DRINKS = [
  {
    name: "CocaCola (Bottled)",
    description: "Ice-cold CocaCola in a resealable plastic bottle — the classic refreshment.",
    price: 2500,
    image: "coca-cola.jpg",
    featured: true,
    prep: "2 mins",
    kcal: "~150 kcal",
  },
  {
    name: "CocaCola (Glass Bottle)",
    description:
      "The nostalgic glass-bottled CocaCola experience — thicker glass, colder sip, unmistakable fizz.",
    price: 3000,
    image: "glass-cocacola.jpg",
    featured: true,
    prep: "2 mins",
    kcal: "~150 kcal",
  },
  {
    name: "CocaCola Plastic Bottle",
    description:
      "Chilled plastic-bottled CocaCola — the classic taste in a convenient resealable bottle.",
    price: 2500,
    image: "plastic-cocacola.jpg",
    featured: false,
    prep: "2 mins",
    kcal: "~150 kcal",
  },
];

/* ── Seed function ── */
async function seed() {
  console.log("🌱  Seeding Wabz Foods database...\n");

  // 1. Clear existing data
  console.log("  • Clearing existing data...");
  const { error: delItemsErr } = await supabase.from("food_items").delete().neq("item_id", 0);
  if (delItemsErr) console.log(`    (food_items clear: ${delItemsErr.message})`);
  const { error: delCatsErr } = await supabase.from("categories").delete().neq("category_id", 0);
  if (delCatsErr) console.log(`    (categories clear: ${delCatsErr.message})`);

  // 2. Insert categories
  console.log("  • Inserting categories...");
  const { data: cats, error: catErr } = await supabase
    .from("categories")
    .insert(CATEGORIES)
    .select();
  if (catErr) {
    console.error("    ❌ Categories error:", catErr.message);
    process.exit(1);
  }
  console.log(`    ✅ Inserted ${cats.length} categories`);

  // Build lookup: category_code → category_id
  const catMap = {};
  for (const c of cats) catMap[c.category_code] = c.category_id;

  // 3. Insert local foods
  console.log("  • Inserting local foods...");
  const localRows = LOCAL_FOODS.map((f) => ({
    name: f.name,
    description: f.description,
    price: f.price,
    image_url: `${IMAGE_BASE}/${f.image}`,
    category_id: catMap["local"],
    is_available: true,
    is_featured: f.featured,
    prep_time: f.prep,
    calories: f.kcal,
  }));
  const { data: localIns, error: localErr } = await supabase
    .from("food_items")
    .insert(localRows)
    .select();
  if (localErr) {
    console.error("    ❌ Local foods error:", localErr.message);
    process.exit(1);
  }
  console.log(`    ✅ Inserted ${localIns.length} local food items`);

  // 4. Insert fast foods
  console.log("  • Inserting fast foods...");
  const fastRows = FAST_FOODS.map((f) => ({
    name: f.name,
    description: f.description,
    price: f.price,
    image_url: `${IMAGE_BASE}/${f.image}`,
    category_id: catMap["fast"],
    is_available: true,
    is_featured: f.featured,
    prep_time: f.prep,
    calories: f.kcal,
  }));
  const { data: fastIns, error: fastErr } = await supabase
    .from("food_items")
    .insert(fastRows)
    .select();
  if (fastErr) {
    console.error("    ❌ Fast foods error:", fastErr.message);
    process.exit(1);
  }
  console.log(`    ✅ Inserted ${fastIns.length} fast food items`);

  // 5. Insert drinks
  console.log("  • Inserting drinks...");
  const drinkRows = DRINKS.map((f) => ({
    name: f.name,
    description: f.description,
    price: f.price,
    image_url: `${IMAGE_BASE}/${f.image}`,
    category_id: catMap["drinks"],
    is_available: true,
    is_featured: f.featured,
    prep_time: f.prep,
    calories: f.kcal,
  }));
  const { data: drinkIns, error: drinkErr } = await supabase
    .from("food_items")
    .insert(drinkRows)
    .select();
  if (drinkErr) {
    console.error("    ❌ Drinks error:", drinkErr.message);
    process.exit(1);
  }
  console.log(`    ✅ Inserted ${drinkIns.length} drink items`);

  // 6. Summary
  const total = localIns.length + fastIns.length + drinkIns.length;
  console.log(`\n🎉  Done! ${total} food items seeded across ${cats.length} categories.\n`);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
