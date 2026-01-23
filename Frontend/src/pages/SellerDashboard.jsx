// SellerDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SellerDashboard.css";

import {
  getProductsBySeller,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrdersBySeller,
  updateShipment,
  getSellerBalance,
  withdrawFunds,
} from "../services/api";
import { getAllCategories } from "../services/adminApi";

const TABS = {
  PRODUCTS: "My Products",
  ORDERS: "Orders",
  WALLET: "Wallet",
};

function SellerDashboard() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  // ---- auth guard ----
  useEffect(() => {
    const role = (localStorage.getItem("role") || "").toUpperCase();
    if (role !== "SELLER") {
      alert("Seller only. Please login as SELLER.");
      navigate("/login");
    }
  }, [navigate]);

  // ---- tab ----
  const [activeTab, setActiveTab] = useState(TABS.PRODUCTS);

  // =========================
  // CATEGORIES (for suggestions)
  // =========================
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  // Fetch category suggestions on mount
  useEffect(() => {
    const fetchCategorySuggestions = async () => {
      try {
        const data = await getAllCategories();
        setCategorySuggestions(data || []);
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
    };
    fetchCategorySuggestions();
  }, []);

  // =========================
  // PRODUCTS
  // =========================
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Product form state
  const [productForm, setProductForm] = useState({
    sku: "",
    name: "",
    brand: "",
    category: "",
    description: "",
    price: "",
    status: "AVAILABLE",
  });
  const [productStock, setProductStock] = useState("");
  const [productImages, setProductImages] = useState([]);

  const resetProductForm = () => {
    setProductForm({
      sku: "",
      name: "",
      brand: "",
      category: "",
      description: "",
      price: "",
      status: "AVAILABLE",
    });
    setProductStock("");
    setProductImages([]);
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const fetchProducts = async () => {
    if (!userId) return;
    setProductsLoading(true);
    setProductsError("");
    try {
      const data = await getProductsBySeller(userId);
      setProducts(data || []);
    } catch (e) {
      setProductsError(e.message || "Failed to fetch products.");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (userId && activeTab === TABS.PRODUCTS) {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab]);

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setProductsError("");

    if (!productForm.sku || !productForm.name || !productForm.price || !productStock) {
      setProductsError("Please fill in all required fields (SKU, Name, Price, Stock).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("product", new Blob([JSON.stringify(productForm)], { type: "application/json" }));
      formData.append("initialStock", productStock);

      for (const img of productImages) {
        formData.append("images", img);
      }

      await addProduct(userId, formData);
      alert("Product added successfully!");
      resetProductForm();
      fetchProducts();
    } catch (e) {
      setProductsError(e.message || "Failed to add product.");
    }
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setProductsError("");

    if (!editingProduct) return;

    try {
      const formData = new FormData();
      formData.append("product", new Blob([JSON.stringify(productForm)], { type: "application/json" }));
      formData.append("newStock", productStock);

      for (const img of productImages) {
        formData.append("images", img);
      }

      await updateProduct(userId, editingProduct.id, formData);
      alert("Product updated successfully!");
      resetProductForm();
      fetchProducts();
    } catch (e) {
      setProductsError(e.message || "Failed to update product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteProduct(userId, productId);
      alert("Product deleted successfully!");
      fetchProducts();
    } catch (e) {
      alert(e.message || "Failed to delete product.");
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      sku: product.sku || "",
      name: product.name || "",
      brand: product.brand || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      status: product.status || "AVAILABLE",
    });
    setProductStock(product.inventory?.quantity?.toString() || "0");
    setProductImages([]);
    setShowAddForm(true);
  };

  // =========================
  // ORDERS
  // =========================
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  const fetchOrders = async () => {
    if (!userId) return;
    setOrdersLoading(true);
    setOrdersError("");
    try {
      const data = await getOrdersBySeller(userId);
      setOrders(data || []);
    } catch (e) {
      setOrdersError(e.message || "Failed to fetch orders.");
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (userId && activeTab === TABS.ORDERS) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab]);

  const handleUpdateShipment = async (orderId, status) => {
    try {
      await updateShipment(orderId, status);
      alert("Shipment status updated!");
      fetchOrders();
    } catch (e) {
      alert(e.message || "Failed to update shipment.");
    }
  };

  // =========================
  // WALLET
  // =========================
  const [balance, setBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const fetchBalance = async () => {
    if (!userId) return;
    setWalletLoading(true);
    try {
      const data = await getSellerBalance(userId);
      setBalance(data || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    if (userId && activeTab === TABS.WALLET) {
      fetchBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, activeTab]);

  const handleWithdraw = async () => {
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      await withdrawFunds(userId, Number(withdrawAmount));
      alert("Withdrawal successful!");
      setWithdrawAmount("");
      fetchBalance();
    } catch (e) {
      alert(e.message || "Withdrawal failed.");
    }
  };

  // ---- Render ----
  return (
    <div className="seller-page">
      <div className="seller-header">
        <div>
          <h1 className="seller-title">Seller Dashboard</h1>
          <div className="seller-subtitle">
            Manage products, orders, and earnings
          </div>
        </div>

        <button
          className="seller-logout-btn"
          onClick={() => {
            localStorage.removeItem("userId");
            localStorage.removeItem("role");
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="seller-tabs">
        {Object.values(TABS).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`seller-tab ${activeTab === tab ? "active" : ""}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === TABS.PRODUCTS && (
        <div className="seller-card">
          <div className="seller-card-header">
            <h2>My Products</h2>
            <button
              className="seller-btn primary"
              onClick={() => {
                resetProductForm();
                setShowAddForm(true);
              }}
            >
              + Add Product
            </button>
          </div>

          {productsError && <div className="seller-error">{productsError}</div>}

          {/* Add/Edit Form */}
          {showAddForm && (
            <form
              className="seller-form"
              onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            >
              <h3>{editingProduct ? "Edit Product" : "Add New Product"}</h3>

              <div className="seller-form-grid">
                <div className="seller-form-group">
                  <label>SKU *</label>
                  <input
                    type="text"
                    name="sku"
                    value={productForm.sku}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={productForm.brand}
                    onChange={handleProductFormChange}
                  />
                </div>

                <div className="seller-form-group">
                  <label>Category</label>
                  <input
                    type="text"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    list="category-suggestions"
                    placeholder="Select or type a category"
                  />
                  <datalist id="category-suggestions">
                    {categorySuggestions.map((cat) => (
                      <option key={cat.id} value={cat.name} />
                    ))}
                  </datalist>
                </div>

                <div className="seller-form-group">
                  <label>Price (RM) *</label>
                  <input
                    type="number"
                    name="price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={productStock}
                    onChange={(e) => setProductStock(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div className="seller-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={productForm.status}
                    onChange={handleProductFormChange}
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </select>
                </div>

                <div className="seller-form-group">
                  <label>Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setProductImages(Array.from(e.target.files))}
                  />
                </div>
              </div>

              <div className="seller-form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  rows="3"
                />
              </div>

              <div className="seller-form-actions">
                <button type="submit" className="seller-btn primary">
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  className="seller-btn secondary"
                  onClick={resetProductForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Products List */}
          {productsLoading && <p>Loading products...</p>}

          {!productsLoading && products.length === 0 && (
            <p className="seller-empty">No products yet. Add your first product!</p>
          )}

          {products.length > 0 && (
            <div className="seller-products-grid">
              {products.map((product) => (
                <div key={product.id} className="seller-product-card">
                  {product.images?.length > 0 && (
                    <img
                      src={`http://localhost:8080/product-images/${product.images[0].fileName}`}
                      alt={product.name}
                      className="seller-product-img"
                    />
                  )}
                  <div className="seller-product-info">
                    <h4>{product.name}</h4>
                    <p className="seller-product-sku">SKU: {product.sku}</p>
                    <p className="seller-product-price">RM {product.price?.toFixed(2)}</p>
                    <span className={`seller-status-badge ${product.status?.toLowerCase()}`}>
                      {product.status}
                    </span>
                  </div>
                  <div className="seller-product-actions">
                    <button
                      className="seller-btn small"
                      onClick={() => startEditProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      className="seller-btn small danger"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === TABS.ORDERS && (
        <div className="seller-card">
          <div className="seller-card-header">
            <h2>Orders to Fulfill</h2>
            <button className="seller-btn secondary" onClick={fetchOrders} disabled={ordersLoading}>
              {ordersLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {ordersError && <div className="seller-error">{ordersError}</div>}

          {!ordersLoading && orders.length === 0 && (
            <p className="seller-empty">No orders yet.</p>
          )}

          {orders.length > 0 && (
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Shipment</th>
                  <th>Customer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderID}>
                    <td title={order.orderID}>{order.orderID?.substring(0, 8)}...</td>
                    <td>{order.product?.name || "-"}</td>
                    <td>{order.quantity}</td>
                    <td>RM {order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`seller-status-badge ${order.paymentStatus?.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={`seller-status-badge ${order.shipmentStatus?.toLowerCase()}`}>
                        {order.shipmentStatus}
                      </span>
                    </td>
                    <td>{order.customer?.email || "-"}</td>
                    <td>
                      <select
                        value={order.shipmentStatus}
                        onChange={(e) => handleUpdateShipment(order.orderID, e.target.value)}
                        className="seller-status-select"
                      >
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === TABS.WALLET && (
        <div className="seller-card">
          <h2>Wallet</h2>

          <div className="seller-wallet-balance">
            <span>Current Balance</span>
            <strong>RM {walletLoading ? "..." : balance.toFixed(2)}</strong>
          </div>

          <div className="seller-wallet-withdraw">
            <h3>Withdraw Funds</h3>
            <div className="seller-withdraw-row">
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Amount to withdraw"
                min="0"
                step="0.01"
              />
              <button className="seller-btn primary" onClick={handleWithdraw}>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SellerDashboard;
