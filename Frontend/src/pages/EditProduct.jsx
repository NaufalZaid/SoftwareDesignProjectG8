import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/AuthForm.css";

function EditProduct() {
    const { productId } = useParams();
    const sellerId = localStorage.getItem("userId");

    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: ""
    });

    useEffect(() => {
        fetch(`/api/v1/products/${productId}`)
            .then(res => res.json())
            .then(setProduct);
    }, [productId]);

    const handleChange = (e) => {
        setProduct({ ...product, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append(
            "product",
            new Blob([JSON.stringify(product)], { type: "application/json" })
        );

        await fetch(`/api/v1/seller/${sellerId}/products/${productId}`, {
            method: "PUT",
            body: formData
        });

        alert("Product updated");
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Edit Product</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input name="name" value={product.name} onChange={handleChange} />
                    <textarea name="description" value={product.description} onChange={handleChange} />
                    <input name="price" type="number" value={product.price} onChange={handleChange} />

                    <button className="auth-button">Save Changes</button>
                </form>
            </div>
        </div>
    );
}

export default EditProduct;
