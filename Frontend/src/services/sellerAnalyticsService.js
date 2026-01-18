const API_BASE = "/api/v1/seller/analytics";

export async function getSalesSummary(sellerId) {
    const res = await fetch(`${API_BASE}/summary?sellerId=${sellerId}`);
    if (!res.ok) throw new Error("Failed to load sales summary");
    return res.json();
}

export async function getTopProducts(sellerId) {
    const res = await fetch(`${API_BASE}/top-products?sellerId=${sellerId}`);
    if (!res.ok) throw new Error("Failed to load top products");
    return res.json();
}

export async function getOrdersByStatus(sellerId) {
    const res = await fetch(`${API_BASE}/orders-by-status?sellerId=${sellerId}`);
    if (!res.ok) throw new Error("Failed to load order status data");
    return res.json();
}
