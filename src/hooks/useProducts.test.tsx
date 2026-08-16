import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { createQueryWrapper } from '@/test/queryClientWrapper'
import * as productsApi from '@/services/productsApi'
import { useCreateProduct, useDeleteProduct, useProducts } from './useProducts'

vi.mock('@/services/productsApi')
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the paged result from getProducts', async () => {
    vi.mocked(productsApi.getProducts).mockResolvedValue({
      items: [{ id: 1, name: 'Wireless Mouse', unitPrice: 25.5 }],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    })

    const { result } = renderHook(() => useProducts({ page: 1 }), {
      wrapper: createQueryWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.items).toHaveLength(1)
    expect(productsApi.getProducts).toHaveBeenCalledWith({ page: 1 })
  })
})

describe('useCreateProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toasts success and creates the product on success', async () => {
    vi.mocked(productsApi.createProduct).mockResolvedValue({ id: 2, name: 'Keyboard', unitPrice: 89.99 })

    const { result } = renderHook(() => useCreateProduct(), { wrapper: createQueryWrapper() })

    result.current.mutate({ name: 'Keyboard', unitPrice: 89.99 })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(productsApi.createProduct).toHaveBeenCalledWith({ name: 'Keyboard', unitPrice: 89.99 })
    expect(toast.success).toHaveBeenCalledWith('Product created successfully')
  })
})

describe('useDeleteProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toasts an error when the delete request fails', async () => {
    vi.mocked(productsApi.deleteProduct).mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useDeleteProduct(), { wrapper: createQueryWrapper() })

    result.current.mutate(1)

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(toast.error).toHaveBeenCalledWith('Could not delete product')
  })
})
