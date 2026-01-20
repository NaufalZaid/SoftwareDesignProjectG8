import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getMyOrders,
    payForOrder
} from "../services/api";

export default function MyOrders() {
    const customerId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [processingOrderId, setProcessingOrderId] = useState(null);

    /* ================= LOAD ORDERS ================= */
    useEffect(() => {
        if (!customerId) return;
        getMyOrders(customerId).then(setOrders);
    }, [customerId]);

    /* ================= PAY ================= */
    async function handlePay(orderId) {
        setProcessingOrderId(orderId);
        try {
            await payForOrder(orderId);
            alert("Payment successful");

            const updatedOrders = await getMyOrders(customerId);
            setOrders(updatedOrders);
        } catch (e) {
            alert(e.message);
        } finally {
            setProcessingOrderId(null);
        }
    }

    /* ================= UI ================= */
    return (
        <div style={{ padding: 20, maxWidth: 800 }}>
            <h2>My Orders</h2>

            {orders.length === 0 && (
                <p>No orders found.</p>
            )}

            {orders.map(o => (
                <div
                    key={o.orderID}
                    style={{
                        border: "1px solid #ccc",
                        padding: 12,
                        marginBottom: 12,
                        cursor: "pointer"
                    }}
                    onClick={() =>
                        navigate(`/customer/orders/${o.orderID}`)
                    }
                >
                    {/* PRODUCT INFO */}
                    {o.product && (
                        <div style={{ display: "flex", gap: 12 }}>
                            {o.product.images &&
                                o.product.images.length > 0 && (
                                    <img
                                        src={
                                            o.product.images[0].url
                                                ? o.product.images[0].url
                                                : `data:image/jpeg;base64,${o.product.images[0].data}`
                                        }
                                        alt={o.product.name}
                                        style={{
                                            width: 120,
                                            height: 80,
                                            objectFit: "cover"
                                        }}
                                    />
                                )}

                            <div>
                                <p><strong>{o.product.name}</strong></p>
                                <p>SKU: {o.product.sku}</p>
                                <p>Brand: {o.product.brand}</p>
                            </div>
                        </div>
                    )}

                    {/* ORDER INFO */}
                    <p>Quantity: {o.quantity}</p>
                    <p>Payment: {o.paymentStatus}</p>
                    <p>Shipment: {o.shipmentStatus}</p>

                    {/* ACTION */}
                    {o.paymentStatus === "UNPAID" && (
                        <button
                            disabled={processingOrderId === o.orderID}
                            onClick={(e) => {
                                e.stopPropagation(); // prevent navigation
                                handlePay(o.orderID);
                            }}
                        >
                            {processingOrderId === o.orderID
                                ? "Processing..."
                                : "Pay Now"}
                        </button>
                    )}
                </div>
            ))}

            <button onClick={() => navigate("/customer")}>
                Home
            </button>
        </div>
    );
}
