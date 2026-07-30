"use client";

import React, { useState, useMemo } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export default function FoodTable({
  foodItems,
  categories,
  onEdit,
  onDelete,
  onView,
  onToggleAvailable,
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Category lookup
  const catMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = c; });
    return map;
  }, [categories]);

  // Filtered & sorted items
  const processed = useMemo(() => {
    let items = [...foodItems];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      items = items.filter((i) => i.categoryId === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "available") items = items.filter((i) => i.available);
      else if (statusFilter === "out") items = items.filter((i) => !i.available);
      else if (statusFilter === "featured") items = items.filter((i) => i.featured);
    }

    // Sort
    items.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    return items;
  }, [foodItems, search, categoryFilter, statusFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = processed.slice((safePage - 1) * perPage, safePage * perPage);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
  }, [search, categoryFilter, statusFilter, perPage]);

  const getCategoryName = (categoryId) => catMap[categoryId]?.name || "Unknown";

  return (
    <div className="bg-canvas border border-hairline rounded-sm overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-hairline-cool space-y-3">
        {/* Search row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food items..."
              aria-label="Search food items"
              className="w-full pl-9 pr-3 py-2 bg-canvas border border-hairline-strong rounded-sm text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 transition-all"
            />
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={14} className="text-ink-faint" />

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-xs text-ink focus:outline-none focus:border-emerald"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-xs text-ink focus:outline-none focus:border-emerald"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="out">Out of Stock</option>
            <option value="featured">Featured</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 bg-canvas border border-hairline-strong rounded-sm text-xs text-ink focus:outline-none focus:border-emerald"
            aria-label="Sort by"
          >
            <option value="name">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price">Price Low-High</option>
            <option value="price-desc">Price High-Low</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>

          <span className="ml-auto text-[11px] text-ink-mute tabular-nums">
            {processed.length} item{processed.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Table */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-[4px] bg-canvas-soft flex items-center justify-center mb-4 border border-hairline-cool">
            <Search size={22} className="text-ink-faint" />
          </div>
          <p className="text-sm font-medium text-ink">
            {search || categoryFilter !== "all" || statusFilter !== "all"
              ? "No items match your filters"
              : "No food items yet"}
          </p>
          <p className="text-xs text-ink-mute mt-1">
            {search || categoryFilter !== "all" || statusFilter !== "all"
              ? "Try adjusting your search or filters."
              : 'Click "Add Food Item" to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft">
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute w-12">
                  #
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute w-14">
                  Image
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                  Food Name
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                  Price
                </th>
                <th className="text-center px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                  Availability
                </th>
                <th className="text-center px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                  Featured
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-mute">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((item, idx) => (
                <tr
                  key={item.id}
                  className="border-b border-hairline-cool hover:bg-canvas-soft/30 transition-colors group"
                >
                  <td className="px-4 py-3.5 text-xs text-ink-mute tabular-nums">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="w-10 h-10 rounded-[4px] bg-canvas-soft border border-hairline-cool overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        <span className="text-xs font-medium text-ink-mute-2">
                          {item.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-ink-mute mt-0.5 line-clamp-1 max-w-[200px]">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-block text-xs font-medium text-ink-mute bg-canvas-soft px-2 py-0.5 rounded-[4px] border border-hairline-cool">
                      {getCategoryName(item.categoryId)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-medium text-ink tabular-nums">
                      UGX {Number(item.price).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      onClick={() => onToggleAvailable(item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-semibold uppercase tracking-wider transition-all ${
                        item.available
                          ? "bg-emerald/10 text-emerald-deep border border-emerald/20 hover:bg-emerald/20"
                          : "bg-accent-tomato/5 text-accent-tomato border border-accent-tomato/15 hover:bg-accent-tomato/10"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.available ? "bg-emerald" : "bg-accent-tomato"
                        }`}
                      />
                      {item.available ? "Available" : "Out of Stock"}
                    </button>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {item.featured ? (
                      <Star
                        size={16}
                        className="text-accent-yellow fill-accent-yellow mx-auto"
                      />
                    ) : (
                      <span className="text-xs text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onView?.(item)}
                        className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink hover:bg-canvas-soft transition-all"
                        aria-label={`View ${item.name}`}
                        title="View"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink hover:bg-canvas-soft transition-all"
                        aria-label={`Edit ${item.name}`}
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(item)}
                        className="p-1.5 rounded-[4px] text-ink-faint hover:text-accent-tomato hover:bg-accent-tomato/5 transition-all"
                        aria-label={`Delete ${item.name}`}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {processed.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-hairline-cool bg-canvas-soft/50">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-ink-mute">Rows per page:</span>
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-canvas border border-hairline-strong rounded-sm text-[11px] text-ink focus:outline-none"
              aria-label="Rows per page"
            >
              {ITEMS_PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-[11px] text-ink-mute tabular-nums mr-2">
              Page {safePage} of {totalPages}
            </span>
            <button
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
              className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="First page"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Previous page"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Next page"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
              className="p-1.5 rounded-[4px] text-ink-faint hover:text-ink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Last page"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
