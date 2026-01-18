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
export async function getWalletBalance(userId) {
    const res = await fetch(`/api/v1/customer/user/${userId}/balance`);
    if (!res.ok) throw new Error("Failed to fetch balance");
    return res.json();
}

export async function topUpWallet(userId, amount) {
    const res = await fetch(
        `/api/v1/customer/wallet/${userId}/topup?amount=${amount}`,
        { method: "POST" }
    );
    if (!res.ok) throw new Error("Top-up failed");
    return res.text();
}

export async function payForOrder(orderId) {
    const res = await fetch(
        `/api/v1/customer/order/${orderId}/pay`,
        { method: "POST" }
    );
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }
    return res.text();
}
export async function getCustomerProfile(userId) {
    const res = await fetch(`/api/v1/customer/${userId}/profile`);
    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
}
export async function getShippingAddress(userId) {
    const profile = await getCustomerProfile(userId);
    return profile.shippingAddress();
}

