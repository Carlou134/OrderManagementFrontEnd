import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getOrders, deleteOrder, ChangeOrderStatus } from '@/services/ordersApi'
import type { OrderQueryParams } from '@/types/order'

export function useOrders(params: OrderQueryParams = {}) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => getOrders(params),
    placeholderData: keepPreviousData,
  })
}

export function useDeleteOrder() {
  const queryClient = useQueryClient()

  return useMutation({
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
}

export function useChangeOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: number }) => ChangeOrderStatus(status, id),
    onSuccess: () => {
      toast.success('Order status updated')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
    onError: (error) => {
      console.error('Error changing status:', error)
      toast.error('Could not update order status')
    },
  })
}
