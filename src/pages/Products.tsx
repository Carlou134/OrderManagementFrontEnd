import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronLeft, ChevronRight, Loader2, Package, Pencil, Plus, Trash2 } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useProducts'
import type { Product } from '@/types/product'

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

function Products() {
  const [page, setPage] = useState(1)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createPrice, setCreatePrice] = useState('')

  const { data, isLoading, isError, refetch } = useProducts({ page })

  const products = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useDeleteProduct()
  const updateMutation = useUpdateProduct()
  const createMutation = useCreateProduct()

  const openEditDialog = (product: Product) => {
    setEditTarget(product)
    setEditName(product.name)
    setEditPrice(String(product.unitPrice))
  }

  const handleConfirmUpdate = () => {
    if (!editTarget) return
    const unitPrice = Number(editPrice)
    if (!editName.trim() || Number.isNaN(unitPrice) || unitPrice <= 0) {
      toast.error('Check the product name and price')
      return
    }
    updateMutation.mutate(
      { id: editTarget.id, name: editName.trim(), unitPrice },
      { onSuccess: () => setEditTarget(null) }
    )
  }

  const openCreateDialog = () => {
    setCreateName('')
    setCreatePrice('')
    setShowCreateDialog(true)
  }

  const handleConfirmCreate = () => {
    const unitPrice = Number(createPrice)
    if (!createName.trim() || Number.isNaN(unitPrice) || unitPrice <= 0) {
      toast.error('Check the product name and price')
      return
    }
    createMutation.mutate(
      { name: createName.trim(), unitPrice },
      { onSuccess: () => setShowCreateDialog(false) }
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Could not load products.</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 flex items-baseline justify-between">
        <h2>Products</h2>
        <Button onClick={openCreateDialog}>
          <Plus className="size-4" />
          New Product
        </Button>
      </div>

      <div className="border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Unit Price</TableHead>
              <TableHead className="text-center">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center">
                  <Package className="mx-auto size-10 text-muted-foreground" />
                  <p className="mt-3 mb-0 text-muted-foreground">No products found</p>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="text-muted-foreground">{product.id}</TableCell>
                  <TableCell className="font-semibold">{product.name}</TableCell>
                  <TableCell>{formatPrice(product.unitPrice)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        title="Update"
                        onClick={() => openEditDialog(product)}
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            title="Delete"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete product {product.name}. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteMutation.mutate(product.id)}>
                              Yes, delete
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

        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="text-xs text-muted-foreground">
            Page {data?.page ?? page} of {totalPages} · {data?.totalCount ?? 0} products
          </span>
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Product</DialogTitle>
            <DialogDescription>Edit the product&apos;s name and price.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="product-name">Name</Label>
              <Input id="product-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="product-price">Unit Price</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={updateMutation.isPending}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Product</DialogTitle>
            <DialogDescription>Set the name and price for the new product.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="create-product-name">Name</Label>
              <Input
                id="create-product-name"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="create-product-price">Unit Price</Label>
              <Input
                id="create-product-price"
                type="number"
                min="0"
                step="0.01"
                value={createPrice}
                onChange={(e) => setCreatePrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate} disabled={createMutation.isPending}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Products
