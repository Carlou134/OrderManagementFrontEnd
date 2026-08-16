import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { createQueryWrapper } from '@/test/queryClientWrapper'
import * as ordersApi from '@/services/ordersApi'
import { useChangeOrderStatus, useDeleteOrder, useOrders } from './useOrders'

vi.mock('@/services/ordersApi')
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const order = {
  id: 1,
  orderNumber: 'ORD001',
  orderDate: '2026-08-10T00:00:00',
  status: 0,
  finalPrice: 100,
  numberProducts: 1,
  orderProducts: null,
}

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the paged result from getOrders', async () => {
    vi.mocked(ordersApi.getOrders).mockResolvedValue({
      items: [order],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    })

    const { result } = renderHook(() => useOrders({ page: 1 }), { wrapper: createQueryWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.items).toEqual([order])
  })
})

describe('useChangeOrderStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls ChangeOrderStatus with the new status and toasts success', async () => {
    vi.mocked(ordersApi.ChangeOrderStatus).mockResolvedValue({} as never)

    const { result } = renderHook(() => useChangeOrderStatus(), { wrapper: createQueryWrapper() })

    result.current.mutate({ id: 1, status: 2 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(ordersApi.ChangeOrderStatus).toHaveBeenCalledWith(2, 1)
    expect(toast.success).toHaveBeenCalledWith('Order status updated')
  })
})

describe('useDeleteOrder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toasts an error when the delete request fails', async () => {
    vi.mocked(ordersApi.deleteOrder).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useDeleteOrder(), { wrapper: createQueryWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Could not delete order')
  })
})
