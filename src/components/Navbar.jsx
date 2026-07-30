import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/my-orders">
          <i className="bi bi-cart-check me-2"></i>
          Order Management
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/my-orders')}`} 
                to="/my-orders"
              >
                <i className="bi bi-list-ul me-1"></i>
                My Orders
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/add-order')}`} 
                to="/add-order"
              >
                <i className="bi bi-plus-circle me-1"></i>
                Add Order
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;