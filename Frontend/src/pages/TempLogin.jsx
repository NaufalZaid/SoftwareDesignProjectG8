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
            // backend returns: userID, email, user_role

            const role = user.user_role?.trim().toUpperCase();

            //  Store session data
            localStorage.setItem("userId", user.userID);
            localStorage.setItem("role", role);

            alert("Login successful");

            //  Role-based redirect
            if (role === "CUSTOMER") {
                navigate("/customer");
            }
            else if (role === "SELLER") {
                navigate("/");
            }
            else if (role === "ADMIN") {
                navigate("/");
            }
            else {
                navigate("/");
            }

        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Login</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
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
                        placeholder="Password"
                        onChange={handleChange}
                        required
                    />

                    <button className="auth-button" type="submit">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
