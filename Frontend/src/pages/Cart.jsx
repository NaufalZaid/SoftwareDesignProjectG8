import { useState, useEffect } from "react";
import {
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart
} from "../services/cart";
import { getCustomerProfile, placeOrder } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    const [cart, setCart] = useState([]);
    const [shippingAddress, setShippingAddress] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            alert("User not logged in");
            navigate("/");
            return;
        }

        setCart(getCart());

        getCustomerProfile(userId)
            .then(profile => {
                if (!profile.shippingAddress) {
                    throw new Error("No address");
                }
                setShippingAddress(profile.shippingAddress);
            })
            .catch(err => {
                console.error(err);
                alert("Failed to load shipping address");
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
            alert("No shipping address found for this customer");
            return;
        }

        try {
            for (const item of cart) {
                await placeOrder(
                    userId,
                    item.productId,
                    item.quantity,
                    shippingAddress
                );
            }

            clearCart();
            alert("Order placed successfully");
            navigate("/customer");
        } catch (err) {
            alert("Checkout failed");
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

            <div style={{ marginTop: 20 }}>
                <button onClick={handleCheckout}>
                    Place Order
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
