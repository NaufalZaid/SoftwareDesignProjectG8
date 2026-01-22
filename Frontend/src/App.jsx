import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSeller from "./pages/RegisterSeller";
import Login from "./pages/TempLogin";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import CustomerDashboard from "./pages/CustomerDashboard";
import Cart from "./pages/Cart";

// Seller pages
import SellerDashboard from "./pages/SellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import AddProduct from "./pages/AddProduct";
import SellerProducts from "./pages/SellerProducts";

// Product
import ProductDetails from "./pages/ProductDetails";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register/customer" element={<RegisterCustomer />} />
                <Route path="/register/seller" element={<RegisterSeller />} />

                {/* Customer */}
                <Route path="/customer" element={<CustomerDashboard />} />
                <Route path="/customer/cart" element={<Cart />} />
                <Route path="/customer/orders" element={<MyOrders />} />
                <Route
                    path="/customer/orderDetails"
                    element={<OrderDetails />}
                />

                {/* Seller */}
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/profile" element={<SellerProfile />} />
                <Route path="/seller/add-product" element={<AddProduct />} />
                <Route path="/seller/products" element={<SellerProducts />} />

                {/* Product */}
                <Route
                    path="/products/:productId"
                    element={<ProductDetails />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
