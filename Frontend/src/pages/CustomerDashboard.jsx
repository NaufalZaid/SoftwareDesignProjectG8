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

/* ================== STORAGE KEYS ================== */
const STATUS_KEY = "productStatusMap";
const NOTIF_KEY = "customerNotifications";
const PRODUCT_BASELINE_KEY = "productBaselineReady";
const SHIPMENT_BASELINE_KEY = "shipmentBaselineReady";

const SHIPMENT_STATUS_KEY = "shipmentStatusMap";


function ensureBaseline(baselineKey, statusKey, currentMap) {
    const hasBaseline = localStorage.getItem(baselineKey) === "true";

    if (!hasBaseline) {
        localStorage.setItem(statusKey, JSON.stringify(currentMap));
        localStorage.setItem(baselineKey, "true");
        return false;
    }

    return true;
}

function createNotification({ id, title, message }) {
    return {
        id,
        title,
        message,
        timestamp: new Date().toLocaleString()
    };
}



export default function CustomerDashboard() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();
    async function trackShipmentStatus() {
        const ordersFromApi = await getMyOrders(userId);

        const storedShipmentMap =
            JSON.parse(localStorage.getItem(SHIPMENT_STATUS_KEY)) || {};


        const newShipmentMap = {};
        const newNotifications = [];

        ordersFromApi.forEach(o => {
            newShipmentMap[o.orderID] = o.shipmentStatus;

            const oldStatus = storedShipmentMap[o.orderID];
            if (oldStatus && oldStatus !== o.shipmentStatus) {
                newNotifications.push(
                    createNotification({
                        id: `ship-${o.orderID}-${Date.now()}`,
                        title: `Order #${o.orderID} — ${o.product?.name ?? "Unknown Product"}`,
                        message: `Shipment status changed: ${oldStatus} → ${o.shipmentStatus}`
                    })
                );
            }
        });

        const baselineReady = ensureBaseline(
            SHIPMENT_BASELINE_KEY,
            SHIPMENT_STATUS_KEY,
            newShipmentMap
        );




        if (baselineReady && newNotifications.length > 0) {
            setNotifications(prev => {
                const merged = [...newNotifications, ...prev];
                localStorage.setItem(NOTIF_KEY, JSON.stringify(merged));
                return merged;
            });
        }
        localStorage.setItem(
            SHIPMENT_STATUS_KEY,
            JSON.stringify(newShipmentMap)
        );

        setOrders(ordersFromApi);
    }


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
            alert("User not logged in");
            navigate("/");
        }
    }, [userId, navigate]);

    /* ================== LOAD SAVED NOTIFICATIONS ================== */
    /* ================== LOAD SAVED NOTIFICATIONS ================== */
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
        setNotifications(stored);
    }, []);


    /* ================== INITIAL LOAD ================== */
    useEffect(() => {
        if (!userId) return;
        loadAllProducts();
        trackShipmentStatus();
        getWalletBalance(userId).then(setWalletBalance);
        setCartCount(getCart().length);
    }, [userId]);

    /* ================== PRODUCT STATUS TRACKING ================== */
    async function loadAllProducts() {
        const productsFromApi = await getAllProducts();

        const storedStatus =
            JSON.parse(localStorage.getItem(STATUS_KEY)) || {};



        const newStatusMap = {};
        const newNotifications = [];

        productsFromApi.forEach(p => {
            newStatusMap[p.id] = p.status;
        });

        const baselineReady = ensureBaseline(
            PRODUCT_BASELINE_KEY,
            STATUS_KEY,
            newStatusMap
        );

        productsFromApi.forEach(p => {


            const oldStatus = storedStatus[p.id];

            if (baselineReady && oldStatus && oldStatus !== p.status) {

                newNotifications.push({
                    id: `${p.id}-${Date.now()}`,
                    productId: p.id,
                    productName: p.name,
                    oldStatus,
                    newStatus: p.status,
                    timestamp: new Date().toLocaleString()
                });
            }
        });

        if (newNotifications.length > 0) {
            setNotifications(prev => {
                const merged = [...newNotifications, ...prev];
                localStorage.setItem(NOTIF_KEY, JSON.stringify(merged));
                return merged;
            });
        }

        localStorage.setItem(STATUS_KEY, JSON.stringify(newStatusMap));

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

    /* ================== NOTIFICATIONS ================== */
    function clearNotifications() {
        setNotifications([]);
        localStorage.removeItem(NOTIF_KEY);
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
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Enter category (e.g. electronics)"
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

                {selectedTab === "orders" &&
                    orders.map(o => (
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
                    ))
                }

                {selectedTab === "wallet" && (
                    <div className="wallet-card">
                        <h2>Wallet</h2>
                        <p>
                            Balance: <strong className="price">RM {walletBalance}</strong>
                        </p>

                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Top-up amount"
                        />
                        <button onClick={handleTopUp}>Top Up</button>
                    </div>
                )}

                {selectedTab === "notifications" && (
                    <div className="notifications-panel">
                        <h2>Product Status Updates</h2>

                        {notifications.length === 0 ? (
                            <p>No notifications yet.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="notification-card">
                                    <strong>{n.title ?? n.productName}</strong>
                                    <p>{n.message ?? `Status changed: ${n.oldStatus} → ${n.newStatus}`}</p>

                                    <small>{n.timestamp}</small>
                                </div>
                            ))
                        )}

                        {notifications.length > 0 && (
                            <button className="clear-btn" onClick={clearNotifications}>
                                Clear All
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
