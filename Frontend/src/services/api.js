const API_BASE = "/api/v1";

export async function getAllProducts() {
    const res = await fetch("/api/v1/products/all");
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}


export async function placeOrder(customerId, productId, quantity, address) {
    const res = await fetch(
        `${API_BASE}/customer/${customerId}/order/${productId}?quantity=${quantity}&address=${encodeURIComponent(address)}`,
        { method: "POST" }
    );
    if (!res.ok) throw new Error("Failed to place order");
    return res.json();
}

export async function getMyOrders(customerId) {
    const res = await fetch(`${API_BASE}/customer/${customerId}/orders`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

export async function getOrderDetails(orderId) {
    const res = await fetch(`${API_BASE}/customer/order/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
}
