// src/services/adminApi.js
// Admin API functions for the admin dashboard

const BASE_URL = ""; // "" (use Vite proxy) OR "http://localhost:8080"

/* -------------------- Helpers -------------------- */

function buildUrl(path) {
  if (!BASE_URL) return path;
  return path.startsWith("/") ? `${BASE_URL}${path}` : `${BASE_URL}/${path}`;
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return res.json();
  const text = await res.text();
  return text || null;
}

async function request(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(buildUrl(path), { method, headers, body });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
  }

  return parseResponse(res);
}

/* -------------------- AUTH -------------------- */
/**
 * Login (Admin/Seller/Customer use the same endpoint)
 * POST /api/v1/auth/login
 * payload example: { email, password }
 */
export async function login(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("login(payload) requires an object like { email, password }");
  }

  const data = await request("/api/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Convenience: store common fields if they exist (safe even if backend uses different keys)
  if (payload.email) localStorage.setItem("email", payload.email);

  if (data?.userId) localStorage.setItem("userId", data.userId);
  if (data?.userID) localStorage.setItem("userId", data.userID);

  if (data?.role) localStorage.setItem("role", data.role);
  if (data?.user_role) localStorage.setItem("role", data.user_role);
  if (data?.userRole) localStorage.setItem("role", data.userRole);

  return data;
}

/**
 * Register Admin
 * POST /api/v1/admin/create-admin
 * payload depends on backend (email/password/name/etc.)
 */
export async function registerAdmin(payload) {
  return request("/api/v1/admin/create-admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* -------------------- ADMIN: SELLER MANAGEMENT -------------------- */
/**
 * Get all sellers (with optional approval status filter)
 * GET /api/v1/admin/sellers?approved=true/false
 */
export async function getAllSellers(approved = null) {
  const adminEmail = localStorage.getItem("email");
  let url = "/api/v1/admin/sellers";
  if (approved !== null) {
    url += `?approved=${approved}`;
  }
  return request(url, {
    headers: { "User-Email": adminEmail },
  });
}

/**
 * Get seller info
 * GET /api/v1/admin/sellers/{sellerId}
 */
export async function getSellerInfo(sellerId) {
  if (!sellerId) throw new Error("getSellerInfo(sellerId) requires sellerId");
  const adminEmail = localStorage.getItem("email");
  return request(`/api/v1/admin/sellers/${encodeURIComponent(sellerId)}`, {
    headers: { "User-Email": adminEmail },
  });
}

/**
 * Approve seller
 * PUT /api/v1/admin/sellers/{sellerId}/approve
 */
export async function approveSeller(sellerId) {
  if (!sellerId) throw new Error("approveSeller(sellerId) requires sellerId");
  const adminEmail = localStorage.getItem("email");
  return request(`/api/v1/admin/sellers/${encodeURIComponent(sellerId)}/approve`, {
    method: "PUT",
    headers: { "User-Email": adminEmail },
  });
}

/* -------------------- ADMIN: PLATFORM SETTINGS -------------------- */
/**
 * Get Settings
 * GET /api/v1/admin/settings
 */
export async function getPlatformSettings() {
  return request("/api/v1/admin/settings");
}

/**
 * Update Settings
 * PUT /api/v1/admin/settings/update
 */
export async function updatePlatformSettings(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("updatePlatformSettings(payload) requires a JSON object");
  }
  const adminEmail = localStorage.getItem("email");
  return request("/api/v1/admin/settings/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "User-Email": adminEmail,
    },
    body: JSON.stringify(payload),
  });
}

/* -------------------- ADMIN: TRANSACTIONS -------------------- */
/**
 * Get user transaction history
 * GET /api/v1/admin/user/{userId}
 */
export async function getUserTransactionHistory(userId) {
  if (!userId) throw new Error("getUserTransactionHistory(userId) requires userId");
  return request(`/api/v1/admin/user/${encodeURIComponent(userId)}`);
}

/**
 * Get audit report by date range
 * GET /api/v1/admin/report?start=...&end=...
 * @param {string} start - ISO datetime string (e.g., "2026-01-01T00:00:00")
 * @param {string} end - ISO datetime string (e.g., "2026-01-07T23:59:59")
 */
export async function getTransactionReport(start, end) {
  if (!start || !end) throw new Error("getTransactionReport(start, end) requires both start and end dates");
  const qs = new URLSearchParams({
    start: start,
    end: end,
  }).toString();
  return request(`/api/v1/admin/report?${qs}`);
}

/**
 * Get transactions by status
 * GET /api/v1/admin/status/{status}
 * @param {string} status - e.g., "SUCCESS", "PAID", "FAILED", "UNPAID"
 */
export async function getTransactionsByStatus(status) {
  if (!status) throw new Error("getTransactionsByStatus(status) requires status");
  return request(`/api/v1/admin/status/${encodeURIComponent(status)}`);
}

/**
 * Get single transaction details
 * GET /api/v1/admin/transactions/{transactionId}
 */
export async function getTransactionDetails(transactionId) {
  if (!transactionId) throw new Error("getTransactionDetails(transactionId) requires transactionId");
  return request(`/api/v1/admin/transactions/${encodeURIComponent(transactionId)}`);
}

/* -------------------- ADMIN: CATEGORIES -------------------- */
/**
 * Get all categories (public endpoint for dropdowns)
 * GET /api/v1/categories
 */
export async function getAllCategories() {
  return request("/api/v1/categories");
}

/**
 * Get categories as hierarchical tree
 * GET /api/v1/categories/tree
 */
export async function getCategoryTree() {
  return request("/api/v1/categories/tree");
}

/**
 * Get single category by ID (admin)
 * GET /api/v1/admin/categories/{id}
 */
export async function getCategoryById(categoryId) {
  if (!categoryId) throw new Error("getCategoryById(categoryId) requires categoryId");
  const adminEmail = localStorage.getItem("email");
  return request(`/api/v1/admin/categories/${encodeURIComponent(categoryId)}`, {
    headers: { "User-Email": adminEmail },
  });
}

/**
 * Create a new category (admin)
 * POST /api/v1/admin/categories
 */
export async function createCategory(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("createCategory(payload) requires an object");
  }
  const adminEmail = localStorage.getItem("email");
  return request("/api/v1/admin/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Email": adminEmail,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Update a category (admin)
 * PUT /api/v1/admin/categories/{id}
 */
export async function updateCategory(categoryId, payload) {
  if (!categoryId) throw new Error("updateCategory(categoryId, payload) requires categoryId");
  if (!payload || typeof payload !== "object") {
    throw new Error("updateCategory(categoryId, payload) requires an object payload");
  }
  const adminEmail = localStorage.getItem("email");
  return request(`/api/v1/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "User-Email": adminEmail,
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Delete a category (admin)
 * DELETE /api/v1/admin/categories/{id}
 */
export async function deleteCategory(categoryId) {
  if (!categoryId) throw new Error("deleteCategory(categoryId) requires categoryId");
  const adminEmail = localStorage.getItem("email");
  return request(`/api/v1/admin/categories/${encodeURIComponent(categoryId)}`, {
    method: "DELETE",
    headers: { "User-Email": adminEmail },
  });
}

/* -------------------- OPTIONAL: endpoints you listed (not admin-specific) -------------------- */

/**
 * Seller: Add Product
 * POST /api/v1/seller/{sellerId}/addProduct
 */
export async function sellerAddProduct(sellerId, payload) {
  if (!sellerId) throw new Error("sellerAddProduct(sellerId, payload) requires sellerId");
  return request(`/api/v1/seller/${encodeURIComponent(sellerId)}/addProduct`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/**
 * Customer: Place Order
 * POST /api/v1/customer/{customerId}/order/{productId}?quantity=...&address=...
 */
export async function customerPlaceOrder({ customerId, productId, quantity, address }) {
  if (!customerId || !productId) throw new Error("customerPlaceOrder requires customerId and productId");
  const qs = new URLSearchParams({
    quantity: String(quantity ?? 1),
    address: address ?? "",
  }).toString();

  return request(`/api/v1/customer/${encodeURIComponent(customerId)}/order/${encodeURIComponent(productId)}?${qs}`, {
    method: "POST",
  });
}

/**
 * Customer: Pay Order
 * POST /api/v1/customer/order/{orderId}/pay
 */
export async function customerPayOrder(orderId) {
  if (!orderId) throw new Error("customerPayOrder(orderId) requires orderId");
  return request(`/api/v1/customer/order/${encodeURIComponent(orderId)}/pay`, {
    method: "POST",
  });
}

/**
 * Customer: Top Up Wallet
 * POST /api/v1/customer/wallet/{customerId}/topup?amount=...
 */
export async function customerTopUpWallet(customerId, amount) {
  if (!customerId) throw new Error("customerTopUpWallet(customerId, amount) requires customerId");
  if (amount === undefined || amount === null) throw new Error("amount is required");
  const qs = new URLSearchParams({ amount: String(amount) }).toString();

  return request(`/api/v1/customer/wallet/${encodeURIComponent(customerId)}/topup?${qs}`, {
    method: "POST",
  });
}

/**
 * Seller: Update Shipment Status
 * PUT /api/v1/seller/{sellerId}/shipment?status=SHIPPED
 */
export async function sellerUpdateShipmentStatus(sellerId, status) {
  if (!sellerId) throw new Error("sellerUpdateShipmentStatus(sellerId, status) requires sellerId");
  if (!status) throw new Error("status is required");
  return request(`/api/v1/seller/${encodeURIComponent(sellerId)}/shipment?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  });
}

/**
 * Orders: Update Payment Status
 * PUT /api/v1/orders/{orderId}/payment?status=PAID
 */
export async function updateOrderPaymentStatus(orderId, status) {
  if (!orderId) throw new Error("updateOrderPaymentStatus(orderId, status) requires orderId");
  if (!status) throw new Error("status is required");
  return request(`/api/v1/orders/${encodeURIComponent(orderId)}/payment?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  });
}
