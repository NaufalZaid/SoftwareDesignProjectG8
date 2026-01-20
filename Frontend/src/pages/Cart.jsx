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

        if (!shippingAddress) {
            alert("Shipping address missing");
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
                // 1️⃣ Place order in backend
                const order = await placeOrder(
                    userId,
                    item.productId,
                    item.quantity,
                    shippingAddress
                );

                // 2️⃣ Pay for the order
                await payForOrder(order.orderID);
            }

            // 3️⃣ Refresh wallet balance
            const updatedBalance = await getWalletBalance(userId);
            setWalletBalance(updatedBalance);

            // 4️⃣ Clear frontend cart
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
        <div style={{ padding: 20 }}>
            <h2>Shopping Cart</h2>

            {cart.length === 0 && (
                <p>Your cart is empty.</p>
            )}

            {cart.map(item => (
                <div
                    key={item.productId}
                    style={{
                        border: "1px solid #ccc",
                        padding: 10,
                        marginBottom: 10
                    }}
                >
                    <p><strong>{item.name}</strong></p>
                    <p>Price: RM {item.price}</p>

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
                        style={{ marginLeft: 10 }}
                        onClick={() => {
                            removeFromCart(item.productId);
                            refreshCart();
                        }}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <div style={{ marginTop: 20 }}>
                <h4>Shipping Address</h4>
                <p>{shippingAddress}</p>
            </div>

            <div style={{ marginTop: 10 }}>
                <p>
                    <strong>Wallet Balance:</strong> RM {walletBalance}
                </p>
            </div>

            <div style={{ marginTop: 20 }}>
                <button
                    disabled={processing}
                    onClick={handleCheckout}
                >
                    {processing ? "Processing..." : "Place Order & Pay"}
                </button>

                <button
                    style={{ marginLeft: 10 }}
                    onClick={() => navigate("/customer")}
                >
                    Home
                </button>
            </div>
        </div>
    );
}
