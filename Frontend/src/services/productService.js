const API_BASE = "/api/v1/seller/products";

export async function getSellerProducts(sellerId) {
    const res = await fetch(`${API_BASE}?sellerId=${sellerId}`);
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
}

export async function createProduct(product) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(await res.text());
}

export async function updateProduct(productId, product) {
    const res = await fetch(`${API_BASE}/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error(await res.text());
}

export async function deleteProduct(productId) {
    const res = await fetch(`${API_BASE}/${productId}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error(await res.text());
}