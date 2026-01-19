import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function ProductList() {
    const sellerId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    // 🔐 Access control
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await fetch(
                    `/api/v1/products/seller/${sellerId}`
                );

                if (!response.ok) {
                    throw new Error("Failed to load products");
                }

                //  Backend no longer sends binary imageData
                const data = await response.json();
                setProducts(data);

            } catch (err) {
                console.error(err);
                setError("Failed to load products");
            }
        };

        loadProducts();
    }, [sellerId]);

    const deleteProduct = async (productId) => {
        if (!window.confirm("Delete this product?")) return;

        try {
            const response = await fetch(
                `/api/v1/seller/${sellerId}/products/${productId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                throw new Error("Delete failed");
            }

            setProducts(prev =>
                prev.filter(p => p.id !== productId)
            );
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">My Products</h2>

                {error && <p style={{ color: "red" }}>{error}</p>}

                {products.length === 0 && (
                    <p>No products found.</p>
                )}

                {products.map(product => (
                    <div
                        key={product.id}
                        style={{
                            borderBottom: "1px solid #ddd",
                            paddingBottom: "1rem",
                            marginBottom: "1rem"
                        }}
                    >
                        <strong>{product.name}</strong>
                        <br />
                        Price: ${product.price}
                        <br />
                        Status: {product.status}

                        <div style={{ marginTop: "0.5rem" }}>
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
                                onClick={() => deleteProduct(product.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    className="auth-button"
                    onClick={() => navigate("/seller/dashboard")}
                >
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default ProductList;
