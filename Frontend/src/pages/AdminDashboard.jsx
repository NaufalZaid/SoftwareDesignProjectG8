// AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminDashboardStyle.css';

import {
  getSellerInfo,
  approveSeller,
  getPlatformSettings,
  updatePlatformSettings,
  getAllSellers,
  getUserTransactionHistory,
  getTransactionReport,
  getTransactionsByStatus,
  getTransactionDetails,
} from "../services/adminApi";

const TABS = {
  SELLERS: "Sellers",
  TRANSACTIONS: "Transactions",
  // CATEGORIES: "Categories", uncomment if we have categories
  SETTINGS: "Platform Settings",
};

function AdminDashboard() {
  const navigate = useNavigate();

  // ---- auth guard ----
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (role !== "ADMIN") {
      alert("Admin only. Please login as ADMIN.");
      navigate("/login");
    }
  }, [navigate]);

  // ---- tab ----
  const [activeTab, setActiveTab] = useState(TABS.SELLERS);

  // =========================
  // SELLER MANAGEMENT
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

  // Load sellers list on first tab open
  useEffect(() => {
    if (activeTab === TABS.SELLERS && sellersList.length === 0 && !sellersListLoading) {
      fetchSellersList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

  // =========================
  // TRANSACTIONS
  // =========================
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [txSearchMode, setTxSearchMode] = useState("status"); // "status" | "user" | "dateRange"
  const [txStatusInput, setTxStatusInput] = useState("PAID");
  const [txUserIdInput, setTxUserIdInput] = useState("");
  const [txStartDate, setTxStartDate] = useState("");
  const [txEndDate, setTxEndDate] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const searchTransactions = async () => {
    setTxError("");
    setTransactions([]);
    setTxLoading(true);

    try {
      let data = [];
      if (txSearchMode === "status") {
        if (!txStatusInput.trim()) {
          setTxError("Please select a status.");
          return;
        }
        data = await getTransactionsByStatus(txStatusInput.trim());
      } else if (txSearchMode === "user") {
        if (!txUserIdInput.trim()) {
          setTxError("Please enter a User ID (UUID).");
          return;
        }
        data = await getUserTransactionHistory(txUserIdInput.trim());
      } else if (txSearchMode === "dateRange") {
        if (!txStartDate || !txEndDate) {
          setTxError("Please select both start and end dates.");
          return;
        }
        // Convert date inputs to ISO datetime strings
        const startISO = `${txStartDate}T00:00:00`;
        const endISO = `${txEndDate}T23:59:59`;
        data = await getTransactionReport(startISO, endISO);
      }
      setTransactions(data || []);
    } catch (e) {
      setTxError(e.message || "Failed to fetch transactions.");
    } finally {
      setTxLoading(false);
    }
  };

  const viewTransactionDetails = async (transactionId) => {
    try {
      const data = await getTransactionDetails(transactionId);
      setSelectedTransaction(data);
    } catch (e) {
      alert(e.message || "Failed to fetch transaction details.");
    }
  };

  // =========================
  // PLATFORM SETTINGS
  // =========================
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [settingsRaw, setSettingsRaw] = useState(""); // JSON editor string
  const [settingsObj, setSettingsObj] = useState(null);

  const loadSettings = async () => {
    setSettingsError("");
    setSettingsObj(null);
    setSettingsRaw("");
    setSettingsLoading(true);

    try {
      const data = await getPlatformSettings();
      setSettingsObj(data);
      setSettingsRaw(JSON.stringify(data, null, 2));
    } catch (e) {
      setSettingsError(e.message || "Failed to load platform settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSettingsAction = async () => {
    let payload;
    try {
      payload = JSON.parse(settingsRaw);
    } catch {
      alert("Invalid JSON. Fix the JSON in the editor before saving.");
      return;
    }

    setSettingsLoading(true);
    setSettingsError("");

    try {
      const data = await updatePlatformSettings(payload);

      // backend might return updated settings (object) or a message (string)
      if (data && typeof data === "object") {
        setSettingsObj(data);
        setSettingsRaw(JSON.stringify(data, null, 2));
      }

      alert("Platform settings updated.");
    } catch (e) {
      setSettingsError(e.message || "Failed to update platform settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // load settings on first open of settings tab
  useEffect(() => {
    if (activeTab === TABS.SETTINGS && !settingsObj && !settingsLoading) {
      loadSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---- Render ----
  return (
    <div className="page">
      <div className="header">
        <div>
          <h1 className="title">Admin Dashboard</h1>
          <div className="subTitle">
            Manage sellers • monitor transactions • configure platform settings
          </div>
        </div>

        <button
          className="logoutBtn"
          onClick={() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            // keep email optionally
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="tabRow">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tabBtn ${activeTab === tab ? "tabBtnActive" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === TABS.SELLERS && (
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
      )}

      {activeTab === TABS.TRANSACTIONS && (
        <div className="card">
          <h2 className="sectionTitle">Monitor Transactions</h2>
          <div className="helpText">
            Search transactions by status, user ID, or date range.
          </div>

          {/* Search Mode Selector */}
          <div className="row" style={{ marginBottom: 12 }}>
            <label style={{ marginRight: 8 }}>
              <input
                type="radio"
                name="txSearchMode"
                value="status"
                checked={txSearchMode === "status"}
                onChange={() => setTxSearchMode("status")}
              />
              {" "}By Status
            </label>
            <label style={{ marginRight: 8 }}>
              <input
                type="radio"
                name="txSearchMode"
                value="user"
                checked={txSearchMode === "user"}
                onChange={() => setTxSearchMode("user")}
              />
              {" "}By User ID
            </label>
            <label>
              <input
                type="radio"
                name="txSearchMode"
                value="dateRange"
                checked={txSearchMode === "dateRange"}
                onChange={() => setTxSearchMode("dateRange")}
              />
              {" "}By Date Range
            </label>
          </div>

          {/* Search Inputs */}
          <div className="row">
            {txSearchMode === "status" && (
              <select
                value={txStatusInput}
                onChange={(e) => setTxStatusInput(e.target.value)}
                className="input"
              >
                <option value="PAID">PAID</option>
                <option value="UNPAID">UNPAID</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAILED">FAILED</option>
              </select>
            )}

            {txSearchMode === "user" && (
              <input
                value={txUserIdInput}
                onChange={(e) => setTxUserIdInput(e.target.value)}
                placeholder="User ID (UUID)"
                className="input"
              />
            )}

            {txSearchMode === "dateRange" && (
              <>
                <input
                  type="date"
                  value={txStartDate}
                  onChange={(e) => setTxStartDate(e.target.value)}
                  className="input"
                />
                <span style={{ padding: "0 8px" }}>to</span>
                <input
                  type="date"
                  value={txEndDate}
                  onChange={(e) => setTxEndDate(e.target.value)}
                  className="input"
                />
              </>
            )}

            <button className="primaryBtn" onClick={searchTransactions} disabled={txLoading}>
              {txLoading ? "Searching..." : "Search"}
            </button>
          </div>

          {txError && <div className="errorBox">{txError}</div>}

          {/* Transactions Table */}
          {transactions.length > 0 && (
            <div style={{ marginTop: 16, overflowX: "auto" }}>
              <table className="txTable">
                <thead>
                  <tr>
                    <th>Transaction ID</th>
                    <th>Sender</th>
                    <th>Receiver</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Timestamp</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.transactionId}>
                      <td title={tx.transactionId}>
                        {tx.transactionId?.substring(0, 8)}...
                      </td>
                      <td>{tx.sender?.email || tx.senderId || "-"}</td>
                      <td>{tx.receiver?.email || tx.receiverId || "-"}</td>
                      <td>RM {tx.amount?.toFixed(2) || "0.00"}</td>
                      <td>
                        <span className={`statusBadge ${tx.status?.toLowerCase()}`}>
                          {tx.status || "-"}
                        </span>
                      </td>
                      <td>{tx.timestamp ? new Date(tx.timestamp).toLocaleString() : "-"}</td>
                      <td>
                        <button
                          className="smallBtn"
                          onClick={() => viewTransactionDetails(tx.transactionId)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="helpText" style={{ marginTop: 8 }}>
                Found {transactions.length} transaction(s)
              </div>
            </div>
          )}

          {transactions.length === 0 && !txLoading && !txError && (
            <div className="helpText" style={{ marginTop: 16 }}>
              No transactions found. Try a different search.
            </div>
          )}

          {/* Transaction Details Modal */}
          {selectedTransaction && (
            <div className="modalOverlay" onClick={() => setSelectedTransaction(null)}>
              <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <h3>Transaction Details</h3>
                <div className="kvGrid">
                  <KV label="Transaction ID" value={safe(selectedTransaction.transactionId)} />
                  <KV label="Amount" value={`RM ${selectedTransaction.amount?.toFixed(2) || "0.00"}`} />
                  <KV label="Status" value={safe(selectedTransaction.status)} />
                  <KV label="Description" value={safe(selectedTransaction.description)} />
                  <KV label="Timestamp" value={selectedTransaction.timestamp ? new Date(selectedTransaction.timestamp).toLocaleString() : "-"} />
                  <KV label="Sender ID" value={safe(selectedTransaction.sender?.userID || selectedTransaction.senderId)} />
                  <KV label="Sender Email" value={safe(selectedTransaction.sender?.email)} />
                  <KV label="Receiver ID" value={safe(selectedTransaction.receiver?.userID || selectedTransaction.receiverId)} />
                  <KV label="Receiver Email" value={safe(selectedTransaction.receiver?.email)} />
                </div>
                <button className="secondaryBtn" style={{ marginTop: 16 }} onClick={() => setSelectedTransaction(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === TABS.CATEGORIES && (
        <div className="card">
          <h2 className="sectionTitle">Manage Product Categories</h2>
          <div className="errorBox">
            Your Postman endpoints did not include any category management endpoints.
            If your backend has category endpoints, paste them and I’ll wire this tab up.
          </div>
          <div className="helpText">
            For now, you can still present this as “backend completed; frontend pending integration”.
          </div>
        </div>
      )}

      {activeTab === TABS.SETTINGS && (
        <div className="card">
          <h2 className="sectionTitle">Platform Settings</h2>
          <div className="helpText">
            GET current settings from <code>/api/v1/admin/settings</code>. Update via{" "}
            <code>PUT /api/v1/admin/settings/update</code>.
          </div>

          <div className="row">
            <button className="secondaryBtn" onClick={loadSettings} disabled={settingsLoading}>
              {settingsLoading ? "Loading..." : "Reload Settings"}
            </button>
            <button className="primaryBtn" onClick={updateSettingsAction} disabled={settingsLoading || !settingsRaw}>
              Save Settings
            </button>
          </div>

          {settingsError ? <div className="errorBox">{settingsError}</div> : null}

          <div style={{ marginTop: 12 }}>
            <div className="smallLabel">Edit Settings JSON</div>
            <textarea
              value={settingsRaw}
              onChange={(e) => setSettingsRaw(e.target.value)}
              placeholder="Settings JSON will appear here after loading..."
              className="textarea"
            />
          </div>

          {settingsObj && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer" }}>Current Settings (read-only view)</summary>
              <pre className="pre">{JSON.stringify(settingsObj, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="kv">
      <div className="kvLabel">{label}</div>
      <div className="kvValue">{value}</div>
    </div>
  );
}

// ---- helpers ----
function safe(v) {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

export default AdminDashboard;
