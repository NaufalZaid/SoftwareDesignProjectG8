import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/AuthForm.css";

function UpdateShipment() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const role = localStorage.getItem("role");
    const [processing, setProcessing] = useState(false);

    /* ================= ACCESS CONTROL ================= */
    if (role !== "SELLER") {
        return <p>Access denied. Sellers only.</p>;
    }

    /* ================= UPDATE ================= */
    async function updateStatus(status) {
        if (processing) return;

        if (!window.confirm(`Mark order as ${status}?`)) {
            return;
        }

        setProcessing(true);

        try {
            const res = await fetch(
                `/api/v1/seller/${orderId}/shipment?status=${status}`,
                { method: "PATCH" }
            );

            if (!res.ok) {
                throw new Error("Failed to update shipment status");
            }

            alert(`Shipment marked as ${status}`);
            navigate(-1); // go back to previous page
        } catch (e) {
            alert(e.message);
        } finally {
            setProcessing(false);
        }
    }

    /* ================= UI ================= */
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Update Shipment</h2>

                <button
                    className="auth-button"
                    disabled={processing}
                    onClick={() => updateStatus("SHIPPED")}
                >
                    {processing ? "Updating..." : "Mark as Shipped"}
                </button>

                <button
                    className="auth-button"
                    style={{ marginTop: "1rem" }}
                    disabled={processing}
                    onClick={() => updateStatus("DELIVERED")}
                >
                    {processing ? "Updating..." : "Mark as Delivered"}
                </button>

                <button
                    className="auth-button"
                    style={{ marginTop: "2rem", backgroundColor: "#777" }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </button>
            </div>
        </div>
    );
}

export default UpdateShipment;
