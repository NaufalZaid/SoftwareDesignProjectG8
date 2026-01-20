import { useEffect, useState } from "react";
import "../styles/AuthForm.css";

function Orders() {
    const sellerId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    /* ================= ACCESS CONTROL ================= */
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    /* ================= LOAD ORDERS ================= */
    useEffect(() => {
        const loadOrders = async () => {
            try {
                const response = await fetch(
                    `/api/v1/seller/seller/${sellerId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load orders");
                }

                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load orders");
            }
        };

        loadOrders();
    }, [sellerId]);

    /* ================= UI ================= */
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ width: "90%" }}>
                <h2 className="auth-title">Orders</h2>

                {error && (
                    <p style={{ color: "red" }}>{error}</p>
                )}

                {orders.length === 0 && (
                    <p>No orders found.</p>
                )}

                {orders.map(order => (
                    <div
                        key={order.orderID || order.id}
                        style={{
                            border: "1px solid #ccc",
                            padding: "1rem",
                            marginBottom: "1rem"
                        }}
                    >
                        {/* ORDER INFO */}
                        <p>
                            <strong>Order ID:</strong>{" "}
                            {order.orderID || order.id}
                        </p>
                        <p>
                            <strong>Shipment Status:</strong>{" "}
                            {order.shipmentStatus}
                        </p>
                        <p>
                            <strong>Payment Status:</strong>{" "}
                            {order.paymentStatus}
                        </p>

                        {/* CUSTOMER INFO */}
                        {order.customer && (
                            <p>
                                <strong>Customer:</strong>{" "}
                                {order.customer.email}
                            </p>
                        )}

                        {/* PRODUCT INFO */}
                        {order.product && (
                            <>
                                {order.product.images &&
                                    order.product.images.length > 0 && (
                                        <img
                                            src={
                                                order.product.images[0].url
                                                    ? order.product.images[0].url
                                                    : `data:image/jpeg;base64,${order.product.images[0].data}`
                                            }
                                            alt={order.product.name}
                                            style={{
                                                width: 200,
                                                height: 120,
                                                objectFit: "cover",
                                                marginBottom: "0.5rem"
                                            }}
                                        />
                                    )}

                                <p>
                                    <strong>Product:</strong>{" "}
                                    {order.product.name}
                                </p>
                                <p>
                                    <strong>SKU:</strong>{" "}
                                    {order.product.sku}
                                </p>
                                <p>
                                    <strong>Quantity:</strong>{" "}
                                    {order.quantity}
                                </p>
                                <p>
                                    <strong>Price:</strong>{" "}
                                    RM {order.product.price}
                                </p>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Orders;
