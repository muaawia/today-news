import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import Parser from 'rss-parser'
import type { Article, Category } from '../src/lib/types'

export interface Source {
  name: string
  url: string
  category: Category
  country: string
}

export interface RawItem {
  title?: string
  link?: string
  isoDate?: string
  contentSnippet?: string
  content?: string
  summary?: string
  enclosure?: { url?: string }
  mediaContent?: { $?: { url?: string } }
  mediaThumbnail?: { $?: { url?: string } }
}

export type Fetcher = (url: string) => Promise<RawItem[]>

const SNIPPET_MAX = 200

function toSnippet(raw: string): string {
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
  return text.length <= SNIPPET_MAX ? text : text.slice(0, SNIPPET_MAX - 1).trimEnd() + '…'
}

export function normalizeItem(item: RawItem, src: Source): Article {
  const link = item.link ?? ''
  return {
    id: createHash('sha1').update(link).digest('hex').slice(0, 12),
    title: (item.title ?? '').trim(),
    link,
    image: item.enclosure?.url ?? item.mediaContent?.$?.url ?? item.mediaThumbnail?.$?.url,
    snippet: toSnippet(item.contentSnippet ?? item.content ?? item.summary ?? ''),
    source: src.name,
    country: src.country,
    category: src.category,
    published: item.isoDate ?? new Date().toISOString(),
  }
}

export function dedupe(articles: Article[]): Article[] {
  const seen = new Set<string>()
  return articles.filter((a) => (seen.has(a.link) ? false : (seen.add(a.link), true)))
}

const parser = new Parser<object, RawItem>({
  timeout: 10_000,
  customFields: { item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']] },
})

const defaultFetcher: Fetcher = async (url) => (await parser.parseURL(url)).items

export async function fetchAll(sources: Source[], fetcher: Fetcher = defaultFetcher): Promise<Article[]> {
  let failures = 0
  const results = await Promise.all(
    sources.map(async (src) => {
      try {
        const items = await fetcher(src.url)
        return items.filter((i) => i.link && i.title).map((i) => normalizeItem(i, src))
      } catch (err) {
        failures++
        console.warn(`skipped ${src.name} (${src.category}): ${(err as Error).message}`)
        return []
      }
    }),
  )
  if (sources.length > 0 && failures === sources.length) throw new Error('All feeds failed')
  return dedupe(results.flat()).sort((a, b) => b.published.localeCompare(a.published))
}

async function main() {
  const sources: Source[] = JSON.parse(readFileSync('scripts/sources.json', 'utf8'))
  const articles = await fetchAll(sources)
  mkdirSync('public', { recursive: true })
  writeFileSync('public/feeds.json', JSON.stringify({ generatedAt: new Date().toISOString(), articles }))
  console.log(`wrote ${articles.length} articles from ${sources.length} feeds`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // exit explicitly: lingering keep-alive sockets otherwise keep the process (and CI job) alive
  main().then(
    () => process.exit(0),
    (err) => {
      console.error(err)
      process.exit(1)
    },
  )
}
