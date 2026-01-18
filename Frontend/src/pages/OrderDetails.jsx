import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
    getOrderDetails,
    getWalletBalance,
    payForOrder
} from "../services/api";

export default function OrderDetails() {
    const { orderId } = useParams();
    const userId = localStorage.getItem("userId");

    const [order, setOrder] = useState(null);
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const orderData = await getOrderDetails(orderId);
                setOrder(orderData);

                const walletBalance = await getWalletBalance(userId);
                setBalance(walletBalance);
            } catch (e) {
                alert("Failed to load order details");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    async function handlePay() {
        try {
            await payForOrder(orderId);
            alert("Payment successful");

            // Refresh order + wallet balance
            const updatedOrder = await getOrderDetails(orderId);
            setOrder(updatedOrder);

            const updatedBalance = await getWalletBalance(userId);
            setBalance(updatedBalance);
        } catch (e) {
            alert(e.message);
        }
    }

    if (loading) return <p>Loading...</p>;
    if (!order) return <p>Order not found</p>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Order Details</h2>

            <p><strong>Product:</strong> {order.product.name}</p>
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Total:</strong> RM {order.totalAmount}</p>

            <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
            <p><strong>Shipment Status:</strong> {order.shipmentStatus}</p>
            <p><strong>Estimated Delivery:</strong> {order.estimatedDelivery}</p>

            <hr />

            <p><strong>Wallet Balance:</strong> RM {balance}</p>

            {order.paymentStatus === "UNPAID" && (
                <button onClick={handlePay}>
                    Pay Now
                </button>
            )}

            {order.paymentStatus === "PAID" && (
                <p style={{ color: "green" }}>
                    Order has been paid
                </p>
            )}
        </div>
    );
}
