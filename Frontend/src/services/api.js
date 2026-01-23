const API_BASE = "/api/v1";

/* ================= PRODUCTS ================= */

export async function getAllProducts() {
    const res = await fetch(`${API_BASE}/products/all`);
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json();
}

/*  CATEGORY FILTER */
export async function getProductsByCategory(category) {
    const res = await fetch(
        `${API_BASE}/products/filter?category=${encodeURIComponent(category)}`
    );

    if (!res.ok) throw new Error("Failed to fetch products by category");
    return res.json();
}

/* ================= CUSTOMER: ORDERS ================= */

export async function placeOrder(customerId, productId, quantity, address) {
    const res = await fetch(
        `${API_BASE}/customer/${customerId}/order/${productId}` +
        `?quantity=${quantity}&address=${encodeURIComponent(address)}`,
        { method: "POST" }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to place order");
    }

    return res.json();
}

export async function getMyOrders(customerId) {
    const res = await fetch(
        `${API_BASE}/customer/${customerId}/orders`
    );

    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

export async function getOrderDetails(orderId) {
    const res = await fetch(
        `${API_BASE}/customer/order/${orderId}`
    );

    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
}

export async function payForOrder(orderId) {
    const res = await fetch(
        `${API_BASE}/customer/order/${orderId}/pay`,
        { method: "POST" }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    return res.text();
}
// Notifications
export async function getNotificationsByUserId(userId) {
    const res = await fetch(`/api/v1/notifications/inApp/${userId}`);
    if (!res.ok) {
        throw new Error("Failed to fetch notifications");
    }
    return res.json();
}

/* ================= CUSTOMER: WALLET ================= */

export async function getWalletBalance(userId) {
    const res = await fetch(
        `${API_BASE}/customer/user/${userId}/balance`
    );

    if (!res.ok) throw new Error("Failed to fetch balance");
    return res.json();
}

export async function topUpWallet(userId, amount) {
    const res = await fetch(
        `${API_BASE}/customer/wallet/${userId}/topup?amount=${amount}`,
        { method: "POST" }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    return res.text();
}

/* ================= CUSTOMER: PROFILE ================= */

export async function getCustomerProfile(userId) {
    const res = await fetch(
        `${API_BASE}/customer/${userId}/profile`
    );

    if (!res.ok) throw new Error("Failed to fetch profile");
    return res.json();
}

export async function getShippingAddress(userId) {
    const profile = await getCustomerProfile(userId);
    return profile.shippingAddress;
}

/* ================= SELLER: PRODUCTS ================= */

export async function getProductsBySeller(sellerId) {
    const res = await fetch(
        `${API_BASE}/products/seller/${sellerId}`
    );

    if (!res.ok) throw new Error("Failed to fetch seller products");
    return res.json();
}

export async function addProduct(sellerId, formData) {
    const res = await fetch(
        `${API_BASE}/seller/${sellerId}/addProduct`,
        {
            method: "POST",
            body: formData
        }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to add product");
    }

    return res.json();
}

export async function updateProduct(sellerId, productId, formData) {
    const res = await fetch(
        `${API_BASE}/seller/${sellerId}/products/${productId}`,
        {
            method: "PUT",
            body: formData
        }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update product");
    }

    return res.json();
}

export async function deleteProduct(sellerId, productId) {
    const res = await fetch(
        `${API_BASE}/seller/${sellerId}/products/${productId}`,
        { method: "DELETE" }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to delete product");
    }

    return res.text();
}

/* ================= SELLER: ORDERS ================= */

export async function getOrdersBySeller(sellerId) {
    const res = await fetch(
        `${API_BASE}/seller/seller/${sellerId}`
    );

    if (!res.ok) throw new Error("Failed to fetch seller orders");
    return res.json();
}

export async function updateShipment(orderId, status) {
    const res = await fetch(
        `${API_BASE}/seller/${orderId}/shipment?status=${status}`,
        { method: "PATCH" }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to update shipment");
    }

    return res.json();
}

/* ================= SELLER: WALLET ================= */

export async function getSellerBalance(userId) {
    const res = await fetch(
        `${API_BASE}/seller/user/${userId}/balance`
    );

    if (!res.ok) throw new Error("Failed to fetch balance");
    return res.json();
}

export async function withdrawFunds(userId, amount) {
    const res = await fetch(
        `${API_BASE}/seller/wallet/${userId}/withdraw?amount=${amount}`,
        { method: "POST" }
    );

    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    return res.text();
}
