import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const user = await response.json();
            const role = user.user_role?.trim().toUpperCase();

            localStorage.setItem("userId", user.userID);
            localStorage.setItem("role", role);
            localStorage.setItem("email", user.email);

            alert("Login successful");

            if (role === "CUSTOMER") navigate("/customer");
            else if (role === "SELLER") navigate("/seller");
            else if (role === "ADMIN") navigate("/admin");
            else navigate("/");

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-bg">
            <div className="auth-wrapper">
                <div className="auth-card dashboard-card">
                    <h1 className="pasar-logo">PASAR</h1>
                    <p className="auth-subtitle">
                        Sign in to your account
                    </p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <input
                            className="auth-input"
                            name="email"
                            type="email"
                            placeholder="Email Address"
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="auth-input"
                            name="password"
                            type="password"
                            placeholder="Password"
                            onChange={handleChange}
                            required
                        />

                        <button className="auth-button primary" type="submit">
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;
