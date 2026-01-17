import { getCart, clearCart } from "../services/cart";
import { placeOrder } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Checkout() {
    const customerId = localStorage.getItem("userId");
    const cart = getCart();
    const navigate = useNavigate();
    const [address, setAddress] = useState("");

    async function submit() {
        try {
            for (const item of cart) {
                await placeOrder(
                    customerId,
                    item.productId,
                    item.quantity,
                    address
                );
            }

            clearCart();
            navigate("/customer/orders");
        } catch {
            alert("Checkout failed");
        }
    }
    function handleCheckout() {
        if (cart.length === 0) {
            alert("No items added to cart");
            return;
        }

        navigate("/customer/checkout");
    }

    return (
        <div>
            <h2>Checkout</h2>

            <textarea
                placeholder="Shipping address"
                value={address}
                onChange={e => setAddress(e.target.value)}
            />

            <div>
                <button onClick={handleCheckout}>
                    Proceed to Checkout
                </button>
            </div>
            <button onClick={() => navigate("/customer")}>
                Home
            </button>
        </div>
    );
}
