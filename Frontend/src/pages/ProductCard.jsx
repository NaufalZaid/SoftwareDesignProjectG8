import { addToCart } from "../services/cart";

export default function ProductCard({ product }) {
    return (
        <div>
            <h3>{product.name}</h3>
            <p>RM {product.price}</p>

            <button
                disabled={product.status !== "AVAILABLE"}
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </button>
        </div>
    );
}
