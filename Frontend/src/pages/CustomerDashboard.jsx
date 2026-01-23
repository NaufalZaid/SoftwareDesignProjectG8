import { useEffect, useState } from "react";
import { addToCart, getCart } from "../services/cart";
import { useNavigate } from "react-router-dom";
import {
    getAllProducts,
    getMyOrders,
    getWalletBalance,
    topUpWallet,
    payForOrder,
    getProductsByCategory,
    getNotificationsByUserId
} from "../services/api";

import "../styles/Customer.css";

export default function CustomerDashboard() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    /* ================== STATE ================== */
    const [notifications, setNotifications] = useState([]);
    const [selectedTab, setSelectedTab] = useState("products");

    const [keyword, setKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState("");

    /* ================== AUTH CHECK ================== */
    useEffect(() => {
        if (!userId) {
            navigate("/");
        }
    }, [userId, navigate]);

    /* ================== INITIAL LOAD ================== */
    useEffect(() => {
        if (!userId) return;

        loadAllProducts();
        loadOrders();
        loadNotifications();
        getWalletBalance(userId).then(setWalletBalance);
        setCartCount(getCart().length);
    }, [userId]);

    async function loadNotifications() {
        try {
            const data = await getNotificationsByUserId(userId);
            setNotifications(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadOrders() {
        const data = await getMyOrders(userId);
        setOrders(data);
    }

    async function loadAllProducts() {
        const productsFromApi = await getAllProducts();




        setAllProducts(productsFromApi);
        setProducts(productsFromApi);
    }

    /* ================== SEARCH ================== */
    useEffect(() => {
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.brand?.toLowerCase().includes(keyword.toLowerCase()) ||
            p.sku.toLowerCase().includes(keyword.toLowerCase())
        );
        setProducts(filtered);
    }, [keyword, allProducts]);

    /* ================== FILTER ================== */
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

    /* ================== CART ================== */
    function handleAddToCart(product) {
        addToCart(product);
        setCartCount(getCart().length);
    }

    /* ================== WALLET ================== */
    async function handleTopUp() {
        if (!topUpAmount || Number(topUpAmount) <= 0) {
            alert("Top-up amount must be greater than 0");
            return;
        }

        await topUpWallet(userId, Number(topUpAmount));
        setWalletBalance(await getWalletBalance(userId));
        setTopUpAmount("");
    }

    function handleLogout() {
        localStorage.removeItem("userId");
        navigate("/");
    }

    const tabClass = tab =>
        selectedTab === tab ? "tab-btn active" : "tab-btn";

    /* ================== RENDER ================== */
    return (
        <div className="dashboard-bg">
            <div className="dashboard-wrapper">
                <h1>Customer Dashboard</h1>

                <div className="top-bar">
                    <div>
                        <button className={tabClass("products")} onClick={() => setSelectedTab("products")}>Products</button>
                        <button className={tabClass("wallet")} onClick={() => setSelectedTab("wallet")}>Wallet</button>
                        <button className={tabClass("orders")} onClick={() => setSelectedTab("orders")}>Orders</button>
                        <button className={tabClass("notifications")} onClick={() => setSelectedTab("notifications")}>
                            Notifications {notifications.length > 0 && `(${notifications.length})`}
                        </button>
                    </div>

                    <div>
                        <button onClick={() => navigate("/customer/cart")}>
                            Cart ({cartCount})
                        </button>
                        <button onClick={handleLogout}>Logout</button>
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
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Enter category"
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                            />

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
                            style={{ width: "95%" }}
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Top-up amount"
                        />
                        <button onClick={handleTopUp}>Top Up</button>
                    </div>
                )}

                {selectedTab === "notifications" && (
                    <div className="notifications-panel">
                        <h2>Notifications</h2>

                        {notifications.length === 0 ? (
                            <p>No notifications.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.notificationID} className="notification-card">
                                    <strong>{n.title}</strong>
                                    <p>{n.message}</p>
                                    <small>{n.createdAt}</small>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
