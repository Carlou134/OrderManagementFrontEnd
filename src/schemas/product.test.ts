import { describe, expect, it } from 'vitest'
import { productFormSchema } from './product'

describe('productFormSchema', () => {
  it('accepts a valid product', () => {
    const result = productFormSchema.safeParse({ name: 'Wireless Mouse', unitPrice: 25.5 })
    expect(result.success).toBe(true)
  })

  it('rejects an empty name', () => {
    const result = productFormSchema.safeParse({ name: '', unitPrice: 10 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Name is required')
    }
  })

  it('trims a name made only of whitespace down to empty and rejects it', () => {
    const result = productFormSchema.safeParse({ name: '   ', unitPrice: 10 })
    expect(result.success).toBe(false)
  })

  it('rejects a zero unit price', () => {
    const result = productFormSchema.safeParse({ name: 'Product', unitPrice: 0 })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Unit price must be greater than 0')
    }
  })

  it('rejects a negative unit price', () => {
    const result = productFormSchema.safeParse({ name: 'Product', unitPrice: -5 })
    expect(result.success).toBe(false)
  })
})
