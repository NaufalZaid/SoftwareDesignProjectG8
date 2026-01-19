import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function AddProduct() {
    const navigate = useNavigate();

    const sellerId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    // 🔐 Access control
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: "",
        sku: "",
        status: "AVAILABLE"
    });

    const [images, setImages] = useState([]);

    const handleChange = (e) => {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = (e) => {
        setImages(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //  Exact Product entity match (NO seller, NO images)
        const productPayload = {
            name: product.name,
            description: product.description,
            price: Number(product.price),
            sku: product.sku,
            status: product.status
        };

        const formData = new FormData();

        //  REQUIRED: product must be JSON Blob
        formData.append(
            "product",
            new Blob([JSON.stringify(productPayload)], {
                type: "application/json"
            })
        );

        //  Append images correctly
        for (let i = 0; i < images.length; i++) {
            formData.append("images", images[i]);
        }

        try {
            const response = await fetch(
                `/api/v1/seller/${sellerId}/addProduct`,
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert("Product added successfully");
            navigate("/seller/products");

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Add Product</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        className="auth-input"
                        name="name"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        className="auth-input"
                        name="description"
                        placeholder="Product Description"
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

                    <input
                        className="auth-input"
                        name="sku"
                        placeholder="SKU"
                        value={product.sku}
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
