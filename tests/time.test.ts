import { describe, expect, it } from 'vitest'
import { clamp, formatTime } from '../src/utils/time'

describe('formatTime', () => {
  it('格式化为 mm:ss', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(5.9)).toBe('00:05')
    expect(formatTime(65)).toBe('01:05')
    expect(formatTime(3600)).toBe('60:00')
  })

  it('处理非法输入', () => {
    expect(formatTime(Number.NaN)).toBe('00:00')
    expect(formatTime(-3)).toBe('00:00')
    expect(formatTime(Number.POSITIVE_INFINITY)).toBe('00:00')
  })
})

describe('clamp', () => {
  it('限制在区间内', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(11, 0, 10)).toBe(10)
  })
})
