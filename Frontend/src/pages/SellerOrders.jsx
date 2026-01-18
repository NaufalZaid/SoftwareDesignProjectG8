import { useEffect, useState } from "react";
import {
    getSellerOrders,
    updateShipmentStatus
} from "../services/sellerOrderService";

export default function SellerOrders() {
    const sellerId = localStorage.getItem("userId");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            const data = await getSellerOrders(sellerId);
            setOrders(data);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(orderId, newStatus) {
        try {
            await updateShipmentStatus(orderId, newStatus);
            loadOrders();
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) return <p>Loading orders...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h2>View Orders & Update Fulfillment</h2>

            {orders.length === 0 && <p>No orders yet.</p>}

            {orders.map(o => (
                <div
                    key={o.orderID}
                    style={{
                        border: "1px solid #ccc",
                        padding: 15,
                        marginBottom: 15
                    }}
                >
                    <h4>{o.product.name}</h4>
                    <p>Customer: {o.customer.name}</p>
                    <p>Quantity: {o.quantity}</p>
                    <p>Total: RM {o.totalAmount}</p>
                    <p>Payment: {o.paymentStatus}</p>

                    <label>
                        Shipment Status:
                        <select
                            value={o.shipmentStatus}
                            onChange={e =>
                                handleStatusChange(o.orderID, e.target.value)
                            }
                            style={{ marginLeft: 10 }}
                        >
                            <option value="PENDING">Pending</option>
                            <option value="SHIPPED">Shipped</option>
                            <option value="DELIVERED">Delivered</option>
                        </select>
                    </label>
                </div>
            ))}
        </div>
    );
}
