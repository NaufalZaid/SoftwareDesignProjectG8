
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSeller from "./pages/RegisterSeller";
import Login from "./pages/TempLogin";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import CustomerDashboard from './pages/CustomerDashboard';
import Cart from './pages/Cart';
import ProductDetails from "./pages/ProductDetails";
import AdminDashboard from "./pages/AdminDashboard";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/register/seller" element={<RegisterSeller />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/orders" element={<MyOrders />} />
        <Route path="/customer/orderDetails" element={<OrderDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/admin" element={<AdminDashboard />} />        

      </Routes>
    </BrowserRouter>
  );
}

export default App;


