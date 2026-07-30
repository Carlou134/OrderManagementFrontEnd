import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MyOrders from './pages/MyOrders';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/Navbar';
import AddEditOrder from './pages/AddEditOrder';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      
      <div className="container-fluid mt-4">
        <Routes>
          <Route path="/" element={<Navigate to="/my-orders" replace />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/add-order" element={<AddEditOrder />} />
          <Route path="/add-order/:id" element={<AddEditOrder />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;