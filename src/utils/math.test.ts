import { describe, it, expect } from 'vitest'
import { add, multiply, isEven } from './math'

describe('Math utilities', () => {
  describe('add', () => {
    it('adds two positive numbers correctly', () => {
      expect(add(2, 3)).toBe(5)
    })

    it('adds negative numbers correctly', () => {
      expect(add(-1, -2)).toBe(-3)
    })

    it('adds zero correctly', () => {
      expect(add(5, 0)).toBe(5)
    })
  })

  describe('multiply', () => {
    it('multiplies two positive numbers correctly', () => {
      expect(multiply(3, 4)).toBe(12)
    })

    it('multiplies by zero', () => {
      expect(multiply(5, 0)).toBe(0)
    })
  })

  describe('isEven', () => {
    it('returns true for even numbers', () => {
      expect(isEven(4)).toBe(true)
      expect(isEven(0)).toBe(true)
      expect(isEven(-2)).toBe(true)
    })

    it('returns false for odd numbers', () => {
      expect(isEven(3)).toBe(false)
      expect(isEven(-1)).toBe(false)
    })
  })
})
