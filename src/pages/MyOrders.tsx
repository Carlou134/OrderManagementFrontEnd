import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
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
import PaginationFooter from '@/components/PaginationFooter'
import OrderTableRow from '@/components/orders/OrderTableRow'
import { useOrders, useDeleteOrder, useChangeOrderStatus } from '@/hooks/useOrders'
import type { Order } from '@/types/order'

const STATUS_OPTIONS = [
  { value: '0', label: 'Pending' },
  { value: '1', label: 'In Progress' },
  { value: '2', label: 'Completed' },
]

function MyOrders() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [statusTarget, setStatusTarget] = useState<Order | null>(null)
  const [newStatus, setNewStatus] = useState('0')

  const { data, isLoading, isError, refetch } = useOrders({ page })

  const orders = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  const deleteMutation = useDeleteOrder()
  const statusMutation = useChangeOrderStatus()

  const handleEdit = useCallback(
    (order: Order) => navigate(`/add-order/${order.id}`),
    [navigate]
  )

  const handleChangeStatus = useCallback((order: Order) => {
    setStatusTarget(order)
    setNewStatus(String(order.status))
  }, [])

  const handleDelete = useCallback((id: number) => deleteMutation.mutate(id), [deleteMutation])

  const handleConfirmStatusChange = () => {
    if (!statusTarget) return
    statusMutation.mutate(
      { id: statusTarget.id, status: Number(newStatus) },
      { onSuccess: () => setStatusTarget(null) }
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-primary" />
          <p className="mt-3 text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Could not load orders.</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-baseline justify-between">
        <h2>My Orders</h2>
        <Button onClick={() => navigate('/add-order')}>
          <Plus className="size-4" />
          New Order
        </Button>
      </div>

      <div className="border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center"># Products</TableHead>
              <TableHead>Final Price</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center">
                  <Inbox className="mx-auto size-10 text-muted-foreground" />
                  <p className="mt-3 mb-0 text-muted-foreground">No orders found</p>
                  <p className="text-sm text-muted-foreground">
                    Click &quot;New Order&quot; to create one
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  onEdit={handleEdit}
                  onChangeStatus={handleChangeStatus}
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
          itemLabel="orders"
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
        />
      </div>

      <Dialog open={statusTarget !== null} onOpenChange={(open) => !open && setStatusTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Order Status</DialogTitle>
            <DialogDescription>
              Select the new status for order {statusTarget?.orderNumber}.
            </DialogDescription>
          </DialogHeader>

          <Select value={newStatus} onValueChange={setNewStatus}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange} disabled={statusMutation.isPending}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MyOrders
