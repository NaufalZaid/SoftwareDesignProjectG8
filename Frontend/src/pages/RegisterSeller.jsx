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
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.type !== "application/pdf") {
            alert("Approval letter must be a PDF file only.");
            e.target.value = null;
            return;
        }

        setFile(selectedFile);
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
        if (file) formData.append("complianceDocs", file);

        try {
            const response = await fetch("/api/v1/auth/register/seller", {
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error(await response.text());

            alert(await response.text());
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
                        Seller onboarding & compliance verification
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
                            name="storeName"
                            placeholder="Store Name"
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

                        <div className="file-box">
                            <label>Compliance Document (PDF only)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                required
                            />
                        </div>

                        <button className="auth-button primary" type="submit">
                            Submit Seller Application
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default RegisterSeller;
