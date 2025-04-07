import { BrowserRouter as Router, Routes, Navigate, Route, Link } from "react-router-dom";
import './App.css'
import SupplierOrder from './components/SupplierOrder'
import OrderStatusPage from './components/OrderStatusPage'
import UpdateMinimalMerchandise from './components/UpdateMinimalMerchandise';

function App() {

  return (

    <Router>
      <nav >
        <Link to="/orderstatuspage" style={{ marginRight: '10px' }}>Order Status Page</Link>
        <Link to="/ordersupplies">Supplier Order Page</Link>
        <Link to="/updateminimalamounts"> Update Minimal Merchandise</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/orderstatuspage" replace />} />
        <Route path="/orderstatuspage" element={<OrderStatusPage />} />
        <Route path="/ordersupplies" element={<SupplierOrder />} />
        <Route path="/updateminimalamounts" element={<UpdateMinimalMerchandise />} />
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App
