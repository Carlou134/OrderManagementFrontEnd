import { memo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import type { Product } from '@/types/product'

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

interface ProductTableRowProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: number) => void
}

function ProductTableRow({ product, onEdit, onDelete }: ProductTableRowProps) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{product.id}</TableCell>
      <TableCell className="font-semibold">{product.name}</TableCell>
      <TableCell>{formatPrice(product.unitPrice)}</TableCell>
      <TableCell className="text-center">
        <div className="flex justify-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title="Update"
            onClick={() => onEdit(product)}
          >
            <Pencil className="size-4" />
          </Button>

          <ConfirmDeleteDialog
            trigger={
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                title="Delete"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            }
            description={`This will delete product ${product.name}. This action cannot be undone.`}
            onConfirm={() => onDelete(product.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default memo(ProductTableRow)
