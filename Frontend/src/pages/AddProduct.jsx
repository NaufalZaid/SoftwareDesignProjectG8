import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function AddProduct() {
    const navigate = useNavigate();

    const sellerId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    /* ================= ACCESS CONTROL ================= */
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    const [product, setProduct] = useState({
        sku: "",
        name: "",
        brand: "",
        description: "",
        price: "",
        status: "AVAILABLE"
    });

    const [images, setImages] = useState([]);

    /* ================= HANDLERS ================= */
    function handleChange(e) {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    }

    function handleImageChange(e) {
        setImages(Array.from(e.target.files));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (Number(product.price) <= 0) {
            alert("Price must be greater than 0");
            return;
        }

        const productPayload = {
            sku: product.sku,
            name: product.name,
            brand: product.brand,
            description: product.description,
            price: Number(product.price),
            status: product.status
        };

        const formData = new FormData();

        // REQUIRED: product JSON
        formData.append(
            "product",
            new Blob([JSON.stringify(productPayload)], {
                type: "application/json"
            })
        );

        // REQUIRED: files (not images)
        images.forEach(file => {
            formData.append("files", file);
        });

        try {
            const res = await fetch(
                `/api/v1/seller/${sellerId}/addProduct`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!res.ok) {
                throw new Error(await res.text());
            }

            alert("Product added successfully");
            navigate("/seller/products");

        } catch (err) {
            alert(err.message);
        }
    }

    /* ================= UI ================= */
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Add Product</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        name="sku"
                        placeholder="SKU"
                        value={product.sku}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="auth-input"
                        name="name"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="auth-input"
                        name="brand"
                        placeholder="Brand"
                        value={product.brand}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        className="auth-input"
                        name="description"
                        placeholder="Description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="auth-input"
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />

                    <select
                        className="auth-input"
                        name="status"
                        value={product.status}
                        onChange={handleChange}
                    >
                        <option value="AVAILABLE">Available</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                        <option value="DISCONTINUED">Discontinued</option>
                    </select>

                    <input
                        className="auth-input"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    <button className="auth-button" type="submit">
                        Add Product
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AddProduct;
