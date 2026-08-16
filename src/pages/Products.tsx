import { useCallback, useState } from 'react'
import { Loader2, Package, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import PaginationFooter from '@/components/PaginationFooter'
import ProductTableRow from '@/components/products/ProductTableRow'
import ProductFormDialog from '@/components/products/ProductFormDialog'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '@/hooks/useProducts'
import type { Product } from '@/types/product'
import type { ProductFormValues } from '@/schemas/product'

function Products() {
  const [page, setPage] = useState(1)
  const [editTarget, setEditTarget] = useState<Product | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const { data, isLoading, isError, refetch } = useProducts({ page })

  const products = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useDeleteProduct()
  const updateMutation = useUpdateProduct()
  const createMutation = useCreateProduct()

  const handleEdit = useCallback((product: Product) => setEditTarget(product), [])
  const handleDelete = useCallback((id: number) => deleteMutation.mutate(id), [deleteMutation])

  const handleCreate = (values: ProductFormValues) => {
    createMutation.mutate(values, { onSuccess: () => setShowCreateDialog(false) })
  }

  const handleUpdate = (values: ProductFormValues) => {
    if (!editTarget) return
    updateMutation.mutate({ id: editTarget.id, ...values }, { onSuccess: () => setEditTarget(null) })
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
        <Button onClick={() => setShowCreateDialog(true)}>
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
                <ProductTableRow
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </TableBody>
        </Table>

        <PaginationFooter
          page={data?.page ?? page}
          totalPages={totalPages}
          totalCount={data?.totalCount ?? 0}
          itemLabel="products"
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      <ProductFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        title="New Product"
        description="Set the name and price for the new product."
        submitLabel="Create"
        isPending={createMutation.isPending}
        onSubmit={handleCreate}
      />

      <ProductFormDialog
        open={editTarget !== null}
        onOpenChange={(open) => !open && setEditTarget(null)}
        title="Update Product"
        description="Edit the product's name and price."
        submitLabel="Update"
        isPending={updateMutation.isPending}
        defaultValues={editTarget ? { name: editTarget.name, unitPrice: editTarget.unitPrice } : undefined}
        onSubmit={handleUpdate}
      />
    </div>
  )
}

export default Products
