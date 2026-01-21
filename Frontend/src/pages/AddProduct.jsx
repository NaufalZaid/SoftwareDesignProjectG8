import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SellerLayout from "../layout/SellerLayout";
import "../styles/AddProduct.css";

export default function AddProduct() {
    const navigate = useNavigate();
    const sellerId = localStorage.getItem("userId");

    const [product, setProduct] = useState({
        name: "",
        brand: "",
        sku: "",
        price: "",
        quantity: "",
        description: ""
    });

    const [images, setImages] = useState([]);

    //if (!sellerId) {
    //    return <p className="auth-warning">Please login as seller.</p>;
    //}

    function handleChange(e) {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    }

    function handleImages(e) {
        setImages([...e.target.files]);
    }

    async function submit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append(
            "product",
            new Blob([JSON.stringify(product)], {
                type: "application/json"
            })
        );

        images.forEach(img => formData.append("images", img));

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
            navigate("/seller");
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <SellerLayout>
        <div className="add-product-page">
            <div className="add-product-card">
                <header className="form-header">
                    <h1>Add New Product</h1>
                    <p>
                        Provide accurate product details to list your item on
                        the platform.
                    </p>
                </header>

                <form onSubmit={submit} className="product-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input
                                name="name"
                                placeholder="e.g. Wireless Mouse"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Brand</label>
                            <input
                                name="brand"
                                placeholder="e.g. Logitech"
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label>SKU</label>
                            <input
                                name="sku"
                                placeholder="Unique product code"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Price (RM)</label>
                            <input
                                name="price"
                                type="number"
                                placeholder="0.00"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                name="quantity"
                                type="number"
                                placeholder="Available stock"
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group full">
                        <label>Description</label>
                        <textarea
                            name="description"
                            placeholder="Describe your product features, condition, and usage"
                            rows="4"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group full">
                        <label>Product Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImages}
                        />
                        <span className="hint">
                            You can upload multiple images
                        </span>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="primary">
                            Add Product
                        </button>
                        <button
                            type="button"
                            className="secondary"
                            onClick={() => navigate("/seller")}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
        </SellerLayout>
    );
}
