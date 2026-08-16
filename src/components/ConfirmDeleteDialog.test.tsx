import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import ConfirmDeleteDialog from './ConfirmDeleteDialog'

describe('ConfirmDeleteDialog', () => {
  it('opens the confirmation dialog and calls onConfirm when accepted', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDeleteDialog
        trigger={<button>Delete</button>}
        description="This will delete order ORD001. This action cannot be undone."
        onConfirm={onConfirm}
      />
    )

    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    expect(
      screen.getByText('This will delete order ORD001. This action cannot be undone.')
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Yes, delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('uses a custom confirm label when provided', async () => {
    const user = userEvent.setup()

    render(
      <ConfirmDeleteDialog
        trigger={<button>Remove</button>}
        description="This will remove Wireless Mouse from the order."
        confirmLabel="Yes, remove"
        onConfirm={() => {}}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Remove' }))
    expect(screen.getByRole('button', { name: 'Yes, remove' })).toBeInTheDocument()
  })

  it('does not call onConfirm when cancelled', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDeleteDialog
        trigger={<button>Delete</button>}
        description="This will delete the product."
        onConfirm={onConfirm}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(onConfirm).not.toHaveBeenCalled()
    expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
  })
})
