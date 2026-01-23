// SellersTab.jsx - Seller management tab component
import { useEffect, useState } from "react";
import {
  getSellerInfo,
  approveSeller,
  getAllSellers,
} from "../../services/adminApi";

function SellersTab() {
  // =========================
  // SELLER MANAGEMENT STATE
  // =========================
  const [sellerIdInput, setSellerIdInput] = useState("");
  const [sellerLoading, setSellerLoading] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [sellerError, setSellerError] = useState("");
  const [sellersList, setSellersList] = useState([]);
  const [sellersFilter, setSellersFilter] = useState("all"); // "all" | "pending" | "approved"
  const [sellersListLoading, setSellersListLoading] = useState(false);

  const fetchSellersList = async (filter = sellersFilter) => {
    setSellersListLoading(true);
    setSellerError("");
    try {
      let approved = null;
      if (filter === "pending") approved = false;
      else if (filter === "approved") approved = true;
      
      const data = await getAllSellers(approved);
      setSellersList(data || []);
    } catch (e) {
      setSellerError(e.message || "Failed to load sellers list.");
    } finally {
      setSellersListLoading(false);
    }
  };

  // Load sellers list on mount
  useEffect(() => {
    fetchSellersList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (newFilter) => {
    setSellersFilter(newFilter);
    fetchSellersList(newFilter);
  };

  const fetchSellerDetails = async () => {
    setSellerError("");
    setSellerDetails(null);

    if (!sellerIdInput.trim()) {
      setSellerError("Please enter a Seller ID (UUID).");
      return;
    }

    setSellerLoading(true);
    try {
      const data = await getSellerInfo(sellerIdInput.trim());
      setSellerDetails(data);
    } catch (e) {
      setSellerError(e.message || "Failed to load seller details.");
    } finally {
      setSellerLoading(false);
    }
  };

  const selectSellerFromList = (seller) => {
    const sellerId = seller.userID || seller.user?.userID;
    if (sellerId) {
      setSellerIdInput(sellerId);
      setSellerDetails(seller);
    }
  };

  const approveSellerAction = async () => {
    if (!sellerDetails && !sellerIdInput.trim()) {
      alert("No seller loaded. Fetch seller details first.");
      return;
    }

    const sellerId = (sellerDetails?.userID || sellerDetails?.user?.userID || sellerIdInput).trim();
    if (!sellerId) {
      alert("Missing seller ID.");
      return;
    }

    if (!confirm("Approve this seller?")) return;

    try {
      const result = await approveSeller(sellerId);
      alert(result || "Seller approved.");
      // Refresh both the details and the list
      await fetchSellerDetails();
      await fetchSellersList();
    } catch (e) {
      alert(e.message || "Failed to approve seller.");
    }
  };

  const openComplianceDoc = (base64String) => {
    if (!base64String) {
      alert("No compliance document found on this seller payload.");
      return;
    }
    const linkSource = `data:application/pdf;base64,${base64String}`;
    const pdfWindow = window.open("");
    if (!pdfWindow) {
      alert("Popup blocked. Allow popups then try again.");
      return;
    }
    pdfWindow.document.write(`<iframe width="100%" height="100%" src="${linkSource}"></iframe>`);
  };

  return (
    <div className="card">
      <h2 className="sectionTitle">Manage Seller Accounts</h2>
      
      {/* Filter and Refresh */}
      <div className="row" style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>
          <input
            type="radio"
            name="sellersFilter"
            value="all"
            checked={sellersFilter === "all"}
            onChange={() => handleFilterChange("all")}
          />
          {" "}All Sellers
        </label>
        <label style={{ marginRight: 8 }}>
          <input
            type="radio"
            name="sellersFilter"
            value="pending"
            checked={sellersFilter === "pending"}
            onChange={() => handleFilterChange("pending")}
          />
          {" "}Pending Approval
        </label>
        <label style={{ marginRight: 8 }}>
          <input
            type="radio"
            name="sellersFilter"
            value="approved"
            checked={sellersFilter === "approved"}
            onChange={() => handleFilterChange("approved")}
          />
          {" "}Approved
        </label>
        <button className="secondaryBtn" onClick={() => fetchSellersList()} disabled={sellersListLoading}>
          {sellersListLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Sellers List Table */}
      {sellersList.length > 0 && (
        <div style={{ marginBottom: 16, overflowX: "auto" }}>
          <table className="sellersTable">
            <thead>
              <tr>
                <th>Store Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellersList.map((seller) => (
                <tr key={seller.userID}>
                  <td>{seller.storeName || "-"}</td>
                  <td>{seller.email || "-"}</td>
                  <td>
                    <span className={`approvedBadge ${seller.approved ? "approved" : "pending"}`}>
                      {seller.approved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="smallBtn"
                      onClick={() => selectSellerFromList(seller)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="helpText" style={{ marginTop: 8 }}>
            Found {sellersList.length} seller(s)
          </div>
        </div>
      )}

      {sellersList.length === 0 && !sellersListLoading && (
        <div className="helpText" style={{ marginBottom: 16 }}>
          No sellers found with the selected filter.
        </div>
      )}

      {/* Seller Details Section */}
      <div style={{ borderTop: "1px solid #2b2b2b", paddingTop: 16, marginTop: 8 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Seller Details</h3>
        <div className="helpText">
          Select a seller from the list above or enter a Seller ID manually.
        </div>

        <div className="row">
          <input
            value={sellerIdInput}
            onChange={(e) => setSellerIdInput(e.target.value)}
            placeholder="Seller ID (UUID)"
            className="input"
          />
          <button className="primaryBtn" onClick={fetchSellerDetails} disabled={sellerLoading}>
            {sellerLoading ? "Loading..." : "View Details"}
          </button>
          <button className="successBtn" onClick={approveSellerAction} disabled={!sellerDetails || sellerDetails.approved}>
            Approve Seller
          </button>
        </div>

        {sellerError ? <div className="errorBox">{sellerError}</div> : null}

        {sellerDetails && (
          <div style={{ marginTop: 12 }}>
            <div className="kvGrid">
              <KV label="Seller User ID" value={safe(sellerDetails?.userID || sellerDetails?.user?.userID || sellerIdInput)} />
              <KV label="Email" value={safe(sellerDetails?.email || sellerDetails?.user?.email)} />
              <KV label="Store Name" value={safe(sellerDetails?.storeName)} />
              <KV label="Approval Status" value={sellerDetails?.approved ? "Approved" : "Pending"} />
              <KV label="Role" value={safe(sellerDetails?.role || sellerDetails?.user?.role)} />
              <KV label="Created At" value={sellerDetails?.createdAt ? new Date(sellerDetails.createdAt).toLocaleString() : "-"} />
            </div>

            <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="secondaryBtn"
                onClick={() => openComplianceDoc(sellerDetails?.complianceDocs)}
              >
                View Compliance PDF (if present)
              </button>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer" }}>Raw Seller JSON</summary>
              <pre className="pre">{JSON.stringify(sellerDetails, null, 2)}</pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function KV({ label, value }) {
  return (
    <div className="kv">
      <div className="kvLabel">{label}</div>
      <div className="kvValue">{value}</div>
    </div>
  );
}

function safe(v) {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

export default SellersTab;
