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
    const [processing, setProcessing] = useState(false);

    /* ================= LOAD DATA ================= */
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
    }, [orderId, userId]);

    /* ================= PAY ================= */
    async function handlePay() {
        setProcessing(true);
        try {
            await payForOrder(orderId);
            alert("Payment successful");

            const updatedOrder = await getOrderDetails(orderId);
            setOrder(updatedOrder);

            const updatedBalance = await getWalletBalance(userId);
            setBalance(updatedBalance);
        } catch (e) {
            alert(e.message);
        } finally {
            setProcessing(false);
        }
    }

    /* ================= STATES ================= */
    if (loading) return <p>Loading...</p>;
    if (!order) return <p>Order not found</p>;

    const product = order.product;

    /* ================= UI ================= */
    return (
        <div style={{ padding: 20, maxWidth: 700 }}>
            <h2>Order Details</h2>

            {/* PRODUCT */}
            {product && (
                <>
                    {product.images && product.images.length > 0 && (
                        <img
                            src={
                                product.images[0].url
                                    ? product.images[0].url
                                    : `data:image/jpeg;base64,${product.images[0].data}`
                            }
                            alt={product.name}
                            style={{
                                width: "100%",
                                maxHeight: 250,
                                objectFit: "cover",
                                marginBottom: 15
                            }}
                        />
                    )}

                    <p><strong>Product:</strong> {product.name}</p>
                    <p><strong>SKU:</strong> {product.sku}</p>
                    <p><strong>Brand:</strong> {product.brand}</p>
                </>
            )}

            {/* ORDER INFO */}
            <p><strong>Quantity:</strong> {order.quantity}</p>
            <p><strong>Total Amount:</strong> RM {order.totalAmount}</p>

            <p>
                <strong>Payment Status:</strong>{" "}
                {order.paymentStatus}
            </p>

            <p>
                <strong>Shipment Status:</strong>{" "}
                {order.shipmentStatus}
            </p>

            {order.estimatedDelivery && (
                <p>
                    <strong>Estimated Delivery:</strong>{" "}
                    {order.estimatedDelivery}
                </p>
            )}

            <hr />

            {/* WALLET */}
            <p><strong>Wallet Balance:</strong> RM {balance}</p>

            {order.paymentStatus === "UNPAID" && (
                <button
                    disabled={processing}
                    onClick={handlePay}
                >
                    {processing ? "Processing..." : "Pay Now"}
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
