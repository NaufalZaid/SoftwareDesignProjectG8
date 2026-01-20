import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

import { deleteProduct } from "../services/api";

const IMAGE_BASE_URL = "http://localhost:8080/product-images/";

function ProductList() {
    const sellerId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    /* ================= ACCESS CONTROL ================= */
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    /* ================= LOAD PRODUCTS ================= */
    useEffect(() => {
        if (!sellerId) return;

        fetch(`/api/v1/products/seller/${sellerId}`)
            .then(res => {
                if (!res.ok) throw new Error();
                return res.json();
            })
            .then(data => setProducts(data || []))
            .catch(() => setError("Failed to load products"));
    }, [sellerId]);

    async function handleDelete(productId) {
        if (!window.confirm("Delete this product?")) return;

        try {
            await deleteProduct(sellerId, productId);
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (e) {
            alert(e.message || "Delete failed");
        }
    }

    /* ================= UI ================= */
    return (
        <div className="auth-page">
            <div className="auth-card" style={{ width: "90%" }}>
                <h2 className="auth-title">My Products</h2>

                {error && <p style={{ color: "red" }}>{error}</p>}

                {products.length === 0 && <p>No products found.</p>}

                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {products.map(product => (
                        <div
                            key={product.id}
                            style={{
                                border: "1px solid #ddd",
                                padding: "1rem",
                                margin: "1rem",
                                width: 320
                            }}
                        >
                            {product.images?.length > 0 && (
                                <img
                                    src={`${IMAGE_BASE_URL}${product.images[0].fileName}`}
                                    alt={product.name}
                                    style={{
                                        width: "100%",
                                        height: 160,
                                        objectFit: "cover",
                                        marginBottom: "0.5rem"
                                    }}
                                />
                            )}

                            <h3>{product.name}</h3>
                            <p><strong>SKU:</strong> {product.sku}</p>
                            <p><strong>Brand:</strong> {product.brand}</p>
                            <p>{product.description}</p>
                            <p><strong>Price:</strong> RM {product.price}</p>
                            <p><strong>Status:</strong> {product.status}</p>

                            <button
                                className="auth-button"
                                onClick={() =>
                                    navigate(`/seller/products/edit/${product.id}`)
                                }
                            >
                                Edit
                            </button>

                            <button
                                className="auth-button"
                                style={{
                                    marginLeft: "1rem",
                                    backgroundColor: "#b91c1c"
                                }}
                                onClick={() => handleDelete(product.id)}
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    className="auth-button"
                    style={{ marginTop: "1rem" }}
                    onClick={() => navigate("/seller/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default ProductList;
