import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerLayout from "../layout/SellerLayout";
import "../styles/SellerProducts.css";

export default function SellerProducts() {
    const sellerId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({});

    if (!sellerId) {
        return <p className="auth-warning">Please login as seller.</p>;
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        const res = await fetch(`/api/v1/products/seller/${sellerId}`);
        const data = await res.json();
        setProducts(data);
    }

    function startEdit(product) {
        setEditing(product.id);
        setForm(product);
    }

    function cancelEdit() {
        setEditing(null);
        setForm({});
    }

    async function saveEdit(productId) {
        const formData = new FormData();
        formData.append(
            "product",
            new Blob([JSON.stringify(form)], {
                type: "application/json"
            })
        );

        await fetch(
            `/api/v1/seller/${sellerId}/products/${productId}`,
            {
                method: "PUT",
                body: formData
            }
        );

        cancelEdit();
        fetchProducts();
    }

    async function deleteProduct(productId) {
        if (!window.confirm("Delete this product?")) return;

        await fetch(
            `/api/v1/seller/${sellerId}/products/${productId}`,
            { method: "DELETE" }
        );

        fetchProducts();
    }

    return (
        <SellerLayout>
        <div className="seller-products-page">
            <header className="products-header">
                <div>
                    <h1>My Products</h1>
                    <p>Manage your listed products</p>
                </div>

                <button
                    className="primary"
                    onClick={() => navigate("/seller/add-product")}
                >
                    Add Product
                </button>
            </header>

            {products.length === 0 && (
                <p className="muted">No products listed yet.</p>
            )}

            <div className="products-grid">
                {products.map(p => (
                    <div className="product-card" key={p.id}>
                        {editing === p.id ? (
                            <>
                                <div className="edit-group">
                                    <label>Name</label>
                                    <input
                                        value={form.name}
                                        onChange={e =>
                                            setForm({
                                                ...form,
                                                name: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="edit-grid">
                                    <div className="edit-group">
                                        <label>Price (RM)</label>
                                        <input
                                            value={form.price}
                                            type="number"
                                            onChange={e =>
                                                setForm({
                                                    ...form,
                                                    price: e.target.value
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="edit-group">
                                        <label>Stock</label>
                                        <input
                                            value={form.quantity}
                                            type="number"
                                            onChange={e =>
                                                setForm({
                                                    ...form,
                                                    quantity: e.target.value
                                                })
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="edit-group">
                                    <label>Description</label>
                                    <textarea
                                        rows="3"
                                        value={form.description || ""}
                                        onChange={e =>
                                            setForm({
                                                ...form,
                                                description: e.target.value
                                            })
                                        }
                                    />
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="primary"
                                        onClick={() => saveEdit(p.id)}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="secondary"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="card-top">
                                    <h3>{p.name}</h3>
                                    <span className={`status ${p.status}`}>
                                        {p.status}
                                    </span>
                                </div>

                                <p className="price">RM {p.price}</p>
                                <p className="stock">
                                    Stock: <strong>{p.quantity}</strong>
                                </p>

                                <div className="card-actions">
                                    <button
                                        className="secondary"
                                        onClick={() => startEdit(p)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="danger"
                                        onClick={() => deleteProduct(p.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
        </SellerLayout>
    );
}
