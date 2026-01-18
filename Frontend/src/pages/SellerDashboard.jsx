import { useEffect, useState } from "react";
import {
    getSalesSummary,
    getTopProducts,
    getOrdersByStatus
} from "../services/sellerAnalyticsService";

export default function SellerDashboard() {
    const sellerId = localStorage.getItem("userId");

    const [summary, setSummary] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [statusData, setStatusData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            const summaryData = await getSalesSummary(sellerId);
            const productsData = await getTopProducts(sellerId);
            const statusStats = await getOrdersByStatus(sellerId);

            setSummary(summaryData);
            setTopProducts(productsData);
            setStatusData(statusStats);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <p>Loading dashboard...</p>;

    return (
        <div style={{ padding: 20 }}>
            <h2>Sales Dashboard & Analytics</h2>

            {/* SUMMARY */}
            <div style={{ display: "flex", gap: 20, marginBottom: 30 }}>
                <StatCard title="Total Revenue" value={`RM ${summary.totalRevenue}`} />
                <StatCard title="Total Orders" value={summary.totalOrders} />
                <StatCard title="Total Items Sold" value={summary.totalItemsSold} />
            </div>

            {/* TOP PRODUCTS */}
            <section style={{ marginBottom: 30 }}>
                <h3>Top Selling Products</h3>

                {topProducts.length === 0 && <p>No sales yet.</p>}

                {topProducts.map(p => (
                    <div
                        key={p.productId}
                        style={{
                            border: "1px solid #ccc",
                            padding: 10,
                            marginBottom: 10
                        }}
                    >
                        <strong>{p.productName}</strong>
                        <p>Units Sold: {p.unitsSold}</p>
                        <p>Revenue: RM {p.revenue}</p>
                    </div>
                ))}
            </section>

            {/* ORDER STATUS */}
            <section>
                <h3>Orders by Status</h3>

                {Object.keys(statusData).map(status => (
                    <p key={status}>
                        {status}: {statusData[status]}
                    </p>
                ))}
            </section>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div
            style={{
                border: "1px solid #aaa",
                padding: 20,
                minWidth: 180,
                textAlign: "center"
            }}
        >
            <h4>{title}</h4>
            <p style={{ fontSize: 20, fontWeight: "bold" }}>{value}</p>
        </div>
    );
}
