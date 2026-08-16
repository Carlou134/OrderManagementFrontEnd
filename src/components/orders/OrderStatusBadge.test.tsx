import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import OrderStatusBadge from './OrderStatusBadge'

describe('OrderStatusBadge', () => {
  it.each([
    [0, 'Pending'],
    [1, 'In Progress'],
    [2, 'Completed'],
    [99, 'Unknown'],
  ])('renders "%s" as "%s"', (status, label) => {
    render(<OrderStatusBadge status={status} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})
