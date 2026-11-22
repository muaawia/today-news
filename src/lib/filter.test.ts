import { describe, expect, test } from 'vitest'
import { countriesFor, filterArticles } from './filter'
import type { Article } from './types'

const mk = (id: string, category: Article['category'], country: string, published: string): Article => ({
  id,
  title: id,
  link: `http://x/${id}`,
  snippet: '',
  source: 's',
  country,
  category,
  published,
})

const data: Article[] = [
  mk('a', 'sport', 'UK', '2026-11-21T09:00:00Z'),
  mk('b', 'politics', 'US', '2026-11-21T11:00:00Z'),
  mk('c', 'sport', 'US', '2026-11-21T10:00:00Z'),
  mk('d', 'science', 'UK', '2026-11-20T10:00:00Z'),
]

describe('filterArticles', () => {
  test('returns everything newest-first when no filters', () => {
    expect(filterArticles(data, {}).map((a) => a.id)).toEqual(['b', 'c', 'a', 'd'])
  })
  test('filters by category', () => {
    expect(filterArticles(data, { category: 'sport' }).map((a) => a.id)).toEqual(['c', 'a'])
  })
  test('filters by country', () => {
    expect(filterArticles(data, { country: 'US' }).map((a) => a.id)).toEqual(['b', 'c'])
  })
  test('filters by category and country together', () => {
    expect(filterArticles(data, { category: 'sport', country: 'UK' }).map((a) => a.id)).toEqual(['a'])
  })
  test('returns empty array when nothing matches', () => {
    expect(filterArticles(data, { category: 'health' })).toEqual([])
  })
})

describe('countriesFor', () => {
  test('lists sorted unique countries across all categories', () => {
    expect(countriesFor(data)).toEqual(['UK', 'US'])
  })
  test('only lists countries that have articles in that category', () => {
    expect(countriesFor(data, 'politics')).toEqual(['US'])
  })
})
