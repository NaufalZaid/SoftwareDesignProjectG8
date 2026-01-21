import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart
} from "../services/cart";

import {
    getCustomerProfile,
    placeOrder,
    getWalletBalance,
    payForOrder
} from "../services/api";

import "../styles/Customer.css";

export default function Cart() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState("");
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!userId) {
            alert("User not logged in");
            navigate("/");
            return;
        }

        setCart(getCart());

        Promise.all([
            getCustomerProfile(userId),
            getWalletBalance(userId)
        ])
            .then(([profile, balance]) => {
                if (!profile.shippingAddress) {
                    throw new Error("No shipping address");
                }

                setShippingAddress(profile.shippingAddress);
                setWalletBalance(balance);
            })
            .catch(err => {
                console.error(err);
                alert("Failed to load customer data");
            })
            .finally(() => setLoading(false));
    }, [userId, navigate]);

    function refreshCart() {
        setCart(getCart());
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            alert("Your cart is empty");
            return;
        }

        const totalCost = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        if (walletBalance < totalCost) {
            alert("Insufficient wallet balance");
            return;
        }

        setProcessing(true);

        try {
            for (const item of cart) {
                const order = await placeOrder(
                    userId,
                    item.productId,
                    item.quantity,
                    shippingAddress
                );
                await payForOrder(order.orderID);
            }

            const updatedBalance = await getWalletBalance(userId);
            setWalletBalance(updatedBalance);

            clearCart();
            setCart([]);

            alert("Order placed and paid successfully");
            navigate("/customer");
        } catch (err) {
            console.error(err);
            alert("Checkout failed: " + err.message);
        } finally {
            setProcessing(false);
        }
    }

    if (loading) {
        return <p>Loading cart...</p>;
    }

    return (
        <div className="dashboard-bg">
            <div className="dashboard-wrapper">
                <h2>Shopping Cart</h2>

                {cart.length === 0 && (
                    <p>Your cart is empty.</p>
                )}

                {cart.map(item => (
                    <div key={item.productId} className="order-card">
                        <p><strong>{item.name}</strong></p>
                        <p>Price: <span className="price">RM {item.price}</span></p>

                        <div className="cart-row">
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => {
                                    updateQuantity(
                                        item.productId,
                                        Number(e.target.value)
                                    );
                                    refreshCart();
                                }}
                            />

                            <button
                                onClick={() => {
                                    removeFromCart(item.productId);
                                    refreshCart();
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                <div className="wallet-card">
                    <h4>Shipping Address</h4>
                    <p>{shippingAddress}</p>

                    <p>
                        <strong>Wallet Balance:</strong>{" "}
                        <span className="price">RM {walletBalance}</span>
                    </p>

                    <div className="cart-actions">
                        <button
                            disabled={processing}
                            onClick={handleCheckout}
                        >
                            {processing ? "Processing..." : "Place Order & Pay"}
                        </button>

                        <button onClick={() => navigate("/customer")}>
                            Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
