// TransactionsTab.jsx - Transaction monitoring tab component
import { useState } from "react";
import {
  getUserTransactionHistory,
  getTransactionReport,
  getTransactionsByStatus,
  getTransactionDetails,
} from "../../services/adminApi";

function TransactionsTab() {
  // =========================
  // TRANSACTIONS STATE
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

  return (
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

export default TransactionsTab;
