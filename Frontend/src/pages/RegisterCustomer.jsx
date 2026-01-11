import { useState } from "react";
import { registerCustomer } from "../services/authService";
import "../styles/AuthForm.css";

function RegisterCustomer() {
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

        try {
            const { confirmPassword, ...payload } = form;
            const message = await registerCustomer(payload);
            alert(message);
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
