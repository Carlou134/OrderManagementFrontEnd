import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Inbox, Loader2, Pencil, Plus, RefreshCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getOrders, deleteOrder, ChangeOrderStatus, type OrderListItem } from '@/services/api'

const STATUS_OPTIONS = [
  { value: '0', label: 'Pending' },
  { value: '1', label: 'In Progress' },
  { value: '2', label: 'Completed' },
]

function getStatusInfo(status: number) {
  switch (status) {
    case 0:
      return { text: 'Pending', className: 'bg-[#f8f4f4] text-[#444141]', dot: '#7d7979' }
    case 1:
      return { text: 'In Progress', className: 'bg-[#fff2ef] text-[#7c1405]', dot: '#ae1800' }
    case 2:
      return { text: 'Completed', className: 'bg-success text-success-foreground', dot: '#2f7d47' }
    default:
      return { text: 'Unknown', className: 'bg-muted text-muted-foreground', dot: '#9b9797' }
  }
}

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

function MyOrders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusTarget, setStatusTarget] = useState<OrderListItem | null>(null)
  const [newStatus, setNewStatus] = useState('0')

  const {
    data: orders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success('Order deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      console.error('Error deleting order:', error)
      toast.error('Could not delete order')
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => ChangeOrderStatus(status, id),
    onSuccess: () => {
      toast.success('Order status updated')
      setStatusTarget(null)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      console.error('Error changing status:', error)
      toast.error('Could not update order status')
    },
  })

  const openStatusDialog = (order: OrderListItem) => {
    setStatusTarget(order)
    setNewStatus(String(order.status))
  }

  const handleConfirmStatusChange = () => {
    if (!statusTarget) return
    statusMutation.mutate({ id: statusTarget.id, status: Number(newStatus) })
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
              orders.map((order) => {
                const statusInfo = getStatusInfo(order.status)
                return (
                  <TableRow key={order.id}>
                    <TableCell className="text-muted-foreground">{order.id}</TableCell>
                    <TableCell className="font-semibold">{order.orderNumber}</TableCell>
                    <TableCell>{formatDate(order.orderDate)}</TableCell>
                    <TableCell className="text-center">{order.numberProducts}</TableCell>
                    <TableCell className="font-semibold">{formatPrice(order.finalPrice)}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={statusInfo.className}>
                        <span
                          className="size-1.5 rounded-full"
                          style={{ backgroundColor: statusInfo.dot }}
                        />
                        {statusInfo.text}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Edit"
                          onClick={() => navigate(`/add-order/${order.id}`)}
                        >
                          <Pencil className="size-4" />
                        </Button>

                        <Button
                          size="icon-sm"
                          variant="ghost"
                          title="Change status"
                          onClick={() => openStatusDialog(order)}
                        >
                          <RefreshCcw className="size-4" />
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
                                This will delete order {order.orderNumber}. This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteMutation.mutate(order.id)}>
                                Yes, delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
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
