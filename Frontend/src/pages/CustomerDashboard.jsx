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
    //get userid from localstorage
    const customerId = localStorage.getItem("userId");
    /*const role = localStorage.getItem("role");
    if (role !== "CUSTOMER") {
        return <p>Access denied. Sellers only.</p>;
    }*/// for now commented will set it when login is ready

    const navigate = useNavigate();

    const [selectedTab, setSelectedTab] = useState("products");

    const [keyword, setKeyword] = useState("");
    const [allProducts, setAllProducts] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cartCount, setCartCount] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [topUpAmount, setTopUpAmount] = useState("");

    // Load products, orders, cart ONCE
    useEffect(() => {
        getAllProducts().then(data => {
            setAllProducts(data);
            setProducts(data);
        });

        getMyOrders(customerId).then(setOrders);
        setCartCount(getCart().length);
        getWalletBalance(customerId).then(setWalletBalance);

    }, []);

    // Client-side search
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

    return (
        <div style={{ padding: 20 }}>
            <h1>Customer Dashboard</h1>

            {/* Top Actions */}
            <div style={{ marginBottom: 20 }}>
                <button onClick={() => navigate("/customer/cart")}>
                    Cart ({cartCount})
                </button>
                <button onClick={() => navigate("/")} style={{ marginLeft: 10 }}>
                    Logout
                </button>
            </div>

            {/* Tabs */}
            <div style={{ marginBottom: 20 }}>
                <button
                    onClick={() => setSelectedTab("products")}
                    disabled={selectedTab === "products"}
                >
                    Show Products
                </button>
                <button
                    onClick={() => setSelectedTab("wallet")}
                    disabled={selectedTab === "wallet"}
                    style={{ marginLeft: 10 }}
                >
                    Wallet
                </button>

                <button
                    onClick={() => setSelectedTab("orders")}
                    disabled={selectedTab === "orders"}
                    style={{ marginLeft: 10 }}
                >
                    My Orders
                </button>
            </div>

            {/* SHOW PRODUCTS TAB */}
            {selectedTab === "products" && (
                <section>
                    <h2>Products</h2>

                    <input
                        placeholder="Search by name, brand, SKU..."
                        value={keyword}
                        onChange={e => setKeyword(e.target.value)}
                    />

                    {products.map(p => (
                        <div
                            key={p.id}
                            style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
                        >
                            <h3>{p.name}</h3>
                            <p>{p.brand}</p>
                            <p>RM {p.price}</p>
                            <p>Status: {p.status}</p>

                            <button
                                disabled={p.status !== "AVAILABLE"}
                                onClick={() => handleAddToCart(p)}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </section>
            )}

            {/* MY ORDERS TAB */}
            {selectedTab === "orders" && (
                <section style={{ marginTop: 20 }}>
                    <h2>My Orders</h2>

                    {orders.length === 0 && <p>No orders yet.</p>}

                    {orders.map(o => (
                        <div
                            key={o.orderID}
                            style={{
                                border: "1px solid #aaa",
                                padding: 10,
                                marginBottom: 10,
                                cursor: "pointer"
                            }}
                            onClick={() => navigate(`/customer/orders/${o.orderID}`)}
                        >
                            <p><strong>{o.product.name}</strong></p>
                            <p>Quantity: {o.quantity}</p>
                            <p>Payment: {o.paymentStatus}</p>

                            {o.paymentStatus === "UNPAID" && (
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation(); // prevent navigation
                                        try {
                                            await payForOrder(o.orderID);
                                            alert("Payment successful");

                                            // refresh orders + wallet
                                            getMyOrders(customerId).then(setOrders);
                                            getWalletBalance(customerId).then(setWalletBalance);
                                        } catch (err) {
                                            alert(err.message);
                                        }
                                    }}
                                >
                                    Pay Now
                                </button>
                            )}

                            <p>Shipment: {o.shipmentStatus}</p>
                        </div>
                    ))}
                </section>
            )}

            {selectedTab === "wallet" && (
                <section style={{ marginTop: 20 }}>
                    <h2>My Wallet</h2>

                    <p><strong>Balance:</strong> RM {walletBalance}</p>

                    <input
                        type="number"
                        placeholder="Top-up amount"
                        value={topUpAmount}
                        onChange={e => setTopUpAmount(e.target.value)}
                    />

                    <button
                        onClick={async () => {
                            try {
                                await topUpWallet(customerId, topUpAmount);
                                const updated = await getWalletBalance(customerId);
                                setWalletBalance(updated);
                                setTopUpAmount("");
                                alert("Top-up successful");
                            } catch (e) {
                                alert(e.message);
                            }
                        }}
                        style={{ marginLeft: 10 }}
                    >
                        Top Up
                    </button>
                </section>
            )}

        </div>
    );
}
