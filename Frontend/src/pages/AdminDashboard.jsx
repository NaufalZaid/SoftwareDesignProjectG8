// AdminDashboard.jsx - Main admin dashboard orchestrator
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/AdminDashboardStyle.css';

import {
  SellersTab,
  TransactionsTab,
  CategoriesTab,
  SettingsTab,
} from "../components/admin";

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
            navigate("/");
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

      {/* Tab Content */}
      {activeTab === TABS.SELLERS && <SellersTab />}
      {activeTab === TABS.TRANSACTIONS && <TransactionsTab />}
      {activeTab === TABS.CATEGORIES && <CategoriesTab />}
      {activeTab === TABS.SETTINGS && <SettingsTab />}
    </div>
  );
}

export default AdminDashboard;
