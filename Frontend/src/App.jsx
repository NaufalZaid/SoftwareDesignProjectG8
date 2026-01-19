
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterCustomer from "./pages/RegisterCustomer";
import RegisterSeller from "./pages/RegisterSeller";
import SellerDashboard from "./pages/SellerDashboard";
import Login from "./pages/TempLogin";
import AddProduct from "./pages/AddProduct";
import ProductList from "./pages/ProductList";
import EditProduct from "./pages/EditProduct";
import Orders from "./pages/Orders";
import UpdateShipment from "./pages/UpdateShipment";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import CustomerDashboard from './pages/CustomerDashboard';
import Login from './pages/TempLogin';
import Cart from './pages/Cart';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/customer" element={<RegisterCustomer />} />
        <Route path="/register/seller" element={<RegisterSeller />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/add-product" element={<AddProduct />} />
        <Route path="/seller/products" element={<ProductList />} />
        <Route path="/seller/products/edit/:productId" element={<EditProduct />} />
        <Route path="/seller/orders" element={<Orders />} />
        <Route path="/seller/orders/:orderId/shipment" element={<UpdateShipment />} />
        <Route path="/customer" element={<CustomerDashboard />} />
        <Route path="/customer/cart" element={<Cart />} />
        <Route path="/customer/orders" element={<MyOrders />} />
        <Route path="/customer/orderDetails" element={<OrderDetails />} />
        <Route path="/login" element={<Login />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;


