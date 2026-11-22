import { describe, expect, test } from 'vitest'
import { dedupe, fetchAll, normalizeItem, type RawItem, type Source } from './fetch-feeds'
import type { Article } from '../src/lib/types'

const NOW = new Date('2026-11-21T12:00:00Z')
const src: Source = { name: 'BBC', url: 'http://x/rss', category: 'world', country: 'UK' }

describe('normalizeItem', () => {
  test('truncates snippet to 200 chars and strips HTML', () => {
    const item: RawItem = {
      title: 'T',
      link: 'http://a/1',
      isoDate: '2026-11-21T10:00:00Z',
      contentSnippet: undefined,
      content: '<p>' + 'word '.repeat(100) + '</p>',
    }
    const a = normalizeItem(item, src)
    expect(a.snippet.length).toBeLessThanOrEqual(200)
    expect(a.snippet).not.toContain('<')
  })

  test('leaves image undefined when none', () => {
    const a = normalizeItem({ title: 'T', link: 'http://a/2', isoDate: '2026-11-21T10:00:00Z' }, src)
    expect(a.image).toBeUndefined()
  })

  test('takes image from enclosure and tags source/country/category', () => {
    const a = normalizeItem(
      { title: 'T', link: 'http://a/3', isoDate: '2026-11-21T10:00:00Z', enclosure: { url: 'http://img/1.jpg' } },
      src,
    )
    expect(a.image).toBe('http://img/1.jpg')
    expect([a.source, a.country, a.category]).toEqual(['BBC', 'UK', 'world'])
  })
})

describe('normalizeItem image choice', () => {
  test('picks the widest media:content when a feed offers several sizes', () => {
    const a = normalizeItem(
      {
        title: 'T',
        link: 'http://a/4',
        isoDate: '2026-11-21T10:00:00Z',
        mediaContent: [{ $: { url: 'http://img/small.jpg', width: '140' } }, { $: { url: 'http://img/big.jpg', width: '1000' } }],
      },
      src,
    )
    expect(a.image).toBe('http://img/big.jpg')
  })
})

describe('dedupe', () => {
  test('keeps one article per link', () => {
    const base = { title: 't', snippet: '', source: 's', country: 'UK', category: 'world', published: '' } as const
    const list: Article[] = [
      { ...base, id: '1', link: 'http://same' },
      { ...base, id: '2', link: 'http://same' },
      { ...base, id: '3', link: 'http://other' },
    ]
    expect(dedupe(list).map((a) => a.id)).toEqual(['1', '3'])
  })
})

describe('fetchAll', () => {
  test('skips a feed that throws and returns the rest', async () => {
    const good: Source = { ...src, name: 'Good', url: 'http://good' }
    const bad: Source = { ...src, name: 'Bad', url: 'http://bad' }
    const fetcher = async (url: string): Promise<RawItem[]> => {
      if (url === 'http://bad') throw new Error('timeout')
      return [{ title: 'ok', link: 'http://ok/1', isoDate: '2026-11-21T10:00:00Z' }]
    }
    const out = await fetchAll([bad, good], fetcher, NOW)
    expect(out.map((a) => a.source)).toEqual(['Good'])
  })

  test('rejects when every feed fails so a bad run never publishes an empty feed', async () => {
    const fetcher = async (): Promise<RawItem[]> => {
      throw new Error('network down')
    }
    await expect(fetchAll([src, { ...src, url: 'http://y' }], fetcher)).rejects.toThrow(/all feeds failed/i)
  })

  test('drops items older than 7 days', async () => {
    const fetcher = async (): Promise<RawItem[]> => [
      { title: 'fresh', link: 'http://f', isoDate: '2026-11-20T10:00:00Z' },
      { title: 'ancient', link: 'http://a', isoDate: '2026-11-10T10:00:00Z' },
    ]
    const out = await fetchAll([src], fetcher, NOW)
    expect(out.map((a) => a.title)).toEqual(['fresh'])
  })

  test('drops BBC iPlayer and Sounds programme pages that are not news articles', async () => {
    const fetcher = async (): Promise<RawItem[]> => [
      { title: 'Tech Now', link: 'https://www.bbc.co.uk/iplayer/episode/p0abc', isoDate: '2026-11-21T10:00:00Z' },
      { title: 'Inside Health', link: 'https://www.bbc.co.uk/sounds/play/p0def', isoDate: '2026-11-21T10:00:00Z' },
      { title: 'Real news', link: 'https://www.bbc.co.uk/news/articles/c1', isoDate: '2026-11-21T10:00:00Z' },
    ]
    const out = await fetchAll([src], fetcher, NOW)
    expect(out.map((a) => a.title)).toEqual(['Real news'])
  })

  test('returns newest first', async () => {
    const fetcher = async (): Promise<RawItem[]> => [
      { title: 'old', link: 'http://o', isoDate: '2026-11-20T10:00:00Z' },
      { title: 'new', link: 'http://n', isoDate: '2026-11-21T10:00:00Z' },
    ]
    const out = await fetchAll([src], fetcher, NOW)
    expect(out.map((a) => a.title)).toEqual(['new', 'old'])
  })
})
