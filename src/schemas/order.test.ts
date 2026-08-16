import { describe, expect, it } from 'vitest'
import { orderFormSchema } from './order'

const validLine = {
  productId: 1,
  productName: 'Wireless Mouse',
  unitPrice: 25.5,
  quantity: 2,
  totalPrice: 51,
}

describe('orderFormSchema', () => {
  it('accepts an order with at least one product', () => {
    const result = orderFormSchema.safeParse({
      orderNumber: 'ORD123',
      orderDate: '2026-08-16',
      orderProducts: [validLine],
    })
    expect(result.success).toBe(true)
  })

  it('rejects an order with no products', () => {
    const result = orderFormSchema.safeParse({
      orderNumber: 'ORD123',
      orderDate: '2026-08-16',
      orderProducts: [],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('You must add at least one product')
    }
  })

  it('rejects an order line with a zero quantity', () => {
    const result = orderFormSchema.safeParse({
      orderNumber: 'ORD123',
      orderDate: '2026-08-16',
      orderProducts: [{ ...validLine, quantity: 0 }],
    })
    expect(result.success).toBe(false)
  })
})
