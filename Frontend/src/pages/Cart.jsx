import { useState, useEffect } from "react";
import {
    getCart,
    updateQuantity,
    removeFromCart,
    clearCart
} from "../services/cart";
import {
    placeOrder,
    getCustomerProfile
} from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [profile, setProfile] = useState(null);

    const navigate = useNavigate();
    const customerId = localStorage.getItem("userId");

    // Load cart + customer profile once
    useEffect(() => {
        setCart(getCart());

        getCustomerProfile(customerId)
            .then(setProfile)
            .catch(() => alert("Failed to load customer profile"));
    }, []);

    function refresh() {
        setCart(getCart());
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            alert("No items added to cart");
            return;
        }

        if (!profile?.shippingAddress) {
            alert("No shipping address found for this customer");
            return;
        }

        try {
            // Backend model: one order per product
            for (const item of cart) {
                await placeOrder(
                    customerId,
                    item.productId,
                    item.quantity,
                    profile.shippingAddress
                );
            }

            clearCart();
            alert("Order placed successfully");
            navigate("/customer");
        } catch (error) {
            alert("Checkout failed");
        }
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

            {/* Shipping Address from DB */}
            {profile && (
                <div style={{ marginTop: 20 }}>
                    <h4>Shipping Address</h4>
                    <p>{profile.shippingAddress}</p>
                </div>
            )}

            {/* Actions */}
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
