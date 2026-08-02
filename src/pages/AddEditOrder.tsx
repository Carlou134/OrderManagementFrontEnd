import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import ProductModal, { type OrderProductItem } from '@/components/ProductModal'
import {
  getProducts,
  listOrderById,
  createOrder,
  updateOrder,
  listProductById,
  type Product,
} from '@/services/api'

function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-6)
  return `ORD${timestamp}`
}

function getCurrentDate() {
  return new Date().toISOString().split('T')[0]
}

function formatDateForInput(dateString: string) {
  return new Date(dateString).toISOString().split('T')[0]
}

function AddEditOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const [orderNumber, setOrderNumber] = useState('')
  const [orderDate, setOrderDate] = useState('')
  const [orderProducts, setOrderProducts] = useState<OrderProductItem[]>([])

  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const loadAvailableProducts = useCallback(async () => {
    try {
      const data = await getProducts()
      setAvailableProducts(data)
    } catch (error) {
      console.error('Error loading products:', error)
      toast.error('Could not load products')
    }
  }, [])

  const enrichProductsWithName = useCallback(
    async (products: Omit<OrderProductItem, 'productName'>[]) => {
      const enriched = await Promise.all(
        products.map(async (p) => {
          const product = await listProductById(p.productId)
          return { ...p, productName: product.name }
        })
      )
      setOrderProducts(enriched)
    },
    []
  )

  const loadOrderData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await listOrderById(id)

      setOrderNumber(data.orderNumber)
      setOrderDate(formatDateForInput(data.orderDate))
      const mappedProducts = data.orderProducts.map((p) => ({
        productId: p.productId,
        quantity: p.quantity,
        unitPrice: Number(p.unitPrice),
        totalPrice: Number(p.totalPrice),
      }))

      await enrichProductsWithName(mappedProducts)
    } catch (error) {
      console.error('Error loading order:', error)
      toast.error('Could not load the order')
      navigate('/my-orders')
    } finally {
      setLoading(false)
    }
  }, [id, navigate, enrichProductsWithName])

  // Fetches the product catalog once on mount and, in edit mode, the existing order.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadAvailableProducts()
  }, [loadAvailableProducts])

  useEffect(() => {
    if (isEditMode) {
      loadOrderData()
    } else {
      setOrderNumber(generateOrderNumber())
      setOrderDate(getCurrentDate())
    }
  }, [isEditMode, loadOrderData])
  /* eslint-enable react-hooks/set-state-in-effect */

  const calculateTotalProducts = () => orderProducts.reduce((sum, p) => sum + p.quantity, 0)
  const calculateFinalPrice = () => orderProducts.reduce((sum, p) => sum + p.totalPrice, 0)

  const handleAddProduct = () => {
    setEditingProductIndex(null)
    setShowModal(true)
  }

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index)
    setShowModal(true)
  }

  const handleSaveProduct = (product: OrderProductItem) => {
    if (editingProductIndex !== null) {
      const updated = [...orderProducts]
      updated[editingProductIndex] = product
      setOrderProducts(updated)
      return
    }

    const exists = orderProducts.find((p) => p.productId === product.productId)
    if (exists) {
      toast.warning('This product is already in the order. Edit it in the table.')
      return
    }

    setOrderProducts([...orderProducts, product])
  }

  const handleRemoveProduct = (index: number) => {
    setOrderProducts(orderProducts.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (orderProducts.length === 0) {
      toast.error('You must add at least one product')
      return
    }

    try {
      setLoading(true)

      const orderData = {
        OrderNumber: orderNumber,
        Products: orderProducts.map((p) => ({
          ProductId: p.productId,
          Quantity: p.quantity,
        })),
      }

      if (isEditMode && id) {
        await updateOrder(id, orderData)
        toast.success('Order updated successfully')
      } else {
        await createOrder(orderData)
        toast.success('Order created successfully')
      }

      navigate('/my-orders')
    } catch (error) {
      console.error('Error saving order:', error)
      toast.error('Could not save the order')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditMode) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <Loader2 className="size-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h2 className="mb-5">{isEditMode ? 'Edit Order' : 'Add Order'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-6 grid grid-cols-2 border border-border bg-card sm:grid-cols-4">
          <div className="border-r border-border p-4">
            <Label>Order #</Label>
            <Input className="mt-1.5" value={orderNumber} readOnly disabled />
          </div>
          <div className="border-r border-border p-4">
            <Label>Date</Label>
            <Input className="mt-1.5" value={orderDate} readOnly disabled />
          </div>
          <div className="border-r border-border p-4">
            <Label># Products</Label>
            <Input className="mt-1.5" value={calculateTotalProducts()} readOnly disabled />
          </div>
          <div className="p-4">
            <Label>Final Price</Label>
            <Input
              className="mt-1.5"
              value={`$${calculateFinalPrice().toFixed(2)}`}
              readOnly
              disabled
            />
          </div>
        </div>

        <div className="mb-4 flex items-baseline justify-between">
          <h4>Products in this order</h4>
          <Button type="button" variant="outline" onClick={handleAddProduct}>
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>

        <div className="mb-6 border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead className="text-center">Options</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No products in this order yet. Click &quot;Add Product&quot; to add one.
                  </TableCell>
                </TableRow>
              ) : (
                orderProducts.map((product, index) => (
                  <TableRow key={`${product.productId}-${index}`}>
                    <TableCell className="text-muted-foreground">{product.productId}</TableCell>
                    <TableCell className="font-semibold">{product.productName}</TableCell>
                    <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
                    <TableCell>{product.quantity}</TableCell>
                    <TableCell className="font-semibold">
                      ${product.totalPrice.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Edit quantity"
                          onClick={() => handleEditProduct(index)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon-sm"
                              variant="ghost"
                              title="Remove"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove {product.productName} from the order.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveProduct(index)}>
                                Yes, remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/my-orders')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : isEditMode ? 'Update Order' : 'Create Order'}
          </Button>
        </div>
      </form>

      <ProductModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveProduct}
        products={availableProducts}
        editingProduct={editingProductIndex !== null ? orderProducts[editingProductIndex] : null}
      />
    </div>
  )
}

export default AddEditOrder
