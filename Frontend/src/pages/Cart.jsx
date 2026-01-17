import { useState, useEffect } from "react";
import { getCart, updateQuantity, removeFromCart } from "../services/cart";
import { useNavigate } from "react-router-dom";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        setCart(getCart());
    }, []);

    function refresh() {
        setCart(getCart());
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
            <h2>Shopping Cart</h2>

            {cart.map(item => (
                <div key={item.productId}>
                    <p>{item.name}</p>
                    <input
                        type="number"
                        value={item.quantity}
                        min="1"
                        onChange={e => {
                            updateQuantity(item.productId, Number(e.target.value));
                            refresh();
                        }}
                    />
                    <button onClick={() => {
                        removeFromCart(item.productId);
                        refresh();
                    }}>
                        Remove
                    </button>
                </div>
            ))}
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
