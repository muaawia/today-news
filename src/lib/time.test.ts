import { describe, expect, test } from 'vitest'
import { timeAgo } from './time'

const now = new Date('2026-11-21T12:00:00Z')

describe('timeAgo', () => {
  test.each([
    ['2026-11-21T11:59:40Z', 'now'],
    ['2026-11-21T11:48:00Z', '12m'],
    ['2026-11-21T09:00:00Z', '3h'],
    ['2026-11-19T12:00:00Z', '2d'],
    ['2026-11-21T12:05:00Z', 'now'], // slightly in the future (clock skew) is not negative
  ])('%s -> %s', (iso, expected) => {
    expect(timeAgo(iso, now)).toBe(expected)
  })
})
