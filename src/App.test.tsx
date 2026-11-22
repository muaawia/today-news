import { render, screen, within } from '@testing-library/react'
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

function stubFeed(ok: boolean) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () =>
      ok
        ? ({ ok: true, json: async () => ({ generatedAt: '2026-11-21T12:00:00Z', articles }) } as Response)
        : Promise.reject(new Error('offline')),
    ),
  )
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

  test('fetch failure with no cache shows a connect message', async () => {
    stubFeed(false)
    render(<App />)
    expect(await screen.findByText(/connect to the internet to load stories/i)).toBeInTheDocument()
  })
})
