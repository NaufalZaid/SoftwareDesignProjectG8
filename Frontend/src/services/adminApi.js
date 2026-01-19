// src/services/adminApi.js
// ✅ Matches the endpoints you shared from Postman.
// Works best with a Vite proxy (BASE_URL=""), but you can set BASE_URL to "http://localhost:8080" too.

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
 * Get seller info
 * GET /api/v1/admin/sellers/{sellerId}
 */
export async function getSellerInfo(sellerId) {
  if (!sellerId) throw new Error("getSellerInfo(sellerId) requires sellerId");
  return request(`/api/v1/admin/sellers/${encodeURIComponent(sellerId)}`);
}

/**
 * Approve seller
 * PUT /api/v1/admin/sellers/{sellerId}/approve
 */
export async function approveSeller(sellerId) {
  if (!sellerId) throw new Error("approveSeller(sellerId) requires sellerId");
  return request(`/api/v1/admin/sellers/${encodeURIComponent(sellerId)}/approve`, {
    method: "PUT",
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
  return request("/api/v1/admin/settings/update", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/* -------------------- ADMIN: TRANSACTIONS -------------------- */
/**
 * ⚠️ Your Postman endpoint list does NOT include any admin transactions endpoints.
 * So we cannot implement:
 * - list all transactions
 * - filter transactions
 * - transaction summary
 *
 * If you find any endpoints like:
 *   GET /api/v1/admin/transactions
 *   GET /api/v1/admin/report?start=...&end=...
 *   GET /api/v1/admin/status/{status}
 *   GET /api/v1/admin/user/{userId}
 *   GET /api/v1/admin/{transactionId}
 * paste them and I’ll add them immediately.
 */

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
