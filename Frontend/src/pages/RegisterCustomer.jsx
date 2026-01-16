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

        // Frontend validation
        if (form.password.length < 8) {
            alert("Password must be at least 8 characters long");
            return;
        }

        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        // Remove confirmPassword before sending
        const { confirmPassword, ...payload } = form;

        try {
            const response = await fetch(
                "/api/v1/auth/register/customer",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            alert("Customer registered successfully");
            navigate("/");

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Customer Registration</h2>

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
                        placeholder="Email"
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
                        placeholder="Verify Password"
                        minLength={8}
                        onChange={handleChange}
                        required
                    />

                    <button className="auth-button" type="submit">
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterCustomer;
