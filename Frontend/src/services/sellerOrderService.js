const API_BASE = "/api/v1/seller/orders";

export async function getSellerOrders(sellerId) {
    const res = await fetch(`${API_BASE}?sellerId=${sellerId}`);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
}

export async function updateShipmentStatus(orderId, status) {
    const res = await fetch(`${API_BASE}/${orderId}/shipment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error(await res.text());
}
