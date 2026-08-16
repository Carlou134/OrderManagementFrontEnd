import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toast } from 'sonner'
import { createQueryWrapper } from '@/test/queryClientWrapper'
import * as productsApi from '@/services/productsApi'
import Products from './Products'

vi.mock('@/services/productsApi')
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

function renderProducts() {
  const Wrapper = createQueryWrapper()
  return render(<Products />, { wrapper: Wrapper })
}

describe('Products page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(productsApi.getProducts).mockResolvedValue({
      items: [{ id: 1, name: 'Wireless Mouse', unitPrice: 25.5 }],
      page: 1,
      pageSize: 10,
      totalCount: 1,
      totalPages: 1,
    })
  })

  it('renders the product list once loaded', async () => {
    renderProducts()

    expect(screen.getByText('Loading products...')).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Wireless Mouse')).toBeInTheDocument())
    expect(screen.getByText('$25.50')).toBeInTheDocument()
  })

  it('shows a validation error instead of submitting when the name is empty', async () => {
    const user = userEvent.setup()
    renderProducts()

    await waitFor(() => expect(screen.getByText('Wireless Mouse')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /new product/i }))
    await user.click(screen.getByRole('button', { name: 'Create' }))

    expect(await screen.findByText('Name is required')).toBeInTheDocument()
    expect(productsApi.createProduct).not.toHaveBeenCalled()
  })

  it('creates a product and closes the dialog on success', async () => {
    const user = userEvent.setup()
    vi.mocked(productsApi.createProduct).mockResolvedValue({
      id: 2,
      name: 'Keyboard',
      unitPrice: 89.99,
    })

    renderProducts()

    await waitFor(() => expect(screen.getByText('Wireless Mouse')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: /new product/i }))
    await user.type(screen.getByLabelText('Name'), 'Keyboard')
    await user.type(screen.getByLabelText('Unit Price'), '89.99')
    await user.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() =>
      expect(productsApi.createProduct).toHaveBeenCalledWith({ name: 'Keyboard', unitPrice: 89.99 })
    )
    expect(toast.success).toHaveBeenCalledWith('Product created successfully')
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
