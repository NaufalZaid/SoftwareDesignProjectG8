import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderDetails } from "../services/api";

export default function OrderDetails() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        getOrderDetails(orderId).then(setOrder);
    }, []);

    if (!order) return <p>Loading...</p>;

    return (
        <div>
            <h2>Order Details</h2>
            <p>Product: {order.product.name}</p>
            <p>Quantity: {order.quantity}</p>
            <p>Total: RM {order.totalAmount}</p>
            <p>Payment: {order.paymentStatus}</p>
            <p>Shipment: {order.shipmentStatus}</p>
            <p>Estimated Delivery: {order.estimatedDelivery}</p>
        </div>
    );
}
