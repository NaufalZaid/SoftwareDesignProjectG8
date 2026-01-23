import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";

function RegisterCustomer() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        shippingAddress: "",
        phoneNumber: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const { confirmPassword, ...payload } = form;

        try {
            const response = await fetch("/api/v1/auth/register/customer", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error(await response.text());

            alert("Customer registered successfully");
            navigate("/");
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
                        Create your customer account
                    </p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <input
                            className="auth-input"
                            name="name"
                            placeholder="Full Name"
                            onChange={handleChange}
                            required
                        />

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
                            name="shippingAddress"
                            placeholder="Shipping Address"
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="auth-input"
                            name="phoneNumber"
                            placeholder="Phone Number"
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="auth-input"
                            name="password"
                            type="password"
                            placeholder="Password (min 8 characters)"
                            minLength={8}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="auth-input"
                            name="confirmPassword"
                            type="password"
                            placeholder="Confirm Password"
                            minLength={8}
                            onChange={handleChange}
                            required
                        />

                        <button className="auth-button primary" type="submit">
                            Create Account
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterCustomer;
