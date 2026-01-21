
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSeller from "./pages/RegisterSeller";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import SellerDashboard from "./pages/SellerDashboard";
import SellerProfile from "./pages/SellerProfile";
import AddProduct from "./pages/AddProduct";
import SellerProducts from "./pages/SellerProducts";




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/register/seller" element={<RegisterSeller />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/checkout" element={<Checkout />} />
        <Route path="/customer/orders" element={<MyOrders />} />
        <Route path="/customer/orderDetails" element={<OrderDetails />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/products" element={<SellerProducts />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;


