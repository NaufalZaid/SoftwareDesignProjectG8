// AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminDashboardStyle.css';

import {
  getSellerInfo,
  approveSeller,
  getPlatformSettings,
  updatePlatformSettings,
} from "../services/adminApi";

const TABS = {
  SELLERS: "Sellers",
  TRANSACTIONS: "Transactions",
  CATEGORIES: "Categories",
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

  const approveSellerAction = async () => {
    if (!sellerDetails && !sellerIdInput.trim()) {
      alert("No seller loaded. Fetch seller details first.");
      return;
    }

    const sellerId = (sellerDetails?.user?.userID || sellerIdInput).trim();
    if (!sellerId) {
      alert("Missing seller ID.");
      return;
    }

    if (!confirm("Approve this seller?")) return;

    try {
      const result = await approveSeller(sellerId);
      alert(result || "Seller approved.");
      await fetchSellerDetails();
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
          <div className="helpText">
            Use <code>GET /api/v1/admin/sellers/{"{sellerId}"}</code> and{" "}
            <code>PUT /api/v1/admin/sellers/{"{sellerId}"}/approve</code>.
          </div>

          <div className="row">
            <input
              value={sellerIdInput}
              onChange={(e) => setSellerIdInput(e.target.value)}
              placeholder="Seller ID (UUID)"
              className="input"
            />
            <button className="primaryBtn" onClick={fetchSellerDetails} disabled={sellerLoading}>
              {sellerLoading ? "Loading..." : "View Seller Details"}
            </button>
            <button className="successBtn" onClick={approveSellerAction} disabled={!sellerDetails}>
              Approve Seller
            </button>
          </div>

          {sellerError ? <div className="errorBox">{sellerError}</div> : null}

          {sellerDetails && (
            <div style={{ marginTop: 12 }}>
              <div className="kvGrid">
                <KV label="Seller User ID" value={safe(sellerDetails?.user?.userID || sellerIdInput)} />
                <KV label="Seller Email" value={safe(sellerDetails?.user?.email)} />
                <KV label="Seller Name" value={safe(sellerDetails?.name)} />
                <KV label="Store Name" value={safe(sellerDetails?.storeName)} />
                <KV label="Status" value={safe(sellerDetails?.status)} />
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
      )}

      {activeTab === TABS.TRANSACTIONS && (
        <div className="card">
          <h2 className="sectionTitle">Monitor Transactions</h2>
          <div className="errorBox">
            Your Postman endpoint list does not include any admin transaction monitoring endpoints (e.g.
            <code> /api/v1/admin/transactions</code> or a report endpoint).
            <br />
            <br />
            If you add/confirm an endpoint, I can wire this tab up immediately.
          </div>
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
