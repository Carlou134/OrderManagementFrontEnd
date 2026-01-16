import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, deleteOrder } from '../services/api';
import Swal from 'sweetalert2';

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadOrders();
    }
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las órdenes.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, orderNumber) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la orden ${orderNumber}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteOrder(id);
        
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'La orden ha sido eliminada correctamente',
          timer: 2000,
          showConfirmButton: false
        });

        loadOrders();
      } catch (error) {
        console.error('Error al eliminar:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar la orden'
        });
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/add-order/${id}`);
  };

  const handleAddNew = () => {
    navigate('/add-order');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };


  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando órdenes...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0">My Orders</h1>
            <button 
              className="btn btn-primary"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Add New Order
            </button>
          </div>
          <hr className="mt-3" />
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Order #</th>
                  <th scope="col">Date</th>
                  <th scope="col"># Products</th>
                  <th scope="col">Final Price</th>
                  <th scope="col" className="text-center">Options</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
                        <p className="mt-3 mb-0">No hay órdenes registradas</p>
                        <small>Haz clic en "Add New Order" para crear una</small>
                      </div>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <strong>{order.orderNumber}</strong>
                      </td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td className="text-center">
                        {order.numberProducts}
                      </td>
                      <td>
                        <strong className="text-success">
                          {formatPrice(order.finalPrice)}
                        </strong>
                      </td>
                      <td className="text-center">
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleEdit(order.id)}
                            title="Edit Order"
                          >
                            <i className="bi bi-pencil-square"></i> Edit
                          </button>
                          
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(order.id, order.orderNumber)}
                            title="Delete Order"
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrders;