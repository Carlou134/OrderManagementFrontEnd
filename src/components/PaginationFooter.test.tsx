import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import PaginationFooter from './PaginationFooter'

describe('PaginationFooter', () => {
  it('shows the page summary', () => {
    render(
      <PaginationFooter
        page={2}
        totalPages={5}
        totalCount={42}
        itemLabel="orders"
        onPrev={() => {}}
        onNext={() => {}}
      />
    )
    expect(screen.getByText('Page 2 of 5 · 42 orders')).toBeInTheDocument()
  })

  it('disables Prev on the first page and calls onNext when Next is clicked', async () => {
    const user = userEvent.setup()
    const onPrev = vi.fn()
    const onNext = vi.fn()

    render(
      <PaginationFooter
        page={1}
        totalPages={3}
        totalCount={30}
        itemLabel="products"
        onPrev={onPrev}
        onNext={onNext}
      />
    )

    const [prevButton, nextButton] = screen.getAllByRole('button')
    expect(prevButton).toBeDisabled()
    expect(nextButton).toBeEnabled()

    await user.click(nextButton)
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onPrev).not.toHaveBeenCalled()
  })

  it('disables Next on the last page', () => {
    render(
      <PaginationFooter
        page={3}
        totalPages={3}
        totalCount={30}
        itemLabel="products"
        onPrev={() => {}}
        onNext={() => {}}
      />
    )

    const [, nextButton] = screen.getAllByRole('button')
    expect(nextButton).toBeDisabled()
  })
})
