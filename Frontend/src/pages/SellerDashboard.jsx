import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function SellerDashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    // 🔐 Access control
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Seller Dashboard</h2>

                <div className="auth-form">

                    {/* ADD PRODUCT */}
                    <button
                        className="auth-button"
                        onClick={() => navigate("/seller/add-product")}
                    >
                        Add Product
                    </button>

                    {/* VIEW / EDIT / DELETE PRODUCTS */}
                    <button
                        className="auth-button"
                        style={{ marginTop: "1rem" }}
                        onClick={() => navigate("/seller/products")}
                    >
                        Manage Products
                    </button>

                    {/* VIEW ORDERS */}
                    <button
                        className="auth-button"
                        style={{ marginTop: "1rem" }}
                        onClick={() => navigate("/seller/orders")}
                    >
                        View Orders
                    </button>

                    {/* BACK TO HOME */}
                    <button
                        className="auth-button"
                        style={{ marginTop: "2rem", backgroundColor: "#777" }}
                        onClick={() => navigate("/")}
                    >
                        Back to Home
                    </button>

                </div>
            </div>
        </div>
    );
}

export default SellerDashboard;
