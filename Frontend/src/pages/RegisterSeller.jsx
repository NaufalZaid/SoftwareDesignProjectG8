import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthForm.css";


function RegisterSeller() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        storeName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const formData = new FormData();

        formData.append("name", form.name);
        formData.append("storeName", form.storeName);
        formData.append("email", form.email);
        formData.append("password", form.password);

        if (file) {
            formData.append("complianceDocs", file);
        }

        try {
            const response = await fetch(
                "/api/v1/auth/register/seller",
                {
                    method: "POST",
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const message = await response.text();
            alert(message);
            navigate("/");
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Seller Registration</h2>

                <form className="auth-form" onSubmit={handleSubmit}>

                    {/*NEW FIELD */}
                    <input
                        className="auth-input"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                    />

                    <input
                        className="auth-input"
                        name="storeName"
                        placeholder="Store Name"
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

                    <input
                        className="auth-input"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                    />

                    <button className="auth-button" type="submit">
                        Register Seller
                    </button>
                </form>
            </div>
        </div>
    );
}

export default RegisterSeller;
