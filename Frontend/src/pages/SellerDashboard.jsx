import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SellerDashboard.css";
import SellerLayout from "../layout/SellerLayout";

export default function SellerDashboard() {
    const navigate = useNavigate();
    const sellerId = localStorage.getItem("userId");

    const [orders, setOrders] = useState([]);
    const [balance, setBalance] = useState(0);
    const [withdrawAmount, setWithdrawAmount] = useState("");

    if (!sellerId) {
        return <p className="auth-warning">Please login as seller.</p>;
    }

    useEffect(() => {
        fetchOrders();
        fetchBalance();
    }, []);

    async function fetchOrders() {
        const res = await fetch(`/api/v1/seller/seller/${sellerId}`);
        const data = await res.json();
        setOrders(data);
    }

    async function fetchBalance() {
        const res = await fetch(`/api/v1/seller/user/${sellerId}/balance`);
        const data = await res.json();
        setBalance(data);
    }

    async function updateShipment(orderId, status) {
        await fetch(`/api/v1/seller/${orderId}/shipment?status=${status}`, {
            method: "PATCH"
        });
        fetchOrders();
    }

    async function withdraw() {
        if (!withdrawAmount || withdrawAmount <= 0) {
            alert("Enter valid amount");
            return;
        }

        const res = await fetch(
            `/api/v1/seller/wallet/${sellerId}/withdraw?amount=${withdrawAmount}`,
            { method: "POST" }
        );

        const msg = await res.text();
        alert(msg);
        setWithdrawAmount("");
        fetchBalance();
    }

    return (
        <SellerLayout>
            <div className="seller-dashboard">
                {/* HEADER */}
                <header className="dashboard-header">
                    <div>
                        <h1>Seller Dashboard</h1>
                        <p className="subtitle">
                            Manage your store, orders, and wallet
                        </p>
                    </div>

                    <div className="header-actions">
                        <button
                            className="primary"
                            onClick={() => navigate("/seller/add-product")}
                        >
                            + Add Product
                        </button>
                        <button
                            className="secondary"
                            onClick={() => navigate("/")}
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* GRID */}
                <div className="dashboard-grid">
                    {/* WALLET */}
                    <section className="card wallet-card">
                        <h2>Wallet Balance</h2>
                        <div className="balance">
                            RM {Number(balance).toFixed(2)}
                        </div>

                        <div className="wallet-actions">
                            <input
                                type="number"
                                placeholder="Withdraw amount"
                                value={withdrawAmount}
                                onChange={e =>
                                    setWithdrawAmount(e.target.value)
                                }
                            />
                            <button onClick={withdraw}>Withdraw</button>
                        </div>
                    </section>

                    {/* ORDERS */}
                    <section className="card orders-card">
                        <h2>Orders to Fulfill</h2>

                        {orders.length === 0 && (
                            <p className="muted">No orders yet.</p>
                        )}

                        <div className="orders-list">
                            {orders.map(o => (
                                <div
                                    className="order-item"
                                    key={o.orderID}
                                >
                                    <div className="order-info">
                                        <h3>{o.product.name}</h3>
                                        <p>Quantity: {o.quantity}</p>
                                        <span
                                            className={`status ${o.shipmentStatus.toLowerCase()}`}
                                        >
                                            {o.shipmentStatus}
                                        </span>
                                    </div>

                                    <select
                                        value={o.shipmentStatus}
                                        onChange={e =>
                                            updateShipment(
                                                o.orderID,
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="PENDING">
                                            PENDING
                                        </option>
                                        <option value="SHIPPED">
                                            SHIPPED
                                        </option>
                                        <option value="DELIVERED">
                                            DELIVERED
                                        </option>
                                    </select>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </SellerLayout>
    );
}
