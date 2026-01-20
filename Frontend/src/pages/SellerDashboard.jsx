import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

import {
    getOrdersBySeller,
    deleteProduct
} from "../services/api";

const IMAGE_BASE_URL = "http://localhost:8080/product-images/";

function SellerDashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const sellerId = localStorage.getItem("userId");

    const [selectedTab, setSelectedTab] = useState("products");
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    /* ================= ACCESS CONTROL ================= */
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        if (!sellerId) return;

        fetch(`/api/v1/products/seller/${sellerId}`)
            .then(res => res.json())
            .then(data => setProducts(data || []))
            .catch(() => setProducts([]));

        getOrdersBySeller(sellerId)
            .then(data => setOrders(data || []))
            .catch(() => setOrders([]));
    }, [sellerId]);

    async function handleDelete(productId) {
        if (!window.confirm("Delete this product?")) return;

        try {
            await deleteProduct(sellerId, productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
            alert("Product deleted");
        } catch (e) {
            alert(e.message || "Delete failed");
        }
    }

    /* ================= UI ================= */
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ width: "90%" }}>
                <h2 className="auth-title">Seller Dashboard</h2>

                {/* TOP ACTIONS */}
                <div style={{ marginBottom: 20 }}>
                    <button
                        className="auth-button"
                        onClick={() => navigate("/seller/add-product")}
                    >
                        Add Product
                    </button>

                    <button
                        className="auth-button"
                        style={{ marginLeft: 10 }}
                        onClick={() => navigate("/")}
                    >
                        Logout
                    </button>
                </div>

                {/* TABS */}
                <div style={{ marginBottom: 20 }}>
                    <button
                        className="auth-button"
                        disabled={selectedTab === "products"}
                        onClick={() => setSelectedTab("products")}
                    >
                        My Products
                    </button>

                    <button
                        className="auth-button"
                        style={{ marginLeft: 10 }}
                        disabled={selectedTab === "orders"}
                        onClick={() => setSelectedTab("orders")}
                    >
                        Orders
                    </button>
                </div>

                {/* ================= PRODUCTS TAB ================= */}
                {selectedTab === "products" && (
                    <section>
                        <h3>My Products</h3>

                        {products.length === 0 && (
                            <p>No products added yet.</p>
                        )}

                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            {products.map(p => {
                                console.log("PRODUCT:", p.id, p.images);

                                const image =
                                    p.images?.find(img => img.fileName) || null;

                                return (
                                    <div
                                        key={p.id}
                                        style={{
                                            border: "1px solid #ccc",
                                            margin: 10,
                                            padding: 10,
                                            width: 300
                                        }}
                                    >
                                        {image && (
                                            <img
                                                src={`${IMAGE_BASE_URL}${image.fileName}`}
                                                alt={p.name}
                                                style={{
                                                    width: "100%",
                                                    height: 160,
                                                    objectFit: "cover",
                                                    marginBottom: 10
                                                }}
                                            />
                                        )}

                                        <h4>{p.name}</h4>
                                        <p><strong>SKU:</strong> {p.sku}</p>
                                        <p><strong>Brand:</strong> {p.brand}</p>
                                        <p>{p.description}</p>
                                        <p><strong>Price:</strong> RM {p.price}</p>
                                        <p><strong>Status:</strong> {p.status}</p>

                                        <button
                                            className="auth-button"
                                            onClick={() =>
                                                navigate(`/seller/edit-product/${p.id}`)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="auth-button"
                                            style={{
                                                marginLeft: 10,
                                                backgroundColor: "#c00"
                                            }}
                                            onClick={() => handleDelete(p.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* ================= ORDERS TAB ================= */}
                {selectedTab === "orders" && (
                    <section>
                        <h3>Orders</h3>

                        {orders.length === 0 && (
                            <p>No orders yet.</p>
                        )}

                        {orders.map(o => (
                            <div
                                key={o.orderID}
                                style={{
                                    border: "1px solid #aaa",
                                    padding: 10,
                                    marginBottom: 10
                                }}
                            >
                                <p><strong>Product:</strong> {o.product?.name}</p>
                                <p><strong>Quantity:</strong> {o.quantity}</p>
                                <p><strong>Buyer:</strong> {o.customer?.email}</p>
                                <p><strong>Payment:</strong> {o.paymentStatus}</p>
                                <p><strong>Shipment:</strong> {o.shipmentStatus}</p>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </div>
    );
}

export default SellerDashboard;
