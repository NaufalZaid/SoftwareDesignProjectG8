import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function EditProduct() {
    const { productId } = useParams();
    const sellerId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        sku: "",
        name: "",
        brand: "",
        description: "",
        price: "",
        status: "AVAILABLE"
    });

    const [images, setImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [loading, setLoading] = useState(true);

    /* ================= ACCESS CONTROL ================= */
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    /* ================= LOAD PRODUCT ================= */
    useEffect(() => {
        async function loadProduct() {
            try {
                const res = await fetch(`/api/v1/products/${productId}`);
                if (!res.ok) throw new Error("Failed to load product");

                const data = await res.json();

                setProduct({
                    sku: data.sku,
                    name: data.name,
                    brand: data.brand,
                    description: data.description,
                    price: data.price,
                    status: data.status
                });

                setImages(data.images || []);
            } catch (e) {
                alert("Failed to load product");
            } finally {
                setLoading(false);
            }
        }

        loadProduct();
    }, [productId]);

    /* ================= HANDLERS ================= */
    function handleChange(e) {
        setProduct({
            ...product,
            [e.target.name]: e.target.value
        });
    }

    function handleImageChange(e) {
        setNewImages(Array.from(e.target.files));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData();

        formData.append(
            "product",
            new Blob([JSON.stringify(product)], {
                type: "application/json"
            })
        );

        newImages.forEach(img =>
            formData.append("images", img)
        );

        try {
            const res = await fetch(
                `/api/v1/seller/${sellerId}/products/${productId}`,
                {
                    method: "PUT",
                    body: formData
                }
            );

            if (!res.ok) {
                throw new Error("Update failed");
            }

            alert("Product updated successfully");
            navigate("/seller/products");
        } catch (e) {
            alert(e.message);
        }
    }

    /* ================= UI ================= */
    if (loading) return <p>Loading...</p>;

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ width: "90%" }}>
                <h2 className="auth-title">Edit Product</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {/* SKU */}
                    <input
                        name="sku"
                        placeholder="SKU"
                        value={product.sku}
                        disabled
                    />

                    {/* NAME */}
                    <input
                        name="name"
                        placeholder="Product Name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />

                    {/* BRAND */}
                    <input
                        name="brand"
                        placeholder="Brand"
                        value={product.brand}
                        onChange={handleChange}
                        required
                    />

                    {/* DESCRIPTION */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />

                    {/* PRICE */}
                    <input
                        name="price"
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />

                    {/* STATUS */}
                    <select
                        name="status"
                        value={product.status}
                        onChange={handleChange}
                    >
                        <option value="AVAILABLE">AVAILABLE</option>
                        <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                        <option value="DISCONTINUED">DISCONTINUED</option>
                    </select>

                    {/* EXISTING IMAGES */}
                    {images.length > 0 && (
                        <div>
                            <p><strong>Current Images</strong></p>
                            <div style={{ display: "flex", gap: 10 }}>
                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img.url}
                                        alt="product"
                                        style={{
                                            width: 120,
                                            height: 80,
                                            objectFit: "cover"
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* NEW IMAGES */}
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                    />

                    <button className="auth-button">
                        Save Changes
                    </button>

                    <button
                        type="button"
                        className="auth-button"
                        style={{ marginTop: "1rem", backgroundColor: "#777" }}
                        onClick={() => navigate("/seller/products")}
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}

export default EditProduct;
