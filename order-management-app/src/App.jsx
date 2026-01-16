import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MyOrders from './pages/MyOrders';
import 'bootstrap/dist/css/bootstrap.min.css';


function AddEditOrder() {
  return (
    <div className="container mt-4">
      <h1>Add/Edit Order</h1>
      <p>Vista de crear/editar orden</p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/my-orders" replace />} />
        
        <Route path="/my-orders" element={<MyOrders />} />
        
        <Route path="/add-order" element={<AddEditOrder />} />
        
        <Route path="/add-order/:id" element={<AddEditOrder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;