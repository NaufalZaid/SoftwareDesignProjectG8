import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function Home() {
    const navigate = useNavigate();

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Welcome</h2>

                <div className="auth-form">
                    <button
                        className="auth-button"
                        onClick={() => navigate("/register/customer")}
                    >
                        Register as Buyer
                    </button>

                    <button
                        className="auth-button"
                        onClick={() => navigate("/register/seller")}
                        style={{ marginTop: "1rem" }}
                    >
                        Register as Seller
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;
