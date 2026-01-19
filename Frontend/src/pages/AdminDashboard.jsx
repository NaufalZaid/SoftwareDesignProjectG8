// AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Admin Dashboard</h1>
          <div style={styles.subTitle}>
            Manage sellers • monitor transactions • configure platform settings
          </div>
        </div>

        <button
          style={styles.logoutBtn}
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
      <div style={styles.tabRow}>
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === tab ? styles.tabBtnActive : null),
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === TABS.SELLERS && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Manage Seller Accounts</h2>
          <div style={styles.helpText}>
            Use <code>GET /api/v1/admin/sellers/{"{sellerId}"}</code> and{" "}
            <code>PUT /api/v1/admin/sellers/{"{sellerId}"}/approve</code>.
          </div>

          <div style={styles.row}>
            <input
              value={sellerIdInput}
              onChange={(e) => setSellerIdInput(e.target.value)}
              placeholder="Seller ID (UUID)"
              style={styles.input}
            />
            <button style={styles.primaryBtn} onClick={fetchSellerDetails} disabled={sellerLoading}>
              {sellerLoading ? "Loading..." : "View Seller Details"}
            </button>
            <button style={styles.successBtn} onClick={approveSellerAction} disabled={!sellerDetails}>
              Approve Seller
            </button>
          </div>

          {sellerError ? <div style={styles.errorBox}>{sellerError}</div> : null}

          {sellerDetails && (
            <div style={{ marginTop: 12 }}>
              <div style={styles.kvGrid}>
                <KV label="Seller User ID" value={safe(sellerDetails?.user?.userID || sellerIdInput)} />
                <KV label="Seller Email" value={safe(sellerDetails?.user?.email)} />
                <KV label="Seller Name" value={safe(sellerDetails?.name)} />
                <KV label="Store Name" value={safe(sellerDetails?.storeName)} />
                <KV label="Status" value={safe(sellerDetails?.status)} />
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => openComplianceDoc(sellerDetails?.complianceDocs)}
                >
                  View Compliance PDF (if present)
                </button>
              </div>

              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer" }}>Raw Seller JSON</summary>
                <pre style={styles.pre}>{JSON.stringify(sellerDetails, null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      )}

      {activeTab === TABS.TRANSACTIONS && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Monitor Transactions</h2>
          <div style={styles.errorBox}>
            Your Postman endpoint list does not include any admin transaction monitoring endpoints (e.g.
            <code> /api/v1/admin/transactions</code> or a report endpoint).
            <br />
            <br />
            If you add/confirm an endpoint, I can wire this tab up immediately.
          </div>
        </div>
      )}

      {activeTab === TABS.CATEGORIES && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Manage Product Categories</h2>
          <div style={styles.errorBox}>
            Your Postman endpoints did not include any category management endpoints.
            If your backend has category endpoints, paste them and I’ll wire this tab up.
          </div>
          <div style={styles.helpText}>
            For now, you can still present this as “backend completed; frontend pending integration”.
          </div>
        </div>
      )}

      {activeTab === TABS.SETTINGS && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Platform Settings</h2>
          <div style={styles.helpText}>
            GET current settings from <code>/api/v1/admin/settings</code>. Update via{" "}
            <code>PUT /api/v1/admin/settings/update</code>.
          </div>

          <div style={styles.row}>
            <button style={styles.secondaryBtn} onClick={loadSettings} disabled={settingsLoading}>
              {settingsLoading ? "Loading..." : "Reload Settings"}
            </button>
            <button style={styles.primaryBtn} onClick={updateSettingsAction} disabled={settingsLoading || !settingsRaw}>
              Save Settings
            </button>
          </div>

          {settingsError ? <div style={styles.errorBox}>{settingsError}</div> : null}

          <div style={{ marginTop: 12 }}>
            <div style={styles.smallLabel}>Edit Settings JSON</div>
            <textarea
              value={settingsRaw}
              onChange={(e) => setSettingsRaw(e.target.value)}
              placeholder="Settings JSON will appear here after loading..."
              style={styles.textarea}
            />
          </div>

          {settingsObj && (
            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer" }}>Current Settings (read-only view)</summary>
              <pre style={styles.pre}>{JSON.stringify(settingsObj, null, 2)}</pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div style={styles.kv}>
      <div style={styles.kvLabel}>{label}</div>
      <div style={styles.kvValue}>{value}</div>
    </div>
  );
}

// ---- helpers ----
function safe(v) {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

// ---- styles ----
const styles = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: 16,
    color: "#eaeaea",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  title: { margin: 0, fontSize: 26 },
  subTitle: { opacity: 0.85, marginTop: 4 },
  logoutBtn: {
    background: "#2b2b2b",
    color: "#fff",
    border: "1px solid #3a3a3a",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
  },
  card: {
    background: "#171717",
    border: "1px solid #2b2b2b",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  sectionTitle: { margin: "0 0 8px", fontSize: 18 },
  helpText: { opacity: 0.85, fontSize: 13, marginBottom: 10 },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  input: {
    minWidth: 260,
    flex: 1,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#0f0f0f",
    color: "#fff",
    outline: "none",
  },
  textarea: {
    width: "100%",
    minHeight: 280,
    padding: 12,
    borderRadius: 10,
    border: "1px solid #333",
    background: "#0f0f0f",
    color: "#fff",
    outline: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 13,
  },
  primaryBtn: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  secondaryBtn: {
    background: "#2b2b2b",
    color: "#fff",
    border: "1px solid #3a3a3a",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  successBtn: {
    background: "#16a34a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },
  errorBox: {
    marginTop: 10,
    background: "rgba(239,68,68,0.12)",
    border: "1px solid rgba(239,68,68,0.35)",
    color: "#ffd5d5",
    borderRadius: 12,
    padding: 10,
    whiteSpace: "pre-wrap",
  },
  tabRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 },
  tabBtn: {
    background: "#202020",
    border: "1px solid #2b2b2b",
    color: "#fff",
    borderRadius: 999,
    padding: "10px 14px",
    cursor: "pointer",
    opacity: 0.85,
  },
  tabBtnActive: {
    opacity: 1,
    borderColor: "#3b82f6",
  },
  kvGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 10,
  },
  kv: {
    background: "#101010",
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    padding: 10,
  },
  kvLabel: { fontSize: 12, opacity: 0.8 },
  kvValue: { marginTop: 6, fontWeight: 700, wordBreak: "break-word" },
  pre: {
    background: "#0b0b0b",
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    padding: 12,
    overflowX: "auto",
    fontSize: 12,
  },
};

export default AdminDashboard;
