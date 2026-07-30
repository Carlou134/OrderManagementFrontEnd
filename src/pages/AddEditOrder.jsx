import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { 
  getProducts, 
  listOrderById, 
  createOrder, 
  updateOrder, 
  listProductById
} from '../services/api';
import ProductModal from '../components/ProductModal';
import Swal from 'sweetalert2';

function AddEditOrder() {
  const [orderFromApi, setOrderFromApi] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderProducts, setOrderProducts] = useState([]);

  const [availableProducts, setAvailableProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAvailableProducts();
  }, []);

    const loadOrderData = useCallback(async () => {
      try {
        setLoading(true);
        const data = await listOrderById(id);

        setOrderNumber(data.orderNumber);
        setOrderDate(formatDateForInput(data.orderDate));
        const mappedProducts = data.orderProducts.map(p => ({
          productId: p.productId,
          quantity: p.quantity,
          unitPrice: Number(p.unitPrice),
          totalPrice: Number(p.totalPrice),
          productName: ''
        }));

        await enrichProductsWithName(mappedProducts);


        setOrderFromApi(data);
      } catch (error) {
        console.error('Error loading order:', error);
        Swal.fire('Error', 'Could not load the order', 'error');
        navigate('/my-orders');
      } finally {
        setLoading(false);
      }
    }, [id, navigate]);


    useEffect(() => {
      if (isEditMode) {
        loadOrderData();
      } else {
        generateOrderNumber();
        setOrderDate(getCurrentDate());
      }
    }, [isEditMode, loadOrderData]);


    useEffect(() => {
      if (!orderFromApi?.OrderProducts) return;

      const mappedProducts = orderFromApi.OrderProducts.map(p => ({
        productId: p.ProductId,
        productName: '', 
        unitPrice: Number(p.UnitPrice),
        quantity: p.Quantity,
        totalPrice: Number(p.TotalPrice)
      }));

      setOrderProducts(mappedProducts);
    }, [orderFromApi]);

  const enrichProductsWithName = async (products) => {
  const enriched = await Promise.all(
    products.map(async (p) => {
      const product = await listProductById(p.productId);

      return {
        ...p,
        productName: product.name
      };
    })
  );

  setOrderProducts(enriched);
};


  const loadAvailableProducts = async () => {
    try {
      const data = await getProducts();
      setAvailableProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      Swal.fire('Error', 'Could not load products', 'error');
    }
  };


  const generateOrderNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setOrderNumber(`ORD${timestamp}`); // ORD123456 → 9 chars
  };

  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const formatDateForInput = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  const calculateTotalProducts = () => {
    return orderProducts.reduce((sum, p) => sum + p.quantity, 0);
  };

  const calculateFinalPrice = () => {
    return orderProducts.reduce((sum, p) => sum + p.totalPrice, 0);
  };

  const handleAddProduct = () => {
    setEditingProductIndex(null);
    setShowModal(true);
  };

  const handleEditProduct = (index) => {
    setEditingProductIndex(index);
    setShowModal(true);
  };

  const handleSaveProduct = (product) => {
    if (editingProductIndex !== null) {
      const updated = [...orderProducts];
      updated[editingProductIndex] = product;
      setOrderProducts(updated);
    } else {
      const exists = orderProducts.find(p => p.productId === product.productId);
      
      if (exists) {
        Swal.fire('Warning', 'This product is already in the order. Edit it in the table.', 'warning');
        return;
      }
      
      setOrderProducts([...orderProducts, product]);
    }
  };

  const handleRemoveProduct = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will remove this product from the order',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = orderProducts.filter((_, i) => i !== index);
        setOrderProducts(updated);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (orderProducts.length === 0) {
      Swal.fire('Error', 'You must add at least one product', 'error');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        OrderNumber: orderNumber,
        Products: orderProducts.map(p => ({
          ProductId: p.productId,
          Quantity: p.quantity
        }))
      };

      if (isEditMode) {
        await updateOrder(id, orderData);
        Swal.fire('Success', 'Order updated successfully', 'success');
      } else {
        await createOrder(orderData);
        Swal.fire('Success', 'Order created successfully', 'success');
      }

      navigate('/my-orders');
    } catch (error) {
      console.error('Error saving order:', error);
      Swal.fire('Error', 'Could not save the order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1>{isEditMode ? 'Edit Order' : 'Add Order'}</h1>
          <hr />
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Order Information</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Order #</label>
                  <input
                    type="text"
                    className="form-control"
                    value={orderNumber}
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={orderDate}
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label"># Products</label>
                  <input
                    type="number"
                    className="form-control"
                    value={calculateTotalProducts()}
                    readOnly
                    disabled
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Final Price</label>
                  <input
                    type="text"
                    className="form-control"
                    value={`$${calculateFinalPrice().toFixed(2)}`}
                    readOnly
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Products</h5>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={handleAddProduct}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Add Product
                </button>
              </div>
              <div className="card-body">
                {orderProducts.length === 0 ? (
                  <div className="alert alert-info">
                    No products in this order yet. Click "Add Product" to add one.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Unit Price</th>
                          <th>Qty</th>
                          <th>Total Price</th>
                          <th className="text-center">Options</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderProducts.map((product, index) => (
                          <tr key={index}>
                            <td>{product.productId}</td>
                            <td>{product.productName}</td>
                            <td>${product.unitPrice.toFixed(2)}</td>
                            <td>{product.quantity}</td>
                            <td><strong>${product.totalPrice.toFixed(2)}</strong></td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => handleEditProduct(index)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => handleRemoveProduct(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <button
              type="button"
              className="btn btn-secondary me-2"
              onClick={() => navigate('/my-orders')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </div>
      </form>

      <ProductModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        products={availableProducts}
        editingProduct={editingProductIndex !== null ? orderProducts[editingProductIndex] : null}
      />
    </div>
  );
}

export default AddEditOrder;