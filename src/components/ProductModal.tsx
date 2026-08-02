import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product } from '@/services/api'

export interface OrderProductItem {
  productId: number
  productName: string
  unitPrice: number
  quantity: number
  totalPrice: number
}

interface ProductModalProps {
  open: boolean
  onClose: () => void
  // eslint-disable-next-line no-unused-vars -- interface parameter name, kept for readability
  onSave: (product: OrderProductItem) => void
  products: Product[]
  editingProduct: OrderProductItem | null
}

function ProductModal({ open, onClose, onSave, products, editingProduct }: ProductModalProps) {
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState('1')

  const selectedProduct = products.find((p) => p.id === Number(selectedProductId))

  // Syncs local form state to the editingProduct prop whenever the dialog opens.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) return
    if (editingProduct) {
      setSelectedProductId(String(editingProduct.productId))
      setQuantity(String(editingProduct.quantity))
    } else {
      setSelectedProductId('')
      setQuantity('1')
    }
  }, [open, editingProduct])
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProductId) {
      toast.error('Select a product')
      return
    }

    const qty = parseInt(quantity, 10)
    if (!qty || qty <= 0) {
      toast.error('Quantity must be greater than 0')
      return
    }

    const product = products.find((p) => p.id === Number(selectedProductId))
    if (!product) {
      toast.error('Product not found')
      return
    }

    onSave({
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: qty,
      totalPrice: product.unitPrice * qty,
    })
    setSelectedProductId('')
    setQuantity('1')
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product to Order'}</DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Only the quantity can be changed for a product already in the order.'
                : 'Choose a product from the catalog and set the quantity.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="product-select">Product *</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
                disabled={Boolean(editingProduct)}
              >
                <SelectTrigger id="product-select" className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.name} - ${product.unitPrice.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-qty">Quantity *</Label>
              <Input
                id="product-qty"
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {selectedProduct && (
              <div className="border border-border bg-secondary px-3 py-2 text-sm">
                <span className="font-semibold">Total: </span>$
                {(selectedProduct.unitPrice * Number(quantity || 0)).toFixed(2)}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingProduct ? 'Update' : 'Add Product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductModal
