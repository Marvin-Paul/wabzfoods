import { describe, it, expect } from "vitest";
import { mapFoodProduct, mapProduct, mapOrder, DEFAULT_SETTINGS } from "./supabase-data.js";

describe("mapFoodProduct", () => {
  it("maps a Supabase food_items row to the UI product model", () => {
    const row = {
      item_id: 3,
      name: "Beef Luwombo",
      description: "Tender beef in groundnut sauce",
      price: 15000,
      image_url: "/food/beef-luwombo.jpg",
      is_available: true,
      is_featured: true,
      prep_time: "25-30 mins",
      calories: "~650 kcal",
      categories: { category_code: "local" },
    };

    const product = mapFoodProduct(row);

    expect(product).toMatchObject({
      id: 3,
      name: "Beef Luwombo",
      price: 15000,
      image_url: "/food/beef-luwombo.jpg",
      category: "local",
      featured: true,
      available: true,
      prep: "25-30 mins",
      kcal: "~650 kcal",
    });
  });

  it("falls back to 'fast' when no category is joined", () => {
    const product = mapFoodProduct({ item_id: 9, name: "Burger", price: "8000" });
    expect(product.category).toBe("fast");
    expect(product.available).toBe(true);
  });

  it("coerces price to a number and defaults prep/kcal", () => {
    const product = mapFoodProduct({
      item_id: 1,
      name: "Rolex",
      price: "4000",
      categories: { category_code: "fast" },
    });
    expect(product.price).toBe(4000);
    expect(product.prep).toBe("15-20 mins");
    expect(product.kcal).toBe("~450 kcal");
  });
});

describe("mapProduct", () => {
  it("maps a legacy menu_items row", () => {
    const product = mapProduct({
      item_id: 7,
      name: "Matooke & Beef",
      base_price: "10000",
      image: "/food/matooke-and-beef.jpg",
      category_code: "local",
      badge: true,
    });

    expect(product).toMatchObject({
      id: 7,
      price: 10000,
      category: "local",
      featured: true,
      available: true,
    });
  });
});

describe("mapOrder", () => {
  it("maps order fields and nested order items", () => {
    const order = mapOrder({
      order_id: "o1",
      order_type: "delivery",
      status: "pending",
      payment_status: "unpaid",
      total_amount: 25000,
      customer_name: "Sarah N.",
      created_at: "2026-03-10T18:30:00Z",
      order_items: [{ item_id: 3, quantity: 2, price: 5000, customizations: null }],
    });

    expect(order.id).toBe("o1");
    expect(order.total).toBe(25000);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].qty).toBe(2);
    expect(order.customer_name).toBe("Sarah N.");
  });

  it("resolves item names via the itemNames map and falls back for legacy rows", () => {
    const order = mapOrder(
      {
        order_id: "o2",
        order_type: "pickup",
        status: "ready",
        payment_status: "unpaid",
        total_amount: 15000,
        created_at: "2026-03-11T10:00:00Z",
        order_items: [
          { item_id: "abc-123", quantity: 1, price: 10000, customizations: null },
          { item_id: "Rolex", quantity: 1, price: 5000, customizations: null },
        ],
      },
      { "abc-123": "Beef Luwombo" }
    );

    expect(order.items[0].name).toBe("Beef Luwombo");
    // Older rows stored the display name in item_id — those should still render.
    expect(order.items[1].name).toBe("Rolex");
  });
});

describe("DEFAULT_SETTINGS", () => {
  it("contains opening hours used by the open/closed check", () => {
    expect(DEFAULT_SETTINGS.opening_time).toBe("08:00");
    expect(DEFAULT_SETTINGS.closing_time).toBe("22:00");
    expect(DEFAULT_SETTINGS.delivery_fee).toBe("5000");
  });
});
