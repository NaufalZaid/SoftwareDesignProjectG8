// AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * AdminDashboard (Frontend-only)
 *
 * Backend endpoints used (from your uploaded controllers):
 * - Admin (requires header "User-Email" on some):
 *   GET  /api/v1/admin/sellers/{sellerId}
 *   PUT  /api/v1/admin/sellers/{sellerId}/approve
 *   GET  /api/v1/admin/user/{userId}
 *   GET  /api/v1/admin/report?start=...&end=...
 *   GET  /api/v1/admin/status/{status}
 *   GET  /api/v1/admin/{transactionId}
 *
 * - Platform Settings:
 *   GET  /api/v1/admin/settings
 *   PUT  /api/v1/admin/settings/update   (requires header "User-Email")
 *
 * Notes:
 * - Your login page currently stores userId + role. Admin endpoints need "User-Email".
 *   This dashboard lets you enter admin email once and stores it in localStorage ("email").
 */

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

  // ---- admin identity (needed by backend headers) ----
  const [adminEmail, setAdminEmail] = useState(localStorage.getItem("email") || "");
  const saveAdminEmail = () => {
    if (!adminEmail.trim()) {
      alert("Please enter your admin email (required by admin endpoints).");
      return;
    }
    localStorage.setItem("email", adminEmail.trim());
    alert("Admin email saved.");
  };

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

    const email = (localStorage.getItem("email") || "").trim();
    if (!email) {
      setSellerError('Admin email missing. Enter it at the top and click "Save".');
      return;
    }
    if (!sellerIdInput.trim()) {
      setSellerError("Please enter a Seller ID (UUID).");
      return;
    }

    setSellerLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/sellers/${sellerIdInput.trim()}`, {
        headers: { "User-Email": email },
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSellerDetails(data);
    } catch (e) {
      setSellerError(e.message || "Failed to load seller details.");
    } finally {
      setSellerLoading(false);
    }
  };

  const approveSeller = async () => {
    const email = (localStorage.getItem("email") || "").trim();
    if (!email) {
      alert('Admin email missing. Enter it at the top and click "Save".');
      return;
    }
    if (!sellerDetails?.user?.userID && !sellerIdInput.trim()) {
      alert("No seller loaded. Fetch seller details first.");
      return;
    }

    const sellerId = (sellerDetails?.user?.userID || sellerIdInput).trim();

    if (!confirm("Approve this seller?")) return;

    try {
      const res = await fetch(`/api/v1/admin/sellers/${sellerId}/approve`, {
        method: "PUT",
        headers: { "User-Email": email },
      });
      if (!res.ok) throw new Error(await res.text());
      alert(await res.text());
      // refresh details after approval
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
  // TRANSACTIONS MONITORING
  // =========================
  const [txMode, setTxMode] = useState("REPORT"); // REPORT | STATUS | USER | SINGLE
  const [txLoading, setTxLoading] = useState(false);
  const [txError, setTxError] = useState("");
  const [txList, setTxList] = useState([]);
  const [txSingle, setTxSingle] = useState(null);

  // report filters
  const [reportStart, setReportStart] = useState(() => {
    // default: today 00:00:00
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return toLocalDateTimeInputValue(d);
  });
  const [reportEnd, setReportEnd] = useState(() => {
    // default: today 23:59:59
    const d = new Date();
    d.setHours(23, 59, 59, 0);
    return toLocalDateTimeInputValue(d);
  });

  const [statusInput, setStatusInput] = useState("SUCCESS");
  const [userIdForHistory, setUserIdForHistory] = useState("");
  const [transactionIdInput, setTransactionIdInput] = useState("");

  const fetchReport = async () => {
    setTxError("");
    setTxList([]);
    setTxSingle(null);

    // backend expects ISO DATE_TIME like 2026-01-01T00:00:00
    const start = normalizeDateTimeParam(reportStart);
    const end = normalizeDateTimeParam(reportEnd);
    if (!start || !end) {
      setTxError("Please set valid start/end datetime.");
      return;
    }

    setTxLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/report?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTxList(Array.isArray(data) ? data : []);
    } catch (e) {
      setTxError(e.message || "Failed to fetch report.");
    } finally {
      setTxLoading(false);
    }
  };

  const fetchByStatus = async () => {
    setTxError("");
    setTxList([]);
    setTxSingle(null);

    if (!statusInput.trim()) {
      setTxError("Enter a status (e.g., SUCCESS, FAILED).");
      return;
    }

    setTxLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/status/${encodeURIComponent(statusInput.trim())}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTxList(Array.isArray(data) ? data : []);
    } catch (e) {
      setTxError(e.message || "Failed to fetch by status.");
    } finally {
      setTxLoading(false);
    }
  };

  const fetchUserHistory = async () => {
    setTxError("");
    setTxList([]);
    setTxSingle(null);

    if (!userIdForHistory.trim()) {
      setTxError("Enter a userId (UUID).");
      return;
    }

    setTxLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/user/${encodeURIComponent(userIdForHistory.trim())}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTxList(Array.isArray(data) ? data : []);
    } catch (e) {
      setTxError(e.message || "Failed to fetch user history.");
    } finally {
      setTxLoading(false);
    }
  };

  const fetchTransactionDetails = async () => {
    setTxError("");
    setTxList([]);
    setTxSingle(null);

    if (!transactionIdInput.trim()) {
      setTxError("Enter a transactionId (UUID).");
      return;
    }

    setTxLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/${encodeURIComponent(transactionIdInput.trim())}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setTxSingle(data);
    } catch (e) {
      setTxError(e.message || "Failed to fetch transaction details.");
    } finally {
      setTxLoading(false);
    }
  };

  const txSummary = useMemo(() => summarizeTransactions(txList), [txList]);

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
      const res = await fetch("/api/v1/admin/settings");
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSettingsObj(data);
      setSettingsRaw(JSON.stringify(data, null, 2));
    } catch (e) {
      setSettingsError(e.message || "Failed to load platform settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateSettings = async () => {
    const email = (localStorage.getItem("email") || "").trim();
    if (!email) {
      alert('Admin email missing. Enter it at the top and click "Save".');
      return;
    }

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
      const res = await fetch("/api/v1/admin/settings/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-Email": email,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSettingsObj(data);
      setSettingsRaw(JSON.stringify(data, null, 2));
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

  // =========================
  // CATEGORIES (Backend not shown in uploaded controllers)
  // =========================
  // Your ProductController doesn't expose categories endpoints in the files you uploaded.
  // So this tab provides a placeholder. If your friend has a CategoriesController, we can wire it up.
  // =========================

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

      {/* Admin email bar */}
      <div style={styles.card}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ fontWeight: 700 }}>Admin Email (required by backend header "User-Email")</div>
          <input
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
            placeholder="admin@example.com"
            style={styles.input}
          />
          <button style={styles.primaryBtn} onClick={saveAdminEmail}>
            Save
          </button>
          <div style={{ opacity: 0.8, fontSize: 13 }}>
            Tip: your login page can also store this into localStorage as <code>email</code>.
          </div>
        </div>
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
            Backend provides seller review by ID and approve endpoint. Enter a Seller ID (UUID) and fetch details.
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
            <button style={styles.successBtn} onClick={approveSeller} disabled={!sellerDetails}>
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
          <div style={styles.helpText}>
            Use one of the backend-supported views: report (date range), status filter, user history, or single transaction details.
          </div>

          <div style={styles.row}>
            <label style={styles.label}>Mode</label>
            <select value={txMode} onChange={(e) => setTxMode(e.target.value)} style={styles.select}>
              <option value="REPORT">Report (date range)</option>
              <option value="STATUS">By Status</option>
              <option value="USER">By User History</option>
              <option value="SINGLE">Single Transaction</option>
            </select>
          </div>

          {txMode === "REPORT" && (
            <div style={styles.cardInner}>
              <div style={styles.row}>
                <div style={{ flex: 1 }}>
                  <div style={styles.smallLabel}>Start</div>
                  <input
                    type="datetime-local"
                    value={reportStart}
                    onChange={(e) => setReportStart(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={styles.smallLabel}>End</div>
                  <input
                    type="datetime-local"
                    value={reportEnd}
                    onChange={(e) => setReportEnd(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <button style={styles.primaryBtn} onClick={fetchReport} disabled={txLoading}>
                  {txLoading ? "Loading..." : "Fetch Report"}
                </button>
              </div>
            </div>
          )}

          {txMode === "STATUS" && (
            <div style={styles.cardInner}>
              <div style={styles.row}>
                <input
                  value={statusInput}
                  onChange={(e) => setStatusInput(e.target.value)}
                  placeholder="Status (e.g., SUCCESS, FAILED)"
                  style={styles.input}
                />
                <button style={styles.primaryBtn} onClick={fetchByStatus} disabled={txLoading}>
                  {txLoading ? "Loading..." : "Fetch"}
                </button>
              </div>
            </div>
          )}

          {txMode === "USER" && (
            <div style={styles.cardInner}>
              <div style={styles.row}>
                <input
                  value={userIdForHistory}
                  onChange={(e) => setUserIdForHistory(e.target.value)}
                  placeholder="User ID (UUID)"
                  style={styles.input}
                />
                <button style={styles.primaryBtn} onClick={fetchUserHistory} disabled={txLoading}>
                  {txLoading ? "Loading..." : "Fetch User History"}
                </button>
              </div>
            </div>
          )}

          {txMode === "SINGLE" && (
            <div style={styles.cardInner}>
              <div style={styles.row}>
                <input
                  value={transactionIdInput}
                  onChange={(e) => setTransactionIdInput(e.target.value)}
                  placeholder="Transaction ID (UUID)"
                  style={styles.input}
                />
                <button style={styles.primaryBtn} onClick={fetchTransactionDetails} disabled={txLoading}>
                  {txLoading ? "Loading..." : "Fetch Details"}
                </button>
              </div>
            </div>
          )}

          {txError ? <div style={styles.errorBox}>{txError}</div> : null}

          {/* Summary */}
          {txList.length > 0 && (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <MiniCard title="Count" value={txSummary.count} />
              <MiniCard title="Total Amount" value={formatMoney(txSummary.total)} />
              <MiniCard title="SUCCESS" value={txSummary.successCount} />
              <MiniCard title="FAILED" value={txSummary.failedCount} />
            </div>
          )}

          {/* List */}
          {txList.length > 0 && (
            <div style={{ marginTop: 12, overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Transaction ID</th>
                    <th style={styles.th}>User ID</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Amount</th>
                    <th style={styles.th}>Timestamp</th>
                    <th style={styles.th}>Order ID</th>
                  </tr>
                </thead>
                <tbody>
                  {txList.map((t) => (
                    <tr key={t?.transactionId || t?.id || JSON.stringify(t)} style={styles.tr}>
                      <td style={styles.td}>{safe(t?.transactionId || t?.id)}</td>
                      <td style={styles.td}>{safe(t?.userId || t?.user?.userID || t?.user?.userId)}</td>
                      <td style={styles.td}>{safe(t?.type)}</td>
                      <td style={styles.td}>{safe(t?.status)}</td>
                      <td style={styles.td}>{formatMoney(t?.amount)}</td>
                      <td style={styles.td}>{safe(t?.timestamp)}</td>
                      <td style={styles.td}>{safe(t?.orderId || t?.order?.orderID || t?.order?.id)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <details style={{ marginTop: 12 }}>
                <summary style={{ cursor: "pointer" }}>Raw Transactions JSON</summary>
                <pre style={styles.pre}>{JSON.stringify(txList, null, 2)}</pre>
              </details>
            </div>
          )}

          {/* Single transaction */}
          {txSingle && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ margin: "12px 0 6px" }}>Transaction Details</h3>
              <pre style={styles.pre}>{JSON.stringify(txSingle, null, 2)}</pre>
            </div>
          )}

          {txLoading && <div style={styles.helpText}>Loading…</div>}
          {!txLoading && txMode !== "SINGLE" && txList.length === 0 && !txError && (
            <div style={styles.helpText}>No transactions loaded yet.</div>
          )}
        </div>
      )}

      {activeTab === TABS.CATEGORIES && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Manage Product Categories</h2>
          <div style={styles.errorBox}>
            I can’t see any category endpoints in the backend controllers you uploaded (ProductController only has /products).
            If your friend has a Categories controller, upload it or tell me the endpoint paths and I’ll wire this tab up.
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
            <code>PUT /api/v1/admin/settings/update</code> with header <code>User-Email</code>.
          </div>

          <div style={styles.row}>
            <button style={styles.secondaryBtn} onClick={loadSettings} disabled={settingsLoading}>
              {settingsLoading ? "Loading..." : "Reload Settings"}
            </button>
            <button style={styles.primaryBtn} onClick={updateSettings} disabled={settingsLoading || !settingsRaw}>
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

function MiniCard({ title, value }) {
  return (
    <div style={styles.miniCard}>
      <div style={styles.miniTitle}>{title}</div>
      <div style={styles.miniValue}>{String(value)}</div>
    </div>
  );
}

// ---- helpers ----

function safe(v) {
  if (v === null || v === undefined || v === "") return "-";
  return String(v);
}

function formatMoney(v) {
  if (v === null || v === undefined || v === "") return "-";
  // backend might send number or string
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `RM ${n.toFixed(2)}`;
}

function summarizeTransactions(list) {
  const res = {
    count: list.length,
    total: 0,
    successCount: 0,
    failedCount: 0,
  };

  for (const t of list) {
    const amt = Number(t?.amount);
    if (!Number.isNaN(amt)) res.total += amt;

    const status = (t?.status || "").toUpperCase();
    if (status === "SUCCESS") res.successCount += 1;
    if (status === "FAILED") res.failedCount += 1;
  }

  return res;
}

/**
 * Convert Date -> yyyy-MM-ddTHH:mm for <input type="datetime-local" />
 */
function toLocalDateTimeInputValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

/**
 * Ensure datetime param includes seconds (backend examples include seconds)
 * input: yyyy-MM-ddTHH:mm  -> output: yyyy-MM-ddTHH:mm:00
 */
function normalizeDateTimeParam(s) {
  if (!s) return "";
  // already includes seconds?
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s; // fallback
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
  cardInner: {
    background: "#121212",
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
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
  select: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #333",
    background: "#0f0f0f",
    color: "#fff",
    outline: "none",
  },
  label: { fontWeight: 700, opacity: 0.9 },
  smallLabel: { fontSize: 12, opacity: 0.8, marginBottom: 6 },
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
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#101010",
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    padding: 10,
    fontSize: 12,
    opacity: 0.9,
    borderBottom: "1px solid #2b2b2b",
    background: "#141414",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 10,
    borderBottom: "1px solid #222",
    fontSize: 13,
    whiteSpace: "nowrap",
  },
  tr: { },
  miniCard: {
    background: "#101010",
    border: "1px solid #2b2b2b",
    borderRadius: 12,
    padding: 10,
    minWidth: 160,
  },
  miniTitle: { fontSize: 12, opacity: 0.8 },
  miniValue: { marginTop: 6, fontSize: 18, fontWeight: 800 },
};

export default AdminDashboard;
