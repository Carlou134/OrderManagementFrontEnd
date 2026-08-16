import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { productFormSchema, type ProductFormValues } from '@/schemas/product'

const EMPTY_VALUES: ProductFormValues = { name: '', unitPrice: 0 }

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  submitLabel: string
  isPending: boolean
  defaultValues?: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
}

function ProductFormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  isPending,
  defaultValues,
  onSubmit,
}: ProductFormDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  })

  useEffect(() => {
    if (open) form.reset(defaultValues ?? EMPTY_VALUES)
  }, [open, defaultValues, form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="product-name">Name</Label>
              <Input id="product-name" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="product-price">Unit Price</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                {...form.register('unitPrice', { valueAsNumber: true })}
              />
              {form.formState.errors.unitPrice && (
                <p className="text-xs text-destructive">{form.formState.errors.unitPrice.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProductFormDialog
