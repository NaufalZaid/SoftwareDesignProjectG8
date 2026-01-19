import { useParams } from "react-router-dom";
import "../styles/AuthForm.css";

function UpdateShipment() {
    const { orderId } = useParams();

    const updateStatus = async (status) => {
        await fetch(`/api/v1/seller/${orderId}/shipment?status=${status}`, {
            method: "PATCH"
        });

        alert("Shipment updated");
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2 className="auth-title">Update Shipment</h2>

                <button className="auth-button" onClick={() => updateStatus("SHIPPED")}>
                    Mark as Shipped
                </button>

                <button className="auth-button" onClick={() => updateStatus("DELIVERED")}>
                    Mark as Delivered
                </button>
            </div>
        </div>
    );
}

export default UpdateShipment;
