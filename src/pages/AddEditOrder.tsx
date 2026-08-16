import { useCallback, useEffect, useState } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import OrderProductRow from '@/components/orders/OrderProductRow'
import ProductModal, { type OrderProductItem } from '@/components/ProductModal'
import { listOrderById, createOrder, updateOrder } from '@/services/ordersApi'
import { getProducts, listProductById } from '@/services/productsApi'
import type { Product } from '@/types/product'
import { orderFormSchema, type OrderFormValues } from '@/schemas/order'

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

  const [orderStatus, setOrderStatus] = useState<number | null>(null)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { orderNumber: '', orderDate: '', orderProducts: [] },
  })
  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: 'orderProducts',
  })
  const orderNumber = useWatch({ control: form.control, name: 'orderNumber' })
  const orderDate = useWatch({ control: form.control, name: 'orderDate' })
  const orderProducts = useWatch({ control: form.control, name: 'orderProducts' })

  const loadAvailableProducts = useCallback(async () => {
    try {
      // This dropdown needs the full catalog, not one page of it — 100 is the backend's
      // max allowed PageSize (ProductQueryValidator), so it stands in for a proper
      // "get all" endpoint until the catalog outgrows it.
      const data = await getProducts({ pageSize: 100 })
      setAvailableProducts(data.items)
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
      form.setValue('orderProducts', enriched)
    },
    [form]
  )

  const loadOrderData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await listOrderById(id)

      form.setValue('orderNumber', data.orderNumber)
      form.setValue('orderDate', formatDateForInput(data.orderDate))
      setOrderStatus(data.status)
      const mappedProducts = (data.orderProducts ?? []).map((p) => ({
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
  }, [id, navigate, enrichProductsWithName, form])

  // Fetches the product catalog once on mount and, in edit mode, the existing order.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    loadAvailableProducts()
  }, [loadAvailableProducts])

  useEffect(() => {
    if (isEditMode) {
      loadOrderData()
    } else {
      form.setValue('orderNumber', generateOrderNumber())
      form.setValue('orderDate', getCurrentDate())
    }
  }, [isEditMode, loadOrderData, form])
  /* eslint-enable react-hooks/set-state-in-effect */

  const isCompleted = isEditMode && orderStatus === 2

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
      update(editingProductIndex, product)
      return
    }

    const exists = orderProducts.find((p) => p.productId === product.productId)
    if (exists) {
      toast.warning('This product is already in the order. Edit it in the table.')
      return
    }

    append(product)
  }

  const handleRemoveProduct = (index: number) => {
    remove(index)
  }

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setLoading(true)

      const orderData = {
        OrderNumber: values.orderNumber,
        Products: values.orderProducts.map((p) => ({
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
  })

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

      {isCompleted && (
        <div className="mb-5 border border-border bg-success px-4 py-2.5 text-sm text-success-foreground">
          This order is completed and can no longer be modified.
        </div>
      )}

      <form noValidate onSubmit={onSubmit}>
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

        <div className="mb-2 flex items-baseline justify-between">
          <h4>Products in this order</h4>
          <Button type="button" variant="outline" onClick={handleAddProduct} disabled={isCompleted}>
            <Plus className="size-4" />
            Add Product
          </Button>
        </div>

        {form.formState.errors.orderProducts && (
          <p className="mb-2 text-sm text-destructive">
            {form.formState.errors.orderProducts.message}
          </p>
        )}

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
              {fields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No products in this order yet. Click &quot;Add Product&quot; to add one.
                  </TableCell>
                </TableRow>
              ) : (
                fields.map((field, index) => (
                  <OrderProductRow
                    key={field.id}
                    product={field}
                    index={index}
                    disabled={isCompleted}
                    onEdit={handleEditProduct}
                    onRemove={handleRemoveProduct}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/my-orders')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || isCompleted}>
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
