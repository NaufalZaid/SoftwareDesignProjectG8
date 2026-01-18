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

    useEffect(() => {
        getMyOrders(customerId).then(setOrders);
    }, [customerId]);

    async function handlePay(orderId) {
        try {
            await payForOrder(orderId);
            alert("Payment successful");

            // Refresh orders after payment
            const updatedOrders = await getMyOrders(customerId);
            setOrders(updatedOrders);
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>My Orders</h2>

            {orders.length === 0 && <p>No orders found.</p>}

            {orders.map(o => (
                <div
                    key={o.orderID}
                    style={{
                        border: "1px solid #ccc",
                        padding: 10,
                        marginBottom: 10,
                        cursor: "pointer"
                    }}
                    onClick={() => navigate(`/customer/orders/${o.orderID}`)}
                >
                    <p><strong>{o.product.name}</strong></p>
                    <p>Quantity: {o.quantity}</p>
                    <p>Payment: {o.paymentStatus}</p>
                    <p>Shipment: {o.shipmentStatus}</p>

                    {o.paymentStatus === "UNPAID" && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // prevent navigation
                                handlePay(o.orderID);
                            }}
                        >
                            Pay Now
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
