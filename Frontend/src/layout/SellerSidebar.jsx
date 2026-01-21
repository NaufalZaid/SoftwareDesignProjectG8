import { NavLink, useNavigate } from "react-router-dom";
import "../layout/SellerLayout.css";

export default function SellerSidebar() {
    const navigate = useNavigate();

    return (
        <aside className="seller-sidebar">
            <div className="sidebar-header">
                <h2>Pasar</h2>
                <span className="subtitle">Marketplace</span>
            </div>

            <nav className="sidebar-nav">
                <NavLink
                    to="/seller"
                    end
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/seller/profile"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Profile
                </NavLink>

                <NavLink
                    to="/seller/products"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    My Products
                </NavLink>

                <NavLink
                    to="/seller/add-product"
                    className={({ isActive }) =>
                        isActive ? "nav-link active" : "nav-link"
                    }
                >
                    Add Product
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="logout-btn"
                    onClick={() => {
                        localStorage.clear();
                        navigate("/");
                    }}
                >
                    Logout
                </button>
            </div>
        </aside>
    );
}
