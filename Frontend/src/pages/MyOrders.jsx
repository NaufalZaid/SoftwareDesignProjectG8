import { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function MyOrders() {
    const customerId = localStorage.getItem("userId");
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        getMyOrders(customerId).then(setOrders);
    }, []);

    return (
        <div>
            <h2>My Orders</h2>

            {orders.map(o => (
                <div key={o.orderID} onClick={() => navigate(`/customer/orders/${o.orderID}`)}>
                    <p>{o.product.name}</p>
                    <p>Status: {o.shipmentStatus}</p>
                </div>
            ))}
            <button onClick={() => navigate("/customer")}>
                Home
            </button>
        </div>
    );
}
