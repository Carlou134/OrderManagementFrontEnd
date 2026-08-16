import { memo } from 'react'
import { Pencil, RefreshCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog'
import OrderStatusBadge from './OrderStatusBadge'
import type { Order } from '@/types/order'

function formatDate(dateString: string) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`
}

interface OrderTableRowProps {
  order: Order
  onEdit: (order: Order) => void
  onChangeStatus: (order: Order) => void
  onDelete: (id: number) => void
}

function OrderTableRow({ order, onEdit, onChangeStatus, onDelete }: OrderTableRowProps) {
  const isCompleted = order.status === 2

  return (
    <TableRow>
      <TableCell className="text-muted-foreground">{order.id}</TableCell>
      <TableCell className="font-semibold">{order.orderNumber}</TableCell>
      <TableCell>{formatDate(order.orderDate)}</TableCell>
      <TableCell className="text-center">{order.numberProducts}</TableCell>
      <TableCell className="font-semibold">{formatPrice(order.finalPrice)}</TableCell>
      <TableCell className="text-center">
        <OrderStatusBadge status={order.status} />
      </TableCell>
      <TableCell>
        <div className="flex justify-center gap-1">
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title={isCompleted ? 'Completed orders cannot be edited' : 'Edit'}
            disabled={isCompleted}
            onClick={() => onEdit(order)}
          >
            <Pencil className="size-4" />
          </Button>

          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            title={isCompleted ? 'Completed orders cannot change status' : 'Change status'}
            disabled={isCompleted}
            onClick={() => onChangeStatus(order)}
          >
            <RefreshCcw className="size-4" />
          </Button>

          <ConfirmDeleteDialog
            trigger={
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                title={isCompleted ? 'Completed orders cannot be deleted' : 'Delete'}
                className="text-destructive hover:text-destructive"
                disabled={isCompleted}
              >
                <Trash2 className="size-4" />
              </Button>
            }
            description={`This will delete order ${order.orderNumber}. This action cannot be undone.`}
            onConfirm={() => onDelete(order.id)}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}

export default memo(OrderTableRow)
