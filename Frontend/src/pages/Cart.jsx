import { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState("");
    const [walletBalance, setWalletBalance] = useState(0);
    const [loading, setLoading] = useState(true);

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
                    throw new Error("No address");
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

    function refresh() {
        setCart(getCart());
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            alert("No items added to cart");
            return;
        }

        if (!shippingAddress) {
            alert("No shipping address found");
            return;
        }

        try {
            for (const item of cart) {
                // 1️⃣ Place order
                const order = await placeOrder(
                    userId,
                    item.productId,
                    item.quantity,
                    shippingAddress
                );

                // 2️⃣ Pay for order (THIS deducts wallet balance)
                await payForOrder(order.orderID);
            }

            // 3️⃣ Refresh wallet balance
            const updatedBalance = await getWalletBalance(userId);
            setWalletBalance(updatedBalance);

            clearCart();
            alert("Order placed and paid successfully");
            navigate("/customer");
        } catch (err) {
            console.error(err);
            alert("Checkout failed: " + err.message);
        }
    }

    if (loading) {
        return <p>Loading cart...</p>;
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Shopping Cart</h2>

            {cart.length === 0 && <p>Your cart is empty.</p>}

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
                        value={item.quantity}
                        min="1"
                        onChange={e => {
                            updateQuantity(item.productId, Number(e.target.value));
                            refresh();
                        }}
                    />

                    <button
                        style={{ marginLeft: 10 }}
                        onClick={() => {
                            removeFromCart(item.productId);
                            refresh();
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
                <p><strong>Wallet Balance:</strong> RM {walletBalance}</p>
            </div>

            <div style={{ marginTop: 20 }}>
                <button onClick={handleCheckout}>
                    Place Order & Pay
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
