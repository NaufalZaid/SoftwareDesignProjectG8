import { useEffect, useState } from "react";
import { addToCart, getCart } from "../services/cart";
import { useNavigate } from "react-router-dom";
import {
    getAllProducts,
    getMyOrders,
    getWalletBalance,
    topUpWallet,
    payForOrder
} from "../services/api";

export default function CustomerDashboard() {
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState("products");
    const [keyword, setKeyword] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState("");

    /* ================= USER GUARD ================= */
    useEffect(() => {
        if (!userId) {
            alert("User not logged in");
            navigate("/");
        }
    }, [userId, navigate]);

    /* ================= LOAD DATA ================= */
    useEffect(() => {
        if (!userId) return;

        getAllProducts().then(data => {
            setAllProducts(data);
            setProducts(data);
        });

        getMyOrders(userId).then(setOrders);
        getWalletBalance(userId).then(setWalletBalance);
        setCartCount(getCart().length);
    }, [userId]);

    /* ================= SEARCH ================= */
    useEffect(() => {
        const filtered = allProducts.filter(p =>
            p.name.toLowerCase().includes(keyword.toLowerCase()) ||
            p.brand?.toLowerCase().includes(keyword.toLowerCase()) ||
            p.sku.toLowerCase().includes(keyword.toLowerCase())
        );
        setProducts(filtered);
    }, [keyword, allProducts]);

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

    /* ================= THEME ================= */
    const bg = "#0b1220";
    const panel = "#111827";
    const card = "#1f2937";
    const border = "#334155";
    const accent = "#22c55e";
    const text = "#e5e7eb";

    const tabBtn = tab => ({
        padding: "10px 18px",
        marginRight: 10,
        background: selectedTab === tab ? accent : card,
        color: selectedTab === tab ? "#022c22" : text,
        border: `1px solid ${border}`,
        cursor: "pointer",
        borderRadius: 6
    });

    /* ================= UI ================= */
    return (
        <div style={{ minHeight: "100vh", background: bg }}>

            {/* CENTERED CONTENT WRAPPER */}
            <div style={{
                maxWidth: 1400,
                margin: "0 auto",
                padding: 24,
                color: text
            }}>

                <h1 style={{ marginBottom: 20 }}>Customer Dashboard</h1>

                {/* TOP BAR */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24
                }}>
                    <div>
                        <button style={tabBtn("products")} onClick={() => setSelectedTab("products")}>Products</button>
                        <button style={tabBtn("wallet")} onClick={() => setSelectedTab("wallet")}>Wallet</button>
                        <button style={tabBtn("orders")} onClick={() => setSelectedTab("orders")}>Orders</button>
                    </div>

                    <div>
                        <button onClick={() => navigate("/customer/cart")} style={{ marginRight: 10 }}>
                            Cart ({cartCount})
                        </button>
                        <button onClick={() => navigate("/")}>Logout</button>
                    </div>
                </div>

                {/* ================= PRODUCTS ================= */}
                {selectedTab === "products" && (
                    <>
                        <input
                            placeholder="Search by name, brand, SKU..."
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: 12,
                                marginBottom: 24,
                                background: panel,
                                color: text,
                                border: `1px solid ${border}`,
                                borderRadius: 6
                            }}
                        />

                        {/* ✅ FULL-WIDTH RESPONSIVE GRID */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                            gap: 24
                        }}>
                            {products.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => navigate(`/products/${p.id}`)}
                                    style={{
                                        background: card,
                                        border: `1px solid ${border}`,
                                        padding: 16,
                                        borderRadius: 8,
                                        cursor: "pointer"
                                    }}
                                >

                                    {p.images?.length > 0 && (
                                        <img
                                            src={`http://localhost:8080/product-images/${p.images[0].fileName}`}
                                            alt={p.name}
                                            style={{
                                                width: "100%",
                                                height: 160,
                                                objectFit: "cover",
                                                borderRadius: 6,
                                                marginBottom: 12
                                            }}
                                        />
                                    )}

                                    <h3>{p.name}</h3>
                                    <p style={{ color: accent, fontWeight: "bold" }}>
                                        RM {p.price}
                                    </p>

                                    <button
                                        disabled={p.status !== "AVAILABLE"}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToCart(p);
                                        }}
                                        style={{ width: "100%", marginTop: 10 }}
                                    >
                                        Add to Cart
                                    </button>

                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ================= ORDERS ================= */}
                {selectedTab === "orders" && orders.map(o => (
                    <div key={o.orderID} style={{
                        background: card,
                        padding: 16,
                        border: `1px solid ${border}`,
                        marginBottom: 12
                    }}>
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

                {/* ================= WALLET ================= */}
                {selectedTab === "wallet" && (
                    <div style={{
                        maxWidth: 400,
                        background: card,
                        padding: 20,
                        border: `1px solid ${border}`
                    }}>
                        <h2>Wallet</h2>
                        <p>Balance: <strong style={{ color: accent }}>RM {walletBalance}</strong></p>

                        <input
                            type="number"
                            value={topUpAmount}
                            onChange={e => setTopUpAmount(e.target.value)}
                            placeholder="Top-up amount"
                            style={{
                                width: "100%",
                                padding: 10,
                                marginBottom: 10,
                                background: panel,
                                color: text,
                                border: `1px solid ${border}`
                            }}
                        />
                        <button onClick={handleTopUp} style={{ width: "100%" }}>
                            Top Up
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}
