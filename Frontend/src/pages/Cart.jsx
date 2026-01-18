import { useState, useEffect } from "react";
import { getCart, updateQuantity, removeFromCart, clearCart } from "../services/cart";
import { getCustomer, placeOrder } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const [customer, setCustomer] = useState(null);
    const navigate = useNavigate();
    const customerId = localStorage.getItem("userId");

    // Load cart + customer once
    useEffect(() => {
        setCart(getCart());

        getCustomer(customerId)
            .then(setCustomer)
            .catch(() => alert("Failed to load customer details"));
    }, []);

    function refresh() {
        setCart(getCart());
    }

    async function handleCheckout() {
        if (cart.length === 0) {
            alert("No items added to cart");
            return;
        }

        if (!customer?.shippingAddress) {
            alert("No shipping address found for this customer");
            return;
        }

        try {
            // One order per cart item (matches backend design)
            for (const item of cart) {
                await placeOrder(
                    customerId,
                    item.productId,
                    item.quantity,
                    customer.shippingAddress
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
                    style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
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

            {/* Shipping Address (Read-only) */}
            {customer?.shippingAddress && (
                <div style={{ marginTop: 20 }}>
                    <h4>Shipping Address</h4>
                    <p>{customer.shippingAddress}</p>
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
