import { useEffect, useState } from "react";
import { addToCart, getCart } from "../services/cart";
import { useNavigate } from "react-router-dom";
import {
    getAllProducts,
    getMyOrders,
    getWalletBalance,
    topUpWallet,
    payForOrder,
    getProductsByCategory
} from "../services/api";

import "../styles/Customer.css";

export default function CustomerDashboard() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState("products");
    const [keyword, setKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState("");

    useEffect(() => {
        if (!userId) {
            alert("User not logged in");
            navigate("/");
        }
    }, [userId, navigate]);

    useEffect(() => {
        if (!userId) return;

        loadAllProducts();
        getMyOrders(userId).then(setOrders);
        getWalletBalance(userId).then(setWalletBalance);
        setCartCount(getCart().length);
    }, [userId]);

    async function loadAllProducts() {
        const data = await getAllProducts();
        setAllProducts(data);
        setProducts(data);
    }

    useEffect(() => {
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.brand?.toLowerCase().includes(keyword.toLowerCase()) ||
            p.sku.toLowerCase().includes(keyword.toLowerCase())
        );
        setProducts(filtered);
    }, [keyword, allProducts]);

    async function handleFilter() {
        if (!selectedCategory) return;
        const data = await getProductsByCategory(selectedCategory);
        setAllProducts(data);
        setProducts(data);
    }

    function handleResetFilter() {
        setSelectedCategory("");
        setKeyword("");
        loadAllProducts();
    }

    function handleAddToCart(product) {
        addToCart(product);
        setCartCount(getCart().length);
    }

    async function handleTopUp() {
        if (!topUpAmount || Number(topUpAmount) <= 0) {
            alert("Top-up amount must be greater than 0");
            return;
        }

        await topUpWallet(userId, Number(topUpAmount));
        setWalletBalance(await getWalletBalance(userId));
        setTopUpAmount("");
    }

    const tabClass = tab =>
        selectedTab === tab ? "tab-btn active" : "tab-btn";

    return (
        <div className="dashboard-bg">
            <div className="dashboard-wrapper">
                <h1>Customer Dashboard</h1>

                <div className="top-bar">
                    <div>
                        <button className={tabClass("products")} onClick={() => setSelectedTab("products")}>Products</button>
                        <button className={tabClass("wallet")} onClick={() => setSelectedTab("wallet")}>Wallet</button>
                        <button className={tabClass("orders")} onClick={() => setSelectedTab("orders")}>Orders</button>
                    </div>

                    <div>
                        <button onClick={() => navigate("/customer/cart")}>
                            Cart ({cartCount})
                        </button>
                        <button onClick={() => navigate("/")}>Logout</button>
                    </div>
                </div>

                {selectedTab === "products" && (
                    <>
                        <input
                            className="search-input"
                            placeholder="Search by name, brand, SKU..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                        />

                        <div className="filter-row">
                            <select
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                <option value="ELECTRONICS">Electronics</option>
                                <option value="FASHION">Fashion</option>
                                <option value="BOOKS">Books</option>
                                <option value="HOME">Home</option>
                            </select>

                            <button onClick={handleFilter}>Filter</button>
                            <button onClick={handleResetFilter}>Reset</button>
                        </div>

                        <div className="product-grid">
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    className="product-card"
                                    onClick={() => navigate(`/products/${p.id}`)}
                                >
                                    {p.images?.length > 0 && (
                                        <img
                                            src={`http://localhost:8080/product-images/${p.images[0].fileName}`}
                                            alt={p.name}
                                        />
                                    )}

                                    <h3>{p.name}</h3>
                                    <p className="price">RM {p.price}</p>

                                    <button
                                        disabled={p.status !== "AVAILABLE"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(p);
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {selectedTab === "orders" && orders.map(o => (
                    <div key={o.orderID} className="order-card">
                        <strong>{o.product.name}</strong>
                        <p>Qty: {o.quantity}</p>
                        <p>Payment: {o.paymentStatus}</p>
                        <p>Shipment: {o.shipmentStatus}</p>

                        {o.paymentStatus === "UNPAID" && (
                            <button onClick={() => payForOrder(o.orderID)}>
                                Pay Now
                            </button>
                        )}
                    </div>
                ))}

                {selectedTab === "wallet" && (
                    <div className="wallet-card">
                        <h2>Wallet</h2>
                        <p>Balance: <strong className="price">RM {walletBalance}</strong></p>

                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Top-up amount"
                        />
                        <button onClick={handleTopUp}>Top Up</button>
                    </div>
                )}
            </div>
        </div>
    );
}
