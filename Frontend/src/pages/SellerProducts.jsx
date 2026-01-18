import { useEffect, useState } from "react";
import {
    getSellerProducts,
    createProduct,
    updateProduct,
    deleteProduct
} from "../services/productService";

export default function SellerProducts() {
    const sellerId = localStorage.getItem("userId");

    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        name: "",
        brand: "",
        price: "",
        status: "AVAILABLE"
    });

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        const data = await getSellerProducts(sellerId);
        setProducts(data);
    }

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const payload = {
            ...form,
            price: Number(form.price),
            sellerId
        };

        try {
            if (editingId) {
                await updateProduct(editingId, payload);
            } else {
                await createProduct(payload);
            }

            resetForm();
            loadProducts();
        } catch (err) {
            alert(err.message);
        }
    }

    function editProduct(p) {
        setEditingId(p.id);
        setForm({
            name: p.name,
            brand: p.brand,
            price: p.price,
            status: p.status
        });
    }

    async function removeProduct(id) {
        if (!window.confirm("Delete this product?")) return;
        await deleteProduct(id);
        loadProducts();
    }

    function resetForm() {
        setEditingId(null);
        setForm({
            name: "",
            brand: "",
            price: "",
            status: "AVAILABLE"
        });
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Manage Product Listings</h2>

            {/* Product Form */}
            <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
                <input
                    name="name"
                    placeholder="Product Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="brand"
                    placeholder="Brand"
                    value={form.brand}
                    onChange={handleChange}
                />
                <input
                    name="price"
                    type="number"
                    placeholder="Price"
                    value={form.price}
                    onChange={handleChange}
                    required
                />

                <select name="status" value={form.status} onChange={handleChange}>
                    <option value="AVAILABLE">Available</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="DISCONTINUED">Discontinued</option>
                </select>

                <button type="submit">
                    {editingId ? "Update Product" : "Add Product"}
                </button>

                {editingId && (
                    <button type="button" onClick={resetForm}>
                        Cancel
                    </button>
                )}
            </form>

            {/* Product List */}
            {products.map(p => (
                <div
                    key={p.id}
                    style={{
                        border: "1px solid #ccc",
                        padding: 10,
                        marginBottom: 10
                    }}
                >
                    <h4>{p.name}</h4>
                    <p>Brand: {p.brand}</p>
                    <p>RM {p.price}</p>
                    <p>Status: {p.status}</p>

                    <button onClick={() => editProduct(p)}>Edit</button>
                    <button onClick={() => removeProduct(p.id)}>
                        Delete
                    </button>
                </div>
            ))}
        </div>
    );
}
