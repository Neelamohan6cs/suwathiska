import { Routes, Route } from "react-router-dom";

import CustomerLayout from "../layouts/CustomerLayout";
import AdminLayout from "../layouts/AdminLayout";
import ManagerLayout from "../layouts/ManagerLayout";
import DeliveryLayout from "../layouts/DeliveryLayout";

import { ProtectedCustomerRoute } from "../components/common/ProtectedRoute";

import Home from "../pages/customer/Home";
import Products from "../pages/customer/Products";
import ProductDetails from "../pages/customer/ProductDetails";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import OrderSuccess from "../pages/customer/OrderSuccess";
import MyOrders from "../pages/customer/MyOrders";
import OrderDetails from "../pages/customer/OrderDetails";
import OrderTracking from "../pages/customer/OrderTracking";
import Profile from "../pages/customer/Profile";
import Notifications from "../pages/customer/Notifications";
import About from "../pages/customer/About";
import Contact from "../pages/customer/Contact";

import CustomerLogin from "../pages/auth/CustomerLogin";
import CustomerRegister from "../pages/auth/CustomerRegister";
import AdminLogin from "../pages/auth/AdminLogin";
import ManagerLogin from "../pages/auth/ManagerLogin";
import DeliveryLogin from "../pages/auth/DeliveryLogin";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminOrders from "../pages/admin/Orders";
import AdminOrderDetails from "../pages/admin/OrderDetails";
import AdminProducts from "../pages/admin/Products";
import AdminProductForm from "../pages/admin/ProductForm";
import AdminCategories from "../pages/admin/Categories";
import AdminCustomers from "../pages/admin/Customers";
import AdminDelivery from "../pages/admin/Delivery";
import AdminInventory from "../pages/admin/Inventory";
import AdminReports from "../pages/admin/Reports";
import ActiveDeliveries from "../pages/admin/ActiveDeliveries";

import ManagerDashboard from "../pages/manager/Dashboard";
import ManagerProducts from "../pages/manager/Products";
import ManagerProductForm from "../pages/manager/ProductForm";
import ManagerCategories from "../pages/manager/Categories";
import ManagerInventory from "../pages/manager/Inventory";

import DeliveryDashboard from "../pages/delivery/Dashboard";
import DeliveryOrders from "../pages/delivery/Orders";
import DeliveryOrderDetails from "../pages/delivery/OrderDetails";

import NotFound from "../pages/shared/NotFound";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/details/:productId" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route
          path="/my-orders"
          element={
            <ProtectedCustomerRoute>
              <MyOrders />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedCustomerRoute>
              <OrderDetails />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/orders/:orderId/tracking"
          element={
            <ProtectedCustomerRoute>
              <OrderTracking />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedCustomerRoute>
              <Profile />
            </ProtectedCustomerRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedCustomerRoute>
              <Notifications />
            </ProtectedCustomerRoute>
          }
        />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/manager/login" element={<ManagerLogin />} />
      <Route path="/delivery/login" element={<DeliveryLogin />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:orderId" element={<AdminOrderDetails />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:productId/edit" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="delivery" element={<AdminDelivery />} />
        <Route path="active-deliveries" element={<ActiveDeliveries />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reports" element={<AdminReports />} />
      </Route>

      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<ManagerDashboard />} />
        <Route path="products" element={<ManagerProducts />} />
        <Route path="products/new" element={<ManagerProductForm />} />
        <Route path="products/:productId/edit" element={<ManagerProductForm />} />
        <Route path="categories" element={<ManagerCategories />} />
        <Route path="inventory" element={<ManagerInventory />} />
      </Route>

      <Route path="/delivery" element={<DeliveryLayout />}>
        <Route index element={<DeliveryDashboard />} />
        <Route path="orders" element={<DeliveryOrders />} />
        <Route path="orders/:deliveryId" element={<DeliveryOrderDetails />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
