import { useState } from 'react';
import Swal from 'sweetalert2';

function ProductModal({ show, onClose, onSave, products, editingProduct }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedProductId) {
      Swal.fire('Error', 'Selecciona un producto', 'error');
      return;
    }

    if (quantity <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProductId));

    if (!product) {
      Swal.fire('Error', 'Producto no encontrado', 'error');
      return;
    }

    const orderProduct = {
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: parseInt(quantity),
      totalPrice: product.unitPrice * parseInt(quantity)
    };

    onSave(orderProduct);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {editingProduct ? 'Edit Product' : 'Add Product to Order'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Product *</label>
                <select
                  className="form-select"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  disabled={editingProduct}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ${product.unitPrice.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  required
                />
              </div>

              {selectedProductId && (
                <div className="alert alert-info">
                  <strong>Total: </strong>
                  ${(products.find(p => p.id === parseInt(selectedProductId))?.unitPrice * quantity).toFixed(2)}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;