import { memo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import type { OrderProductItem } from '@/components/ProductModal'

interface OrderProductRowProps {
  product: OrderProductItem
  index: number
  disabled: boolean
  onEdit: (index: number) => void
  onRemove: (index: number) => void
}

function OrderProductRow({ product, index, disabled, onEdit, onRemove }: OrderProductRowProps) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{product.productId}</TableCell>
      <TableCell className="font-semibold">{product.productName}</TableCell>
      <TableCell>${product.unitPrice.toFixed(2)}</TableCell>
      <TableCell>{product.quantity}</TableCell>
      <TableCell className="font-semibold">${product.totalPrice.toFixed(2)}</TableCell>
      <TableCell>
        <div className="flex justify-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title="Edit quantity"
            disabled={disabled}
            onClick={() => onEdit(index)}
          >
            <Pencil className="size-4" />
          </Button>
          <ConfirmDeleteDialog
            trigger={
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                title="Remove"
                className="text-destructive hover:text-destructive"
                disabled={disabled}
              >
                <Trash2 className="size-4" />
              </Button>
            }
            description={`This will remove ${product.productName} from the order.`}
            confirmLabel="Yes, remove"
            onConfirm={() => onRemove(index)}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default memo(OrderProductRow)
