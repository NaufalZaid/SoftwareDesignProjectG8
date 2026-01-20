import { addToCart } from "../services/cart";

const IMAGE_BASE_URL = "http://localhost:8080/product-images/";

export default function ProductCard({ product }) {
    const image =
        product.images?.length > 0 && product.images[0].fileName
            ? `${IMAGE_BASE_URL}${product.images[0].fileName}`
            : null;

    return (
        <div
            style={{
                border: "1px solid #ccc",
                padding: 12,
                width: 260
            }}
        >
            {/* IMAGE */}
            {image && (
                <img
                    src={image}
                    alt={product.name}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                    style={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        marginBottom: 8
                    }}
                />
            )}

            {/* INFO */}
            <h3>{product.name}</h3>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Price:</strong> RM {product.price}</p>
            <p><strong>Status:</strong> {product.status}</p>

            <button
                disabled={product.status !== "AVAILABLE"}
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </button>
        </div>
    );
}
