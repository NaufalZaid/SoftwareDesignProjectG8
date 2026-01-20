import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { addToCart } from "../services/cart";

export default function ProductDetails() {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProduct() {
            try {
                const res = await fetch(`/api/v1/products/${productId}`);
                if (!res.ok) throw new Error("Product not found");

                const data = await res.json();
                setProduct(data);
            } catch (e) {
                alert(e.message);
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [productId]);

    if (loading) return <p>Loading product...</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            <button onClick={() => navigate(-1)}>← Back</button>

            {/* IMAGE */}
            {product.images?.length > 0 && (
                <img
                    src={`http://localhost:8080/product-images/${product.images[0].fileName}`}
                    alt={product.name}
                    style={{
                        width: "100%",
                        maxHeight: 400,
                        objectFit: "cover",
                        marginTop: 20,
                        borderRadius: 8
                    }}
                />
            )}

            {/* INFO */}
            <h1 style={{ marginTop: 20 }}>{product.name}</h1>

            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Status:</strong> {product.status}</p>

            {product.seller && (
                <p>
                    <strong>Seller:</strong>{" "}
                    {product.seller.storeName ||
                        product.seller.name ||
                        product.seller.email}
                </p>
            )}

            <h2 style={{ marginTop: 20 }}>
                RM {product.price}
            </h2>

            <p style={{ marginTop: 10 }}>
                {product.description}
            </p>

            {/* ACTION */}
            <button
                disabled={product.status !== "AVAILABLE"}
                style={{ marginTop: 20, padding: "10px 20px" }}
                onClick={() => {
                    addToCart(product);
                    alert("Added to cart");
                }}
            >
                Add to Cart
            </button>
        </div>
    );
}
