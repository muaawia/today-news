import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import App from './App'
import type { Article } from './lib/types'

const base = { snippet: 'snip', source: 'BBC', link: '' }
const articles: Article[] = [
  { ...base, id: '1', title: 'Derby ends in draw', category: 'sport', country: 'UK', published: '2026-11-21T11:00:00Z', link: 'http://x/1', image: 'http://img/1.jpg' },
  { ...base, id: '2', title: 'Senate passes bill', category: 'politics', country: 'US', published: '2026-11-21T10:00:00Z', link: 'http://x/2', image: 'http://img/2.jpg' },
  { ...base, id: '3', title: 'New comet spotted', category: 'science', country: 'UK', published: '2026-11-21T09:00:00Z', link: 'http://x/3' },
]

function stubFeed(ok: boolean, list: Article[] = articles, generatedAt = '2026-11-21T12:00:00Z') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      ok
        ? ({ ok: true, json: async () => ({ generatedAt, articles: list }) } as Response)
        : Promise.reject(new Error('offline')),
    ),
  )
}

function backToForeground() {
  Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
  document.dispatchEvent(new Event('visibilitychange'))
}

beforeEach(() => stubFeed(true))
afterEach(() => vi.unstubAllGlobals())

describe('App', () => {
  test('renders hero and cards from the feed', async () => {
    render(<App />)
    expect(await screen.findByText('Derby ends in draw')).toBeInTheDocument()
    expect(screen.getByText('Senate passes bill')).toBeInTheDocument()
    expect(screen.getByText('New comet spotted')).toBeInTheDocument()
  })

  test('tapping a category chip filters the feed', async () => {
    render(<App />)
    await screen.findByText('Derby ends in draw')
    await userEvent.click(screen.getByRole('button', { name: 'Sport' }))
    expect(screen.getByText('Derby ends in draw')).toBeInTheDocument()
    expect(screen.queryByText('Senate passes bill')).not.toBeInTheDocument()
  })

  test('country picker lists only countries available in the category', async () => {
    render(<App />)
    await screen.findByText('Derby ends in draw')
    await userEvent.click(screen.getByRole('button', { name: 'Politics' }))
    const options = within(screen.getByRole('combobox', { name: 'Country' })).getAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual(['All countries', 'US'])
  })

  test('a category with no stories shows an empty state', async () => {
    render(<App />)
    await screen.findByText('Derby ends in draw')
    await userEvent.click(screen.getByRole('button', { name: 'Health' }))
    expect(screen.getByText(/no stories here yet/i)).toBeInTheDocument()
  })

  test('an article without an image renders a fallback instead of a broken image', async () => {
    render(<App />)
    await screen.findByText('New comet spotted')
    expect(screen.getAllByTestId('image-fallback')).toHaveLength(1)
  })

  test('refetches (bypassing the HTTP cache) when the app returns to the foreground and the feed is stale', async () => {
    stubFeed(true, articles, '2020-01-01T00:00:00Z')
    render(<App />)
    await screen.findByText('Derby ends in draw')
    expect(fetch).toHaveBeenCalledTimes(1)
    backToForeground()
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2))
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('feeds.json'), { cache: 'no-cache' })
  })

  test('does not refetch on foreground when the feed is fresh', async () => {
    stubFeed(true, articles, new Date().toISOString())
    render(<App />)
    await screen.findByText('Derby ends in draw')
    backToForeground()
    await new Promise((r) => setTimeout(r, 50))
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  test('hero prefers the newest story that has a photo', async () => {
    const noPhotoFirst: Article[] = [
      { ...articles[2], id: 'n', title: 'Newest but no photo', published: '2026-11-21T12:00:00Z' },
      { ...articles[0], id: 'p', title: 'Older with photo', published: '2026-11-21T08:00:00Z' },
    ]
    stubFeed(true, noPhotoFirst)
    const { container } = render(<App />)
    await screen.findByText('Older with photo')
    expect(container.querySelector('.hero h2')?.textContent).toBe('Older with photo')
  })

  test('fetch failure with no cache shows a connect message', async () => {
    stubFeed(false)
    render(<App />)
    expect(await screen.findByText(/connect to the internet to load stories/i)).toBeInTheDocument()
  })
})
