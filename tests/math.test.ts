import { describe, it, expect } from 'vitest'
import { clamp, randomRange, randomInt, distance } from '../src/utils/math'

describe('Math Utils', () => {
  it('should clamp value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })

  it('should generate random range', () => {
    const value = randomRange(1, 10)
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(10)
  })

  it('should generate random integer', () => {
    const value = randomInt(1, 10)
    expect(Number.isInteger(value)).toBe(true)
    expect(value).toBeGreaterThanOrEqual(1)
    expect(value).toBeLessThanOrEqual(10)
  })

  it('should calculate distance', () => {
    expect(distance(0, 0, 3, 4)).toBe(5)
    expect(distance(1, 1, 1, 1)).toBe(0)
  })
})
