import { describe, expect, it } from 'vitest'
import { orderProductFormSchema } from './orderProduct'

describe('orderProductFormSchema', () => {
  it('accepts a valid selection', () => {
    const result = orderProductFormSchema.safeParse({ productId: 1, quantity: 3 })
    expect(result.success).toBe(true)
  })

  it('rejects when no product is selected (productId 0)', () => {
    const result = orderProductFormSchema.safeParse({ productId: 0, quantity: 1 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Select a product')
    }
  })

  it('rejects a zero quantity', () => {
    const result = orderProductFormSchema.safeParse({ productId: 1, quantity: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Quantity must be greater than 0')
    }
  })

  it('rejects a non-integer quantity', () => {
    const result = orderProductFormSchema.safeParse({ productId: 1, quantity: 1.5 })
    expect(result.success).toBe(false)
  })
})
