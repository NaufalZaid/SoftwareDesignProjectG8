import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="auth-page pasar-bg">
            <div className="auth-card pasar-card">
                <h1 className="pasar-logo">PASAR</h1>
                <p className="pasar-tagline">
                    A modern e-commerce platform connecting buyers and sellers
                </p>

                <div className="auth-form">
                    <button
                        className="auth-button primary"
                        onClick={() => navigate("/register/customer")}
                    >
                        Register as Buyer
                    </button>

                    <button
                        className="auth-button secondary"
                        onClick={() => navigate("/register/seller")}
                    >
                        Become a Seller
                    </button>

                    <button
                        className="auth-button ghost"
                        onClick={() => navigate("/login")}
                    >
                        Login to Your Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
