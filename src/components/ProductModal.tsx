import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import type { Product } from '@/types/product'
import { orderProductFormSchema, type OrderProductFormValues } from '@/schemas/orderProduct'

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
  onSave: (product: OrderProductItem) => void
  products: Product[]
  editingProduct: OrderProductItem | null
}

function ProductModal({ open, onClose, onSave, products, editingProduct }: ProductModalProps) {
  const form = useForm<OrderProductFormValues>({
    resolver: zodResolver(orderProductFormSchema),
    defaultValues: { productId: 0, quantity: 1 },
  })

  // Syncs the form to the editingProduct prop whenever the dialog opens.
  useEffect(() => {
    if (!open) return
    if (editingProduct) {
      form.reset({ productId: editingProduct.productId, quantity: editingProduct.quantity })
    } else {
      form.reset({ productId: 0, quantity: 1 })
    }
  }, [open, editingProduct, form])

  const selectedProductId = useWatch({ control: form.control, name: 'productId' })
  const quantity = useWatch({ control: form.control, name: 'quantity' })
  const selectedProduct = products.find((p) => p.id === selectedProductId)

  const handleOpenChange = (next: boolean) => {
    if (!next) onClose()
  }

  const onSubmit = (values: OrderProductFormValues) => {
    const product = products.find((p) => p.id === values.productId)
    if (!product) {
      toast.error('Product not found')
      return
    }

    onSave({
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: values.quantity,
      totalPrice: product.unitPrice * values.quantity,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
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
              <Controller
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={(value) => field.onChange(Number(value))}
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
                )}
              />
              {form.formState.errors.productId && (
                <p className="text-xs text-destructive">{form.formState.errors.productId.message}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="product-qty">Quantity *</Label>
              <Input
                id="product-qty"
                type="number"
                min="1"
                {...form.register('quantity', { valueAsNumber: true })}
              />
              {form.formState.errors.quantity && (
                <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            {selectedProduct && (
              <div className="border border-border bg-secondary px-3 py-2 text-sm">
                <span className="font-semibold">Total: </span>$
                {(selectedProduct.unitPrice * (quantity || 0)).toFixed(2)}
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
