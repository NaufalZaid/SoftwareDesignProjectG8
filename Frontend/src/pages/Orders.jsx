import { useEffect, useState } from "react";
import "../styles/AuthForm.css";

function Orders() {
    const sellerId = localStorage.getItem("userId");
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch(`/api/v1/seller/seller/${sellerId}`)
            .then(res => res.json())
            .then(setOrders);
    }, [sellerId]);

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Orders</h2>

                {orders.map(order => (
                    <div key={order.id} style={{ marginBottom: "1rem" }}>
                        <strong>Order #{order.id}</strong>
                        <br />
                        Status: {order.shipmentStatus}
                        <br />
                        Customer: {order.customer?.email}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Orders;
