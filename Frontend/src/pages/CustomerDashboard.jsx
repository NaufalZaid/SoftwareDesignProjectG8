import { useEffect, useState } from "react";
import { getAllProducts, getMyOrders } from "../services/api";
import { addToCart, getCart } from "../services/cart";
import { useNavigate } from "react-router-dom";

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

    // Load products, orders, cart ONCE
    useEffect(() => {
        getAllProducts().then(data => {
            setAllProducts(data);
            setProducts(data);
        });

        getMyOrders(customerId).then(setOrders);
        setCartCount(getCart().length);
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
                <button onClick={() => navigate("/customer/checkout")} style={{ marginLeft: 10 }}>
                    Checkout
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
                            <p>Shipment: {o.shipmentStatus}</p>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
